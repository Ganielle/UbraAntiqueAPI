const router = require("express").Router()
const {createjobs, showjobs, getjobdetails, applyjob, mypostedjobs} = require("../controllers/jobs")
const {protectemployee, protectemployer, protectadmin, protectall} = require("../middleware/middleware")

router
    .get("/showjobs", protectall, showjobs)
    .get("/getjobdetails", protectall, getjobdetails)
    .get("/mypostedjobs", protectemployer, mypostedjobs)
    .post("/createjobs", protectemployer, createjobs)
    .post("/applyjob", protectemployee, applyjob)


module.exports = router;