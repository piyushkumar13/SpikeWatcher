var existingAssetPaths = require('./Node_dir_Example');
var uploadToS3 = require('./UploadToS3');
var myRepository = require('./Repository');
var q = require('q');
var pathModule = require('path');
var fs = require('fs');
var localSourcePaths;
myRepository.createTable();
function main(watchedPath) {
    var tempWatchedPath = watchedPath;
    var assetDetails;
    var deferred = q.defer();
    existingAssetPaths.getPaths().then(function (paths) {
        localSourcePaths = paths;
        return myRepository.getAssetDetails();

    }, function (error) {

    }).then(function (value) {
        assetDetails = value;
        if (assetDetails.length == 0 && localSourcePaths.length == 0) {
            console.log('Start the chokidar');
        }
        else if (assetDetails.length == 0) {
            for (var index1 in localSourcePaths) {
                var relativePath1 = pathModule.relative(watchedPath, localSourcePaths[index1]);
                console.log("Creating file/directory", relativePath1);
                var rp1 = relativePath1.split(/[/\\]+/);
                console.log("rp path : ", rp1);
                var parentWatchedPath1;
                var newTempWatchedPath;
                for (var relativePathIndex1 in rp1) {
                    parentWatchedPath1 = tempWatchedPath;
                    tempWatchedPath = tempWatchedPath + rp1[relativePathIndex1] + "/";
                    if(tempWatchedPath.endsWith("/")){
                        newTempWatchedPath = tempWatchedPath.slice(0, -1);
                    }
                    createAssets(watchedPath, newTempWatchedPath, parentWatchedPath1, rp1[relativePathIndex1], isDirectory(newTempWatchedPath));
                    //sleep(5000);
                }
                tempWatchedPath = watchedPath;
                parentWatchedPath = '';
            }
        }
        else {
            for (var index in localSourcePaths) {
                for (var index2 in assetDetails) {
                    if (localSourcePaths[index] == assetDetails[index2].SOURCE_PATH) {
                        console.log("File/directory already existing in db");

                        //if (modifiedFile) then update the new version of the file.
                        // else dont do anything
                    } else {
                        var relativePath = pathModule.relative(watchedPath, localSourcePaths[index]);
                        console.log("Creating file/directory", relativePath);
                        var rp = relativePath.split(/[/\\]+/);
                        console.log("rp path : ", rp);
                        var parentWatchedPath;
                        for (var relativePathIndex in rp) {
                            parentWatchedPath = tempWatchedPath;
                            tempWatchedPath = tempWatchedPath + rp[relativePathIndex] + "/";
                            createAssets(watchedPath, tempWatchedPath, parentWatchedPath, rp[relativePathIndex], isDirectory(tempWatchedPath));
                            sleep(5000);
                        }
                        tempWatchedPath = watchedPath;
                        parentWatchedPath = '';

                    }
                }
                console.log('The inner loop over');
            }
        }
    }, function (error) {
        console.log("The error is ", error);
    });

}
var watchedPath = '/Users/kumarp9/Downloads/samplewatcher/';
main(watchedPath);
function isDirectory(path) {
    return fs.statSync(path).isDirectory();
}

function createAssets(watchedPath, path, parentPath, relativePath, isDirectory) {
    if (isDirectory) {
        console.log("Directory created with path %s and parent path %s", path, parentPath);
        // getRecords with path "path".
        // If records are there don't do anything else
        // getRecords with parentPath. If record is there then fine use it as the parentAsset of the current asset. If not
        // either of the condition happens. Parent is root or parent deleted. If parentPath == watchedPath then, Insert record with parentAssetId as root
        //else throw error
        // create directory
        // insert asset in the table.
        insertAssets(path, parentPath, watchedPath);
    }
    else {
        insertAssets(path, parentPath, watchedPath);
    }
    //return;
}

function insertAssets(path, parentPath, watchedPath) {
    var deferred = q.defer();
    var parentAssetId;
    myRepository.getAssetDetailsForPath(path).then(function (records) {
        if (!records) {
            return myRepository.getAssetDetailsForPath(parentPath);
        }
        else {
            deferred.resolve();
            return deferred.promise;
        }
    }).then(function (records2) {
        if (records2) {
            parentAssetId = records2.ASSET_ID;
            return myRepository.insertAssets(path, parentAssetId, 'assetId', 'uploaded', '1', 'securedUrl', 'createdDate', 'lastModifiedDate', isDirectory, 'status');
        } else {
            if (parentPath === watchedPath) {
                return myRepository.insertAssets(path, 'root', 'assetId', 'uploaded', '1', 'securedUrl', 'createdDate', 'lastModifiedDate', isDirectory, 'status');
            } else {
                throw Error("Something bad has happened");
            }
        }
    }).then(function(){
        console.log('Inserted row');
        return;
    });
    //return;
}



