"use strict";

var crx = require('crx');
var path = require('path');
var mkdir = require('mkdirp');
var _ = require('lodash');

var homeDir = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;

/**
 * Resolve the home directory of a supposed-path value
 *
 * @param {String} value
 * @returns {String}
 */
function resolveHomeDirectory(value){
  if (homeDir && typeof value === 'string' && value[0] === '~'){
    value = value.replace(/^~/, homeDir);
  }

  return value;
}

/**
 * Initializes the grunt helper
 *
 * @param {grunt} grunt
 * @returns {{build: Function, expandConfiguration: Function, getTaskConfiguration: Function, resolveHomeDirectory: Function}}
 */
exports.init = function(grunt){
  /**
   * Builds a pre-configured chrome extension in 3 steps
   *
   * @api
   * @param {crx} ChromeExtension
   * @param {Function} callback
   * @return null
   */
  function build(TaskConfig, ChromeExtension, callback) {
    mkdir(path.dirname(TaskConfig.dest), function(err) {
      if (err) {
	return callback(err);
      }

      ChromeExtension
	.load(TaskConfig.src)
	.then(function(crx){
	  return ChromeExtension.loadContents();
	})
	.then(function(archiveBuffer){
	  if (path.extname(TaskConfig.dest) === '.zip') {
	    grunt.file.write(TaskConfig.dest, archiveBuffer);
	    grunt.log.ok(TaskConfig.dest + ' has been created.')
	  }

	  return archiveBuffer;
	})
	.then(function writeCrxArchive(archiveBuffer){
	  if (path.extname(TaskConfig.dest) === '.crx') {
	    return ChromeExtension.pack(archiveBuffer).then(function(crxBuffer) {
	      grunt.file.write(TaskConfig.dest, crxBuffer);
	      grunt.log.ok(TaskConfig.dest + ' has been created.')
	    }).catch(grunt.log.error);
	  }
	})
	.catch(callback)
    });
  }

  function createObject(taskConfig, defaults){
    var crxConfig = expandConfiguration(taskConfig, defaults);
    return new crx(crxConfig);
  }

  /**
   * Refines a task configuration (expand settings etc.)
   *
   * @param {Object} taskConfig
   * @param {Object=} defaults
   * @return {Object}
   */
  function expandConfiguration(taskConfig, defaults){
    taskConfig = _.merge(getTaskConfiguration(), defaults || {}, taskConfig);

    var crxConfig = {
      maxBuffer: taskConfig.options.maxBuffer || undefined
    };

    // Compute a list of ignored filed
    // Eventually expanding `~` in config paths
    if (taskConfig.options.privateKey) {
      var privateKeyPath = resolveHomeDirectory(taskConfig.options.privateKey);

      if (!grunt.file.exists(privateKeyPath)){
	grunt.fail.fatal('Unable to locate your private key at path "' + privateKeyPath + '".');
      }
      else{
	crxConfig.privateKey = grunt.file.read(privateKeyPath);
      }
    }

    crxConfig.codebase = taskConfig.options.baseURL || taskConfig.options.codebase || null;

    if (crxConfig.codebase && !/.crx$/.test(crxConfig.codebase)){
      crxConfig.codebase = crxConfig.codebase.replace(/\/$/, '');
      crxConfig.codebase += '/' + path.basename(taskConfig.dest);
    }

    return crxConfig;
  }

  /**
   * Returns a task configuration profile
   *
   * @param {String=} profile
   * @return {Object}
   */
  function getTaskConfiguration(profile){
    var config;

    profile = profile || 'default';

    config = require(__dirname + '/../data/config-'+ profile +'.json');

    return config;
  }

  /*
   * Blending
   */
  return {
    "build": build,
    "createObject": createObject,
    "expandConfiguration": expandConfiguration,
    "getTaskConfiguration": getTaskConfiguration,
    "resolveHomeDirectory": resolveHomeDirectory
  };
};
