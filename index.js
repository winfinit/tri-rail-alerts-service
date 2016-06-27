var alerts = require('tri-rail-alerts');
var async = require('async');
var express = require('express');
var debug = require('debug')('tri-rail-alerts');
var app = express();

var cache = [];

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();      
});

app.get('/', function (req, res) {
  res.header("Content-Type",'application/json');
  res.send(cache);
});

updateAlerts();

var server = app.listen(process.env.PORT || 3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Tri Rail Alerts Cache listening at http://%s:%s', host, port);
});


setInterval(function() {
    updateAlerts();
}, 60 * 1000);

function updateAlerts() {
  // filter some text
  alerts.getAlerts(function(data) {
    cache = [];
    data.forEach(function(row) {
        var text = row.text.replace(/VIP Bulletin for Tri- Rail /i, '');
        text = text.replace(/(\d+)'/, '$1 minutes');
        text = text.replace('NB', 'Northbound');
        text = text.replace('SB', 'Southbound');
        text = text.replace(/Update:\s+/i, '');
        
        cache.push({
          "text": text,
          "time": row.time
        });  
    });
  });
}

