var express = require('express');
var app = express();
var port = process.env.PORT || 8080;
var mongoose = require('mongoose');
var promise = require('bluebird');
var fs = require('fs');

app.set('view engine', 'ejs');
app.use(express.static('public'));

if (app.get('env') == 'development') {
  mongoose.Promise = promise;
  mongoose.connect('mongodb://localhost:27017/bypass_development');
}

fs.readdirSync(__dirname + '/models').forEach(function(filename) {
  if (~filename.indexOf('.js')) require(__dirname + '/models/' + filename)
});

app.get('/database_test', function(req, res) {
  mongoose.model('InfluencerWeight').find(function(err, influencer_weights) {
    res.send(influencer_weights);
  });
});

app.get('/', function(req, res) {
	res.status(200).render('esri_testing');
});

app.listen(port);
console.log("Listening to port", port);
