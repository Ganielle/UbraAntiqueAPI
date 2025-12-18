const mongoose = require("mongoose");
const bcrypt = require('bcrypt');

const usersSchema = new mongoose.Schema(
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
        authenticated: {
            type: Boolean
        },
        status:{
            type: String,
            default: "Active"
        }
    },
    {
        timestamps: true
    }
)

usersSchema.pre("save", async function (next) {
    if (!this.isModified){
        next();
    }

    this.password = await bcrypt.hashSync(this.password, 10)
})

usersSchema.pre("findOneAndUpdate", async function (next) {
    const update = this.getUpdate();

    if (update.password) {
        update.password = await bcrypt.hash(update.password, 10);
        this.setUpdate(update);
    }

    next();
});

usersSchema.methods.matchPassword = async function(password){
    return await bcrypt.compare(password, this.password)
}

const Users = mongoose.model("Users", usersSchema)
module.exports = Users