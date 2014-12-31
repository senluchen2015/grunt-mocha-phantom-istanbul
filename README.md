# grunt-mocha-phantom-istanbul

> Automatically run *client-side* mocha specs via grunt/mocha/PhantomJS and support tracking code coverage with istanbul.

This is a very slight modification of [grunt-mocha](https://github.com/kmiyashiro/grunt-mocha) which only adds the capability to extract istanbul coverage data, so see [grunt-mocha](https://github.com/kmiyashiro/grunt-mocha) for usage and options.

At this time, only the extraction capability is provided, so it is still dependent on the user to instrument the source files ahead of time with istanbul in order to actually have coverage data tracked when the tests are run.

### Settings

See [grunt-mocha](https://github.com/kmiyashiro/grunt-mocha) for all additional options that it supports.

#### options.coverage

The options for this are specified in the coverage object.

#### options.coverage.coverageFile
Type: `String`
Default: `'coverage/coverage.json'`

The file to write the coverage json data to.

Example:
```js
mocha: {
  test: {
    files: ['tests/**/*.html'],
    options: {
      coverage: {
        coverageFile: 'somePath/myCoverage.json'
      }
    }
  },
},
```

## TODO
* Add option to instrument the source files on the fly with istanbul so that pre-instrumenting with another task is no longer required.

## License
Licensed under the MIT license.
