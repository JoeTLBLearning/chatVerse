import React, { useState } from "react";

export default function Sidebar({
    viewState,
    contacts,
    currentChat,
    currentRoom,
    onManageMembers,
    onLeaveOrDelete,
    currentUser,
    onChatSelect,
    notifications,
    onLogout,
    onAddFriend,
    onManageChannels,
    currentChannel,
    onChannelSelect,
    onlineUsers = []
}) {
    const [showRoomMenu, setShowRoomMenu] = useState(false);

    const ownerId = currentRoom?.owner?._id || currentRoom?.owner;
    const isOwner = ownerId === currentUser?._id;
    const hasFriends = contacts && contacts.length > 0;

    return (
        <div className="w-72 bg-[#0f172a] flex flex-col border-r border-slate-800">
            {/* Header Sidebar */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 relative">
                <h2 className="text-white font-black uppercase text-lg truncate pr-2">
                    {viewState === "DM" ? "ChatVerse" : currentRoom?.name}
                </h2>

                <div className="flex items-center">
                    {/* Bouton Menu (...) */}
                    {viewState !== "DM" && currentRoom && (
                        <button
                            onClick={() => setShowRoomMenu(!showRoomMenu)}
                            className={`p-1.5 rounded-lg transition-all ${showRoomMenu ? "text-[#22d3ee] bg-slate-800" : "text-slate-500 hover:text-[#22d3ee] hover:bg-slate-800"}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                            </svg>
                        </button>
                    )}

                    {/* Bouton Ajouter Ami (+) */}
                    {viewState === "DM" && hasFriends && (
                        <button
                            onClick={onAddFriend}
                            className="p-1.5 bg-slate-800 text-[#22d3ee] rounded-lg hover:bg-[#22d3ee] hover:text-slate-900 transition-all"
                            title="Ajouter un ami"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* DROPDOWN MENU - Avec Blur et Décalage Gauche (right-6) */}
                {showRoomMenu && viewState !== "DM" && (
                    <div className="absolute top-14 right-6 w-56 bg-[#020617]/80 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl z-[100] py-1 overflow-hidden animate-in fade-in zoom-in duration-150">
                        {isOwner && (
                            <>
                                <button onClick={() => { onManageChannels(); setShowRoomMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-[#22d3ee] hover:text-[#020617] transition-all flex items-center gap-2">
                                    <span className="opacity-70 font-bold">#</span> Gérer les canaux
                                </button>
                                <button onClick={() => { onManageMembers(); setShowRoomMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-[#22d3ee] hover:text-[#020617] transition-all flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                    Gérer les membres
                                </button>
                                <div className="border-t border-slate-800 my-1"></div>
                            </>
                        )}
                        <button
                            onClick={() => {
                                onLeaveOrDelete(currentRoom._id, ownerId);
                                setShowRoomMenu(false);
                            }}
                            className={`w-full text-left px-4 py-3 text-sm font-bold transition-all ${isOwner ? "text-red-500 hover:bg-red-500 hover:text-white" : "text-orange-400 hover:bg-orange-400/10"}`}
                        >
                            {isOwner ? "Supprimer le salon" : "Quitter le salon"}
                        </button>
                    </div>
                )}
            </div>

            {/* Liste Contenu */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {viewState === "DM" ? (
                    <>
                        {!hasFriends ? (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 px-4">
                                <div className="p-4 bg-slate-800/30 rounded-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-500" fill="none" viewBox="-1 0 29 29" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.318l-1.317 1.412a2 2 0 00-.381.594l-1.26 3.613a2 2 0 01-1.14 1.14l-3.613 1.26a2 2 0 00-.594.381l-1.412 1.317a2 2 0 000 2.828l1.412 1.317a2 2 0 00.594.381l3.613 1.26a2 2 0 011.14 1.14l1.26 3.613a2 2 0 00.381.594l1.317 1.412a2 2 0 002.828 0l1.317-1.412a2 2 0 00.381-.594l1.26-3.613a2 2 0 011.14-1.14l3.613-1.26a2 2 0 00.594-.381l1.412-1.317a2 2 0 000-2.828l-1.412-1.317a2 2 0 00-.594-.381l-3.613-1.26a2 2 0 01-1.14-1.14l-1.26-3.613a2 2 0 00-.381-.594L14.828 4.318a2 2 0 00-2.828 0z" />
                                    </svg>
                                </div>
                                <p className="text-slate-400 text-sm">C'est bien calme ici...</p>
                                <button onClick={onAddFriend} className="mt-4 text-[#22d3ee] border border-[#22d3ee]/30 px-4 py-2 rounded-xl hover:bg-[#22d3ee]/10 transition-all font-bold text-sm">
                                    Ajouter un ami
                                </button>
                            </div>
                        ) : (
                            <>
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest px-2">Messages Directs</p>
                                <div className="space-y-1">
                                    {contacts.map((contact) => (
                                        <div key={contact._id} className={`flex items-center p-2 rounded-lg cursor-pointer transition-all ${currentChat?._id === contact._id ? "bg-slate-700 shadow-lg" : "hover:bg-slate-800"}`} onClick={() => onChatSelect(contact)}>
                                            <div className="relative shrink-0">
                                                <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center text-slate-900 font-bold">
                                                    {contact.username?.charAt(0).toUpperCase()}
                                                </div>
                                                {notifications.includes(contact._id) && <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 border-2 border-[#0f172a] rounded-full"></span>}
                                                {onlineUsers.includes(contact._id) && <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-[#0f172a] rounded-full"></span>}
                                            </div>
                                            <span className={`ml-3 text-sm truncate ${currentChat?._id === contact._id ? "text-white font-bold" : "text-slate-300"}`}>{contact.username}</span>
                                            
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    <div className="space-y-4">
                        <div className="px-2">
                            <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                                <span className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">Liste des canaux</span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            {currentRoom?.channels?.map((channel, index) => (
                                <div key={channel._id || index} onClick={() => onChannelSelect(channel)} className={`flex items-center gap-2 p-2 px-3 rounded-lg cursor-pointer group transition-all ${currentChannel?._id === channel._id ? "bg-slate-800 text-[#22d3ee]" : "text-slate-400 hover:bg-slate-800 hover:text-[#22d3ee]"}`}>
                                    <span className="text-xl opacity-50 group-hover:opacity-100">#</span>
                                    <span className="text-sm font-medium uppercase tracking-wide">{channel.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer User - RESTAURÉ AVEC SHORTID */}
            <div className="h-24 bg-[#020617] flex items-center justify-between px-4 border-t border-slate-800">
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 min-w-[40px] bg-[#22d3ee] rounded-full flex items-center justify-center font-bold text-[#020617]">
                        {currentUser?.username?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col truncate">
                        <span className="text-white text-sm font-bold truncate leading-tight">{currentUser?.username}</span>
                        <span className="text-slate-500 text-[11px] font-mono leading-tight">#{currentUser?.shortId}</span>
                        <div className="flex items-center gap-1.5 mt-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-green-500 text-[10px] font-bold uppercase tracking-tighter">En ligne</span>
                        </div>
                    </div>
                </div>
                <button onClick={onLogout} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all" title="Déconnexion">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                    </svg>
                </button>
            </div>
        </div>
    );
}