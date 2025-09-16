const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  gymId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Gym",
    required: true,
  },
  membershipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Memberships",
    required: true,
  },
  playerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  paymentType: {
    type: String,
    enum: ["cash", "card", "upi", "bank_transfer"],
    required: true,
  },
  transactionId: {
    type: String,
  },
  notes: {
    type: String,
  },
  status: {
    type: String,
    enum: ["paid", "failed"],
    default: "paid",
  },
}, {
  timestamps: true,
});


module.exports= mongoose.model("Payment", PaymentSchema);
