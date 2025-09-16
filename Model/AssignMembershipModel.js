const mongoose = require("mongoose");

const MembershipSchema = new mongoose.Schema({
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
  totalAmount: {
    type: Number,
    required: true,
  },
  paidAmount: {
    type: Number,
    default: 0,
  },
  balance: {
    type: Number,
    default: function () {
      return this.totalAmount;
    },
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  dueDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ["pending", "partially_paid", "completed", "expired"],
    default: "pending",
  },
}, {
  timestamps: true,
});

// // ✅ Auto-update balance whenever paidAmount changes
// MembershipSchema.pre("save", function (next) {
//   this.balance = this.totalAmount - this.paidAmount;
//   if (this.balance <= 0 && this.status !== "expired") {
//     this.status = "completed";
//   } else if (this.paidAmount > 0 && this.balance > 0) {
//     this.status = "partially_paid";
//   }
//   next();
// });


module.exports = mongoose.model("Memberships", MembershipSchema);

