const User = require("../Model/UserModel");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.AccessSecret || 'fallback_secret_key_for_development';    
const REFRESH_SECRET = process.env.RefreshSecret || 'fallback_refresh_secret_key_for_development';  

// Store refresh tokens (In production, use database or Redis)
const refreshTokens = {};

// Generate tokens
function generateTokens(user) {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: "30m" } // short expiry
  );

  const refreshToken = jwt.sign(
    { id: user.id, email: user.email },
    REFRESH_SECRET,
    { expiresIn: "7d" } // longer expiry
  );


  return { accessToken, refreshToken };
}

const refreshToken = (req, res) => {
  const { refreshToken: token } = req.body;

  if (!token) {
    return res.status(401).json({ success: false, message: "Refresh token required" });
  }

  // Check if token exists in our storage
  const userId = Object.keys(refreshTokens).find(key => refreshTokens[key] === token);
  if (!userId) {
    return res.status(403).json({ success: false, message: "Invalid refresh token" });
  }

  jwt.verify(token, REFRESH_SECRET, (err, user) => {
    if (err) {
      // Remove invalid token from storage
      delete refreshTokens[userId];
      return res.status(403).json({ success: false, message: "Token expired or invalid" });
    }

    const newAccessToken = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    return res.json({ 
      success: true, 
      accessToken: newAccessToken 
    });
  });
};


// ✅ Insert User (Gym Admin)
const InsertGymAdminUser = async (req, res) => {
  try {
    const data = req.body;

    // Generate next userId
    const lastUser = await User.findOne().sort({ createdAt: -1 }).exec();
    let nextUserId = "USER1";

    if (lastUser?.playerid) {
      const lastUserNumber = parseInt(lastUser.playerid.replace("USER", ""), 10) || 0;
      nextUserId = `USER${lastUserNumber + 1}`;
    }

    const user = new User({
      playerid: nextUserId,
      role: data.role,
      name: data.name,
      email: data.email,
      password: data.password, // ⚠️ You may want to hash with bcrypt
      phone: data.phone,
      gender: data.gender,
      age: data.age,
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

    // console.log(user,'userobj');
    

    const savedUser = await user.save();
    console.log(savedUser);
    
    res.status(201).json({ message: "User inserted successfully", user: savedUser });

  } catch (error) {
    console.log(error);
    
    res.status(500).json({ message: "Error inserting user", error: error.message });
  }
};

// ✅ Update User
const EditUser = async (req, res) => {
  try {

    
    const userid = req.body.id;
    const data = req.body.obj;

    const result = await User.updateOne(
      { playerid:userid},
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
    console.log(error);
    
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
    const { id } = req.query; // ge
    if (!id) {
      return res.status(400).json({ message: "User ID is required in body" });
    }

    const Users = await User.findById(id).populate("gymId").populate("subscriptionId")

    if (!Users) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({Users:Users});
  } catch (error) {
    console.error("Failed to get User by ID:", error);
    res.status(500).json({ message: "Error fetching User details", error: error.message });
  }
};



const GymAdminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email }).populate('gymId');
    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ success: false, message: "This user doesn't have trainer access" });
    }

    if (user.password !== password) {
      return res.status(400).json({ success: false, message: "Invalid password" });
    }

    const tokens = generateTokens({ id: user._id, email: user.email });

    // Store refresh token (in production, store in database)
    refreshTokens[user._id] = tokens.refreshToken;

    return res.json({ 
      success: true, 
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        gym: user.gymId
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
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
      
      // if(admin?.role!="admin"){
      //    return res.status(400).json({ message: "This user don't have login access" });
      // }
    }

    // 2️⃣ Check password
    if (admin.password !== password) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const tokens = generateTokens({ id:admin._id, email:admin.email});


    res.json({ message: "Login successful",tokens:tokens,Role:admin.role,Gymid:admin.gymId,UserId:admin._id});
  } catch (error) {
    console.log(error);
    
    res.status(500).json({ message: "Server error", error });
  }
 
}


const getGymPlayersListByGymid = async (req, res) => {
  try {
    const { gymId } = req.query; // get gymId from query param

    if (!gymId) {
      return res.status(400).json({ message: "gymId is required" });
    }

    const players = await User.find({ gymId})
      .populate("gymId")
      .populate("subscriptionId")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, players });
  } catch (error) {
    console.error("Error fetching players:", error);
    res.status(500).json({ message: "Error fetching Players List", error: error.message });
  }
};

// ✅ Create Gym Player with Subscription
const createGymPlayer = async (req, res) => {
  try {
    const data = req.body;

    

    // Validate required fields
    if (!data.name || !data.email || !data.phone || !data.gymId ) {
      return res.status(400).json({ 
        success: false, 
        message: "name, email, phone, gymId are required" 
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: "User with this email already exists" 
      });
    }


    // Generate next userId
    const lastUser = await User.findOne().sort({ createdAt: -1 }).exec();
    
    let nextUserId = "USER1";

    if (lastUser?.playerid) {
      const lastUserNumber = parseInt(lastUser.playerid.replace("USER", ""), 10) || 0;
      nextUserId = `USER${lastUserNumber + 1}`;
    }

    // Calculate age from DOB if provided
    let age = null;
    if (data.dob) {
      const birthDate = new Date(data.dob);
      const today = new Date();
      age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
    }

    const user = new User({
      playerid: nextUserId,
      role: data.role,
      name: data.name,
      email: data.email,
      password: data.password || "defaultPassword123", // You may want to generate a random password
      phone: data.phone,
      age: data.age || age,
      gender: data.gender,
      dob: data.dob ? new Date(data.dob) : null,
      line1: data?.line1,
      city: data?.city,
      district: data?.district,
      state: data?.state,
      country: data?.country,
      zip: data?.zip,
      gymId: data.gymId,
      IsStatus: data?.IsStatus || "active",
      photo: data?.photo,
    });

    const savedUser = await user.save();
    
    // Populate the saved user with gym and subscription details
    const populatedUser = await User.findById(savedUser._id)

    res.status(201).json({ 
      success: true, 
      message: "Gym player created successfully", 
      player: populatedUser 
    });

  } catch (error) {
    console.error("Error creating gym player:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error creating gym player", 
      error: error.message 
    });
  }
};


const updateGymPlayer = async (req, res) => {
  try {
    const { id } = req.params; // playerId
    const data = req.body;
    

    const player = await User.findById(id);
    if (!player) {
      return res.status(404).json({
        success: false,
        message: "Player not found",
      });
    }

    // If subscriptionId is provided, update subscription details
    // if (data.subscriptionId) {
    //   const subscription = await PlayerSubscription.findById(data.subscriptionId);
    //   if (!subscription) {
    //     return res.status(400).json({
    //       success: false,
    //       message: "Invalid subscription ID",
    //     });
    //   }

    //   data.subscriptionStatus = subscription.status;
    //   data.subscriptionStartDate = subscription.startDate;
    //   data.subscriptionEndDate = subscription.endDate;
    // }

    // Update player
    const updatedPlayer = await User.findByIdAndUpdate(id, data, {
      new: true,
    })
    res.status(200).json({
      success: true,
      message: "Player updated successfully",
      player: updatedPlayer,
    });
  } catch (error) {
    console.error("Error updating player:", error);
    res.status(500).json({
      success: false,
      message: "Error updating player",
      error: error.message,
    });
  }
};


// Logout function to revoke refresh token
const logout = (req, res) => {
  const { refreshToken: token } = req.body;
  
  if (!token) {
    return res.status(400).json({ success: false, message: "Refresh token required" });
  }

  // Find and remove the token from storage
  const userId = Object.keys(refreshTokens).find(key => refreshTokens[key] === token);
  if (userId) {
    delete refreshTokens[userId];
  }

  return res.json({ success: true, message: "Logged out successfully" });
};

// Get current user profile
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate('gymId')
      .select('-password'); // Exclude password from response

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    return res.json({ 
      success: true, 
      user: user 
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: "Error fetching user profile", 
      error: error.message 
    });
  }
};

module.exports = { 
    InsertGymAdminUser,
     EditUser, 
     GetUserList,
     GetUserById,
     ClientLoginWeb,
     GymAdminLogin,
     getGymPlayersListByGymid,
     createGymPlayer,
     refreshToken,
     logout,
     getCurrentUser,
     updateGymPlayer
 };
