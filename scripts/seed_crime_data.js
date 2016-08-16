var mongoose = require('../config/mongo');
var InfluencerWeightModel = require("../models/influencer_weights");

var influencerWeight = new InfluencerWeightModel ({ influencer: 'assault', weight: 3 });
influencerWeight.save(function (err) {
  if (err) {
    console.log ('Error on save!')
  }
  else {
    process.exit();
  }
});
