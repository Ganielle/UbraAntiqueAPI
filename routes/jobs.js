const router = require("express").Router()
const {createjobs, showjobs, getjobdetails, applyjob, mypostedjobs, showjobspendingsa} = require("../controllers/jobs")
const {protectemployeewithauth, protectemployer, protectsuperadmin, protectall} = require("../middleware/middleware")

router
    .get("/showjobs", protectall, showjobs)
    .get("/getjobdetails", protectall, getjobdetails)
    .get("/mypostedjobs", protectemployer, mypostedjobs)
    .post("/createjobs", protectemployer, createjobs)
    .post("/applyjob", protectemployeewithauth, applyjob)
    .get("/showjobssa", protectsuperadmin, showjobs)
    .get("/showapprovelistsa", protectsuperadmin, showjobspendingsa)

module.exports = router;