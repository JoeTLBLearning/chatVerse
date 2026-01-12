import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  allUsersRoute,
  getUserRoomsRoute,
  leaveRoomRoute,
  deleteRoomRoute,
  getInvitationsRoute,
  getPendingFriendRequestsRoute,
} from "../utils/APIRoutes";

// Hooks
import { useSocket } from "../hooks/useSocket";
import { useChatMessages } from "../hooks/useChatMessages";

// Components
import ServerBar from "../components/dashboard/ServerBar";
import Sidebar from "../components/dashboard/Sidebar";
import ChatWindow from "../components/dashboard/ChatWindow";
import CreateRoomModal from "../components/CreateRoomModal";
import { ManageChannelsModal, ManageMembersModal } from "../components/ManageChannels";
import JoinRequestsModal from "../components/dashboard/JoinRequestsModal";
import AddFriendModal from "../components/dashboard/AddFriendModal";

function Dashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(undefined);

  // Pour mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // États de navigation
  const [viewState, setViewState] = useState("DM");
  const [currentChat, setCurrentChat] = useState(undefined);
  const [currentRoom, setCurrentRoom] = useState(undefined);
  const [currentChannel, setCurrentChannel] = useState(undefined);

  // Données
  const [contacts, setContacts] = useState([]);
  const [rooms, setRooms] = useState([]);

  // Modals
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [showManageChannelsModal, setShowManageChannelsModal] = useState(false);
  const [showManageMembersModal, setShowManageMembersModal] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);

  // Notifications système
  const [invitations, setInvitations] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const socket = useSocket(currentUser);

  const {
    messages,
    handleSendMsg,
    notifications,
    setNotifications,
    scrollRef
  } = useChatMessages(
    viewState === "DM" ? currentChat : currentChannel,
    currentUser,
    socket,
    viewState
  );

  const allNotifications = [
    ...invitations.map(inv => ({
      type: "ROOM", id: inv._id, senderName: "Système", title: inv.name, subtitle: "Invitation au salon", payload: { roomId: inv._id }
    })),
    ...friendRequests.map(req => ({
      type: "FRIEND", id: req._id, senderName: req.sender.username, title: req.sender.username, subtitle: "Demande d'ami", payload: { requestId: req._id }
    }))
  ];

  useEffect(() => {
    const checkUser = async () => {
      const user = localStorage.getItem("chat-app-user");
      if (!user) navigate("/login");
      else setCurrentUser(JSON.parse(user));
    };
    checkUser();
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (currentUser) {
        try {
          const [usersRes, roomsRes] = await Promise.all([
            axios.get(`${allUsersRoute}/${currentUser._id}`),
            axios.get(`${getUserRoomsRoute}/${currentUser._id}`)
          ]);
          setContacts(usersRes.data);
          setRooms(roomsRes.data);
        } catch (error) {
          console.error("Erreur chargement données :", error);
        }
      }
    };
    fetchData();
  }, [currentUser]);

  useEffect(() => {
    const fetchSystemNotifications = async () => {
      if (currentUser) {
        try {
          const [invitRes, friendRes] = await Promise.all([
            axios.get(`${getInvitationsRoute}/${currentUser._id}`),
            axios.get(`${getPendingFriendRequestsRoute}/${currentUser._id}`)
          ]);
          setInvitations(invitRes.data);
          setFriendRequests(friendRes.data);
        } catch (error) {
          console.error("Erreur notifs :", error);
        }
      }
    };
    fetchSystemNotifications();
  }, [currentUser]);

  useEffect(() => {
    const currentSocket = socket.current;
    if (currentSocket) {
      currentSocket.on("new-room-invitation", (data) => setInvitations(prev => [...prev, data]));
      currentSocket.on("new-friend-request", (data) => setFriendRequests(prev => [...prev, data]));

      currentSocket.on("friend-request-accepted", (data) => {
        if (data.newFriend) {
          setContacts((prev) => {
            const exists = prev.some(c => c._id === data.newFriend._id);
            if (exists) return prev;
            return [...prev, data.newFriend];
          });
        }
      });

      currentSocket.on("get-online-users", (users) => {
        setOnlineUsers(users);
      })

      return () => {
        if (currentSocket) {
          currentSocket.off("new-room-invitation");
          currentSocket.off("new-friend-request");
          currentSocket.off("friend-request-accepted");
          currentSocket.off("get-online-users");
        }
      };
    }
  }, [socket.current]);

  const handleLogout = () => {
    localStorage.clear();
    if (socket.current) socket.current.close();
    navigate("/login");
  };

  const handleDMSelect = () => {
    setViewState("DM");
    setCurrentRoom(undefined);
    setCurrentChat(undefined);
  };

  const handleRoomSelect = (room) => {
    setViewState("ROOM");
    setCurrentRoom(room);
    setCurrentChat(undefined);
    const general = room.channels.find(c => c.name.toLowerCase().includes("général"));
    setCurrentChannel(general || room.channels[0]);
  };

  const handleContactSelect = (contact) => {
    setViewState("DM");
    setCurrentChat(contact);
    setNotifications(prev => prev.filter(id => id !== contact._id));
  };

  const handleNotificationAction = (id, type, wasAccepted, responseData) => {
    if (type === "ROOM") {
      setInvitations(prev => prev.filter(i => i._id !== id));
      if (wasAccepted && responseData) setRooms(prev => [...prev, responseData]);
    } else if (type === "FRIEND") {
      setFriendRequests(prev => prev.filter(r => r._id !== id));
      if (wasAccepted && responseData?.newFriend) {
        setContacts(prev => {
          const isAlreadyContact = prev.some(c => c._id === responseData.newFriend._id);
          if (isAlreadyContact) return prev;
          return [...prev, responseData.newFriend];
        });
      }
    }
  };

  const handleLeaveOrDeleteRoom = async (roomId, ownerId) => {
    try {
      const isOwner = currentUser._id === ownerId;
      let response;

      if (isOwner) {
        // Pour DELETE, on passe le body dans l'option { data: ... }
        response = await axios.delete(deleteRoomRoute, {
          data: { roomId, userId: currentUser._id }
        });
      } else {
        // Pour POST, on passe le body directement
        response = await axios.post(leaveRoomRoute, {
          roomId,
          userId: currentUser._id
        });
      }

      if (response.data.status) {
        setRooms((prev) => prev.filter((r) => r._id !== roomId));
        setViewState("DM");
        setCurrentRoom(undefined);
        setCurrentChannel(undefined);
      } else {
        alert(response.data.msg);
      }
    } catch (error) {
      console.error("Erreur action salon:", error);
      alert("Impossible de traiter la demande.");
    }
  };

  return (
  <div className="h-screen w-screen flex overflow-hidden bg-[#0f172a] relative">
    
    {/* BOUTON HAMBURGER (Visible uniquement sur mobile) */}
    {!isSidebarOpen && (
      <button 
        onClick={() => setIsSidebarOpen(true)}
        className="md:hidden absolute top-4 left-4 z-50 p-2 bg-slate-800 rounded-lg text-white"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    )}

    {/* OVERLAY (Floute l'arrière-plan quand le menu est ouvert sur mobile) */}
    {isSidebarOpen && (
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[40] md:hidden"
        onClick={() => setIsSidebarOpen(false)}
      />
    )}

    {/* CONTENEUR NAVIGATION (ServerBar + Sidebar) */}
    <div className={`
      fixed inset-y-0 left-0 z-[45] flex transition-transform duration-300 transform
      ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      md:relative md:translate-x-0 md:flex
    `}>
      <ServerBar 
        rooms={rooms} 
        viewState={viewState} 
        currentRoom={currentRoom} 
        onDMClick={() => { handleDMSelect(); setIsSidebarOpen(false); }} 
        onRoomClick={(room) => { handleRoomSelect(room); setIsSidebarOpen(false); }} 
        onAddRoom={() => setShowCreateRoomModal(true)} 
      />

      <Sidebar
        viewState={viewState} 
        contacts={contacts} 
        currentChat={currentChat} 
        currentRoom={currentRoom} 
        currentChannel={currentChannel} 
        currentUser={currentUser}
        onChatSelect={(contact) => { handleContactSelect(contact); setIsSidebarOpen(false); }} 
        onChannelSelect={(channel) => { setCurrentChannel(channel); setIsSidebarOpen(false); }} 
        notifications={notifications} 
        onLogout={handleLogout}
        onAddFriend={() => setShowAddFriendModal(true)} 
        onManageChannels={() => setShowManageChannelsModal(true)} 
        onManageMembers={() => setShowManageMembersModal(true)}
        onLeaveOrDelete={(roomId, ownerId) => handleLeaveOrDeleteRoom(roomId, ownerId)}
        onlineUsers={onlineUsers}
      />
    </div>

    {/* ZONE DE CHAT PRINCIPALE */}
    <div className="flex-1 h-full w-full min-w-0">
      <ChatWindow 
        viewState={viewState} 
        currentChat={currentChat} 
        currentRoom={currentRoom} 
        currentChannel={currentChannel} 
        messages={messages} 
        handleSendMsg={handleSendMsg} 
        scrollRef={scrollRef} 
      />
    </div>

    {/* NOTIFICATIONS (Ajustement position mobile) */}
    <div className="absolute top-3 right-4 md:right-10 z-30">
      <button onClick={() => setShowRequestsModal(true)} className="relative p-2 bg-slate-900 border border-slate-800 rounded-full hover:border-[#22d3ee] transition-all">
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${allNotifications.length > 0 ? "text-[#22d3ee] animate-pulse" : "text-slate-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {allNotifications.length > 0 && <span className="absolute -top-1 -right-1 flex h-4 w-4 bg-red-500 rounded-full text-[10px] text-white items-center justify-center font-bold">{allNotifications.length}</span>}
      </button>
    </div>

      {showAddFriendModal && <AddFriendModal currentUser={currentUser} socket={socket} onClose={() => setShowAddFriendModal(false)} />}
      {showRequestsModal && <JoinRequestsModal requests={allNotifications} onClose={() => setShowRequestsModal(false)} onUpdate={handleNotificationAction} />}
      {showCreateRoomModal && <CreateRoomModal currentUser={currentUser} closeDetails={() => setShowCreateRoomModal(false)} onRoomCreated={(newRoom) => setRooms([...rooms, newRoom])} />}
      {showManageChannelsModal && <ManageChannelsModal currentRoom={currentRoom} onClose={() => setShowManageChannelsModal(false)} onUpdateRoom={(u) => { setRooms(rooms.map(r => r._id === u._id ? u : r)); setCurrentRoom(u); }} />}
      {showManageMembersModal && <ManageMembersModal currentRoom={currentRoom}
        contacts={contacts}
        currentUser={currentUser}
        onClose={() => setShowManageMembersModal(false)} onUpdateRoom={(u) => { setRooms(rooms.map(r => r._id === u._id ? u : r)); setCurrentRoom(u); }} />}
    </div>
  );
}

export default Dashboard;