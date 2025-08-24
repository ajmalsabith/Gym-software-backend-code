const express = require('express')
const userRouter= express()
const UserController= require('../Controller/Client/UserController')




userRouter.post('/login',UserController.ClientLoginWeb)

// token 
userRouter.get('/refresh-token',UserController.refreshToken)



module.exports = userRouter
