#!/usr/bin/env node

var commPlanUtil = require('../');
var minimist = require('minimist');
var fs = require('fs');

var argv = minimist(process.argv.slice(2), {
    alias: { h: 'help' },
});
if (argv.help) {
    fs.createReadStream(__dirname + '/usage.txt').pipe(process.stdout);
    return;
}

var baseDir = process.argv[2];
var output = process.argv[3];
commPlanUtil.packageCommPlan( process.cwd(), output );
