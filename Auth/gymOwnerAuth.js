const jwt = require("jsonwebtoken");
const User = require("../Model/UserModel");
const Gym = require("../Model/gymModel");

const JWT_SECRET = process.env.AccessSecret; 

const authenticateGymOwner = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "Access token required" 
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user details from database
    const user = await User.findById(decoded.id).populate('gymId');
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Check if user is a trainer/gym owner
    if (user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied. Gym owner permissions required." 
      });
    }

    // Add user and gym information to request
    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
      gym: user.gymId
    };
    req.userId = user._id;
    req.gymId = user.gymId._id;
    
    next();
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ 
        success: false, 
        message: "Invalid token" 
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ 
        success: false, 
        message: "Token expired" 
      });
    } else {
      return res.status(500).json({ 
        success: false, 
        message: "Authentication error", 
        error: error.message 
      });
    }
  }
};

module.exports = authenticateGymOwner;
