import React, { useState } from "react";
import axios from "axios";
import { sendInvitationRoute, kickFromRoomRoute } from "../../utils/APIRoutes";

export default function ManageMembersModal({ currentRoom, contacts, currentUser, onClose, onUpdateRoom }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);

    // 1. Récupérer les IDs des membres actuels pour ne pas les réinviter
    const memberIds = currentRoom.members.map(m => m._id || m);

    // 2. Filtrer les amis : ceux qui ne sont PAS dans le salon + filtre de recherche
    // Note : On utilise la liste 'contacts' passée depuis le Dashboard
    const availableFriends = contacts.filter(friend => 
        !memberIds.includes(friend._id) &&
        friend.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Action : Envoyer une INVITATION (et non un ajout direct)
    const handleSendInvite = async (friendId) => {
        if (loading) return;
        setLoading(true);
        try {
            // On utilise la route d'origine pour envoyer une invitation
            // Le backend attend un tableau 'userIds', donc on met [friendId]
            const { data } = await axios.post(sendInvitationRoute, {
                roomId: currentRoom._id,
                userIds: [friendId] 
            });

            if (data.status === false) {
                alert(data.msg || "Erreur lors de l'envoi.");
            } else {
                alert(`Invitation envoyée à l'utilisateur !`);
                // On ne met PAS à jour la room tout de suite car l'utilisateur n'a pas encore accepté
            }
        } catch (error) {
            console.error("Erreur invitation:", error);
            alert("Impossible d'envoyer l'invitation.");
        } finally {
            setLoading(false);
        }
    };

    // Action : Expulser un membre (Reste en ajout direct/suppression directe)
    const handleKickMember = async (memberId) => {
        if (memberId === currentRoom.owner) return;
        if (loading) return;
        
        if (!window.confirm("Voulez-vous vraiment retirer ce membre ?")) return;

        setLoading(true);
        try {
            const { data } = await axios.post(kickFromRoomRoute, {
                roomId: currentRoom._id,
                memberId: memberId,
                ownerId: currentUser._id
            });
            
            if (data.status) {
                // Ici on met à jour car le membre est vraiment parti
                onUpdateRoom(data.room);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-[#0f172a] border border-slate-800 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
                
                {/* HEADER */}
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-[#0f172a]">
                    <div>
                        <h2 className="text-xl font-bold text-white uppercase tracking-tighter">Gérer les membres</h2>
                        <p className="text-slate-400 text-xs mt-1">Salon : <span className="text-[#22d3ee]">{currentRoom.name}</span></p>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    
                    {/* SECTION 1 : INVITER DES AMIS */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Inviter des amis</label>
                            <span className="text-slate-600 text-[10px]">{availableFriends.length} dispo</span>
                        </div>
                        
                        {/* Barre de recherche */}
                        <div className="relative mb-3 group">
                            <input 
                                type="text" 
                                placeholder="Rechercher un ami..." 
                                className="w-full bg-[#020617] border border-slate-800 text-slate-200 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#22d3ee] transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <svg className="w-4 h-4 text-slate-500 absolute right-3 top-3 group-focus-within:text-[#22d3ee] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>

                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                            {availableFriends.length > 0 ? (
                                availableFriends.map(friend => (
                                    <div key={friend._id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/50 group transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-[#22d3ee] rounded-full flex items-center justify-center text-[#020617] text-xs font-bold">
                                                {friend.username[0].toUpperCase()}
                                            </div>
                                            <span className="text-slate-300 text-sm font-medium">{friend.username}</span>
                                        </div>
                                        <button 
                                            onClick={() => handleSendInvite(friend._id)}
                                            className="p-1.5 bg-slate-800 text-[#22d3ee] rounded-lg hover:bg-[#22d3ee] hover:text-[#020617] transition-all opacity-0 group-hover:opacity-100"
                                            title="Envoyer une invitation"
                                        >
                                            {/* Icône enveloppe/invitation */}
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-slate-600 text-xs italic py-2">Aucun ami à inviter.</p>
                            )}
                        </div>
                    </div>

                    <div className="border-t border-slate-800"></div>

                    {/* SECTION 2 : MEMBRES ACTUELS */}
                    <div>
                        <label className="text-slate-500 text-[10px] font-bold uppercase tracking-widest block mb-3">Membres du salon ({currentRoom.members.length})</label>
                        <div className="space-y-1">
                            {currentRoom.members.map(member => {
                                const isOwner = member._id === currentRoom.owner;
                                const isMe = member._id === currentUser._id;
                                
                                return (
                                    <div key={member._id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/30 transition-all group">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isOwner ? "bg-amber-500/20 text-amber-500 border border-amber-500/50" : "bg-slate-700 text-slate-300"}`}>
                                                {member.username ? member.username[0].toUpperCase() : "?"}
                                            </div>
                                            <div>
                                                <p className={`text-sm font-medium ${isOwner ? "text-amber-500" : "text-slate-300"}`}>
                                                    {member.username} 
                                                    {isMe && <span className="text-slate-500 text-[10px] ml-2">(Moi)</span>}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Bouton KICK (visible seulement si je suis owner et que la cible n'est pas owner) */}
                                        {currentUser._id === currentRoom.owner && !isOwner && (
                                            <button 
                                                onClick={() => handleKickMember(member._id)}
                                                className="p-1.5 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                title="Retirer du salon"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" /></svg>
                                            </button>
                                        )}
                                        {isOwner && <span className="text-[9px] font-bold uppercase text-amber-500/50 pr-2">Admin</span>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}