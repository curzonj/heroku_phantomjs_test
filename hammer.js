'use strict';

var url = process.env.HAMMER_URL;
var PHANTOM_PATH = process.env.PHANTOM_PATH || 'phantomjs';
var MAX_PHANTOM_PROCS = process.env.MAX_PHANTOM_PROCS ? parseInt(process.env.MAX_PHANTOM_PROCS) : 5;

var phantoms = 0;
var phantom_ids = 0;

var request = require("request");
var spawn = require('child_process').spawn;


function hammer_time() {
    phantoms++;
    var myid = phantom_ids++;

    console.log("requesting", myid);
    request(url, function(error, response, body) {
        console.log("phantom", myid);
        var ps = spawn(PHANTOM_PATH,['--ignore-ssl-errors=true',
                    '--ssl-protocol=any', 'phantomscript.js']);

        ps.stdout.pipe(process.stdout);
        ps.stderr.pipe(process.stderr);

        ps.on('close', function (code, signal) {
            console.log("exit", myid, code, signal);
            phantoms--;
        });
    });
}

function launch_hammers() {
    console.log("checking phantom limit", phantoms);
    while (phantoms < MAX_PHANTOM_PROCS) {
        hammer_time();
    }

    setInterval(launch_hammers, 500);
}

launch_hammers();

/*
cleanup: ./node_modules/.bin/forever cleanup.js
*/
