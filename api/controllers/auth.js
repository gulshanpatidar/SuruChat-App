const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');


// function for user signup
exports.userSignup = async (req,res,next) => {
  console.log(req.body.username,req.body.email,req.body.password)
    const errors = validationResult(req);
    console.log(errors)
    if(!errors.isEmpty()) {
        const error = new Error('Validation failed,entered data is incorrect');
        error.statusCode = 422;
        return next(error);
    }
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    try {
        const hashedPw = await bcrypt.hash(password, 12);
        const user = new  User({
            username:username,
            email:email,
            password:hashedPw
        })
       await user.save();
       res.status(200).json({
           message:"User Signup Successfully"
       })
       console.log(message)
    }catch (err) {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      }
}

// function for user login
exports.userLogin = async (req,res,next) => {
 const username = req.body.username;
 const password = req.body.password;
 let loadedUser;
 try {
 const user = await User.findOne({username:username});
 if (!user) {
     const error = new Error('No user found.');
     error.statusCode = 422;
     return next(error);
 }
 loadedUser = user;
 const isEqual = await bcrypt.compare(password, user.password);
 if (!isEqual) {
   const error = new Error('Wrong password!');
   error.statusCode = 401;
   return next(error);
 }
 const token = jwt.sign(
   {
     email: loadedUser.email,
     userId: loadedUser._id.toString()
   },
   'somesupersecretsecret',
   { expiresIn: '1h' }
 );

 res.status(200).json({ token: token, userId: loadedUser._id.toString()});
 } catch (err) {
    if(! err.statusCode) {
        err.statusCode = 500
    }
     next(err);
   }
}