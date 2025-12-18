const mongoose = require("mongoose");

const ConversationSchema  = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users"
        },
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users"
        },
        title: {
            type: String
        }
    },
    {
        timestamps: true
    }
)

const Conversations = mongoose.model("Conversations", ConversationSchema)
module.exports = Conversations