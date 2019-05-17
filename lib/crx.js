"use strict";

var WebExtension = require("crx");
var path = require("path");
var mkdir = require("fs").promises.mkdir;
var osHomedir = require("os").homedir;
var extend = require("xtend");

/**
 * Resolve the home directory of a supposed-path value
 *
 * @param {String} value
 * @returns {String}
 */
function resolveHomeDirectory(value) {
  if (typeof value === "string" && value[0] === "~") {
    value = value.replace(/^~/, osHomedir());
  }

  return value;
}

/**
 * Returns a task configuration profile
 *
 * @param {String=} profile
 * @return {Object}
 */
function getTaskConfiguration(profile='default') {
  return require(
    path.join(__dirname, "..", "data", `config-${profile}.json`)
  );
}

/**
 * Initializes the grunt helper
 *
 * @param {grunt} grunt
 * @returns {{build: Function, expandConfiguration: Function, getTaskConfiguration: Function, resolveHomeDirectory: Function}}
 */
exports.init = function(grunt) {
  /**
   * Builds a pre-configured chrome extension in 3 steps
   *
   * @api
   * @param {crx} WebExtension
   * @return null
   */
  function build(TaskConfig, crx) {
    return mkdir(path.dirname(TaskConfig.dest), { recursive: true })
      .then(() => crx.load(TaskConfig.src))
      .then(() => crx.loadContents())
      .then(function(archiveBuffer) {
        if (path.extname(TaskConfig.dest) === ".zip") {
          grunt.file.write(TaskConfig.dest, archiveBuffer);
          grunt.log.ok(TaskConfig.dest + " has been created.");
        }

        return archiveBuffer;
      })
      .then(function writeCrxArchive(archiveBuffer) {
        if (path.extname(TaskConfig.dest) === ".crx") {
          return crx
            .pack(archiveBuffer)
            .then(function(crxBuffer) {
              grunt.file.write(TaskConfig.dest, crxBuffer);
              grunt.log.ok(TaskConfig.dest + " has been created.");
            })
            .catch(grunt.log.error);
        }
      });
  }

  /**
   * Refines a task configuration (expand settings etc.)
   *
   * @param {Object} taskConfig
   * @param {Object=} defaults
   * @return {Object}
   */
  function expandConfiguration(taskConfig, defaults) {
    taskConfig = extend(getTaskConfiguration(), defaults || {}, taskConfig);

    var crxConfig = {
      maxBuffer: taskConfig.options.maxBuffer || undefined
    };

    // Compute a list of ignored filed
    // Eventually expanding `~` in config paths
    if (taskConfig.options.privateKey) {
      var privateKeyPath = resolveHomeDirectory(taskConfig.options.privateKey);

      if (!grunt.file.exists(privateKeyPath)) {
        grunt.fail.fatal(
          'Unable to locate your private key at path "' + privateKeyPath + '".'
        );
      } else {
        crxConfig.privateKey = grunt.file.read(privateKeyPath);
      }
    }

    crxConfig.codebase =
      taskConfig.options.baseURL || taskConfig.options.codebase || null;

    if (crxConfig.codebase && !/.crx$/.test(crxConfig.codebase)) {
      crxConfig.codebase = crxConfig.codebase.replace(/\/$/, "");
      crxConfig.codebase += "/" + path.basename(taskConfig.dest);
    }

    return crxConfig;
  }

  function createObject(taskConfig, defaults) {
    var crxConfig = expandConfiguration(taskConfig, defaults);
    return new WebExtension(crxConfig);
  }

  /*
   * Blending
   */
  return {
    build,
    createObject,
    expandConfiguration,
    getTaskConfiguration,
    resolveHomeDirectory,
  };
};
