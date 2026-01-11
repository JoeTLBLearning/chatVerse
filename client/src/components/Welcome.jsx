import React from "react";

export default function Welcome({ currentUser, Logo }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
      <img src={Logo} alt="Logo" className="w-40 h-40 opacity-20 mb-6 animate-pulse" />
      <h1 className="text-3xl font-black text-white mb-2">
        Bienvenue, <span className="text-[#22d3ee]">{currentUser?.username} !</span>
      </h1>
      <p className="text-slate-400">Veuillez sélectionner un contact pour commencer à discuter.</p>
    </div>
  );
}