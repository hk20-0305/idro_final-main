import * as Icons from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReliefCalculationStandards from "../components/ReliefCalculationStandards";
import { idroApi } from "../services/api";

export default function DisasterAnalyzer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [disaster, setDisaster] = useState(null);
  const [camps, setCamps] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const alertsRes = await idroApi.getAlerts();
      const found = alertsRes.data.find(d => String(d.id) === id);

      if (!found) throw new Error("Disaster not found");
      setDisaster(found);

      try {
        const impactRes = await idroApi.getImpactAnalysis(id);
        const analysis = impactRes.data;

        if (analysis) {
          // DIRECT MAPPING FROM BACKEND (ZERO LOGIC ON FRONTEND)
          const enrichedCamps = analysis.campAnalysisList.map(c => ({
            id: c.campId,
            name: c.campName,
            people: c.population,
            injured: c.injuredCount,
            foodPackets: c.foodPackets,
            waterLiters: c.waterLiters,
            beds: c.beds,
            medicalKits: c.medicalKits,
            volunteers: c.volunteers,
            ambulances: c.ambulances,
            riskLevel: c.riskLevel,
            urgency: c.urgency,
            saturation: Number(c.saturationPercentage) || 0,
            explanations: c.explanations || []
          }));

          setCamps(enrichedCamps);
        }
      } catch (aiErr) {
        console.warn("AI Analysis failed:", aiErr);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load analysis.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-sm font-mono tracking-widest text-blue-400">LOADING OPERATIONAL DATA...</p>
    </div>
  );

  if (error || !disaster) return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center gap-4">
      <Icons.XCircle size={48} className="text-red-500" />
      <p className="text-slate-400">{error || "Data Not Found"}</p>
      <button onClick={() => navigate(-1)} className="px-6 py-2 bg-slate-800 rounded hover:bg-slate-700 transition text-sm">Return to Dashboard</button>
    </div>
  );

  const getUrgencyTheme = (urgency) => {
    switch (urgency?.toUpperCase()) {
      case "IMMEDIATE": return { bg: "bg-red-950/20", border: "border-red-500/30", strip: "bg-red-600", text: "text-red-500", glow: "shadow-[0_0_30px_rgba(239,68,68,0.15)]", label: "Critical Response" };
      case "6 HOURS": return { bg: "bg-orange-950/20", border: "border-orange-500/30", strip: "bg-orange-600", text: "text-orange-500", glow: "shadow-[0_0_30px_rgba(249,115,22,0.15)]", label: "High Attention" };
      case "12 HOURS": return { bg: "bg-yellow-950/20", border: "border-yellow-500/30", strip: "bg-yellow-600", text: "text-yellow-500", glow: "shadow-[0_0_30px_rgba(234,179,8,0.15)]", label: "Watch Closely" };
      case "24 HOURS": return { bg: "bg-green-950/20", border: "border-green-500/30", strip: "bg-green-600", text: "text-green-500", glow: "shadow-[0_0_30px_rgba(34,197,94,0.15)]", label: "Stable" };
      default: return { bg: "bg-slate-900", border: "border-slate-800", strip: "bg-slate-500", text: "text-slate-500", glow: "", label: "Stable" };
    }
  };

  const priorityMapping = {
    "IMMEDIATE": 1,
    "6 HOURS": 2,
    "12 HOURS": 3,
    "24 HOURS": 4
  };

  // Aggregated Intelligence Metrics
  // Mission Status Logic
  const getMissionStatus = () => {
    if (camps.some(c => c.urgency?.toUpperCase() === "IMMEDIATE")) return { label: "Immediate Action Needed", color: "text-red-500" };
    if (camps.some(c => c.urgency?.toUpperCase() === "6 HOURS")) return { label: "Action Required Soon", color: "text-orange-500" };
    if (camps.some(c => c.urgency?.toUpperCase() === "12 HOURS")) return { label: "Monitor Closely", color: "text-yellow-500" };
    return { label: "Under Control", color: "text-green-500" };
  };
  const missionStatus = getMissionStatus();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8 font-sans">
      <style>{`
        @keyframes alert-pulse-red {
          0% { border-color: rgba(239, 68, 68, 0.2); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.1); }
          50% { border-color: rgba(239, 68, 68, 0.6); box-shadow: 0 0 15px 3px rgba(239, 68, 68, 0.2); }
          100% { border-color: rgba(239, 68, 68, 0.2); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.1); }
        }
        .animate-siren-red {
          animation: alert-pulse-red 1.5s infinite;
        }
      `}</style>
      {/* Premium Command Header */}
      <div className="relative mb-10 overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 p-8 shadow-xl">
        <div className="relative flex flex-col lg:flex-row justify-between items-start gap-6">
          <div className="max-w-4xl space-y-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-slate-500 hover:text-blue-400 transition-all text-xs font-bold tracking-widest mb-2 group"
            >
              <Icons.ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> BACK TO MISSIONS
            </button>

            <div className="space-y-1">
              <h1 className="text-4xl font-bold text-white uppercase tracking-tight leading-none">
                {disaster.type}
              </h1>
              <p className="text-lg font-medium text-slate-400 capitalize">
                {disaster.location.toLowerCase()}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <span className="text-slate-500 text-[10px] font-mono bg-slate-800/50 px-2 py-1 rounded border border-white/5 uppercase">
                ID: {disaster.id.slice(0, 8)}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap lg:flex-col items-start lg:items-end gap-3 mt-4 lg:mt-0">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">LIVE</span>
            </div>

            <div className="px-3 py-1.5 rounded-full bg-slate-800/50 border border-white/5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">COMMAND FEED</span>
            </div>

            <div className={`px-3 py-1.5 rounded-full border ${disaster.magnitude?.toLowerCase() === 'high' || disaster.magnitude?.toLowerCase() === 'critical'
              ? 'bg-orange-500/10 border-orange-500/30 text-orange-400'
              : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
              }`}>
              <span className="text-[10px] font-black uppercase tracking-widest">
                SEVERITY: {disaster.magnitude || 'NORMAL'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Operational Intelligence summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <SummaryTile
          label="OVERALL MISSION STATUS"
          value={missionStatus.label}
          colorClass={missionStatus.color}
          subtitle="Real-time operational health"
          icon={<Icons.Activity size={18} className={missionStatus.color} />}
          tooltip="Determined by the most critical survival window across all camps."
        />
        <SummaryTile
          label="TOTAL AFFECTED PEOPLE"
          value={camps.reduce((sum, c) => sum + (c.people || 0), 0)}
          colorClass="text-yellow-400"
          subtitle="People requiring support"
          icon={<Icons.Users size={18} className="text-blue-400" />}
          tooltip="Total population across all camps needing immediate assistance"
        />
        <SummaryTile
          label="TOTAL INJURED PEOPLE"
          value={camps.reduce((sum, c) => sum + (c.injured || 0), 0)}
          colorClass="text-yellow-400"
          subtitle="Patients requiring medical attention"
          icon={<Icons.Activity size={18} className="text-red-400" />}
          tooltip="Cumulative count of injured individuals across all mission zones"
        />
        <SummaryTile
          label="ACTIVE CAMPS"
          value={camps.length}
          colorClass="text-yellow-400"
          subtitle="Operational camps providing shelter"
          icon={<Icons.Tent size={18} className="text-emerald-400" />}
          tooltip="Number of functional relief facilities currently reporting data"
        />
      </div>

      {/* Camps Operational Data */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-slate-400 tracking-widest uppercase mb-4">Camp-wise Operational Data</h2>

        <div className="grid lg:grid-cols-2 2xl:grid-cols-3 gap-6">
          {camps.map((camp) => {
            const theme = getUrgencyTheme(camp.urgency);
            return (
              <div key={camp.id} className={`${theme.bg} ${theme.border} border rounded-xl overflow-hidden flex shadow-lg hover:brightness-110 transition-all duration-300 ${theme.glow}`}>
                {/* Urgency Strip */}
                <div className={`w-2.5 ${theme.strip}`} />

                <div className="flex-1 p-6 space-y-6">
                  {/* Section 1: Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-black text-white leading-tight mb-2 tracking-tight">{camp.name.toUpperCase()}</h3>
                      <div className="flex gap-6 text-slate-200 text-[11px] font-black tracking-widest uppercase">
                        <span className="flex items-center gap-2"><span className="text-slate-400">PEOPLE:</span> <span className="text-sky-400 text-sm">{camp.people}</span></span>
                        <span className="flex items-center gap-2"><span className="text-slate-400">INJURED:</span> <span className="text-rose-400 text-sm">{camp.injured}</span></span>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Window & Status */}
                  <div className="flex items-center gap-8 border-y border-white/10 py-5">
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-400 font-black uppercase mb-2 tracking-widest">Operational Survival Window</span>
                      <span className={`px-3 py-1.5 rounded text-xs font-black text-white ${theme.strip} shadow-lg shadow-black/20`}>
                        {camp.urgency?.toUpperCase() || "N/A"}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-400 font-black uppercase mb-2 tracking-widest">OPERATIONAL STATUS</span>
                      <span className={`text-[13px] font-black px-2.5 py-1 rounded bg-white/5 border border-white/5 ${theme.text}`}>
                        {theme.label.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Section 3: Resources Grid */}
                  <div className="grid grid-cols-3 gap-y-7 gap-x-4">
                    <ResourceItem label="FOOD PACKETS" value={camp.foodPackets} />
                    <ResourceItem label="WATER LITERS" value={camp.waterLiters} />
                    <ResourceItem label="BEDS" value={camp.beds} />
                    <ResourceItem label="MEDICAL KITS" value={camp.medicalKits} />
                    <ResourceItem label="VOLUNTEERS" value={camp.volunteers} />
                    <ResourceItem label="AMBULANCES" value={camp.ambulances} />
                  </div>

                  {/* Section 4: Operational Alerts */}
                  <div className="pt-2">
                    <span className="text-xs text-slate-400 font-black uppercase block mb-3 tracking-widest">COMMAND ALERTS</span>
                    <div className="space-y-3">
                      {camp.explanations.length > 0 ? (
                        camp.explanations.map((ex, i) => (
                          <div key={i} className="flex gap-4 items-start text-sm text-slate-100">
                            <span className={`${theme.text} mt-0 text-xl leading-none`}>•</span>
                            <span className="leading-relaxed font-bold">{ex}</span>
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500 italic">No automated alerts triggered</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ReliefCalculationStandards />
    </div>
  );
}

function SummaryTile({ label, value, subtitle, icon, colorClass = "text-white", status, tooltip }) {
  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative group hover:border-blue-500/20 transition-all shadow-2xl flex flex-col justify-between h-full group" title={tooltip}>
      <div className="flex justify-between items-start mb-4">
        <p className="text-[11px] text-slate-400 font-black tracking-[0.15em] uppercase leading-none">{label}</p>
        <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 group-hover:border-blue-500/20 transition-colors shadow-inner">
          {icon}
        </div>
      </div>
      <div>
        <div className="flex items-baseline gap-2 mb-2">
          <p className={`text-3xl font-black leading-none tracking-tighter ${colorClass} drop-shadow-sm`}>
            {value}
          </p>
          {status && (
            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${colorClass} bg-white/5 border border-white/5`}>
              {status}
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-500 font-bold tracking-tight italic opacity-70">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function ResourceItem({ label, value }) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] text-slate-400 font-black tracking-widest uppercase leading-none">{label}</p>
      <p className="text-2xl font-black text-emerald-400 leading-none drop-shadow-[0_0_10px_rgba(52,211,153,0.1)]">{value ?? 0}</p>
    </div>
  );
}