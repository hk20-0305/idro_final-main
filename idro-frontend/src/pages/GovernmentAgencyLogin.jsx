import axios from "axios";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function GovernmentAgencyLogin() {
    const [agencyType, setAgencyType] = useState("");
    const [agencyId, setAgencyId] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const agencyTypes = [
        { value: "NDRF", label: "NDRF" },
        { value: "MEDICAL_TEAM", label: "Medical Team" },
        { value: "FIRE_TEAM", label: "Fire Team" },
        { value: "OTHER", label: "Others" }
    ];

    const handleLogin = async () => {
        if (!agencyType || !agencyId || !password) {
            setError("Please fill all fields");
            return;
        }

        try {
            const response = await axios.post("http://localhost:8085/api/government/login", {
                agencyId,
                password
            });

            if (response.data.success) {
                localStorage.setItem("governmentAgency", JSON.stringify(response.data.agency));
                navigate("/government-dashboard");
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            console.error("Login failed:", err);
            setError("Login failed. Please check your credentials.");
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

                    <div className="text-center mb-8">
                        <div className="inline-block p-4 bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-900/50 mb-4">
                            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-wider uppercase">Government Agency</h1>
                        <p className="text-emerald-300 text-sm font-mono mt-2">OFFICIAL ACCESS PORTAL</p>
                    </div>


                    <h2 className="text-xl font-bold text-white mb-6">Agency Login</h2>


                    <div className="mb-4">
                        <label className="block text-gray-300 text-sm font-semibold mb-2">
                            Agency Type
                        </label>
                        <select
                            value={agencyType}
                            onChange={(e) => setAgencyType(e.target.value)}
                            className="w-full p-3 bg-black/40 border border-white/10 rounded text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                        >
                            <option value="" disabled>-- Select Agency Type --</option>
                            {agencyTypes.map((type) => (
                                <option key={type.value} value={type.value} className="bg-slate-800">
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>


                    <div className="mb-4">
                        <label className="block text-gray-300 text-sm font-semibold mb-2">
                            Agency ID
                        </label>
                        <input
                            type="text"
                            placeholder="Enter Agency ID"
                            value={agencyId}
                            onChange={(e) => setAgencyId(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="w-full p-3 bg-black/40 border border-white/10 rounded text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                        />
                    </div>


                    <div className="mb-6">
                        <label className="block text-gray-300 text-sm font-semibold mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            placeholder="Enter Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="w-full p-3 bg-black/40 border border-white/10 rounded text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                        />
                    </div>


                    {error && (
                        <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded text-red-300 text-sm">
                            {error}
                        </div>
                    )}


                    <button
                        onClick={handleLogin}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/50 py-3 rounded font-bold text-white transition-all shadow-lg hover:shadow-emerald-500/50"
                    >
                        Login as Government Agency
                    </button>


                    <button
                        onClick={() => navigate("/login")}
                        className="w-full mt-4 text-gray-400 hover:text-white text-sm transition-colors"
                    >
                        ← Back to Login Selection
                    </button>
                </div>


                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-500">
                        🔒 Secure Government Access
                    </p>
                </div>
            </div>
        </div>
    );
}
