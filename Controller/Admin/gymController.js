const Gym= require('../../Model/Admin/gymModel')

const InsertGym = async (req, res) => {
  try {
    const data = req.body;

    // Validate subscription dates from frontend
    const subscriptionStartDate = data.subscriptionStartDate ? new Date(data.subscriptionStartDate) : null;
    const subscriptionEndDate = data.subscriptionEndDate ? new Date(data.subscriptionEndDate) : null;

    if (!subscriptionStartDate || !subscriptionEndDate || isNaN(subscriptionStartDate) || isNaN(subscriptionEndDate)) {
      return res.status(400).json({ message: "Valid subscriptionStartDate and subscriptionEndDate are required" });
    }

    // Generate next gym ID
    const lastGym = await Gym.findOne().sort({ createdAt: -1 }).exec();
    let nextGymId = "GYM1";

    if (lastGym?.gymId) {
      const lastGymNumber = parseInt(lastGym.gymId.replace("GYM", ""), 10) || 0;
      nextGymId = `GYM${lastGymNumber + 1}`;
    }

    

    // Create and save new gym
    const gym = new Gym({
      gymId: nextGymId,
      name: data.name,
      ownerEmail: data.ownerEmail,
      subscriptionStatus: data.subscriptionStatus || "trial",
      subscriptionStartDate,
      subscriptionEndDate,
      daysLeft: data.daysLeft ?? 30, // allow frontend to send daysLeft
      isTrial: data.isTrial ?? true,
      line1: data?.line1 ,
      city: data?.city ,
      district: data?.district ,
      state: data?.state ,
      country: data?.country ,
      zip: data?.zip ,
      logo: data.logo,
      phone: data.phone,
      website: data.website
    });

    const savedGym = await gym.save();
    res.status(201).json({ message: "Gym inserted successfully", gym: savedGym });

  } catch (error) {
    res.status(500).json({ message: "Error inserting gym", error: error.message });
  }
};

  

const EditGym = async (req, res) => {
  try {
    const gymId = req.body.id; 
    const data = req.body.obj;
        // console.log(req.body);


    const result = await Gym.updateOne(
      { gymId },
      { $set: data },
      { runValidators: true }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Gym not found" });
    }

    if (result.modifiedCount === 0) {
      return res.status(200).json({ message: "No changes made to the gym" });
    }

    res.status(200).json({ message: "Gym updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating gym", error: error.message });
  }
};


const GetGymList = async (req, res) => {
  try {
    
    const gyms = await Gym.find().sort({ createdAt: -1 });
    res.status(200).json(gyms);
  } catch (error) {
    console.log(error,'fialed to get list ');
    
    res.status(500).json({ message: "Error fetching gym list", error: error.message });
  }
};


const GetGymById = async (req, res) => {
  try {
    const { id } = req.body; // get id from body

    if (!id) {
      return res.status(400).json({ message: "Gym ID is required in body" });
    }

    const gym = await Gym.findById(id);

    if (!gym) {
      return res.status(404).json({ message: "Gym not found" });
    }

    res.status(200).json(gym);
  } catch (error) {
    console.error("Failed to get gym by ID:", error);
    res.status(500).json({ message: "Error fetching gym details", error: error.message });
  }
};




  module.exports={
    InsertGym,
    EditGym,
    GetGymList,
    GetGymById
  }

