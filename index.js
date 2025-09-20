const mongoose= require('mongoose')
 require('dotenv').config()
const express=require('express')
const cors = require('cors');
const cookieParser = require('cookie-parser');
const userRouter= require('./Router/user.route')
const superAdminRouter= require('./Router/admin.route')
const apiauth= require('./Auth/apiAuth');
const CommonApiRoutes = require('./Router/common.route');
const app=express()
const bodyParser = require("body-parser");
const authenticateToken = require('./Auth/tokenAuth');

const gymOwnerRouter = require('./Router/gym-owner.route');
const uploadRouter = require('./Router/upload.route');
const cron = require('node-cron');
const CronController = require('./Controller/CronController');


app.use(cors({
    origin:true,
    credentials:true
}))
app.options('*', cors())



app.use(cookieParser());
app.use(express.json());

// Serve uploaded images statically
app.use('/uploads', express.static('uploads'));



app.use('/api/super-admin', superAdminRouter);
app.use('/api/admincommon', apiauth, CommonApiRoutes);
app.use('/api/admin', gymOwnerRouter  );
app.use('/upload', uploadRouter);


mongoose.connect(process.env.mongodburinew)
.then(() =>{ 
 console.log('Connected to MongoDB')
  cron.schedule('0 5 * * *', () => {
  // 6:00 AM job
  CronController.checkExpiredMemberships().catch(err =>
    console.error('Cron job error:', err)
  );
});

cron.schedule('0 16 * * *', () => {
  // 5:23 PM job
  CronController.checkExpiredMemberships().catch(err =>
    console.error('Cron job error:', err)
  );
});

})
.catch(err => console.error('Database connection error:', err));


app.listen(3400,()=>{
    console.log('server running on port 3400...');
    
})