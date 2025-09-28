const express = require('express')
const gymOwnerRouter = express()
const GymAdminController= require('../Controller/user.controller')
const PlayersSubcriptionPlanController = require('../Controller/player-subscription-plan.controller')
const TrainerController = require('../Controller/trainer.controller')
const PaymentHistroyController = require('../Controller/MembershipAndpaymentControlloer')
const dashboardController = require('../Controller/dashboardAnaylaticsController')
const AttendanceController = require('../Controller/AttendanceController')
const authenticateGymOwner = require('../Auth/gymOwnerAuth')

// Trainer Authentication (Public routes)
gymOwnerRouter.post('/login', GymAdminController.GymAdminLogin);
gymOwnerRouter.post('/refresh-token', GymAdminController.refreshToken);
gymOwnerRouter.post('/logout', GymAdminController.logout);

// Protected routes (require gym owner authentication)
gymOwnerRouter.use(authenticateGymOwner);

// User Profile
gymOwnerRouter.get('/profile', GymAdminController.getCurrentUser);

// Gym Player Management
gymOwnerRouter.post('/playersinsert', GymAdminController.createGymPlayer);
gymOwnerRouter.put('/playersupdate/:id', GymAdminController.updateGymPlayer);
gymOwnerRouter.get('/players', GymAdminController.getGymPlayersListByGymid);
gymOwnerRouter.get('/playerbyid', GymAdminController.GetUserById);

// Gym Trainer Management
gymOwnerRouter.post('/trainers', TrainerController.createGymTrainer);
gymOwnerRouter.get('/trainers', TrainerController.getAllTrainersByGymId);
gymOwnerRouter.get('/trainers/:id', TrainerController.getTrainerById);
gymOwnerRouter.put('/trainers/:id', TrainerController.updateTrainer);
gymOwnerRouter.delete('/trainers/:id', TrainerController.deleteTrainer);

// Trainer Subscription Management
gymOwnerRouter.post('/subscriptions', PlayersSubcriptionPlanController.createPlayersSubcriptionPlan);
gymOwnerRouter.get('/subscriptions', PlayersSubcriptionPlanController.getAllPlayersSubcriptionPlans);
gymOwnerRouter.get('/subscriptions/:id', PlayersSubcriptionPlanController.getPlayersSubcriptionPlanById);
gymOwnerRouter.put('/subscriptions/:id', PlayersSubcriptionPlanController.updatePlayersSubcriptionPlan);
gymOwnerRouter.delete('/subscriptions/:id', PlayersSubcriptionPlanController.deletePlayersSubcriptionPlan);

// Get subscriptions by specific gym
gymOwnerRouter.get('/gym/:gymId/subscriptions', PlayersSubcriptionPlanController.getPlayersSubcriptionPlansByGymId);


// payment history 

gymOwnerRouter.post("/insertmembershipAndpayment", PaymentHistroyController.createMembership);
gymOwnerRouter.put("/UpdatemembershipAndpayment/:id", PaymentHistroyController.updateMembership);
gymOwnerRouter.put("/Updatepayment/:id", PaymentHistroyController.updatePayment);
gymOwnerRouter.get("/getpayments/:gymId", PaymentHistroyController.getPaymentsByGym);
gymOwnerRouter.get("/getmembership/:playerid", PaymentHistroyController.getMembershipByPlayerId);
gymOwnerRouter.put("/clearMembership/:id/:incPayment", PaymentHistroyController.ClearMembershipById);
gymOwnerRouter.delete("/deletepayment/:id", PaymentHistroyController.deletePaymentById);
gymOwnerRouter.post("/createcustompayment", PaymentHistroyController.CreateCustomePayment)


// dashboard values
gymOwnerRouter.get("/dueDatetoday/:gymId", dashboardController.getBalanceDueToday);
gymOwnerRouter.get("/expiringMemberships/:gymId", dashboardController.getExpiringMemberships);
gymOwnerRouter.get("/membershipDashboard/:gymId", dashboardController.getMembershipDashboard);
gymOwnerRouter.get("/mostePopularplans/:gymId", dashboardController.getMostPopularPlans);
gymOwnerRouter.get("/paymentDashbaord/:gymId", dashboardController.getPaymentDashboard);
gymOwnerRouter.get("/lastpaymentsDashbaord/:gymId", dashboardController.getLast10Payments)


// attendance 

gymOwnerRouter.post("/attentance/present", AttendanceController.markPresent); // values from req.body
gymOwnerRouter.post("/attentance/absent", AttendanceController.markAbsent);   // values from req.body

// GET routes
gymOwnerRouter.get("/attentance/frequent-absentees/:gymId", AttendanceController.getFrequentAbsentees); // get frequent absentees

// GET presents by gymId and optional date range
gymOwnerRouter.get("/attentance/presents", AttendanceController.getPresents); 
// GET absents by gymId and optional date range
gymOwnerRouter.get("/attentance/absents", AttendanceController.getAbsents);


// PUT route for marking absents for today (values from params)
gymOwnerRouter.put("/attentance/absents/today/:gymId", AttendanceController.markAbsentsForToday);
gymOwnerRouter.delete("/attentance/present/:id", AttendanceController.deletePresent);
gymOwnerRouter.delete("/attentance/absent/:id", AttendanceController.deleteAbsent);



module.exports = gymOwnerRouter;