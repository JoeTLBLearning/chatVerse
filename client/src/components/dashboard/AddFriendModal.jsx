import React, { useState } from "react";
import axios from "axios";
import { searchUserRoute, sendFriendRequestRoute } from "../../utils/APIRoutes";

export default function AddFriendModal({ currentUser, onClose, socket }) {
    const [shortId, setShortId] = useState("");
    const [foundUser, setFoundUser] = useState(null);
    const [error, setError] = useState("");

    const handleSearch = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const cleanId = shortId.replace("#", "");
            const { data } = await axios.get(`${searchUserRoute}/${cleanId}`);

            if (data.status === true) {
                setFoundUser(data.user); 
            } else {
                setError(data.msg || "Utilisateur introuvable");
                setFoundUser(null);
            }
        } catch (err) {
            setError("Erreur lors de la recherche");
            setFoundUser(null);
        }
    };

    const sendRequest = async () => {
        if (!foundUser) return;
        try {
            const { data } = await axios.post(sendFriendRequestRoute, {
                senderId: currentUser._id,   
                receiverId: foundUser._id, 
            });

            if (data.status === false) {
                setError(data.msg);
                return;
            }

            // Envoi Socket sécurisé
            if (socket?.current) {
                socket.current.emit("send-friend-request", {
                    recipientId: foundUser._id,
                    sender: currentUser,
                    requestId: data.requestId
                });
            }

            alert("Demande envoyée !");
            onClose();
        } catch (err) {
            setError(err.response?.data?.msg || "Erreur lors de l'envoi");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-[#1e293b] w-full max-w-md rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
                <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Ajouter un ami</h3>
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Ex: #A1B2"
                            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#22d3ee]"
                            value={shortId}
                            onChange={(e) => setShortId(e.target.value)}
                        />
                        <button type="submit" className="bg-[#22d3ee] text-slate-900 font-bold px-4 py-2 rounded-lg hover:bg-[#06b6d4] transition-colors">
                            Chercher
                        </button>
                    </form>

                    {error && <p className="text-red-400 text-sm mt-3">{error}</p>}

                    {foundUser && (
                        <div className="mt-6 p-4 bg-slate-900/50 rounded-xl border border-slate-700 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#22d3ee] rounded-full flex items-center justify-center font-bold text-slate-900 uppercase">
                                    {/* Le ?. garantit que si username est absent, ça n'affiche rien au lieu de crash */}
                                    {foundUser?.username?.charAt(0)}
                                </div>
                                <span className="text-white font-medium">{foundUser?.username}</span>
                            </div>
                            <button
                                onClick={sendRequest}
                                className="text-xs bg-green-500/20 text-green-400 border border-green-500/50 px-3 py-1.5 rounded-full hover:bg-green-500 hover:text-white transition-all"
                            >
                                Ajouter
                            </button>
                        </div>
                    )}
                </div>
                <div className="bg-slate-800/50 p-4 flex justify-end">
                    <button onClick={onClose} className="text-slate-400 hover:text-white text-sm font-medium">Annuler</button>
                </div>
            </div>
        </div>
    );
}