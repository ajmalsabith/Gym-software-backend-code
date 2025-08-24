const SubscriptionPlan = require("../../Model/Admin/SubscriptionModel");

const createSubscriptionPlan = async (req, res) => {
  try {
    const { planName, durationInMonths, price, features , status} = req.body;

    if (!planName || !durationInMonths || !price) {
      return res.status(400).json({ message: "Plan name, duration, and price are required" });
    }

    const newPlan = new SubscriptionPlan({
      planName,
      durationInMonths,
      price,
      features,
      status
    });

    await newPlan.save();

    res.status(201).json({
      message: "Subscription plan created successfully",
      plan: newPlan,
    });
  } catch (error) {
    console.error("Error creating subscription plan:", error);
    res.status(500).json({ message: "Error creating plan", error: error.message });
  }
};


const updateSubscriptionPlan = async (req, res) => {
  try {
    const { id, planName, durationInMonths, price, features, status } = req.body; // take everything from body

    if (!id) {
      return res.status(400).json({ message: "Plan ID is required in body" });
    }

    const updatedPlan = await SubscriptionPlan.findByIdAndUpdate(
      id,
      { planName, durationInMonths, price, features, status },
      { new: true, runValidators: true }
    );

    if (!updatedPlan) {
      return res.status(404).json({ message: "Subscription plan not found" });
    }

    res.status(200).json({
      message: "Subscription plan updated successfully",
      plan: updatedPlan,
    });
  } catch (error) {
    console.error("Error updating subscription plan:", error);
    res.status(500).json({ message: "Error updating plan", error: error.message });
  }
};


const GetSubscrioptionPlans = async (req,res)=>{
    try {
        
        const Plans = await SubscriptionPlan.find({})

        res.status(200).json({Plans})

    } catch (error) {
            res.status(500).json({ message: "Error fetching Plans list", error: error.message });
    }
}


const GetSubscrioptionPlansById = async (req, res) => {
  try {
    const { id } = req.body; // get id from body

    if (!id) {
      return res.status(400).json({ message: "Plan ID is required in body" });
    }

    const Plan = await SubscriptionPlan.findById(id);

    if (!Plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    res.status(200).json(Plan);
  } catch (error) {
    console.error("Failed to get Plan by ID:", error);
    res.status(500).json({ message: "Error fetching Plan details", error: error.message });
  }
};


module.exports={
    createSubscriptionPlan,
    updateSubscriptionPlan,
    GetSubscrioptionPlans,
    GetSubscrioptionPlansById
}