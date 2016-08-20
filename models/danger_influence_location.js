var mongoose = require('../config/mongo');

var dangerInfluenceLocationSchema = new mongoose.Schema({
  type: String,
  latitude: Number,
  longitude: Number
});

var dangerInfluenceLocation = mongoose.model('DangerInfluenceLocation', dangerInfluenceLocationSchema);

module.exports = dangerInfluenceLocation;
