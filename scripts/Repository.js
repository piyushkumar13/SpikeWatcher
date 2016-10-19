var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('SpikeAssetdb');
var q = require('q');
module.exports = {
    createTable: function () {
        db.serialize(function () {

            db.run("CREATE TABLE if not exists asset_details(ID INTEGER PRIMARY KEY AUTOINCREMENT, SOURCE_PATH TEXT, PARENT_ASSET_ID TEXT, ASSET_ID TEXT, UPLOAD_STATUS TEXT, VERSION TEXT, SECURED_URL, CREATED_DATE TEXT ,LAST_MODIFIED_DATE TEXT, IS_DIRECTORY TEXT, STATUS TEXT )");

        });
    },

    insertAssets: function (source_path, parent_asset_id, asset_id, upload_status, version, secured_url, created_date, last_modified_date, isDirectory, status) {
        var deferred = q.defer();
        db.serialize(function () {
            var stmt = db.prepare("INSERT INTO asset_details(SOURCE_PATH, PARENT_ASSET_ID, ASSET_ID, UPLOAD_STATUS, VERSION, SECURED_URL, CREATED_DATE, LAST_MODIFIED_DATE, IS_DIRECTORY, STATUS) VALUES(?,?,?,?,?,?,?,?,?,?)");
            stmt.run(source_path, parent_asset_id, asset_id, upload_status, version, secured_url, created_date, last_modified_date, isDirectory, status, function(err,row,a,b){
                console.log("The err obj",err);
                console.log("The row obj",row);
                console.log("The a obj",a);
                console.log("The b obj",b);
            });
            stmt.finalize();
            deferred.resolve();
        });
        return deferred.promise;
    },

    getAssetDetails: function () {
        var deferred = q.defer();
        var assetDetails = [];
        var asset = {};
        db.serialize(function () {
            db.all("SELECT * from asset_details", function (err, rows) {

                deferred.resolve(rows);
            });

        });
        return deferred.promise;
    },

    getAssetDetailsForPath: function (path) {

        var deferred = q.defer();
        var assetDetails = [];
        var asset = {};
        db.serialize(function () {
            db.all("SELECT * from asset_details WHERE SOURCE_PATH = " + path, function (err, rows) {

                deferred.resolve(rows);
            });

        });
        return deferred.promise;

    }

};
