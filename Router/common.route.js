// routes/location.routes.js
const express = require('express');
const CommonApiRoutes = express.Router();
const StateDistricts = require('../Model/StatesDistrictsModel');
const IndiaCities = require('../Model/IndiaCitiesModel');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');



// GET all states with districts
CommonApiRoutes.get('/states-districts', async (req, res) => {
  try {
    const data = await StateDistricts.find({});
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch states and districts' });
  }
});

// GET all cities
CommonApiRoutes.get('/india-cities', async (req, res) => {
  try {
    const data = await IndiaCities.find({})
    
    res.json(data);
  } catch (err) {
    
    res.status(500).json({ error: 'Failed to fetch cities' });
  }
});





// CommonApiRoutes.post('/sendmail', async (req, res) => {
//     const { sub, mail, cc, attach, html } = req.body;
//     const attachArray = [];
//     if (req.body) {
//         attach.forEach(element => {
//             const base64String = element.filestring.split(',')[1];
//             const obj = {
//                 filename: element.filename,
//                 content: base64String,
//                 encoding: 'base64',
//             };
//             attachArray.push(obj);
//         });

//         const mailOptions = {
//             from: process.env.user,
//             to: Array.isArray(mail) ? mail.join(', ') : mail,
//             cc: Array.isArray(cc) ? cc.join(', ') : cc,
//             subject: sub,
//             html: html,
//             attachments: attachArray,
//         };

//         let transporter = nodemailer.createTransport({
//             host: 'smtp.gmail.com',
//             port: 465,
//             secure: true,
//             auth: {
//                 user: process.env.user,
//                 pass: process.env.pass,
//             },
//         });


//         transporter.sendMail(mailOptions, (error, info) => {
//             if (error) {
//                 if (error.responseCode === 550 || error.response.includes("No such user")) {
//                     console.log('Email address does not exist');
//                     res.status(400).send({
//                         message: "Email address does not exist."
//                     });
//                 } else {
//                     console.log(error);
//                     res.status(400).send({
//                         message: "Email sending failed."
//                     });
//                 }
//             } else {
//                 console.log(`Email sent: ${info.response}`);
//                 res.status(200).send({
//                     message: "Email sent successfully."
//                 });
//             }
//         });
//     }
// });



const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;



const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

  

oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });





CommonApiRoutes.post('/sendmail', async (req, res) => {
    const { sub, mail, cc, attach, html } = req.body;
    const attachArray = [];


    if (req.body) {
        attach.forEach(element => {
            // Only handle Blob URL attachments
         
                const base64String = element.filestring.split(',')[1];
                const obj = {
                    filename: element.filename,
                    content: base64String,
                    encoding: 'base64',
                };
                attachArray.push(obj);

            
        });

    
        try {
            const accessToken = await oAuth2Client.getAccessToken();

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    type: 'OAuth2',
                    user: process.env.USER_EMAIL,
                    clientId: CLIENT_ID,
                    clientSecret: CLIENT_SECRET,
                    refreshToken: REFRESH_TOKEN,
                    accessToken: accessToken.token,
                },
            });

            const mailOptions = {
                from: process.env.USER_EMAIL,
                to: Array.isArray(mail) ? mail.join(', ') : mail,
                cc: Array.isArray(cc) ? cc.join(', ') : cc,
                subject: sub,
                html: html,
                attachments: attachArray,
            };

            // console.log(mailOptions);
            

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Send mail error:', error);
                    if (error.responseCode === 550 || (error.response && error.response.includes("No such user"))) {
                        res.status(400).send({ message: "Email address does not exist." });
                    } else {
                        res.status(400).send({ message: "Email sending failed." });
                    }
                }
                 else {
                    console.log(`Email sent: ${info.response}`);
                    res.status(200).send({ message: "Email sent successfully." });
                }
            });

        } catch (error) {
            console.log('Error generating access token', error);
            res.status(500).send({ message: "Failed to send email." });
        }
    }
});



module.exports = CommonApiRoutes;
