const express = require ('express');
const router = express.Router();
const {registerUser, loginUser, getUserProfile} = require('../controllers/userController');
const authenticateUser = require('../middleware/auth');


router.post('/register', registerUser);
router.post('/login',loginUser);
router.get('/profile', authenticateUser, getUserProfile)

module.exports = router;