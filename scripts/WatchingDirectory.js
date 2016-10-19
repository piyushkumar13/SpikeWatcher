'use strict';
var myChokidar = require('chokidar');
var uploadToS3 = require('./UploadToS3');
var path = require('path');

var watchedPath = '/Users/kumarp9/Downloads/samplewatcher/';
var watcher = myChokidar.watch(watchedPath, {
    ignored: /[\/\\]\./, persistent: true,
    ignoreInitial: false
});

/*
* This will trigger if any folder(empty folder) is added to the watched directory.
* */
watcher.on('addDir', function (path) {
    console.log('Directory', path, 'has been added');
});

/*
* This will trigger if any file or a folder containing file is added to the watched directory.
* */
watcher.on('add', function (path1) {
    console.log('File', path1, 'has been added');
    //uploadToS3.checkAndCreateBuckets();
    //var relativePath = path.relative(watchedPath, path1);
    //console.log(relativePath);
    //uploadToS3.uploadBucket(path1, relativePath);
});

/*
* This will trigger if any changes happens to the file(s).
* */
watcher.on('change', function (path) {
    console.log('File', path, 'has been changed');
});
