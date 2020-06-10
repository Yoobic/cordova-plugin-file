/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
*/

(function () {

    var createFileEntryFunctions = function (fs, successCallback, errorCallback) {
        fs.root.getFile('todelete_658674_833_4_cdv', {create: true}, function (fileEntry) {
            var fileEntryType = Object.getPrototypeOf(fileEntry);
            var entryType = Object.getPrototypeOf(fileEntryType);

            // Save the original method
            var origToURL = entryType.toURL;
            entryType.toURL = function () {
                var origURL = origToURL.call(this);
                if (this.isDirectory && origURL.substr(-1) !== '/') {
                    return origURL + '/';
                }
                return origURL;
            };

            entryType.toNativeURL = function () {
                console.warn("DEPRECATED: Update your code to use 'toURL'");
                return this.toURL();
            };

            entryType.toInternalURL = function () {
                if (this.toURL().indexOf('persistent') > -1) {
                    return 'cdvfile://localhost/persistent' + this.fullPath;
                }

                if (this.toURL().indexOf('temporary') > -1) {
                    return 'cdvfile://localhost/temporary' + this.fullPath;
                }
            };

            entryType.setMetadata = function (win, fail /*, metadata */) {
                if (fail) {
                    fail('Not supported');
                }
            };

            fileEntry.createWriter(function (writer) {
                var originalWrite = writer.write;
                var writerProto = Object.getPrototypeOf(writer);
                writerProto.write = function (blob) {
                    if (blob instanceof Blob) { // eslint-disable-line no-undef
                        originalWrite.apply(this, [blob]);
                    } else {
                        var realBlob = new Blob([blob]); // eslint-disable-line no-undef
                        originalWrite.apply(this, [realBlob]);
                    }
                };

                fileEntry.remove(function () {
                    if (successCallback) {
                        successCallback();
                    }

                }, errorCallback);
            });
        });
    };

    // For browser platform: not all browsers use this file.
    function checkBrowser () {
        if (cordova.platformId === 'browser' && require('./isChrome')()) { // eslint-disable-line no-undef
            module.exports = function (successCallback, errorCallback) {
                window.requestFileSystem(window.TEMPORARY, 1, function (fs) {
                    createFileEntryFunctions(fs, successCallback, errorCallback);
                }, errorCallback);
            };
            return true;
        }
        return false;
    }
    if (checkBrowser()) {
        return;
    }

    module.exports = function () {
        /* No op for all the other browsers */
    };
})();
