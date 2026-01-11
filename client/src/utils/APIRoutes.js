// export const host = "http://localhost:3000";
export const host = "https://chatverse-backend-ifjs.onrender.com";

export const registerRoute = `${host}/api/auth/register`;
export const loginRoute = `${host}/api/auth/login`;
export const allUsersRoute = `${host}/api/auth/allusers`;
export const sendMessageRoute = `${host}/api/messages/addmsg`;
export const recieveMessageRoute = `${host}/api/messages/getmsg`;

export const createRoomRoute = `${host}/api/rooms/create`;
export const getUserRoomsRoute = `${host}/api/rooms/getrooms`;

export const addChannelRoute = `${host}/api/rooms/add-channel`;
export const renameChannelRoute = `${host}/api/rooms/rename-channel`;
export const deleteChannelRoute = `${host}/api/rooms/delete-channel`;


export const getAvailableUsersRoute = `${host}/api/rooms/getavailableusers`;
export const addMembersRoute = `${host}/api/rooms/addmembers`;


export const leaveRoomRoute = `${host}/api/rooms/leave`;
export const deleteRoomRoute = `${host}/api/rooms/delete`;


export const handleJoinRequestRoute = `${host}/api/rooms/handle-join-request`;
export const sendInvitationRoute = `${host}/api/rooms/sendRoomInvitations`;
export const getInvitationsRoute = `${host}/api/rooms/get-invitations`;

export const sendFriendRequestRoute = `${host}/api/friends/send`;
export const handleFriendRequestRoute = `${host}/api/friends/handle`;
export const getPendingFriendRequestsRoute = `${host}/api/friends/pending`;

export const searchUserRoute = `${host}/api/auth/search`;

export const inviteToRoomRoute = `${host}/api/rooms/invite`;
export const kickFromRoomRoute = `${host}/api/rooms/kick`;