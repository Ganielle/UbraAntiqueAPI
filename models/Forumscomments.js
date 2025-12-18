const mongoose = require("mongoose");

const ForumsCommentSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users",
            required: false
        },
        topic: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Forums"
        },
        content: {
            type: String
        }
    },
    {
        timestamps: true
    }
)

const Forumscomment = mongoose.model("Forumscomment", ForumsCommentSchema)
module.exports = Forumscomment