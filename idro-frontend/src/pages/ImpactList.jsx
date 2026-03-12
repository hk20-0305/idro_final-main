import { ArrowRight, BarChart3, MapPin, Trash2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { idroApi } from "../services/api";

const getSeverityTheme = (magnitude, color) => {
  const m = magnitude?.toLowerCase();
  if (m === 'critical' || m === 'extreme' || color === 'RED')
    return { label: 'Critical', textColor: 'text-red-400', border: 'border-red-500/40', bg: 'bg-red-950/20', strip: 'bg-red-500', arrow: 'group-hover:text-red-400', dot: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.9)]', badge: 'bg-red-500/15 border-red-500/30 text-red-300' };
  if (m === 'high')
    return { label: 'High', textColor: 'text-rose-400', border: 'border-rose-500/40', bg: 'bg-rose-950/20', strip: 'bg-rose-500', arrow: 'group-hover:text-rose-400', dot: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.9)]', badge: 'bg-rose-500/15 border-rose-500/30 text-rose-300' };
  if (m === 'moderate' || m === 'medium')
    return { label: 'Moderate', textColor: 'text-orange-400', border: 'border-orange-500/40', bg: 'bg-orange-950/20', strip: 'bg-orange-500', arrow: 'group-hover:text-orange-400', dot: 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.9)]', badge: 'bg-orange-500/15 border-orange-500/30 text-orange-300' };
  if (m === 'low' || m === 'watch')
    return { label: 'Low', textColor: 'text-yellow-400', border: 'border-yellow-500/30', bg: 'bg-yellow-950/15', strip: 'bg-yellow-500', arrow: 'group-hover:text-yellow-400', dot: 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.9)]', badge: 'bg-yellow-500/15 border-yellow-500/30 text-yellow-300' };
  return { label: 'Stable', textColor: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-950/10', strip: 'bg-emerald-500', arrow: 'group-hover:text-emerald-400', dot: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.9)]', badge: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' };
};

export default function ImpactList() {
  const [disasters, setDisasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDisasters = async (isInitial = false) => {
      try {
        if (isInitial) setLoading(true);
        const res = await idroApi.getAlerts();
        const normalized = res.data.map(item => ({ ...item, id: item.id || item._id }));
        setDisasters(normalized.filter(d => d.missionStatus === 'OPEN'));
        setError(null);
      } catch (err) {
        setError("Unable to connect to server.");
      } finally {
        if (isInitial) setLoading(false);
      }
    };
    fetchDisasters(true);
    const interval = setInterval(() => fetchDisasters(false), 3000);
    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!id) return;
    if (window.confirm("This will permanently delete this disaster record. Proceed?")) {
      try {
        await idroApi.deleteAlert(id);
        setDisasters(prev => prev.filter(d => d.id !== id));
      } catch {
        alert("Delete failed.");
      }
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <BarChart3 size={26} className="text-emerald-500 animate-pulse" />
        <p className="text-zinc-600 font-mono text-[9px] tracking-[0.5em] uppercase">Loading Disaster Records...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white font-sans relative">

      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-8 py-14">

        <div className="mb-24 flex flex-col gap-1 items-start border-l-4 border-white pl-6">
          <h1 className="text-3xl font-black tracking-[0.2em] text-white uppercase">
            IDRO | IMPACT ANALYZER
          </h1>
          <p className="text-zinc-600 font-bold tracking-[0.4em] text-[10px] uppercase">
            Strategic Disaster Management Infrastructure
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-3 mb-8 px-4 py-3 border border-red-500/30 bg-red-950/20 rounded">
            <XCircle size={15} className="text-red-400 flex-shrink-0" />
            <span className="text-red-300 text-sm font-medium">{error}</span>
          </div>
        )}

        {disasters.length === 0 && !error && (
          <div className="py-28 text-center border border-white/5">
            <BarChart3 size={32} className="text-zinc-800 mx-auto mb-4" />
            <p className="text-zinc-600 font-mono text-[9px] tracking-[0.4em] uppercase">No Open Disaster Records</p>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {disasters.map((disaster, idx) => {
            const theme = getSeverityTheme(disaster.magnitude, disaster.color);
            return (
              <div
                key={disaster.id}
                onClick={() => navigate(`/impact-analysis/${disaster.id}`)}
                className={`cursor-pointer border p-10 transition-all duration-300 group flex justify-between items-center relative overflow-hidden ${theme.border} bg-white/[0.01] hover:bg-white/[0.03]`}
              >
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${theme.strip}`} />

                <div className="flex flex-col gap-4 flex-1 pl-4">
                  <h2 className={`text-5xl font-black text-white uppercase tracking-tighter transition-colors group-hover:${theme.textColor}`}>
                    {disaster.type}
                  </h2>
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-[1px] bg-zinc-700 flex-shrink-0" />
                    <p className="text-[13px] text-zinc-500 font-bold uppercase tracking-[0.15em] leading-relaxed max-w-2xl">
                      {disaster.location || "Unknown Location"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-0">
                  <div className="px-12 border-l border-zinc-800 flex flex-col items-end gap-2">
                    <span className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.3em]">Severity</span>
                    <span className={`text-xl font-black uppercase tracking-[0.2em] ${theme.textColor}`}>
                      {theme.label}
                    </span>
                  </div>

                  <div className="px-12 border-l border-zinc-800 flex flex-col items-end gap-2">
                    <span className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.3em]">Affected</span>
                    <span className="text-white font-black text-xl tabular-nums leading-none">
                      {(disaster.affectedCount || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="pl-12 border-l border-zinc-800 flex flex-col items-end gap-2 relative">
                    <div className={`flex items-center gap-2 text-zinc-600 transition-all duration-300 ${theme.arrow} group-hover:translate-x-2 py-2`}>
                      <span className="font-mono text-[10px] tracking-[0.3em] uppercase font-black whitespace-nowrap">Open Analysis</span>
                      <ArrowRight size={16} />
                    </div>
                    <button
                      onClick={(e) => handleDelete(e, disaster.id)}
                      className="absolute -right-8 top-1/2 -translate-y-1/2 p-2.5 rounded border border-transparent hover:border-red-500/30 hover:bg-red-500/10 text-zinc-700 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {disasters.length > 0 && (
          <p className="mt-8 text-zinc-800 font-mono text-[8px] tracking-[0.4em] uppercase text-center">
            Click any row to open full impact analysis
          </p>
        )}
      </div>
    </div>
  );
}