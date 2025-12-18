const router = require("express").Router()
const {createusers, editaboutme, getuserdata, editexperience, editeducation, editstatus, editfeatureddocuments, deletefeatureddocuments, getuserlist, editstatususer} = require("../controllers/users")
const {protectemployeewithauth, protectsuperadmin, protectemployer, protectall} = require("../middleware/middleware")
const upload = require("../middleware/uploadfile")
const uploadfile = upload.single("file")

router
    .get("/getuserdata", protectall, getuserdata)
    .get("/getemployeedata", protectemployer, getuserdata)
    .get("/getuserdatasa", protectsuperadmin, getuserdata)
    .get("/getuserlist", protectsuperadmin, getuserlist)
    .post("/editaboutme", protectall, editaboutme)
    .post("/editexperience", protectall, editexperience)
    .post("/editeducation", protectall, editeducation)
    .post("/editstatus", protectall, editstatus)
    .post("/createusers", createusers)
    .post("/editstatususer", protectsuperadmin, editstatususer)
    .post("/editfeatureddocuments", protectall, function (req, res, next){
        uploadfile(req, res, function(err) {
            if (err){
                return res.status(400).send({ message: "failed", data: err.message })
            }

            next()
        })
    }, editfeatureddocuments)
    .post("/deletefeatureddocuments", protectall, deletefeatureddocuments)

module.exports = router;