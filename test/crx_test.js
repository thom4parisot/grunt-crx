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
      test.expect(3);

      test.doesNotThrow(function(){
        grunt.helper('crx', new ChromeExtension(config), function(){
          test.ok(grunt.file.isMatch('test.crx', config.dest));
          test.ok(!grunt.file.isMatch('updates.xml', config.dest));

          test.done();
        });
      });
    },
    'with codebase': function(test){
      var config = extensionConfigs.codebase;
      test.expect(2);

      grunt.helper('crx', new ChromeExtension(config), function(){
        test.ok(grunt.file.isMatch('test-codebase.crx', config.dest));
        test.ok(!grunt.file.isMatch('updates.xml', config.dest));

        test.done();
      });
    }
  },
  'helper-manifest': {
    'without codebase': function(test){

      test.done();
    },
    'with codebase': function(test){

      test.done();
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
