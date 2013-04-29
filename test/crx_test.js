"use strict";

var grunt = require('grunt');
var ChromeExtension = require('crx');
var path = require('path');
var exec = require('child_process').exec;
var extensionConfigs;

var extensionHelper = require(__dirname + '/../lib/crx.js').init(grunt);
var autoupdateHelper = require(__dirname + '/../lib/autoupdate.js').init(grunt);

exports['crx'] = {
  setUp: function(done) {
    extensionConfigs = {
      "standard": extensionHelper.getTaskConfiguration('test-standard'),
      "codebase": extensionHelper.getTaskConfiguration('test-codebase'),
      "exclude": extensionHelper.getTaskConfiguration('test-exclude')
    };

    exec('rm -f test/data/files/*', done);
  },
  'helper-crx': {
    'without codebase': function(test){
      var config = extensionHelper.expandConfiguration(extensionConfigs.standard);
      var crx = new ChromeExtension(config);
      test.expect(4);

      test.doesNotThrow(function(){
        extensionHelper.build(crx, function(){
          test.equal(grunt.file.expand('test/data/files/test.crx').length, 1);
          test.equal(grunt.file.expand('test/data/files/test-codebase.crx').length, 0);
          test.equal(grunt.file.expand('test/data/files/updates.xml').length, 0);

          crx.destroy();
          test.done();
        });
      });
    },
    'with codebase': function(test){
      var config = extensionHelper.expandConfiguration(extensionConfigs.codebase);
      var crx = new ChromeExtension(config);
      test.expect(3);

      extensionHelper.build(crx, function(){
        test.equal(grunt.file.expand('test/data/files/test.crx').length, 0);
        test.equal(grunt.file.expand('test/data/files/test-codebase.crx').length, 1);
        test.equal(grunt.file.expand('test/data/files/updates.xml').length, 0);

        crx.destroy();
        test.done();
      });
    },
    'excluding files': function(test){
      var config = extensionHelper.expandConfiguration(extensionConfigs.exclude);
      var crx = new ChromeExtension(config);
      test.expect(4);

      extensionHelper.build(crx, function(){
        //local
        test.equal(grunt.file.expand('test/data/src/stuff/*').length, 1);
        test.equal(grunt.file.expand('test/data/src/*').length, 5);

        //copy
        test.equal(grunt.file.expand(path.join(crx.path + '/stuff/*')).length, 0);
        test.equal(grunt.file.expand(path.join(crx.path + '/*')).length, 3);

        crx.destroy();
        test.done();
      });
    }
  },
  'helper-autoupdate': {
    'without running crx-helper': function(test){
      var config = extensionHelper.expandConfiguration(extensionConfigs.codebase);
      test.expect(1);

      test.throws(function(){
        autoupdateHelper.buildXML(new ChromeExtension(config));
      });

      test.done();
    },
    'without codebase': function(test){
      var config = extensionHelper.expandConfiguration(extensionConfigs.standard);
      var crx = new ChromeExtension(config);
      test.expect(1);

      grunt.util.async.series([
        function(done){
          extensionHelper.build(crx, done);
        },
        function(done){
          test.throws(function(){
            autoupdateHelper.buildXML(crx);
          });

          crx.destroy();
          done();
        }
      ], test.done);
    },
    'with codebase': function(test){
      var config = extensionHelper.expandConfiguration(extensionConfigs.codebase);
      var crx = new ChromeExtension(config);
      test.expect(3);
      grunt.util.async.series([
        function(done){
          extensionHelper.build(crx, done);
        },
        function(done){
          autoupdateHelper.buildXML(crx, function(){

            test.equal(grunt.file.expand('test/data/files/test.crx').length, 0);
            test.equal(grunt.file.expand('test/data/files/test-codebase.crx').length, 1);
            test.equal(grunt.file.expand('test/data/files/updates.xml').length, 1);

            crx.destroy();
            done();
          });
        }
      ], test.done);
    }
  }
};
