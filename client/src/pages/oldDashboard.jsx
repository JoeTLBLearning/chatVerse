import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import { allUsersRoute, host, sendMessageRoute, recieveMessageRoute } from "../utils/APIRoutes";
import Logo from "../assets/logo.png";
import ChatInput from "../components/ChatInput";

function Dashboard() {
  const navigate = useNavigate();
  const socket = useRef();
  const scrollRef = useRef();
  
  const [currentUser, setCurrentUser] = useState(undefined);
  const [contacts, setContacts] = useState([]);
  const [currentChat, setCurrentChat] = useState(undefined);
  const [messages, setMessages] = useState([]);
  const [arrivalMessage, setArrivalMessage] = useState(null);

  // 1. Auth check
  useEffect(() => {
    const checkUser = async () => {
      const user = localStorage.getItem("chat-app-user");
      if (!user) navigate("/login");
      else setCurrentUser(await JSON.parse(user));
    };
    checkUser();
  }, [navigate]);

  // 2. Socket setup
  useEffect(() => {
    if (currentUser) {
      socket.current = io(host);
      socket.current.emit("add-user", currentUser._id);
    }
  }, [currentUser]);

  // 3. Load Contacts
  useEffect(() => {
    const fetchContacts = async () => {
      if (currentUser) {
        const { data } = await axios.get(`${allUsersRoute}/${currentUser._id}`);
        setContacts(data);
      }
    };
    fetchContacts();
  }, [currentUser]);

  // 4. Load Messages
  useEffect(() => {
    const fetchMsgs = async () => {
      if (currentChat && currentUser) {
        const response = await axios.post(recieveMessageRoute, {
          from: currentUser._id,
          to: currentChat._id,
        });
        setMessages(response.data);
      }
    };
    fetchMsgs();
  }, [currentChat, currentUser]);

  // 5. Send Message Logic
  const handleSendMsg = async (msg) => {
    await axios.post(sendMessageRoute, {
      from: currentUser._id,
      to: currentChat._id,
      message: msg,
    });
    
    socket.current.emit("send-msg", {
      to: currentChat._id,
      from: currentUser._id,
      message: msg,
    });

    const msgs = [...messages];
    msgs.push({ fromSelf: true, message: msg });
    setMessages(msgs);
  };

  // 6. Receive via Socket (AMELIORÉ)
  useEffect(() => {
    if (socket.current) {
      socket.current.on("msg-recieve", (msg) => {
        // On ne stocke le message que s'il vient de la personne avec qui on discute actuellement
        setArrivalMessage({ fromSelf: false, message: msg });
      });
    }
    // Nettoyage de l'écouteur pour éviter les doublons
    return () => {
      if (socket.current) socket.current.off("msg-recieve");
    };
  }, [currentChat]); // Re-déclenche si on change de contact pour bien filtrer

  useEffect(() => {
    arrivalMessage && setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage]);

  // 7. Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-[#0f172a]">
      
      {/* 1. BARRE DES SERVEURS */}
      <div className="w-20 bg-[#020617] flex flex-col items-center py-4 gap-4 border-r border-slate-800">
        <div className="bg-white p-2 rounded-2xl cursor-pointer hover:rounded-xl transition-all shadow-lg shadow-cyan-500/20">
          <img src={Logo} alt="Logo" className="w-10 h-10 object-contain" />
        </div>
        <div className="w-10 h-[2px] bg-slate-800 rounded-full"></div>
        <div className="w-12 h-12 bg-slate-800 rounded-3xl hover:rounded-xl hover:bg-[#22d3ee] transition-all cursor-pointer flex items-center justify-center text-white font-bold text-xl group">
          <span className="group-hover:text-[#020617]">+</span>
        </div>
      </div>

      {/* 2. BARRE DES CONTACTS */}
      <div className="w-72 bg-[#0f172a] flex flex-col border-r border-slate-800">
        <div className="h-16 flex items-center px-6 shadow-sm border-b border-slate-800">
          <h2 className="text-white font-black uppercase text-lg tracking-tighter">ChatVerse</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-4 px-2">Messages Directs</p>
          {contacts.map((contact) => (
            <div 
              key={contact._id} 
              onClick={() => setCurrentChat(contact)}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${currentChat?._id === contact._id ? "bg-slate-800 border border-slate-700 shadow-lg" : "border border-transparent hover:bg-slate-800/40"}`}
            >
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold border border-slate-600">
                {contact.username.charAt(0).toUpperCase()}
              </div>
              <span className="text-slate-300 text-sm font-medium">{contact.username}</span>
            </div>
          ))}
        </div>
        
        {/* BAS SIDEBAR */}
        <div className="h-20 bg-[#020617] flex items-center justify-between px-4 border-t border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 min-w-[40px] bg-[#22d3ee] rounded-full flex items-center justify-center font-bold text-[#020617]">
              {currentUser?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col truncate">
              <span className="text-white text-sm font-bold truncate">{currentUser?.username}</span>
              <span className="text-green-500 text-[10px] uppercase font-bold tracking-tighter animate-pulse">En ligne</span>
            </div>
          </div>
          <button onClick={handleLogout} className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500 group transition-all duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-red-500 group-hover:text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
          </button>
        </div>
      </div>

      {/* 3. ZONE DE CHAT */}
      <div className="flex-1 flex flex-col bg-[#0f172a] relative">
        {currentChat ? (
          <>
            <div className="h-16 flex items-center px-8 border-b border-slate-800 bg-[#0f172a]/80 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-light text-2xl">@</span>
                <span className="text-white font-bold tracking-tight">{currentChat.username}</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg, index) => (
                <div key={index} ref={scrollRef} className={`flex ${msg.fromSelf ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[70%] p-3 px-4 rounded-2xl text-sm ${msg.fromSelf ? "bg-[#22d3ee] text-[#020617] rounded-tr-none" : "bg-slate-800 text-white rounded-tl-none"}`}>
                    {msg.message}
                  </div>
                </div>
              ))}
            </div>
            <ChatInput handleSendMsg={handleSendMsg} />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-cyan-500 blur-3xl opacity-10 rounded-full"></div>
              <img src={Logo} alt="ChatVerse" className="w-40 h-40 object-contain relative z-10 opacity-40" />
            </div>
            <h1 className="text-3xl font-black text-white mb-2">Salut, <span className="text-[#22d3ee]">{currentUser?.username}</span> !</h1>
            <p className="text-slate-400 max-w-sm leading-relaxed">Prêt à explorer l'univers ? Sélectionnez un contact dans la barre latérale pour lancer une discussion.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;



//************************************************************************************************ */
// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import Logo from "../assets/logo.png";

// function Dashboard() {
//   const navigate = useNavigate();
//   const [currentUser, setCurrentUser] = useState(undefined);

//   // Vérification de la connexion au chargement
//   useEffect(() => {
//     const checkUser = async () => {
//       const user = localStorage.getItem("chat-app-user");
//       if (!user) {
//         navigate("/login");
//       } else {
//         setCurrentUser(await JSON.parse(user));
//       }
//     };
//     checkUser();
//   }, [navigate]);

//   // Fonction de déconnexion
//   const handleLogout = () => {
//     localStorage.clear();
//     navigate("/login");
//   };

//   return (
//     <div className="h-screen w-screen flex overflow-hidden bg-[#0f172a]">
      
//       {/* 1. BARRE DES SERVEURS (Extrême gauche) */}
//       <div className="w-20 bg-[#020617] flex flex-col items-center py-4 gap-4 border-r border-slate-800">
//         <div className="bg-white p-2 rounded-2xl cursor-pointer hover:rounded-xl transition-all shadow-lg shadow-cyan-500/20">
//           <img src={Logo} alt="Logo" className="w-10 h-10 object-contain" />
//         </div>
//         <div className="w-10 h-[2px] bg-slate-800 rounded-full"></div>
        
//         {/* Bouton d'ajout factice pour le style */}
//         <div className="w-12 h-12 bg-slate-800 rounded-3xl hover:rounded-xl hover:bg-[#22d3ee] transition-all cursor-pointer flex items-center justify-center text-white font-bold text-xl group">
//           <span className="group-hover:text-[#020617]">+</span>
//         </div>
//       </div>

//       {/* 2. BARRE DES CONTACTS (Milieu) */}
//       <div className="w-72 bg-[#0f172a] flex flex-col border-r border-slate-800">
//         {/* Header de la sidebar */}
//         <div className="h-16 flex items-center px-6 shadow-sm border-b border-slate-800">
//           <h2 className="text-white font-black uppercase text-lg tracking-tighter">ChatVerse</h2>
//         </div>

//         {/* Liste des utilisateurs (Scrollable) */}
//         <div className="flex-1 overflow-y-auto p-4 space-y-2">
//           <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-4 px-2">
//             Messages Directs
//           </p>
          
//           {/* Exemple de contact (On bouclera ici plus tard) */}
//           <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/50 border border-slate-700 cursor-pointer">
//             <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-xs text-white">#</div>
//             <span className="text-slate-300 text-sm font-medium">Salon Général</span>
//           </div>
//         </div>

//         {/* SECTION UTILISATEUR & DECONNEXION (Bas) */}
//         <div className="h-20 bg-[#020617] flex items-center justify-between px-4 border-t border-slate-800">
//           <div className="flex items-center gap-3 overflow-hidden">
//             <div className="w-10 h-10 min-w-[40px] bg-[#22d3ee] rounded-full flex items-center justify-center font-bold text-[#020617] shadow-lg shadow-cyan-500/20">
//               {currentUser?.username?.charAt(0).toUpperCase()}
//             </div>
//             <div className="flex flex-col truncate">
//               <span className="text-white text-sm font-bold truncate">
//                 {currentUser?.username || "Utilisateur"}
//               </span>
//               <div className="flex items-center gap-1.5">
//                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
//                 <span className="text-green-500 text-[10px] font-bold uppercase tracking-tighter">En ligne</span>
//               </div>
//             </div>
//           </div>
          
//           {/* Bouton Logout */}
//           <button 
//             onClick={handleLogout}
//             className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500 group transition-all duration-300 border border-red-500/20 hover:border-red-500"
//             title="Se déconnecter"
//           >
//             <svg 
//               xmlns="http://www.w3.org/2000/svg" 
//               fill="none" viewBox="0 0 24 24" 
//               strokeWidth={2.5} 
//               stroke="currentColor" 
//               className="w-5 h-5 text-red-500 group-hover:text-white"
//             >
//               <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
//             </svg>
//           </button>
//         </div>
//       </div>

//       {/* 3. ZONE DE CHAT (Principale) */}
//       <div className="flex-1 flex flex-col bg-[#0f172a] relative">
//         {/* Header de discussion */}
//         <div className="h-16 flex items-center px-8 border-b border-slate-800 bg-[#0f172a]/80 backdrop-blur-md">
//           <div className="flex items-center gap-2">
//             <span className="text-slate-500 font-light text-2xl">@</span>
//             <span className="text-white font-bold tracking-tight">Bienvenue</span>
//           </div>
//         </div>
        
//         {/* Contenu de bienvenue */}
//         <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
//             <div className="relative mb-6">
//                 <div className="absolute inset-0 bg-cyan-500 blur-3xl opacity-10 rounded-full"></div>
//                 <img src={Logo} alt="ChatVerse" className="w-40 h-40 object-contain relative z-10 opacity-40 hover:opacity-100 transition-opacity duration-700" />
//             </div>
//             <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
//                 Salut, <span className="text-[#22d3ee]">{currentUser?.username}</span> !
//             </h1>
//             <p className="text-slate-400 max-w-sm leading-relaxed">
//                 Prêt à explorer l'univers ? Sélectionnez un contact dans la barre latérale pour lancer une discussion.
//             </p>
//         </div>

//         {/* Petit indicateur de sécurité factice */}
//         <div className="absolute bottom-4 right-6 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/50 border border-slate-800">
//             <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></div>
//             <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest text-white/50">Encrypted Session</span>
//         </div>
//       </div>

//     </div>
//   );
// }

// export default Dashboard;


