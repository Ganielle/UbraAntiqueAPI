const router = require("express").Router()
const {createjobs, showjobs} = require("../controllers/jobs")
const {protectemployee, protectemployer, protectadmin, protectall} = require("../middleware/middleware")

router
    .get("/showjobs", protectall, showjobs)
    .post("/createjobs", protectemployer, createjobs)


module.exports = router;