# grunt-crx

[![Build Status](https://secure.travis-ci.org/oncletom/grunt-crx.png?branch=master)](http://travis-ci.org/oncletom/grunt-crx)
[![Dependencies Status](https://david-dm.org/oncletom/grunt-crx.png)](https://david-dm.org/oncletom/grunt-crx)
[![Dev Dependencies Status](https://david-dm.org/oncletom/grunt-crx/dev-status.png)](https://david-dm.org/oncletom/grunt-crx#info=devDependencies)

Package your Chrome Extensions in a bliss.

## Getting Started
Install this grunt plugin next to your project's [Gruntfile.js](https://github.com/gruntjs/grunt/wiki/Getting-started) with: `npm install grunt-crx`

Then add this line to your project's `Gruntfile.js`:

```javascript
grunt.loadNpmTasks('grunt-crx');
```

## Dependencies
* openssl - Used to sign your Chrome extensions
  * Linux: sudo apt-get install openssl
  * Windows: http://www.openssl.org/related/binaries.html
* ssh-keygen - Used to generate new signatures
  * Linux: Should already exist
  * Windows: Comes with git, if you have [git install location]/bin in your PATH you should be set


## Documentation

This task is a [multi task](https://github.com/gruntjs/grunt/wiki/Creating-tasks), meaning that grunt will automatically iterate over all `crx` targets if a target is not specified.

There will be as many extension packaged as there are targets.

### Target Properties

* `src` (string, _mandatory_): location of a folder containing a Chrome Extension `manifest.json`;
* `dest` (string, _mandatory_): location of a folder where the `crx` file will be available;
* `baseURL` (string): folder URL where package files will be self hosted ([see Autoupdating in Chrome Extension docs](http://developer.chrome.com/extensions/autoupdate.html));
* `exclude` (array): array of [glob style](http://gruntjs.com/api/grunt.file#globbing-patterns) `src`-relative paths which won't be included in the built package;
* `privateKey` (string): location of the `.pem` file used to encrypt your extension;
* `options` (object) – options that are directly provided to the `ChromeExtension` object;
 * `maxBuffer` (Number): amount of bytes available to package the extension ([see child_process#exec](http://nodejs.org/docs/latest/api/child_process.html#child_process_child_process_exec_command_options_callback))

### Target Defaults

* `privateKey`: `key.pem` — which means the task will look forward its file next to the `grunt.js` one;
* `filename`: `<%= pkg.name %>-<%= manifest.version %>.crx` – which means it will automagically use your `package.json` name and `manifest.json` version to build the filename.

### Example

```javascript
//Gruntfile.js
grunt.loadNpmTasks('grunt-crx');

grunt.initConfig({
  crx: {
    myPublicPackage: {
      "src": "src/",
      "dest": "dist/crx/",
    }
  }
});
```

### Advanced Example

This example demonstrates how you can tweak your builds upon your own
source architecture.

```javascript
//Gruntfile.js
grunt.loadNpmTasks('grunt-crx');

grunt.initConfig({
  crx: {
    myHostedPackage: {
      "src": "src-beta/",
      "dest": "dist/crx-beta/src/my-extension.crx",
      "baseURL": "http://my.app.net/files/",
      "exclude": [ ".git", ".svn" ],
      "privateKey": "~/.ssh/chrome-apps.pem",
      "options": {
        "maxBuffer": 3000 * 1024 //build extension with a weight up to 3MB
      }
    }
  }
});
```

### Fully Customized Example

This example demonstrates how to build separate channels of packages
within a same repository location.

Pretty handy to use a Git workflow and pre-release code before deploying it
in production.

```javascript
//Gruntfile.js
grunt.loadNpmTasks('grunt-crx');

grunt.initConfig({
  pkg: grunt.file.readJSON('package.json'),
  manifest: grunt.file.readJSON('src/manifest.json'),
  crx: {
    staging: {
      "src": "src/",
      "dest": "dist/staging/src/<%= pkg.name %>-<%= manifest.version %>-dev.crx",
      "baseURL": "http://my.app.intranet/files/",
      "filename": "",
      "exclude": [ ".git", ".svn", "*.pem" ],
      "privateKey": "dist/key.pem",
      "options": {
        "maxBuffer": 3000 * 1024 //build extension with a weight up to 3MB
      }
    },
    production: {
      "src": "src/",
      "dest": "dist/production/src/<%= pkg.name %>-<%= manifest.version %>-dev.crx",
      "baseURL": "http://my.app.net/files/",
      "exclude": [ ".git", ".svn", "dev/**", "*.pem" ],
      "options": {
        "maxBuffer": 3000 * 1024 //build extension with a weight up to 3MB
      }
    }
  }
});
```

### Security Notice

It is strongly recommended to store your privates keys **outside**
the source folder of your extensions.

Otherwise [we will laught at you](http://it.slashdot.org/story/12/05/24/1717219/yahoo-includes-private-key-in-source-file-for-axis-chrome-extension).


## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt][grunt].

## Release History

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

## Credits

* [Jed Schmidt](http://who.jed.is) for the useful `crx` module
* [Grunt authors](http://gruntjs.com) for this great toolbox
* **you**, contributor, user or anyone providing a feedback

## License
Copyright (c) 2012 oncletom
Licensed under the MIT license.
