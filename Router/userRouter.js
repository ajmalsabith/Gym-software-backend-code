const express = require('express')
const userRouter= express()
const UserController= require('../Controller/Client/UserController')
const MembershipPlansController= require('../Controller/Client/GymPlayerSubscriptionController')
const GymController= require('../Controller/Admin/gymController')




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
userRouter.get('/refresh-token',UserController.refreshToken)



module.exports = userRouter
