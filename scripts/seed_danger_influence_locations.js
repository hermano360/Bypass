var mongoose = require('../config/mongo');
var DangerInfluenceLocation = require("../models/danger_influence_location");
var DangerInfluenceWeight = require("../models/danger_influence_weight");
var fs = require('fs');
var parse = require('csv-parse');
var dangerInfluenceLocationPath = __dirname + "/data_files/danger_influence_location_seed.csv";

fileBuffer = fs.readFileSync(dangerInfluenceLocationPath);
to_string = fileBuffer.toString();
split_lines = to_string.split("\n");
totalItemsInCSV = split_lines.length-1;
console.log("Total rows in csv: " + totalItemsInCSV.toString());

var csvData=[];
var savedRows = 0;
fs.createReadStream(dangerInfluenceLocationPath)
  .pipe(parse({delimiter: ','}))
  .on('data', function(csvRow) {
		console.log(csvRow);
		csvData.push({
      type: csvRow[0],
      latitude: Number(csvRow[1]),
      longitude: Number(csvRow[2]),
    });
  })
  .on('end',function() {
    console.log(csvData);
      DangerInfluenceLocation.insertMany(csvData, function(err, docs) {
				if (err) { console.log ('Error on save!') }
				else { process.exit(); }
      });
  });

