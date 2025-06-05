const mongoose = require("mongoose");

const userDetailsSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users"
        },
        email: {
            type: String
        },
        firstname: {
            type: String
        },
        lastname: {
            type: String
        },
        aboutme: {
            type: String,
            default: ""
        },
        status: {
            type: String,
            default: "Open for Work"
        },
        experience: {
            type: String,
            default: "No Experience Yet!"
        },
        education: {
            type: String,
            default: "No education Yet!"
        }
    },
    {
        timestamps: true
    }
)

const Userdetails = mongoose.model("Userdetails", userDetailsSchema)
module.exports = Userdetails