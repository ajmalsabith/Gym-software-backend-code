const mongoose = require("mongoose");

const GymPlayerPlanSchema = new mongoose.Schema(
  {
    gymId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gym", // Each plan belongs to a specific gym
      required: true,
    },
    planName: {
      type: String,
      required: true,
      trim: true,
    },
    durationInMonths: {
      type: Number,
      required: true, // e.g., 1 = 1 month, 6 = 6 months, 12 = 1 year
    },
    price: {
      type: Number,
      required: true,
    },
    features: [
      {
        type: String, // e.g., "Personal Trainer", "Steam Bath", "Diet Consultation"
      },
    ],
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GymPlayerSubscriptionPlan", GymPlayerPlanSchema);
