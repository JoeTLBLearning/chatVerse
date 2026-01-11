const router = require("express").Router();
const { createRoom, getUserRooms, addMember, addChannel,
    renameChannel, deleteChannel, getAvailableUsers, addMembers,
    leaveRoom, deleteRoom, handleJoinRequest, sendRoomInvitations, getInvitations,
    inviteToRoom, kickMember } = require("../controllers/roomController");

router.post("/create", createRoom);
router.get("/getrooms/:userId", getUserRooms);
router.post("/addmember", addMember);
router.post("/add-channel", addChannel);
router.post("/rename-channel", renameChannel);
router.post("/delete-channel", deleteChannel);

router.get("/getavailableusers/:roomId", getAvailableUsers);
router.post("/addmembers", addMembers);


router.post("/leave", leaveRoom);
router.post("/delete", deleteRoom);

router.post("/handle-join-request", handleJoinRequest);
router.post("/sendRoomInvitations", sendRoomInvitations);

router.get("/get-invitations/:userId", getInvitations);

router.post("/invite", inviteToRoom);
router.post("/kick", kickMember);

module.exports = router;