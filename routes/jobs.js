const router = require("express").Router()
const {createjobs, showjobs, getjobdetails, applyjob, mypostedjobs, showjobspendingsa, updatestatusjob, showjobsdeniedsa, viewmyjobs, selectemployeeforjob, editjob} = require("../controllers/jobs")
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
    .get("/viewmyjobs", protectemployeewithauth, viewmyjobs)
    .post("/selectemployeeforjob", protectemployer, selectemployeeforjob)
    .post("/editjob", protectemployer, editjob)

module.exports = router;