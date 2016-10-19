var fs = require('fs');



var file = fs.readFileSync('/Users/kumarp9/Downloads/samplewatcher/watcherfile.txt', 'utf8');
console.log(file);
console.log(typeof file);
/*
function(err, data){
    if(err){
        throw err;
    }
    var data = data
    console.log(data);
    console.log(typeof data);


}
var data = '';
var file1 = fs.createReadStream('/Users/kumarp9/Downloads/samplewatcher/watcherfile.txt');
file1.on('data', function(chunk) {
    data += chunk;
}).on('end', function() {
    //console.log(data);
    //console.log(typeof data);
});
if(data) console.log(data);
console.log('The stream is ', file);
console.log(typeof file.toString());
*/

