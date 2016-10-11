var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');

function IntegrationModel( conf ) {
	this.conf = conf;
	return this;
}

IntegrationModel.prototype.getPath = function() {
  	var integrationPath = path.join( 'src', 'integrations', this.conf.type, this.conf.name + '.js' );
	return integrationPath;
}

IntegrationModel.prototype.createScriptFile = function() {
  	var integrationPath = this.getPath();
  	mkdirp.sync( path.dirname( integrationPath ) );
  	fs.writeFileSync( integrationPath, this.conf.script );
}

IntegrationModel.prototype.loadScriptFile = function() {
	var contents = fs.readFileSync( this.getPath(), 'utf-8' );
	this.conf.script = contents;
}

function buildFromJSON( json ) {
	return new IntegrationModel( json );
}

exports.buildFromJSON = buildFromJSON;