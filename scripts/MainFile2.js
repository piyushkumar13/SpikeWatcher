var existingAssetPaths = require('./Node_dir_Example');
var myRepository = require('./Repository2');
var q = require('q');
var pathModule = require('path');
var fs = require('fs');
var localSourcePaths;
var Promise = require('bluebird');

var createdAssets = [];
var watchedPathSlashTrimmed = '/Users/kumarp9/Downloads/samplewatcher';
var watchedPath = '/Users/kumarp9/Downloads/samplewatcher/';

/*
* This is the starting starting call.
* */
main(watchedPath);

/*
* It will create the sqlite table.
* */
myRepository.createTable();

/*
* This is the starting point of the execution.
* In this method, we will first call the "Path" module's paths() method to fetch all the paths(including dir, sub-dir and files)
* All these paths are stored in localSourcePaths. Then, we fetch all the assetDetails from the sqlite table(these represents already
* upload assets). Then, we will check for the following use cases : -
*
* 1. If watched directory doesn't contains anything sub-dir or files. In this case, localSourcePaths will be
* zero. And, we will start the chokidar.
*
* 2. If assetDetails.length == 0 and localSourcePaths.length !=0 . It means we have not uploaded any asset to s3, that's why we
* dont have any db enteries. Then, we will upload all the assets which are present in the watched directory at the start of the
* application.
*
* 3. If assetDetails.length != 0 and localSourcePaths.length !=0. It mease some of the assets in the watched dir have been uploaded
* and some have not been uploaded. Or all the assets in the watched directory have been uploaded.
*
* */
function main(watchedPath) {
    var tempWatchedPath = watchedPath;
    var assetDetails;
    existingAssetPaths.getPaths().then(function (paths) {
        localSourcePaths = paths;
        return myRepository.getAssetDetails();

    }, function (error) {

    }).then(function (value) {
        assetDetails = value;

        /*
        * Use case 1. Refer above.
        * */
        if (localSourcePaths.length == 0) {
            console.log('Start the chokidar');
        }

        /*
        * Use case 2. Refer above.
        * */
        else if (assetDetails.length == 0) {
            for (var index1 in localSourcePaths) {
                var relativePath1 = pathModule.relative(watchedPath, localSourcePaths[index1]);
                console.log("Creating file/directory", relativePath1);
                var rp1 = relativePath1.split(/[/\\]+/);
                console.log("rp path : ", rp1);
                var parentWatchedPath1;
                var newTempWatchedPath;
                var newParentWatchedPath1;
                for (var relativePathIndex1 in rp1) {
                    parentWatchedPath1 = tempWatchedPath;
                    tempWatchedPath = tempWatchedPath + rp1[relativePathIndex1] + "/";
                    if (tempWatchedPath.endsWith("/")) {
                        newTempWatchedPath = tempWatchedPath.slice(0, -1);
                    }
                    if (parentWatchedPath1.endsWith("/")) {
                        newParentWatchedPath1 = parentWatchedPath1.slice(0, -1);

                    }
                    createAsset(watchedPath, newTempWatchedPath, newParentWatchedPath1, rp1[relativePathIndex1], isDirectory(newTempWatchedPath));
                }
                tempWatchedPath = watchedPath;
                parentWatchedPath = '';
            }
            insertAsset(createdAssets);
            startChokidar();
        }

        /*
        * Use case 3. Refer above.
        * */
        else {
            var notInsertedAssets = findNotInsertedAssets(localSourcePaths, assetDetails);

            if (notInsertedAssets.length == 0) {
                console.log("Assets already existing in db");

            } else {
                for (var index in notInsertedAssets) {
                    var relativePath = pathModule.relative(watchedPath, notInsertedAssets[index]);
                    console.log("Creating file/directory", relativePath);
                    var rp = relativePath.split(/[/\\]+/);
                    console.log("rp path : ", rp);
                    var parentWatchedPath;
                    var newParentWatchedPath;
                    for (var relativePathIndex in rp) {
                        parentWatchedPath = tempWatchedPath;
                        tempWatchedPath = tempWatchedPath + rp[relativePathIndex] + "/";
                        if (tempWatchedPath.endsWith("/")) {
                            newTempWatchedPath = tempWatchedPath.slice(0, -1);
                        }
                        if (parentWatchedPath.endsWith("/")) {
                            newParentWatchedPath = parentWatchedPath.slice(0, -1);

                        }
                        createAsset(watchedPath, newTempWatchedPath, newParentWatchedPath, rp[relativePathIndex], isDirectory(newTempWatchedPath));
                    }
                    tempWatchedPath = watchedPath;
                    parentWatchedPath = '';
                }
                if (createdAssets.length != 0) {
                    insertAsset(createdAssets);
                }
            }
        }

        startChokidar();
    }, function (error) {
        console.log("The error is ", error);
    });

}

function startChokidar(){
    console.log('Start the chokidar');
}

function isDirectory(path) {
    return fs.statSync(path).isDirectory();
}

function createAsset(watchedPath, path, parentPath, relativePath, isDirectory) {
    var asset = {
        watchedPath: watchedPath,
        path: path,
        parentPath: parentPath,
        relativePath: relativePath,
        isDirectory: isDirectory
    };
    createdAssets.push(asset);
}

function findNotInsertedAssets(localSourcePaths, assetDetails) {
    var sourcePaths = [];
    for (var index in assetDetails) {
        sourcePaths.push(assetDetails[index].SOURCE_PATH);
    }
    var notInsertedAssets = localSourcePaths.filter(function (localPath) {
        return sourcePaths.indexOf(localPath) == -1;

    });
    return notInsertedAssets;
}

function insertAsset(createdAssets) {
    var deferred = q.defer();

    console.log('created assets are ', createdAssets);
    Promise.reduce(createdAssets, function (total, asset) {
        console.log('The asset is ', asset);
        console.log('repo is ', myRepository);
        var skipFlag = false;

        return myRepository.getAssetDetailsForPath(asset.path).then(function (records) {
            if (records.length == 0) {
                return myRepository.getAssetDetailsForPath(asset.parentPath);
            }
            else if (records.length != 0) {
                skipFlag = true;
                deferred.resolve();
                return deferred.promise;

            }
        }).then(function (records2) {
            if (skipFlag) {
                deferred.resolve();
                return deferred.promise;
            }
            else if (records2.length != 0 && !skipFlag) {
                parentAssetId = records2[0].ASSET_ID;
                return myRepository.insertAssets(asset.path, parentAssetId, 'assetId', 'uploaded', '1', 'securedUrl', 'createdDate', 'lastModifiedDate', asset.isDirectory, 'status');
            } else if (asset.parentPath === watchedPathSlashTrimmed) {
                return myRepository.insertAssets(asset.path, 'root', 'assetId', 'uploaded', '1', 'securedUrl', 'createdDate', 'lastModifiedDate', asset.isDirectory, 'status');
            } else {
                throw Error("Something bad has happened");

            }
        }).then(function () {
            console.log('YaY!!');
        });
    }, 0).then(function () {
        console.log('Inserted row');
    });
}
