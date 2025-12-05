const Users = require("../models/Users")
const Userdetails = require("../models/Userdetails")
const Featureddocuments = require("../models/Featureddocuments")
const { default: mongoose } = require("mongoose")

exports.createusers = async (req, res) => {

    const {userusername, email, password, firstname, lastname, profiletype} = req.body

    if (!userusername || !email || !password || !firstname || !lastname || !profiletype){
        return res.status(400).json({message: "failed", data: "Please complete the form first and try again"})
    }

    const userlogin = await Users.findOne({ username: { $regex: new RegExp('^' + userusername + '$', 'i') } })
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem getting existing users. Error: ${err}`)

        return res.status(400).json({message: "bad-request", data: "There's a problem creating user loggin! Please try again later."})
    })

    if (userlogin){
        return res.status(400).json({message: "failed", data: "There's an existing username! Please use other username."})
    }

    const userdeets = await Userdetails.findOne({ firstname: { $regex: new RegExp('^' + firstname + '$', 'i') }, lastname: { $regex: new RegExp('^' + lastname + '$', 'i') } })
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem getting existing users details. Error: ${err}`)

        return res.status(400).json({message: "bad-request", data: "There's a problem creating user loggin! Please try again later."})
    })

    if (userdeets){
        return res.status(400).json({message: "failed", data: `There's an existing ${profiletype}!.`})
    }

    const userlogindeets = await Users.create({username: userusername, password: password, auth: profiletype, authenticated: false})
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem creating user loggin. Error ${err}`)

        return res.status(400).json({message: "bad-request", data: "There's a problem creating user loggin! Please try again later."})
    })

    await Userdetails.create({owner: new mongoose.Types.ObjectId(userlogindeets._id), email: email, firstname: firstname, lastname: lastname, aboutme: ""})
    .catch(async err => {
        console.log(`There's a problem creating user details. Error ${err}`)

        await Users.findOneAndDelete({username: userusername})

        return res.status(400).json({message: "bad-request", data: "There's a problem creating user loggin! Please try again later."})
    })

    return res.json({message: "success"})
}

exports.getuserdata = async (req, res) => {
    const {id} = req.user
    
    const data = await Userdetails.findOne({owner: new mongoose.Types.ObjectId(id)})
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem getting user data. Error: ${err}`)

        return res.status(400).json({message: "bad-request", data: `There's a problem with the server. Error: ${err}`})
    })

    if (!data){
        return res.json({message: "success", data: {
            name: "No user!",
            aboutme: "No about me yet!",
            status: "No status!",
            documents: [],
            experience: "No experience!",
            education: "No education yet!"
        }})
    }


    const filedata = await Featureddocuments.find({owner: new mongoose.Types.ObjectId(id)})
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem getting user data. Error: ${err}`)

        return res.status(400).json({message: "bad-request", data: `There's a problem with the server. Error: ${err}`})
    })

    const tempfiledata = []

    filedata.forEach(temp => {
        const {_id, title, description, filetype, path} = temp

        tempfiledata.push({
            id: _id,
            title: title,
            description: description,
            type: filetype,
            path: path
        })
    })


    return res.json({message: "success", data: {
        name: `${data.firstname} ${data.lastname}`,
        aboutme: data.aboutme,
        status: data.status,
        documents: tempfiledata,
        experience: data.experience,
        education: data.education
    }})
}

exports.editaboutme = async (req, res) => {
    const {id, username} = req.user

    const {aboutme} = req.body

    console.log(aboutme)

    await Userdetails.findOneAndUpdate({owner: new mongoose.Types.ObjectId(id)}, {aboutme: aboutme})
    .catch(err =>{
        console.log(`There's a problem saving about me. Error: ${err}`)

        return res.status(400).json({message: "bad-request", data: `There's a problem with the server. Error: ${err}`})
    })

    return res.json({message: "success", data: "Successfully edited about me section"})
}

exports.editexperience = async (req, res) => {
    const {id, username} = req.user

    const {experience} = req.body

    await Userdetails.findOneAndUpdate({owner: new mongoose.Types.ObjectId(id)}, {experience: experience})
    .catch(err =>{
        console.log(`There's a problem saving experience. Error: ${err}`)

        return res.status(400).json({message: "bad-request", data: `There's a problem with the server. Error: ${err}`})
    })

    return res.json({message: "success", data: "Successfully edited experience section"})
}

exports.editeducation = async (req, res) => {
    const {id, username} = req.user

    const {education} = req.body

    await Userdetails.findOneAndUpdate({owner: new mongoose.Types.ObjectId(id)}, {education: education})
    .catch(err =>{
        console.log(`There's a problem saving education. Error: ${err}`)

        return res.status(400).json({message: "bad-request", data: `There's a problem with the server. Error: ${err}`})
    })

    return res.json({message: "success", data: "Successfully edited education section"})
}

exports.editstatus = async (req, res) => {
    const {id, username} = req.user

    const {status} = req.body

    await Userdetails.findOneAndUpdate({owner: new mongoose.Types.ObjectId(id)}, {status: status})
    .catch(err =>{
        console.log(`There's a problem saving status. Error: ${err}`)

        return res.status(400).json({message: "bad-request", data: `There's a problem with the server. Error: ${err}`})
    })

    return res.json({message: "success", data: "Successfully edited status section"})
}

exports.editfeatureddocuments = async (req, res) => {
    const {id, username} = req.user

    const {title, description} = req.body

    let filepath = ""

    if (req.file){
        filepath = req.file.path
    }
    else{
        return res.status(400).json({message: "failed", data: "Please upload a file for your featured documents!"})
    }

    const extension = filepath.split('.').pop()

    await Featureddocuments.create({owner: new mongoose.Types.ObjectId(id), title: title, description: description, path: filepath, filetype: extension})
    .then(data => data)
    .catch(err =>{
        console.log(`There's a problem saving status. Error: ${err}`)

        return res.status(400).json({message: "bad-request", data: `There's a problem with the server. Error: ${err}`})
    })

    return res.json({message: "success", data: "Successfully added featured documents section"})
}

exports.deletefeatureddocuments = async (req, res) => {
    const {id, username} = req.user

    const {docuid} = req.body

    await Featureddocuments.findOneAndDelete({owner: new mongoose.Types.ObjectId(id), _id: new mongoose.Types.ObjectId(docuid)})
    .catch(err =>{
        console.log(`There's a problem deleting documents. Error: ${err}`)

        return res.status(400).json({message: "bad-request", data: `There's a problem with the server. Error: ${err}`})
    })

    return res.json({message: "success"})
}

//  #region SUPERADMIN

exports.getuserlist = async(req, res) => {
    const {limit, page, search} = req.query

    const pageOptions = {
        page: parseInt(page) || 0,
        limit: parseInt(limit) || 10,
    };

    const matchStage = {
        auth: "employee"
    }

    if (search){
        matchStage["$or"] = [
            { username: { $regex: search, $options: 'i' } }
        ]
    }

    const users = await Users.aggregate([
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

    const totalpage = await Users.countDocuments(matchStage)

    if (users.length <= 0){
        return res.json({message: "success", data:{
            userlist: [],
            totalpage: Math.ceil(totalpage / pageOptions.limit)
        }})
    }

    return res.json({message: "success", data: {
        userlist: users,
        totalpage: Math.ceil(totalpage / pageOptions.limit)
    }})
}

//  #endregion