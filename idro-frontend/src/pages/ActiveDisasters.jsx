import { Activity, MapPin, TriangleAlert } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { idroApi } from "../services/api";

export default function ActiveDisasters() {
  const [disasters, setDisasters] = useState([]);
  const [loading, setLoading] = useState(true);


  const removeDuplicates = (data) => {
    const uniqueMap = new Map();
    data.forEach(item => uniqueMap.set(item.location, item));
    return Array.from(uniqueMap.values());
  };

  const fetchDisasters = useCallback(async () => {
    try {
      const res = await idroApi.getAlerts();
      console.log("🔍 Raw API Response:", res.data);

      // Normalize MongoDB _id → id
      const normalized = res.data.map(item => ({
        ...item,
        id: item.id || item._id
      }));
      console.log("🔍 Normalized data:", normalized);

      const active = normalized.filter(alert => alert.missionStatus === "OPEN");
      console.log("🔍 Filtered OPEN alerts:", active);

      const uniqueDisasters = removeDuplicates(active);
      console.log("🔍 Unique disasters:", uniqueDisasters);

      setDisasters(uniqueDisasters);
    } catch (err) {
      console.error("❌ Failed to fetch active disasters", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDisasters(); // first load

    const interval = setInterval(() => {
      fetchDisasters(); // refresh every 10 seconds
    }, 10000);

    return () => clearInterval(interval); // cleanup
  }, [fetchDisasters]);

  // DELETE FUNCTION
  const handleDelete = async (e, id) => {
    e.stopPropagation();

    if (!id) return alert("Invalid ID");

    if (window.confirm("⚠️ Are you sure you want to DELETE this Disaster Alert?")) {
      try {
        await idroApi.deleteAlert(id);
        setDisasters(prev => prev.filter(d => d.id !== id));
      } catch (error) {
        console.error(error);
        alert("Delete failed. Is backend running?");
      }
    }
  };


  const getCardStyle = (urgency, color) => {
    // High / Immediate
    if (urgency === "Immediate" || urgency === "High" || color === "RED")
      return "bg-red-950/40 border-red-500/50 hover:border-red-500 hover:bg-red-900/40";

    // Medium
    if (urgency === "Medium" || color === "ORANGE")
      return "bg-yellow-950/40 border-yellow-500/50 hover:border-yellow-500 hover:bg-yellow-900/40";

    // Low / Default
    return "bg-green-950/40 border-green-500/50 hover:border-green-500 hover:bg-green-900/40";
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6 md:p-10 font-sans">

      {/* Header */}
      <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
        <div className="p-3 bg-red-600 rounded-lg shadow-[0_0_20px_rgba(220,38,38,0.5)] animate-pulse">
          <TriangleAlert size={32} className="text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-wider uppercase">Active Disaster Feed</h1>
          <p className="text-slate-400 text-sm font-mono">LIVE DATA FROM IDRO SATELLITE NETWORK</p>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-3 text-blue-400 animate-pulse">
          <Activity /> Establishing Secure Uplink...
        </div>
      )}

      {!loading && disasters.length === 0 && (
        <div className="text-slate-500 italic">No Active Disasters Detected. System Normal.</div>
      )}

      {console.log("🎨 Rendering with disasters:", disasters, "Length:", disasters.length)}

      {disasters.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {disasters.map(d => (
            <div
              key={d.id}
              className={`p-6 rounded-2xl border transition-all duration-300 group relative overflow-hidden ${getCardStyle(d.urgency, d.color)}`}
            >
              <div className="absolute -right-4 -top-4 opacity-5 text-white transform rotate-12 group-hover:scale-110 transition-transform">
                <TriangleAlert size={150} />
              </div>

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest border ${(d.urgency === "Immediate" || d.urgency === "High" || d.color === "RED")
                    ? "bg-red-600 text-white border-red-400"
                    : (d.urgency === "Medium" || d.color === "ORANGE")
                      ? "bg-yellow-500 text-black border-yellow-400"
                      : "bg-green-600 text-white border-green-400"
                    }`}>
                    {d.urgency ? d.urgency.toUpperCase() : (d.color === "RED" ? "CRITICAL ALERT" : "WARNING")}
                  </span>
                  <button
                    onClick={(e) => handleDelete(e, d.id)}
                    className="p-2 bg-slate-900/50 hover:bg-red-600/20 border border-white/10 hover:border-red-500/50 rounded-lg text-slate-500 hover:text-red-400 transition-all z-20"
                    title="Delete Disaster"
                  >
                    <TriangleAlert size={14} className="rotate-180" />
                  </button>
                </div>

                <h2 className="text-2xl font-bold mb-3 group-hover:text-blue-300 transition-colors">
                  {d.type || "UNKNOWN"}
                </h2>

                <div className="flex items-center gap-2 text-slate-300 text-lg font-medium">
                  <MapPin size={20} className="text-blue-500" /> {d.location || "Unknown Location"}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
