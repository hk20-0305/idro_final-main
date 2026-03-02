import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from "react-router-dom";
import idroLogo from '../assets/logo.png';
import DonationModal from './DonationModal';

import {
  Bell,
  FileText,
  LayoutDashboard,
  Phone,
  ShieldAlert, // Added for Response Modal
  Siren, // Added for Deploy Button
  Tent,
  TriangleAlert,
  Truck,
  Users,
  X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Circle, MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { idroApi } from '../services/api';

// --- LEAFLET ICON FIX ---
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// --- DIAMOND ICONS LOGIC ---
const getIcon = (status, type, trustScore) => {
  const isConfirmedDisaster = trustScore > 75;

  if (isConfirmedDisaster) {
    return L.divIcon({
      className: 'custom-icon-disaster',
      html: `<div class="relative flex items-center justify-center w-12 h-12">
              <div class="absolute w-8 h-8 bg-red-600/40 rotate-45 animate-ping rounded-sm"></div>
              <div class="absolute w-6 h-6 bg-red-600/60 rotate-45 animate-pulse rounded-sm"></div>
              <div class="relative w-5 h-5 bg-red-600 border-2 border-white rotate-45 shadow-[0_0_15px_#dc2626] flex items-center justify-center z-10">
                 <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
              </div>
            </div>`,
      iconSize: [48, 48],
      iconAnchor: [24, 24],
      popupAnchor: [0, -24]
    });
  } else {
    return L.divIcon({
      className: 'custom-icon-pre',
      html: `<div class="relative flex items-center justify-center w-10 h-10">
              <div class="absolute w-6 h-6 border-2 border-orange-500/50 rotate-45 animate-ping rounded-sm"></div>
              <div class="relative w-4 h-4 bg-orange-500 border border-white rotate-45 shadow-[0_0_10px_#f97316] z-10 flex items-center justify-center">
                 <div class="w-1 h-1 bg-white rounded-full"></div>
              </div>
            </div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -20]
    });
  }
};

// --- MARKER COMPONENT ---
const AlertMarker = ({ alert }) => {
  const [locationName, setLocationName] = useState("...");

  useEffect(() => {
    const fetchAddress = async () => {
      if (alert.location.includes("Report") || alert.location.includes("(")) {
        try {
          const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${alert.latitude}&lon=${alert.longitude}`);
          const addr = res.data.address;
          const city = addr.city || addr.town || addr.village || addr.county || "Unknown Sector";
          const state = addr.state || "";
          const country = addr.country || "";
          setLocationName(`${city}, ${state}, ${country}`);
        } catch (e) {
          setLocationName("Remote Sector, India");
        }
      } else {
        setLocationName(alert.location);
      }
    };
    fetchAddress();
  }, [alert]);

  return (
    <Marker position={[alert.latitude || 20, alert.longitude || 78]} icon={getIcon(alert.missionStatus, alert.sourceType, alert.trustScore)}>
      <Popup className="custom-popup-dark">
        <div className="p-2 bg-[#0f172a] text-white rounded border border-white/10">
          <h3 className="text-sm font-black text-white mb-1 border-b border-white/10 pb-1">
            {locationName}
          </h3>
          <strong className="uppercase text-blue-400 text-xs block mb-1">{alert.type}</strong>
          <p className="text-[10px] text-slate-300 mb-2">{alert.details}</p>
        </div>
      </Popup>

      {alert.missionStatus === 'OPEN' && <Circle center={[alert.latitude, alert.longitude]} radius={60000} pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.1, weight: 1 }} />}
    </Marker>
  );
};

export default function IdroHome() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [showDisasterModal, setShowDisasterModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false); // Donation Modal State

  useEffect(() => {
    const fetchPublicAlerts = async () => {
      try {
        const res = await idroApi.getAlerts();
        if (res.data && res.data.length > 0) {
          const publicAlerts = res.data.filter(
            a => a.missionStatus === 'OPEN' && a.trustScore > 75);
          setAlerts(publicAlerts);
        }
      } catch (err) { console.error("API Error"); }
    };
    fetchPublicAlerts();
    const interval = setInterval(fetchPublicAlerts, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    // ✅ h-screen + overflow-hidden prevents the "White Blank Page" issue
    <div className="h-screen w-screen bg-[#0f172a] font-sans text-slate-200 flex flex-col overflow-hidden relative">

      {/* BACKGROUND TEXTURE */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0"></div>

      {/* --- TICKER --- */}
      <div className="bg-red-950/90 border-b border-red-900 text-white text-xs font-bold py-1.5 overflow-hidden flex items-center relative z-50 shrink-0">
        <div className="bg-red-700 px-4 py-1.5 absolute left-0 z-10 flex items-center gap-2 shadow-[0_0_15px_rgba(220,38,38,0.5)]">
          <ShieldAlert size={14} className="animate-pulse" /> LIVE INTEL
        </div>
        <div className="whitespace-nowrap animate-marquee pl-32 flex gap-8 text-red-100/80">
          {alerts.length > 0 ? (
            alerts.map((alert, idx) => (
              <span key={idx}>⚠️ {alert.type}: {alert.location} - {alert.details}</span>
            ))
          ) : (
            <span>🟢 System monitoring active - No critical alerts at this time</span>
          )}
        </div>
      </div>

      {/* --- HEADER --- */}
      <header className="bg-[#1e293b]/90 backdrop-blur-md border-b border-white/5 shrink-0 z-50">
        <div className="max-w-[1920px] mx-auto px-6">
          <div className="flex justify-between items-center h-16">

            {/* LEFT BRAND (ONLY THIS IS VISUALLY UPDATED) */}
            <div className="flex items-center gap-4">

              {/* Logo */}
              <img
                src={idroLogo}
                alt="IDRO Logo"
                className="h-14 w-auto drop-shadow-[0_0_8px_rgba(0,140,255,0.6)]"
              />

              {/* Text */}
              <div className="flex flex-col">
                <div className="flex items-center gap-4">

                  {/* IDRO (Improved font + glow) */}
                  <h1
                    className="
                text-4xl font-extrabold tracking-widest
                bg-gradient-to-b from-white to-slate-300
                bg-clip-text text-transparent
                drop-shadow-[0_0_12px_rgba(0,140,255,0.9)]
              "
                  >
                    IDRO
                  </h1>

                  {/* Full form (bigger) */}
                  <span className="text-2xl  text-yellow-400 font-bold tracking-wide">
                    Intelligent Disaster Resource Optimizer
                  </span>
                </div>

                {/* Tagline unchanged */}
                <p className="text-xs text-slate-300 italic">
                  One Platform To Save Millions Of Life
                </p>
              </div>
            </div>

            {/* RIGHT NAVIGATION (UNCHANGED) */}
            <nav className="hidden md:flex gap-2">
              <Link to="/command" className="flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-all">
                <LayoutDashboard size={14} /> DASHBOARD
              </Link>
              <Link to="/Login" className="flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-all">
                <LayoutDashboard size={14} />Login
              </Link>
              <Link to="/about" className="flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-all">
                <FileText size={14} /> ABOUT
              </Link>
              <button
                onClick={() => setShowDonationModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold text-yellow-400 hover:text-yellow-300 hover:bg-white/5 transition-all border border-yellow-500/30 hover:border-yellow-500"
              >
                ❤️ DONATE NOW
              </button>
            </nav>

          </div>
        </div>
      </header>

      {/* --- STATS BAR --- */}
      <div className="bg-[#1e293b]/50 border-b border-white/5 shrink-0 z-40">
        <div className="max-w-[1920px] mx-auto px-6 py-2 flex justify-between items-center gap-4 text-xs">
          <div className="flex items-center gap-4 text-slate-400 font-mono">
            <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> SYSTEM: ONLINE</span>

          </div>
          <div className="flex gap-6 font-mono">
            <div className="flex items-center gap-2 font-bold text-slate-300"><Users size={14} className="text-blue-500" /> VOLUNTEERS READY</div>
            <div className="flex items-center gap-2 font-bold text-slate-300"><Tent size={14} className="text-orange-500" /> RELIEF CAMPS STANDBY</div>
          </div>
        </div>
      </div>

      {/* --- MAIN DASHBOARD AREA (Fills Remaining Space) --- */}
      <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden z-30 max-w-[1920px] w-full mx-auto">

        {/* TOP CARDS ROW */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
          {/* Card 1: Active Disasters */}
          <div onClick={() => navigate("/active-disasters")}
            className="cursor-pointer bg-[#2a1212] rounded-lg p-4 border border-red-500/30 hover:border-red-500 hover:bg-[#3a1a1a] transition-all group relative overflow-hidden shadow-lg">
            <div className="absolute top-0 right-0 p-3 opacity-10 text-red-500"><TriangleAlert size={60} /></div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-500 text-white rounded-md shadow-[0_0_15px_#ef4444] animate-pulse"><TriangleAlert /></div>
              <div>
                <h3 className="font-bold text-white text-sm uppercase tracking-wider">Active Disasters</h3>
                <p className="text-[10px] text-red-300 font-mono">CLICK TO VIEW ALL</p>
              </div>
            </div>
          </div>
          {/* Card 2: Threats */}
          {/* Card 2: Resources Deployed */}
          <div
            onClick={() => navigate("/impact-analysis")}
            className="cursor-pointer bg-[#2b1a05] rounded-lg p-4 border border-orange-500/30 flex items-center gap-4 hover:border-orange-500 transition-all"
          >  <div className="p-3 bg-orange-500 text-white rounded-md shadow-[0_0_15px_#f97316]">
              <TriangleAlert />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm uppercase tracking-wider">
                Impact Analysis
              </h3>
              <p className="text-[10px] text-orange-300 font-mono">
                AI GENERATED NEEDS
              </p>
            </div>
          </div>


          {/* Card 3: Response Unit - NOW CLICKABLE */}
          <div onClick={() => navigate("/mission-control")} className="cursor-pointer bg-[#2a250f] rounded-lg p-4 border border-yellow-500/30 hover:border-yellow-500 hover:bg-[#3a3318] transition-all group flex items-center gap-4">
            <div className="p-3 bg-yellow-500 text-black rounded-md shadow-[0_0_15px_#eab308]">
              <Siren />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm uppercase tracking-wider">
                Mission Control
              </h3>
              <p className="text-[10px] text-yellow-300 font-mono">
                AI AUTO-ALLOCATION
              </p>
            </div>
          </div>

          {/* Card 4: AI */}
          <div onClick={() => navigate("/deployment-status")} className="cursor-pointer bg-[#102a1c] rounded-lg p-4 border border-green-500/30 flex items-center gap-4 hover:border-green-500 transition-all">
            <div className="p-3 bg-green-300 text-white rounded-md shadow-[0_0_15px_#22c55e]">
              <Truck />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm uppercase tracking-wider">
                Deployment Status
              </h3>
              <p className="text-[10px] text-green-300 font-mono">
                LIVE FIELD TRACKING
              </p>
            </div>
          </div>

        </section>

        {/* BOTTOM SPLIT: MAP (Fills space) + LIST */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">

          {/* --- MAP CONTAINER (9 Cols) --- */}
          <div className="lg:col-span-9 bg-[#1e293b] rounded-xl border border-white/10 shadow-2xl relative overflow-hidden flex flex-col">
            <div className="flex-1 bg-black w-full h-full">
              <MapContainer center={[22.5, 82.0]} zoom={5} className="w-full h-full z-0" zoomControl={false}>
                <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution="Esri" />
                <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}" />
                {alerts.map(alert => (
                  <AlertMarker key={alert.id} alert={alert} />
                ))}
              </MapContainer>
            </div>
          </div>

          {/* --- RIGHT LIST (3 Cols, Internal Scroll) --- */}
          <div className="lg:col-span-3 bg-[#1e293b] rounded-xl border border-white/5 flex flex-col shadow-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-white/5 flex justify-between items-center bg-[#253045]/50 shrink-0">
              <h2 className="font-bold text-slate-200 text-xs uppercase tracking-widest flex items-center gap-2"><Bell size={14} /> Intel Stream</h2>
              <span className="text-[10px] text-blue-400 font-bold animate-pulse">LIVE</span>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
              <div className="p-4 text-center text-slate-500 text-xs italic">
                System on Standby. Sequential Intel Feed offline.
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* --- SOS BUTTON --- */}
      <div className="fixed bottom-8 right-8 z-[90]">
        <button className="bg-red-600 hover:bg-red-700 text-white w-14 h-14 rounded-full shadow-[0_0_30px_rgba(220,38,38,0.6)] flex items-center justify-center animate-bounce-slow transition-transform hover:scale-110 border-2 border-red-400">
          <Phone size={24} className="fill-current" />
        </button>
      </div>

      {/* --- MODAL 1: ACTIVE DISASTERS (FILTERED: Only Disasters, No Deploy Button) --- */}
      {showDisasterModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1e293b] w-full max-w-2xl rounded-2xl border border-white/10 shadow-2xl flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center p-6 border-b border-white/10 bg-red-900/20">
              <h2 className="text-xl font-black text-white tracking-wider flex items-center gap-3">
                <TriangleAlert className="text-red-500" /> ACTIVE DISASTERS
              </h2>
              <button onClick={() => setShowDisasterModal(false)} className="text-slate-400 hover:text-white transition-colors"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {/* Only show CONFIRMED DISASTERS (Trust > 75) */}
              {alerts.filter(a => a.trustScore > 75).length === 0 ? (
                <div className="text-center text-slate-500 py-10">No Confirmed Disasters. Only Pre-Alerts Active.</div>
              ) : (
                alerts.filter(a => a.trustScore > 75).map(alert => (
                  <div key={alert.id} className="bg-[#0f172a] p-4 rounded-xl border border-white/5 hover:border-red-500/50 transition-all flex justify-between items-center group">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-red-600 text-white">
                          {alert.type}
                        </span>
                        <span className="text-xs text-red-400 font-mono font-bold animate-pulse">LIVE INCIDENT</span>
                      </div>
                      <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors">
                        {alert.location}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">{alert.details}</p>
                    </div>
                    {/* NO DEPLOY BUTTON HERE */}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: RESPONSE UNIT DEPLOYMENT (All Missions + Deploy Button) --- */}
      {showResponseModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1e293b] w-full max-w-3xl rounded-2xl border border-white/10 shadow-2xl flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center p-6 border-b border-white/10 bg-orange-900/20">
              <h2 className="text-xl font-black text-white tracking-wider flex items-center gap-3">
                <Truck className="text-orange-500" /> RESPONSE UNIT DEPLOYMENT
              </h2>
              <button onClick={() => setShowResponseModal(false)} className="text-slate-400 hover:text-white transition-colors"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              <p className="text-xs text-slate-400 mb-4 uppercase tracking-widest font-bold">Select Mission for Deployment:</p>


            </div>
          </div>
        </div>
      )}

      {/* --- DONATION MODAL --- */}
      <DonationModal open={showDonationModal} onClose={() => setShowDonationModal(false)} />

    </div>
  );
}