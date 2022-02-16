const router = require("express").Router()
const userCtrl = require('../controllers/userCtrl')
const auth = require("../middleware/auth")

router.post("/register", userCtrl.register)
//router.post("/activation", userCtrl.activateEmail)
router.post("/login", userCtrl.login)
router.post("/refresh_token", userCtrl.getAccessToken)
router.post("/forgotPassword", userCtrl.forgotPassword)
router.post("/resetPassword", auth, userCtrl.resetPassword)
router.get("/logout", userCtrl.logout)


module.exports = router