'use strict';

var Heroku = require('heroku.node');
var client = new Heroku({
    email: process.env.HEROKU_EMAIL,
    api_key: process.env.HEROKU_KEY
});

if (process.env.HEROKU_ENDPOINT !== undefined) {
  client._rest_options.base_url = process.env.HEROKU_ENDPOINT;
  client.hook("pre:request", function(req_opts) {
    req_opts.strictSSL = false;
  
  });
}

function randomInt (low, high) {
  return Math.floor(Math.random() * (high - low) + low);
}

function restart_hammers() {
  var app_name = process.env.RESTART_APP_NAME;
  var max_interval = process.env.MAX_LIFETIME ? parseInt(process.env.MAX_LIFETIME) : 1800000;
  console.log("checking", app_name);

  client.app(app_name).dynos.list(function(err, data) {
    if (err !== null) {
      console.log(err, data);
    } else {
      data.forEach(function(dyno) {
        var ddiff = Date.now() - new Date(dyno.updated_at).getTime();
        console.log(dyno.name, ddiff);

        if(dyno.name.match(/hammer/) && (ddiff - max_interval) > randomInt(1000, 60000)) { //add 1sec-1min of jitter
          console.log(dyno.name, 'should restart');

          client.app(app_name).dyno(dyno.id).restart();
        }
      });
    }
  });
}

// check every 5 minutes
setInterval(restart_hammers, 1000*60);
