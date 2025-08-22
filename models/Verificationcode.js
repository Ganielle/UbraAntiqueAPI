const mongoose = require("mongoose");

const verificationCodeSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users"
        },
        code:{
            type: String
        }
    },
    {
        timestamps: true
    }
)

const Verificationcode = mongoose.model("Verificationcode", verificationCodeSchema)
module.exports = Verificationcode