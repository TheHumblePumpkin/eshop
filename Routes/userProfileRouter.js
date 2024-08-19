const express = require('express');
const userProfileController = require('../Controllers/userProfileController');
const router = express.Router();

router.get('/get-all-images', userProfileController.getAllImages);

router.post('/upload-profile-pic/:userId', userProfileController.upload.single('profilePic'), userProfileController.uploadProfilePic);

router.get('/profile-pic/:userId', userProfileController.getProfilePic);

router.put('/update-profile-pic/:userId', userProfileController.upload.single('profilePic'), userProfileController.updateProfilePic);

module.exports = router;

