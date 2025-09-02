const mongoose= require('mongoose')
 require('dotenv').config()
const express=require('express')
const cors = require('cors');
const cookieParser = require('cookie-parser');
const userRouter= require('./Router/user.route')
const adminRouter= require('./Router/admin.route')
const apiauth= require('./Auth/apiAuth');
const CommonApiRoutes = require('./Router/common.route');
const app=express()
const bodyParser = require("body-parser");
const authenticateToken = require('./Auth/tokenAuth');

const gymOwnerRouter = require('./Router/gym-owner.route');
const uploadRouter = require('./Router/upload.route');


app.use(cors({
    origin:true,
    credentials:true
}))
app.options('*', cors())



app.use(cookieParser());
app.use(express.json());

// Serve uploaded images statically
app.use('/uploads', express.static('uploads'));




app.use('/client',(req, res, next) => {
    if (req.path === '/refresh-token' || req.path === '/login') {
      return next(); // skip 
    }
    authenticateToken(req, res, next);
  },  
  userRouter
);

app.use('/admin', adminRouter);
app.use('/common', apiauth, CommonApiRoutes);
app.use('/gym-owner', gymOwnerRouter  );
app.use('/upload', uploadRouter);


mongoose.connect(process.env.mongodburinew)
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Database connection error:', err));


app.listen(3400,()=>{
    console.log('server running on port 3400...');
    
})