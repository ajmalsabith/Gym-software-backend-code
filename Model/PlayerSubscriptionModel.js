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
    trainerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    planName: {
      type: String,
      required: true,
      trim: true,
    },
    planType: {
      type: String,
      enum: ["basic", "premium", "custom"],
      default: "basic",
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
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "expired", "cancelled", "pending"],
      default: "pending",
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
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
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
