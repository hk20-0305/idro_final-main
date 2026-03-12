import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { idroApi } from "../services/api";

export default function MissionControl() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await idroApi.getAlerts();
        const active = res.data.filter(a => a.missionStatus === "OPEN");
        setAlerts(active);
      } catch (err) {
        console.error("Failed to load alerts", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

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
          INITIALIZING_SYSTEM_CORE...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-14 font-sans relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none z-0"></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="mb-24 flex flex-col gap-1 items-start border-l-4 border-white pl-6">
          <h1 className="text-3xl font-black tracking-[0.2em] text-white uppercase">
            IDRO | Mission Control Center
          </h1>
          <p className="text-zinc-600 font-bold tracking-[0.4em] text-[10px] uppercase">
            Strategic Disaster Management Infrastructure
          </p>
        </div>

        <div className="space-y-6">
          {alerts.length === 0 && (
            <div className="p-20 text-center border border-zinc-900 rounded-xl">
              <p className="text-zinc-700 font-black uppercase tracking-widest text-xs">No Active Missions</p>
            </div>
          )}

          {alerts.map(alert => {
            const theme = getSeverityTheme(alert.magnitude);
            return (
              <div
                key={alert.id}
                onClick={() => navigate(`/disasterdetails2/${alert.id}`)}
                className={`cursor-pointer border p-10 transition-all duration-300 group flex justify-between items-center relative overflow-hidden ${theme.card} ${theme.glow}`}
              >
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${theme.strip}`} />

                <div className="flex flex-col gap-4 flex-1 pl-4">
                  <h2 className={`text-5xl font-black text-white uppercase tracking-tighter transition-colors ${theme.hoverTitle}`}>
                    {alert.type}
                  </h2>
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-[1px] bg-zinc-700"></div>
                    <p className="text-[13px] text-zinc-500 font-bold uppercase tracking-[0.15em] leading-relaxed max-w-2xl">
                      {alert.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-0">
                  <div className="px-12 border-l border-zinc-800 flex flex-col items-end gap-2">
                    <span className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.3em]">Severity</span>
                    <span className={`text-xl font-black uppercase tracking-[0.2em] ${theme.severityText}`}>
                      {alert.magnitude || "UNKNOWN"}
                    </span>
                  </div>

                  <div className="px-12 border-l border-zinc-800 flex flex-col items-end gap-2">
                    <span className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.3em]">Operational Status</span>
                    <div className={`px-5 py-1.5 font-black text-xs uppercase tracking-[0.35em] rounded ${theme.badge}`}>
                      ACTIVE
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
