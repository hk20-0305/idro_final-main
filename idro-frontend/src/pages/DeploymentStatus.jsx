import { MapPin, Truck } from "lucide-react";
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
            const normalized = res.data.map(item => ({
                ...item,
                id: item.id || item._id
            }));
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
        const interval = setInterval(fetchDisasters, 10000);
        return () => clearInterval(interval);
    }, [fetchDisasters]);

    const getSeverityTheme = (magnitude) => {
        const m = magnitude?.toLowerCase();
        if (m === 'critical' || m === 'extreme')
            return {
                card: 'border-red-500/70 bg-red-950/20 hover:border-red-400 hover:bg-red-950/30',
                glow: 'shadow-[0_0_30px_rgba(239,68,68,0.12)]',
                strip: 'bg-red-500',
                severityText: 'text-red-400',
                hoverTitle: 'group-hover:text-red-400',
                badge: 'bg-red-500/20 border border-red-500/40 text-red-300',
            };
        if (m === 'high')
            return {
                card: 'border-rose-500/70 bg-rose-950/20 hover:border-rose-400 hover:bg-rose-950/30',
                glow: 'shadow-[0_0_25px_rgba(244,63,94,0.12)]',
                strip: 'bg-rose-500',
                severityText: 'text-rose-400',
                hoverTitle: 'group-hover:text-rose-400',
                badge: 'bg-rose-500/20 border border-rose-500/40 text-rose-300',
            };
        if (m === 'moderate' || m === 'medium' || m === 'orange')
            return {
                card: 'border-orange-500/70 bg-orange-950/20 hover:border-orange-400 hover:bg-orange-950/30',
                glow: 'shadow-[0_0_25px_rgba(249,115,22,0.12)]',
                strip: 'bg-orange-500',
                severityText: 'text-orange-400',
                hoverTitle: 'group-hover:text-orange-400',
                badge: 'bg-orange-500/20 border border-orange-500/40 text-orange-300',
            };
        if (m === 'low' || m === 'watch' || m === 'minor')
            return {
                card: 'border-yellow-500/70 bg-yellow-950/20 hover:border-yellow-400 hover:bg-yellow-950/30',
                glow: 'shadow-[0_0_25px_rgba(234,179,8,0.10)]',
                strip: 'bg-yellow-500',
                severityText: 'text-yellow-400',
                hoverTitle: 'group-hover:text-yellow-400',
                badge: 'bg-yellow-500/20 border border-yellow-500/40 text-yellow-300',
            };
        return {
            card: 'border-emerald-500/50 bg-emerald-950/10 hover:border-emerald-400 hover:bg-emerald-950/20',
            glow: 'shadow-[0_0_20px_rgba(16,185,129,0.08)]',
            strip: 'bg-emerald-500',
            severityText: 'text-emerald-400',
            hoverTitle: 'group-hover:text-emerald-400',
            badge: 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300',
        };
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-zinc-600 font-mono text-[10px] tracking-[0.5em] animate-pulse">
                    SYNCING_FIELD_UNITS...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-14 font-sans relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none z-0"></div>

            <div className="relative z-10 max-w-7xl mx-auto">
                <div>
                    <div className="flex items-center gap-4">
                        <Truck size={20} className="text-emerald-400" />
                        <h1 className="text-3xl font-black tracking-[0.2em] text-white uppercase">
                            Live Deployment Status
                        </h1>
                    </div>
                    <p className="text-zinc-600 font-bold tracking-[0.4em] text-[10px] uppercase pl-9">
                        Real-Time Field Operations Tracking
                    </p>
                </div>

                <div className="space-y-6">
                    {disasters.length === 0 && (
                        <div className="p-20 text-center border border-zinc-900 rounded-xl">
                            <p className="text-zinc-700 font-black uppercase tracking-widest text-xs">No Active Deployments. All Units on Standby.</p>
                        </div>
                    )}

                    {disasters.map(d => {
                        const theme = getSeverityTheme(d.magnitude);
                        return (
                            <Link
                                key={d.id}
                                to={`/deployment-analyzer/${d.id}`}
                                className={`cursor-pointer border p-10 transition-all duration-300 group flex justify-between items-center relative overflow-hidden ${theme.card} ${theme.glow}`}
                            >
                                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${theme.strip}`} />

                                <div className="flex flex-col gap-4 flex-1 pl-4">
                                    <h2 className={`text-5xl font-black text-white uppercase tracking-tighter transition-colors ${theme.hoverTitle}`}>
                                        {d.type || "MISSION"}
                                    </h2>
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-[1px] bg-zinc-700"></div>
                                        <p className="text-[13px] text-zinc-500 font-bold uppercase tracking-[0.15em] leading-relaxed max-w-2xl flex items-center gap-2">
                                            <MapPin size={13} className="text-zinc-600 flex-shrink-0" />
                                            {d.location || "Unknown Sector"}
                                        </p>
                                    </div>
                                    {d.responderName && (
                                        <div className="flex items-center gap-2 text-[12px] text-zinc-500 font-bold uppercase tracking-widest">
                                            <Truck size={12} className="text-zinc-600" />
                                            Lead Unit: <span className="text-yellow-400">{d.responderName}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-0 flex-shrink-0">
                                    <div className="px-12 border-l border-zinc-800 flex flex-col items-end gap-2">
                                        <span className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.3em]">Severity</span>
                                        <span className={`text-xl font-black uppercase tracking-[0.2em] ${theme.severityText}`}>
                                            {d.magnitude || "UNKNOWN"}
                                        </span>
                                    </div>

                                    <div className="px-12 border-l border-zinc-800 flex flex-col items-end gap-2">
                                        <span className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.3em]">Mission Status</span>
                                        <div className={`px-5 py-1.5 font-black text-xs uppercase tracking-[0.35em] rounded ${theme.badge}`}>
                                            {d.missionStatus || "ACTIVE"}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
