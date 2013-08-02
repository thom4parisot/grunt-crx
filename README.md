# grunt-crx

[![Build Status](https://secure.travis-ci.org/oncletom/grunt-crx.png?branch=master)](http://travis-ci.org/oncletom/grunt-crx)
[![Dependencies Status](https://david-dm.org/oncletom/grunt-crx.png)](https://david-dm.org/oncletom/grunt-crx)
[![Dev Dependencies Status](https://david-dm.org/oncletom/grunt-crx/dev-status.png)](https://david-dm.org/oncletom/grunt-crx#info=devDependencies)

`grunt-crx` is a Grunt task used to **package private Chrome Extensions**.

In the **future**, this task will also help you to also package
[Packaged Apps](http://developer.chrome.com/apps/), *Hosted Apps*, and public Chrome Extensions to publish on the [Chrome Web Store](https://chrome.google.com/webstore/).

## Getting Started
Install this grunt plugin next to your project's [Gruntfile.js](http://gruntjs.com/getting-started) with the following command:

```bash
npm install --save-dev grunt-crx
```

Then add this line to your project's `Gruntfile.js`:

```javascript
grunt.loadNpmTasks('grunt-crx');
```

## Dependencies

* `openssl` - Used to sign your Chrome extensions
  * Linux: `sudo apt-get install openssl`
  * OS X: Should already exist
  * Windows: [openssl.org/related/binaries.html](http://www.openssl.org/related/binaries.html)
* `ssh-keygen` - Used to generate new signatures
  * Linux and OS X: Should already exist
  * Windows: Comes with git, if you have `<git install location>/bin` in your `PATH` you should be set


## Documentation

This task is a [multi task](http://gruntjs.com/creating-tasks#multi-tasks), meaning that grunt will automatically iterate over all `crx` targets if a target is not specified.

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

## Configuration Examples

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

In lieu of a formal styleguide, take care to maintain the existing coding style.

If you don't add unit tests, someone will take care of that before shipping the module to NPM.
Take any contribution as an opportunity to learn.



## Credits

* [Jed Schmidt](http://who.jed.is) for the useful [crx](https://github.com/jed/crx) module
* [Grunt authors](http://gruntjs.com) for this great toolbox
* [**you**, contributor](CONTRIBUTORS.md), user or anyone providing a feedback

## License

    The MIT License (MIT)
    Copyright © 2013 Thomas Parisot, https://oncletom.io

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the “Software”), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.
