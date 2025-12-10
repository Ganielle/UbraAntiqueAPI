const mongoose = require("mongoose");
const bcrypt = require('bcrypt');

const staffUsersSchema = new mongoose.Schema(
    {
        username: {
            type: String
        },
        password: {
            type: String
        },
        auth: {
            type: String
        },
        token: {
            type: String
        },
        status: {
            type: String,
            default: "Active"
        }
    },
    {
        timestamps: true
    }
)

staffUsersSchema.pre("save", async function (next) {
    if (!this.isModified){
        next();
    }

    this.password = await bcrypt.hashSync(this.password, 10)
})

staffUsersSchema.methods.matchPassword = async function(password){
    return await bcrypt.compare(password, this.password)
}

const Staffusers = mongoose.model("Staffusers", staffUsersSchema)
module.exports = Staffusers