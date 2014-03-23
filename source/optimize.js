/**
 * @license Copyright (c) 2010-2014, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/requirejs for details
 */

/*jslint plusplus: true, nomen: true, regexp: true */
/*global define: false */

define([ 'lang', 'logger', 'parse', 'pragma'],
function (lang,   logger,   parse,   pragma) {
    'use strict';

    var optimize = {
        /**
         * Optimizes a file that contains JavaScript content. Optionally collects
         * plugin resources mentioned in a file, and then passes the content
         * through an minifier if one is specified via config.optimize.
         *
         * @param {String} fileName the name of the file to optimize
         * @param {String} fileContents the contents to optimize. If this is
         * a null value, then fileName will be used to read the fileContents.
         * @param {String} outFileName the name of the file to use for the
         * saved optimized content.
         * @param {Object} config the build config object.
         * @param {Array} [pluginCollector] storage for any plugin resources
         * found.
         */
        jsFile: function (fileName, fileContents, outFileName, config, pluginCollector) {
            if (!fileContents) {
                fileContents = file.readFile(fileName);
            }

            fileContents = optimize.js(fileName, fileContents, outFileName, config, pluginCollector);

            file.saveUtf8File(outFileName, fileContents);
        },

        /**
         * Optimizes a file that contains JavaScript content. Optionally collects
         * plugin resources mentioned in a file, and then passes the content
         * through an minifier if one is specified via config.optimize.
         *
         * @param {String} fileName the name of the file that matches the
         * fileContents.
         * @param {String} fileContents the string of JS to optimize.
         * @param {Object} [config] the build config object.
         * @param {Array} [pluginCollector] storage for any plugin resources
         * found.
         */
        js: function (fileName, fileContents, outFileName, config, pluginCollector) {
            var optFunc, optConfig,
                parts = (String(config.optimize)).split('.'),
                optimizerName = parts[0],
                keepLines = parts[1] === 'keepLines',
                licenseContents = '';

            config = config || {};

            //Apply pragmas/namespace renaming
            fileContents = pragma.process(fileName, fileContents, config, 'OnSave', pluginCollector);

            //Optimize the JS files if asked.
            if (optimizerName && optimizerName !== 'none') {
                optFunc = envOptimize[optimizerName] || optimize.optimizers[optimizerName];
                if (!optFunc) {
                    throw new Error('optimizer with name of "' +
                                    optimizerName +
                                    '" not found for this environment');
                }

                optConfig = config[optimizerName] || {};
                if (config.generateSourceMaps) {
                    optConfig.generateSourceMaps = !!config.generateSourceMaps;
                    optConfig._buildSourceMap = config._buildSourceMap;
                }

                try {
                    if (config.preserveLicenseComments) {
                        //Pull out any license comments for prepending after optimization.
                        try {
                            licenseContents = parse.getLicenseComments(fileName, fileContents);
                        } catch (e) {
                            throw new Error('Cannot parse file: ' + fileName + ' for comments. Skipping it. Error is:\n' + e.toString());
                        }
                    }

                    fileContents = licenseContents + optFunc(fileName,
                                                             fileContents,
                                                             outFileName,
                                                             keepLines,
                                                             optConfig);
                    if (optConfig._buildSourceMap && optConfig._buildSourceMap !== config._buildSourceMap) {
                        config._buildSourceMap = optConfig._buildSourceMap;
                    }
                } catch (e) {
                    if (config.throwWhen && config.throwWhen.optimize) {
                        throw e;
                    } else {
                        logger.error(e);
                    }
                }
            } else {
                if (config._buildSourceMap) {
                    config._buildSourceMap = null;
                }
            }

            return fileContents;
        }
      
    };

    return optimize;
});
