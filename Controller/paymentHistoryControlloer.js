const Payment = require("../Model/PaymentHistoryModel");
const Player = require("../Model/UserModel");

// Create Payment Record
// Create Payment
const createPayment = async (req, res) => {
  try {
    const payment = new Payment(req.body);
    
    const savedPayment = await payment.save();


     let subscriptionStatus = "pending";

if (savedPayment.paymentStatus === "paid") {
  subscriptionStatus = "active";
} else if (savedPayment.paymentStatus === "partially_paid") {
  subscriptionStatus = "partially_paid";
} else {
  subscriptionStatus = "pending";
}
    // ✅ update player subscription details
    await Player.findByIdAndUpdate(
      payment.playerId,
      {
        subscriptionId: savedPayment._id,
        subscriptionStatus:subscriptionStatus,
        subscriptionStartDate: payment.startDate,
        subscriptionEndDate: payment.endDate,
      },
      { new: true }
    );

    res.status(201).json({
      success: true,
      message: "Payment created and subscription updated",
      data: savedPayment,
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(500).json({
      success: false,
      message: "Error creating payment",
      error: error.message,
    });
  }
};

// Update Payment
const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedPayment = await Payment.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedPayment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    let subscriptionStatus = "pending";

if (updatedPayment.paymentStatus === "paid") {
  subscriptionStatus = "active";
} else if (updatedPayment.paymentStatus === "partially_paid") {
  subscriptionStatus = "partially_paid";
} else {
  subscriptionStatus = "pending";
}

    // ✅ update player subscription details
    await Player.findByIdAndUpdate(
      updatedPayment.playerId,
      {
        subscriptionId: updatedPayment._id,
        subscriptionStatus:subscriptionStatus,
        subscriptionStartDate: updatedPayment.startDate,
        subscriptionEndDate: updatedPayment.endDate,
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Payment & subscription updated successfully",
      data: updatedPayment,
    });
  } catch (error) {
    console.error("Error updating payment:", error);
    res.status(500).json({
      success: false,
      message: "Error updating payment",
      error: error.message,
    });
  }
}

// Get All Payments by Gym
const getPaymentsByGym = async (req, res) => {
  try {
    const { gymId } = req.params;

    const payments = await Payment.find({ gymId })
      .populate("playerId", "name email")   // fetch player details
      .populate("planId", "name duration price"); // fetch plan details

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching payments",
      error: error.message,
    });
  }
};

module.exports = {
  createPayment,
  updatePayment,
  getPaymentsByGym,
};
