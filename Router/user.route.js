const express = require('express')
const userRouter= express()
const GymController= require('../Controller/gym.controller')
const UserController= require('../Controller/user.controller')



// Client Authentication
userRouter.post('/login',UserController.ClientLoginWeb)

// Admin Routes
userRouter.get('/get-gymlist',GymController.GetGymList)

// User Management
userRouter.post('/insertuser',UserController.InsertUser)
userRouter.post('/updateuser',UserController.EditUser)
userRouter.get('/get-userlist',UserController.GetUserList)
userRouter.get('/get-players-listbygymid',UserController.getGymPlayersListByGymid)

// membership plans

userRouter.post('/insert-membership-plans',MembershipPlansController.createGymPlayerPlan)
userRouter.post('/update-membership-plans',MembershipPlansController.updateGymPlayerPlan)
userRouter.get('/get-membership-plans',MembershipPlansController.getGymPlayerPlansByGymid)



// token 
userRouter.get('/refresh-token',UserController.refreshToken)



module.exports = userRouter
