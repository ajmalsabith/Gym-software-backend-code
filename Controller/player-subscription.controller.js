const GymPlayerPlan = require("../Model/GymPlayerSubscriptionModel")

const createGymPlayerPlan = async (req, res) => {
  try {
    const { gymId, planName, durationInMonths, price, features, status,planType} = req.body;

    if (!gymId || !planName || !durationInMonths || !price) {
      return res.status(400).json({ message: "gymId, planName, durationInMonths, and price are required" });
    }

    const newPlan = new GymPlayerPlan({
      gymId,
      planName,
      durationInMonths,
      price,
      features,
      planType,
      status,
    });

    await newPlan.save();

    res.status(201).json({
      message: "Gym subscription plan created successfully",
      plan: newPlan,
    });
  } catch (error) {
    console.error("Error creating gym player plan:", error);
    res.status(500).json({ message: "Error creating plan", error: error.message });
  }
};



const updateGymPlayerPlan = async (req, res) => {
  try {
    const { _id, gymId, planName, durationInMonths, price, features, status, planType } = req.body;

    if (!_id) {
      return res.status(400).json({ message: "Plan ID is required" });
    }

    const updatedPlan = await GymPlayerPlan.findByIdAndUpdate(
      _id,
      { gymId, planName, durationInMonths, price, features, status, planType },
      { new: true, runValidators: true }
    );

    if (!updatedPlan) {
      return res.status(404).json({ message: "Gym player plan not found" });
    }

    res.status(200).json({
      message: "Gym subscription plan updated successfully",
      plan: updatedPlan,
    });
  } catch (error) {
    console.error("Error updating gym player plan:", error);
    res.status(500).json({ message: "Error updating plan", error: error.message });
  }
};


const getGymPlayerPlansByGymid = async (req, res) => {
  try {
    const { gymId } = req.query; // get gymId from query param

    if (!gymId) {
      return res.status(400).json({ message: "gymId is required" });
    }

    const plans = await GymPlayerPlan.find({ gymId }).populate("gymId").sort({ price: 1 });

    res.status(200).json(plans);
  } catch (error) {
    console.error("Error fetching gym player plans:", error);
    res.status(500).json({ message: "Error fetching plans", error: error.message });
  }
};


module.exports={
    createGymPlayerPlan,
    getGymPlayerPlansByGymid,
    updateGymPlayerPlan
}