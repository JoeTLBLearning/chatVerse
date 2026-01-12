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
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center opacity-40">
                <img src={LogoLight} alt="Logo" className="w-32 h-32 md:w-40 md:h-40 object-contain mb-4" />
                <h1 className="text-xl md:text-2xl font-bold text-white uppercase tracking-tighter">ChatVerse</h1>
                <p className="text-slate-400 text-sm">Sélectionnez une discussion ou un salon.</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-[#0f172a] h-full w-full">
            {/* Header - Adapté pour le bouton menu mobile */}
            <div className="h-16 flex items-center px-4 md:px-8 pl-16 md:pl-8 border-b border-slate-800 bg-[#0f172a]/80 backdrop-blur-md z-10">
                <span className="text-slate-500 font-light text-xl md:text-2xl mr-2">
                    {viewState === "DM" ? "@" : "#"}
                </span>
                <span className="text-white font-bold tracking-tight truncate text-sm md:text-base">
                    {viewState === "DM"
                        ? currentChat?.username
                        : `${currentRoom?.name} > ${currentChannel?.name || "général"}`
                    }
                </span>
            </div>

            {/* Messages - Padding réduit sur mobile */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 text-white">
                {messages.map((msg, index) => (
                    <div key={index} ref={scrollRef} className={`flex flex-col ${msg.fromSelf ? "items-end" : "items-start"}`}>
                        {viewState === "ROOM" && !msg.fromSelf && (
                            <span className="text-[10px] text-slate-500 ml-1 mb-1 font-bold uppercase tracking-tight">
                                {msg.senderName || "Anonyme"}
                            </span>
                        )}

                        {/* max-w-85% sur mobile, 75% sur desktop */}
                        <div className={`p-3 rounded-2xl max-w-[85%] md:max-w-[75%] shadow-sm ${msg.fromSelf
                            ? "bg-[#22d3ee] text-[#020617] rounded-tr-none"
                            : "bg-slate-800 text-slate-200 rounded-tl-none"
                            }`}>
                            <p className="text-sm leading-relaxed break-words">{msg.message}</p>
                            
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