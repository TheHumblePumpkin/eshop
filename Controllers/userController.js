const jwt = require('jsonwebtoken');
const User = require('../Models/userSchema');

//Twilio verification
const accountSid = '<accountnumber-1233456789>';
const authToken = '<authToken-123456789>';
const client = require('twilio')(accountSid, authToken);

client.verify.v2.services("<clientProfile-123456789>")
      .verifications
      .create({to: '+1 123456789', channel: 'sms'})
      .then(verification => console.log(verification.sid));

const signToken = id => {
    return jwt.sign({ id }, process.env.SECRET_STR, {
        expiresIn: process.env.LOGIN_EXPIRES
    });
};


const tempUserData = new Map();

const signToken = id => {
    return jwt.sign({ id }, process.env.SECRET_STR, {
        expiresIn: process.env.LOGIN_EXPIRES
    });
};

exports.signup = async (req, res) => {
    const { name, email, password, phone, isAdmin, street, apartment, zip, city, country } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                status: 'fail',
                message: 'Email already in use'
            });
        }

        // Storing user data temporarily
        tempUserData.set(phone, { name, email, password, isAdmin, street, apartment, zip, city, country });

        await client.verify.v2.services("<clientProfile-123456789>")
            .verifications
            .create({ to: phone, channel: 'sms' });

        //console.log('User data stored:', { email, password, name, phone }); 

        res.status(200).json({
            status: 'success',
            message: 'An OTP was sent to your phone. Please verify to complete signup.'
        });
    } catch (error) {
        console.error('Error during signup:', error); 
        res.status(500).json({
            status: 'fail',
            message: error.message
        });
    }
};

exports.verifyOtp = async (req, res) => {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
        return res.status(400).json({
            status: 'fail',
            message: 'Please provide both phone number and OTP'
        });
    }

    try {
        //Verifying the OTP using Twilio
        const verificationCheck = await client.verify.v2.services("<clientProfile-123456789>")
            .verificationChecks
            .create({ to: phone, code: otp });

        if (verificationCheck.status === 'approved') {
            //Retrieve and remove the temporary user data
            const userData = tempUserData.get(phone);
            if (!userData) {
                return res.status(400).json({
                    status: 'fail',
                    message: 'User data not found or OTP already verified'
                });
            }
            tempUserData.delete(phone);

            //Include phone in user data
            const completeUserData = {
                ...userData,
                phone
            };

            //Creating user in the database
            const newUser = await User.create(completeUserData);

            //Generating JWT token
            const token = signToken(newUser._id);

            res.status(201).json({
                status: 'success',
                token,
                data: {
                    user: newUser
                }
            });
        } else {
            res.status(400).json({
                status: 'fail',
                message: 'Invalid or expired OTP'
            });
        }
    } catch (error) {
        console.error('Error during OTP verification:', error); 
        res.status(500).json({
            status: 'fail',
            message: error.message
        });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        // Find all users in the database
        const users = await User.find();

        // Return the users in the response
        res.status(200).json({
            status: 'success',
            results: users.length, 
            data: {
                users
            }
        });
    } catch (error) {
        // Handle errors
        res.status(500).json({
            status: 'fail',
            message: error.message
        });
    }
};
