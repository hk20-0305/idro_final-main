import { MapPin, Radio, ShieldAlert, TriangleAlert, Zap } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { idroApi } from "../services/api";

export default function ActiveDisasters() {
  const [disasters, setDisasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

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
      const active = normalized.filter(alert => alert.missionStatus === "OPEN");
      setDisasters(removeDuplicates(active));
    } catch (err) {
      console.error("❌ Failed to fetch active disasters", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDisasters();
    const interval = setInterval(fetchDisasters, 10000);
    return () => clearInterval(interval);
  }, [fetchDisasters]);

  useEffect(() => {
    const clock = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(clock);
  }, []);

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

  const getSeverityTheme = (magnitude) => {
    const m = magnitude?.toLowerCase();
    if (m === 'critical' || m === 'extreme')
      return {
        card: 'border-red-500/60 bg-red-950/25',
        hoverCard: 'hover:border-red-400 hover:bg-red-950/40',
        glow: 'shadow-[0_0_40px_rgba(239,68,68,0.15),inset_0_0_40px_rgba(239,68,68,0.03)]',
        strip: 'bg-gradient-to-b from-red-400 to-red-700',
        stripGlow: 'shadow-[0_0_15px_rgba(239,68,68,0.8)]',
        severityText: 'text-red-400',
        hoverTitle: 'group-hover:text-red-300',
        badge: 'bg-red-500/20 border border-red-500/50 text-red-300',
        dot: 'bg-red-500',
        dotGlow: 'shadow-[0_0_12px_rgba(239,68,68,1)]',
        label: 'CRITICAL',
        scanline: 'from-red-500/5',
      };
    if (m === 'high')
      return {
        card: 'border-rose-500/60 bg-rose-950/25',
        hoverCard: 'hover:border-rose-400 hover:bg-rose-950/40',
        glow: 'shadow-[0_0_40px_rgba(244,63,94,0.15),inset_0_0_40px_rgba(244,63,94,0.03)]',
        strip: 'bg-gradient-to-b from-rose-400 to-rose-700',
        stripGlow: 'shadow-[0_0_15px_rgba(244,63,94,0.8)]',
        severityText: 'text-rose-400',
        hoverTitle: 'group-hover:text-rose-300',
        badge: 'bg-rose-500/20 border border-rose-500/50 text-rose-300',
        dot: 'bg-rose-500',
        dotGlow: 'shadow-[0_0_12px_rgba(244,63,94,1)]',
        label: 'HIGH',
        scanline: 'from-rose-500/5',
      };
    if (m === 'moderate' || m === 'medium' || m === 'orange')
      return {
        card: 'border-orange-500/60 bg-orange-950/25',
        hoverCard: 'hover:border-orange-400 hover:bg-orange-950/40',
        glow: 'shadow-[0_0_40px_rgba(249,115,22,0.15),inset_0_0_40px_rgba(249,115,22,0.03)]',
        strip: 'bg-gradient-to-b from-orange-400 to-orange-700',
        stripGlow: 'shadow-[0_0_15px_rgba(249,115,22,0.8)]',
        severityText: 'text-orange-400',
        hoverTitle: 'group-hover:text-orange-300',
        badge: 'bg-orange-500/20 border border-orange-500/50 text-orange-300',
        dot: 'bg-orange-500',
        dotGlow: 'shadow-[0_0_12px_rgba(249,115,22,1)]',
        label: 'MODERATE',
        scanline: 'from-orange-500/5',
      };
    if (m === 'low' || m === 'watch' || m === 'minor')
      return {
        card: 'border-yellow-500/60 bg-yellow-950/25',
        hoverCard: 'hover:border-yellow-400 hover:bg-yellow-950/40',
        glow: 'shadow-[0_0_40px_rgba(234,179,8,0.12),inset_0_0_40px_rgba(234,179,8,0.03)]',
        strip: 'bg-gradient-to-b from-yellow-400 to-yellow-700',
        stripGlow: 'shadow-[0_0_15px_rgba(234,179,8,0.8)]',
        severityText: 'text-yellow-400',
        hoverTitle: 'group-hover:text-yellow-300',
        badge: 'bg-yellow-500/20 border border-yellow-500/50 text-yellow-300',
        dot: 'bg-yellow-500',
        dotGlow: 'shadow-[0_0_12px_rgba(234,179,8,1)]',
        label: 'LOW',
        scanline: 'from-yellow-500/5',
      };
    return {
      card: 'border-emerald-500/50 bg-emerald-950/15',
      hoverCard: 'hover:border-emerald-400 hover:bg-emerald-950/30',
      glow: 'shadow-[0_0_30px_rgba(16,185,129,0.10),inset_0_0_40px_rgba(16,185,129,0.02)]',
      strip: 'bg-gradient-to-b from-emerald-400 to-emerald-700',
      stripGlow: 'shadow-[0_0_15px_rgba(16,185,129,0.8)]',
      severityText: 'text-emerald-400',
      hoverTitle: 'group-hover:text-emerald-300',
      badge: 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300',
      dot: 'bg-emerald-500',
      dotGlow: 'shadow-[0_0_12px_rgba(16,185,129,1)]',
      label: 'STABLE',
      scanline: 'from-emerald-500/5',
    };
  };

  const critical = disasters.filter(d => ['critical', 'extreme', 'high'].includes(d.magnitude?.toLowerCase())).length;
  const moderate = disasters.filter(d => ['moderate', 'medium', 'orange'].includes(d.magnitude?.toLowerCase())).length;

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
      <style>{`
        @keyframes radar-sweep {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .radar-sweep { animation: radar-sweep 2s linear infinite; transform-origin: 50% 50%; }
      `}</style>
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20" />
        <div className="absolute inset-3 rounded-full border border-emerald-500/15" />
        <div className="absolute inset-6 rounded-full border border-emerald-500/10" />
        <div className="radar-sweep absolute inset-0 rounded-full overflow-hidden">
          <div className="absolute top-0 left-1/2 w-0 h-12 origin-bottom"
            style={{ background: 'linear-gradient(to top, rgba(16,185,129,0.6), transparent)', width: '2px', transform: 'translateX(-50%)' }} />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,1)]" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-emerald-400 font-mono text-[10px] tracking-[0.5em] uppercase animate-pulse">Scanning Satellite Network</p>
        <p className="text-zinc-700 font-mono text-[9px] tracking-[0.3em] uppercase mt-1">Establishing Secure Uplink...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white font-sans relative overflow-hidden">

      <style>{`
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes flicker {
          0%, 100% { opacity: 1; }
          92% { opacity: 1; }
          93% { opacity: 0.85; }
          94% { opacity: 1; }
        }
        @keyframes alert-breathe {
          0%, 100% { box-shadow: 0 0 20px rgba(239,68,68,0.2); }
          50% { box-shadow: 0 0 40px rgba(239,68,68,0.5), 0 0 80px rgba(239,68,68,0.1); }
        }
        @keyframes slide-in-up {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .card-enter { animation: slide-in-up 0.5s ease forwards; }
        .flicker { animation: flicker 8s infinite; }
      `}</style>

      {/* Animated scanline overlay */}
      <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden opacity-[0.03]"
        style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)' }}>
      </div>

      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:80px_80px] pointer-events-none z-0" />

      {/* Top bleed glow — red if there are critical disasters */}
      {critical > 0 && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-60 z-10" />
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-8 md:px-14 py-12">

        <div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">

            {/* Title */}
            <div className="flex flex-col gap-2 border-l-4 border-red-500 pl-6">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <ShieldAlert size={16} className="text-red-400" />
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,1)]" />
                </div>
                  <p className="text-red-400 font-mono text-[9px] tracking-[0.45em] uppercase font-black">
                    IDRO // ACTIVE THREAT MONITOR
                  </p>
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-[0.1em] text-white uppercase leading-none flicker">
                Active Disaster Feed
              </h1>
            </div>

            {/* Live clock + signal */}
            <div className="flex items-center gap-6 pb-1">
              <div className="flex flex-col items-end gap-1">
                <span className="text-zinc-600 font-mono text-[9px] tracking-[0.3em] uppercase">System Time</span>
                <span className="text-white font-mono text-lg font-black tracking-widest tabular-nums">
                  {currentTime.toLocaleTimeString('en-IN', { hour12: false })}
                </span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <Radio size={18} className="text-emerald-400 animate-pulse" />
                <span className="text-emerald-500 font-mono text-[8px] tracking-[0.4em] uppercase">LIVE</span>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-0 border border-white/10 overflow-hidden">
            <div className="flex flex-col items-center justify-center py-4 px-6 border-r border-white/10 bg-white/[0.01] relative group">
              <span className="text-white/70 font-mono text-[9px] tracking-[0.3em] uppercase mb-1.5 font-black">Total Active</span>
              <span className="text-3xl font-black text-white tabular-nums leading-none">{disasters.length}</span>
              <span className="text-zinc-300 font-mono text-[8px] tracking-[0.3em] uppercase mt-1">Incidents</span>
            </div>
            <div className="flex flex-col items-center justify-center py-4 px-6 border-r border-white/10 bg-red-950/10 relative">
              <span className="text-white/70 font-mono text-[9px] tracking-[0.3em] uppercase mb-1.5 font-black">Critical / High</span>
              <span className="text-3xl font-black text-red-400 tabular-nums leading-none">{critical}</span>
              <span className="text-zinc-300 font-mono text-[8px] tracking-[0.3em] uppercase mt-1">Immediate Action</span>
              {critical > 0 && <div className="absolute inset-x-0 bottom-0 h-0.5 bg-red-500 opacity-60" />}
            </div>
            <div className="flex flex-col items-center justify-center py-4 px-6 bg-orange-950/10 relative">
              <span className="text-white/70 font-mono text-[9px] tracking-[0.3em] uppercase mb-1.5 font-black">Moderate</span>
              <span className="text-3xl font-black text-orange-400 tabular-nums leading-none">{moderate}</span>
              <span className="text-zinc-300 font-mono text-[8px] tracking-[0.3em] uppercase mt-1">Monitoring</span>
              {moderate > 0 && <div className="absolute inset-x-0 bottom-0 h-0.5 bg-orange-500 opacity-60" />}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <Zap size={14} className="text-zinc-600 flex-shrink-0" />
          <div className="flex-1 h-[1px] bg-gradient-to-r from-white/10 to-transparent" />
          <span className="text-zinc-700 font-mono text-[9px] tracking-[0.5em] uppercase whitespace-nowrap">
            {disasters.length} Mission{disasters.length !== 1 ? 's' : ''} Requiring Response
          </span>
          <div className="flex-1 h-[1px] bg-gradient-to-l from-white/10 to-transparent" />
          <Zap size={14} className="text-zinc-600 flex-shrink-0 rotate-180" />
        </div>

        {disasters.length === 0 && (
          <div className="py-32 flex flex-col items-center gap-4 border border-white/5">
            <div className="w-16 h-16 rounded-full border-2 border-emerald-500/20 flex items-center justify-center">
              <ShieldAlert size={28} className="text-emerald-500/40" />
            </div>
            <p className="text-zinc-600 font-black uppercase tracking-[0.4em] text-xs">All Clear — No Active Threats</p>
            <p className="text-zinc-800 font-mono text-[9px] tracking-widest uppercase">System Nominal</p>
          </div>
        )}

        <div className="space-y-5">
          {disasters.map((d, idx) => {
            const theme = getSeverityTheme(d.magnitude);
            return (
              <div
                key={d.id}
                className={`card-enter cursor-pointer border relative overflow-hidden transition-all duration-300 group ${theme.card} ${theme.hoverCard} ${theme.glow}`}
                style={{ animationDelay: `${idx * 80}ms` }}
                onClick={() => navigate(`/disaster/${d.id}`)}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${theme.scanline} via-transparent to-transparent pointer-events-none`} />

                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${theme.strip} ${theme.stripGlow}`} />

                <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-[0.04] pointer-events-none transition-all duration-500 group-hover:opacity-[0.07]">
                  <TriangleAlert size={160} className="text-white" />
                </div>

                <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-4 p-6 pl-10">

                  <div className="flex items-start gap-6 flex-1 min-w-0">

                    <div className="flex-shrink-0 flex flex-col items-center gap-2 pt-1">
                      <div className={`w-3 h-3 rounded-full ${theme.dot} ${theme.dotGlow}`} />
                      <div className={`w-3 h-3 rounded-full ${theme.dot} opacity-30 animate-ping absolute`} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-zinc-700 font-mono text-[9px] tracking-[0.4em] uppercase">
                          #{String(idx + 1).padStart(2, '0')}
                        </span>
                        <div className={`px-3 py-1 font-mono text-[9px] tracking-[0.35em] uppercase font-black rounded ${theme.badge}`}>
                          {theme.label}
                        </div>
                      </div>

                      <h2 className={`text-3xl md:text-4xl font-black text-white uppercase tracking-tight leading-none mb-3 transition-colors duration-300 ${theme.hoverTitle}`}>
                        {d.type || "UNKNOWN"}
                      </h2>

                      <div className="flex items-center gap-2 max-w-2xl">
                        <div className="w-6 h-[1px] bg-zinc-700 flex-shrink-0" />
                        <MapPin size={12} className="text-zinc-600 flex-shrink-0" />
                        <p className="text-[12px] text-zinc-500 font-bold uppercase tracking-[0.12em] leading-relaxed truncate">
                          {d.location || "Unknown Location"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-stretch gap-0 flex-shrink-0">
                    <div className="px-10 border-l border-zinc-800/80 flex flex-col items-end justify-center gap-1.5">
                      <span className="text-[8px] text-zinc-600 font-black uppercase tracking-[0.4em]">Severity</span>
                      <span className={`text-2xl font-black uppercase tracking-[0.15em] ${theme.severityText}`}>
                        {d.magnitude || "UNKNOWN"}
                      </span>
                    </div>

                    <div className="px-10 border-l border-zinc-800/80 flex flex-col items-end justify-center gap-1.5">
                      <span className="text-[8px] text-zinc-600 font-black uppercase tracking-[0.4em]">Status</span>
                      <div className={`px-4 py-1.5 font-black text-[10px] uppercase tracking-[0.35em] rounded ${theme.badge}`}>
                        {d.missionStatus || "OPEN"}
                      </div>
                    </div>

                    <div className="px-6 border-l border-zinc-800/80 flex items-center justify-center">
                      <button
                        onClick={(e) => handleDelete(e, d.id)}
                        className="p-2.5 bg-black/30 hover:bg-red-600/20 border border-white/5 hover:border-red-500/40 rounded-lg text-zinc-600 hover:text-red-400 transition-all z-20"
                        title="Remove Alert"
                      >
                        <TriangleAlert size={14} className="rotate-180" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-0 left-1.5 right-0 h-[2px] bg-white/5">
                  <div
                    className={`h-full ${theme.strip} opacity-40 transition-all duration-1000`}
                    style={{ width: d.magnitude?.toLowerCase() === 'critical' ? '100%' : d.magnitude?.toLowerCase() === 'high' ? '75%' : d.magnitude?.toLowerCase() === 'moderate' ? '50%' : '30%' }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {disasters.length > 0 && (
          <div className="mt-10 border-t border-white/5 pt-4 flex items-center justify-between">
            <span className="text-zinc-800 font-mono text-[9px] tracking-[0.4em] uppercase">
              IDRO_SATELLITE_UPLINK
            </span>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
              <span className="text-zinc-700 font-mono text-[9px] tracking-[0.3em] uppercase">Feed Active</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
