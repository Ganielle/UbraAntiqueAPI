const mongoose = require("mongoose");

const ChatSchema  = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users"
        },
        conversation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversations"
        },
        content: {
            type: String
        },
    },
    {
        timestamps: true
    }
)

const Chats = mongoose.model("Chats", ChatSchema)
module.exports = Chats