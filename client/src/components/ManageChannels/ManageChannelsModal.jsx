import React, { useState } from "react";
import axios from "axios";
import ChannelItem from "./ChannelItem";
import { addChannelRoute, renameChannelRoute, deleteChannelRoute } from "../../utils/APIRoutes";

export default function ManageChannelsModal({ currentRoom, onClose, onUpdateRoom }) {
    const [newChannelName, setNewChannelName] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleAddChannel = async () => {
        if (!newChannelName.trim()) return;

        setIsLoading(true);
        try {
            const { data } = await axios.post(addChannelRoute, {
                roomId: currentRoom._id,
                channelName: newChannelName.trim(),
            });

            if (data.status) {
                // ✅ On informe le Dashboard que la room a changé
                onUpdateRoom(data.updatedRoom);
                setNewChannelName(""); // On vide l'input
            }
        } catch (error) {
            console.error("Erreur lors de l'ajout du canal", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRenameChannel = async (channelId, newName) => {
        if (!newName.trim()) return;

        try {
            const { data } = await axios.post(renameChannelRoute, {
                roomId: currentRoom._id,
                channelId: channelId,
                newName: newName.trim(),
            });

            if (data.status) {
                onUpdateRoom(data.updatedRoom); // Met à jour le Dashboard
            }
        } catch (error) {
            console.error("Erreur lors du renommage :", error);
        }
    };

    const handleDeleteChannel = async (channelId) => {
        // Petite sécurité : confirmer la suppression
        if (!window.confirm("Es-tu sûr de vouloir supprimer ce canal ? Tous les messages seront perdus.")) {
            return;
        }

        try {
            const { data } = await axios.post(deleteChannelRoute, {
                roomId: currentRoom._id,
                channelId: channelId,
            });

            if (data.status) {
                onUpdateRoom(data.updatedRoom);
            }
        } catch (error) {
            console.error("Erreur lors de la suppression :", error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-[#0f172a] border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                    <h2 className="text-white font-bold text-xl">Gestion des salons</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-white text-2xl">&times;</button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Création */}
                    <div className="space-y-2">
                        <label className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Créer un nouveau canal</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newChannelName}
                                onChange={(e) => setNewChannelName(e.target.value)}
                                placeholder="Ex: annonces"
                                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#22d3ee] text-sm"
                            />
                            <button onClick={handleAddChannel} className="bg-[#22d3ee] text-[#020617] font-bold px-4 py-2 rounded-lg hover:scale-105 transition-all">+</button>
                        </div>
                    </div>

                    {/* Liste */}
                    <div className="space-y-2">
                        <label className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Canaux actuels</label>
                        <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                            {currentRoom?.channels?.map((channel, index) => (
                                <ChannelItem
                                    key={channel._id || index}
                                    channel={channel}
                                    index={index}
                                    onRename={handleRenameChannel}
                                    onDelete={handleDeleteChannel}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}