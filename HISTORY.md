# History

## 0.2.1
* Pulled in the changes from https://github.com/kmiyashiro/grunt-mocha up to version 0.4.12.

## 0.2.0
* Add suport for creating additional Istanbul reports.
* **Note:** renamed `options.coverage.coverageFile` to `options.coverage.jsonReport`. Existing users must update grunt config to set the option with its new name or else the json coverage file will not be generated!

## 0.1.1

* Added a check for the coverage object.

## 0.1.0

* Created fork of https://github.com/kmiyashiro/grunt-mocha to add support to extract istanbul coverage data from phantomjs.
