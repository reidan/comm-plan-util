var fs = require('fs');

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

exports.doesFileExist = doesFileExist;