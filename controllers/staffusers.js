const { default: mongoose } = require("mongoose");
const Staffusers = require("../models/Staffusers")

exports.getadminlist = async (req, res) => {
    const {limit, page, search, status} = req.query

    const pageOptions = {
        page: parseInt(page) || 0,
        limit: parseInt(limit) || 10,
    };

    const matchStage = {
        auth: "admin",
        status: status
    }

    if (search){
        matchStage["$or"] = [
            { username: { $regex: search, $options: 'i' } }
        ]
    }

    const users = await Staffusers.aggregate([
        {
            $match: matchStage  // your filter here
        },
        {
            $project: {
                _id: 1,
                username: 1,
                authenticated: 1,
                createdAt: 1
            }
        },
        {
            $lookup: {
                from: "userdetails",         // the collection name (usually lowercase plural)
                localField: "_id",          // field from Jobs collection
                foreignField: "owner",        // field from Userdetails collection
                as: "ownerDetails"            // output array field
            }
        },
        {
            $unwind: { path: "$ownerDetails", preserveNullAndEmptyArrays: true }
        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $skip: pageOptions.page * pageOptions.limit
        },
        {
            $limit: pageOptions.limit
        }
    ]);

    console.log(users)

    const totalpage = await Staffusers.countDocuments(matchStage)

    if (users.length <= 0){
        return res.json({message: "success", data:{
            adminlist: [],
            totalpage: Math.ceil(totalpage / pageOptions.limit)
        }})
    }

    return res.json({message: "success", data: {
        adminlist: users,
        totalpage: Math.ceil(totalpage / pageOptions.limit)
    }})
}

exports.createstaffuser = async (req, res) => {
    const {username, password, auth} = req.body

    if (!username || !password || !auth){
        return res.status(400).json({message: "failed", data: "Please complete the form first and try again"})
    }

    const userlogin = await Staffusers.findOne({ username: { $regex: new RegExp('^' + username + '$', 'i') } })
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem getting existing users. Error: ${err}`)

        return res.status(400).json({message: "bad-request", data: "There's a problem creating user loggin! Please try again later."})
    })

    if (userlogin){
        return res.status(400).json({message: "failed", data: "There's an existing username! Please use other username."})
    }

    await Staffusers.create({username: username, password: password, auth: auth, status: "Active"})
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem creating user loggin. Error ${err}`)

        return res.status(400).json({message: "bad-request", data: "There's a problem creating user loggin! Please try again later."})
    })

    return res.json({message: "success", data: "Admin created successfully"})
}

exports.editstaffuser = async (req, res) => {
    const {id, username, password} = req.body

    if (!username || !password || !id){
        return res.status(400).json({message: "failed", data: "Please complete the form first and try again"})
    }
    
    const userlogin = await Staffusers.findOne({ username: { $regex: new RegExp('^' + username + '$', 'i') } })
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem getting existing users. Error: ${err}`)

        return res.status(400).json({message: "bad-request", data: "There's a problem creating user loggin! Please try again later."})
    })

    if (userlogin){
        return res.status(400).json({message: "failed", data: "There's an existing username! Please use other username."})
    }

    await Staffusers.findOneAndUpdate({_id: new mongoose.Types.ObjectId(id)}, {username: username, password: password})
    .catch(err => {
        console.log(`There's a problem updating admin users. Error: ${err}`)

        return res.status(400).json({message: "bad-request", data: "There's a problem editing admin login! Please try again later."})
    })

    return res.json({message: "success", data: `Successfully updated ${username}'s login details`})
}

exports.editstatusstaffuser = async (req, res) => {
    const {id, status} = req.body

    const user = await Staffusers.findOne({_id: new mongoose.Types.ObjectId(id)})
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem getting user. Error: ${err}`)

        return res.status(400).json({message: "bad-request", data: "There's a problem with the server. Please try again later"})
    })

    if (!user){
        return res.status(400).json({message: "failed", data: "Please select a valid user fist!"})
    }

    await Staffusers.findOneAndUpdate({_id: new mongoose.Types.ObjectId(id)}, {status: status})
    .catch(err => {
        console.log(`There's a problem updating user status. Error: ${err}`)

        return res.status(400).json({message: "bad-request", data: "There's a problem with the server. Please try again later"})
    })

    return res.json({message: "success"})
}