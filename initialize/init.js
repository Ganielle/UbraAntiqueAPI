const { default: mongoose } = require("mongoose")
const Staffusers = require("../models/Staffusers")

exports.initserver = async () => {
    
    console.log("STARTING INITIALIZE SERVER DATA")

    const admin = await Staffusers.find({_id: new mongoose.Types.ObjectId("68a8b9f466124968ad23b98f")})
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem getting the admin datas. Error ${err}`)

        return
    })

    if (admin.length <= 0){
        await Staffusers.create({_id: new mongoose.Types.ObjectId("68a8b9f466124968ad23b98f"), username: "ubraantiqueadmin", password: "2b6aBdUo1SY7", token: "", auth: "superadmin"})
        .catch(err => {
            console.log(`There's a problem saving the admin datas. Error ${err}`)
    
            return
        })
    }

    console.log("DONE INITIALIZING SERVER DATA")
}