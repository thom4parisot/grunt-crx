var grunt = require('grunt');
var ChromeExtension = require('crx');
var path = require('path');
var fs = require('fs');
var exec = require('child_process').exec;
var extensionConfigs;

var crxHelper = require(__dirname + '/../lib/crx.js').init(grunt);
var crxManifestHelper = require(__dirname + '/../lib/crx-manifest.js').init(grunt);

exports['crx'] = {
  setUp: function(done) {
    extensionConfigs = {
      "standard": {
        "privateKey": fs.readFileSync("test/data/key.pem"),
        "rootDirectory": "test/data/src/",
        "dest": "test/data/files/test.crx"
      },
      "codebase": {
        "codebase": "http://example.com/files/test-codebase.crx",
        "privateKey": fs.readFileSync("test/data/key.pem"),
        "rootDirectory": "test/data/src/",
        "dest": "test/data/files/test-codebase.crx"
      },
      "exclude": {
        "exclude": [
          "ignore.me",
          "stuff/*",
          "blah"
        ],
        "privateKey": fs.readFileSync("test/data/key.pem"),
        "rootDirectory": "test/data/src/",
        "dest": "test/data/files/test.crx"
      }
    };

    exec('rm -f test/data/files/*', done);
  },
  'helper-crx': {
    'without codebase': function(test){
      var config = extensionConfigs.standard;
      var crx = new ChromeExtension(config);
      test.expect(4);

      test.doesNotThrow(function(){
        crxHelper.build(crx, function(){
          test.equal(grunt.file.expandFiles('test/data/files/test.crx').length, 1);
          test.equal(grunt.file.expandFiles('test/data/files/test-codebase.crx').length, 0);
          test.equal(grunt.file.expandFiles('test/data/files/updates.xml').length, 0);

          crx.destroy();
          test.done();
        });
      });
    },
    'with codebase': function(test){
      var config = extensionConfigs.codebase;
      var crx = new ChromeExtension(config);
      test.expect(3);

      crxHelper.build(crx, function(){
        test.equal(grunt.file.expandFiles('test/data/files/test.crx').length, 0);
        test.equal(grunt.file.expandFiles('test/data/files/test-codebase.crx').length, 1);
        test.equal(grunt.file.expandFiles('test/data/files/updates.xml').length, 0);

        crx.destroy();
        test.done();
      });
    },
    'excluding files': function(test){
      var config = extensionConfigs.exclude;
      var crx = new ChromeExtension(config);
      test.expect(4);

      crxHelper.build(crx, function(){
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
  'helper-manifest': {
    'without running crx-helper': function(test){
      var config = extensionConfigs.codebase;
      test.expect(1);

      test.throws(function(){
        crxManifestHelper.build(new ChromeExtension(config));
      });

      test.done();
    },
    'without codebase': function(test){
      var config = extensionConfigs.standard;
      var crx = new ChromeExtension(config);
      test.expect(1);

      grunt.utils.async.series([
        function(done){
          crxHelper.build(crx, done);
        },
        function(done){
          test.throws(function(){
            crxManifestHelper.build(crx);
          });

          crx.destroy();
          done();
        }
      ], test.done);
    },
    'with codebase': function(test){
      var config = extensionConfigs.codebase;
      var crx = new ChromeExtension(config);
      test.expect(3);

      grunt.utils.async.series([
        function(done){
          crxHelper.build(crx, done);
        },
        function(done){
          crxManifestHelper.build(crx, function(){

            test.equal(grunt.file.expandFiles('test/data/files/test.crx').length, 0);
            test.equal(grunt.file.expandFiles('test/data/files/test-codebase.crx').length, 1);
            test.equal(grunt.file.expandFiles('test/data/files/updates.xml').length, 1);

            crx.destroy();
            done();
          });
        }
      ], test.done);
    }
  }
};
