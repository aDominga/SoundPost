const express = require('express');
const controller = require('../controllers/userController');
const {body} = require('express-validator');


//requiring middleware methods
//to check if logged in or guest
const { isGuest, isLoggedIn } = require('../middlewares/auth');


const router = express.Router();


//GET /users/new: send html form for creating a new user account
//& checks if user is a guest
router.get('/new', isGuest, controller.new);

//GET /users/login: send html for logging in
//& checks if user is a guest
router.get('/login', isGuest, controller.getUserLogin);

//GET /users/profile: send user's profile page
//& checks if user is logged in
router.get('/profile', isLoggedIn, controller.profile);

//POST /users: create a new user 
//& checks if user is a guest
router.post('/', isGuest,
[body('firstName', 'First Name Is Required').trim().escape(),
body('lastName', 'Last Name is Required').trim().escape(),
body('email', 'Email must be a valid email address').isEmail().trim().escape().normalizeEmail(),
body('password', 'Password must be at least 8 characters and at most 64 characters').isLength({min: 8, max: 64})]
, controller.create);

//POST /users/login sends post for log in
//& checks if user is a guest
router.post('/login', isGuest,
[body('email', 'Email must be a valid email address').isEmail().trim().escape().normalizeEmail(),
body('password', 'Password must be at least 8 characters and at most 64 characters').isLength({min: 8, max: 64})],
controller.login);

//GET /users/logout destroys session
//& checks if user is logged in
router.get('/logout', isLoggedIn, controller.logout);


module.exports = router;