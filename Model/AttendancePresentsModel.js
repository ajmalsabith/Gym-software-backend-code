const mongoose = require("mongoose");
const { Schema } = mongoose;

const AttendancePresentSchema = new Schema({
  gymId: { type: Schema.Types.ObjectId, ref: "Gym", required: true },
  playerId: { type: Schema.Types.ObjectId, ref: "Users", required: true }, // Member
  markedBy: { 
    type: String, 
    enum: ["admin", "trainer", "system", "member"], 
    required: true 
  }, // Who marked attendance 
  date: { type: Date, required: true }, // Date of attendance
  checkInTime: { type: Date,required: true},
  checkOutTime: { type: Date, default: null },   // ✅ Optional checkout time
    lat: { type: Number },
    lng: { type: Number },
   notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("AttendancePresent", AttendancePresentSchema);
