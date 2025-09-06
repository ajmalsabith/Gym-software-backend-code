const PlayersSubcriptionModel = require("../Model/PlayerSubscriptionModel");

// ✅ Create Trainer Subscription
const createPlayersSubcriptionPlan = async (req, res) => {
  try {
    const data = req.body;

    // Validate required fields
    if (!data.gymId || !data.trainerId || !data.planName || !data.price || !data.duration) {
      return res.status(400).json({ 
        success: false, 
        message: "gymId, trainerId, planName, price, and duration are required" 
      });
    }

    // Validate dates
    const startDate = data.startDate ? new Date(data.startDate) : new Date();
    const endDate = data.endDate ? new Date(data.endDate) : new Date(startDate.getTime() + (data.duration * 30 * 24 * 60 * 60 * 1000));

    if (isNaN(startDate) || isNaN(endDate)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid date format" 
      });
    }

    // Generate subscription ID
    const subscriptionId = await PlayersSubcriptionModel.generateSubscriptionId();

    const subscription = new PlayersSubcriptionModel({
      subscriptionId,
      gymId: data.gymId,
      trainerId: data.trainerId,
      planName: data.planName,
      planType: data.planType || "basic",
      price: data.price,
      duration: data.duration,
      startDate,
      endDate,
      status: data.status || "pending",
      features: data.features || [],
      description: data.description,
      isActive: data.isActive !== undefined ? data.isActive : true,
      paymentStatus: data.paymentStatus || "pending",
      autoRenew: data.autoRenew || false,
    });

    const savedSubscription = await subscription.save();
    
    res.status(201).json({ 
      success: true, 
      message: "Trainer subscription created successfully", 
      subscription: savedSubscription 
    });

  } catch (error) {
    console.error("Error creating trainer subscription:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error creating trainer subscription", 
      error: error.message 
    });
  }
};

// ✅ Update Trainer Subscription
const updatePlayersSubcriptionPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({ 
        success: false, 
        message: "Subscription ID is required" 
      });
    }

    // Validate dates if provided
    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate);
      if (isNaN(updateData.startDate)) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid start date format" 
        });
      }
    }

    if (updateData.endDate) {
      updateData.endDate = new Date(updateData.endDate);
      if (isNaN(updateData.endDate)) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid end date format" 
        });
      }
    }

    const result = await PlayersSubcriptionModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!result) {
      return res.status(404).json({ 
        success: false, 
        message: "Trainer subscription not found" 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: "Trainer subscription updated successfully", 
      subscription: result 
    });

  } catch (error) {
    console.error("Error updating trainer subscription:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error updating trainer subscription", 
      error: error.message 
    });
  }
};

// ✅ Delete Trainer Subscription
const deletePlayersSubcriptionPlan = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ 
        success: false, 
        message: "Subscription ID is required" 
      });
    }

    const result = await PlayersSubcriptionModel.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({ 
        success: false, 
        message: "Trainer subscription not found" 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: "Trainer subscription deleted successfully" 
    });

  } catch (error) {
    console.error("Error deleting trainer subscription:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error deleting trainer subscription", 
      error: error.message 
    });
  }
};

// ✅ Get Trainer Subscription by ID
const getPlayersSubcriptionPlanById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ 
        success: false, 
        message: "Subscription ID is required" 
      });
    }

    const subscription = await PlayersSubcriptionModel.findById(id)
      .populate('gymId', 'name gymId city state')
      .populate('trainerId', 'name email userId role');

    if (!subscription) {
      return res.status(404).json({ 
        success: false, 
        message: "Trainer subscription not found" 
      });
    }

    res.status(200).json({ 
      success: true, 
      subscription 
    });

  } catch (error) {
    console.error("Error fetching trainer subscription:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching trainer subscription", 
      error: error.message 
    });
  }
};

// ✅ Get All Trainer Subscriptions
const getAllPlayersSubcriptionPlans = async (req, res) => {
  try {
    const { gymId, status, page = 1, limit = 10 } = req.query;
    
    // Build filter
    const filter = {};
    if (gymId) filter.gymId = gymId;
    if (status) filter.status = status;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const subscriptions = await PlayersSubcriptionModel.find(filter)
      .populate('gymId', 'name gymId city state')
      .populate('trainerId', 'name email userId role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await PlayersSubcriptionModel.countDocuments(filter);

    res.status(200).json({ 
      success: true, 
      subscriptions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error("Error fetching trainer subscriptions:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching trainer subscriptions", 
      error: error.message 
    });
  }
};

// ✅ Get Trainer Subscriptions by Gym ID
const getPlayersSubcriptionPlansByGymId = async (req, res) => {
  try {
    const { gymId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    if (!gymId) {
      return res.status(400).json({ 
        success: false, 
        message: "Gym ID is required" 
      });
    }

    // Build filter
    const filter = { gymId };
    if (status) filter.status = status;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const subscriptions = await PlayersSubcriptionModel.find(filter)
      .populate('trainerId', 'name email userId role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await PlayersSubcriptionModel.countDocuments(filter);

    res.status(200).json({ 
      success: true, 
      subscriptions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error("Error fetching gym trainer subscriptions:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching gym trainer subscriptions", 
      error: error.message 
    });
  }
};

module.exports = {
  createPlayersSubcriptionPlan,
  updatePlayersSubcriptionPlan,
  deletePlayersSubcriptionPlan,
  getPlayersSubcriptionPlanById,
  getAllPlayersSubcriptionPlans,
  getPlayersSubcriptionPlansByGymId
};
