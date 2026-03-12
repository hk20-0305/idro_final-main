import { X } from "lucide-react";

export default function DonationModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-black border border-emerald-500/20 rounded-2xl p-8 w-full max-w-md relative shadow-[0_0_50px_rgba(16,185,129,0.1)] overflow-hidden">

        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50"></div>


        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-white"
        >
          <X />
        </button>

        <h2 className="text-2xl font-black text-white mb-2 text-center uppercase tracking-tighter">
          Support <span className="text-emerald-400">Relief</span>
        </h2>

        <p className="text-[10px] text-slate-500 text-center mb-8 uppercase tracking-[0.2em] font-bold">
          Scan with UPI (GPay / PhonePe / Paytm)
        </p>


        <div className="flex justify-center">
          <img
            src="/donation-qr.png"
            alt="Donation QR"
            className="w-64 h-64 rounded-xl border-2 border-emerald-500/10 shadow-lg"
          />
        </div>

        <p className="text-xs text-slate-500 text-center mt-4">
          Every contribution helps save lives ❤️
        </p>
      </div>
    </div>
  );
}
