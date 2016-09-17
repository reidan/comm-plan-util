#!/usr/bin/env node

var AlderaanMessageBuilder = require('../');
var minimist = require('minimist');
var fs = require('fs');
var os = require('os');
var path = require('path');

var argv = minimist(process.argv.slice(2), {
    alias: { 
    	h: 'help',
    	c: 'configFile',
    	t: 'templatesDir',
    	p: 'projectRoot'
     }
});

if (argv.help) {
    fs.createReadStream(__dirname + '/messages-usage.txt').pipe(process.stdout);
    return;
}
var configFile = path.join( '.', 'conf', 'message-config.json' );
if( argv.configFile ) {
	configFile = argv.configFile;  
}
var templatesPath = path.join( os.homedir(), 'message-builder',  'templates' );
if( argv.templatesPath ) {
	templatesPath = argv.templatesPath;  
}

var projectRoot = process.cwd();
if( argv.projectRoot ) {
	projectRoot = argv.projectRoot;
}

try {
	AlderaanMessageBuilder.buildMessagesFromConfig( configFile, templatesPath, projectRoot );
	console.log( 'SUCCESS: Generated Messages based on configuration, templates and metadata.' );
} catch ( e ) {
	console.log( 'ERROR: ' + e );
}