const mongoose = require("mongoose");
const { Schema } = mongoose;

const AttendanceAbsentSchema = new Schema({
  gymId: { type: Schema.Types.ObjectId, ref: "Gym", required: true },
  playerId: { type: Schema.Types.ObjectId, ref: "Users", required: true }, // Member
 markedBy: { 
    type: String, 
    enum: ["admin", "trainer", "system", "member"], 
    required: true 
  }, // Who marked attendance  
  date: { type: Date, required: true },
  reason: { type: String }, // Optional reason (e.g., sick leave)
}, { timestamps: true });

module.exports = mongoose.model("AttendanceAbsent", AttendanceAbsentSchema);
