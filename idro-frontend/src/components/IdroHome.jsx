import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from "react-router-dom";
import idroLogo from '../assets/logo.png';
import DonationModal from './DonationModal';
import EmergencySOSPanel from './EmergencySOSPanel';

import {
  Bell,
  FileText,
  LogIn,
  Phone,
  ShieldAlert,
  Siren,
  TriangleAlert,
  Truck,
  X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Circle, MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { fetchGdacsStream, fetchMarkers, fetchUsgsStream } from '../api/intelApi';
import { idroApi } from '../services/api';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

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
        <div className="p-2 bg-black/90 text-white rounded border border-white/10 backdrop-blur-md">
          <h3 className="text-sm font-black text-white mb-1 border-b border-white/10 pb-1">
            {locationName}
          </h3>
          <strong className="uppercase text-emerald-400 text-xs block mb-1">{alert.type}</strong>
          <p className="text-[10px] text-slate-400 mb-2">{alert.details}</p>
        </div>
      </Popup>

      {alert.missionStatus === 'OPEN' && <Circle center={[alert.latitude, alert.longitude]} radius={60000} pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.1, weight: 1 }} />}
    </Marker>
  );
};

const typeMap = {
  EQ: "Earthquake",
  TC: "Tropical Cyclone",
  FL: "Flood",
  VO: "Volcano",
  DR: "Drought",
  WF: "Wildfire"
};

const IntelStreamItem = ({ item }) => {
  const [locationName, setLocationName] = useState("India");
  const displayType = typeMap[item.type] || item.type;

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${item.latitude}&lon=${item.longitude}`);
        const addr = res.data.address;
        const city = addr.city || addr.town || addr.village || addr.county || "";
        const state = addr.state || "";
        if (city && state) {
          setLocationName(`${city}, ${state}`);
        } else if (state) {
          setLocationName(`${state}, India`);
        } else {
          setLocationName("India");
        }
      } catch (e) {
        setLocationName("India");
      }
    };
    fetchLocation();
  }, [item.latitude, item.longitude]);

  return (
    <div className="p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
      <div className="flex justify-between items-start mb-1">
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${item.severity === 'Red' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'}`}>
          {displayType}
        </span>
        <span className="text-[9px] text-slate-500 font-mono">
          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      <h4 className="text-xs font-bold text-white mb-0.5">{locationName}</h4>
      <div className="flex justify-between items-end">
        <p className="text-[9px] text-slate-400 font-mono">
          {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
        </p>
        <span className={`text-[9px] font-bold ${item.severity === 'Red' ? 'text-red-400' : 'text-orange-400'}`}>
          {item.severity} Alert
        </span>
      </div>
    </div>
  );
};

export default function IdroHome() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [showDisasterModal, setShowDisasterModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [showSOSPanel, setShowSOSPanel] = useState(false);
  const [intelMarkers, setIntelMarkers] = useState([]);
  const [gdacsStream, setGdacsStream] = useState([]);
  const [usgsStream, setUsgsStream] = useState([]);

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

  useEffect(() => {
    const fetchIntelData = async () => {
      try {
        const [markersRes] = await Promise.all([
          fetchMarkers()
        ]);
        setIntelMarkers(markersRes.data || []);
      } catch (err) {
        console.error("Intel API Error", err);
      }
    };
    fetchIntelData();
    const interval = setInterval(fetchIntelData, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchGdacsData = async () => {
      try {
        const res = await fetchGdacsStream();
        setGdacsStream(res.data || []);
      } catch (err) {
        console.error("GDACS Stream Error", err);
      }
    };
    fetchGdacsData();
    const interval = setInterval(fetchGdacsData, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchUsgsData = async () => {
      try {
        const res = await fetchUsgsStream();
        setUsgsStream(res.data || []);
      } catch (err) {
        console.error("USGS API Error", err);
      }
    };
    fetchUsgsData();
    const interval = setInterval(fetchUsgsData, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen w-screen bg-[#000000] font-sans text-slate-200 flex flex-col overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[100%] h-[100%] bg-[radial-gradient(circle,rgba(5,150,105,0.15)_0%,transparent_70%)] blur-[80px]"></div>
        <div className="absolute -bottom-[20%] -right-[10%] w-[100%] h-[100%] bg-[radial-gradient(circle,rgba(29,78,216,0.15)_0%,transparent_70%)] blur-[80px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[radial-gradient(circle,rgba(13,148,136,0.05)_0%,transparent_60%)] blur-[100px]"></div>

        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:80px_80px]"></div>
      </div>

      <div className="bg-red-950/40 backdrop-blur-md border-b border-red-900/30 text-white text-xs font-bold py-1.5 overflow-hidden flex items-center relative z-50 shrink-0">
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

      <header className="bg-black/20 backdrop-blur-xl border-b border-white/5 shrink-0 z-50">
        <div className="max-w-[1920px] mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <img
                src={idroLogo}
                alt="IDRO Logo"
                className="h-14 w-auto drop-shadow-[0_0_8px_rgba(0,140,255,0.6)]"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-4">
                  <h1
                    className="
                text-4xl font-black tracking-[0.15em]
                bg-gradient-to-b from-amber-200 via-yellow-400 to-amber-600
                bg-clip-text text-transparent
                drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]
                filter saturate-150 contrast-125
              "
                  >
                    IDRO
                  </h1>
                  <span className="text-3xl text-white font-black tracking-tight uppercase">
                    Intelligent Disaster Resource Optimizer
                  </span>
                </div>
                <p className="text-xs text-slate-300 italic">
                  One Platform To Save Millions Of Life
                </p>
              </div>
            </div>
            <nav className="hidden md:flex gap-4 items-center">
              <Link
                to="/Login"
                className="flex items-center gap-2 px-6 py-2.5 rounded-full text-[11px] font-black tracking-[0.12em] text-slate-200 border border-white/20 hover:bg-white/10 hover:border-white/40 transition-all duration-300 group"
              >
                <LogIn size={13} className="group-hover:translate-x-1 transition-transform" /> LOGIN
              </Link>
              <Link
                to="/about"
                className="flex items-center gap-2 px-6 py-2.5 rounded-full text-[11px] font-black tracking-[0.12em] text-slate-200 border border-white/20 hover:bg-white/10 hover:border-white/40 transition-all duration-300 group"
              >
                <FileText size={13} className="group-hover:-translate-y-0.5 transition-transform" /> ABOUT
              </Link>
              <button
                onClick={() => setShowDonationModal(true)}
                className="flex items-center gap-2 px-6 py-2 rounded-full text-[11px] font-black tracking-[0.2em] text-yellow-400 border-2 border-yellow-500/40 hover:bg-yellow-500/10 hover:border-yellow-500 transition-all duration-300 shadow-[0_0_20px_rgba(234,179,8,0.2)] hover:scale-105"
              >
                <span className="text-sm">❤️</span> DONATE NOW
              </button>
            </nav>
          </div>
        </div>
      </header>

      <div className="border-b border-dotted border-white/40 w-full shrink-0 z-40"></div>

      <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden z-30 max-w-[1920px] w-full mx-auto">
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
          <div onClick={() => navigate("/active-disasters")}
            className="cursor-pointer bg-[#2a1212]/40 backdrop-blur-md rounded-lg p-4 border border-red-500/60 hover:border-red-400 hover:bg-[#3a1a1a]/60 transition-all group relative overflow-hidden shadow-lg">
            <div className="absolute top-0 right-0 p-3 opacity-10 text-red-500"><TriangleAlert size={60} /></div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-500 text-white rounded-md shadow-[0_0_15px_#ef4444] animate-pulse"><TriangleAlert /></div>
              <div>
                <h3 className="font-bold text-white text-sm uppercase tracking-wider">Active Disasters</h3>
                <p className="text-[10px] text-red-300 font-mono">CLICK TO VIEW ALL</p>
              </div>
            </div>
          </div>
          <div
            onClick={() => navigate("/impact-analysis")}
            className="cursor-pointer bg-[#2b1a05]/40 backdrop-blur-md rounded-lg p-4 border border-orange-500/60 flex items-center gap-4 hover:border-orange-400 transition-all"
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

          <div onClick={() => navigate("/mission-control")} className="cursor-pointer bg-[#2a250f]/40 backdrop-blur-md rounded-lg p-4 border border-yellow-500/60 hover:border-yellow-400 hover:bg-[#3a3318]/60 transition-all group flex items-center gap-4">
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

          <div onClick={() => navigate("/deployment-status")} className="cursor-pointer bg-[#102a1c]/40 backdrop-blur-md rounded-lg p-4 border border-green-500/60 flex items-center gap-4 hover:border-green-400 transition-all">
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

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">

          <div className="lg:col-span-9 bg-black/10 backdrop-blur-sm rounded-xl border border-white/20 shadow-2xl relative overflow-hidden flex flex-col">
            <div className="flex-1 bg-black/20 w-full h-full">
              <MapContainer center={[22.5, 82.0]} zoom={5} className="w-full h-full z-0" zoomControl={false}>
                <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution="Esri" />
                <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}" />
                {alerts.map(alert => (
                  <AlertMarker key={alert.id} alert={alert} />
                ))}
                {intelMarkers.map(m => (
                  <Marker key={m.id} position={[m.latitude, m.longitude]} icon={getIcon('INTEL', 'INTEL', m.severity === 'Red' ? 100 : 50)}>
                    <Popup className="custom-popup-dark">
                      <div className="p-2 bg-black/90 text-white rounded border border-white/10 backdrop-blur-md">
                        <h3 className="text-sm font-black text-white mb-1 border-b border-white/10 pb-1">
                          Intel Alert
                        </h3>
                        <strong className="uppercase text-emerald-400 text-xs block mb-1">Severity: {m.severity}</strong>
                        <p className="text-[10px] text-slate-400 mb-2">Satellite/Global Feed Detection</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>

          <div className="lg:col-span-3 bg-white/5 backdrop-blur-md rounded-xl border border-white/20 flex flex-col shadow-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-white/5 flex justify-between items-center bg-white/[0.05] shrink-0">
              <h2 className="font-bold text-slate-200 text-xs uppercase tracking-widest flex items-center gap-2"><Bell size={14} /> Intel Stream</h2>
              <span className="text-[10px] text-emerald-400 font-bold animate-pulse">LIVE</span>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">

              <div className="px-2 pt-3">
                <div className="flex items-center gap-2 mb-2 px-1">
                  <div className="flex items-center gap-1.5 bg-blue-500/15 border border-blue-500/40 rounded-full px-3 py-1">
                    <span className="text-blue-400 text-xs">🛰</span>
                    <span className="text-[11px] font-black tracking-widest uppercase text-blue-300">GDACS</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {gdacsStream.length > 0 ? (
                    gdacsStream.map((item, idx) => (
                      <IntelStreamItem key={idx} item={item} />
                    ))
                  ) : (
                    <div className="p-3 text-center text-slate-500 text-xs italic">
                      No active GDACS alerts for India.
                    </div>
                  )}
                </div>
              </div>

              <div className="px-2 pt-3 pb-2">
                <div className="flex items-center gap-2 mb-2 px-1">
                  <div className="flex items-center gap-1.5 bg-orange-500/15 border border-orange-500/40 rounded-full px-3 py-1">
                    <span className="text-orange-400 text-xs">⚡</span>
                    <span className="text-[11px] font-black tracking-widests uppercase text-orange-300">USGS</span>
                  </div>
                  <div className="flex-1 h-px bg-orange-500/30"></div>
                  <span className="text-[9px] text-orange-400/70 font-mono uppercase tracking-wider">Earthquake</span>
                </div>
                <div className="space-y-2">
                  {usgsStream.length > 0 ? (
                    usgsStream.map((item, idx) => (
                      <IntelStreamItem key={`usgs-${idx}`} item={item} />
                    ))
                  ) : (
                    <div className="p-3 text-center text-slate-500 text-xs italic">
                      Awaiting USGS earthquake data...
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      <div className="fixed bottom-8 right-8 z-[90]">
        <button 
          onClick={() => setShowSOSPanel(true)}
          className="bg-red-600 hover:bg-red-700 text-white w-14 h-14 rounded-full shadow-[0_0_30px_rgba(220,38,38,0.6)] flex items-center justify-center animate-bounce-slow transition-transform hover:scale-110 border-2 border-red-400"
        >
          <Phone size={24} className="fill-current" />
        </button>
      </div>

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

                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

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

      <DonationModal open={showDonationModal} onClose={() => setShowDonationModal(false)} />
      
      {showSOSPanel && <EmergencySOSPanel onClose={() => setShowSOSPanel(false)} />}

    </div>
  );
}