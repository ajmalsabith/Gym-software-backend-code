const mongoose = require('mongoose');

const indiaCitiesSchema = new mongoose.Schema({
  city: String,
  lat: String,
  lng: String,
  country: String,
  iso2: String,
  admin_name: String,
  capital: String,
  population: String,
  population_proper: String
}, { collection: 'indiacities' }); // exact collection name in MongoDB

module.exports = mongoose.model('IndiaCities', indiaCitiesSchema);
