const router = require("express").Router()
const {sadashboard} = require("../controllers/dashboard")
const {protectemployee, protectall, protectsuperadmin} = require("../middleware/middleware")

router
    .get("/sadashboard", protectsuperadmin, sadashboard)

module.exports = router;