const Users = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const sendMail = require("./sendMail");


const {CLIENT_URL} = process.env

const userCtrl = {
    //registering new account
    register: async (req, res) => {
        try {
            const { name, email, password } = req.body

            if (!name || !email || !password) return res.status(400).json({ msg: "Please fill all the feilds" })
            
            if(!validateEmail(email)) return res.status(400).json({msg : "Invalid Email"})

            const user = await Users.findOne({email})
            if(user) return res.status(400).json({msg : "This email already exists"})

            if(password.length < 6) return res.status(400).json({msg : "Password must be atleast 6 characters"})

            const passwordHash = await bcrypt.hash(password, 12)
            
            // const newUser = {
            //     name, email, password : passwordHash
            // }
            // const activation_token = createActivationToken(newUser) 
            // const url = `${CLIENT_URL}/user/activate/${activation_token}`
            // sendMail(email, url, "Verify email address")

            const newUser = new Users({
                name, email, password : passwordHash
            })
            await newUser.save();

            res.json({ msg: "Registration Success! You are ready to Login" })
        } catch (error) {
            return res.status(500).json({ msg: error.message })
        }
    },
    //verify account through email
    // activateEmail : async (req,res) => {
    //     try {
    //         const {activation_token} = req.body
    //         const user = jwt.verify(activation_token, process.env.ACTIVATION_SECRET_TOKEN)
            
    //         const {name, email, password} = user

    //         const check = await Users.findOne({email})
    //         if(check) return res.status(400).json({msg : "This email already exists"})

    //         const newUser = new Users({
    //             name, email, password
    //         })
    //         await newUser.save();
    //         res.json({msg : "Account activated succesfully"})

    //     } catch (error) {
    //         return res.status(500).json({ msg: error.message })
    //     }
    // },

    //login
    login : async (req,res) =>  {
        try {
            const {email, password} = req.body
            const user = await Users.findOne({email})
            if(!user) return res.status(400).json({msg : "Email id does not exists"})

            const isMatch = await bcrypt.compare(password, user.password)
            if(!isMatch)  return res.status(400).json({msg : "Email id or Password did not match"})

            //console.log(user)
            const refresh_token = createRefreshToken({id : user._id})
            res.cookie("refreshtoken", refresh_token, {
                httpOnly :true,
                path : "/user/refresh_token",
                maxAge : 7*24*60*60*1000 // 7 days time
            })
            res.json({msg : "Login Succesfull"})

        } catch (error) {
            return res.status(500).json({ msg: error.message })
        }
    },
    //get Access Token
    getAccessToken : (req,res) => {
        try {
            const rf_token = req.cookies.refreshtoken
            if(!rf_token) return res.status(400).json({msg : "Please login to continue"})

            jwt.verify(rf_token, process.env.REFRESH_SECRET_TOKEN, (err, user) => {
                if(err) return res.status(400).json({msg : "Please login to continue"})

                const access_token = createAccessToken({id : user.id})
                res.json({access_token})
                console.log(user)
            })
        } catch (error) {
            return res.status(500).json({ msg: error.message })
        }
    },
    //forgot password
    forgotPassword : async (req,res) => {
        try {
            const {email} = req.body
            const user = await Users.findOne({email})
            if(!user) return res.status(400).json({msg : "This email does not exists"})

            const access_token = createAccessToken({id : user._id})
            const url = `${CLIENT_URL}/user/resetPassword/${access_token}`
            sendMail(email, url, "Reset Password Link")
            res.json({msg : "Reset Password Link sent to your mail - Please Check!"})
        } catch (error) {
            return res.status(500).json({ msg: error.message })
        }
    },
    //reset Password
    resetPassword: async (req, res) => {
        try {
            const {password} = req.body
            //console.log(password)
            const passwordHash = await bcrypt.hash(password, 12)

            await Users.findOneAndUpdate({_id: req.user.id}, {
                password: passwordHash
            })

            res.json({msg: "Password successfully changed!"})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    //logout
    logout : async (req,res) => {
        try {
            res.clearCookie("refreshtoken", {path : "/user/refresh_token"})
            return res.json({msg : "Logged out succesfull"})
        } catch (error) {
            return res.status(500).json({ msg: error.message })
        }
    }
}



const validateEmail = (email) => {
    const res = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return res.test(email);
};

const createActivationToken = (payload) => {
    return jwt.sign(payload ,process.env.ACTIVATION_SECRET_TOKEN, {expiresIn : "10m"})
}

const createAccessToken = (payload) => {
    return jwt.sign(payload ,process.env.ACCESS_SECRET_TOKEN, {expiresIn : "60m"})
}

const createRefreshToken = (payload) => {
    return jwt.sign(payload ,process.env.REFRESH_SECRET_TOKEN, {expiresIn : "7d"})
}



module.exports = userCtrl