const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.AccessSecret; 

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: "Access token required" 
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        message: "Token invalid or expired" 
      });
    }
    
    // Extract user information from token and add to request
    req.user = {
      id: decoded.id,
      email: decoded.email
    };
    req.userId = decoded.id; // Direct access to user ID
    
    next();
  });
}

module.exports = authenticateToken;
