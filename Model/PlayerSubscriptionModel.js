const mongoose = require("mongoose");

const PlayersSubcriptionPlanSchema = new mongoose.Schema(
  {
    subscriptionId: {
      type: String,
      required: true,
      unique: true,
    },
    gymId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gym",
      required: true,
    },
    planName: {
      type: String,
      required: true,
      trim: true,
    },
    planType: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    duration: {
      type: Number, // in months
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "cancelled"],
      default: "active",
    },
    features: [{
      type: String,
      trim: true,
    }],
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    autoRenew: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Generate next subscription ID
PlayersSubcriptionPlanSchema.statics.generateSubscriptionId = async function() {
  const lastSubscription = await this.findOne().sort({ createdAt: -1 }).exec();
  let nextId = "SUB1";
  
  if (lastSubscription?.subscriptionId) {
    const lastNumber = parseInt(lastSubscription.subscriptionId.replace("SUB", ""), 10) || 0;
    nextId = `SUB${lastNumber + 1}`;
  }
  
  return nextId;
};

module.exports = mongoose.model("PlayersSubcriptionPlan", PlayersSubcriptionPlanSchema);
