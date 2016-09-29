/**
 * Created by Piyush Kumar on 28/09/16.
 */
/**
 * Don't hard-code your credentials!
 * Export the following environment variables instead:
 *
 * export AWS_ACCESS_KEY_ID='AKID'
 * export AWS_SECRET_ACCESS_KEY='SECRET'
 * Set your region for future requests.
 * AWS.config.region = 'us-east-1';
 */

var AWS = require('aws-sdk');
var fs = require('fs');
AWS.config.region = 'us-east-1';
var s3obj = new AWS.S3();
module.exports = {

    checkAndCreateBuckets: function () {

            s3obj.listBuckets(function (err, data) {
                    if (err) {
                        console.log("Error in list buckets :::");
                        console.log("Error:", err);
                    }
                    else {
                        var flag = false;
                        for (var index in data.Buckets) {
                            var bucket = data.Buckets[index];
                            if (bucket.Name == 'piyush_bucket') {
                                flag = true;
                            }
                        }
                        if (flag == false) {
                            //createBucket();
                            s3obj.createBucket(function () {
                                var params = {Bucket: 'piyush_bucket'};
                                s3obj.createBucket(params, function (err, data) {
                                    if (err) {
                                        console.log("Error uploading data: ", err);
                                    } else {
                                        console.log("Successfully uploaded data to myBucket/myKey");
                                    }
                                });
                            })
                        }
                    }
                }
            );
    } ,
    uploadBucket: function (name, relativepath) {

        var body = fs.createReadStream(name);
        var params = {Bucket: 'piyush_bucket', Key: relativepath, Body: body};
        s3obj.upload(params, function (err, data) {
            if (err) {
                console.log("Error in upload bucket ::: ");
                console.log(err, err.stack);
            } // an error occurred
            else {
                console.log(data);
            }       // successful response
        });
    }
};