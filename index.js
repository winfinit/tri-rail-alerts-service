var Twitter = require('twitter');
var async = require('async');
var express = require('express');
var debug = require('debug')('tri-rail-alerts');
var app = express();
try {
    var env = require('./.env.json');
    debug('using .env');
} catch(e) {
    // env is missing
    debug('.env is not available', e);
    var env = {};
}

Date.prototype.stdTimezoneOffset = function() {
    var jan = new Date(this.getFullYear(), 0, 1);
    var jul = new Date(this.getFullYear(), 6, 1);
    return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
}

Date.prototype.dst = function() {
    return this.getTimezoneOffset() < this.stdTimezoneOffset();
}

var TZ_OFFSET_HOURS = 5;
var today = new Date();
if ( today.dst() ) {
    TZ_OFFSET_HOURS = 4; 
}

var twitter_screen_names = ['trirailalerts'];
var twitter_ids = [];
var twitter_cache = [];
var response_cache = "";

app.get('/', function (req, res) {
  res.header("Content-Type",'application/json');
  res.send(response_cache);
});
 
var twitter_secret = {
  consumer_key: process.env.TWITTER_CONSUMER_KEY || env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET || env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY || env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET || env.TWITTER_ACCESS_TOKEN_SECRET
};

debug('twitter secret', twitter_secret);
var client = new Twitter(twitter_secret);
 
async.waterfall([
    function getUserIds(callback) {
      client.get('users/lookup', {screen_name: twitter_screen_names.join(',')}, function(err, res) {
        if(! err) {
          res.forEach(function(row) {
            twitter_ids.push(row.id);
          });
        }
        callback(err)
      });      
    },
    function getTimeline(callback) {
      client.get('statuses/user_timeline', 
        {
          screen_name: twitter_screen_names.join(',')
        }, function(err, tweets) {
        if (! err) {
          tweets.forEach(function(row) {
            addTweet(row); 
          });
        }
        callback(err);
      });      
    },
    function connectToStream(callback) {
      client.stream('statuses/filter', {follow: twitter_ids.join(',')}, function(stream) {
        stream.on('data', function(tweet) {
          if (! tweet.text.match(/^(RT |@)/) ) {
            addTweet(tweet);    
          }
        });
       
        stream.on('error', function(error) {
          console.error(error);
          throw error;
        });
        callback(null);
      });
    },
    function cleanOldRecords(callback) {
        cleanAlerts();
        callback(null);
    }
  ], function(err) {
    if (err) {
      console.error(err);
      throw err;
    }

    var server = app.listen(process.env.PORT || 3000, function () {
      var host = server.address().address;
      var port = server.address().port;

      console.log('Tri Rail Alerts Cache listening at http://%s:%s', host, port);
    });

});

//clean old tweets every hour
setInterval(cleanAlerts, 1000 * 60 * 60);

function cleanAlerts() {
  var today = new Date();
  // since TriRail is in south florida, we will be working with GMT-5000
  if ( today.getTimezoneOffset() == 0 ) {
    today.setSeconds(TZ_OFFSET_HOURS * 60 * 60);
  }
  twitter_cache.forEach(function(row, index) {
      var tweet_date = new Date(row.created_at);
      if ( tweet_date.getTimezoneOffset() == 0 ) {
        tweet_date.setSeconds(TZ_OFFSET_HOURS * 60 * 60)
      }
      if ( tweet_date.getDate() !== today.getDate() ) {
          delete twitter_cache[index];
      }
  });
  twitter_cache = twitter_cache.filter(Boolean);
  if ( twitter_cache.length > 1 ) {
    twitter_cache = twitter_cache.sort(function(a, b) {
        return new Date(b.created_at) - new Date(a.created_at); 
    });
  }
  response_cache = JSON.stringify(twitter_cache);
}

function addTweet(tweet) {
  twitter_cache.push({
    "text": tweet.text,
    "created_at": tweet.created_at,
    "user": {
      "screen_name": tweet.user.screen_name,
      "id": tweet.user.id
    }
  });  
  // to cache string response
  response_cache = JSON.stringify(twitter_cache);
}

