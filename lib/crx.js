"use strict";

var crx = require('crx');
var path = require('path');
var rm = require('rimraf');
var async = require('async');
var mkdir = require('mkdirp');
var _ = require('lodash');

var required_properties = ['manifest_version', 'name', 'version'];
var homeDir = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;

var filename_template_base = '<%= pkg.name %>-<%= manifest.version %>';
var filename_template = {
  dest: { suffix: ".crx", optionFilenameKey: 'filename' },
  zipDest: { suffix: ".zip", optionFilenameKey: 'zipFilename' }
};

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
  function build(ChromeExtension, callback) {
    async.series([
      mkdir.bind(null, path.dirname(ChromeExtension.dest)),
      function(done){
        ChromeExtension.load().then(function(){
          done();
        }).catch(done);
      },
      function removeExcluded(done){
        async.each(ChromeExtension._excludedFiles.map(function(f){
          return path.join(ChromeExtension.path, f);
        }), rm, done);
      },
      function finallyPackFiles(next){
        ChromeExtension.loadContents()
          .then(function writeZipArchive(archiveBuffer) {
            if (ChromeExtension.zipDest) {
              grunt.file.write(ChromeExtension.zipDest, archiveBuffer);
            }
            return archiveBuffer;
          })
          .then(function writeCrxArchive(archiveBuffer){
            return ChromeExtension.pack().then(function(data) {
              grunt.file.write(ChromeExtension.dest, data);
            });
          })
          .then(function() {
            next();
          })
          .catch(next);
      }
    ], callback);
  }

  function createObject(taskConfig, defaults){
    var crxConfig = expandConfiguration(taskConfig, defaults);

    return new crx(crxConfig);
  }

  function locateSourceDirFromSrc(src){
    var manifests = _(src).chain().uniq().filter(function(file){
      return /manifest\.json$/.test(file);
    }).value();

    if (manifests.length === 0){
      grunt.fail.fatal('Unable to locate the manifest.json file.');
    }
    else if (manifests.length > 1){
      grunt.fail.fatal('Multiple manifest.json found. Please list only one manifest in your `src` target configuration.');
    }

    return path.dirname(manifests[0]);
  }

  function resolveIgnoredFiles(sourceDir, src){
    return _
      .difference(grunt.file.expand(sourceDir + '/**/*').filter(function(file) {
        return grunt.file.isFile(file);
      }), src)
      .map(function(file){
	      return path.relative(sourceDir, file);
      });
  }

  /**
   * Refines a task configuration (expand settings etc.)
   *
   * @param {Object} taskConfig
   * @param {Object=} defaults
   * @return {Object}
   */
  function expandConfiguration(taskConfig, defaults){
    defaults = defaults || getTaskConfiguration();
    taskConfig = _.extend(defaults, taskConfig);

    var crxConfig = {
      maxBuffer: taskConfig.options.maxBuffer || undefined
    };

    // The source dir is where the manifest.json file is located
    var sourceDir = locateSourceDirFromSrc(taskConfig.src);
    crxConfig.manifest = require(path.resolve(sourceDir, 'manifest.json'));
    crxConfig.rootDirectory = sourceDir;

    // Compute a list of ignored filed
    crxConfig._excludedFiles = resolveIgnoredFiles(sourceDir, taskConfig.src);

    // Eventually expanding `~` in config paths
    taskConfig.options.privateKey = resolveHomeDirectory(taskConfig.options.privateKey);

    if (!grunt.file.exists(taskConfig.options.privateKey)){
      grunt.fail.fatal('Unable to locate your private key at path "' + taskConfig.options.privateKey + '".');
    }
    else{
      crxConfig.privateKey = grunt.file.read(taskConfig.options.privateKey);
    }

    // Check extension manifest
    required_properties.forEach(function(prop) {
      if ('undefined' === typeof crxConfig.manifest[prop]) {
        grunt.fail.fatal('Invalid manifest: property "' + prop + '" is missing.');
      }
    });

    var processKeys = ['dest', 'zipDest'];

    // process file name template(s)
    processKeys.forEach(function(key) {
      if (!taskConfig[key]){
        return;
      }

      var filename = taskConfig[key];

      if (!path.extname(taskConfig[key])) {
        filename = taskConfig.options[ filename_template[key].optionFilenameKey ] || filename_template_base + filename_template[key].suffix;

        filename = path.join(taskConfig[key], filename);
      }


      taskConfig[key] = grunt.template.process(filename, {
        "data": {
          "manifest": crxConfig.manifest,
          "pkg": require(path.resolve(process.cwd(), 'package.json'))
        }
      });
    });

    crxConfig.dest = taskConfig.dest;
    crxConfig.zipDest = taskConfig.zipDest;
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
    "filename": filename_template,
    "getTaskConfiguration": getTaskConfiguration,
    "resolveHomeDirectory": resolveHomeDirectory
  };
};
