var mongoose = require('../config/mongo');
var DangerInfluenceLocation = require("../models/danger_influence_location");
var DangerInfluenceWeight = require("../models/danger_influence_weight");
var ComputedDangerInfluenceLocation = require("../models/computed_danger_influence_location");

// create danger weights hash table/dictionary
var weights_ht = new Object();
DangerInfluenceWeight.find({}, function(err, result) {
  if (err) throw err;
   for (i=0;i<result.length;i++) {
     weights_ht[result[i]["type"]] = result[i]["weight"]
   };
});

var computedLocations = [];
DangerInfluenceLocation.find({}, function(err, result) {
  if (err) throw err;

	for (i=0;i<result.length;i++) {
    var current_hash = {}
    current_hash["type"] = result[i]["type"]
    current_hash["latitude"] = result[i]["latitude"]
    current_hash["longitude"] = result[i]["longitude"]
		current_hash["weight"] = weights_ht[current_hash["type"]]
    computedLocations.push(current_hash)
	};

	ComputedDangerInfluenceLocation.insertMany(computedLocations, function(err, docs) {
		if (err) { console.log ('Error on save!') }
		else { process.exit(); }
	});
});

