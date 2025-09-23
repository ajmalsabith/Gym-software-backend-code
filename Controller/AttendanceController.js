const AttendancePresent = require("../Model/AttendancePresentsModel");
const AttendanceAbsent = require("../Model/AttendanceAbsentsModel");
const User = require("../Model/UserModel");


// ✅ Mark Present
const markPresent = async (req, res) => {
  try {
    const { gymId, playerId, markedBy, date, lat, lng, notes } = req.body;

    if (!gymId || !playerId || !date) {
      return res.status(400).json({ success: false, message: "gymId, playerId, and date are required" });
    }

    // Define start & end of the day for the given date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Check if player is already marked present today
    const existingRecord = await AttendancePresent.findOne({
      gymId,
      playerId,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    if (existingRecord) {
      return res.status(400).json({
        success: false,
        message: "This player is already marked present for today"
      });
    }

    const checkInTime = date; // can also be new Date() if current timestamp

    const record = new AttendancePresent({
      gymId,
      playerId,
      markedBy,
      date,
      checkInTime,
      lat,
      lng,
      notes
    });

    await record.save();

    res.status(201).json({ success: true, data: record });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


// ✅ Mark Absent
const markAbsent = async (req, res) => {
  try {
    const { gymId, playerId, markedBy, date, reason } = req.body;

    const record = new AttendanceAbsent({ gymId, playerId, markedBy, date, reason });
    await record.save();

    res.status(201).json({ success: true, data: record });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getPresents = async (req, res) => {
  try {
    const { gymId, fromDate, toDate } = req.query;
    const filter = {};

    if (gymId) filter.gymId = gymId;

    if (fromDate && toDate) {
      const start = new Date(`${fromDate}T00:00:00.000Z`);
      const end = new Date(`${toDate}T23:59:59.999Z`);
      filter.date = { $gte: start, $lte: end };
    }

    const records = await AttendancePresent.find(filter)
      .populate("playerId")
      .populate("gymId").sort({ date: -1 });

    res.json({ success: true, data: records });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


// ✅ Get Absents (by date/gym)
const getAbsents = async (req, res) => {
  try {
    const { gymId, fromDate, toDate } = req.query;
    const filter = {};
        // console.log(req.query,'search values absents');


    if (gymId) filter.gymId = gymId;
    
   if (fromDate && toDate) {
      const start = new Date(`${fromDate}T00:00:00.000Z`);
      const end = new Date(`${toDate}T23:59:59.999Z`);
      filter.date = { $gte: start, $lte: end };
    }

    const records = await AttendanceAbsent.find(filter).populate("playerId").populate("gymId").sort({ date: -1 });
    res.json({ success: true, data: records });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


// ✅ Get Absents more than X days
const getFrequentAbsentees = async (req, res) => {
  try {
    const { gymId, days } = req.params;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - Number(days));

    const records = await AttendanceAbsent.aggregate([
      { $match: { gymId: gymId ? mongoose.Types.ObjectId(gymId) : { $exists: true }, date: { $gte: cutoffDate } } },
      { $group: { _id: "$playerId", absentCount: { $sum: 1 } } },
      { $match: { absentCount: { $gte: Number(days) } } }
    ]);

    res.json({ success: true, data: records });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


// ✅ Auto mark absents for today
const markAbsentsForToday = async (req, res) => {
  try {
    const { gymId } = req.params;
    if (!gymId) {
      return res.status(400).json({ success: false, message: "gymId is required" });
    }

    // Get today's start & end time
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Get all members of this gym
    const allMembers = await User.find({ gymId, role: 'player' }).select("_id");

    // Get all members who marked present today
    const presents = await AttendancePresent.find({
      gymId,
      date: { $gte: startOfDay, $lte: endOfDay }
    }).select("playerId");

    const presentIds = presents.map(p => p.playerId.toString());

    // Get members who are already marked absent today
    const alreadyAbsent = await AttendanceAbsent.find({
      gymId,
      date: { $gte: startOfDay, $lte: endOfDay }
    }).select("playerId");

    const absentIdsToday = alreadyAbsent.map(a => a.playerId.toString());

    // Filter members who are absent (not in presents and not already absent)
    const absentees = allMembers.filter(
      m => !presentIds.includes(m._id.toString()) && !absentIdsToday.includes(m._id.toString())
    );

    // Insert absent records
    const absentRecords = absentees.map(m => ({
      gymId,
      playerId: m._id,
      markedBy: "admin",
      date: startOfDay,
      reason: "Auto-marked absent"
    }));

    if (absentRecords.length > 0) {
      await AttendanceAbsent.insertMany(absentRecords);
    }

    res.status(201).json({
      success: true,
      message: `${absentRecords.length} members marked absent for today`,
      data: absentRecords
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};




// Delete Absent Attendance
const deleteAbsent = async (req, res) => {
  try {
    const { id } = req.params; // _id from request params

    const record = await AttendanceAbsent.findByIdAndDelete(id);

    if (!record) {
      return res.status(404).json({ success: false, message: "Absent record not found" });
    }

    res.json({ success: true, message: "Absent record deleted", data: record });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


// Delete Present Attendance
const deletePresent = async (req, res) => {
  try {
    const { id } = req.params; // _id from request params

    const record = await AttendancePresent.findByIdAndDelete(id);

    if (!record) {
      return res.status(404).json({ success: false, message: "Present record not found" });
    }

    res.json({ success: true, message: "Present record deleted", data: record });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


module.exports={
    markPresent,
    markAbsent,
    getAbsents,
    getFrequentAbsentees,
    getPresents,
    markAbsentsForToday,
    deletePresent,
    deleteAbsent


}