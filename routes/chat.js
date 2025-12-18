const router = require("express").Router()
const {createnewmessage, getconversations, getchats, sendmessage} = require("../controllers/chat")
const {protectemployee, protectall} = require("../middleware/middleware")

router
    .get("/getconversations", protectall, getconversations)
    .get("/getchats", protectall, getchats)
    .post("/createnewmessage", protectall, createnewmessage)
    .post("/sendmessage", protectall, sendmessage)

module.exports = router;