const mongoose = require("mongoose");

const SubscriptionPlanSchema = new mongoose.Schema(
  {
    planName: {
      type: String,
      required: true,
      trim: true,
    },
    durationInMonths: {
      type: Number,
      required: true, // e.g., 6 = 6 months, 12 = 1 year
    },
    price: {
      type: Number,
      required: true, // amount in INR or USD
    },
    features: [
      {
        type: String, // e.g., "Unlimited Members", "Email Support", "Analytics Dashboard"
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

module.exports = mongoose.model("SubscriptionPlanForGym", SubscriptionPlanSchema);
