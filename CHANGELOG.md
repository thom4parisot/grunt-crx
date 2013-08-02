## Release History

### 0.3.2 (08/02/2013)

* removed dependency on `rm` system command ([#27](https://github.com/oncletom/grunt-crx/pull/27))
* fixing a call to an obsolete Grunt API (`grunt.task.taskError`) ([#28](https://github.com/oncletom/grunt-crx/pull/28))

### 0.3.1 (08/01/2013)

* fixing `src` interpreted as an array ([#26](https://github.com/oncletom/grunt-crx/pull/26))

### 0.3.0 (07/31/2013)

* full Windows compatibility ([#25](https://github.com/oncletom/grunt-crx/pull/25))
* added [CONTRIBUTORS](CONTRIBUTORS.md)

### 0.2.5 (08/01/2013)

* fixing `src` interpreted as an array ([#26](https://github.com/oncletom/grunt-crx/pull/26))

### 0.2.3 (05/15/2013)

* fixing `update.xml` generation when no `update_url` is provided ([#22](https://github.com/oncletom/grunt-crx/pull/22))
* better code coverage for `update.xml` file generation.

### 0.2.2 (04/30/2013)

* fixing invalid call for `lodash.assign`
* added tests for main task to avoid this kind of regression
* deprecated `filename` config property (simply use `dest`) — less confusing
* deprecated `baseURL` config property (simply use `codebase`)

Next minor release will tidy the task config to enable more features, and even
deal with regular Chrome Extensions for the Web Store!

### 0.2.1 (04/22/2013)

* explicit support of Node.js 0.10
* `~` will be expanded to your home directory folder in config files ([#11](https://github.com/oncletom/grunt-crx/pull/11))

### 0.2.0 (02/25/2013)

* `grunt` 0.4 API compatibility

### 0.1.2 (11/14/2012)

* eventual `grunt` 0.4 compatibility
* credits to jed for its [crx](https://npmjs.org/package/crx) node module

### 0.1.1 (08/24/2012)

* added `exclude` property

### 0.1.0 (08/23/2012)

Initial release.