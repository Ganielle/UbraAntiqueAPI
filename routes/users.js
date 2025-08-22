const router = require("express").Router()
const {createusers, editaboutme, getuserdata, editexperience, editeducation, editstatus, editfeatureddocuments, deletefeatureddocuments} = require("../controllers/users")
const {protectemployeewithauth, protectadmin} = require("../middleware/middleware")
const upload = require("../middleware/uploadfile")
const uploadfile = upload.single("file")

router
    .get("/getuserdata", protectemployeewithauth, getuserdata)
    .post("/editaboutme", protectemployeewithauth, editaboutme)
    .post("/editexperience", protectemployeewithauth, editexperience)
    .post("/editeducation", protectemployeewithauth, editeducation)
    .post("/editstatus", protectemployeewithauth, editstatus)
    .post("/createusers", createusers)
    .post("/editfeatureddocuments", protectemployeewithauth, function (req, res, next){
        uploadfile(req, res, function(err) {
            if (err){
                return res.status(400).send({ message: "failed", data: err.message })
            }

            next()
        })
    }, editfeatureddocuments)
    .post("/deletefeatureddocuments", protectemployeewithauth, deletefeatureddocuments)

module.exports = router;