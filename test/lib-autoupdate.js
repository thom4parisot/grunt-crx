/* global describe, it, beforeEach, afterEach, expect */
"use strict";

var grunt = require('grunt');
var rm = require('rimraf');
var mkdir = require('mkdirp');
var path = require('path');
var expect = require('chai').expect;

var extensionHelper = require(__dirname + '/../lib/crx.js').init(grunt);
var autoupdateHelper = require(__dirname + '/../lib/autoupdate.js').init(grunt);

describe('lib/autoupdate', function () {
  var extensionConfigs;

  beforeEach(function () {
    extensionConfigs = {
      "standard": extensionHelper.getTaskConfiguration('test-standard'),
      "codebase": extensionHelper.getTaskConfiguration('test-codebase'),
      "exclude":  extensionHelper.getTaskConfiguration('test-exclude')
    };
  });

  afterEach(function (done) {
    var filepath = path.join(__dirname, 'data', 'files');

    rm(filepath, mkdir.bind(null, filepath, done));
  });

  it('should not write an autoupdate XML file without codebase and without update_url', function (done) {
    var crx = extensionHelper.createObject(extensionConfigs.standard);
    crx.manifest.update_url = null;
    rm(filepath, mkdir.bind(null, filepath, done));
  });

  describe('buildXML', function () {
    it('should generate an autoupdate file without codebase, without update_url', function (done) {
      var crx = extensionHelper.createObject(extensionConfigs.standard);
      crx.manifest.update_url = null;

      autoupdateHelper.buildXML(crx, function () {
        expect(grunt.file.expand('test/data/files/updates.xml')).to.have.lengthOf(0);

        done();
      });
    });

    it('should generate an autoupdate file with codebase, without update_url', function (done) {
      var crx = extensionHelper.createObject(extensionConfigs.codebase);
      crx.manifest.update_url = null;

      autoupdateHelper.buildXML(crx, function () {
        expect(grunt.file.expand('test/data/files/updates.xml')).to.have.lengthOf(0);

        done();
      });
    });

    it('should generate an autoupdate file with codebase, with update_url', function (done) {
      var crx = extensionHelper.createObject(extensionConfigs.codebase);

      autoupdateHelper.buildXML(crx, function () {
        expect(grunt.file.expand('test/data/files/updates.xml')).to.have.lengthOf(1);

        done();
      });
    });
  });
});
