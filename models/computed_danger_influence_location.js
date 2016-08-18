var mongoose = require('../config/mongo');

var computedDangerInfluenceLocationSchema = new mongoose.Schema({
  type: String,
  latitude: Number,
  longitude: Number,
  weight: Number
});

var computedDangerInfluenceLocation = mongoose.model('ComputedDangerInfluenceLocation', computedDangerInfluenceLocationSchema);

module.exports = computedDangerInfluenceLocation;
