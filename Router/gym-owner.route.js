const express = require('express')
const gymOwnerRouter = express()
const UserController= require('../Controller/user.controller')
const TrainerSubscriptionController = require('../Controller/trainer-subscription.controller')

// Trainer Authentication
gymOwnerRouter.post('/login', UserController.TrainerLogin);

// Gym Player Management
gymOwnerRouter.post('/players', UserController.createGymPlayer);
gymOwnerRouter.get('/players', UserController.getGymPlayersListByGymid);

// Trainer Subscription Management
gymOwnerRouter.post('/subscriptions', TrainerSubscriptionController.createTrainerSubscription);
gymOwnerRouter.get('/subscriptions', TrainerSubscriptionController.getAllTrainerSubscriptions);
gymOwnerRouter.get('/subscriptions/:id', TrainerSubscriptionController.getTrainerSubscriptionById);
gymOwnerRouter.put('/subscriptions/:id', TrainerSubscriptionController.updateTrainerSubscription);
gymOwnerRouter.delete('/subscriptions/:id', TrainerSubscriptionController.deleteTrainerSubscription);

// Get subscriptions by specific gym
gymOwnerRouter.get('/gym/:gymId/subscriptions', TrainerSubscriptionController.getTrainerSubscriptionsByGymId);

module.exports = gymOwnerRouter;