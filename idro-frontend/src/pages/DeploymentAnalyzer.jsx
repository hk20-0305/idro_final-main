import { Activity, MapPin, AlertTriangle, Truck, Clock, Package, ChevronDown, Utensils, Droplets, Bed, BriefcaseMedical, Heart, CheckCircle2, Compass } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { idroApi } from "../services/api";
import { calculateAllocations } from "../utils/allocationEngine";
import DotPattern from "../components/DotPattern";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
    iconUrl: require("leaflet/dist/images/marker-icon.png"),
    shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

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
        @keyframes truckGlowPulse {
            0%   { box-shadow: 0 0 8px #10b981aa, 0 0 2px #10b981; }
            50%  { box-shadow: 0 0 18px #10b981ee, 0 0 6px #10b981; }
            100% { box-shadow: 0 0 8px #10b981aa, 0 0 2px #10b981; }
        }
        .truck-glow {
            animation: truckGlowPulse 2.5s ease-in-out infinite;
        }
    `;
    document.head.appendChild(s);
}



const campIcon = L.divIcon({
    className: "",
    html: `
        <div style="display:flex;flex-direction:column;align-items:center;gap:3px;">
          <div style="width:24px;height:24px;border-radius:50%;background:#ef4444;border:2.5px solid #ffffff;box-shadow:0 0 12px rgba(239,68,68,0.4);"></div>
          <span style="background:white;color:#ef4444;font-size:10px;font-weight:900;padding:2px 8px;border-radius:4px;border:1px solid #ef4444aa;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.15);">TARGET CAMP</span>
        </div>`,
    iconSize: [80, 42],
    iconAnchor: [40, 12],
});

const ngoLabelIcon = L.divIcon({
    className: "",
    html: `
        <div style="display:flex;flex-direction:column;align-items:center;gap:3px;">
          <div style="width:24px;height:24px;border-radius:50%;background:#22c55e;border:2.5px solid #ffffff;box-shadow:0 0 12px rgba(34,197,94,0.4);"></div>
          <span style="background:white;color:#16a34a;font-size:10px;font-weight:900;padding:2px 8px;border-radius:4px;border:1px solid #16a34aaa;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.15);">NGO BASE</span>
        </div>`,
    iconSize: [80, 42],
    iconAnchor: [40, 12],
});

const truckMarkerIcon = L.divIcon({
    className: "",
    html: `<div class="truck-glow" style="background:#000000;border:2px solid #10b981;border-radius:8px;width:38px;height:30px;display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 4px 10px rgba(0,0,0,0.5);">🚚</div>`,
    iconSize: [38, 30],
    iconAnchor: [19, 15],
});

const CITY_MAP = {
    mumbai: [19.076, 72.8777], delhi: [28.7041, 77.1025], jaipur: [26.9124, 75.7873],
    bangalore: [12.9716, 77.5946], chennai: [13.0827, 80.2707], kochi: [9.9312, 76.2673],
    thiruvananthapuram: [8.5241, 76.9366], kerala: [10.8505, 76.2711],
    hyderabad: [17.385, 78.4867], pune: [18.5204, 73.8567],
    ahmedabad: [23.0225, 72.5714], kolkata: [22.5726, 88.3639],
    lucknow: [26.8467, 80.9462], bhopal: [23.2599, 77.4126],
    patna: [25.5941, 85.1376], bhubaneswar: [20.2961, 85.8245],
    guwahati: [26.1158, 91.7086], ranchi: [23.3441, 85.3096],
    shimla: [31.1048, 77.1734], dehradun: [30.3165, 78.0322],
    chandigarh: [30.7333, 76.7794], raipur: [21.2514, 81.6296],
    nagpur: [21.1458, 79.0882], indore: [22.7196, 75.8577],
    srinagar: [34.0837, 74.7973], varanasi: [25.3176, 82.9739],
    kota: [25.18, 75.83],
};

const geocodeCache = new Map();
const fetchCoordinates = async (address) => {
    if (!address || address === "Unknown") return null;
    if (geocodeCache.has(address)) return geocodeCache.get(address);
    try {
        const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
        if (res.data?.[0]) {
            const coords = [parseFloat(res.data[0].lat), parseFloat(res.data[0].lon)];
            geocodeCache.set(address, coords);
            return coords;
        }
    } catch (e) { console.warn("Geocoding failed for:", address); }
    return null;
};

const coordsFromLocation = (locStr = "") => {
    if (!locStr) return null;
    const loc = locStr.toLowerCase();

    for (const city in CITY_MAP) {
        if (loc.includes(city)) return CITY_MAP[city];
    }

    const match = loc.match(/(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/);
    if (match) return [parseFloat(match[1]), parseFloat(match[2])];

    return null;
};

const seedCoords = (seed = "", offsetFactor = 0) => {
    const h = [...(seed + "x")].reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 0);
    const absH = Math.abs(h);
    const lat = 20 + (absH % 100) / 10;
    const lng = 75 + (absH % 150) / 10;
    return [lat, lng];
};

const URGENCY_META = {
    IMMEDIATE: { speed: 45, totalKm: 25 },
    QUICK: { speed: 35, totalKm: 50 },
    "6_HOURS": { speed: 25, totalKm: 80 },
    SIX_HOURS: { speed: 25, totalKm: 80 },
    STAGED: { speed: 22, totalKm: 100 },
    "12_HOURS": { speed: 18, totalKm: 150 },
    TWELVE_HOURS: { speed: 18, totalKm: 150 },
    EXTENDED: { speed: 15, totalKm: 200 },
    "24_HOURS": { speed: 12, totalKm: 280 },
    TWENTY_FOUR_HOURS: { speed: 12, totalKm: 280 },
};



function TruckProgress({ progress }) {
    return (
        <div className="relative w-32 h-1 bg-slate-800/60 rounded-full overflow-visible">
            <div className="absolute top-0 left-0 w-full h-full bg-slate-800/40 rounded-full" />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-lime-400 rounded-full shadow-[0_0_8px_#bef264]" />
            <div
                className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-in-out"
                style={{
                    width: `${progress}%`,
                    background: "linear-gradient(90deg, #d9f99d 0%, #bef264 100%)",
                }}
            />
            <div
                className="absolute top-[-8px] transition-all duration-1000 ease-in-out flex items-center justify-center p-1 bg-slate-900 border border-lime-400/40 rounded shadow-md"
                style={{ left: `calc(${progress}% - 12px)` }}
            >
                <Truck size={10} className="text-lime-400" />
            </div>
        </div>
    );
}

function FitBounds({ path }) {
    const map = useMap();
    useEffect(() => {
        if (path && path.length > 0) {
            const bounds = L.latLngBounds(path);
            map.fitBounds(bounds, { padding: [30, 30], maxZoom: 12 });
        }
    }, [map, path]);
    return null;
}

function AnimatedTruck({ path, status, startProgress, avgSpeed }) {
    const [t, setT] = useState(status === "Delivered" ? 1 : status === "Preparing" ? 0 : startProgress / 100);

    useEffect(() => {
        if (status !== "En Route" || !path || path.length < 2) {
            setT(status === "Delivered" ? 1 : 0);
            return;
        }

        const step = Math.max(0.001, Math.min(0.005, (avgSpeed / 45) * 0.004));
        const id = setInterval(() => {
            setT((prev) => (prev + step >= 1 ? 0 : prev + step));
        }, 50);
        return () => clearInterval(id);
    }, [status, avgSpeed, path]);

    if (!path || path.length < 2) return null;


    let lat, lng;
    if (t <= 0) {
        [lat, lng] = path[0];
    } else if (t >= 1) {
        [lat, lng] = path[path.length - 1];
    } else {
        const totalPoints = path.length;
        const index = t * (totalPoints - 1);
        const i = Math.floor(index);
        const delta = index - i;
        const p1 = path[i];
        const p2 = path[i + 1] || p1;
        lat = p1[0] + delta * (p2[0] - p1[0]);
        lng = p1[1] + delta * (p2[1] - p1[1]);
    }

    return <Marker position={[lat, lng]} icon={truckMarkerIcon} />;
}

function RouteMap({ originLatLng, destinationLatLng, status, progress, avgSpeed }) {
    const [routePath, setRoutePath] = useState([originLatLng, destinationLatLng]);
    const ORS_API_KEY = "5b3ce3597851110001cf62483842187f5466488390b1bf534e44e2cf";

    useEffect(() => {
        const fetchORSPath = async () => {
            try {

                const start = `${originLatLng[1]},${originLatLng[0]}`;
                const end = `${destinationLatLng[1]},${destinationLatLng[0]}`;
                const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ORS_API_KEY}&start=${start}&end=${end}`;

                const res = await axios.get(url);
                if (res.data?.features?.[0]?.geometry?.coordinates) {
                    const coords = res.data.features[0].geometry.coordinates.map(c => [c[1], c[0]]);
                    setRoutePath(coords);
                }
            } catch (err) {
                console.error("Route geometry fetch failed:", err);
                setRoutePath([originLatLng, destinationLatLng]);
            }
        };
        fetchORSPath();
    }, [originLatLng, destinationLatLng]);

    const center = [(originLatLng[0] + destinationLatLng[0]) / 2, (originLatLng[1] + destinationLatLng[1]) / 2];

    return (
        <div className="w-full h-full rounded-xl overflow-hidden relative z-0 shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-slate-700/20" style={{ minHeight: "360px" }}>
            <MapContainer center={center} zoom={7} className="w-full h-full" style={{ minHeight: "380px" }} zoomControl scrollWheelZoom={false}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <FitBounds path={routePath} />

                {(status === "IN TRANSIT" || status === "DISPATCHED") ? (
                    <>
                        <Polyline positions={routePath} color="#16a34a" weight={12} opacity={0.15} />
                        <Polyline positions={routePath} color="#16a34a" weight={6} opacity={0.3} />
                        <Polyline positions={routePath} color="#16a34a" weight={4} opacity={1} />
                    </>
                ) : status === "PREPARING" ? (
                    <Polyline positions={routePath} color="#eab308" weight={3} dashArray="1, 10" lineCap="round" opacity={0.9} />
                ) : status === "DELIVERED" ? (
                    <Polyline positions={routePath} color="#22c55e" weight={4} opacity={0.9} />
                ) : (
                    <Polyline positions={routePath} color="#22c55e" weight={3} dashArray="6, 8" opacity={0.7} />
                )}

                <Marker position={originLatLng} icon={ngoLabelIcon}><Popup>NGO Base</Popup></Marker>
                <Marker position={destinationLatLng} icon={campIcon}><Popup>Target Camp</Popup></Marker>

                <AnimatedTruck
                    path={routePath}
                    status={status}
                    startProgress={progress}
                    avgSpeed={avgSpeed}
                />
            </MapContainer>
        </div>
    );
}

const DeploymentAnalyzer = () => {
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
                const enriched = await Promise.all(baseAllocations.map(async (alloc, idx) => {
                    const matchingKey = Object.keys(actionStatuses).find((k) => k.startsWith(alloc.campName));
                    const currentStatus = actionStatuses[matchingKey] || "ASSIGNED";
                    const urgKey = String(alloc.urgency || "").toUpperCase().trim().replace(/\s+/g, "_");
                    const meta = URGENCY_META[urgKey] || { speed: 20, totalKm: 100 };

                    const u = String(alloc.urgency || "").toUpperCase();
                    let progress = 15, color = "text-yellow-400 bg-yellow-900/30 border-yellow-500", statusLabel = "PREPARING";

                    if (u.includes("IMMEDIATE") || u.includes("NOW")) {
                        progress = 100;
                        color = "text-[#4ade80] bg-green-900/30 border-green-500";
                        statusLabel = "DELIVERED";
                    } else if (/\b6\b|SIX|QUICK/.test(u)) {
                        progress = 75;
                        color = "text-[#fbbf24] bg-yellow-900/30 border-yellow-500";
                        statusLabel = "IN TRANSIT";
                    } else if (/\b12\b|TWELVE|STAGED/.test(u)) {
                        progress = 45;
                        color = "text-emerald-400 bg-emerald-950/30 border-emerald-500/50";
                        statusLabel = "DISPATCHED";
                    } else {

                        progress = 15;
                        color = "text-yellow-400 bg-yellow-900/30 border-yellow-500";
                        statusLabel = "PREPARING";
                    }

                    let originLatLng = coordsFromLocation(alloc.providerLocation);
                    if (!originLatLng) originLatLng = await fetchCoordinates(alloc.providerLocation);

                    let destinationLatLng = alloc.campCoords || coordsFromLocation(alloc.campName);
                    if (!destinationLatLng) destinationLatLng = await fetchCoordinates(alloc.campName);

                    if (!destinationLatLng && found && found.location) {
                        destinationLatLng = coordsFromLocation(found.location) || await fetchCoordinates(found.location);
                    }

                    const seed = (alloc.id || String(idx)) + (id || "");


                    originLatLng = originLatLng || seedCoords(seed + "origin", 0);
                    destinationLatLng = destinationLatLng || seedCoords(seed + "dest", 1);

                    return {
                        ...alloc,
                        status: statusLabel,
                        rawStatus: currentStatus,
                        progress,
                        color,
                        avgSpeed: meta.speed,
                        distRemainingKm: Math.round((1 - progress / 100) * meta.totalKm),
                        originLatLng,
                        destinationLatLng,
                    };
                }));

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
            <div className="min-h-screen bg-black flex items-center justify-center text-emerald-400">
                <Activity className="animate-pulse mr-3" /> INITIALIZING TACTICAL VIEW...
            </div>
        );
    }

    if (!disaster) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-red-500 gap-4">
                <AlertTriangle size={48} />
                <h2 className="text-xl font-mono uppercase">Disaster record not found</h2>
                <button onClick={() => navigate("/deployment-status")} className="text-emerald-400 hover:text-emerald-300 underline font-mono text-sm">
                    Return to Status Board
                </button>
            </div>
        );
    }

    const glowClass = (dep) => {
        if (dep.status === "DELIVERED") return "hover:border-emerald-500/60 hover:shadow-[0_0_22px_rgba(16,185,129,0.15)]";
        if (dep.status === "IN TRANSIT" || dep.status === "DISPATCHED") return "hover:border-emerald-500/60 hover:shadow-[0_0_22px_rgba(16,185,129,0.15)]";
        return "hover:border-yellow-500/60 hover:shadow-[0_0_22px_rgba(234,179,8,0.15)]";
    };

    return (
        <div className="relative min-h-screen text-white p-6 font-sans overflow-x-hidden">
            <div className="fixed inset-0 z-0 pointer-events-none">
                <DotPattern />
            </div>

            <div className="relative z-10">

                <div className="bg-black/80 backdrop-blur-md border border-white/20 rounded-xl p-6 mb-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-20 -mt-20" />
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-3 py-1 bg-red-600/20 text-red-400 border border-red-500/30 rounded text-xs font-bold tracking-widest uppercase">ACTIVE OPERATION</span>
                                <span className="text-slate-500 font-mono text-sm">ID: {disaster.id.substring(0, 8)}</span>
                            </div>
                            <h1 className="text-4xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-500 mb-2">
                                {disaster.type || "UNKNOWN EVENT"}
                            </h1>
                            <div className="flex items-center gap-2 text-slate-400 font-medium">
                                <MapPin size={18} className="text-emerald-400" />
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
                                <div className="text-2xl font-bold text-green-300">{deployments.filter((d) => d.status === "DELIVERED").length}</div>
                            </div>
                            <div className="bg-emerald-900/20 border border-emerald-800/50 p-4 rounded-lg min-w-[120px]">
                                <div className="text-emerald-400 text-xs font-mono mb-1 uppercase">In Transit</div>
                                <div className="text-2xl font-bold text-emerald-300">{deployments.filter((d) => d.status === "IN TRANSIT" || d.status === "DISPATCHED").length}</div>
                            </div>
                            <div className="bg-yellow-900/20 border border-yellow-800/50 p-4 rounded-lg min-w-[120px]">
                                <div className="text-yellow-400 text-xs font-mono mb-1 uppercase">Preparing</div>
                                <div className="text-2xl font-bold text-yellow-300">{deployments.filter((d) => d.status === "PREPARING").length}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <div className="flex items-center gap-3 mb-5">
                        <Truck size={20} className="text-slate-400" />
                        <h2 className="text-xl font-bold uppercase tracking-widest text-slate-200">Camp Deployments</h2>
                        <span className="ml-auto text-xs font-mono text-slate-500 bg-slate-800 border border-white/20 px-2 py-1 rounded">
                            {deployments.length} UNITS
                        </span>
                    </div>

                    {deployments.length === 0 && (
                        <div className="text-slate-500 italic text-sm py-12 text-center border border-dashed border-slate-700 rounded-xl">
                            No deployments calculated yet. Awaiting provider data.
                        </div>
                    )}

                    <div className="flex flex-col gap-2.5">
                        {deployments.map((dep) => {
                            const isExpanded = expandedIds.has(dep.id);

                            return (
                                <div
                                    key={dep.id}
                                    className={`bg-black/60 backdrop-blur-sm border border-white/20 rounded-xl transition-all duration-300 ${glowClass(dep)} ${isExpanded ? "ring-1 ring-white/30" : ""}`}
                                >
                                    <div className="p-3.5">
                                        <div className="flex items-center justify-between mb-3 relative">
                                            <div className="flex-1 text-left">
                                                <div className="text-[9px] font-mono text-slate-600 uppercase tracking-[0.2em] mb-1 opacity-80">Source NGO</div>
                                                <h3 className="text-sm md:text-base font-black text-white uppercase tracking-tighter leading-none hover:text-emerald-400 transition-colors cursor-default">
                                                    {dep.providerName || "—"}
                                                </h3>
                                            </div>

                                            <div className="flex-[2] px-8 relative h-8 flex items-center">
                                                <div className="w-full h-[2px] bg-slate-800/50 rounded-full relative overflow-hidden border border-white/20">
                                                    <div className="absolute inset-0 opacity-40" style={{
                                                        backgroundImage: 'linear-gradient(to right, #334155 50%, transparent 50%)',
                                                        backgroundSize: '12px 100%'
                                                    }} />

                                                    <div
                                                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.6)] transition-all duration-1000 ease-in-out"
                                                        style={{
                                                            width: `${dep.progress}%`,
                                                            backgroundImage: 'linear-gradient(to right, #10b981 50%, transparent 50%)',
                                                            backgroundSize: '12px 100%'
                                                        }}
                                                    />
                                                </div>

                                                <div
                                                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-1000 ease-in-out z-20"
                                                    style={{ left: `calc(10px + ${dep.progress}% * (100% - 20px) / 100)` }}
                                                >
                                                    <div className="bg-black p-1 rounded-lg border border-white/10 shadow-[0_3px_10px_rgba(0,0,0,0.8)] transform hover:scale-110 transition-transform duration-300">
                                                        <span className="text-lg block scale-x-[-1] filter drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]">🚚</span>
                                                    </div>
                                                </div>

                                                <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 z-20">
                                                    <div className="bg-black p-1 rounded-lg border border-white/10 shadow-[0_3px_10px_rgba(0,0,0,0.8)] transform hover:scale-110 transition-transform duration-300">
                                                        <span className="text-lg block filter drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]">⛺</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex-1 text-right">
                                                <div className="text-[9px] font-mono text-slate-500 uppercase tracking-[0.2em] mb-1 opacity-80">Campaign Hub</div>
                                                <h3 className="text-sm md:text-base font-black text-white uppercase tracking-tighter leading-none hover:text-green-400 transition-colors cursor-default">
                                                    {dep.campName || "—"}
                                                </h3>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between gap-3 mb-3 pt-2 border-t border-slate-800/30">
                                            <div className="flex items-center gap-4">
                                                <div className={`px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] rounded-lg border shadow-xl ${dep.color}`}>
                                                    {dep.status}
                                                </div>
                                                <div className="h-4 w-[1px] bg-slate-700" />
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest leading-none mb-1">Target Window</span>
                                                    <span className={`text-[13px] font-black uppercase tracking-wider ${dep.status === "DELIVERED" ? "text-green-400" : "text-yellow-400"}`}>
                                                        {dep.urgency || "TBD"}
                                                    </span>
                                                </div>
                                            </div>

                                            {dep.status === "DELIVERED" && (
                                                <div className="flex items-center gap-2 text-green-400 font-black text-[11px] uppercase tracking-widest bg-green-950/20 border border-green-500/20 px-4 py-1.5 rounded-lg">
                                                    <CheckCircle2 size={14} /> Mission Accomplished
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => toggleExpand(dep.id)}
                                            className={`mx-auto px-5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-300 border flex items-center justify-center gap-2 active:scale-[0.98] group ${isExpanded
                                                ? "bg-slate-800/90 border-slate-600 text-slate-300"
                                                : dep.status === "DELIVERED"
                                                    ? "bg-green-900/10 border-green-500/60 text-green-400 hover:bg-green-500/20 hover:border-green-400 shadow-[0_0_30px_rgba(34,197,94,0.1)]"
                                                    : "bg-[#0d1b2e] border-slate-600 text-[#fbbf24] hover:border-yellow-400 hover:bg-yellow-500/5 shadow-[0_15px_35px_rgba(0,0,0,0.4)]"
                                                }`}
                                        >
                                            <Activity size={16} className={`group-hover:animate-pulse ${isExpanded ? "text-slate-400" : dep.status === "DELIVERED" ? "text-green-400" : "text-yellow-400"}`} />
                                            {isExpanded ? "Hide Details" : "Track Details"}
                                            <ChevronDown size={18} className={`transition-transform duration-500 ${isExpanded ? "rotate-180" : ""}`} />
                                        </button>
                                    </div>

                                    <div
                                        className="custom-scrollbar"
                                        style={{
                                            maxHeight: isExpanded ? "1000px" : "0px",
                                            overflowY: isExpanded ? "auto" : "hidden",
                                            transition: "max-height 300ms ease-in-out, padding 300ms ease"
                                        }}
                                    >
                                        <div className="border-t border-white/5 rounded-b-xl overflow-hidden"
                                            style={{ background: "linear-gradient(135deg,#071222 0%,#0d1e36 60%,#0a1a30 100%)" }}>

                                            <div className="flex flex-col lg:flex-row">

                                                <div className="flex-[7] px-6 pt-6 pb-6 min-w-0 relative overflow-hidden">
                                                    <div className="absolute right-4 top-3 pointer-events-none select-none" style={{ opacity: 0.07 }}>
                                                        <svg width="120" height="85" viewBox="0 0 24 24" fill="currentColor" className="text-slate-300">
                                                            <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                                                        </svg>
                                                    </div>

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

                                                    <h3 className="text-3xl font-black text-white uppercase tracking-wide leading-tight mb-4">
                                                        {dep.campName || "—"}
                                                    </h3>

                                                    <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-sm mb-6 border-b border-slate-800/40 pb-6">
                                                        <div className="flex items-center gap-3">
                                                            <Heart size={16} className="text-[#34d399] shrink-0" />
                                                            <span className="text-slate-400 font-medium">Camp:</span>
                                                            <span className="text-white font-bold ml-1 truncate">{dep.campName || "—"}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <CheckCircle2 size={16} className="text-[#22d3ee] shrink-0" />
                                                            <span className="text-white font-bold truncate">{dep.providerName || "—"}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <Compass size={16} className="text-[#fbbf24] shrink-0" />
                                                            <span className="text-slate-400 font-medium">Status:</span>
                                                            <span className="font-black ml-1 text-[#fbbf24] tracking-wider uppercase">
                                                                {dep.status}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-slate-400 font-medium">Expected:</span>
                                                            <span className="text-[#bef264] font-bold ml-1 uppercase">{dep.urgency || "TBD"}</span>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4 mb-5">
                                                        <div className="relative rounded-2xl p-6 overflow-hidden transition-all duration-300 hover:border-emerald-500/20 group"
                                                            style={{ background: "linear-gradient(135deg,#0a1628 0%,#0d1e36 100%)", border: "1.5px solid rgba(99,179,255,0.08)", boxShadow: "0 10px 25px -5px rgba(0,0,30,0.6)" }}>

                                                            <div className="absolute right-[-20px] top-4 pointer-events-none opacity-[0.05] group-hover:opacity-[0.08] transition-opacity duration-300">
                                                                <svg width="180" height="135" viewBox="0 0 24 24" fill="currentColor" className="text-slate-200">
                                                                    <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4z" />
                                                                </svg>
                                                            </div>

                                                            <div className="flex items-center gap-3 mb-4 relative z-10">
                                                                <Package size={18} className="text-slate-400" />
                                                                <span className="text-slate-100 text-[13px] font-bold tracking-wide">Distance</span>
                                                            </div>

                                                            <div className="flex items-end gap-2 mb-6 relative z-10">
                                                                <span className="text-5xl font-black tracking-tight" style={{ color: "#d9f99d" }}>
                                                                    {dep.status === "Delivered" ? "0" : dep.distRemainingKm}
                                                                </span>
                                                                <span className="text-slate-400 text-2xl font-bold mb-1.5 lowercase">km</span>
                                                            </div>

                                                            <div className="flex items-center gap-2 text-[12px] font-semibold relative z-10" style={{ color: "#475569" }}>
                                                                <MapPin size={14} className="text-lime-500/70" />
                                                                <span className="text-slate-500">Avg Speed</span>
                                                                <span className="text-[10px] opacity-60 font-normal">(2 hours)</span>
                                                                <span className="ml-2 text-white font-black text-sm">{dep.avgSpeed} km/h</span>
                                                            </div>
                                                        </div>

                                                        <div className="relative rounded-2xl p-6 overflow-hidden transition-all duration-300 hover:border-emerald-500/20 group"
                                                            style={{ background: "linear-gradient(135deg,#0a1628 0%,#0d1e36 100%)", border: "1.5px solid rgba(99,179,255,0.08)", boxShadow: "0 10px 25px -5px rgba(0,0,30,0.6)" }}>

                                                            <div className="flex justify-between items-start mb-4 relative z-10">
                                                                <div className="flex items-center gap-3">
                                                                    <Clock size={18} className="text-slate-400" />
                                                                    <span className="text-slate-100 text-[13px] font-bold tracking-wide">ETA Remaining</span>
                                                                </div>
                                                                <TruckProgress progress={dep.progress} />
                                                            </div>

                                                            <div className="mb-6 relative z-10">
                                                                <span className="text-5xl font-black tracking-tight" style={{ color: "#d9f99d" }}>
                                                                    {dep.status === "Delivered" ? "Arrived" : (dep.urgency && dep.urgency.includes("Hours")) ? `${parseInt(dep.urgency)}h 00m` : (dep.urgency || "1h 42m")}
                                                                </span>
                                                            </div>

                                                            <div className="flex items-center gap-2 text-[12px] font-semibold relative z-10" style={{ color: "#475569" }}>
                                                                <span className="text-yellow-400 brightness-125 text-sm">⚡</span>
                                                                <span className="text-slate-500">Avg Speed</span>
                                                                <span className="text-[10px] opacity-60 font-normal">(Assumed)</span>
                                                                <span className="ml-2 text-white font-black text-sm">{dep.avgSpeed} km/h</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {dep.resourcesAssigned?.length > 0 && (
                                                        <div className="mt-8 rounded-2xl p-6 border border-slate-700/50 bg-[#0d1b2e]/60 shadow-2xl">
                                                            <div className="pb-4 mb-6 border-b border-slate-800/80">
                                                                <div className="flex items-center gap-3">
                                                                    <span className="text-[13px] font-black text-white uppercase tracking-[0.2em]">Resources</span>
                                                                    <span className="text-[13px] font-bold uppercase tracking-[0.15em] text-slate-500">Being Transported</span>
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                                                {dep.resourcesAssigned.map((r, i) => {
                                                                    const config = {
                                                                        Food: { icon: Utensils, iconColor: "#ef4444", valColor: "#fb923c", label: "Food Kits" },
                                                                        Water: { icon: Droplets, iconColor: "#3b82f6", valColor: "#38bdf8", label: "Water Units" },
                                                                        Beds: { icon: Bed, iconColor: "#f59e0b", valColor: "#fbbf24", label: "Beds" },
                                                                        Medkits: { icon: BriefcaseMedical, iconColor: "#10b981", valColor: "#4ade80", label: "Medical Kits" }
                                                                    }[r.label] || { icon: Package, iconColor: "#94a3b8", valColor: "#d9f99d", label: r.label };

                                                                    const Icon = config.icon;

                                                                    return (
                                                                        <div key={i} className={`flex items-start gap-4 ${i > 0 ? "lg:border-l lg:border-slate-800/80 lg:pl-8" : ""}`}>
                                                                            <Icon size={24} style={{ color: config.iconColor }} className="mt-1" />
                                                                            <div className="flex flex-col gap-1">
                                                                                <span className="text-[11px] font-bold text-white uppercase tracking-wider opacity-90">{config.label}</span>
                                                                                <div className="flex items-end gap-2">
                                                                                    <span className="text-4xl font-black tabular-nums leading-none tracking-tight" style={{ color: config.valColor }}>
                                                                                        {r.count}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

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
        </div>
    );
};

export default DeploymentAnalyzer;
