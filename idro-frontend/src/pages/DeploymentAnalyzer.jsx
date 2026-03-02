import { Activity, MapPin, AlertTriangle, Truck, Clock, Package, Users, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { idroApi } from "../services/api";
import { calculateAllocations } from "../utils/allocationEngine";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
    iconUrl: require("leaflet/dist/images/marker-icon.png"),
    shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// ── CSS for pulsing animation (injected once) ─────────────────────────────────
if (typeof document !== "undefined" && !document.getElementById("pulse-anim")) {
    const s = document.createElement("style");
    s.id = "pulse-anim";
    s.textContent = `
        @keyframes idroRipple {
            0%   { transform: scale(1);   opacity: 0.6; }
            100% { transform: scale(3.2); opacity: 0; }
        }
        .pulsing-ring {
            position: absolute; inset: 0; border-radius: 50%;
            border: 2px solid #22c55e;
            animation: idroRipple 1.6s ease-out infinite;
        }
        .pulsing-ring-2 {
            animation-delay: 0.6s;
        }
    `;
    document.head.appendChild(s);
}

// ── Pulsing green NGO Base icon ───────────────────────────────────────────────
const ngoIcon = L.divIcon({
    className: "",
    html: `
        <div style="position:relative;width:22px;height:22px;">
          <div class="pulsing-ring"></div>
          <div class="pulsing-ring pulsing-ring-2"></div>
          <div style="position:absolute;inset:4px;border-radius:50%;background:#22c55e;border:2px solid #0f172a;box-shadow:0 0 12px #22c55eaa;"></div>
        </div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
});

// ── Red camp target icon ──────────────────────────────────────────────────────
const campIcon = L.divIcon({
    className: "",
    html: `
        <div style="display:flex;flex-direction:column;align-items:center;gap:3px;">
          <div style="width:18px;height:18px;border-radius:50%;background:#ef4444;border:2.5px solid #0f172a;box-shadow:0 0 12px #ef4444aa;"></div>
          <span style="background:rgba(15,23,42,0.9);color:#ef4444;font-size:8px;font-weight:800;padding:1px 5px;border-radius:3px;border:1px solid #ef444455;white-space:nowrap;">Target Camp</span>
        </div>`,
    iconSize: [64, 30],
    iconAnchor: [32, 9],
});

// ── Orange NGO label icon ─────────────────────────────────────────────────────
const ngoLabelIcon = L.divIcon({
    className: "",
    html: `
        <div style="display:flex;flex-direction:column;align-items:center;gap:3px;">
          <div style="width:18px;height:18px;border-radius:50%;background:#22c55e;border:2.5px solid #0f172a;box-shadow:0 0 12px #22c55eaa;"></div>
          <span style="background:rgba(15,23,42,0.9);color:#22c55e;font-size:8px;font-weight:800;padding:1px 5px;border-radius:3px;border:1px solid #22c55e55;white-space:nowrap;">NGO Base</span>
        </div>`,
    iconSize: [60, 30],
    iconAnchor: [30, 9],
});

// ── Animated truck icon ───────────────────────────────────────────────────────
const truckMarkerIcon = L.divIcon({
    className: "",
    html: `<div style="background:#1e40af;border:2px solid #93c5fd;border-radius:6px;width:26px;height:20px;display:flex;align-items:center;justify-content:center;box-shadow:0 0 12px #3b82f6aa;font-size:13px;">🚛</div>`,
    iconSize: [26, 20],
    iconAnchor: [13, 10],
});

// ── City coordinate lookup ────────────────────────────────────────────────────
const CITY_MAP = {
    mumbai: [19.076, 72.8777], delhi: [28.7041, 77.1025], jaipur: [26.9124, 75.7873],
    bangalore: [12.9716, 77.5946], chennai: [13.0827, 80.2707], kochi: [9.9312, 76.2673],
    thiruvananthapuram: [8.5241, 76.9366], kerala: [10.8505, 76.2711],
    hyderabad: [17.385, 78.4867], pune: [18.5204, 73.8567],
    ahmedabad: [23.0225, 72.5714], kolkata: [22.5726, 88.3639],
    lucknow: [26.8467, 80.9462], bhopal: [23.2599, 77.4126],
    patna: [25.5941, 85.1376], bhubaneswar: [20.2961, 85.8245],
};

const coordsFromLocation = (locStr = "") => {
    const loc = locStr.toLowerCase();
    for (const city in CITY_MAP) {
        if (loc.includes(city)) return CITY_MAP[city];
    }
    return null;
};

// ── Deterministic fallback coords from string seed ────────────────────────────
const seedCoords = (seed = "", offsetFactor = 0) => {
    const h = [...(seed + "x")].reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 0);
    const absH = Math.abs(h);
    const lat = 16 + (absH % 120) / 7;           // roughly 16–33°N
    const lng = 72 + (absH % 250) / 11;          // roughly 72–95°E
    return [lat + offsetFactor * 2.5, lng - offsetFactor * 1.8];
};

// ── URGENCY_META ──────────────────────────────────────────────────────────────
const URGENCY_META = {
    IMMEDIATE: { speed: 45, totalKm: 25 }, QUICK: { speed: 35, totalKm: 50 },
    SIX_HOURS: { speed: 25, totalKm: 80 }, STAGED: { speed: 22, totalKm: 100 },
    TWELVE_HOURS: { speed: 18, totalKm: 150 }, EXTENDED: { speed: 15, totalKm: 200 },
    TWENTY_FOUR_HOURS: { speed: 12, totalKm: 280 },
};

const CARGO_ICONS = { Food: "🍱", Water: "💧", Beds: "🛏", Medkits: "🧰", Ambulances: "🚑" };

// ── DotProgress ───────────────────────────────────────────────────────────────
function DotProgress({ progress }) {
    const total = 8;
    const filled = Math.round((progress / 100) * total);
    return (
        <div className="flex items-center gap-1.5 my-2">
            {Array.from({ length: total }).map((_, i) => (
                <div key={i} className={`rounded-full transition-all duration-500 ${i < filled ? "w-4 h-2 bg-green-400" : "w-2 h-2 bg-slate-600"}`} />
            ))}
        </div>
    );
}

// ── FitBounds: auto-zooms map to show both markers ───────────────────────────
function FitBounds({ origin, dest }) {
    const map = useMap();
    useEffect(() => {
        if (origin && dest) {
            map.fitBounds(L.latLngBounds([L.latLng(origin), L.latLng(dest)]), { padding: [40, 40], maxZoom: 10 });
        }
    }, [map]);   // eslint-disable-line
    return null;
}

// ── Animated truck — status-aware ────────────────────────────────────────────
// Preparing  → static at origin (t = 0)
// En Route   → smooth animation starting at dep.progress, speed ∝ avgSpeed
// Delivered  → static at destination (t = 1)
function AnimatedTruck({ origin, dest, status, startProgress, avgSpeed }) {
    const initT =
        status === "Delivered" ? 1
            : status === "Preparing" ? 0
                : Math.min(startProgress / 100, 0.99);  // En Route: start from actual progress

    const [t, setT] = useState(initT);

    useEffect(() => {
        if (status !== "En Route") return;  // only animate when in transit

        // Derive step: normalize avgSpeed (12–45 km/h) → tick delta (0.0008–0.003)
        const step = Math.max(0.0008, Math.min(0.003, (avgSpeed / 45) * 0.003));

        const id = setInterval(() => {
            setT((prev) => {
                if (prev >= 0.98) { clearInterval(id); return 0.98; } // stop just before dest
                return prev + step;
            });
        }, 60);  // 60 ms tick ≈ 16 fps, smooth without being heavy
        return () => clearInterval(id);
    }, [status, avgSpeed]);  // eslint-disable-line

    const lat = origin[0] + t * (dest[0] - origin[0]);
    const lng = origin[1] + t * (dest[1] - origin[1]);

    return <Marker position={[lat, lng]} icon={truckMarkerIcon} />;
}

// ── RouteMap ──────────────────────────────────────────────────────────────────
function RouteMap({ originLatLng, destinationLatLng, status, progress, avgSpeed }) {
    const origin = originLatLng;
    const dest = destinationLatLng;
    const lineColor =
        status === "Delivered" ? "#22c55e"
            : status === "En Route" ? "#3b82f6"
                : "#eab308";           // Preparing → amber dashed
    const center = [(origin[0] + dest[0]) / 2, (origin[1] + dest[1]) / 2];

    return (
        <div className="w-full h-full rounded-xl overflow-hidden relative z-0" style={{ minHeight: "360px" }}>
            <MapContainer center={center} zoom={7} className="w-full h-full" style={{ minHeight: "360px" }} zoomControl scrollWheelZoom={false}>
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                <FitBounds origin={origin} dest={dest} />
                {/* Route polyline */}
                <Polyline
                    positions={[origin, dest]}
                    color={lineColor}
                    weight={4}
                    dashArray={status === "Preparing" ? "8,12" : undefined}
                    opacity={0.9}
                />
                {/* NGO Base — pulsing green with label */}
                <Marker position={origin} icon={ngoLabelIcon}>
                    <Popup>Provider / NGO Base</Popup>
                </Marker>
                {/* Target Camp — red with label */}
                <Marker position={dest} icon={campIcon}>
                    <Popup>Camp Destination</Popup>
                </Marker>
                {/* Truck — always visible, behavior depends on status */}
                <AnimatedTruck
                    origin={origin}
                    dest={dest}
                    status={status}
                    startProgress={progress}
                    avgSpeed={avgSpeed}
                />
            </MapContainer>
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function DeploymentAnalyzer() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [disaster, setDisaster] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deployments, setDeployments] = useState([]);
    const [expandedIds, setExpandedIds] = useState(new Set());

    const toggleExpand = (depId) => {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            next.has(depId) ? next.delete(depId) : next.add(depId);
            return next;
        });
    };

    useEffect(() => {
        const fetchMissionData = async () => {
            try {
                const alertsRes = await idroApi.getAlerts();
                const found = alertsRes.data.find((d) => String(d.id) === String(id) || String(d._id) === String(id));
                if (found) setDisaster(found);

                const impactRes = await idroApi.getImpactAnalysis(id);
                const campList = impactRes.data?.campAnalysisList || [];

                let providerList = [];
                try {
                    const ngosRes = await idroApi.getAllNGOs(id);
                    if (Array.isArray(ngosRes.data)) {
                        providerList = [...providerList, ...ngosRes.data.map((ngo) => ({
                            id: ngo.id || ngo.ngoId, name: ngo.ngoName,
                            location: ngo.city || ngo.operatingRegion,
                            food: ngo.reliefSupplies?.foodPackets?.quantity || 0,
                            water: ngo.reliefSupplies?.drinkingWater?.quantity || 0,
                            beds: ngo.shelterEssentials?.beds?.quantity || 0,
                            medKits: ngo.medicalSupport?.firstAidKits?.quantity || 0,
                            ambulances: ngo.medicalSupport?.ambulances?.quantity || 0,
                            rawResponseTime: ngo.responseTime,
                            status: ngo.availabilityStatus || "AVAILABLE",
                        }))];
                    }
                    const agenciesRes = await idroApi.getAllAgencies(id);
                    if (Array.isArray(agenciesRes.data)) {
                        providerList = [...providerList, ...agenciesRes.data.map((agency) => {
                            const findQty = (map, search) => {
                                if (!map) return 0;
                                for (const list of Object.values(map)) {
                                    if (Array.isArray(list)) {
                                        const f = list.find((i) => i.name?.toLowerCase().includes(search.toLowerCase()));
                                        if (f) return f.quantity;
                                    }
                                }
                                return 0;
                            };
                            return {
                                id: agency.id || agency.agencyId, name: agency.agencyName,
                                location: agency.location || agency.operatingRegion,
                                food: findQty(agency.resources, "Food"),
                                water: findQty(agency.resources, "Water"),
                                beds: findQty(agency.resources, "Bed") || findQty(agency.resources, "Tents"),
                                medKits: findQty(agency.resources, "First Aid") || findQty(agency.resources, "Kit"),
                                ambulances: findQty(agency.resources, "Ambulance"),
                                rawResponseTime: agency.responseTime,
                                status: agency.availabilityStatus || "AVAILABLE",
                            };
                        })];
                    }
                } catch (e) { console.error("Provider fetch failed", e); }

                let actionStatuses = {};
                try {
                    const actionsRes = await idroApi.getActions();
                    actionsRes.data.filter((a) => String(a.alertId) === String(id)).forEach((a) => {
                        if (a.targetZone) actionStatuses[`${a.targetZone}-${a.status}`] = a.status;
                    });
                } catch (e) { console.error("Action fetch failed", e); }

                const baseAllocations = calculateAllocations(campList, providerList);
                const enriched = baseAllocations.map((alloc, idx) => {
                    const matchingKey = Object.keys(actionStatuses).find((k) => k.startsWith(alloc.campName));
                    const currentStatus = actionStatuses[matchingKey] || "ASSIGNED";
                    let progress = 15, color = "text-yellow-400 bg-yellow-900/30 border-yellow-500", statusLabel = "Preparing";
                    if (currentStatus === "DISPATCHED") { progress = 65; color = "text-blue-400 bg-blue-900/30 border-blue-500"; statusLabel = "En Route"; }
                    else if (currentStatus === "DELIVERED") { progress = 100; color = "text-green-400 bg-green-900/30 border-green-500"; statusLabel = "Delivered"; }

                    const urgKey = (alloc.urgency || "").toUpperCase().replace(/ /g, "_");
                    const meta = URGENCY_META[urgKey] || { speed: 20, totalKm: 100 };

                    // ── Resolve coordinates — real → city lookup → seeded fallback ──
                    const realOrigin = coordsFromLocation(alloc.providerLocation);
                    const realDest = alloc.campCoords || coordsFromLocation(alloc.campName);
                    const seed = (alloc.id || String(idx)) + (id || "");
                    const originLatLng = realOrigin || seedCoords(seed, 0);
                    const destinationLatLng = realDest || seedCoords(seed, 1);

                    return {
                        ...alloc,
                        status: statusLabel, rawStatus: currentStatus, progress, color,
                        avgSpeed: meta.speed,
                        distRemainingKm: Math.round((1 - progress / 100) * meta.totalKm),
                        originLatLng,
                        destinationLatLng,
                    };
                });

                setDeployments(enriched);
            } catch (err) {
                console.error("Failed to load dashboard data", err);
            } finally {
                setLoading(false);
            }
        };

        fetchMissionData();
        const interval = setInterval(fetchMissionData, 15000);
        return () => clearInterval(interval);
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-green-400">
                <Activity className="animate-pulse mr-3" /> INITIALIZING TACTICAL VIEW...
            </div>
        );
    }

    if (!disaster) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center text-red-500 gap-4">
                <AlertTriangle size={48} />
                <h2 className="text-xl font-mono uppercase">Disaster record not found</h2>
                <button onClick={() => navigate("/deployment-status")} className="text-blue-400 hover:text-blue-300 underline font-mono text-sm">
                    Return to Status Board
                </button>
            </div>
        );
    }

    const glowClass = (dep) => {
        if (dep.status === "Delivered") return "hover:border-green-500/60 hover:shadow-[0_0_22px_rgba(34,197,94,0.15)]";
        if (dep.status === "En Route") return "hover:border-blue-500/60 hover:shadow-[0_0_22px_rgba(59,130,246,0.15)]";
        return "hover:border-yellow-500/60 hover:shadow-[0_0_22px_rgba(234,179,8,0.15)]";
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-white p-6 font-sans overflow-x-hidden">

            {/* ── Disaster Header ── */}
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 mb-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-20 -mt-20" />
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 bg-red-600/20 text-red-400 border border-red-500/30 rounded text-xs font-bold tracking-widest uppercase">ACTIVE OPERATION</span>
                            <span className="text-slate-400 font-mono text-sm">ID: {disaster.id.substring(0, 8)}</span>
                        </div>
                        <h1 className="text-4xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-2">
                            {disaster.type || "UNKNOWN EVENT"}
                        </h1>
                        <div className="flex items-center gap-2 text-slate-300 font-medium">
                            <MapPin size={18} className="text-blue-400" />
                            {disaster.location || "Location Unknown"}
                        </div>
                    </div>
                    <div className="flex gap-4 flex-wrap">
                        <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-lg min-w-[120px]">
                            <div className="text-slate-400 text-xs font-mono mb-1 uppercase">Total Deps</div>
                            <div className="text-2xl font-bold text-white">{deployments.length}</div>
                        </div>
                        <div className="bg-green-900/20 border border-green-800/50 p-4 rounded-lg min-w-[120px]">
                            <div className="text-green-400 text-xs font-mono mb-1 uppercase">Delivered</div>
                            <div className="text-2xl font-bold text-green-300">{deployments.filter((d) => d.status === "Delivered").length}</div>
                        </div>
                        <div className="bg-blue-900/20 border border-blue-800/50 p-4 rounded-lg min-w-[120px]">
                            <div className="text-blue-400 text-xs font-mono mb-1 uppercase">In Transit</div>
                            <div className="text-2xl font-bold text-blue-300">{deployments.filter((d) => d.status === "En Route").length}</div>
                        </div>
                        <div className="bg-yellow-900/20 border border-yellow-800/50 p-4 rounded-lg min-w-[120px]">
                            <div className="text-yellow-400 text-xs font-mono mb-1 uppercase">Preparing</div>
                            <div className="text-2xl font-bold text-yellow-300">{deployments.filter((d) => d.status === "Preparing").length}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Camp Deployments ── */}
            <div>
                <div className="flex items-center gap-3 mb-5">
                    <Truck size={20} className="text-slate-400" />
                    <h2 className="text-xl font-bold uppercase tracking-widest text-slate-200">Camp Deployments</h2>
                    <span className="ml-auto text-xs font-mono text-slate-500 bg-slate-800 border border-slate-700 px-2 py-1 rounded">
                        {deployments.length} UNITS
                    </span>
                </div>

                {deployments.length === 0 && (
                    <div className="text-slate-500 italic text-sm py-12 text-center border border-dashed border-slate-700 rounded-xl">
                        No deployments calculated yet. Awaiting provider data.
                    </div>
                )}

                <div className="flex flex-col gap-4">
                    {deployments.map((dep) => {
                        const isExpanded = expandedIds.has(dep.id);

                        return (
                            <div
                                key={dep.id}
                                className={`bg-slate-900 border border-slate-700/80 rounded-xl transition-all duration-300 ${glowClass(dep)} ${isExpanded ? "border-slate-600" : ""}`}
                            >
                                {/* ── Collapsed card ── */}
                                <div className="p-5">
                                    <div className="flex items-start justify-between gap-4 mb-4">
                                        <div>
                                            <div className="text-[10px] font-mono text-slate-500 mb-1 uppercase tracking-widest">Camp Destination</div>
                                            <h3 className="text-lg font-bold text-white leading-tight">{dep.campName || "—"}</h3>
                                        </div>
                                        <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded border whitespace-nowrap ${dep.color}`}>
                                            {dep.status}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Users size={13} className="text-slate-500 shrink-0" />
                                            <span className="text-slate-400">Provider:</span>
                                            <span className="font-semibold text-white">{dep.providerName || "—"}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock size={13} className="text-slate-500 shrink-0" />
                                            <span className="text-slate-400">ETA:</span>
                                            <span className={`font-bold ${dep.status === "Delivered" ? "text-green-400" : dep.status === "En Route" ? "text-blue-400" : "text-yellow-400"}`}>
                                                {dep.urgency || "TBD"}
                                            </span>
                                        </div>
                                    </div>
                                    {dep.resourcesAssigned?.length > 0 && (
                                        <div className="mb-4">
                                            <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">
                                                <Package size={11} /> Cargo
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {dep.resourcesAssigned.map((r, i) => (
                                                    <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs">
                                                        <span>{CARGO_ICONS[r.label] ?? "📦"}</span>
                                                        <span className="text-slate-400">{r.label}:</span>
                                                        <span className="font-bold text-white">{r.count}</span>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {dep.status === "Delivered" ? (
                                        <div className="w-full py-2 rounded-lg text-center text-[11px] font-black uppercase tracking-widest bg-green-900/20 border border-green-700/50 text-green-400">
                                            ✓ Delivery Confirmed
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => toggleExpand(dep.id)}
                                            className={`w-full py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all duration-200 border flex items-center justify-center gap-2 ${isExpanded
                                                ? "bg-slate-700/50 border-slate-600 text-slate-300"
                                                : dep.status === "En Route"
                                                    ? "bg-blue-600 border-blue-500 text-white hover:bg-blue-500 shadow-[0_4px_14px_rgba(37,99,235,0.3)]"
                                                    : "bg-yellow-600/20 border-yellow-600/50 text-yellow-400 hover:bg-yellow-600/30"
                                                }`}
                                        >
                                            {isExpanded ? "Hide Details" : "Track Status"}
                                            <ChevronDown size={14} className={`transition-transform duration-250 ${isExpanded ? "rotate-180" : ""}`} />
                                        </button>
                                    )}
                                </div>

                                {/* ── Expanded detail panel ── */}
                                <div style={{ maxHeight: isExpanded ? "560px" : "0px", overflow: "hidden", transition: "max-height 250ms ease-in-out" }}>
                                    <div className="border-t border-slate-700/40 rounded-b-xl overflow-hidden"
                                        style={{ background: "linear-gradient(135deg,#0d1b2e 0%,#0a1628 100%)" }}>

                                        <div className="flex flex-col lg:flex-row">

                                            {/* LEFT — 70% */}
                                            <div className="flex-[7] px-6 pt-6 pb-6 min-w-0 relative overflow-hidden">
                                                {/* Ghost truck watermark */}
                                                <div className="absolute right-4 top-3 pointer-events-none select-none" style={{ opacity: 0.07 }}>
                                                    <svg width="120" height="85" viewBox="0 0 24 24" fill="currentColor" className="text-slate-300">
                                                        <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                                                    </svg>
                                                </div>

                                                {/* DEP badge */}
                                                <div className="flex items-center gap-2 mb-3">
                                                    <span className="px-2 py-0.5 rounded text-[9px] font-black tracking-widest uppercase border"
                                                        style={{ background: "rgba(234,179,8,0.12)", borderColor: "rgba(234,179,8,0.35)", color: "#fbbf24" }}>DEPT</span>
                                                    <span className="font-mono font-bold text-sm tracking-wide" style={{ color: "#fbbf24" }}>
                                                        DEP-{dep.id?.slice(-6).toUpperCase() || "——"}
                                                    </span>
                                                    <span className={`ml-auto px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest rounded border ${dep.color}`}>
                                                        {dep.status}
                                                    </span>
                                                </div>

                                                {/* Camp name */}
                                                <h3 className="text-3xl font-black text-white uppercase tracking-wide leading-tight mb-4">
                                                    {dep.campName || "—"}
                                                </h3>

                                                {/* Info grid */}
                                                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm mb-5">
                                                    <div className="flex items-center gap-2">
                                                        <MapPin size={13} className="text-green-400 shrink-0" />
                                                        <span className="text-slate-400">Camp:</span>
                                                        <span className="text-white font-medium ml-1 truncate">{dep.campName || "—"}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-green-400 font-bold shrink-0">✓</span>
                                                        <span className="text-white font-medium truncate">{dep.providerName || "—"}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Clock size={13} className="text-slate-500 shrink-0" />
                                                        <span className="text-slate-400">Status:</span>
                                                        <span className={`font-bold ml-1 ${dep.status === "Delivered" ? "text-green-400" : dep.status === "En Route" ? "text-yellow-300" : "text-slate-300"}`}>
                                                            {dep.status === "En Route" ? "IN TRANSIT" : dep.status.toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-slate-500 text-xs">Expected:</span>
                                                        <span className="text-slate-200 font-medium ml-1">{dep.urgency || "TBD"}</span>
                                                    </div>
                                                </div>

                                                {/* Distance + ETA */}
                                                <div className="grid grid-cols-2 gap-3 mb-5">
                                                    <div className="relative rounded-xl p-4 overflow-hidden"
                                                        style={{ background: "#0f2233", border: "1px solid rgba(51,65,85,0.6)" }}>
                                                        <div className="absolute right-2 bottom-1 pointer-events-none select-none" style={{ opacity: 0.07 }}>
                                                            <svg width="60" height="44" viewBox="0 0 24 24" fill="currentColor" className="text-slate-300">
                                                                <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                                                            </svg>
                                                        </div>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="p-1.5 rounded-md" style={{ border: "1px solid rgba(71,85,105,0.7)" }}>
                                                                <Truck size={12} className="text-slate-300" />
                                                            </div>
                                                            <span className="text-slate-300 text-xs font-semibold">Distance</span>
                                                        </div>
                                                        <div className="flex items-end gap-1 mb-2">
                                                            <span className="text-4xl font-black leading-none" style={{ color: "#00d4aa" }}>
                                                                {dep.status === "Delivered" ? "0" : dep.distRemainingKm}
                                                            </span>
                                                            <span className="text-slate-400 text-base mb-0.5 ml-1">km</span>
                                                        </div>
                                                        <div className="flex items-center gap-1 text-xs" style={{ color: "#4b6a85" }}>
                                                            <MapPin size={10} className="shrink-0" />
                                                            <span>Avg Speed</span>
                                                            <span className="text-[10px] ml-0.5" style={{ color: "#334d63" }}>(est.)</span>
                                                            <span className="font-bold ml-1 text-slate-300">{dep.avgSpeed} km/h</span>
                                                        </div>
                                                    </div>

                                                    <div className="rounded-xl p-4"
                                                        style={{ background: "#0c1f3a", border: "1px solid rgba(37,99,235,0.25)" }}>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="p-1.5 rounded-md" style={{ border: "1px solid rgba(37,99,235,0.35)" }}>
                                                                <Clock size={12} className="text-blue-300" />
                                                            </div>
                                                            <span className="text-slate-300 text-xs font-semibold">ETA Remaining</span>
                                                        </div>
                                                        <div className="mb-0.5">
                                                            <span className="text-3xl font-black text-green-400 leading-none">
                                                                {dep.status === "Delivered" ? "Arrived" : dep.urgency || "TBD"}
                                                            </span>
                                                        </div>
                                                        <DotProgress progress={dep.progress} />
                                                        <div className="flex items-center gap-1 text-xs" style={{ color: "#4b6a85" }}>
                                                            <span className="text-yellow-400">⚡</span>
                                                            <span>Avg Speed</span>
                                                            <span className="text-[10px] ml-0.5" style={{ color: "#334d63" }}>(Assumed)</span>
                                                            <span className="font-bold ml-1 text-slate-300">{dep.avgSpeed} km/h</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Resources */}
                                                {dep.resourcesAssigned?.length > 0 && (
                                                    <div>
                                                        <div className="mb-3">
                                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resources </span>
                                                            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#334d63" }}>Being Transported</span>
                                                        </div>
                                                        <div className="flex flex-wrap items-start gap-x-6 gap-y-3">
                                                            {dep.resourcesAssigned.map((r, i) => (
                                                                <div key={i} className="flex items-center gap-2.5">
                                                                    <span className="text-2xl leading-none">{CARGO_ICONS[r.label] ?? "📦"}</span>
                                                                    <div>
                                                                        <div className="text-xs leading-tight" style={{ color: "#8899aa" }}>
                                                                            {r.label}{r.label === "Food" ? " Kits" : r.label === "Water" ? " Units" : ""}
                                                                        </div>
                                                                        <div className="text-[1.6rem] font-black leading-none" style={{ color: "#22d3ee" }}>{r.count}</div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* RIGHT — 30% route map */}
                                            <div className="flex-[3] lg:border-l border-t lg:border-t-0 border-slate-700/40 p-3"
                                                style={{ minHeight: "360px" }}>
                                                {isExpanded && (
                                                    <RouteMap
                                                        originLatLng={dep.originLatLng}
                                                        destinationLatLng={dep.destinationLatLng}
                                                        status={dep.status}
                                                        progress={dep.progress}
                                                        avgSpeed={dep.avgSpeed}
                                                    />
                                                )}
                                            </div>

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
