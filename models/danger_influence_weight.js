var mongoose = require('../config/mongo');

var dangerInfluenceWeightSchema = new mongoose.Schema({
  type: { type: String, unique: true },
  weight: Number
});

var dangerInfluenceWeight = mongoose.model('DangerInfluenceWeight', dangerInfluenceWeightSchema);

module.exports = dangerInfluenceWeight;
