import React, { useState } from "react";

export default function ChannelItem({ channel, index, onRename, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(channel.name);

  const isGeneral = channel.name.toLowerCase() === "général" || channel.name.toLowerCase() === "general";

  const handleSave = () => {
    onRename(channel._id || index, tempName);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempName(channel.name);
    setIsEditing(false);
  };

  return (
    <div className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
      isEditing ? "border-[#22d3ee] bg-slate-800/50" : "bg-slate-900/50 border-slate-800"
    }`}>
      
      {/* GAUCHE : INPUT OU TEXTE */}
      <div className="flex items-center gap-2 flex-1">
        <span className="text-slate-500 font-mono">#</span>
        {isEditing ? (
          <input 
            autoFocus
            type="text"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-[#22d3ee] w-full mr-4"
          />
        ) : (
          <span className="text-white font-medium text-sm">
            {channel.name}
            {isGeneral && <span className="ml-2 text-[9px] bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded">FIXE</span>}
          </span>
        )}
      </div>

      {/* DROITE : ACTIONS */}
      <div className="flex gap-1 ml-2">
        {isGeneral ? (
          <div className="p-2 text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
        ) : isEditing ? (
          <>
            <button onClick={handleSave} className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </button>
            <button onClick={handleCancel} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </>
        ) : (
          <>
            <button onClick={() => setIsEditing(true)} className="p-2 text-slate-400 hover:text-[#22d3ee] hover:bg-slate-800 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button onClick={() => onDelete(channel._id || index)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-slate-800 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}