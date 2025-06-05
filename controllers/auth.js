const Users = require("../models/Users")
const Staffusers = require("../models/Staffusers")
const fs = require('fs')

const bcrypt = require('bcrypt');
const jsonwebtokenPromisified = require('jsonwebtoken-promisified');
const path = require("path");
const privateKey = fs.readFileSync(path.resolve(__dirname, "../keys/private-key.pem"), 'utf-8');
const { default: mongoose } = require("mongoose");

const encrypt = async password => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
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
            auth: admindata.auth
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

    console.log(userdata)

    return res.json({message: "success", data: {
        auth: userdata.auth
    }})
}

exports.logout = async (req, res) => {
    res.clearCookie('sessionToken', { sameSite: 'None', secure: true })
    return res.json({message: "success"})
}