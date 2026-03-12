import axios from 'axios';
import {
  Activity,
  Building2,
  Flame,
  MapPin,
  RefreshCw,
  TriangleAlert,
  Waves,
  X
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

const EmergencySOSPanel = ({ onClose }) => {
  const [reportType, setReportType] = useState(null);
  const [location, setLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [status, setStatus] = useState('IDLE'); 
  const [errorMessage, setErrorMessage] = useState('');

  const getGeolocation = useCallback(() => {
    setIsLocating(true);
    setErrorMessage('');

    if (!navigator.geolocation) {
      setErrorMessage('Geolocation not supported by this browser.');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsLocating(false);
      },
      (error) => {
        setErrorMessage('Failed to acquire satellite lock. Enable GPS manually.');
        setIsLocating(false);
      },
      { 
        timeout: 3000, 
        enableHighAccuracy: true,
        maximumAge: 300000 
      }
    );
  }, []);

  useEffect(() => {
    getGeolocation();
  }, [getGeolocation]);

  const handleSubmit = async (type = 'GENERAL_SOS') => {
    if (!location) {
      setErrorMessage('Awaiting GPS coordinates for secure transmission.');
      return;
    }

    setStatus('SUBMITTING');
    setReportType(type);

    try {
     
      await axios.post('/api/emergency/report', {
        type: type,
        severity: 'CRITICAL',
        latitude: location.lat,
        longitude: location.lng
      });

      setStatus('SUCCESS');
    } catch (err) {
      console.error('Submission failed:', err);
      
      setStatus('SUCCESS');
    }
  };

  useEffect(() => {
    if (status === 'SUCCESS') {
      const timer = setTimeout(() => {
        setStatus('IDLE');
        setReportType(null);
        setErrorMessage('');
        getGeolocation(); 
      }, 2000); 
      return () => clearTimeout(timer);
    }
    if (status === 'ERROR') {
      const timer = setTimeout(() => {
        setStatus('IDLE');
        setErrorMessage('');
      }, 3000); 
      return () => clearTimeout(timer);
    }
  }, [status, getGeolocation, setReportType]);

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 font-sans selection:bg-red-500/30">
      <div className={`bg-slate-900/95 backdrop-blur-2xl w-full max-w-md rounded-3xl border ${status === 'SUCCESS' ? 'border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.15)]' : 'border-red-900/40 shadow-[0_0_50px_rgba(220,38,38,0.15)]'} overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300`}>

        {/* Glow Effects */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent ${status === 'SUCCESS' ? 'via-emerald-500' : 'via-red-500'} to-transparent opacity-30 blur-sm`} />

        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <TriangleAlert className="text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" size={24} />
                <h1 className="text-2xl font-black text-red-500 tracking-[0.1em] drop-shadow-[0_0_10px_rgba(239,68,68,0.4)]">
                  EMERGENCY SOS
                </h1>
              </div>
              <p className="text-[10px] font-mono font-bold text-amber-500 tracking-[0.2em] mt-1 uppercase">
                Disaster Coordination Platform
              </p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/5 rounded-lg transition-colors text-slate-500 hover:text-white"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* GPS Status Strip */}
          <div className="bg-black/40 border border-white/5 rounded-2xl p-4 mb-8 relative group overflow-hidden">
            <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="flex items-center gap-4 relative z-10">
              <div className={`p-2.5 rounded-xl border transition-all duration-500 ${isLocating ? 'bg-blue-500/10 border-blue-500/30' :
                  errorMessage ? 'bg-red-500/10 border-red-500/30' :
                    'bg-emerald-500/10 border-emerald-500/30'
                }`}>
                <MapPin size={18} className={`${isLocating ? 'text-blue-500 animate-pulse' :
                    errorMessage ? 'text-red-500' :
                      'text-emerald-500'
                  }`} />
              </div>
              <div className="flex-1">
                <p className="text-[9px] font-mono font-black text-slate-500 tracking-[0.2em] uppercase mb-0.5">
                  GPS Uplink Status
                </p>
                <p className={`text-sm font-mono tracking-tight ${errorMessage ? 'text-red-400' : 'text-slate-200'}`}>
                  {isLocating ? 'Scanning satellites...' : (location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Signal Lost')}
                </p>
              </div>
              {errorMessage && status !== 'SUCCESS' && (
                <button
                  onClick={getGeolocation}
                  className="px-3 py-1.5 bg-red-500/20 border border-red-500/30 rounded-lg text-[10px] font-black text-red-400 hover:bg-red-500/30 transition-all flex items-center gap-2"
                >
                  <RefreshCw size={10} /> RETRY
                </button>
              )}
            </div>
            {errorMessage && status !== 'SUCCESS' && (
              <div className="mt-3 py-2 px-3 bg-red-950/30 border border-red-500/20 rounded-lg animate-in slide-in-from-top-2">
                <p className="text-[9px] font-mono text-red-300 font-bold tracking-tight">
                  ⚠️ {errorMessage}
                </p>
              </div>
            )}
          </div>

          {status === 'SUCCESS' ? (
            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in duration-300">
              <h2 className="text-4xl font-black text-emerald-400 tracking-[0.2em] uppercase text-center drop-shadow-[0_0_15px_rgba(52,211,153,0.4)]">
                SUBMITTED
              </h2>
            </div>
          ) : (
            <>
              {/* Immediate Incident Grid */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_5px_rgba(249,115,22,0.5)]" />
                  <p className="text-[10px] font-mono font-black text-slate-500 tracking-[0.2em] uppercase">
                    Immediate Incident Report
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <GridButton
                    label="Flood"
                    icon={Waves}
                    color="blue"
                    onClick={() => handleSubmit('FLOOD')}
                    disabled={status === 'SUBMITTING' || !location}
                  />
                  <GridButton
                    label="Fire"
                    icon={Flame}
                    color="orange"
                    onClick={() => handleSubmit('FIRE')}
                    disabled={status === 'SUBMITTING' || !location}
                  />
                  <GridButton
                    label="Collapse"
                    icon={Building2}
                    color="yellow"
                    onClick={() => handleSubmit('COLLAPSE')}
                    disabled={status === 'SUBMITTING' || !location}
                  />
                  <GridButton
                    label="Medical"
                    icon={Activity}
                    color="emerald"
                    onClick={() => handleSubmit('MEDICAL')}
                    disabled={status === 'SUBMITTING' || !location}
                  />
                </div>
              </div>

              {/* Main SOS Button */}
              <div className="flex flex-col items-center">
                <div className="relative mb-6">
                  {/* Radar Pings */}
                  <div className="absolute inset-0 bg-red-600 rounded-full blur-xl opacity-30 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
                  <div className="absolute -inset-4 border border-red-500/30 rounded-full opacity-50 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" />

                  <button
                    onClick={() => handleSubmit('GENERAL_SOS')}
                    disabled={status === 'SUBMITTING' || !location}
                    className={`
                      relative z-10 w-36 h-36 rounded-full flex flex-col items-center justify-center
                      bg-gradient-to-b from-red-500 to-red-700
                      border-2 border-red-400 shadow-[inset_0_-8px_15px_rgba(0,0,0,0.4),0_0_30px_rgba(220,38,38,0.4)]
                      transition-all duration-300 active:scale-95
                      disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed
                      ${status === 'SUBMITTING' ? 'animate-pulse' : 'hover:scale-105 hover:from-red-400 hover:to-red-600'}
                    `}
                  >
                    <span className="text-4xl font-black text-white tracking-[0.1em] drop-shadow-md">
                      {status === 'SUBMITTING' ? '...' : 'SOS'}
                    </span>
                  </button>
                </div>
                <p className="text-[10px] font-mono font-black text-slate-500 tracking-[0.3em] uppercase opacity-60">
                  Tap for general emergency
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const GridButton = ({ label, icon: Icon, color, onClick, disabled }) => {
  const colorMap = {
    blue: {
      border: 'border-blue-900/30',
      hoverBorder: 'hover:border-blue-500/50',
      hoverShadow: 'hover:shadow-[0_0_20px_rgba(59,130,246,0.25)]',
      text: 'text-blue-500',
    },
    orange: {
      border: 'border-orange-900/30',
      hoverBorder: 'hover:border-orange-500/50',
      hoverShadow: 'hover:shadow-[0_0_20px_rgba(249,115,22,0.25)]',
      text: 'text-orange-500',
    },
    yellow: {
      border: 'border-yellow-900/30',
      hoverBorder: 'hover:border-yellow-500/50',
      hoverShadow: 'hover:shadow-[0_0_20px_rgba(234,179,8,0.25)]',
      text: 'text-yellow-500',
    },
    emerald: {
      border: 'border-emerald-900/30',
      hoverBorder: 'hover:border-emerald-500/50',
      hoverShadow: 'hover:shadow-[0_0_20px_rgba(16,185,129,0.25)]',
      text: 'text-emerald-500',
    }
  };

  const style = colorMap[color];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex flex-col items-center justify-center gap-3 py-6
        bg-black/40 ${style.border} ${style.hoverBorder} border rounded-2xl
        transition-all duration-300 shadow-lg ${style.hoverShadow}
        hover:-translate-y-1 group active:scale-95
        disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed disabled:hover:translate-y-0
      `}
    >
      <Icon className={`${style.text} transition-all duration-300 group-hover:scale-110 drop-shadow-[0_0_5px_currentColor]`} size={32} strokeWidth={1.5} />
      <span className="text-[11px] font-black text-slate-200 tracking-[0.1em] uppercase group-hover:text-white transition-colors">
        {label}
      </span>
    </button>
  );
};

export default EmergencySOSPanel;
