const jwt = require('jsonwebtoken');
const User = require('../Models/userSchema');

const signToken = id => {
    return jwt.sign({ id }, process.env.SECRET_STR, {
        expiresIn: process.env.LOGIN_EXPIRES
    });
};

exports.signup = async (req, res) => {
    try {
        const newUser = await User.create(req.body);

        const token = signToken(newUser._id);
        res.status(201).json({
            status: 'success',
            token,
            data: {
                user: newUser
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({
            status: 'fail',
            message: 'Please provide email and password'
        });
    }

    try {
        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.comparePasswordinDB(password, user.password))) {
            return res.status(401).json({
                status: 'fail',
                message: 'Incorrect email or password'
            });
        }

        const token = signToken(user._id);
        res.status(200).json({
            status: 'success',
            token
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};
