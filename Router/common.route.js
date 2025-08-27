// routes/location.routes.js
const express = require('express');
const CommonApiRoutes = express.Router();
const StateDistricts = require('../Model/StatesDistrictsModel');
const IndiaCities = require('../Model/IndiaCitiesModel');

// GET all states with districts
CommonApiRoutes.get('/states-districts', async (req, res) => {
  try {
    const data = await StateDistricts.find({});
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch states and districts' });
  }
});

// GET all cities
CommonApiRoutes.get('/india-cities', async (req, res) => {
  try {
    const data = await IndiaCities.find({})
    
    res.json(data);
  } catch (err) {
    
    res.status(500).json({ error: 'Failed to fetch cities' });
  }
});






module.exports = CommonApiRoutes;
