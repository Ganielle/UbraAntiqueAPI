const router = require("express").Router()
const {login, logout, regenerateotp, validateotp} = require("../controllers/auth")
const {protectemployee, protectadmin} = require("../middleware/middleware")

router
    .get("/login", login)
    .get("/logout", logout)
    .post("/regenerateotp", protectemployee, regenerateotp)
    .post("/validateotp", protectemployee, validateotp)

module.exports = router;