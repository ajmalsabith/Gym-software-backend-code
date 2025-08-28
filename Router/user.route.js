const express = require('express')
const userRouter= express()
const MembershipPlansController= require('../Controller/player-subscription.controller')
const GymController= require('../Controller/gym.controller')
const UserController= require('../Controller/user.controller')





userRouter.post('/login',UserController.ClientLoginWeb)

// admin 
userRouter.get('/get-gymlist',GymController.GetGymList)
// users
userRouter.post('/insertuser',UserController.InsertUser)
userRouter.post('/updateuser',UserController.EditUser)
userRouter.get('/get-userlist',UserController.GetUserList)
userRouter.get('/get-players-listbygymid',UserController.getGymPlayersListByGymid)

// membership plans

userRouter.post('/insert-membership-plans',MembershipPlansController.createGymPlayerPlan)
userRouter.post('/update-membership-plans',MembershipPlansController.updateGymPlayerPlan)
userRouter.get('/get-membership-plans',MembershipPlansController.getGymPlayerPlansByGymid)



// token 
userRouter.post('/refresh-token',UserController.refreshToken)



module.exports = userRouter
