var request = require('request');
//request('http://localhost:5000', function (error, response, body) {
request('http://52.91.123.230', function (error, response, body) {
  if (!error && response.statusCode == 200) {
    var content = JSON.parse(body);
    console.log(content) // Show the HTML for the Google homepage. 
    console.log(content.length);
  }
})
