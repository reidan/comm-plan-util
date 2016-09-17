#!/usr/bin/env node

var AlderaanMessageBuilder = require('../');
var minimist = require('minimist');
var fs = require('fs');
var os = require('os');
var path = require('path');

var argv = minimist(process.argv.slice(2), {
    alias: { 
    	h: 'help',
    	c: 'config',
    	t: 'templates'
     }
});

if (argv.help) {
    fs.createReadStream(__dirname + '/messages-usage.txt').pipe(process.stdout);
    return;
}
var config = path.join( '.', 'conf', 'message-config.json' );
if( argv.config ) {
	config = argv.config;  
}
var templates = path.join( os.homedir(), 'message-builder',  'templates' );
if( argv.templates ) {
	templates = argv.templates;  
}

var configPath = config;
var templatesPath = templates;
try {
	AlderaanMessageBuilder.buildMessagesFromConfig( configPath, templatesPath );
	console.log( 'SUCCESS: Generated Messages based on configuration, templates and metadata.' );
} catch ( e ) {
	console.log( 'ERROR: ' + e );
}