import { Activity, MapPin, Truck } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { idroApi } from "../services/api";

export default function DeploymentStatus() {
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

            // Normalize MongoDB _id → id
            const normalized = res.data.map(item => ({
                ...item,
                id: item.id || item._id
            }));

            // Show OPEN and ASSIGNED missions for deployment status
            const active = normalized.filter(alert =>
                alert.missionStatus === "OPEN" || alert.missionStatus === "ASSIGNED"
            );

            const uniqueDisasters = removeDuplicates(active);
            setDisasters(uniqueDisasters);
        } catch (err) {
            console.error("❌ Failed to fetch deployment status", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDisasters();
        const interval = setInterval(fetchDisasters, 10000); // 10s polling
        return () => clearInterval(interval);
    }, [fetchDisasters]);

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
                <div className="p-3 bg-green-600 rounded-lg shadow-[0_0_20px_rgba(34,197,94,0.5)] animate-pulse">
                    <Truck size={32} className="text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-black tracking-wider uppercase">Live Deployment Status</h1>
                    <p className="text-slate-400 text-sm font-mono">REAL-TIME FIELD OPERATIONS TRACKING</p>
                </div>
            </div>

            {loading && (
                <div className="flex items-center gap-3 text-green-400 animate-pulse">
                    <Activity /> Syncing with Field Units...
                </div>
            )}

            {!loading && disasters.length === 0 && (
                <div className="text-slate-500 italic">No Active Deployments. All Units on Standby.</div>
            )}

            {disasters.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {disasters.map(d => (
                        <Link
                            key={d.id}
                            to={`/deployment-analyzer/${d.id}`}
                            className={`p-6 rounded-2xl border transition-all duration-300 group relative overflow-hidden block cursor-pointer ${getCardStyle(d.urgency, d.color)}`}
                        >
                            <div className="absolute -right-4 -top-4 opacity-5 text-white transform rotate-12 group-hover:scale-110 transition-transform">
                                <Truck size={150} />
                            </div>

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest border ${(d.urgency === "Immediate" || d.urgency === "High" || d.color === "RED")
                                        ? "bg-red-600 text-white border-red-400"
                                        : (d.urgency === "Medium" || d.color === "ORANGE")
                                            ? "bg-yellow-500 text-black border-yellow-400"
                                            : "bg-green-600 text-white border-green-400"
                                        }`}>
                                        {d.urgency ? d.urgency.toUpperCase() : "DEPLOYED"}
                                    </span>

                                    <span className="text-[10px] font-mono text-slate-400 bg-black/30 px-2 py-1 rounded border border-white/10">
                                        STATUS: {d.missionStatus || "ACTIVE"}
                                    </span>
                                </div>

                                <h2 className="text-2xl font-bold mb-3 group-hover:text-green-300 transition-colors">
                                    {d.type || "MISSION"}
                                </h2>

                                <div className="flex items-center gap-2 text-slate-300 text-lg font-medium">
                                    <MapPin size={20} className="text-green-500" /> {d.location || "Unknown Sector"}
                                </div>

                                {d.responderName && (
                                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2 text-sm text-yellow-400">
                                        <Truck size={16} /> Lead Unit: {d.responderName}
                                    </div>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
