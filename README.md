# grunt-crx

[![Build Status](https://secure.travis-ci.org/oncletom/grunt-crx.png?branch=master)](http://travis-ci.org/oncletom/grunt-crx)

Package your Chrome Extensions in a bliss.

## Getting Started
Install this grunt plugin next to your project's [Gruntfile.js](https://github.com/gruntjs/grunt/wiki/Getting-started) with: `npm install grunt-crx`

Then add this line to your project's `Gruntfile.js`:

```javascript
grunt.loadNpmTasks('grunt-crx');
```

## Documentation

This task is a [multi task](https://github.com/gruntjs/grunt/wiki/Creating-tasks), meaning that grunt will automatically iterate over all `crx` targets if a target is not specified.

There will be as many extension packaged as there are targets.

### Target Properties

* `src` (string, _mandatory_): location of a folder containing a Chrome Extension `manifest.json`;
* `dest` (string, _mandatory_): location of a folder where the `crx` file will be available;
* `baseURL` (string): folder URL where package files will be self hosted ([see Autoupdating in Chrome Extension docs](http://developer.chrome.com/extensions/autoupdate.html));
* `exclude` (array): array of [glob style](https://github.com/gruntjs/grunt/wiki/grunt.file) `src`-relative paths which won't be included in the built package;
* `privateKey` (string): location of the `.pem` file used to encrypt your extension;
* `filename` (string|template pattern): filename of the package (like `myExtension.crx`) – `manifest` attributes are injected from the `manifest.json`;
* `options` (object) – options that are directly provided to the `ChromeExtension` object;
 * `maxBuffer` (Number): amount of bytes available to package the extension ([see child_process#exec](http://nodejs.org/docs/v0.6.21/api/child_process.html#child_process_child_process_exec_command_options_callback))

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

```javascript
//Gruntfile.js
grunt.loadNpmTasks('grunt-crx');

grunt.initConfig({
  crx: {
    myHostedPackage: {
      "src": "src-beta/",
      "dest": "dist/crx-beta/src",
      "baseURL": "http://my.app.net/beta-files/",
      "exclude": [ ".git", ".svn" ],
      "privateKey": "dist/crx-beta/key.pem",
      "options": {
        "maxBuffer": 3000 * 1024 //build extension with a weight up to 3MB
      }
    }
  }
});
```

### Fully Customized Example

```javascript
//Gruntfile.js
grunt.loadNpmTasks('grunt-crx');

grunt.initConfig({
  manifest: grunt.file.readJSON('src/manifest.json'),
  crx: {
    staging: {
      "src": "src/",
      "dest": "dist/staging/src",
      "baseURL": "http://my.app.intranet/files/",
      "filename": "<%= pkg.name %>-<%= manifest.version %>-dev.crx",
      "exclude": [ ".git", ".svn" ],
      "privateKey": "dist/key.pem",
      "options": {
        "maxBuffer": 3000 * 1024 //build extension with a weight up to 3MB
      }
    },
    production: {
      "src": "src/",
      "dest": "dist/crx-beta/src",
      "baseURL": "http://my.app.net/files/",
      "exclude": [ ".git", ".svn" ],
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
