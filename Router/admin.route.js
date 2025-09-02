const express = require('express')
const adminRouter= express()
const gymController= require('../Controller/gym.controller')
const UserController= require('../Controller/user.controller')
const AdminController= require('../Controller/admin.controller')
const apiauth= require('../Auth/apiAuth');

// gym
adminRouter.post('/insertgym',apiauth,gymController.InsertGym)
adminRouter.post('/updategym',apiauth,gymController.EditGym)
adminRouter.get('/get-gymlist',apiauth,gymController.GetGymList)
adminRouter.post('/insertuser',apiauth,UserController.InsertUser);
adminRouter.post('/updateuser',apiauth,UserController.EditUser);
adminRouter.get('/get-userlist',apiauth,UserController.GetUserList);

// adminlogin
adminRouter.post('/login',AdminController.AdminLogin)




module.exports = adminRouter
