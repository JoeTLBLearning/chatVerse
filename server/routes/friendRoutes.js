const { sendFriendRequest, handleFriendRequest, getPendingRequests } = require("../controllers/friendController");
const router = require("express").Router();

router.post("/send", sendFriendRequest);
router.post("/handle", handleFriendRequest);
router.get("/pending/:userId", getPendingRequests);

module.exports = router;