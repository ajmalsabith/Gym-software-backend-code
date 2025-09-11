const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    gymId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gym",
      required: true,
    },
    playerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PlayersSubcriptionPlan",
      required: true,
    },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    totalAmount: { type: Number, required: true },
    paidAmount: { type: Number, required: true, default: 0 },
    balanceAmount: { type: Number, required: true, default: 0 },

    dueDate: { type: Date },
    paymentType: {
      type: String,
      enum: ["cash", "card", "upi", "bank", "other"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["paid", "partially_paid", "pending", "failed", "refunded"],
      default: "pending",
    },
    transactionId: { type: String },
    notes: { type: String },
  },
  { timestamps: true } // ✅ createdAt & updatedAt auto
);

module.exports = mongoose.model("Payment", paymentSchema);
