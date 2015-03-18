/* global phantom: true */
'use strict';

console.log("phantomscript up");

var system = require('system');
var page = require('webpage').create();

var url = system.env.HAMMER_URL;

page.open(url, function(status) {
  console.log("phantomscript going down");
  phantom.exit();
});
