import React from "react";
import Logo from "../../assets/logo.png";

export default function ServerBar({ 
  rooms, viewState, currentChat, currentRoom, 
  onDMClick, onRoomClick, onAddRoom 
}) {
  return (
    <div className="w-20 bg-[#020617] flex flex-col items-center py-4 gap-4 border-r border-slate-800">
      {/* Bouton Home / DM */}
      <div
        onClick={onDMClick}
        className={`p-2 rounded-2xl cursor-pointer transition-all ${
          viewState === "DM" && !currentChat ? "bg-[#22d3ee]" : "bg-white hover:rounded-xl"
        }`}
      >
        <img src={Logo} alt="Logo" className="w-10 h-10 object-contain" />
      </div>

      <div className="w-10 h-[2px] bg-slate-800 rounded-full"></div>

      {/* Liste des Rooms */}
      {rooms.map((room) => (
        <div
          key={room._id}
          onClick={() => onRoomClick(room)}
          className={`w-12 h-12 rounded-3xl flex items-center justify-center font-bold cursor-pointer transition-all ${
            currentRoom?._id === room._id
              ? "bg-[#22d3ee] text-[#020617] rounded-xl"
              : "bg-slate-800 text-white hover:rounded-xl"
          }`}
        >
          {room.name.substring(0, 2).toUpperCase()}
        </div>
      ))}

      {/* Bouton Add Room */}
      <div
        onClick={onAddRoom}
        className="w-12 h-12 bg-slate-800 rounded-3xl hover:rounded-xl hover:bg-[#22d3ee] transition-all cursor-pointer flex items-center justify-center text-white font-bold text-xl"
      >
        +
      </div>
    </div>
  );
}