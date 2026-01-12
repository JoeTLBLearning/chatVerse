import React, { useState } from "react";
import axios from "axios";
import { createRoomRoute } from "../utils/APIRoutes";
import { toast } from "react-toastify";

function CreateRoomModal({ currentUser, closeDetails, onRoomCreated }) {
  const [roomName, setRoomName] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Ajout pour la sécurité

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Protection contre le double-clic
    if (isLoading) return;

    if (roomName.length < 3) {
      toast.error("Le nom du serveur doit faire au moins 3 caractères.");
      return;
    }

    setIsLoading(true); // On commence le chargement
    try {
      const { data } = await axios.post(createRoomRoute, {
        name: roomName,
        ownerId: currentUser._id,
      });

      if (data.status) {
        toast.success("Salon créé avec succès !");
        onRoomCreated(data.room); // On renvoie le nouveau salon au Dashboard pour l'afficher direct
        closeDetails(); // On ferme la modale
      }
    } catch (error) {
      toast.error("Erreur lors de la création du salon.");
    } finally {
      setIsLoading(false); // On libère le chargement peu importe l'issue
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-[#1e293b] p-8 rounded-2xl w-96 border border-slate-700 shadow-2xl animate-fade-in">
        <h2 className="text-2xl font-bold text-white mb-2 text-center">Créer un Salon</h2>
        <p className="text-slate-400 text-sm text-center mb-6">Donnez un nom à votre nouvel univers.</p>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-300 uppercase">Nom du salon</label>
            <input
              type="text"
              className="bg-[#0f172a] text-white p-3 rounded-lg border border-slate-600 focus:border-[#22d3ee] outline-none transition-colors"
              placeholder="Ex: La Team Rocket"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={closeDetails}
              className="flex-1 py-3 rounded-lg font-bold text-slate-300 hover:bg-slate-700 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading} // Désactivé pendant le chargement
              className={`flex-1 py-3 rounded-lg font-bold transition-colors ${
                isLoading 
                ? "bg-slate-600 text-slate-400 cursor-not-allowed" 
                : "bg-[#22d3ee] text-[#020617] hover:bg-white"
              }`}
            >
              {isLoading ? "Création..." : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateRoomModal;