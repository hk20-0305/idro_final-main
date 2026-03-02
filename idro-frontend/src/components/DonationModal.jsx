import { X } from "lucide-react";

export default function DonationModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#1e293b] border border-white/10 rounded-xl p-6 w-full max-w-md relative shadow-2xl">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-white"
        >
          <X />
        </button>

        <h2 className="text-xl font-bold text-yellow-400 mb-2 text-center">
          Support Disaster Relief
        </h2>

        <p className="text-sm text-slate-400 text-center mb-4">
          Scan this QR code using GPay / PhonePe / Paytm
        </p>

        {/* QR Code Image */}
        <div className="flex justify-center">
          <img
            src="/donation-qr.png"
            alt="Donation QR"
            className="w-64 h-64 rounded-lg border border-white/10"
          />
        </div>

        <p className="text-xs text-slate-500 text-center mt-4">
          Every contribution helps save lives ❤️
        </p>
      </div>
    </div>
  );
}
