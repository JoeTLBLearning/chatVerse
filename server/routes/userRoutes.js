const router = require("express").Router();
const { register, login, getAllUsers, searchUserByShortId } = require("../controllers/userController");

router.post("/register", register);
router.post("/login", login);
router.get("/allusers/:id", getAllUsers);
router.get("/search/:shortId", searchUserByShortId);

module.exports = router;