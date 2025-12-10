const { default: mongoose } = require("mongoose")
const Jobs = require("../models/Job")

exports.createjobs = async (req, res) => {
    const {id, username} = req.user

    const {title, description, salary, location} = req.body

    if (!title || !description || !salary || !location){
        return res.status(400).json({message: "failed", data: "Please complete the details first!"})
    }

    await Jobs.create({owner: new mongoose.Types.ObjectId(id), title: title, description: description, salary: salary, status: "Pending", location: location})
    .catch(err => {
        console.log(`problem creating jobs. Error ${err}`)
        
        return res.status(400).json({message: "bad-request", data: "There's a problem with the server. Please contact customer support for more details!"})
    })

    return res.json({message: "success"})
}

exports.showjobs = async (req, res) => {
    const {id, username} = req.user

    const {limit, page, search, location} = req.query

    const pageOptions = {
        page: parseInt(page) || 0,
        limit: parseInt(limit) || 12,
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

    if (location && location.trim() !== "") {
        matchStage.location = location;
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
            location: 1,
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
    const { id } = req.user;
    const { jobid } = req.query;

    const job = await Jobs.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(jobid)
            }
        },

        // Lookup owner details
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
        },

        // Lookup applicant details
        {
            $lookup: {
                from: "userdetails",
                localField: "applicants.employee",
                foreignField: "owner",
                as: "applicantDetails"
            }
        },

        // Merge applicant status into applicantDetails
        {
            $addFields: {
                applicantDetails: {
                    $map: {
                        input: "$applicantDetails",
                        as: "detail",
                        in: {
                            $mergeObjects: [
                                "$$detail",
                                {
                                    applicantStatus: {
                                        $let: {
                                            vars: {
                                                match: {
                                                    $arrayElemAt: [
                                                        {
                                                            $filter: {
                                                                input: "$applicants",
                                                                as: "app",
                                                                cond: {
                                                                    $eq: [
                                                                        "$$app.employee",
                                                                        "$$detail.owner"
                                                                    ]
                                                                }
                                                            }
                                                        },
                                                        0
                                                    ]
                                                }
                                            },
                                            in: "$$match.status"
                                        }
                                    }
                                }
                            ]
                        }
                    }
                }
            }
        },

        // Add computed fields
        {
            $addFields: {
                applicantCount: { $size: "$applicants" },

                isApplied: {
                    $gt: [
                        {
                            $size: {
                                $filter: {
                                    input: "$applicants",
                                    as: "applicant",
                                    cond: {
                                        $eq: [
                                            "$$applicant.employee",
                                            new mongoose.Types.ObjectId(id)
                                        ]
                                    }
                                }
                            }
                        },
                        0
                    ]
                }
            }
        },

        // Final projection (remove applicant.status)
        {
            $project: {
                title: 1,
                description: 1,
                salary: 1,
                status: 1,
                owner: 1,
                location: 1,
                createdAt: 1,
                updatedAt: 1,
                ownerDetails: 1,
                applicantDetails: 1,
                applicantCount: 1,
                isApplied: 1,

                // keep only employee IDs, remove status
                applicants: {
                    employee: 1
                }
            }
        }
    ]);

    return res.json({
        message: "success",
        data: { job: job[0] }
    });
};

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

exports.mypostedjobs = async (req, res) => {
    const {id, username} = req.user


    const {limit, page, search} = req.query

    const pageOptions = {
        page: parseInt(page) || 0,
        limit: parseInt(limit) || 10,
    };

    const matchStage = {
        owner: new mongoose.Types.ObjectId(id)
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
            location: 1,
            denyreason: 1,
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

exports.viewmyjobs = async (req, res) => {
  const { username } = req.user;
  const { limit, page } = req.query;

  const pageNum = parseInt(page) || 0;
  const limitNum = parseInt(limit) || 10;

  try {
    const jobs = await Jobs.aggregate([
      // unwind so we can work with a single applicant object per doc
      { $unwind: "$applicants" },

      // join the users collection to get employee username
      {
        $lookup: {
          from: "users",
          localField: "applicants.employee",
          foreignField: "_id",
          as: "employeeData"
        }
      },
      { $unwind: "$employeeData" },

      // only keep rows where this logged-in user is the employee
      {
        $match: {
          "employeeData.username": username,
          // include any statuses you care about here
          "applicants.status": { $in: ["Pending", "Approved", "Selected", "Not Selected"] }
        }
      },

      // bring in userdetails (may be empty)
      {
        $lookup: {
          from: "userdetails",
          localField: "employeeData._id",
          foreignField: "owner",
          as: "userDetails"
        }
      },
      { $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true } },

      // compute a normalized status and the selectedStatus output
      {
        $addFields: {
          // normalizedStatus: trim + lowercase so " Selected " or "selected" etc. matches
          normalizedApplicantStatus: {
            $toLower: {
              $trim: { input: { $ifNull: ["$applicants.status", "pending"] } }
            }
          }
        }
      },

      // build the applicants object we want to return and include selectedStatus
      {
        $addFields: {
          applicants: {
            employee: "$employeeData",
            details: "$userDetails",
            // keep original status as-is (optional) — comment out if you don't want it
            status: "$applicants.status"
          },
          
        selectedStatus: {
            $switch: {
            branches: [
                { case: { $eq: ["$normalizedApplicantStatus", "selected"] }, then: "Selected" },
                { case: { $eq: ["$normalizedApplicantStatus", "not selected"] }, then: "Not Selected" },
                { case: { $eq: ["$normalizedApplicantStatus", "approved"] }, then: "Approved" },
                { case: { $eq: ["$normalizedApplicantStatus", "pending"] }, then: "Pending" }
            ],
            default: "$applicants.status" // fallback to whatever original string is
            }
        }
        }
      },

      // optional: remove the temporary normalized field so final doc is clean
      { $project: { normalizedApplicantStatus: 0 } },

      // pagination
      { $skip: pageNum * limitNum },
      { $limit: limitNum }
    ]);

    // COUNT with same filters (must replicate the same matching logic)
    const totalCountAgg = [
      { $unwind: "$applicants" },
      {
        $lookup: {
          from: "users",
          localField: "applicants.employee",
          foreignField: "_id",
          as: "employeeData"
        }
      },
      { $unwind: "$employeeData" },
      {
        $match: {
          "employeeData.username": username,
          "applicants.status": { $in: ["Pending", "Approved", "Selected", "Not Selected"] }
        }
      },
      { $count: "count" }
    ];

    const totalCount = await Jobs.aggregate(totalCountAgg);
    const total = totalCount.length > 0 ? totalCount[0].count : 0;

    return res.json({
      message: "success",
      data: {
        jobs,
        totalpage: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "bad-request",
      data: `There's a problem with the server. Error: ${error}`
    });
  }
};



exports.selectemployeeforjob = async (req, res) => {
    const { employeeid, jobid } = req.body;

    try {
        // Update job status to Close and mark selected applicant
        const updatedJob = await Jobs.findByIdAndUpdate(
            jobid,
            {
                $set: {
                    status: "Close",
                    "applicants.$[selected].status": "Selected",
                    "applicants.$[others].status": "Not Selected"
                }
            },
            {
                new: true,
                arrayFilters: [
                    { "selected.employee": new mongoose.Types.ObjectId(employeeid) },
                    { "others.employee": { $ne: new mongoose.Types.ObjectId(employeeid) } }
                ]
            }
        );

        if (!updatedJob) {
            return res.status(404).json({ message: "failed", data: "Please select a valid employee/job" });
        }

        return res.json({ message: "success" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "bad-request", data: error });
    }
};

exports.editjob = async (req, res) => {
    const {jobid, title, description, salary, location} = req.body

    if (!jobid){
        return res.status(400).json({message: "failed", data: "Please select a valid job"})
    }

    if (!title || !description || !salary || !location){
        return res.status(400).json({message: "failed", data: "Please complete the form first"})
    }

    await Jobs.findOneAndUpdate({_id: new mongoose.Types.ObjectId(jobid)}, {title: title, description: description, salary: salary, location: location})
    .catch(err => {
        console.log(`There's a problem updating job details. Error: ${err}`)
        return res.status(400).json({message: "failed", data: "There's a problem updating job details. Please contact customer support for more details"})
    })

    return res.json({message: "success"})
}

//#region SUPERADMIN

exports.showjobspendingsa = async (req, res) => {
    const {id, username} = req.user

    const {limit, page, search} = req.query

    const pageOptions = {
        page: parseInt(page) || 0,
        limit: parseInt(limit) || 10,
    };

    const matchStage = {
        status: "Pending"
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
            location: 1,
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

exports.showjobsdeniedsa = async (req, res) => {
    const {id, username} = req.user

    const {limit, page, search} = req.query

    const pageOptions = {
        page: parseInt(page) || 0,
        limit: parseInt(limit) || 10,
    };

    const matchStage = {
        status: "Deny"
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
            location: 1,
            denyreason: 1,
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

exports.updatestatusjob = async (req, res) => {
    const {id} = req.user

    const {jobid, status, denyreason} = req.body

    if (!jobid){
        return res.status(400).json({message: "success", data: "Please select a valid job first!"})
    }

    await Jobs.findOneAndUpdate({_id: new mongoose.Types.ObjectId(jobid)}, {status: status, denyreason: denyreason})
    .catch(err => {
        console.log(`problem approving jobs. Error ${err}`)
        
        return res.status(400).json({message: "bad-request", data: "There's a problem with the server. Please contact customer support for more details!"})
    })

    return res.json({message: "success", data: "You have successfully $"})
}

//#endregion