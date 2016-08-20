var express = require('express');
var app = express();
var mongoose = require('mongoose');
var promise = require('bluebird');
mongoose.Promise = promise;

if (app.get('env') == 'development') {
  mongoose.connect('mongodb://localhost:27017/bypass_development');
}

module.exports = mongoose;
