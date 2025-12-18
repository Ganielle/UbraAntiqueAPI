const router = require("express").Router()
const {myforums, postforum, approvallist, updatestatus, list, forumdata, postcomment, deletecomment, forumdatauser, deleteforum, forumedituser} = require("../controllers/forums")
const {protectemployee, protectall, protectsuperadmin} = require("../middleware/middleware")

router
    .get("/myforums", protectall, myforums)
    .get("/list", protectall, list)
    .get("/approvallist", protectall, approvallist)
    .get("/forumdata", protectall, forumdata)
    .get("/forumdatauser", protectall, forumdatauser)
    .post("/postforum", protectall, postforum)
    .post("/updatestatus", protectall, updatestatus)
    .post("/postcomment", protectall, postcomment)
    .post("/deletecomment", protectall, deletecomment)
    .post("/deleteforum", protectall, deleteforum)
    .post("/forumedituser", protectall, forumedituser)

module.exports = router;