var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var influencerWeightSchema = new Schema({
  influencer: String,
  weight: Number
});

var InfluencerWeight = mongoose.model('InfluencerWeight', influencerWeightSchema);

var testWeight = new InfluencerWeight({
  influencer: "test influencer",
  weight: 2
});

testWeight.save(function(err, thor) {
  if (err) return console.error(err);
  //console.dir(thor);
  console.log("HAI");
});
