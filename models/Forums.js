const mongoose = require("mongoose");

const ForumsSchema  = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users"
        },
        title: {
            type: String
        },
        content: {
            type: String
        },
        tag: {
            type: String
        },
        status: {
            type: String
        }
    },
    {
        timestamps: true
    }
)

const Forums = mongoose.model("Forums", ForumsSchema)
module.exports = Forums