import React, { useState, useEffect } from "react";
import axios from "axios";
import { recieveMessageRoute, sendMessageRoute } from "../utils/APIRoutes";

export default function ChatContainer({ currentChat, currentUser }) {
  const [messages, setMessages] = useState([]);

  // Récupérer les messages quand on change de contact
  useEffect(() => {
    const fetchMessages = async () => {
      const response = await axios.post(recieveMessageRoute, {
        from: currentUser._id,
        to: currentChat._id,
      });
      setMessages(response.data);
    };
    if (currentChat) fetchMessages();
  }, [currentChat]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header du chat */}
      <div className="h-16 flex items-center px-8 border-b border-slate-800 bg-[#0f172a]/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#22d3ee] flex items-center justify-center font-bold text-[#020617]">
            {currentChat.username.charAt(0).toUpperCase()}
          </div>
          <span className="text-white font-bold">{currentChat.username}</span>
        </div>
      </div>

      {/* Liste des messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.fromSelf ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${
              msg.fromSelf 
              ? "bg-[#22d3ee] text-[#020617] rounded-tr-none" 
              : "bg-slate-800 text-white rounded-tl-none"
            }`}>
              {msg.message}
            </div>
          </div>
        ))}
      </div>

      {/* Zone de saisie (On va l'améliorer avec un composant Input plus tard) */}
      <div className="p-6 border-t border-slate-800">
        <form className="flex items-center gap-4 bg-slate-900/50 p-2 rounded-xl border border-slate-800">
           <input 
             type="text" 
             placeholder="Écrire un message..." 
             className="flex-1 bg-transparent border-none outline-none text-white px-2"
           />
           <button className="bg-[#22d3ee] p-2 rounded-lg text-[#020617] font-bold px-4">Envoyer</button>
        </form>
      </div>
    </div>
  );
}