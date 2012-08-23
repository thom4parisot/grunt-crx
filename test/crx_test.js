var grunt = require('grunt');

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
    // setup here
    done();
  },
  'helper-crx': {
    'without codebase': function(test){

      test.done();
    },
    'with codebase': function(test){

      test.done();
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
