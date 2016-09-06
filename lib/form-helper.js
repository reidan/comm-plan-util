var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var mkdirp = require('mkdirp');
var walk = require('walk');

var forms = {};
var locationsWalked = [];

var loadForms = function( metadataPath ) {
	console.log( 'Loading ' + metadataPath );
	var walkerOptions = {
		listeners: {
			file: function( root, stat, next ){ 
				var contents = fs.readFileSync( path.join( root, stat.name ), 'utf-8' );
				var formJSON = JSON.parse( contents );
				forms[ formJSON.name ] = formJSON;
				next(); 
			},
			end: function( root, stat, next ){ 
				locationsWalked.push( metadataPath );
			}
		},
		followLinks: false
	};
	var formWalker = walk.walkSync( metadataPath, walkerOptions );
};

var getProperties = function( formName ) {
	if( forms.hasOwnProperty( formName ) ) {
		if( forms[ formName ].hasOwnProperty( 'propertiesByName' ) ) {
			return forms[ formName ].propertiesByName; 
		} else {
			var formProps = {};
			_.each( forms[ formName ].layoutSections, function( section ){
				_.merge( formProps, _.keyBy( section.sectionItems, 'propertyName' ) );
			} );
			forms[ formName ].propertiesByName = formProps;
			return formProps;
		}
	} else {
		console.log( locationsWalked );
		throw 'Unable to find form: ' + formName;
	}
};

exports.loadForms = loadForms;
exports.getProperties = getProperties;