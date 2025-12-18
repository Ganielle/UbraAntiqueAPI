const mongoose = require("mongoose");

const ForgotpwOTPSchema  = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users"
        },
        otp: {
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

const ForgotpwOTP = mongoose.model("ForgotpwOTP", ForgotpwOTPSchema)
module.exports = ForgotpwOTP