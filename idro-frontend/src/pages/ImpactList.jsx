import { Activity, ArrowRight, BarChart3, Trash2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { idroApi } from "../services/api"; // Import Real API

export default function ImpactList() {
  const [disasters, setDisasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // ✅ NEW: Track Errors
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDisasters = async (isInitialLoad = false) => {
      try {
        if (isInitialLoad) {
          setLoading(true);
        }
        const res = await idroApi.getAlerts();
        // Normalize MongoDB _id → id
        const normalized = res.data.map(item => ({
          ...item,
          id: item.id || item._id
        }));
        const active = normalized.filter(d => d.missionStatus === 'OPEN');
        setDisasters(active);
        setError(null);
      } catch (err) {
        console.error("Failed to load impact list", err);
        setError("⚠ UNABLE TO CONNECT TO SERVER. Is Backend Running?");
      } finally {
        if (isInitialLoad) {
          setLoading(false);
        }
      }
    };

    fetchDisasters(true); // first load with loading state

    const interval = setInterval(() => {
      fetchDisasters(false); // auto refresh without loading state
    }, 3000);

    return () => clearInterval(interval); // cleanup
  }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation(); // Avoid navigating to details
    if (!id) return;

    if (window.confirm("⚠️ This will PERMANENTLY DELETE this disaster and its analysis data. Proceed?")) {
      try {
        await idroApi.deleteAlert(id);
        setDisasters(prev => prev.filter(d => d.id !== id));
      } catch (err) {
        console.error("Delete failed", err);
        alert("Failed to delete disaster. Is server reachable?");
      }
    }
  };


  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 p-8 font-sans relative overflow-hidden">
      {/* Organic Background: Mesh Gradient and Noise */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(5,150,105,0.08)_0%,transparent_50%),radial-gradient(circle_at_bottom_right,rgba(153,27,27,0.05)_0%,transparent_50%)] pointer-events-none z-0"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(30,58,138,0.15)_0%,transparent_60%)] pointer-events-none z-0"></div>
      <div className="absolute inset-0 backdrop-blur-[100px] pointer-events-none z-0"></div>

      <div className="max-w-6xl mx-auto relative z-10">

        {/* Header */}
        <div className="flex items-center gap-6 mb-12 border-b border-slate-200/5 pb-8">
          <div className="p-4 bg-emerald-600/10 border border-emerald-500/20 rounded-2xl shadow-inner">
            <BarChart3 size={36} className="text-emerald-400" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white">
              Impact Analysis
            </h1>
            <p className="text-slate-400 text-base mt-1 font-medium italic">
              Predictive models for disaster resource allocation
            </p>
          </div>
        </div>

        {/* ✅ NEW: Error Message Display */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 p-4 rounded-xl text-red-200 flex items-center gap-3 mb-6 animate-pulse">
            <XCircle size={24} />
            <span className="font-bold">{error}</span>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center gap-3 text-blue-400 animate-pulse">
            <Activity /> Syncing with Satellite Database...
          </div>
        )}

        {/* Empty State (Only show if NOT loading and NO error) */}
        {!loading && !error && disasters.length === 0 && (
          <div className="text-slate-500 italic">No Active Threats Requiring Analysis.</div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {disasters.map((disaster) => (
            <div
              key={disaster.id}
              onClick={() => navigate(`/impact-analysis/${disaster.id}`)}
              className="group cursor-pointer bg-slate-900/40 hover:bg-emerald-950/20 border border-slate-800 hover:border-emerald-500/30 p-8 rounded-[2.5rem] transition-all duration-500 relative flex flex-col justify-between shadow-2xl"
            >
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <span className={`text-[11px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border ${disaster.color === 'RED' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                    {disaster.type}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-500 font-bold tracking-tighter uppercase">{disaster.time || "Real-Time"}</span>
                    <button
                      onClick={(e) => handleDelete(e, disaster.id)}
                      className="p-2 bg-slate-950/50 hover:bg-rose-500/20 border border-white/5 hover:border-rose-500/50 rounded-lg text-slate-500 hover:text-rose-400 transition-all z-20"
                      title="Permanently Delete Disaster"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-white group-hover:text-emerald-400 transition-colors leading-tight">
                    {disaster.location}
                  </h2>
                  <p className="text-sm text-slate-400 mt-2 line-clamp-2 leading-relaxed font-medium">
                    {disaster.impact}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-8">
                  <div className="bg-slate-950/40 p-4 rounded-3xl border border-white/5">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Affected</p>
                    <p className="text-xl font-bold text-white mt-1">{disaster.affectedCount}</p>
                  </div>
                  <div className="bg-slate-950/40 p-4 rounded-3xl border border-white/5">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Injured</p>
                    <p className="text-xl font-bold text-rose-400 mt-1">{disaster.injuredCount || 0}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-[0.2em] mt-8 group-hover:translate-x-2 transition-transform">
                  View Insight <ArrowRight size={16} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}