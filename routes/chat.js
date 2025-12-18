const router = require("express").Router()
const {createnewmessage, getconversations} = require("../controllers/Chat")
const {protectemployee, protectall} = require("../middleware/middleware")

router
    .get("/getconversations", protectall, getconversations)
    .post("/createnewmessage", protectall, createnewmessage)

module.exports = router;