var grunt = require('grunt');
var ChromeExtension = require('crx');
var path = require('path');
var fs = require('fs');
var exec = require('child_process').exec;
var taskConfigs, extensionConfigs;

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports['crx'] = {
  setUp: function(done) {
    taskConfigs = {
      "standard": {
        "privateKey": "test/data/key.pem",
        "src": "test/data/src/",
        "dest": "test/data/files/"
      }
    };

    extensionConfigs = {
      "standard": {
        "privateKey": fs.readFileSync("test/data/key.pem"),
        "rootDirectory": "test/data/src/",
        "dest": "test/data/files/test.crx"
      },
      "codebase": {
        "codebase": "http://example.com/updates.xml",
        "privateKey": fs.readFileSync("test/data/key.pem"),
        "rootDirectory": "test/data/src/",
        "dest": "test/data/files/test-codebase.crx"
      }
    };

    exec('rm -f test/data/files/*', done);
  },
  'helper-crx': {
    'without codebase': function(test){
      var config = extensionConfigs.standard;
      test.expect(4);

      test.doesNotThrow(function(){
        grunt.helper('crx', new ChromeExtension(config), function(){
          test.equal(grunt.file.expandFiles('test/data/files/test.crx').length, 1);
          test.equal(grunt.file.expandFiles('test/data/files/test-codebase.crx').length, 0);
          test.equal(grunt.file.expandFiles('test/data/files/updates.xml').length, 0);

          test.done();
        });
      });
    },
    'with codebase': function(test){
      var config = extensionConfigs.codebase;
      test.expect(3);

      grunt.helper('crx', new ChromeExtension(config), function(){
        test.equal(grunt.file.expandFiles('test/data/files/test.crx').length, 0);
        test.equal(grunt.file.expandFiles('test/data/files/test-codebase.crx').length, 1);
        test.equal(grunt.file.expandFiles('test/data/files/updates.xml').length, 0);

        test.done();
      });
    }
  },
  'helper-manifest': {
    'without running crx-helper': function(test){
      var config = extensionConfigs.codebase;
      test.expect(1);

      test.throws(function(){
        grunt.helper('crx-manifest', new ChromeExtension(config));
      });

      test.done();
    },
    'without codebase': function(test){
      var config = extensionConfigs.standard;
      var crx = new ChromeExtension(config);
      test.expect(1);

      grunt.utils.async.series([
        function(done){
          grunt.helper('crx', crx, done);
        },
        function(done){
          test.throws(function(){
            grunt.helper('crx-manifest', crx);
          });

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
          grunt.helper('crx', crx, done);
        },
        function(done){
          grunt.helper('crx-manifest', crx, function(){

            test.equal(grunt.file.expandFiles('test/data/files/test.crx').length, 0);
            test.equal(grunt.file.expandFiles('test/data/files/test-codebase.crx').length, 1);
            test.equal(grunt.file.expandFiles('test/data/files/updates.xml').length, 1);
            done();
          });
        }
      ], test.done);
    }
  },
  'task': {
    'with required arguments': function(test){

      test.done();
    },
    'with codebase': function(test){

      test.done();
    },
    'custom App ID': function(test){

      test.done();
    },
    'wrong private key': function(test){

      test.done();
    },
    'invalid destination': function(test){

      test.done();
    },
    'invalid source': function(test){

      test.done();
    },
    'invalid source manifest': function(test){

      test.done();
    }
  }
};
