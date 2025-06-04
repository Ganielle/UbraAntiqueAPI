const router = require("express").Router()
const {createusers, getstudentlist} = require("../controllers/users")
const {protectplayer, protectadmin} = require("../middleware/middleware")

router
    .get("/getstudentlist", protectadmin, getstudentlist)
    .post("/createusers", createusers)

module.exports = router;