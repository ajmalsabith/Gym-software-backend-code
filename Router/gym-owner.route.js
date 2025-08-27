const express = require('express')
const gymOwnerRouter = express()
const UserController= require('../Controller/user.controller')




gymOwnerRouter.post('/login',UserController.ClientLoginWeb);

gymOwnerRouter.post('/insertuser',UserController.InsertUser);
gymOwnerRouter.post('/updateuser',UserController.EditUser);
gymOwnerRouter.get('/get-userlist',UserController.GetUserList);

module.exports = gymOwnerRouter;