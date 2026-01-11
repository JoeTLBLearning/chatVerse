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
    <div className="p-6 border-t border-slate-800 bg-[#0f172a]">
      <form className="flex items-center gap-4 bg-slate-900/50 p-2 rounded-xl border border-slate-800" onSubmit={sendChat}>
        <input
          type="text"
          placeholder="Écrire un message..."
          className="flex-1 bg-transparent border-none outline-none text-white px-2 h-10"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
        />
        <button type="submit" className="bg-[#22d3ee] p-2 rounded-lg text-[#020617] font-bold px-6 hover:bg-white transition-all">
          Envoyer
        </button>
      </form>
    </div>
  );
}