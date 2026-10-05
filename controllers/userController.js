//decript using bcrypt
const bcrypt = require('bcrypt')
const users = require('../models/userModel')
const jwt = require('jsonwebtoken')

//register
exports.registerController = async (req, res) => {
    console.log("inside registerController");
    console.log(req.body);

    const { username, email, password } = req.body
    // check email is in database
    const existingUser = await users.findOne({ email })
    if (existingUser) {
        res.status(409).json("User Already Exist... Please Login!!!")
    } else {
        //encrypt the password
        let encryptPassword = await bcrypt.hash(password, 10)
        //insert new document to database
        const newUser = await users.create({
            username, email, password: encryptPassword
        })
        res.status(201).json(newUser)
    }

    res.status(201).json("register request recevied!!")
}

//login
exports.loginController = async (req, res) => {
    console.log("inside registerController");
    console.log(req.body);

    const { email, password } = req.body
    // check email is in database
    const existingUser = await users.findOne({ email })
    if (existingUser) {
    //  check password
    const isPasswordMatch=await bcrypt.compare(password,existingUser.password)
    if(isPasswordMatch){
        const token=jwt.sign({userMail:email,role:existingUser.role},process.env.JWTSECRET)
        res.status(200).json({user:existingUser,token})
    }else{
        res.status(409).json("Invalied Password!!!")
    }
    } else {
        res.status(409).json("Invalid Email.... Please Register!!!")
    }
}
//edit user

//edit admin