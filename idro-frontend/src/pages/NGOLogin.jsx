import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ngoApi } from "../services/ngoApi";

export default function NGOLogin() {
    const navigate = useNavigate();

    const [ngoId, setNgoId] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!ngoId || !password) {
            setError("Please enter both NGO ID and Password");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await ngoApi.loginNGO(ngoId, password);

            if (response.success) {

                localStorage.setItem("ngoProfile", JSON.stringify(response.ngoProfile));
                localStorage.setItem("ngoId", response.ngoProfile.ngoId);


                navigate("/ngo-dashboard");
            } else {
                setError(response.message || "Login failed");
            }
        } catch (err) {
            setError(typeof err === 'string' ? err : "Invalid NGO ID or Password");
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    };

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 pt-24 md:p-12 md:pt-32 relative">
            <button
                onClick={() => navigate(-1)}
                className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-3 px-5 py-2.5 bg-black/40 hover:bg-black/60 border border-white/10 hover:border-emerald-500/40 rounded-xl backdrop-blur-md transition-all group z-50 text-xs font-bold text-slate-300 hover:text-white shadow-xl"
            >
                <ArrowLeft size={16} className="text-slate-400 group-hover:text-emerald-400 group-hover:-translate-x-1 transition-all" />
                <span className="tracking-widest uppercase">Go Back</span>
            </button>
            <div className="w-full max-w-md">
                <div className="bg-white/[0.02] p-8 rounded-xl border border-white/10 shadow-2xl backdrop-blur-md">
                    <button
                        onClick={() => navigate("/login")}
                        className="text-gray-400 hover:text-white mb-6 flex items-center gap-2 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Login Portal
                    </button>

                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">NGO Login</h2>
                        <p className="text-gray-400 text-sm">Access your NGO dashboard</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-gray-300 text-sm font-semibold mb-2">
                                NGO ID
                            </label>
                            <input
                                type="text"
                                placeholder="Enter NGO ID (e.g., NGO001)"
                                value={ngoId}
                                onChange={(e) => setNgoId(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="w-full p-3 bg-black/40 border border-white/10 rounded text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-300 text-sm font-semibold mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="w-full p-3 bg-black/40 border border-white/10 rounded text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 rounded p-3">
                                <p className="text-red-400 text-sm">{error}</p>
                            </div>
                        )}

                        <button
                            onClick={handleLogin}
                            disabled={loading}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/50 py-3 rounded font-bold text-white transition-all shadow-lg hover:shadow-emerald-500/50"
                        >
                            {loading ? "Logging in..." : "Login to Dashboard"}
                        </button>

                        <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded">
                            <p className="text-emerald-300 text-xs font-semibold mb-2">Demo Accounts:</p>
                            <div className="text-gray-400 text-xs space-y-1">
                                <p>NGO001 - Red Cross India</p>
                                <p>NGO002 - Care India</p>
                                <p>NGO003 - Oxfam India</p>
                                <p>NGO004 - Save the Children</p>
                                <p>NGO005 - Goonj</p>
                                <p className="text-emerald-300 mt-2">Password: <span className="font-mono">demo123</span></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
