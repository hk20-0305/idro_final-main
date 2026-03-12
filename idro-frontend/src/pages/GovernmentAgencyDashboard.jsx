import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function GovernmentAgencyDashboard() {
    const navigate = useNavigate();
    const [agencyProfile, setAgencyProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    const [resources, setResources] = useState({});
    const [availabilityStatus, setAvailabilityStatus] = useState("AVAILABLE");
    const [responseTime, setResponseTime] = useState("IMMEDIATE");
    const [coverageRadius, setCoverageRadius] = useState("DISTRICT_WIDE");

    useEffect(() => {
        const storedAgency = localStorage.getItem("governmentAgency");

        if (!storedAgency) {
            navigate("/government-login");
            return;
        }

        const profile = JSON.parse(storedAgency);
        setAgencyProfile(profile);
        setResources(profile.resources || {});
        setAvailabilityStatus(profile.availabilityStatus || "AVAILABLE");
        setResponseTime(profile.responseTime || "IMMEDIATE");
        setCoverageRadius(profile.coverageRadius || "DISTRICT_WIDE");

        setLoading(false);
    }, [navigate]);

    const handleResourceChange = (category, index, field, value) => {
        setResources(prev => {
            const categoryResources = [...(prev[category] || [])];
            if (!categoryResources[index]) {
                categoryResources[index] = { name: "", available: false, quantity: 0 };
            }
            categoryResources[index] = {
                ...categoryResources[index],
                [field]: field === 'quantity' ? parseInt(value) || 0 : value
            };
            return {
                ...prev,
                [category]: categoryResources
            };
        });
    };

    const handleUpdateResources = async () => {
        setUpdating(true);
        setMessage({ type: "", text: "" });

        try {
            const response = await axios.put(
                `http://localhost:8085/api/government/${agencyProfile.agencyId}/resources`,
                resources
            );

            localStorage.setItem("governmentAgency", JSON.stringify(response.data));
            setAgencyProfile(response.data);

            setMessage({ type: "success", text: "Resources updated successfully!" });
            setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        } catch (error) {
            setMessage({ type: "error", text: "Failed to update resources. Please try again." });
        } finally {
            setUpdating(false);
        }
    };

    const handleUpdateAvailability = async () => {
        setUpdating(true);
        setMessage({ type: "", text: "" });

        try {
            const response = await axios.put(
                `http://localhost:8085/api/government/${agencyProfile.agencyId}/availability`,
                {
                    availabilityStatus,
                    responseTime,
                    coverageRadius
                }
            );

            localStorage.setItem("governmentAgency", JSON.stringify(response.data));
            setAgencyProfile(response.data);

            setMessage({ type: "success", text: "Availability updated successfully!" });
            setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        } catch (error) {
            setMessage({ type: "error", text: "Failed to update availability. Please try again." });
        } finally {
            setUpdating(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("governmentAgency");
        navigate("/government-login");
    };

    const handleMarkEmergencyReady = async () => {
        setUpdating(true);
        setMessage({ type: "", text: "" });

        try {
            const response = await axios.put(
                `http://localhost:8085/api/government/${agencyProfile.agencyId}/availability`,
                {
                    availabilityStatus: "AVAILABLE",
                    responseTime: "IMMEDIATE",
                    coverageRadius: coverageRadius
                }
            );

            setAvailabilityStatus("AVAILABLE");
            setResponseTime("IMMEDIATE");

            localStorage.setItem("governmentAgency", JSON.stringify(response.data));
            setAgencyProfile(response.data);

            setMessage({ type: "success", text: "Marked as Emergency Ready!" });
            setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        } catch (error) {
            setMessage({ type: "error", text: "Failed to update status. Please try again." });
        } finally {
            setUpdating(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "AVAILABLE": return "bg-green-500";
            case "LIMITED": return "bg-yellow-500";
            case "NOT_AVAILABLE": return "bg-red-500";
            default: return "bg-gray-500";
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case "AVAILABLE": return "Available";
            case "LIMITED": return "Limited";
            case "NOT_AVAILABLE": return "Not Available";
            default: return status;
        }
    };

    const formatResponseTime = (time) => {
        switch (time) {
            case "IMMEDIATE": return "Immediate";
            case "SIX_HOURS": return "6 Hours";
            case "TWELVE_HOURS": return "12 Hours";
            case "TWENTY_FOUR_HOURS": return "24 Hours";
            default: return time;
        }
    };

    const formatCoverage = (coverage) => {
        switch (coverage) {
            case "FIVE_KM": return "5 km";
            case "TEN_KM": return "10 km";
            case "DISTRICT_WIDE": return "District-wide";
            case "STATE_WIDE": return "State-wide";
            default: return coverage;
        }
    };

    const formatLastUpdated = (dateString) => {
        if (!dateString) return "Never";
        const date = new Date(dateString);
        return date.toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
    };

    const formatAgencyType = (type) => {
        switch (type) {
            case "NDRF": return "NDRF";
            case "MEDICAL_TEAM": return "Medical Team";
            case "FIRE_TEAM": return "Fire Team";
            case "OTHER": return "Others";
            default: return type;
        }
    };


    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-emerald-400 text-xl font-mono animate-pulse">Establishing Secure Connection...</div>
            </div>
        );
    }

    if (!agencyProfile) {
        return null;
    }

    return (
        <div className="min-h-screen bg-black p-6">
            <div className="max-w-7xl mx-auto">
                <div className="bg-gradient-to-r from-emerald-900/20 to-black border border-white/10 rounded-xl p-6 mb-6 shadow-xl backdrop-blur-md">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-4xl font-bold text-white tracking-tight">{agencyProfile.agencyName}</h1>
                                <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/50 rounded-full text-emerald-400 text-xs font-semibold">
                                    {formatAgencyType(agencyProfile.agencyType)}
                                </span>
                            </div>
                            <div className="flex items-center gap-6 text-gray-300">
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span>{agencyProfile.location}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <span>{agencyProfile.contactNumber}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className={`px-4 py-2 ${getStatusColor(availabilityStatus)} rounded-lg text-white font-bold shadow-lg`}>
                                {getStatusText(availabilityStatus)}
                            </div>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white font-semibold transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>

                {message.text && (
                    <div className={`mb-6 p-4 rounded-lg border ${message.type === 'success'
                        ? 'bg-green-500/10 border-green-500/50 text-green-300'
                        : 'bg-red-500/10 border-red-500/50 text-red-300'
                        }`}>
                        {message.text}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white/[0.02] border border-white/10 rounded-xl p-6 shadow-xl backdrop-blur-sm">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Agency Overview
                            </h2>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <p className="text-gray-400">Agency ID</p>
                                    <p className="text-white font-semibold">{agencyProfile.agencyId}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400">Operating Region</p>
                                    <p className="text-white font-semibold">{agencyProfile.operatingRegion}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 mb-2">Supported Disaster Types</p>
                                    <div className="flex flex-wrap gap-2">
                                        {agencyProfile.supportedDisasterTypes?.map((type, index) => (
                                            <span key={index} className="px-2 py-1 bg-blue-500/20 border border-blue-500/50 rounded text-blue-300 text-xs">
                                                {type}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/[0.02] border border-white/10 rounded-xl p-6 shadow-xl backdrop-blur-sm">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Availability Status
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-gray-300 text-sm font-semibold mb-2">Status</label>
                                    <select
                                        value={availabilityStatus}
                                        onChange={(e) => setAvailabilityStatus(e.target.value)}
                                        className="w-full p-3 bg-black/40 border border-white/10 rounded text-white focus:outline-none focus:border-emerald-500"
                                    >
                                        <option value="AVAILABLE">Available</option>
                                        <option value="LIMITED">Limited</option>
                                        <option value="NOT_AVAILABLE">Not Available</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-300 text-sm font-semibold mb-2">Response Time</label>
                                    <select
                                        value={responseTime}
                                        onChange={(e) => setResponseTime(e.target.value)}
                                        className="w-full p-3 bg-black/40 border border-white/10 rounded text-white focus:outline-none focus:border-emerald-500"
                                    >
                                        <option value="IMMEDIATE">Immediate</option>
                                        <option value="SIX_HOURS">6 Hours</option>
                                        <option value="TWELVE_HOURS">12 Hours</option>
                                        <option value="TWENTY_FOUR_HOURS">24 Hours</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-300 text-sm font-semibold mb-2">Coverage Radius</label>
                                    <select
                                        value={coverageRadius}
                                        onChange={(e) => setCoverageRadius(e.target.value)}
                                        className="w-full p-3 bg-black/40 border border-white/10 rounded text-white focus:outline-none focus:border-emerald-500"
                                    >
                                        <option value="FIVE_KM">5 km</option>
                                        <option value="TEN_KM">10 km</option>
                                        <option value="DISTRICT_WIDE">District-wide</option>
                                        <option value="STATE_WIDE">State-wide</option>
                                    </select>
                                </div>
                                <button
                                    onClick={handleUpdateAvailability}
                                    disabled={updating}
                                    className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/50 py-3 px-6 rounded-lg font-bold text-white transition-all shadow-lg shadow-emerald-500/20"
                                >
                                    {updating ? "Updating..." : "Update Availability"}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        {agencyProfile.agencyType === "NDRF" && (
                            <div className="bg-[#1e293b] border border-white/10 rounded-xl p-6 shadow-xl">
                                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <span className="text-2xl">🚨</span>
                                    NDRF Resources
                                </h2>
                                <div className="space-y-3">
                                    {["Rescue Personnel", "Boats", "Rescue Vehicles", "Diving Teams", "Heavy Equipment"].map((resourceName, index) => (
                                        <ResourceCheckbox key={index} category="NDRF_RESOURCES" resourceName={resourceName} resources={resources} setResources={setResources} />
                                    ))}
                                </div>
                            </div>
                        )}
                        {agencyProfile.agencyType === "MEDICAL_TEAM" && (
                            <div className="bg-[#1e293b] border border-white/10 rounded-xl p-6 shadow-xl">
                                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <span className="text-2xl">⚕️</span>
                                    Medical Team Resources
                                </h2>
                                <div className="space-y-3">
                                    {["Doctors", "Nurses", "Ambulances", "First Aid Kits", "Mobile Medical Units"].map((resourceName, index) => (
                                        <ResourceCheckbox key={index} category="MEDICAL_RESOURCES" resourceName={resourceName} resources={resources} setResources={setResources} />
                                    ))}
                                </div>
                            </div>
                        )}
                        {agencyProfile.agencyType === "FIRE_TEAM" && (
                            <div className="bg-[#1e293b] border border-white/10 rounded-xl p-6 shadow-xl">
                                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <span className="text-2xl">🚒</span>
                                    Fire Team Resources
                                </h2>
                                <div className="space-y-3">
                                    {["Fire Engines", "Firefighters", "Hydraulic Cutters", "Ladders", "Foam Units"].map((resourceName, index) => (
                                        <ResourceCheckbox key={index} category="FIRE_RESOURCES" resourceName={resourceName} resources={resources} setResources={setResources} />
                                    ))}
                                </div>
                            </div>
                        )}
                        {agencyProfile.agencyType === "OTHER" && (
                            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-6 shadow-xl backdrop-blur-sm">
                                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <span className="text-2xl">👮</span>
                                    Other Resources
                                </h2>
                                <div className="space-y-3">
                                    {["Police Personnel", "Traffic Control Units", "Crowd Management Teams"].map((resourceName, index) => (
                                        <ResourceCheckbox key={index} category="OTHER_RESOURCES" resourceName={resourceName} resources={resources} setResources={setResources} />
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="bg-white/[0.02] border border-white/10 rounded-xl p-6 shadow-xl backdrop-blur-sm">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={handleUpdateResources}
                                    disabled={updating}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/50 py-3 px-6 rounded-lg font-bold text-white transition-all shadow-lg hover:shadow-emerald-500/50"
                                >
                                    {updating ? "Updating..." : "Update Resources"}
                                </button>
                                <button
                                    onClick={handleMarkEmergencyReady}
                                    disabled={updating}
                                    className="flex-1 bg-green-600 hover:bg-green-500 disabled:bg-green-600/50 py-3 px-6 rounded-lg font-bold text-white transition-all shadow-lg hover:shadow-green-500/50"
                                >
                                    Mark Emergency Ready
                                </button>
                            </div>
                            <div className="mt-4 text-center text-gray-400 text-sm">
                                Last Updated: <span className="text-white font-semibold">{formatLastUpdated(agencyProfile.lastUpdated)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const ResourceCheckbox = ({ category, resourceName, resources, setResources }) => {
    const categoryResources = resources[category] || [];
    const resource = categoryResources.find(r => r.name === resourceName) || { name: resourceName, available: false, quantity: 0 };

    const handleCheckboxChange = (checked) => {
        setResources(prev => {
            const currentCategoryResources = [...(prev[category] || [])];
            const existingIndex = currentCategoryResources.findIndex(r => r.name === resourceName);

            if (existingIndex >= 0) {
                currentCategoryResources[existingIndex] = {
                    ...currentCategoryResources[existingIndex],
                    available: checked
                };
            } else {
                currentCategoryResources.push({ name: resourceName, available: checked, quantity: 0 });
            }

            return {
                ...prev,
                [category]: currentCategoryResources
            };
        });
    };

    const handleQuantityChange = (value) => {
        setResources(prev => {
            const currentCategoryResources = [...(prev[category] || [])];
            const existingIndex = currentCategoryResources.findIndex(r => r.name === resourceName);

            const newValue = value === '' ? '' : parseInt(value) || 0;

            if (existingIndex >= 0) {
                currentCategoryResources[existingIndex] = {
                    ...currentCategoryResources[existingIndex],
                    quantity: newValue
                };
            } else {
                currentCategoryResources.push({ name: resourceName, available: false, quantity: newValue });
            }

            return {
                ...prev,
                [category]: currentCategoryResources
            };
        });
    };

    return (
        <div className="flex items-center gap-3 p-3 bg-black/20 rounded border border-white/5 hover:border-white/10 transition-colors">
            <input
                type="checkbox"
                checked={resource.available || false}
                onChange={(e) => handleCheckboxChange(e.target.checked)}
                className="w-5 h-5 rounded border-white/20 bg-black/40 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-0 cursor-pointer"
            />
            <div className="flex-1">
                <label className="text-white font-medium text-sm">{resourceName}</label>
            </div>
            <input
                type="number"
                min="0"
                value={resource.quantity || 0}
                onChange={(e) => handleQuantityChange(e.target.value)}
                disabled={!resource.available}
                className="w-24 px-3 py-1.5 bg-black/40 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Qty"
            />
        </div>
    );
};
