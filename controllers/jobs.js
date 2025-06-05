const { default: mongoose } = require("mongoose")
const Jobs = require("../models/Job")

exports.createjobs = async (req, res) => {
    const {id, username} = req.user

    const {title, description, salary} = req.body

    if (!title || !description || !salary){
        return res.status(400).json({message: "failed", data: "Please complete the details first!"})
    }

    await Jobs.create({owner: new mongoose.Types.ObjectId(id), title: title, description: description, salary: salary, status: "Pending"})
    .catch(err => {
        console.log(`problem creating jobs. Error ${err}`)
        
        return res.status(400).json({message: "bad-request", data: "There's a problem with the server. Please contact customer support for more details!"})
    })

    return res.json({message: "success"})
}

exports.showjobs = async (req, res) => {
    const {id, username} = req.user


    const {limit, page, search} = req.query

    const pageOptions = {
        page: parseInt(page) || 0,
        limit: parseInt(limit) || 10,
    };

    const matchStage = {
        status: "Open"
    };

    if (search){
        matchStage["$or"] = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: "i" } },
        ]
    }

    const jobsWithApplicantCount = await Jobs.aggregate([
        {
            $match: matchStage  // your filter here
        },
        {
            $project: {
            title: 1,
            description: 1,
            salary: 1,
            status: 1,
            owner: 1,
            createdAt: 1,
            updatedAt: 1,
            applicantCount: { $size: "$applicants" }
            }
        },
        {
            $lookup: {
            from: "userdetails",         // the collection name (usually lowercase plural)
            localField: "owner",          // field from Jobs collection
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

    const totalpage = await Jobs.countDocuments(matchStage)

    if (jobsWithApplicantCount.length <= 0){
        return res.json({message: "success", data:{
            jobs: [],
            totalpage: Math.ceil(totalpage / pageOptions.limit)
        }})
    }

    return res.json({message: "success", data: {
        jobs: jobsWithApplicantCount,
        totalpage: Math.ceil(totalpage / pageOptions.limit)
    }})
}

exports.getjobdetails = async (req, res) => {
    const {id, username} = req.user

    const {jobid} = req.query

    const job = await Jobs.aggregate([
        {
            $match: {
            _id: new mongoose.Types.ObjectId(jobid)
            }
        },
        {
            $project: {
            title: 1,
            description: 1,
            salary: 1,
            status: 1,
            owner: 1,
            createdAt: 1,
            updatedAt: 1,
            applicantCount: { $size: "$applicants" },

            // Check if employeeId is in applicants.applicants.employee
            isApplied: {
                $gt: [
                {
                    $size: {
                    $filter: {
                        input: "$applicants",
                        as: "applicant",
                        cond: {
                        $eq: ["$$applicant.employee", new mongoose.Types.ObjectId(id)]
                        }
                    }
                    }
                },
                0
                ]
            }
            }
        },
        {
            $lookup: {
            from: "userdetails",
            localField: "owner",
            foreignField: "owner",
            as: "ownerDetails"
            }
        },
        {
            $unwind: { path: "$ownerDetails", preserveNullAndEmptyArrays: true }
        }
    ]);

    return res.json({message: "success", data: {
        job: job[0]
    } })
}

exports.applyjob = async (req, res) => {
    const {id, username} = req.user

    const {jobid} = req.body

    await Jobs.findOneAndUpdate({_id: new mongoose.Types.ObjectId(jobid)}, {
        $push: {
            "applicants": {
                employee: new mongoose.Types.ObjectId(id),
                status: "Pending"
            }
        }
    })

    return res.json({message: "success"})
}