var mongoose = require('../config/mongo');
var DangerInfluenceLocation = require("../models/danger_influence_location");
var DangerInfluenceWeight = require("../models/danger_influence_weight");
var fs = require('fs');

// create danger weights hash table/dictionary
var weights_ht = new Object();
DangerInfluenceWeight.find({}, function(err, result) {
  if (err) throw err;
   for (i=0;i<result.length;i++) {
     weights_ht[result[i]["type"]] = result[i]["weight"]
   };
});

var computedLocations = "";
DangerInfluenceLocation.find({}, function(err, result) {
  if (err) throw err;

	for (i=0;i<result.length;i++) {
    computedLocations = computedLocations + result[i]["type"] + "," + result[i]["latitude"] + "," + result[i]["longitude"] + "," + weights_ht[result[i]["type"]] + '\n'

  };

  fs.writeFile(__dirname + "/../public/cached_danger_influences.csv", computedLocations, function(err) {
    if(err) { return console.log(err); }
    console.log("The file was saved!");
    process.exit();
  });
});

// If you ever wanted to store the computed values
//var mongoose = require('../config/mongo');
//
//var computedDangerInfluenceLocationSchema = new mongoose.Schema({
//  type: String,
//  latitude: Number,
//  longitude: Number,
//  weight: Number
//});
//
//var computedDangerInfluenceLocation = mongoose.model('ComputedDangerInfluenceLocation', computedDangerInfluenceLocationSchema);
//
//module.exports = computedDangerInfluenceLocation;
//
//  ComputedDangerInfluenceLocation.insertMany(computedLocations, function(err, docs) {
//    if (err) { console.log ('Error on save!') }
//    else { process.exit(); }
//  });

