const express = require('express')
const userRouter= express()
const UserController= require('../Controller/user.controller')




userRouter.post('/login',UserController.ClientLoginWeb)
// token 
userRouter.get('/refresh-token',UserController.refreshToken)



module.exports = userRouter
