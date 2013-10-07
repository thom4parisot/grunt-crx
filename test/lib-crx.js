"use strict";

var grunt = require('grunt');
var path = require('path');
var expect = require('chai').expect;

var extensionHelper = require(__dirname + '/../lib/crx.js').init(grunt);

describe('lib/crx', function(){
  var extensionConfigs, dynamicFilename = "grunt-crx-13.3.7.crx";

  beforeEach(function(){
    extensionConfigs = {
      "standard": extensionHelper.getTaskConfiguration('test-standard'),
      "codebase": extensionHelper.getTaskConfiguration('test-codebase'),
      "exclude": extensionHelper.getTaskConfiguration('test-exclude'),
      "edge": extensionHelper.getTaskConfiguration('test-edge')
    };
  });

  afterEach(function(){
    grunt.file.exists("test/data/files/") && grunt.file.delete("test/data/files/");
  });

  it('should package without codebase setting', function(done){
    var crx = extensionHelper.createObject(extensionConfigs.standard);

    expect(function(){
      extensionHelper.build(crx, function(){
        expect(grunt.file.expand('test/data/files/test.crx')).to.have.length.of(1);
        expect(grunt.file.expand('test/data/files/'+dynamicFilename)).to.be.empty;
        expect(grunt.file.expand('test/data/files/updates.xml')).to.be.empty;
        crx.destroy();

        done();
      });
    }).to.not.throw();
  });

  it('should package with codebase setting', function(done){
    var crx = extensionHelper.createObject(extensionConfigs.codebase);

    extensionHelper.build(crx, function(){
      expect(grunt.file.expand('test/data/files/test.crx')).to.be.empty;
      expect(grunt.file.expand('test/data/files/'+dynamicFilename)).to.have.length.of(1);
      expect(grunt.file.expand('test/data/files/updates.xml')).to.be.empty;

      crx.destroy();
      done();
    });
  });

  it('should exclude files', function(done){
    var crx = extensionHelper.createObject(extensionConfigs.exclude);
    extensionHelper.build(crx, function(){
      //local
      expect(grunt.file.expand('test/data/src/stuff/*')).to.have.length.of(1);
      expect(grunt.file.expand('test/data/src/*')).to.have.length.of(5);

      //copy
      expect(grunt.file.expand(path.join(crx.path + '/stuff/*'))).to.be.empty;
      expect(grunt.file.expand(path.join(crx.path + '/*'))).to.have.length.of(3);

      crx.destroy();
      done();
    });
  });

  it('should work with an array of sources', function(done){
    var standard = extensionHelper.createObject(extensionConfigs.standard);
    var edge = extensionHelper.createObject(extensionConfigs.edge);

    expect(standard.rootDirectory).to.be.a('string');
    expect(edge.rootDirectory).to.be.a('string');

    expect(standard.dest).to.be.a('string');
    expect(edge.dest).to.be.a('string');

    done();
  });
});
