/**
 * @license RequireJS Copyright (c) 2010-2014, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/requirejs for details
 */

/*jslint nomen: false, strict: false */
/*global define: false */

var logger = {
    TRACE: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    SILENT: 4,
    level: 0,
    logPrefix: "",

    logLevel: function( level ) {
        this.level = level;
    },

    trace: function (message) {
        if (this.level <= this.TRACE) {
            this._print(message);
        }
    },

    info: function (message) {
        if (this.level <= this.INFO) {
            this._print(message);
        }
    },

    warn: function (message) {
        if (this.level <= this.WARN) {
            this._print(message);
        }
    },

    error: function (message) {
        if (this.level <= this.ERROR) {
            this._print(message);
        }
    },

    _print: function (message) {
        this._sysPrint((this.logPrefix ? (this.logPrefix + " ") : "") + message);
    },

    _sysPrint: function (message) {
        console.log(message);
    }
};

module.exports = logger;