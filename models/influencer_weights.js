var mongoose = require('../config/mongo');

var influencerWeightSchema = new mongoose.Schema({
  influencer: String,
  weight: Number
});

var InfluencerWeightModel = mongoose.model('InfluencerWeight', influencerWeightSchema);

module.exports = InfluencerWeightModel;
