var fs = require('fs');
var path = require('path');

var doesFileExist = function( filepath ) {
  var err;
  try {
    var stat = fs.statSync( filepath );
  } catch ( e ) {
    err = e;
  }
  if( (typeof err !== 'undefined' && err !== null) ) {
  	console.log( filepath + ' does not exist' );
    return false;
  } else {
  	return true;
  }
};

var deleteFolderRecursive = function( dirPath ) {
  if( fs.existsSync( dirPath ) ) {
    fs.readdirSync( dirPath ).forEach(function(file,index){
      var subPath = path.join( dirPath, file );
      if(fs.lstatSync(subPath).isDirectory()) { // recurse
        deleteFolderRecursive(subPath);
      } else { // delete file
        fs.unlinkSync(subPath);
      }
    });
    fs.rmdirSync( dirPath );
  }
};

exports.doesFileExist = doesFileExist;
exports.deleteFolderRecursive = deleteFolderRecursive;