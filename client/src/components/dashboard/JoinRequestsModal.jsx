import React from "react";
import axios from "axios";
import { handleJoinRequestRoute, handleFriendRequestRoute } from "../../utils/APIRoutes";

export default function JoinRequestsModal({ requests, onClose, onUpdate }) {

    const handleAction = async (req, accept) => {
        try {
            let response;

            if (req.type === "ROOM") {
                // Logique SALON
                const { data } = await axios.post(handleJoinRequestRoute, {
                    roomId: req.payload.roomId,
                    userId: localStorage.getItem("chat-app-user") ? JSON.parse(localStorage.getItem("chat-app-user"))._id : null,
                    accept
                });
                if (data.status) {
                    onUpdate(req.id, "ROOM", accept, data.room);
                }
            }
            else if (req.type === "FRIEND") {
                // Logique AMI
                const { data } = await axios.post(handleFriendRequestRoute, {
                    requestId: req.payload.requestId,
                    accept: accept // <-- On envoie 'accept' (true/false) au lieu de 'status'
                });

                if (data.status) {
                    onUpdate(req.id, "FRIEND", accept, data);
                }
            }
        } catch (err) {
            console.error("Erreur action notification :", err);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[#0f172a] border border-slate-800 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                    <h2 className="text-white font-bold uppercase text-sm tracking-widest">Notifications</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
                </div>
                <div className="max-h-80 overflow-y-auto p-2">
                    {requests.length === 0 ? (
                        <p className="text-slate-500 text-center py-8 text-sm italic">Aucune nouvelle notification</p>
                    ) : (
                        requests.map((req, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl mb-2 border border-slate-800">
                                <div>
                                    <div className="flex items-center gap-2">
                                        {req.type === "FRIEND" && <span className="text-xs bg-purple-500 text-white px-1 rounded">AMI</span>}
                                        {req.type === "ROOM" && <span className="text-xs bg-blue-500 text-white px-1 rounded">SALON</span>}
                                        <p className="text-white font-medium text-sm">{req.title}</p>
                                    </div>
                                    <p className="text-slate-400 text-[10px] uppercase font-bold mt-1">{req.subtitle}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleAction(req, false)}
                                        className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => handleAction(req, true)}
                                        className="p-2 bg-[#22d3ee] text-[#020617] rounded-lg font-bold hover:scale-105 transition-all"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}