const { default: mongoose } = require("mongoose");
const Forums = require("../models/Forums")
const Forumscomment = require("../models/Forumscomments");

exports.myforums = async (req, res) => {
  const {id} = req.user;
  const { limit = 10, page = 0 } = req.query;

  try {
    const forums = await Forums.aggregate([
      // 1️⃣ Only my forum posts
      {
        $match: {
          owner: new mongoose.Types.ObjectId(id)
        }
      },

      // 2️⃣ Join Users (optional: username)
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },

      // 3️⃣ Join User Details (firstname, lastname)
      {
        $lookup: {
          from: "userdetails",
          localField: "owner",
          foreignField: "owner",
          as: "userDetails"
        }
      },
      {
        $unwind: {
          path: "$userDetails",
          preserveNullAndEmptyArrays: true
        }
      },

      // 4️⃣ Shape the output
      {
        $project: {
          title: 1,
          content: 1,
          tag: 1,
          status: 1,
          createdAt: 1,

          owner: {
            _id: "$user._id",
            username: "$user.username",
            firstname: "$userDetails.firstname",
            lastname: "$userDetails.lastname"
          }
        }
      },

      // 5️⃣ Pagination
      { $sort: { createdAt: -1 } },
      { $skip: page * parseInt(limit) },
      { $limit: parseInt(limit) }
    ]);

    const total = await Forums.countDocuments({ owner: new mongoose.Types.ObjectId(id) });

    return res.json({
      message: "success",
      data: {
        forums,
        totalpage: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "bad-request",
      data: "Server error"
    });
  }
};

exports.postforum = async (req, res) => {
    const {id} = req.user
    const {title, content, tag} = req.body

    if (!title || !content || !tag){
        return res.status(400).json({message: "failed", data: "Please complete the forms first!"})
    }

    await Forums.create({owner: new mongoose.Types.ObjectId(id), title: title, content : content, tag: tag, status: "Pending"})
    .catch(err => {
        console.log(`problem creating forums. Error ${err}`)
        
        return res.status(400).json({message: "bad-request", data: "There's a problem with the server. Please contact customer support for more details!"})
    })

    return res.json({message: "success"})
}

exports.updatestatus = async (req, res) => {
    const {id} = req.user

    const {forumid, status, denyreason} = req.body

    if (!forumid){
        return res.status(400).json({message: "success", data: "Please select a valid job first!"})
    }

    await Forums.findOneAndUpdate({_id: new mongoose.Types.ObjectId(forumid)}, {status: status})
    .catch(err => {
        console.log(`problem approving forum. Error ${err}`)
        
        return res.status(400).json({message: "bad-request", data: "There's a problem with the server. Please contact customer support for more details!"})
    })

    return res.json({message: "success", data: "You have successfully approved the posted forum"})
}

exports.approvallist = async (req ,res) => {
  const {id} = req.user;
  const { limit = 10, page = 0, status, search } = req.query;

  const matchStage = {
      status: status
  };

  if (search){
      matchStage["$or"] = [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: "i" } },
      ]
  }

  try {
    const forums = await Forums.aggregate([
      // 1️⃣ Only my forum posts
      {
        $match: matchStage
      },

      // 2️⃣ Join Users (optional: username)
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },

      // 3️⃣ Join User Details (firstname, lastname)
      {
        $lookup: {
          from: "userdetails",
          localField: "owner",
          foreignField: "owner",
          as: "userDetails"
        }
      },
      {
        $unwind: {
          path: "$userDetails",
          preserveNullAndEmptyArrays: true
        }
      },

      // 4️⃣ Shape the output
      {
        $project: {
          title: 1,
          content: 1,
          tag: 1,
          status: 1,
          createdAt: 1,

          owner: {
            _id: "$user._id",
            username: "$user.username",
            firstname: "$userDetails.firstname",
            lastname: "$userDetails.lastname"
          }
        }
      },

      // 5️⃣ Pagination
      { $sort: { createdAt: -1 } },
      { $skip: page * parseInt(limit) },
      { $limit: parseInt(limit) }
    ]);

    const total = await Forums.countDocuments({ owner: new mongoose.Types.ObjectId(id) });

    return res.json({
      message: "success",
      data: {
        forums,
        totalpage: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "bad-request",
      data: "Server error"
    });
  }
};

exports.list = async (req, res) => {
  const { limit = 10, page = 0, search, tag } = req.query;

  const matchStage = {
      status: "Open"
  };

  if (search){
      matchStage["$or"] = [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: "i" } },
      ]
  }

  if (tag){
    matchStage["tag"] = tag
  }

  try {
    const forums = await Forums.aggregate([
      // 1️⃣ Only my forum posts
      {
        $match: matchStage
      },

      // 2️⃣ Join Users (optional: username)
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },

      // 3️⃣ Join User Details (firstname, lastname)
      {
        $lookup: {
          from: "userdetails",
          localField: "owner",
          foreignField: "owner",
          as: "userDetails"
        }
      },
      {
        $unwind: {
          path: "$userDetails",
          preserveNullAndEmptyArrays: true
        }
      },

      // 4️⃣ Shape the output
      {
        $project: {
          title: 1,
          content: 1,
          tag: 1,
          status: 1,
          createdAt: 1,

          owner: {
            _id: "$user._id",
            username: "$user.username",
            firstname: "$userDetails.firstname",
            lastname: "$userDetails.lastname"
          }
        }
      },

      // 5️⃣ Pagination
      { $sort: { createdAt: -1 } },
      { $skip: page * parseInt(limit) },
      { $limit: parseInt(limit) }
    ]);

    const total = await Forums.countDocuments();

    return res.json({
      message: "success",
      data: {
        forums,
        totalpage: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "bad-request",
      data: "Server error"
    });
  }
}

exports.forumdata = async (req, res) => {
  const { forumId } = req.query;

  try {
    const forum = await Forums.aggregate([
      // 1️⃣ Match forum post
      {
        $match: { _id: new mongoose.Types.ObjectId(forumId) }
      },

      // 2️⃣ Forum owner → userdetails
      {
        $lookup: {
          from: "userdetails",
          localField: "owner",
          foreignField: "owner",
          as: "ownerDetails"
        }
      },
      {
        $unwind: {
          path: "$ownerDetails",
          preserveNullAndEmptyArrays: true
        }
      },

      // 3️⃣ Forum comments
      {
        $lookup: {
          from: "forumscomments", // ✅ EXACT collection name
          localField: "_id",
          foreignField: "topic",
          as: "comments"
        }
      },

      // 4️⃣ Comment user details
      {
        $lookup: {
          from: "userdetails",
          localField: "comments.owner",
          foreignField: "owner",
          as: "commentUsers"
        }
      },

      // 5️⃣ Merge comment + user names
      {
        $addFields: {
          comments: {
            $map: {
              input: "$comments",
              as: "c",
              in: {
                _id: "$$c._id",
                content: "$$c.content",
                createdAt: "$$c.createdAt",
                owner: {
                  $let: {
                    vars: {
                      user: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: "$commentUsers",
                              cond: {
                                $eq: ["$$this.owner", "$$c.owner"]
                              }
                            }
                          },
                          0
                        ]
                      }
                    },
                    in: {
                      firstname: "$$user.firstname",
                      lastname: "$$user.lastname"
                    }
                  }
                }
              }
            }
          }
        }
      },
      // 5.5️⃣ Sort comments: latest → oldest
      {
        $addFields: {
          comments: {
            $sortArray: {
              input: "$comments",
              sortBy: { createdAt: -1 } // -1 = newest first
            }
          }
        }
      },
      // 6️⃣ Final output shape
      {
        $project: {
          title: 1,
          content: 1,
          tag: 1,
          status: 1,
          createdAt: 1,
          owner: {
            firstname: "$ownerDetails.firstname",
            lastname: "$ownerDetails.lastname"
          },
          comments: 1
        }
      }
    ]);

    if (!forum.length) {
      return res.status(404).json({ message: "Forum not found" });
    }

    return res.json({
      message: "success",
      data: forum[0]
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "bad-request",
      data: "Server error"
    });
  }
}

exports.postcomment = async (req, res) => {
  const {id, auth} = req.user
  const {commentid, comment} = req.body

  if (!commentid || !comment){
    return res.status(400).json({message: "failed", data: "Please complete the form first!"})
  }

  const datapost = {topic: new mongoose.Types.ObjectId(commentid), content: comment}

  if (auth == "employee" || auth == "employer"){
    datapost.owner = new mongoose.Types.ObjectId(id)
  }

  await Forumscomment.create(datapost)
  .catch(err => {
    console.log(`problem creating comment. Error ${err}`)
    
    return res.status(400).json({message: "bad-request", data: "There's a problem with the server. Please contact customer support for more details!"})
  })

    return res.json({message: "success"})
}

exports.deletecomment = async (req, res) => {
  const {commentid} = req.body

  if (!commentid){
    return res.status(400).json({message: "failed", data: "Select a valid comment first!"})
  }

  await Forumscomment.findOneAndDelete({_id: new mongoose.Types.ObjectId(commentid)})
  .catch(err => {
    console.log(`problem deleting comment. Error ${err}`)
    
    return res.status(400).json({message: "bad-request", data: "There's a problem with the server. Please contact customer support for more details!"})
  })

  return res.json({message: "success"})
}

exports.forumdatauser = async (req, res) => {
  const {id} = req.user
  const { forumId } = req.query;

  try {
    const forum = await Forums.aggregate([
      // 1️⃣ Match forum post
      {
        $match: { _id: new mongoose.Types.ObjectId(forumId) }
      },

      // 2️⃣ Forum owner → userdetails
      {
        $lookup: {
          from: "userdetails",
          localField: "owner",
          foreignField: "owner",
          as: "ownerDetails"
        }
      },
      {
        $unwind: {
          path: "$ownerDetails",
          preserveNullAndEmptyArrays: true
        }
      },

      // 3️⃣ Forum comments
      {
        $lookup: {
          from: "forumscomments", // ✅ EXACT collection name
          localField: "_id",
          foreignField: "topic",
          as: "comments"
        }
      },

      // 4️⃣ Comment user details
      {
        $lookup: {
          from: "userdetails",
          localField: "comments.owner",
          foreignField: "owner",
          as: "commentUsers"
        }
      },
      // 5️⃣ Merge comment + user names
      {
        $addFields: {
          comments: {
            $map: {
              input: "$comments",
              as: "c",
              in: {
                _id: "$$c._id",
                content: "$$c.content",
                createdAt: "$$c.createdAt",

                // 🔥 comment belongs to logged-in user
                isMine: { $eq: ["$$c.owner", new mongoose.Types.ObjectId(id)] },

                owner: {
                  $let: {
                    vars: {
                      user: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: "$commentUsers",
                              cond: {
                                $eq: ["$$this.owner", "$$c.owner"]
                              }
                            }
                          },
                          0
                        ]
                      }
                    },
                    in: {
                      firstname: "$$user.firstname",
                      lastname: "$$user.lastname"
                    }
                  }
                }
              }
            }
          }
        }
      },
      // 5.5️⃣ Sort comments: latest → oldest
      {
        $addFields: {
          comments: {
            $sortArray: {
              input: "$comments",
              sortBy: { createdAt: -1 } // -1 = newest first
            }
          }
        }
      },
      // 6️⃣ Final output shape
      {
        $project: {
          title: 1,
          content: 1,
          tag: 1,
          status: 1,
          createdAt: 1,

          // 🔥 forum belongs to logged-in user
          isOwner: { $eq: ["$owner", new mongoose.Types.ObjectId(id)] },

          owner: {
            firstname: "$ownerDetails.firstname",
            lastname: "$ownerDetails.lastname"
          },
          comments: 1
        }
      }
    ]);

    if (!forum.length) {
      return res.status(404).json({ message: "Forum not found" });
    }

    return res.json({
      message: "success",
      data: forum[0]
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "bad-request",
      data: "Server error"
    });
  }
}

exports.deleteforum = async (req, res) => {
  const {id} = req.user
  const {forumid} = req.body

  if (!forumid){
    return res.status(400).json({message: "failed", data: "Please select a valid topic first!"})
  }

  const tempdata = await Forums.findOne({_id: new mongoose.Types.ObjectId(forumid)})
  .then(data => data)
  .catch(err => {
    console.log(`Error getting forum data user. Err: ${err}`)

    return res.status(400).json({message: "bad-request", data: "Please complete the form first!"})
  })

  if (!tempdata){
    return res.status(400).json({message: "failed", data: "Please select a valid forum post!"})
  }

  if (tempdata.owner != id){
    return res.status(400).json({message: "failed", data: "You are not the owner of this post!"})
  }

  await Forums.findOneAndDelete({_id: new mongoose.Types.ObjectId(forumid)})

  await Forumscomment.deleteMany({topic: new mongoose.Types.ObjectId(forumid)})

  return res.json({message: "success"})
}

exports.forumedituser = async (req, res) => {
  const {id} = req.user
  const {forumid, title, content, tag} = req.body

  if (!forumid || !title || !content || !tag){
    return res.status(400).json({message: "failed", data: "Please complete the form first!"})
  }

  const tempdata = await Forums.findOne({_id: new mongoose.Types.ObjectId(forumid)})
  .then(data => data)
  .catch(err => {
    console.log(`Error getting forum data user. Err: ${err}`)

    return res.status(400).json({message: "bad-request", data: "Please complete the form first!"})
  })

  if (!tempdata){
    return res.status(400).json({message: "failed", data: "Please select a valid forum post!"})
  }

  if (tempdata.owner != id){
    return res.status(400).json({message: "failed", data: "You are not the owner of this post!"})
  }

  await Forums.findOneAndUpdate({_id: new mongoose.Types.ObjectId(forumid)}, {title: title, content: content, tag: tag})

  return res.json({message: "success"})
}