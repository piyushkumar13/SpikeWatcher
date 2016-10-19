var fs = require("fs");

// General function
var dive = function (dir, action) {
    // Assert that it's a function
    if (typeof action !== "function")
        action = function (error, file) {
        };

    // Read the directory
    fs.readdir(dir, function (err, list) {

        //for (var i = 0; i < list.length; i++) {
        //    if (list[i].startsWith(".")) {
        //        list.splice(list,1);
        //    }
        //}
        console.log("the list of files or directory", list);

        // Return the error if something went wrong
        if (err)
            return action(err);

        // For every file in the list
        list.forEach(function (file) {
            // Full path of that file
            var path = dir +'/'+ file;
            console.log('The file path is ', path);
            // Get the file's stats
            fs.stat(path, function (err, stat) {
                //console.log(stat);
                // If the file is a directory
                if (stat && stat.isDirectory())
                // Dive into the directory
                //console.log("The stat is ", stat);
                    dive(path, action);
                else
                // Call the action
                    action(null, path);
            });
        });
    });
};

dive("/Users/kumarp9/Downloads/samplewatcher/", function () {

});
