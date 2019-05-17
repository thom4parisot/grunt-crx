# grunt-crx [![Build Status](https://secure.travis-ci.org/oncletom/grunt-crx.svg?branch=master)](http://travis-ci.org/oncletom/grunt-crx)

`grunt-crx` is a Grunt task used to **package Chrome Extensions** (and soon, [WebExtensions](https://developer.mozilla.org/en-US/Add-ons/WebExtensions)).

Chrome extensions can either be:

- **public**: *zip* files to be uploaded on the [Chrome Web Store](https://chrome.google.com/webstore/);
- **private**: *crx* files to be signed with a private key and eventually self-hosted.

**Compatibility**: this extension is compatible with `node>12`.

**Migrating from `grunt-crx<1.0.4`**? Please head to the [Upgrading section](#upgrading).

# Getting Started

Install this grunt plugin next to your project's [Gruntfile.js](http://gruntjs.com/sample-gruntfile) with the following command:

```bash
npm install --save-dev grunt-crx
```

Then add this line to your project's `Gruntfile.js`:

```javascript
grunt.loadNpmTasks('grunt-crx');
```

# Documentation

This task is a [multi task](http://gruntjs.com/creating-tasks#multi-tasks), meaning that grunt will automatically iterate over all `crx` targets if a target is not specified.

## Target Options

* `src` (_mandatory_): ;
* `dest` (string, _mandatory_): the filepath of your `.crx` or `.zip` archive;
* `options` (object) – options that are directly provided to the `ChromeExtension` object;
 * `baseURL` (string): folder URL where package files will be self hosted ([see Autoupdating in Chrome Extension docs](https://developer.chrome.com/extensions/autoupdate));
 * `maxBuffer` (Number): amount of bytes available to package the extension ([see child_process#exec](https://nodejs.org/docs/latest/api/child_process.html#child_process_child_process_exec_command_options_callback));
 * `privateKey` (string): location of the `.pem` file used to sign your `crx` extension.

# Configuration Examples

```js
grunt.initConfig({
  crx: {
    myPublicExtension: {
      src: "src/**/*",
      dest: "dist/myPublicExtension.zip",
    },

    mySignedExtension: {
      src: "src/**/*",
      dest: "dist/myPrivateExtension.crx",
      options: {
        privateKey: "~/myPrivateExtensionKey.pem"
      }
    }
  }
});
```

## Advanced

This example demonstrates how you can tweak your builds upon your own
source architecture.

```js
grunt.initConfig({
  crx: {
    myHostedPackage: {
      "src": [
        "src-beta/**/*",
        "!.{git,svn}"
      ],
      "dest": "dist/crx-beta/src/my-extension.crx",
      "options": {
        "baseURL": "https://my.app.net/files/",
        "privateKey": "~/.ssh/chrome-apps.pem"
      }
    }
  }
});
```

## Build Channels

This example demonstrates how to build separate channels of packages
within a same repository location.

Pretty handy to use a Git workflow and pre-release code before deploying it
in production.

```js
grunt.initConfig({
  pkg: require('./package.json'),
  manifest: require('./src/manifest.json'),

  crx: {
    options: {
      privateKey: "dist/key.pem",
      maxBuffer: 3000 * 1024 //build extension with a weight up to 3MB
    },
    staging: {
      "src": [
        "src/**/*",
        "!.{git,svn}",
        "!*.pem"
      ],
      "dest": "dist/staging/<%= pkg.name %>-<%= manifest.version %>-dev.crx",
      "options": {
        "baseURL": "https://my.app.intranet/files/"
      }
    },
    production: {
      files: {
        "dist/production/<%= pkg.name %>-<%= manifest.version %>-dev.crx": [
          "src/**/*",
          "!.{git,svn}",
          "!*.pem",
          "!dev/**"
        ],
        "dist/production/<%= pkg.name %>-<%= manifest.version %>-dev.zip": [
          "src/**/*",
          "!.{git,svn}",
          "!*.pem",
          "!dev/**"
        ]
      },
      "options": {
        "baseURL": "https://my.app.net/files/",
      }
    }
  }
});
```

# Security Notice

It is strongly recommended to store your privates keys (`.pem` files) **outside**
the source folder of your extensions.

Although `grunt-crx` will exclude by default because [we do not want this story](https://it.slashdot.org/story/12/05/24/1717219/yahoo-includes-private-key-in-source-file-for-axis-chrome-extension) to happen to you.


# Upgrading

## v1.0

A few things have changed since `v0.3`:

- file selection now relies on the grunt [Task Configuration and Targets](http://gruntjs.com/configuring-tasks#task-configuration-and-targets);
- the `zipDest` and `filename` options are not used anymore: simply use `dest` with a `.zip` or `.crx` filename to automatically get an unsigned or signed archive;
- no file will be created temporarily on your filesystem – it is nicer for your disk and faster as well;
- file exclusion **now works** whereas it was broken between `v1.0.0` and `v1.0.4` and possibly harmful.

I present my **apologies** for the troubles you could have encountered if you have been using `grunt-crx@^1.0.0` until now.

# Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style.

If you don't add unit tests, someone will take care of that before shipping the module to NPM.
Take any contribution as an opportunity to learn.


# Credits

* [Jed Schmidt](http://jed.is/) for the useful [crx](https://npmjs.com/crx) module
* [Grunt authors](http://gruntjs.com) for this great toolbox
* [**you**, contributor](CONTRIBUTORS.md), user or anyone providing a feedback


# License

> The MIT License (MIT)
> Copyright © 2016 Thomas Parisot, and contributors
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the “Software”), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
> THE SOFTWARE.
