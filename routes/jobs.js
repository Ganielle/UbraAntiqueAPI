const router = require("express").Router()
const {createjobs, showjobs, getjobdetails, applyjob, mypostedjobs, showjobspendingsa, updatestatusjob, showjobsdeniedsa} = require("../controllers/jobs")
const {protectemployeewithauth, protectemployer, protectsuperadmin, protectall} = require("../middleware/middleware")

router
    .get("/showjobs", protectall, showjobs)
    .get("/getjobdetails", protectall, getjobdetails)
    .get("/mypostedjobs", protectemployer, mypostedjobs)
    .post("/createjobs", protectemployer, createjobs)
    .post("/applyjob", protectemployeewithauth, applyjob)
    .post("/updatestatusjob", protectsuperadmin, updatestatusjob)
    .get("/showjobssa", protectsuperadmin, showjobs)
    .get("/showapprovelistsa", protectsuperadmin, showjobspendingsa)
    .get("/showjobsdeniedsa", protectsuperadmin, showjobsdeniedsa)

module.exports = router;