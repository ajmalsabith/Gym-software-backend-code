const Membership = require("../Model/AssignMembershipModel");
const Payment = require("../Model/PaymentHistoryModel");
const User = require("../Model/UserModel");
const PlayersSubcriptionModel = require("../Model/PlayerSubscriptionModel");
const mongoose = require('mongoose');






const getPaymentDashboard = async (req, res) => {
  try {
    const { gymId } = req.params;

    // Total revenue
    const totalRevenue = await Payment.aggregate([
      { $match: { gymId: new mongoose.Types.ObjectId(gymId), status: "paid" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    // Revenue grouped by type
    const revenueByType = await Payment.aggregate([
      { $match: { gymId: new mongoose.Types.ObjectId(gymId), status: "paid" } },
      { $group: { _id: "$paymentType", total: { $sum: "$amount" } } }
    ]);

    // Monthly revenue trend
    const monthlyRevenue = await Payment.aggregate([
      { $match: { gymId: new mongoose.Types.ObjectId(gymId), status: "paid" } },
      {
        $group: {
          _id: { year: { $year: "$date" }, month: { $month: "$date" } },
          total: { $sum: "$amount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Today’s payments
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayPayments = await Payment.aggregate([
      {
        $match: {
          gymId: new mongoose.Types.ObjectId(gymId),
          status: "paid",
          date: { $gte: todayStart, $lte: todayEnd }
        }
      },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    res.status(200).json({
      success: true,
      totalRevenue: totalRevenue[0]?.total || 0,
      revenueByType,
      monthlyRevenue,
      todayPayments: todayPayments[0]?.total || 0
    });
  } catch (error) {
    console.error("Error fetching payment dashboard:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


const getMembershipDashboard = async (req, res) => {
  try {
    const { gymId } = req.params;

    // Active members (status: active or partial_paid)
  // Active members from Users collection
// Active members (role = player, subscriptionStatus = Active or pending_balance)
const activeMembers = await User.countDocuments({
  gymId: new mongoose.Types.ObjectId(gymId),
  role: "player",
  subscriptionStatus: { $in: ["Active", "pending_balance"] }
});

// Expired members (role = player, subscriptionStatus = pending or expired)
const expiredMembers = await User.countDocuments({
  gymId: new mongoose.Types.ObjectId(gymId),
  role: "player",
  subscriptionStatus: { $in: ["pending", "expired"] }
});

    // New members in last 10 days
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

    const newMembers = await User.countDocuments({
      gymId: new mongoose.Types.ObjectId(gymId),
      role: "player",
      createdAt: { $gte: tenDaysAgo }
    });

    // Optional: Stats grouped by status
    const membershipStats = await Membership.aggregate([
      { $match: { gymId: new mongoose.Types.ObjectId(gymId) } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$totalAmount" },
          paidAmount: { $sum: "$paidAmount" },
          balance: { $sum: "$balance" }
        }
      }
    ]);

   const membershipBalanceTotal = await Membership.aggregate([
  { $match: { 
      gymId: new mongoose.Types.ObjectId(gymId),
      status: "partially_paid"
  }},
  {
    $group: {
      _id: null,                    // no grouping by status
      totalBalance: { $sum: "$balance" }  // sum of balance
    }
  }
]);

    res.status(200).json({
      success: true,
      activeMembers,
      expiredMembers,
      newMembers,
      membershipStats,
      membershipBalanceTotal
    });
  } catch (error) {
    console.error("Error fetching membership dashboard:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};




const getExpiringMemberships = async (req, res) => {
  try {
    const { gymId } = req.params;
    const today = new Date();

    // Helper function to calculate future date
    const addDays = (days) => {
      const date = new Date(today);
      date.setDate(date.getDate() + days);
      return date;
    };

    // Expiring ranges
    const ranges = [2, 5, 7, 10];
    const results = {};

    for (let days of ranges) {
      const futureDate = addDays(days);

      const count = await Membership.countDocuments({
        gymId: new mongoose.Types.ObjectId(gymId),
        endDate: { $gte: today, $lte: futureDate }
      });

      results[`expiringIn${days}Days`] = count;
    }

    res.status(200).json({
      success: true,
      ...results
    });
  } catch (error) {
    console.error("Error fetching expiring memberships:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


const getBalanceDueToday = async (req, res) => {
  try {
    const { gymId } = req.params;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const dueToday = await Membership.countDocuments({
      gymId: new mongoose.Types.ObjectId(gymId),
      balance: { $gt: 0 },
      dueDate: { $gte: todayStart, $lte: todayEnd }
    });

    res.status(200).json({
      success: true,
      balanceDueToday: dueToday
    });
  } catch (error) {
    console.error("Error fetching balance due today:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};



const getMostPopularPlans = async (req, res) => {
  try {
    const { gymId } = req.params;

    const popularPlans = await Membership.aggregate([
      { $match: { gymId: new mongoose.Types.ObjectId(gymId) } },
      {
        $group: {
          _id: "$planId",       // Group by planId
          count: { $sum: 1 }    // Count how many users subscribed
        }
      },
      { $sort: { count: -1 } }, // Sort by highest count
      {
        $lookup: {             // Populate plan details
          from: "playerssubcriptionplans", 
          localField: "_id",
          foreignField: "_id",
          as: "plan"
        }
      },
      { $unwind: "$plan" }      // Flatten the plan array
    ]);

    res.status(200).json({
      success: true,
      popularPlans
    });
  } catch (error) {
    console.error("Error fetching most popular plans:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};



const getLast10Payments = async (req, res) => {
  try {
    const { gymId } = req.params;

    // Fetch the latest 10 payments for this gym
    const last10Payments = await Payment.find({
      gymId: new mongoose.Types.ObjectId(gymId)
    })
    .sort({ createdAt: -1 }) // latest first
    .limit(10).populate('playerId', 'name phone photo'); // populate fields you want from the User/Player


    res.status(200).json({
      success: true,
      last10Payments,
      count: last10Payments.length
    });

  } catch (error) {
    console.error("Error fetching last 10 payments:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getLast10Payments };


module.exports= {
    getPaymentDashboard,
    getMembershipDashboard,
    getBalanceDueToday,
    getExpiringMemberships,
    getMostPopularPlans,
    getLast10Payments

}
