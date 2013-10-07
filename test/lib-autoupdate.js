"use strict";

var grunt = require('grunt');
var path = require('path');
var expect = require('chai').expect;

var extensionHelper = require(__dirname + '/../lib/crx.js').init(grunt);
var autoupdateHelper = require(__dirname + '/../lib/autoupdate.js').init(grunt);

describe('lib/autoupdate', function(){
  var extensionConfigs;

  beforeEach(function(){
    extensionConfigs = {
      "standard": extensionHelper.getTaskConfiguration('test-standard'),
      "codebase": extensionHelper.getTaskConfiguration('test-codebase'),
      "exclude": extensionHelper.getTaskConfiguration('test-exclude')
    };
  });

  afterEach(function(){
    grunt.file.exists("test/data/files/") && grunt.file.delete("test/data/files/");
  });

  it('should not write an autoupdate XML file without codebase and without update_url', function(done){
    var crx = extensionHelper.createObject(extensionConfigs.standard);
    crx.manifest.update_url = null;

    autoupdateHelper.buildXML(crx, function(){
      expect(grunt.file.expand('test/data/files/updates.xml')).to.be.empty;

      done();
    });
  });

  it('should not write an autoupadte XML file with codebase and without update_url', function(done){
    var crx = extensionHelper.createObject(extensionConfigs.codebase);
    crx.manifest.update_url = null;

    autoupdateHelper.buildXML(crx, function(){
      expect(grunt.file.expand('test/data/files/updates.xml')).to.be.empty;

      done();
    });
  });

  it('should build an autoupdate XML file with codebase and with update_url', function(done){
    var crx = extensionHelper.createObject(extensionConfigs.codebase);

    autoupdateHelper.buildXML(crx, function(){
      expect(grunt.file.expand('test/data/files/updates.xml')).to.have.length.of(1);

      done();
    });
  });
});