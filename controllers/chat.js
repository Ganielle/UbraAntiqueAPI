const { default: mongoose } = require("mongoose")
const Chats = require("../models/Chat")
const Conversations = require("../models/Conversations")

exports.createnewmessage = async (req, res) => {
    const {id} = req.user
    const {receiver, message, title} = req.body

    if (!receiver || !message){
        return res.status(400).json({message: "failed", data: "Please select a valid user or complete the form"})
    }

    const existing = await Conversations.findOne({sender: new mongoose.Types.ObjectId(id), receiver: new mongoose.Types.ObjectId(receiver)})

    if (!existing){

        const convo = await Conversations.create({sender: new mongoose.Types.ObjectId(id), receiver: new mongoose.Types.ObjectId(receiver), title: title})
        .then(data => data)

        await Chats.create({sender: new mongoose.Types.ObjectId(id), conversation: new mongoose.Types.ObjectId(convo._id), content: message})

        return res.json({message: "success"})
    }
    else{
        await Chats.create({sender: new mongoose.Types.ObjectId(id), conversation: new mongoose.Types.ObjectId(existing._id), content: message})

        return res.json({message: "success"})
    }
}

exports.getconversations = async (req, res) => {
    const {id} = req.user
    const {search} = req.query

    const pipeline = [
    {
        $match: {
            $or: [
                { sender: new mongoose.Types.ObjectId(id) },
                { receiver: new mongoose.Types.ObjectId(id) }
            ]
        }
    },

    // sender details
    {
        $lookup: {
        from: "userdetails",
        localField: "sender",
        foreignField: "owner",
        as: "senderDetails"
        }
    },
    { $unwind: "$senderDetails" },

    // receiver details
    {
        $lookup: {
        from: "userdetails",
        localField: "receiver",
        foreignField: "owner",
        as: "receiverDetails"
        }
    },
    { $unwind: "$receiverDetails" }
    ];

    // 🔍 OPTIONAL SEARCH
    if (search) {
        pipeline.push({
            $match: {
            $or: [
                { title: { $regex: search, $options: "i" } },
                { "senderDetails.firstname": { $regex: search, $options: "i" } },
                { "senderDetails.lastname": { $regex: search, $options: "i" } },
                { "receiverDetails.firstname": { $regex: search, $options: "i" } },
                { "receiverDetails.lastname": { $regex: search, $options: "i" } }
            ]
            }
        });
    }

    // Final projection & sort
    pipeline.push(
        {
            $project: {
            sender: 1,
            receiver: 1,
            createdAt: 1,
            updatedAt: 1,
            title: 1,
            senderFirstname: "$senderDetails.firstname",
            senderLastname: "$senderDetails.lastname",

            receiverFirstname: "$receiverDetails.firstname",
            receiverLastname: "$receiverDetails.lastname"
            }
        },
        { $sort: { updatedAt: -1 } }
    );

    const conversations = await Conversations.aggregate(pipeline);

    return res.json({message: "success", data: conversations})
}