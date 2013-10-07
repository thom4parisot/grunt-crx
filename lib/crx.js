"use strict";

var crx = require('crx');
var path = require('path');

var required_properties = ['manifest_version', 'name', 'version'];
var homeDir = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
var filename_template = "<%= pkg.name %>-<%= manifest.version %>.crx";

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
    grunt.file.mkdir(path.dirname(ChromeExtension.dest));

    grunt.util.async.series([
      function loadFilesInTemporaryFolder(next){
        ChromeExtension.load(next);
      },
      function removeExcludedFiles(next){
        if (!Array.isArray(ChromeExtension.exclude) || !ChromeExtension.exclude.length){
          return next();
        }

        var files = grunt.file.expand(ChromeExtension.exclude.map(function(pattern){
          return path.join(ChromeExtension.path, '/', pattern);
        }));

        // deletes all the file in parallel
        grunt.util.async.forEach(files, function(filepath, done){
          grunt.file.delete(filepath, {force: true});

          done();
        }, next);
      },
      function finallyPackFiles(next){
        ChromeExtension.pack(function(err, data){
          if (err){
            grunt.fail.fatal(err);
          }

          grunt.file.write(this.dest, data);

          next();
        });
      }
    ], callback);
  }

  function createObject(taskConfig, defaults){
    taskConfig = expandConfiguration(taskConfig, defaults);

    return new crx(taskConfig);
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
    var config = grunt.util._.defaults({}, taskConfig,  defaults);

    ['dest', 'src'].forEach(function(key){
      if ((Array.isArray(config[key]) && config[key].length === 0) || !config[key]){
        grunt.fail.fatal("You can't specify an empty '"+key+"' configuration value.");
      }
    });

    // XXX (alexeykuzmin): Is there a better way to get source folder path?
    var sourceDir = Array.isArray(config.src) ? config.src[0] : config.src;

    // Eventually expanding `~` in config paths
    ['privateKey', 'src', 'dest'].forEach(function(key){
      config[key] = resolveHomeDirectory(config[key]);
    });

    // Checking availability
    if (!grunt.file.exists(sourceDir)){
      grunt.fail.fatal('Unable to locate source directory.');
    }

    if (!grunt.file.exists(config.privateKey)){
      grunt.fail.fatal('Unable to locate your private key.');
    }
    else{
      config.privateKey = grunt.file.read(config.privateKey);
    }

    // Check extension manifest
    config.manifest = grunt.file.readJSON(path.join(sourceDir, 'manifest.json'));
    required_properties.forEach(function(prop) {
      if ('undefined' === typeof config.manifest[prop]) {
        grunt.fail.fatal('Invalid manifest: property "' + prop + '" is missing.');
      }
    });

    // Expanding destination
    if (!path.extname(config.dest)){
      var filename = config.filename || filename_template;

      config.dest = path.join(config.dest, filename);
    }

    ['dest'].forEach(function(key){
      config[key] = grunt.template.process(config[key], {
        "data": {
          "manifest": config.manifest,
          "pkg": grunt.file.readJSON('package.json')
        }
      });
    });

    // Codebase generation (@todo cleanup that with clean separation of grunt and chrome extension config)
    config.codebase = config.baseURL || config.codebase || null;

    if (config.codebase && !/.crx$/.test(config.codebase)){
      config.codebase = config.codebase.replace(/\/$/, '');
      config.codebase += '/' + path.basename(config.dest);
    }

    // @todo remove that to better separate grunt config and Chrome Extension config
    // rootDirectory should be a String, not Array
    config.rootDirectory = sourceDir;
    config.maxBuffer = config.options.maxBuffer || config.maxBuffer || undefined;

    return config;
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

    config = grunt.file.readJSON(__dirname + '/../data/config-'+ profile +'.json');

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
