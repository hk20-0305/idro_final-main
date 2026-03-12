import { Activity, ArrowLeft, MapPin, ShieldAlert, TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { idroApi } from "../services/api";
import { calculateAllocations, formatETA } from "../utils/allocationEngine";

export default function DisasterDetails2() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [disaster, setDisaster] = useState(null);
    const [camps, setCamps] = useState([]);
    const [providers, setProviders] = useState([]);
    const [allocations, setAllocations] = useState([]);
    const [allocationStatuses, setAllocationStatuses] = useState({});
    const [missionLogs, setMissionLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (camps.length > 0 && providers.length > 0) {
            const newAllocations = calculateAllocations(camps, providers);
            console.log("Global Mission Strategy Calculated:", newAllocations);
            setAllocations(newAllocations);
        }
    }, [camps, providers]);

    useEffect(() => {
        if (allocations.length > 0) {
            const newLogs = [];
            allocations.forEach(alloc => {
                alloc.resourcesAssigned.forEach(res => {
                    const logMsg = `${res.count} ${res.label} assigned to ${alloc.campName} from ${alloc.providerName}`;
                    newLogs.push({
                        id: `${alloc.id}-${res.label}`,
                        text: logMsg,
                        time: new Date().toLocaleTimeString()
                    });
                });
            });

            setMissionLogs(prev => {
                const existingTexts = new Set(prev.map(l => l.text));
                const uniqueNewLogs = newLogs.filter(l => !existingTexts.has(l.text));
                if (uniqueNewLogs.length === 0) return prev;
                return [...uniqueNewLogs, ...prev].slice(0, 50);
            });
        }
    }, [allocations]);

    useEffect(() => {
        const fetchMissionData = async () => {
            try {
                const alertsRes = await idroApi.getAlerts();
                const found = alertsRes.data.find(a => String(a.id) === id);
                setDisaster(found);

                const impactRes = await idroApi.getImpactAnalysis(id);
                if (impactRes.data && impactRes.data.campAnalysisList) {
                    setCamps(impactRes.data.campAnalysisList);
                }

                let ngoList = [];
                let agencyList = [];

                try {
                    const ngosRes = await idroApi.getAllNGOs(id);
                    if (Array.isArray(ngosRes.data)) {
                        ngoList = ngosRes.data.map(ngo => ({
                            id: ngo.id || ngo.ngoId,
                            name: ngo.ngoName,
                            food: ngo.reliefSupplies?.foodPackets?.quantity || 0,
                            water: ngo.reliefSupplies?.drinkingWater?.quantity || 0,
                            beds: ngo.shelterEssentials?.beds?.quantity || 0,
                            medKits: ngo.medicalSupport?.firstAidKits?.quantity || 0,
                            ambulances: ngo.medicalSupport?.ambulances?.quantity || 0,
                            status: ngo.availabilityStatus || 'UNKNOWN',
                            rawResponseTime: ngo.responseTime,
                            eta: formatETA(ngo.responseTime)
                        }));
                    }

                } catch (e) {
                    console.error("NGO fetch failed", e);
                }

                try {
                    const agenciesRes = await idroApi.getAllAgencies(id);
                    if (Array.isArray(agenciesRes.data)) {
                        agencyList = agenciesRes.data.map(agency => {
                            const findQty = (resourcesMap, search) => {
                                if (!resourcesMap) return 0;
                                for (const list of Object.values(resourcesMap)) {
                                    if (Array.isArray(list)) {
                                        const found = list.find(i => i.name?.toLowerCase().includes(search.toLowerCase()));
                                        if (found) return found.quantity;
                                    }
                                }
                                return 0;
                            };

                            return {
                                id: agency.id || agency.agencyId,
                                name: agency.agencyName,
                                food: findQty(agency.resources, 'Food') || 0,
                                water: findQty(agency.resources, 'Water') || 0,
                                beds: findQty(agency.resources, 'Bed') || findQty(agency.resources, 'Tents') || 0,
                                medKits: findQty(agency.resources, 'First Aid') || findQty(agency.resources, 'Kit') || 0,
                                ambulances: findQty(agency.resources, 'Ambulance') || 0,
                                status: agency.availabilityStatus || 'UNKNOWN',
                                rawResponseTime: agency.responseTime,
                                eta: formatETA(agency.responseTime)
                            };
                        });
                    }
                } catch (e) {
                    console.error("Agency fetch failed", e);
                }

                const combinedList = [...ngoList, ...agencyList];
                const activeProviders = combinedList.filter(p =>
                    p.food > 0 || p.water > 0 || p.beds > 0 || p.medKits > 0 || p.ambulances > 0
                );

                setProviders(activeProviders);
            } catch (err) {
                console.error("Failed to fetch mission data", err);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchMissionData();
    }, [id]);

    const toggleAllocationStatus = async (allocId) => {
        setAllocationStatuses(prev => {
            const current = prev[allocId] || 'ASSIGNED';
            let nextStatus = 'ASSIGNED';
            if (current === 'ASSIGNED') nextStatus = 'DISPATCHED';
            else if (current === 'DISPATCHED') nextStatus = 'DELIVERED';

            const updated = { ...prev, [allocId]: nextStatus };

            const alloc = allocations.find(a => a.id === allocId);
            if (alloc) {
                const actionData = {
                    description: `${nextStatus}: ${alloc.providerName} to ${alloc.campName}`,
                    status: nextStatus,
                    role: "SYSTEM",
                    targetZone: alloc.campName,
                    resourceType: alloc.resourcesAssigned.map(r => r.label).join(", "),
                    quantity: alloc.resourcesAssigned.reduce((sum, r) => sum + r.count, 0)
                };
                idroApi.createAction(id, actionData).catch(err => console.error("Failed to sync status", err));
            }

            return updated;
        });
    };

    const getWindowColor = (urgency) => {
        switch (urgency) {
            case 'IMMEDIATE': return 'text-red-400 border-red-500/20 bg-red-500/10';
            case 'SIX_HOURS': return 'text-orange-400 border-orange-500/20 bg-orange-500/10';
            case 'TWELVE_HOURS': return 'text-yellow-400 border-yellow-500/20 bg-yellow-500/10';
            case 'TWENTY_FOUR_HOURS': return 'text-blue-400 border-blue-500/20 bg-blue-500/10';
            default: return 'text-slate-400 border-white/10 bg-white/5';
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-black text-emerald-400 flex flex-col items-center justify-center font-mono tracking-[0.3em] uppercase">
            <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4" />
            Initializing Operational Feed...
        </div>
    );

    if (!disaster) return <div className="min-h-screen bg-black text-white p-10">DISASTER DATA NOT FOUND.</div>;

    const getSeverityDetails = (severity) => {
        const s = severity?.toUpperCase();
        if (s === "HIGH" || s === "CRITICAL" || s === "IMMEDIATE") return { label: "CRITICAL ALERT", color: "text-red-400", bg: "bg-red-950/40", border: "border-red-500/80", glow: "shadow-[0_0_20px_rgba(239,68,68,0.3)]", strip: "bg-red-500" };
        if (s === "MODERATE" || s === "ORANGE" || s === "6 HOURS") return { label: "HIGH PRIORITY", color: "text-orange-400", bg: "bg-orange-950/40", border: "border-orange-500/80", glow: "shadow-[0_0_20px_rgba(249,115,22,0.3)]", strip: "bg-orange-500" };
        if (s === "WATCH" || s === "12 HOURS") return { label: "WATCH MONITORING", color: "text-yellow-400", bg: "bg-yellow-950/40", border: "border-yellow-500/80", glow: "shadow-[0_0_20px_rgba(234,179,8,0.3)]", strip: "bg-yellow-500" };
        return { label: "STABLE", color: "text-green-400", bg: "bg-green-950/40", border: "border-green-500/80", glow: "shadow-[0_0_20px_rgba(34,197,94,0.3)]", strip: "bg-green-500" };
    };

    const sev = getSeverityDetails(disaster.magnitude);

    return (
        <div className="min-h-screen bg-black text-slate-300 p-6 md:p-10 font-sans selection:bg-emerald-500/30">

            <div className="max-w-[1600px] mx-auto mb-10 overflow-hidden animate-in fade-in zoom-in duration-500 px-4 md:px-8">
                <div className={`relative overflow-hidden bg-slate-900/40 backdrop-blur-3xl border rounded-2xl p-4 md:p-5 transition-all duration-1000 ${sev.color.replace('text', 'border')}/30 shadow-lg`}>
                    <div className="absolute inset-0 pointer-events-none opacity-20">
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/[0.03] to-transparent" />
                        <div className="absolute top-0 left-10 w-[1px] h-full bg-white/[0.05]" />
                        <div className="absolute top-0 right-10 w-[1px] h-full bg-white/[0.05]" />
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
                    </div>

                    <div className="relative z-10 flex flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className={`p-2 bg-black/60 rounded-xl border ${sev.color.replace('text', 'border')}/30 flex-shrink-0`}>
                                <TriangleAlert size={18} className={sev.color} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[9px] font-black tracking-[0.3em] text-slate-500 uppercase flex items-center gap-1.5 mb-0.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                                    MISSION_COMMAND
                                </p>
                                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase leading-none truncate">
                                    {disaster.type || 'GENERAL ALERT'}
                                </h2>
                                <div className="flex items-center gap-1.5 mt-1.5 text-slate-400">
                                    <MapPin size={12} className="text-emerald-400 flex-shrink-0" />
                                    <span className="text-xs font-semibold truncate">
                                        {disaster.location || 'GLOBAL_ZONE_SYNC'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex-shrink-0 flex items-center gap-3">
                            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/50 rounded-full" />
                            <div className="flex items-center gap-2 bg-black/50 border border-white/10 rounded-xl px-4 py-2">
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className={`w-1 h-3 rounded-full ${i <= 3 ? sev.color.replace('text', 'bg') : 'bg-white/10'}`} />
                                    ))}
                                </div>
                                <span className={`text-sm font-black uppercase tracking-tight ${sev.color}`}>{sev.label}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto space-y-12 px-4 md:px-8">

                <section className="animate-in fade-in slide-in-from-bottom-5 duration-700 delay-200">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-1.5 h-10 bg-blue-500 rounded-full" />
                        <h3 className="text-2xl font-black text-white uppercase tracking-[0.2em]">Camp Requirement Matrix</h3>
                    </div>

                    {camps.length === 0 ? (
                        <div className="border-2 border-dashed border-white/5 bg-slate-900/20 rounded-3xl p-16 text-center shadow-2xl overflow-hidden backdrop-blur-sm">
                            <div className="p-4 bg-slate-950/50 rounded-full inline-flex mb-6 border border-white/5">
                                <Activity size={48} className="text-slate-600 animate-pulse" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-400 uppercase tracking-widest mb-2">Awaiting Impact Data</h3>
                            <p className="text-slate-400 font-medium text-lg italic">AI is currently analyzing sectoral needs and requirements...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {camps.map((camp) => {
                                const cSev = getSeverityDetails(camp.urgency);
                                return (
                                    <div key={camp.campId} className={`relative flex flex-col bg-slate-900/40 border-2 border-l-[6px] rounded-2xl overflow-hidden backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:bg-slate-900/60 shadow-2xl ${cSev.border} ${cSev.strip.replace('bg-', 'border-l-')}`}>
                                        <div className="p-8 border-b border-white/5">
                                            <h4 className="text-2xl font-black text-white tracking-widest uppercase mb-2">{camp.campName}</h4>
                                            <span className={`text-[11px] font-black px-3 py-1 rounded border shadow-sm ${cSev.color} ${cSev.border} bg-white/5`}>
                                                WINDOW: {camp.urgency?.toUpperCase()}
                                            </span>
                                        </div>

                                        <div className="p-8 space-y-6">
                                            <MatrixItem label="Food Packets" value={camp.foodPackets} icon="🍱" />
                                            <MatrixItem label="Water Liters" value={camp.waterLiters} icon="💧" />
                                            <MatrixItem label="Emergency Beds" value={camp.beds} icon="🛏️" />
                                            <MatrixItem label="Medical Kits" value={camp.medicalKits} icon="💊" />
                                            <MatrixItem label="Ambulance Support" value={camp.ambulances} icon="🚑" />
                                        </div>

                                        <div className="mt-auto p-6 bg-black/20 flex justify-between items-center border-t border-white/10">
                                            <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Operational Status</span>
                                            <div className="flex items-center gap-3">
                                                <span className={`text-[12px] font-black uppercase tracking-tight ${cSev.color}`}>
                                                    {camp.riskLevel?.toUpperCase()}
                                                </span>
                                                <div className={`w-2 h-2 rounded-full ${cSev.strip} shadow-[0_0_10px_currentColor]`} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                <section className="animate-in fade-in slide-in-from-bottom-5 duration-700 delay-400">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-1.5 h-10 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                        <h3 className="text-2xl font-black text-white uppercase tracking-[0.2em]">Provider Resource Pool</h3>
                    </div>

                    {providers.length > 0 ? (
                        <div className="relative rounded-3xl bg-gradient-to-br from-teal-900/50 via-slate-900/70 to-blue-950/70 border border-white/10 shadow-2xl overflow-hidden backdrop-blur-xl">
                            <div className="relative overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-white/5 border-b border-white/20">
                                            <th className="p-6 text-[11px] font-black text-slate-500 uppercase tracking-widest">Resource Provider</th>
                                            <th className="p-6 text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">Food</th>
                                            <th className="p-6 text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">Water</th>
                                            <th className="p-6 text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">Beds</th>
                                            <th className="p-6 text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">Med Kits</th>
                                            <th className="p-6 text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">Ambulances</th>
                                            <th className="p-6 text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">Status</th>
                                            <th className="p-6 text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">ETA</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {providers.map((provider) => (
                                            <tr key={provider.id} className="border-b border-white/10 hover:bg-white/5 transition-all group">
                                                <td className="p-6">
                                                    <div className="flex flex-col">
                                                        <span className="text-lg font-black text-white group-hover:text-emerald-400 transition-colors uppercase tracking-tight">
                                                            {provider.name}
                                                        </span>
                                                        <span className="text-[9px] font-black text-slate-500 tracking-[0.2em] mt-1">
                                                            IDRO VERIFIED ASSET
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-6 text-center">
                                                    <span className="text-xl font-black text-slate-100 tabular-nums">{provider.food}</span>
                                                </td>
                                                <td className="p-6 text-center">
                                                    <span className="text-xl font-black text-slate-100 tabular-nums">{provider.water}</span>
                                                </td>
                                                <td className="p-6 text-center">
                                                    <span className="text-xl font-black text-slate-100 tabular-nums">{provider.beds}</span>
                                                </td>
                                                <td className="p-6 text-center">
                                                    <span className="text-xl font-black text-slate-100 tabular-nums">{provider.medKits}</span>
                                                </td>
                                                <td className="p-6 text-center">
                                                    <span className="text-xl font-black text-slate-100 tabular-nums">{provider.ambulances}</span>
                                                </td>
                                                <td className="p-6 text-center">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className={`text-[10px] font-black uppercase ${provider.status === 'AVAILABLE' ? 'text-emerald-400' :
                                                            provider.status === 'LIMITED' ? 'text-yellow-400' : 'text-red-400'
                                                            }`}>
                                                            {provider.status}
                                                        </span>
                                                        <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${provider.status === 'AVAILABLE' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' :
                                                            provider.status === 'LIMITED' ? 'bg-yellow-500' : 'bg-red-500'
                                                            }`} />
                                                    </div>
                                                </td>
                                                <td className="p-6 text-center">
                                                    <div className="inline-flex flex-col items-center p-2 bg-black/40 rounded-lg border border-white/20 min-w-[50px]">
                                                        <span className="text-[9px] font-black text-slate-500 uppercase mb-0.5">Deployment</span>
                                                        <span className="text-sm font-black text-blue-400">{provider.eta}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="border border-white/5 bg-slate-900/20 rounded-3xl p-12 text-center backdrop-blur-sm">
                            <Activity size={32} className="text-slate-600 animate-pulse mx-auto mb-4" />
                            <h3 className="text-xl font-black text-slate-500 uppercase tracking-widest">Awaiting Asset Deployment</h3>
                            <p className="text-slate-500 text-sm mt-2 font-mono">ENCRYPTED_FEED_PENDING</p>
                        </div>
                    )}
                </section>

                <section className="animate-in fade-in slide-in-from-bottom-5 duration-700 delay-600 pb-24">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-1.5 h-8 bg-blue-500 rounded-full" />
                        <h3 className="text-xl font-bold text-white uppercase tracking-widest">Auto Allocation Panel</h3>
                    </div>

                    {allocations.length > 0 ? (
                        <div className="grid gap-6">
                            {allocations.map((alloc) => {

                                return (
                                    <div key={alloc.id} className="group relative overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-indigo-950/70 via-slate-900/80 to-blue-950/70 border-2 border-white/10 backdrop-blur-xl transition-all duration-500 hover:border-indigo-500/40 hover:from-indigo-900/60 hover:to-blue-900/60">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-3xl -mr-12 -mt-12 opacity-0 group-hover:opacity-100 transition-opacity" />

                                        <div className="relative z-10 flex flex-col xl:flex-row items-stretch">
                                            <div className="p-5 xl:w-1/4 border-b xl:border-b-0 xl:border-r border-white/[0.05] relative">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/30" />
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Camp Name</span>
                                                <div className="space-y-2">
                                                    <span className="text-lg font-black text-white tracking-tighter uppercase block leading-tight">{alloc.campName}</span>
                                                </div>
                                            </div>

                                            <div className="p-5 xl:w-1/4 border-b xl:border-b-0 xl:border-r border-white/[0.05] relative bg-white/[0.01]">
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">NGO Name</span>
                                                <div className="space-y-2">
                                                    <span className="text-md font-black text-emerald-400 uppercase tracking-tight block leading-tight">{alloc.providerName}</span>
                                                </div>
                                            </div>

                                            <div className="p-5 flex-1 relative bg-white/[0.01]">
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Resources Provided</span>
                                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                                                    {alloc.resourcesAssigned?.map((res, idx) => (
                                                        <div key={idx} className="bg-black/40 border border-white/10 rounded-lg p-2.5 flex flex-col group/res hover:border-blue-500/40 transition-colors">
                                                            <span className="text-[7px] font-bold text-slate-500 uppercase tracking-wider mb-0.5 group-hover/res:text-blue-400/60 transition-colors">{res.label}</span>
                                                            <span className="text-base font-black text-white tabular-nums leading-none">
                                                                {res.count}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="p-5 xl:w-52 bg-black/20 flex flex-col justify-center relative border-t xl:border-t-0 xl:border-l border-white/[0.05]">
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 xl:absolute xl:top-5">Estimate time of arrival</span>
                                                <div className="flex flex-col mt-4">
                                                    <span className="text-xl font-black text-blue-400 tracking-tighter uppercase leading-none">{alloc.eta}</span>
                                                </div>
                                            </div>

                                            <div
                                                className="p-5 xl:w-48 bg-black/40 flex flex-col justify-center relative border-t xl:border-t-0 xl:border-l border-white/[0.05] cursor-pointer hover:bg-black/60 transition-colors"
                                                onClick={() => toggleAllocationStatus(alloc.id)}
                                            >
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 xl:absolute xl:top-5">Allocation status</span>
                                                <div className="flex items-center gap-2 mt-4">
                                                    <div className="relative">
                                                        <div className={`w-2 h-2 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.4)] ${allocationStatuses[alloc.id] === 'DELIVERED' ? 'bg-green-500' : allocationStatuses[alloc.id] === 'DISPATCHED' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                                                        {allocationStatuses[alloc.id] !== 'DELIVERED' && (
                                                            <div className={`absolute inset-0 w-2 h-2 rounded-full animate-ping opacity-40 ${allocationStatuses[alloc.id] === 'DISPATCHED' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                                                        )}
                                                    </div>
                                                    <span className={`text-[9px] font-black uppercase tracking-widest ${allocationStatuses[alloc.id] === 'DELIVERED' ? 'text-green-500' : allocationStatuses[alloc.id] === 'DISPATCHED' ? 'text-blue-500' : 'text-emerald-400'}`}>
                                                        {allocationStatuses[alloc.id] || 'Assigned'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="border-2 border-white/10 bg-slate-900/20 rounded-3xl p-16 text-center border-dashed">
                            <ShieldAlert size={32} className="text-slate-600 opacity-20 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-slate-500 uppercase tracking-[0.2em]">Awaiting Logistics Sync</h3>
                            <p className="text-slate-600 text-[10px] mt-2 font-mono uppercase tracking-widest">Scanning_Regional_Nodes</p>
                        </div>
                    )}
                </section>

                <section className="animate-in fade-in slide-in-from-bottom-5 duration-700 delay-700 pb-24">
                    <div className="relative overflow-hidden bg-slate-900/40 border-2 border-white/20 rounded-3xl backdrop-blur-3xl shadow-2xl">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 border-b border-white/20 bg-black/40 relative">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                                    <Activity size={24} className="text-emerald-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Real-Time Allocation Logs</h3>
                                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-0.5">Live updates from mission control</p>
                                </div>
                            </div>
                            <div className="mt-4 md:mt-0 px-4 py-2 bg-white/[0.02] rounded-xl border border-white/10">
                                <span className="text-xs font-black text-blue-400 tabular-nums">System Time: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        </div>

                        <div className="relative max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 p-8 bg-black/20">
                            {missionLogs.length > 0 ? (
                                <div className="space-y-4">
                                    {missionLogs.map((log) => (
                                        <div key={log.id} className="flex items-center gap-6 group p-4 rounded-2xl border border-white/10 bg-white/[0.01] hover:bg-white/[0.03] transition-all">
                                            <div className="min-w-[100px] shrink-0">
                                                <span className="text-blue-400 text-sm font-black tabular-nums tracking-tight">
                                                    {log.time}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-4 flex-1">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)]" />
                                                <span className="text-white text-lg font-bold leading-tight tracking-tight">
                                                    {log.text}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="h-4" />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-24 opacity-50">
                                    <div className="w-16 h-16 rounded-full border-4 border-slate-700 border-t-emerald-500 animate-spin mb-8" />
                                    <span className="text-slate-400 text-lg font-black uppercase tracking-widest">
                                        INITIALIZING FEED...
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="p-4 bg-black/40 border-t border-white/20 text-center">
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">IDRO MISSION CONTROL CENTER</span>
                        </div>
                    </div>
                </section>

                <button
                    onClick={() => navigate("/mission-control")}
                    className="flex items-center gap-2 text-slate-500 hover:text-white font-black uppercase tracking-widest text-[10px] transition-all group"
                >
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    TERMINATE_SESSION_TO_LIST
                </button>
            </div>
        </div>
    );
}

function MatrixItem({ label, value, icon }) {
    return (
        <div className="flex justify-between items-center group">
            <div className="flex items-center gap-4">
                <span className="text-2xl opacity-70 group-hover:opacity-100 transition-opacity grayscale group-hover:grayscale-0">{icon}</span>
                <span className="text-[12px] font-black text-slate-400 uppercase tracking-[0.1em]">{label}</span>
            </div>
            <span className="text-2xl font-black text-white pr-2 tabular-nums group-hover:text-emerald-400 transition-colors">
                {value ?? 0}
            </span>
        </div>
    );
}


