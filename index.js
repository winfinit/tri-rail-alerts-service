var Twitter = require('twitter');
var async = require('async');
var express = require('express');
var app = express();

var twitter_screen_names = ['trirailalerts'];
var twitter_ids = [];
var twitter_cache = [];

app.get('/', function (req, res) {
  res.json(twitter_cache);
});
 
var twitter_secret = {
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET 
};

var client = new Twitter(twitter_secret);

console.log(twitter_secret);
 
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
    }
  ], function(err) {
    if (err) {
      console.error(err);
      throw err;
    }

    var server = app.listen(process.env.PORT || 5000, function () {
      var host = server.address().address;
      var port = server.address().port;

      console.log('Tri Rail Alerts Cache listening at http://%s:%s', host, port);
    });

});

//clean old tweets every hour
setInterval(function() {
  var today = new Date();
  twitter_cache.forEach(function(row, index) {
      var tweet_date = new Date(row.created_at);
      if ( tweet_date.getDate() !== today.getDate() ) {
          delete twitter_cache[index];
      }
  });
  twitter_cache = twitter_cache.filter(Boolean);
}, 1000 * 60 * 60);


function addTweet(tweet) {
  twitter_cache.push({
    "text": tweet.text,
    "created_at": tweet.created_at,
    "user": {
      "screen_name": tweet.user.screen_name,
      "id": tweet.user.id
    }
  });  
}

