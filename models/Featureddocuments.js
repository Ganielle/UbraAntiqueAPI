const mongoose = require("mongoose");

const FeatureddocumentsSchema = new mongoose.Schema(
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
        path: {
            type: String
        },
        filetype: {
            type: String
        }
    },
    {
        timestamps: true
    }
)

const Featureddocuments = mongoose.model("Featureddocuments", FeatureddocumentsSchema)
module.exports = Featureddocuments