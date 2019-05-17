/* global describe, beforeEach, afterEach, it */
"use strict";

var grunt = require('grunt');
var path = require('path');
var promisify = require('util').promisify;
var rm = promisify(require('rimraf'));
var mkdir = require('fs').promises.mkdir;
var expect = require('chai').expect;
var fs = require("fs");
var JSZip = require("jszip");

var extensionHelper = require(__dirname + '/../lib/crx.js').init(grunt);
var getTaskConfig = require('./helpers')(grunt).getTaskConfig;

describe('lib/crx', function(){
  before(function(){
    grunt.config.init({
      pkg: {
	name: 'grunt-crx',
	version: '13.3.7'
      },
      crx: {
        "standard": extensionHelper.getTaskConfiguration('test-standard'),
	"dynamic":  extensionHelper.getTaskConfiguration('test-dynamic'),
        "codebase": extensionHelper.getTaskConfiguration('test-codebase'),
        "exclude":  extensionHelper.getTaskConfiguration('test-exclude'),
        "edge":     extensionHelper.getTaskConfiguration('test-edge'),
        "archive":  extensionHelper.getTaskConfiguration('test-archive')
      }
    });
  });

  afterEach(function (done) {
    var filepath = path.join(__dirname, 'data', 'files');

    rm(filepath)
      .then(() => mkdir(filepath))
      .then(() => done());
  });

  describe('build', function(){
    it('should build without the codebase parameter', function(){
      var config = getTaskConfig('standard');
      var crx = extensionHelper.createObject(config);

      return extensionHelper.build(config, crx).then(function () {
        expect(grunt.file.expand('test/data/files/test.crx')).to.have.lengthOf(1);
        expect(grunt.file.expand('test/data/files/updates.xml')).to.have.lengthOf(0);
      });
    });

    it('should build with a codebase parameter', function(){
      var config = getTaskConfig('codebase');
      var crx = extensionHelper.createObject(config);

      return extensionHelper.build(config, crx).then(function () {
	expect(grunt.file.expand('test/data/files/test.crx')).to.have.lengthOf(1);
        expect(grunt.file.expand('test/data/files/updates.xml')).to.have.lengthOf(0);
      });
    });

    it('should use grunt built-in name expansion', function(){
      var config = getTaskConfig('dynamic');
      var crx = extensionHelper.createObject(config);

      return extensionHelper.build(config, crx).then(function () {
	expect(grunt.file.expand('test/data/files/grunt-crx-13.3.7.crx')).to.have.lengthOf(1);
      });
    });

    it('should exclude files', function () {
      var config = getTaskConfig('exclude');
      var crx = extensionHelper.createObject(config);

      return extensionHelper.build(config, crx).then(function () {
	var jsZipFile = new JSZip();

	jsZipFile.load(fs.readFileSync(config.dest));

	expect(jsZipFile.files).to.have.all.keys(['manifest.json', 'background.html']);
      });
    });
  });

  it('should archive a zip file if option is enabled', function () {
    var config = getTaskConfig('archive');
    var crx = extensionHelper.createObject(config);

    return extensionHelper.build(config, crx).then(function (err) {
      var jsZipFile = new JSZip();

      expect(grunt.file.exists(config.dest), 'zip file should have been created').to.be.true;

      jsZipFile.load(fs.readFileSync(config.dest));

      expect(jsZipFile.file('manifest.json')).to.be.ok;
    });
  });

  it('should work with a real-world grunt-crx run', function (done) {
    // load the task as if done by grunt
    var task = require('../tasks/crx.js');
    task(grunt);

    grunt.option('options.silently', true);

    // run it as if done by grunt (just no log output)
    grunt.log.muted = true;
    grunt.tasks(['crx:standard'], {}, function() {
      expect(grunt.file.expand('test/data/files/test.crx')).to.have.lengthOf(1);
      grunt.log.muted = false;
      done();
    });

  });
});
