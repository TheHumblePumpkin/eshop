const express = require('express');
const aws = require('aws-sdk');
const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');
const User = require('../Models/userSchema');

// Initialize S3 client
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

// Configure Multer to use S3 for storage
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.S3_BUCKET_NAME,
        acl: 'public-read', // Make the uploaded file publicly accessible
        key: function (req, file, cb) {
            cb(null, `${req.params.userId}/${Date.now().toString()}-${file.originalname}`);
        }
    }),
    limits: { fileSize: 1024 * 1024 * 5 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG and PNG are allowed!'), false);
        }
    }
});

exports.getAllImages = async (req, res) => {
    try {
        const listParams = {
            Bucket: process.env.S3_BUCKET_NAME,
        };

        const data = await s3.send(new ListObjectsV2Command(listParams));

        const images = data.Contents.map(item => {
            return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${item.Key}`;
        });

        res.status(200).json({
            status: 'success',
            images: images
        });
    } catch (error) {
        console.error('Error fetching images from S3:', error);
        res.status(500).json({
            status: 'fail',
            message: error.message
        });
    }
};

exports.uploadProfilePic = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                status: 'fail',
                message: 'File upload failed, no file received'
            });
        }

        const fileUrl = req.file.location;
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({
                status: 'fail',
                message: 'User not found'
            });
        }

        user.profilePic = fileUrl;
        await user.save({ validateModifiedOnly: true });

        res.status(200).json({
            status: 'success',
            message: 'Profile picture uploaded successfully',
            fileUrl: fileUrl
        });
    } catch (error) {
        console.error('Error during profile picture upload:', error);
        res.status(500).json({
            status: 'fail',
            message: error.message
        });
    }
};

exports.getProfilePic = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user || !user.profilePic) {
            return res.status(404).json({
                status: 'fail',
                message: 'User or profile picture not found'
            });
        }

        res.status(200).json({
            status: 'success',
            profilePic: user.profilePic
        });
    } catch (error) {
        console.error('Error fetching profile picture:', error);
        res.status(500).json({
            status: 'fail',
            message: error.message
        });
    }
};

exports.updateProfilePic = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                status: 'fail',
                message: 'File upload failed, no file received'
            });
        }

        const fileUrl = req.file.location;
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({
                status: 'fail',
                message: 'User not found'
            });
        }

        user.profilePic = fileUrl;
        await user.save();

        res.status(200).json({
            status: 'success',
            message: 'Profile picture updated successfully',
            fileUrl: fileUrl
        });
    } catch (error) {
        console.error('Error during profile picture update:', error);
        res.status(500).json({
            status: 'fail',
            message: error.message
        });
    }
};

exports.upload = upload;
