"use strict";

var grunt = require('grunt');
var path = require('path');
var exec = require('child_process').exec;
var extensionConfigs, dynamicFilename = "grunt-crx-13.3.7.crx";

var extensionHelper = require(__dirname + '/../lib/crx.js').init(grunt);
var autoupdateHelper = require(__dirname + '/../lib/autoupdate.js').init(grunt);

module.exports = {
  setUp: function(done) {
    extensionConfigs = {
      "standard": extensionHelper.getTaskConfiguration('test-standard'),
      "codebase": extensionHelper.getTaskConfiguration('test-codebase'),
      "exclude": extensionHelper.getTaskConfiguration('test-exclude')
    };

    exec('rm -f test/data/files/*', done);
  },
  'buildXML': {
    'with manifest.update_url': function(test){
      test.expect(1);

      var crx = extensionHelper.createObject(extensionConfigs.standard);

      autoupdateHelper.buildXML(crx, function(){
        test.equal(grunt.file.expand('test/data/files/updates.xml').length, 1);

        test.done();
      });
    },
    'without manifest.update_url': function(test){
      test.expect(1);

      var crx = extensionHelper.createObject(extensionConfigs.standard);
      crx.manifest.update_url = null;

      autoupdateHelper.buildXML(crx, function(){
        test.equal(grunt.file.expand('test/data/files/updates.xml').length, 0);

        test.done();
      });
    }
  }
};
