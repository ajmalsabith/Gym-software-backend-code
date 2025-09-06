const User = require("../Model/UserModel");

// ✅ Create Gym Trainer
const createGymTrainer = async (req, res) => {
  try {
    const data = req.body;

    // Validate required fields
    if (!data.name || !data.email || !data.phone || !data.gymId) {
      return res.status(400).json({ 
        success: false, 
        message: "name, email, phone, and gymId are required" 
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

    if (lastUser?.userId) {
      const lastUserNumber = parseInt(lastUser.userId.replace("USER", ""), 10) || 0;
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

    const trainer = new User({
      userId: nextUserId,
      role: "trainer",
      name: data.name,
      email: data.email,
      password: data.password || "defaultPassword123", // You may want to generate a random password or hash it
      phone: data.phone,
      age: age || data.age,
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

    const savedTrainer = await trainer.save();
    
    // Populate the saved trainer with gym details
    const populatedTrainer = await User.findById(savedTrainer._id)
      .populate("gymId", "name gymId city state");

    res.status(201).json({ 
      success: true, 
      message: "Gym trainer created successfully", 
      trainer: populatedTrainer 
    });

  } catch (error) {
    console.error("Error creating gym trainer:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error creating gym trainer", 
      error: error.message 
    });
  }
};

// ✅ Get All Trainers by Gym ID
const getAllTrainersByGymId = async (req, res) => {
  try {
    const { gymId } = req.query; // get gymId from query param

    if (!gymId) {
      return res.status(400).json({ 
        success: false, 
        message: "gymId is required" 
      });
    }

    const trainers = await User.find({ gymId, role: "trainer" })
      .populate("gymId", "name gymId city state")
      .sort({ createdAt: -1 });

    res.status(200).json({ 
      success: true, 
      trainers,
      totalCount: trainers.length 
    });
    
  } catch (error) {
    console.error("Error fetching trainers:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching trainers list", 
      error: error.message 
    });
  }
};

// ✅ Get Single Trainer by ID
const getTrainerById = async (req, res) => {
  try {
    const { id } = req.params;

    const trainer = await User.findById(id)
      .populate("gymId", "name gymId city state");

    if (!trainer) {
      return res.status(404).json({ 
        success: false, 
        message: "Trainer not found" 
      });
    }

    if (trainer.role !== "trainer") {
      return res.status(400).json({ 
        success: false, 
        message: "User is not a trainer" 
      });
    }

    res.status(200).json({ 
      success: true, 
      trainer 
    });

  } catch (error) {
    console.error("Error fetching trainer:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching trainer", 
      error: error.message 
    });
  }
};

// ✅ Update Trainer
const updateTrainer = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    // Find trainer first
    const trainer = await User.findById(id);
    
    if (!trainer) {
      return res.status(404).json({ 
        success: false, 
        message: "Trainer not found" 
      });
    }

    if (trainer.role !== "trainer") {
      return res.status(400).json({ 
        success: false, 
        message: "User is not a trainer" 
      });
    }

    // Calculate age from DOB if provided
    if (data.dob) {
      const birthDate = new Date(data.dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      data.age = age;
    }

    const updatedTrainer = await User.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).populate("gymId", "name gymId city state");

    res.status(200).json({ 
      success: true, 
      message: "Trainer updated successfully", 
      trainer: updatedTrainer 
    });

  } catch (error) {
    console.error("Error updating trainer:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error updating trainer", 
      error: error.message 
    });
  }
};

// ✅ Delete Trainer (Soft delete by setting IsStatus to inactive)
const deleteTrainer = async (req, res) => {
  try {
    const { id } = req.params;

    const trainer = await User.findById(id);
    
    if (!trainer) {
      return res.status(404).json({ 
        success: false, 
        message: "Trainer not found" 
      });
    }

    if (trainer.role !== "trainer") {
      return res.status(400).json({ 
        success: false, 
        message: "User is not a trainer" 
      });
    }

    // Soft delete by setting IsStatus to inactive
    await User.findByIdAndUpdate(id, { IsStatus: "inactive" });

    res.status(200).json({ 
      success: true, 
      message: "Trainer deactivated successfully" 
    });

  } catch (error) {
    console.error("Error deleting trainer:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error deleting trainer", 
      error: error.message 
    });
  }
};

module.exports = {
  createGymTrainer,
  getAllTrainersByGymId,
  getTrainerById,
  updateTrainer,
  deleteTrainer
};
