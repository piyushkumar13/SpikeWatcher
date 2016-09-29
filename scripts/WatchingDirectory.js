/**
 * Created by Piyush Kumar on 28/09/16.
 */
'use strict';
var myChokidar = require('chokidar');
var uploadToS3 = require('./UploadToS3');
var path = require('path');
var watchedPath = '/Users/kumarp9/Downloads/samplewatcher/';
var watcher = myChokidar.watch(watchedPath, {
    ignored: /[\/\\]\./, persistent: true,
    ignoreInitial: true
});

watcher.on('addDir', function (path) {
    console.log('Directory', path, 'has been added');
});
watcher.on('add', function (path1) {
    console.log('File', path1, 'has been added');
    uploadToS3.checkAndCreateBuckets();
    var relativePath = path.relative(watchedPath, path1);
    console.log(relativePath);
    uploadToS3.uploadBucket(path1, relativePath);
});
watcher.on('change', function (path) {
    console.log('File', path, 'has been changed');
});
