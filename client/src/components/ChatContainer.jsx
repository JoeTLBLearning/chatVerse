import React, { useState, useEffect } from "react";
import axios from "axios";
import { recieveMessageRoute, sendMessageRoute } from "../utils/APIRoutes";

export default function ChatContainer({ currentChat, currentUser }) {
  const [messages, setMessages] = useState([]);

  // Récupérer les messages quand on change de contact
  useEffect(() => {
    setMessages([]); // Vide la liste actuelle avant de charger la nouvelle
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
    // On force la hauteur à 100% de l'espace disponible et on interdit le scroll ici
    <div className="flex flex-col h-full w-full overflow-hidden">

      {/* HEADER : Hauteur fixe (h-16 = 64px) */}
      <div className="flex-none h-16 flex items-center px-8 border-b border-slate-800 bg-[#0f172a]/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#22d3ee] flex items-center justify-center font-bold text-[#020617]">
            {currentChat.username.charAt(0).toUpperCase()}
          </div>
          <span className="text-white font-bold">{currentChat.username}</span>
        </div>
      </div>

      {/* LISTE MESSAGES : Prend tout l'espace restant (flex-1) et scrolle seulement ici */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.fromSelf ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] md:max-w-[70%] p-3 rounded-2xl text-sm ${msg.fromSelf
                ? "bg-[#22d3ee] text-[#020617] rounded-tr-none"
                : "bg-slate-800 text-white rounded-tl-none"
              }`}>
              {msg.message}
            </div>
          </div>
        ))}
      </div>

      {/* ZONE SAISIE : Hauteur fixe, toujours collée en bas grâce à flex-none */}
      <div className="flex-none p-4 md:p-6 border-t border-slate-800 bg-[#0f172a]">
        <form className="flex items-center gap-2 md:gap-4 bg-slate-900/50 p-2 rounded-xl border border-slate-800">
          <input
            type="text"
            placeholder="Écrire..."
            className="flex-1 bg-transparent border-none outline-none text-white px-2 text-base"
          />
          {/* text-base sur l'input empêche l'iPhone de zoomer automatiquement au clic */}
          <button className="bg-[#22d3ee] p-2 rounded-lg text-[#020617] font-bold px-4">
            Envoyer
          </button>
        </form>
      </div>
    </div>
  );
}