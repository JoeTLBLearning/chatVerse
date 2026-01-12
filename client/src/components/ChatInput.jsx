import React, { useState } from "react";

export default function ChatInput({ handleSendMsg }) {
  const [msg, setMsg] = useState("");

  const sendChat = (event) => {
    event.preventDefault();
    if (msg.length > 0) {
      handleSendMsg(msg);
      setMsg("");
    }
  };

  return (
    // On réduit le padding sur mobile (p-4 au lieu de p-6)
    <div className="p-4 md:p-6 border-t border-slate-800 bg-[#0f172a]">
      <form className="flex items-center gap-2 md:gap-4 bg-slate-900/50 p-2 rounded-xl border border-slate-800" onSubmit={sendChat}>
        <input
          type="text"
          placeholder="Écrire un message..."
          className="flex-1 bg-transparent border-none outline-none text-white px-2 h-10 text-sm md:text-base"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
        />
        <button type="submit" className="bg-[#22d3ee] p-2 rounded-lg text-[#020617] font-bold px-4 md:px-6 hover:bg-white transition-all text-sm md:text-base">
          {/* Sur tout petit écran on pourrait mettre juste une icône, mais le texte passe avec px-4 */}
          Envoyer
        </button>
      </form>
    </div>
  );
}