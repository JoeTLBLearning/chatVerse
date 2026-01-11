export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, type = "danger" }) {
    if (!isOpen) return null;

    const accentColor = type === "danger" ? "bg-red-500" : "bg-blue-500";

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#0f172a] border border-slate-800 w-full max-w-sm rounded-2xl p-6 shadow-2xl scale-in-center">
                <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                <p className="text-slate-400 text-sm mb-6">{message}</p>
                <div className="flex gap-3">
                    <button onClick={onCancel} className="flex-1 py-2 text-slate-400 hover:bg-slate-800 rounded-lg transition-all font-bold text-xs uppercase">
                        Annuler
                    </button>
                    <button onClick={onConfirm} className={`flex-1 py-2 ${accentColor} text-white rounded-lg transition-all font-bold text-xs uppercase hover:opacity-90`}>
                        Confirmer
                    </button>
                </div>
            </div>
        </div>
    );
}