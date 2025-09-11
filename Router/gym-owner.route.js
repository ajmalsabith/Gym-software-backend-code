const express = require('express')
const gymOwnerRouter = express()
const GymAdminController= require('../Controller/user.controller')
const PlayersSubcriptionPlanController = require('../Controller/player-subscription-plan.controller')
const TrainerController = require('../Controller/trainer.controller')
const PaymentHistroyController = require('../Controller/paymentHistoryControlloer')
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

gymOwnerRouter.post("/insertpayment", PaymentHistroyController.createPayment);
gymOwnerRouter.put("/updatepayment/:id", PaymentHistroyController.updatePayment);
gymOwnerRouter.get("/getpayment/:gymId", PaymentHistroyController.getPaymentsByGym);

module.exports = gymOwnerRouter;