const router = require("express").Router()
const {getadminlist, createstaffuser, editstaffuser, editstatusstaffuser} = require("../controllers/staffusers")
const {protectemployeewithauth, protectsuperadmin} = require("../middleware/middleware")
const upload = require("../middleware/uploadfile")
const uploadfile = upload.single("file")

router
    .get("/getadminlist", protectsuperadmin, getadminlist)
    .post("/createstaffuser", protectsuperadmin, createstaffuser)
    .post("/editstaffuser", protectsuperadmin, editstaffuser)
    .post("/editstatusstaffuser", protectsuperadmin, editstatusstaffuser)

module.exports = router;