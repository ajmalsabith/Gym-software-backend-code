const Membership = require("../Model/AssignMembershipModel");
const Payment = require("../Model/PaymentHistoryModel");
const User = require("../Model/UserModel");



// Create Membership + Payment
const createMembership = async (req, res) => {
  const session = await Membership.startSession();
  session.startTransaction();
  try {
    const { playerId, planId, totalAmount, paidAmount = 0, startDate, endDate, gymId, paymentType, transactionId, notes,dueDate,status} = req.body;

    // 🔹 Create membership
    const membership = new Membership({
      playerId,
      planId,
      totalAmount,
      paidAmount,
      balance: totalAmount - paidAmount,
      startDate,
      endDate,
      status: paidAmount >= totalAmount ? "completed" : paidAmount > 0 ? "partially_paid" : "pending",
      gymId,
      dueDate
    });

    

    const savedMembership = await membership.save({ session });

    // update player subscription details 
    let substatus=""
    if(savedMembership?.status=="completed"){
      substatus="Active"
    }else if(savedMembership?.status=="pending"){
      substatus="Pending"
    }else if(savedMembership?.status=="partially_paid"){
       substatus="pending_balance"
    }else if(savedMembership?.status=="expired"){
       substatus="Expired"
    }
    if(savedMembership){
       await User.findByIdAndUpdate( savedMembership.playerId, { subscriptionId: savedMembership._id,subscriptionStatus:substatus}, { new: true } );
    }

    // 🔹 Create first payment (if paidAmount > 0)
    if (paidAmount > 0) {
      const payment = new Payment({
        gymId,
        membershipId: savedMembership._id,
        playerId,
        amount: paidAmount,
        date: new Date(),
        paymentType,
        transactionId,
        notes,
        status: "paid",
        paymentFor:"Membership"
      });
      await payment.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: "Membership created & initial payment recorded",
      data: savedMembership,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error creating membership:", error);
    res.status(500).json({ success: false, message: "Error creating membership", error: error.message });
  }
};


// Update Membership + Payment
const updateMembership = async (req, res) => {
  const session = await Membership.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    const { paidAmount = 0, paymentType, transactionId, notes,payAmount,dueDate } = req.body;

    const membership = await Membership.findById(id).session(session);
    if (!membership) {
      return res.status(404).json({ success: false, message: "Membership not found" });
    }

    // 🔹 Update membership financials
    membership.paidAmount = paidAmount;
    membership.dueDate = dueDate
    membership.balance = membership.totalAmount - membership.paidAmount;
    membership.status =
      membership.paidAmount >= membership.totalAmount
        ? "completed"
        : membership.paidAmount > 0
        ? "partially_paid"
        : "pending";

    const updatedMembership = await membership.save({ session });

    let substatus=""
    if(updatedMembership?.status=="completed"){
      substatus="Active"
    }else if(updatedMembership?.status=="pending"){
      substatus="Pending"
    }else if(updatedMembership?.status=="partially_paid"){
       substatus="pending_balance"
    }else if(updatedMembership?.status=="expired"){
       substatus="Expired"
    }
    if(updatedMembership){
       await User.findByIdAndUpdate( updatedMembership.playerId, {subscriptionStatus:substatus}, { new: true } );
    }

    // 🔹 Create payment record for this update
    if (paidAmount > 0) {
      const payment = new Payment({
        gymId: membership.gymId,
        membershipId: membership._id,
        playerId: membership.playerId,
        amount: payAmount,
        date: new Date(),
        paymentType,
        transactionId,
        notes,
        status: "paid",
        paymentFor:"Membership"
      });
      await payment.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: "Membership updated & payment recorded",
      data: updatedMembership,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error updating membership:", error);
    res.status(500).json({ success: false, message: "Error updating membership", error: error.message });
  }
};




const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedPayment = await Payment.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedPayment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    res.status(200).json({
      success: true,
      message: "Payment updated successfully",
      data: updatedPayment,
    });
  } catch (error) {
    console.error("Error updating payment:", error);
    res.status(500).json({ success: false, message: "Error updating payment", error: error.message });
  }
};

// Get all payments for a gym                                     
const getPaymentsByGym = async (req, res) => {
  try {
    const { gymId } = req.params;
    const payments = await Payment.find({ gymId })
      .populate("playerId")
      .populate("gymId")
      .populate("membershipId", "planId totalAmount paidAmount balance status");

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ success: false, message: "Error fetching payments", error: error.message });
  }
};



const getMembershipByPlayerId = async (req, res) => {
  try {
    const { playerId } = req.params;

    const memberships = await Membership.find({ playerId })
      .populate("planId")
      .populate("gymId")
      .populate("playerId")
      .lean();

    // Attach payments for each membership
    // const membershipsWithPayments = await Promise.all(
    //   memberships.map(async (membership) => {
    //     const payments = await Payment.find({ membershipId: membership._id });
    //     return { ...membership, payments };
    //   })
    // );

    res.status(200).json({
      success: true,
      // count: membershipsWithPayments.length,
      data: memberships,
    });
  } catch (error) {
    console.error("Error fetching membership by player:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching membership by player",
      error: error.message,
    });
  }
};


const ClearMembershipById = async (req, res) => {
  try {
    const { id, incPayment } = req.params;

    // Find the membership by ID
    const membership = await Membership.findById(id).populate("playerId");

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: "Membership not found",
      });
    }

    // Update player details
    await User.findByIdAndUpdate(
      membership.playerId._id,
      { subscriptionId: null, subscriptionStatus: "pending" },
      { new: true }
    );

    // Conditionally delete payment history
    if (incPayment === "true") { // params are strings
      await Payment.deleteMany({ membershipId: id });
    }

    // Delete the membership
    await Membership.findByIdAndDelete(id);

    // Send response after all operations
    res.status(200).json({
      success: true,
      message: "Membership cleared, player updated" + (incPayment === "true" ? " and payments deleted" : ""),
    });

  } catch (error) {
    console.error("Error clearing membership:", error);
    res.status(500).json({
      success: false,
      message: "Error clearing membership",
      error: error.message,
    });
  }
};



const deletePaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    await Payment.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Payment deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting payment',
      error: error.message,
    });
  }
};




const CreateCustomePayment = async (req, res) => {
  try {
    const { gymId, playerId, payAmount, paymentType, transactionId, notes, paymentFor } = req.body;

    // ✅ Validation
    if (!gymId || !playerId || !payAmount || !paymentType || !paymentFor) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: gymId, playerId, payAmount, paymentType, paymentFor are required.",
      });
    }

    const payment = new Payment({
      gymId,
      playerId,
      amount: payAmount,
      date: new Date(),
      paymentType,
      transactionId,
      notes,
      status: "paid",
      paymentFor,
    });

    await payment.save(); // removed { session } unless you are using a transaction

    res.status(200).json({
      success: true,
      message: "Payment recorded successfully",
      data: payment,
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



module.exports = {
  createMembership,
  updateMembership,
  updatePayment,
  getPaymentsByGym,
  getMembershipByPlayerId,
  ClearMembershipById,
  deletePaymentById,
  CreateCustomePayment
};
