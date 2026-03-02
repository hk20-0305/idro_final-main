import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BlankPage = () => {
    const navigate = useNavigate();

    return (
        <div className="h-screen w-screen bg-[#0f172a] flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0"></div>
            
            <div className="relative z-10 flex flex-col items-center gap-8">
                <div className="w-64 h-64 border border-white/5 bg-white/5 rounded-2xl backdrop-blur-sm flex items-center justify-center">
                    <p className="text-slate-500 font-mono text-sm uppercase tracking-[0.3em] animate-pulse">
                        Blank Module
                    </p>
                </div>

                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all font-bold tracking-widest text-xs"
                >
                    <ArrowLeft size={16} /> RETURN TO DASHBOARD
                </button>
            </div>
        </div>
    );
};

export default BlankPage;
