const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users"
        },
        title: {
            type: String
        },
        description: {
            type: String
        },
        salary: {
            type: String
        },
        applicants: [
            {
                employee: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Users',
                    index: true,
                },
                status: {
                    type: String
                }
            }
        ],
        status: {
            type: String,
            default: "Open"
        }
    },
    {
        timestamps: true
    }
)

const Jobs = mongoose.model("Jobs", JobSchema)
module.exports = Jobs