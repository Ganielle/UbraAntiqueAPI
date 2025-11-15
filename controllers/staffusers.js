const Staffusers = require("../models/Staffusers")

exports.getadminlist = async (req, res) => {
    const {limit, page, search} = req.query

    const pageOptions = {
        page: parseInt(page) || 0,
        limit: parseInt(limit) || 10,
    };

    const matchStage = {
        auth: "admin"
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