const dotenv= require('dotenv').config()
const API_KEY = process.env.apikey; 



const verifyApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey || apiKey !== API_KEY) {
    return res.status(403).json({ message: 'Invalid API key' });
  }
  
  next();
};

module.exports = verifyApiKey;
