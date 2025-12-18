const Jobs = require("../models/Job")
const Forums = require("../models/Forums")
const Users = require("../models/Users")
const Staffusers = require("../models/Staffusers")

exports.sadashboard = async (req, res) => {
    
    const totaljob = await Jobs.countDocuments();
    const totalapprovedjobs = await Jobs.countDocuments({status: "Open"})
    const totaldeniedjobs = await Jobs.countDocuments({status: "Deny"})
    const totalpendingjobs = await Jobs.countDocuments({status: "Pending"})
    const totalforums = await Forums.countDocuments({status: "Open"})
    const totalusers = await Users.countDocuments();
    const totaluser = await Users.countDocuments({auth: "employee"})
    const totalemployer = await Users.countDocuments({auth: "employer"})
    const totaladmin = await Staffusers.countDocuments({auth: "admin"})

    return res.json({message: "success", data: {
        totaljob,
        totalapprovedjobs,
        totaldeniedjobs,
        totalpendingjobs,
        totalforums,
        totalusers,
        totaluser,
        totalemployer,
        totaladmin
    }})
}