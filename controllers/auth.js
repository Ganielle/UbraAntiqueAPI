const Users = require("../models/Users")
const Staffusers = require("../models/Staffusers")
const Userdetails = require("../models/Userdetails")
const Verificationcode = require("../models/Verificationcode")
const fs = require('fs')
const crypto = require('crypto')

const bcrypt = require('bcrypt');
const jsonwebtokenPromisified = require('jsonwebtoken-promisified');
const path = require("path");
const privateKey = fs.readFileSync(path.resolve(__dirname, "../keys/private-key.pem"), 'utf-8');
const { default: mongoose } = require("mongoose");

const encrypt = async password => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

function generateNumericOTP(length = 6) {
  // ensures leading zeros are possible (e.g., 003219)
  const max = 10 ** length;
  const n = crypto.randomInt(0, max);
  return n.toString().padStart(length, "0");
}

exports.login = async (req, res) => {
    const {username, password} = req.query

    const userdata = await Users.findOne({ username: { $regex: new RegExp('^' + username + '$', 'i') } })
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem logging in your account ${username}. Error ${err}`)
        
        return res.status(400).json({message: "bad-request", data: "There's a problem logging in your account. Please contact customer support for more details!"})
    })

    if (!userdata){

        const admindata = await Staffusers.findOne({ username: { $regex: new RegExp('^' + username + '$', 'i') } })
        .catch(err => {
            console.log(`There's a problem logging in your account ${username}. Error ${err}`)
            
            return res.status(400).json({message: "bad-request", data: "There's a problem logging in your account. Please contact customer support for more details!"})
        })

        if (!admindata){
            return res.status(400).json({message: "failed", data: "No user found! Please use your valid credentials and try again"})
        }

        if (!(await admindata.matchPassword(password))){
            return res.status(400).json({message: "failed", data: "Password incorrect! Please input your valid password and try again."})
        }

        const token = await encrypt(privateKey)

        await Staffusers.findByIdAndUpdate({_id: admindata._id}, {$set: {token: token}}, { new: true })
        .catch(err => {
            console.log(`There's a problem logging in your account ${username}. Error ${err}`)
            
            return res.status(400).json({message: "bad-request", data: "There's a problem logging in your account. Please contact customer support for more details!"})
        })

        const payload = { id: admindata._id, username: admindata.username, token: token, auth: "admin" }

        let jwtoken = ""

        try {
            jwtoken = await jsonwebtokenPromisified.sign(payload, privateKey, { algorithm: 'RS256' });
        } catch (error) {
            console.error('Error signing token:', error.message);
            return res.status(500).json({ error: 'Internal Server Error', data: "There's a problem signing in! Please contact customer support for more details! Error 004" });
        }

        res.cookie('sessionToken', jwtoken, { secure: true, sameSite: 'None' } )

        return res.json({message: "success", data: {
            auth: admindata.auth,
            authenticated: true
        }})
    }

    if (!(await userdata.matchPassword(password))){
        return res.status(400).json({message: "failed", data: "Password incorrect! Please input your valid password and try again."})
    }

    const token = await encrypt(privateKey)

    await Users.findByIdAndUpdate({_id: userdata._id}, {$set: {token: token}}, { new: true })
    .catch(err => {
        console.log(`There's a problem logging in your account ${username}. Error ${err}`)
        
        return res.status(400).json({message: "bad-request", data: "There's a problem logging in your account. Please contact customer support for more details!"})
    })

    const payload = { id: userdata._id, username: userdata.username, token: token, auth: userdata.auth }

    let jwtoken = ""

    try {
        jwtoken = await jsonwebtokenPromisified.sign(payload, privateKey, { algorithm: 'RS256' });
    } catch (error) {
        console.error('Error signing token:', error.message);
        return res.status(500).json({ error: 'Internal Server Error', data: "There's a problem signing in! Please contact customer support for more details! Error 004" });
    }
    
    res.cookie('sessionToken', jwtoken, { secure: true, sameSite: 'None' } )

    if (userdata.authenticated == false){

        const generatedOTP = generateNumericOTP()

        await Verificationcode.create({owner: new mongoose.Types.ObjectId(userdata._id), code: generatedOTP})

        const userdetails = await Userdetails.findOne({owner: new mongoose.Types.ObjectId(userdata._id)})

        const payload = {
            service_id: process.env.EMAIL_JS_SERVICE_ID,
            template_id: process.env.EMAIL_JS_TEMPLATE_ID,
            user_id: process.env.EMAIL_JS_PUBLIC_KEY,
            accessToken: process.env.EMAIL_JS_PRIVATE_KEY,
            template_params: {
                passcode: `${generatedOTP}`,
                email: userdetails.email
            }
        };

        const emailresponse = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        })

        const result = await emailresponse.text();

        console.log(result)

        if (result !== 'OK'){
            return res.status(400).json({message: "failed", data: "Failed to send verification code. Please contact customer support"})
        }
    }

    return res.json({message: "success", data: {
        auth: userdata.auth,
        authenticated: userdata.authenticated
    }})
}

exports.logout = async (req, res) => {
    res.clearCookie('sessionToken', { sameSite: 'None', secure: true })
    return res.json({message: "success"})
}

exports.regenerateotp = async (req, res) => {
    const {id} = req.user

    const generatedOTP = generateNumericOTP()

    await Verificationcode.create({owner: new mongoose.Types.ObjectId(id), code: generatedOTP})

    const userdetails = await Userdetails.findOne({owner: new mongoose.Types.ObjectId(id)})

    const payload = {
        service_id: process.env.EMAIL_JS_SERVICE_ID,
        template_id: process.env.EMAIL_JS_TEMPLATE_ID,
        user_id: process.env.EMAIL_JS_PUBLIC_KEY,
        accessToken: process.env.EMAIL_JS_PRIVATE_KEY,
        template_params: {
            passcode: `${generatedOTP}`,
            email: userdetails.email
        }
    };

    const emailresponse = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    })

    const result = await emailresponse.text();

    console.log(result)

    if (result !== 'OK'){
        return res.status(400).json({message: "failed", data: "Failed to send verification code. Please contact customer support"})
    }

    return res.json({message: "success"})
}

exports.validateotp = async (req, res) => {
    const {id} = req.user

    const {verificationcode} = req.body

    console.log(id)
    console.log("waaat")

    const code = await Verificationcode.find({owner: new mongoose.Types.ObjectId(id)})
    .sort({createdAt: -1})
    .limit(1)

    if (code.length <= 0){
        return res.status(401).json({message: "failed"})
    }

    if (code[0].code != verificationcode){
        return res.status(400).json({message: "failed", data: "The code is not valid! Please enter a valid code sent to your email."})
    }

    const user = await Users.findOneAndUpdate({_id: new mongoose.Types.ObjectId(id)}, {authenticated: true})

    return res.json({message: "success", data: {
        auth: user.auth
    }})
}