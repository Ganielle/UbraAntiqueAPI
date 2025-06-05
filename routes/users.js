const router = require("express").Router()
const {createusers, editaboutme, getuserdata, editexperience, editeducation, editstatus, editfeatureddocuments, deletefeatureddocuments} = require("../controllers/users")
const {protectemployee, protectadmin} = require("../middleware/middleware")
const upload = require("../middleware/uploadfile")
const uploadfile = upload.single("file")

router
    .get("/getuserdata", protectemployee, getuserdata)
    .post("/editaboutme", protectemployee, editaboutme)
    .post("/editexperience", protectemployee, editexperience)
    .post("/editeducation", protectemployee, editeducation)
    .post("/editstatus", protectemployee, editstatus)
    .post("/createusers", createusers)
    .post("/editfeatureddocuments", protectemployee, function (req, res, next){
        uploadfile(req, res, function(err) {
            if (err){
                return res.status(400).send({ message: "failed", data: err.message })
            }

            next()
        })
    }, editfeatureddocuments)
    .post("/deletefeatureddocuments", protectemployee, deletefeatureddocuments)

module.exports = router;