/*
 * grunt-lib-phantomjs
 * http://gruntjs.com/
 *
 * Modified for mocha-grunt by Kelly Miyashiro
 *
 * Copyright (c) 2012 "Cowboy" Ben Alman, contributors
 * Licensed under the MIT license.
 */

/*global phantom:true*/

'use strict';
if (!phantom.args) {
  var system = require('system');
  phantom.args = system.args;
  phantom.args.shift();
}

var fs = require('fs');
var _ = require('lodash');

// The temporary file used for communications.
var tmpfile = phantom.args[0];
// The page .html file to load.
var url = phantom.args[1];
// Extra, optionally overridable stuff.
var options = JSON.parse(phantom.args[2] || {});

// Keep track of the last time a client message was sent.
var last = new Date();

// Messages are sent to the parent by appending them to the tempfile.
var sendMessage = function(arg) {
  var args = Array.isArray(arg) ? arg : [].slice.call(arguments);
  last = new Date();
  fs.write(tmpfile, JSON.stringify(args) + '\n', 'a');
};

// This allows grunt to abort if the PhantomJS version isn't adequate.
sendMessage('private', 'version', phantom.version);

// Abort if the page doesn't send any messages for a while.
setInterval(function() {
  if (new Date() - last > options.timeout) {
    sendMessage('fail.timeout');
    phantom.exit();
  }
}, 100);

// Create a new page.
var page = require('webpage').create();

// Inject bridge script into client page.
var injected;
var inject = function() {
  if (injected) { return; }
  // Inject client-side helper script.
  sendMessage('inject', options.inject);
  page.injectJs(options.inject);
  injected = true;
};

// Merge phantomjs page settings from options.page
if (options.page) {
  _.merge(page, options.page);
}

// Keep track if the client-side helper script already has been injected.
page.onUrlChanged = function(newUrl) {
  injected = false;
  sendMessage('onUrlChanged', newUrl);
};

// The client page must send its messages via alert(jsonstring).
page.onAlert = function(str) {
  // The only thing that should ever alert "inject" is the custom event
  // handler this script adds to be executed on DOMContentLoaded.
  if (str === 'inject') {
    inject();
    return;
  }
  // Otherwise, parse the specified message string and send it back to grunt.
  // Unless there's a parse error. Then, complain.
  try {
    sendMessage(JSON.parse(str));
  } catch(err) {
    sendMessage('error.invalidJSON', str);
  }
};

// Relay console logging messages.
page.onConsoleMessage = function(message) {
  sendMessage('console', message);
};

// For debugging.
page.onResourceRequested = function(request) {
  sendMessage('onResourceRequested', request.url);
};

page.onResourceReceived = function(request) {
  if (request.stage === 'end') {
    sendMessage('onResourceReceived', request.url);
  }
};

page.onError = function(msg, trace) {
  sendMessage('error.onError', msg, trace);
};

page.onResourceError = function(resourceError) {
  sendMessage('onResourceError', resourceError.url, resourceError.errorString);
};

page.onResourceTimeout = function(request) {
  sendMessage('onResourceTimeout', request.url, request.errorString);
};

// Run before the page is loaded.
page.onInitialized = function() {
  sendMessage('onInitialized');

  // Customization for mocha, passing mocha options from task config
  page.evaluate(function(options) {
    window.PHANTOMJS = options;
  }, options);

  // Abort if there is no bridge to inject.
  if (!options.inject) { return; }
  // Tell the client that when DOMContentLoaded fires, it needs to tell this
  // script to inject the bridge. This should ensure that the bridge gets
  // injected before any other DOMContentLoaded or window.load event handler.
  page.evaluate(function() {
    /*jshint browser:true, devel:true */
    document.addEventListener('DOMContentLoaded', function() {
      alert('inject');
    }, false);
  });
};

// Run when the page has finished loading.
page.onLoadFinished = function(status) {
  // The window has loaded.
  sendMessage('onLoadFinished', status);
  if (status !== 'success') {
    // File loading failure.
    sendMessage('fail.load', url);
    phantom.exit();
  }
};

// Actually load url.
page.open(url);
