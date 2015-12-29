This is a simple express application that utilizing SFRTA's Tri-Rail twitter alerts feed, and exposes same information in JSON format. It has few features, such as alerts expiration.

I dont expect anyone to actually use this besides myself, but just in case, to start a server you would need to define environment variables:

## TWITTER_CONSUMER_KEY
## TWITTER_CONSUMER_SECRET
## TWITTER_ACCESS_TOKEN_KEY
## TWITTER_ACCESS_TOKEN_SECRET 

# Sample request/response:

```javascript
var request = require('request');
request('http://52.91.123.230', function (error, response, body) {
  if (!error && response.statusCode == 200) {
    var content = JSON.parse(body);
    console.log(content) 
  }
})
/*
[ { text: 'VIP Bulletin for Tri- Rail Bike car today on trains:P604, P615, P620, P627, P632 and P643. Call 1-800-TRI-RAIL to confirm',
    created_at: 'Tue Dec 29 09:23:36 +0000 2015',
    user: { screen_name: 'TriRailAlerts', id: 3026895459 } },
  { text: 'VIP Bulletin for Tri- Rail Bike car today on trains P601, P610, P619, P628, P639, and P646. Call 1-800-TRI-RAIL to confirm',
    created_at: 'Tue Dec 29 09:26:53 +0000 2015',
    user: { screen_name: 'TriRailAlerts', id: 3026895459 } },
  { text: 'VIP Bulletin for Tri- Rail SB train P625 is 13\' late to SHE.',
    created_at: 'Tue Dec 29 18:36:48 +0000 2015',
    user: { screen_name: 'TriRailAlerts', id: 3026895459 } },
  { text: 'ATTN RIDERS: @Tri_Rail will operate on a normal, weekday schedule this Thursday, Dec. 31 and a weekend/holiday schedule on Friday, January 1',
    created_at: 'Tue Dec 29 20:10:43 +0000 2015',
    user: { screen_name: 'TriRailAlerts', id: 3026895459 } } ]
*/
```

```bash
$ curl -X GET http://52.91.123.230
[{"text":"VIP Bulletin for Tri- Rail Bike car today on trains:P604, P615, P620, P627, P632 and P643. Call 1-800-TRI-RAIL to confirm","created_at":"Tue Dec 29 09:23:36 +0000 2015","user":{"screen_name":"TriRailAlerts","id":3026895459}},{"text":"VIP Bulletin for Tri- Rail Bike car today on trains P601, P610, P619, P628, P639, and P646. Call 1-800-TRI-RAIL to confirm","created_at":"Tue Dec 29 09:26:53 +0000 2015","user":{"screen_name":"TriRailAlerts","id":3026895459}},{"text":"VIP Bulletin for Tri- Rail SB train P625 is 13' late to SHE.","created_at":"Tue Dec 29 18:36:48 +0000 2015","user":{"screen_name":"TriRailAlerts","id":3026895459}},{"text":"ATTN RIDERS: @Tri_Rail will operate on a normal, weekday schedule this Thursday, Dec. 31 and a weekend/holiday schedule on Friday, January 1","created_at":"Tue Dec 29 20:10:43 +0000 2015","user":{"screen_name":"TriRailAlerts","id":3026895459}}]
```

# to start express app

```bash
node index.js
// or
pm2 start index.js
```


