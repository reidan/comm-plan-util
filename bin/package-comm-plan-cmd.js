#!/usr/bin/env node

var commPlanUtil = require('../');
var minimist = require('minimist');
var fs = require('fs');

var argv = minimist(process.argv.slice(2), {
    alias: { 
    	h: 'help',
    	o: 'outputFilename'
    }
});
if (argv.help) {
    fs.createReadStream(__dirname + '/usage.txt').pipe(process.stdout);
    return;
}

var outputFilename = "communication-plan-" + (new Date()).getTime();
if( argv.outputFilename ) {
	outputFilename = argv.outputFilename;
}
commPlanUtil.packageCommPlan( outputFilename );
