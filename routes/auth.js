const router = require("express").Router()
const {login, logout, regenerateotp, validateotp, generateforgotpwotp, validateforgotpwotp, changepassword} = require("../controllers/auth")
const {protectemployee, protectall} = require("../middleware/middleware")

router
    .get("/login", login)
    .get("/logout", logout)
    .post("/regenerateotp", protectemployee, regenerateotp)
    .post("/validateotp", protectall, validateotp)
    .post("/generateforgotpwotp", generateforgotpwotp)
    .post("/validateforgotpwotp", validateforgotpwotp)
    .post("/changepassword", changepassword)

module.exports = router;