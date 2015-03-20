'use strict';

var Heroku = require('heroku.node');
var client = new Heroku({
    email: process.env.HEROKU_EMAIL,
    api_key: process.env.HEROKU_KEY
});

function restart_hammers() {
  var app_name = process.env.RESTART_APP_NAME;
  var max_interval = process.env.MAX_LIFETIME ? parseInt(process.env.MAX_LIFETIME) : 1800000;

  client.app(app_name).dynos.list(function(err, data) {
    data.forEach(function(dyno) {
      var ddiff = Date.now() - new Date(dyno.updated_at).getTime();
      console.log(dyno.name, ddiff);

      if(dyno.name.match(/hammer/) && ddiff > max_interval) { // 30min
        console.log(dyno.name, 'should restart');

        client.app(app_name).dyno(dyno.id).restart();
      }
    });
  });
}

// check every 5 minutes
setInterval(restart_hammers, 1000*60*5);
