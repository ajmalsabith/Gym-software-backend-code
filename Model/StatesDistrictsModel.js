// stateDistricts.model.js
const mongoose = require('mongoose');

const stateDistrictsSchema = new mongoose.Schema({
  state: { type: String, required: true },
  districts: { type: [String], required: true }
}, { collection: 'States-Districts' });

module.exports = mongoose.model('StateDistricts', stateDistrictsSchema);

