/* global describe, beforeEach, afterEach, it */
"use strict";

var grunt = require('grunt');
var path = require('path');
var rm = require('rimraf');
var mkdir = require('mkdirp');
var dynamicFilename = "grunt-crx-13.3.7.crx";
var expect = require('chai').expect;
var fs = require("fs");
var JSZip = require("jszip");

var extensionHelper = require(__dirname + '/../lib/crx.js').init(grunt);
var getTaskConfig = require('./helpers')(grunt).getTaskConfig;

describe('lib/crx', function(){
  before(function(){
    grunt.config.init({
      crx: {
        "standard": extensionHelper.getTaskConfiguration('test-standard'),
        "codebase": extensionHelper.getTaskConfiguration('test-codebase'),
        "exclude":  extensionHelper.getTaskConfiguration('test-exclude'),
        "edge":     extensionHelper.getTaskConfiguration('test-edge'),
        "archive":  extensionHelper.getTaskConfiguration('test-archive')
      }
    });
  });

  afterEach(function (done) {
    var filepath = path.join(__dirname, 'data', 'files');

    rm(filepath, mkdir.bind(null, filepath, done));
  });

  describe('build', function(){
    it('should build without the codebase parameter', function(done){
      var crx = extensionHelper.createObject(getTaskConfig('standard'));

      extensionHelper.build(crx, function () {
        expect(grunt.file.expand('test/data/files/test.crx')).to.have.lengthOf(1);
        expect(grunt.file.expand('test/data/files/' + dynamicFilename)).to.have.lengthOf(0);
        expect(grunt.file.expand('test/data/files/updates.xml')).to.have.lengthOf(0);

        done();
      });
    });

    it('should build with a codebase parameter', function(done){
      var crx = extensionHelper.createObject(getTaskConfig('codebase'));

      extensionHelper.build(crx, function () {
        expect(grunt.file.expand('test/data/files/test.crx')).to.have.lengthOf(0);
        expect(grunt.file.expand('test/data/files/' + dynamicFilename)).to.have.lengthOf(1);
        expect(grunt.file.expand('test/data/files/updates.xml')).to.have.lengthOf(0);

        done();
      });
    });

    it('should exclude files', function (done) {
      var crx = extensionHelper.createObject(getTaskConfig('exclude'));

      extensionHelper.build(crx, function () {
        //local
        expect(grunt.file.expand('test/data/src/stuff/*')).to.have.lengthOf(1);
        expect(grunt.file.expand('test/data/src/*')).to.have.lengthOf(5);

        //copy
        expect(grunt.file.expand(path.join(crx.path + '/stuff/*'))).to.have.lengthOf(0);
        expect(grunt.file.expand(path.join(crx.path + '/*'))).to.have.lengthOf(4);

        done();
      });
    });
  });

  it('should archive a zip file if option is enabled', function (done) {
    var crx = extensionHelper.createObject(getTaskConfig('archive'));

    extensionHelper.build(crx, function () {
      var jsZipFile = new JSZip();
      var dest = crx.zipDest;

      expect(grunt.file.exists(dest), 'zip file should have been created').to.be.true;

      jsZipFile.load(fs.readFileSync(dest));

      expect(jsZipFile.file('manifest.json')).to.be.ok;
      done();
    });
  });
});
