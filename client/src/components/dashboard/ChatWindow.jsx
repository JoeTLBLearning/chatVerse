import React, { useEffect } from "react";
import ChatInput from "../ChatInput"; // Ton ancien composant ChatInput
import Logo from "../../assets/logo.png";
import LogoLight from "../../assets/logo_light.png";

export default function ChatWindow({
    viewState, currentChat, currentRoom, messages, currentChannel,
    handleSendMsg, scrollRef
}) {

    // Auto-scroll logic ici ou dans le parent, mais ici c'est plus logique visuellement
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, scrollRef]);

    if (!currentChat && !currentRoom) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-40">
                <img src={LogoLight} alt="Logo" className="w-40 h-40 object-contain mb-4" />
                <h1 className="text-2xl font-bold text-white uppercase tracking-tighter">ChatVerse</h1>
                <p className="text-slate-400 text-sm">Sélectionnez une discussion ou un salon.</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-[#0f172a]">
            {/* Header */}
            <div className="h-16 flex items-center px-8 border-b border-slate-800 bg-[#0f172a]/80 backdrop-blur-md z-10">
                <span className="text-slate-500 font-light text-2xl mr-2">
                    {viewState === "DM" ? "@" : "#"}
                </span>
                <span className="text-white font-bold tracking-tight">
                    {viewState === "DM"
                        ? currentChat?.username
                        : `${currentRoom?.name} > ${currentChannel?.name || "général"}` // ✅ Affiche le chemin complet
                    }
                </span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-white">



                {messages.map((msg, index) => (
                    <div key={index} ref={scrollRef} className={`flex flex-col mb-4 ${msg.fromSelf ? "items-end" : "items-start"}`}>

                        {/* On affiche le nom de l'expéditeur uniquement dans les salons et si ce n'est pas nous */}
                        {viewState === "ROOM" && !msg.fromSelf && (
                            <span className="text-[10px] text-slate-500 ml-1 mb-1 font-bold uppercase tracking-tight">
                                {msg.senderName || "Anonyme"}
                            </span>
                        )}

                        <div className={`p-3 rounded-2xl max-w-[75%] shadow-sm ${msg.fromSelf
                            ? "bg-[#22d3ee] text-[#020617] rounded-tr-none"
                            : "bg-slate-800 text-slate-200 rounded-tl-none"
                            }`}>
                            <p className="text-sm leading-relaxed">{msg.message}</p>

                            {/* Optionnel : petite heure sous le message */}
                            <span className={`text-[9px] mt-1 block opacity-50 ${msg.fromSelf ? "text-right" : "text-left"}`}>
                                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <ChatInput handleSendMsg={handleSendMsg} />
        </div>
    );
}