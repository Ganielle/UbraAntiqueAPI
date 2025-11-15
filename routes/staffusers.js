const router = require("express").Router()
const {getadminlist} = require("../controllers/staffusers")
const {protectemployeewithauth, protectsuperadmin} = require("../middleware/middleware")
const upload = require("../middleware/uploadfile")
const uploadfile = upload.single("file")

router
    .get("/getadminlist", protectsuperadmin, getadminlist)

module.exports = router;