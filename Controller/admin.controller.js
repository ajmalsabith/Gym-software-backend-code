
const Admin = require("../Model/AdminModel");
const jwt = require("jsonwebtoken");

const AdminLogin = async (req, res) => {
    try {
    const { username, password } = req.body;

  
    // 1️⃣ Check if admin exists
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(400).json({ message: "User not found" });
    }

    // 2️⃣ Check password
    if (admin.password !== password) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // 3️⃣ Generate Token
    const token = jwt.sign(
      { id: admin._id, username: admin.username, isAdmin: admin.isAdmin },
      "AdminTokenSecretKey",
    );

    res.json({ message: "Login successful", token, Role:"Admin"});
  } catch (error) {
    console.log(error);
    
    res.status(500).json({ message: "Server error", error });
  }
 
}


module.exports={
    AdminLogin
}
