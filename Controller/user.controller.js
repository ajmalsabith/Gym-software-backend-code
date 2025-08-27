const User = require("../Model/UserModel");
const jwt = require("jsonwebtoken");

const JWT_SECRET =process.env.AccessSecret;    
const REFRESH_SECRET = process.env.RefreshSecret;  

// Generate tokens
function generateTokens(user) {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: "15m" } // short expiry
  );

  const refreshToken = jwt.sign(
    { id: user.id, email: user.email },
    REFRESH_SECRET,
    { expiresIn: "7d" } // longer expiry
  );


  return { accessToken, refreshToken };
}

const refreshToken = (req, res) => {
  const { refresh } = req.body;

  if (!refresh) {
    return res.status(401).json({ message: "Refresh token required" });
  }
  if (!refreshTokens.includes(refresh)) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }

  jwt.verify(refresh, REFRESH_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Token expired" });

    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    return res.json({ access: accessToken });
  });
};


// ✅ Insert User
const InsertUser = async (req, res) => {
  try {
    const data = req.body;

    // Generate next userId
    const lastUser = await User.findOne().sort({ createdAt: -1 }).exec();
    let nextUserId = "USER1";

    if (lastUser?.userId) {
      const lastUserNumber = parseInt(lastUser.userId.replace("USER", ""), 10) || 0;
      nextUserId = `USER${lastUserNumber + 1}`;
    }

    const user = new User({
      userId: nextUserId,
      role: data.role,
      name: data.name,
      email: data.email,
      password: data.password, // ⚠️ You may want to hash with bcrypt
      phone: data.phone,
      gender: data.gender,
      dob: data.dob ? new Date(data.dob) : null,
        line1: data?.line1,
        city: data?.city,
        district: data?.district,
        state: data?.state,
        country: data?.country,
        zip: data?.zip,
      IsStatus:data?.IsStatus,
      photo:data?.photo,
      gymId: data.gymId,
    });

    console.log(user,'userobj');
    

    const savedUser = await user.save();
    res.status(201).json({ message: "User inserted successfully", user: savedUser });

  } catch (error) {
    res.status(500).json({ message: "Error inserting user", error: error.message });
  }
};

// ✅ Update User
const EditUser = async (req, res) => {
  try {
    const userId = req.body.id;
    const data = req.body.obj;

    const result = await User.updateOne(
      { userId },
      { $set: data },
      { runValidators: true }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    if (result.modifiedCount === 0) {
      return res.status(200).json({ message: "No changes made to the user" });
    }

    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating user", error: error.message });
  }
};

// ✅ Get User List
const GetUserList = async (req, res) => {
  try {
    const users = await User.find().populate("gymId").sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user list", error: error.message });
  }
};

const GetUserById = async (req, res) => {
  try {
    const { id } = req.body; // get id from body

    if (!id) {
      return res.status(400).json({ message: "User ID is required in body" });
    }

    const Users = await User.findById(id);

    if (!Users) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(Users);
  } catch (error) {
    console.error("Failed to get User by ID:", error);
    res.status(500).json({ message: "Error fetching User details", error: error.message });
  }
};



const ClientLoginWeb = async (req, res) => {
    try {
    const { email, password } = req.body;

    

    // 1️⃣ Check if admin exists
    const admin = await User.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: "User not found" });
    }else{
      console.log(admin);
      
      if(admin?.role!="admin"){
         return res.status(400).json({ message: "This user don't have login access" });
      }
    }

    // 2️⃣ Check password
    if (admin.password !== password) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const tokens = generateTokens({ id:admin._id, email:admin.email});


    res.json({ message: "Login successful",tokens:tokens, Role:"Client"});
  } catch (error) {
    console.log(error);
    
    res.status(500).json({ message: "Server error", error });
  }
 
}
module.exports = { 
    InsertUser,
     EditUser, 
     GetUserList,
     GetUserById,
     ClientLoginWeb,
     refreshToken
 };
