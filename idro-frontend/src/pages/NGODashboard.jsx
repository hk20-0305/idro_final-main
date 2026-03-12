import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ngoApi } from "../services/ngoApi";

export default function NGODashboard() {
    const navigate = useNavigate();
    const [ngoProfile, setNgoProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });


    const [reliefSupplies, setReliefSupplies] = useState({});
    const [medicalSupport, setMedicalSupport] = useState({});
    const [shelterEssentials, setShelterEssentials] = useState({});
    const [humanResources, setHumanResources] = useState({});


    const [availabilityStatus, setAvailabilityStatus] = useState("AVAILABLE");
    const [responseTime, setResponseTime] = useState("IMMEDIATE");
    const [coverageRadius, setCoverageRadius] = useState("DISTRICT_WIDE");
    const [additionalNotes, setAdditionalNotes] = useState("");

    useEffect(() => {

        const storedProfile = localStorage.getItem("ngoProfile");
        const storedNgoId = localStorage.getItem("ngoId");

        if (!storedProfile || !storedNgoId) {
            navigate("/ngo-login");
            return;
        }

        const profile = JSON.parse(storedProfile);
        setNgoProfile(profile);


        setReliefSupplies(profile.reliefSupplies || {});
        setMedicalSupport(profile.medicalSupport || {});
        setShelterEssentials(profile.shelterEssentials || {});
        setHumanResources(profile.humanResources || {});

        setAvailabilityStatus(profile.availabilityStatus || "AVAILABLE");
        setResponseTime(profile.responseTime || "IMMEDIATE");
        setCoverageRadius(profile.coverageRadius || "DISTRICT_WIDE");
        setAdditionalNotes(profile.additionalNotes || "");

        setLoading(false);
    }, [navigate]);

    const handleResourceChange = (category, resourceKey, field, value) => {
        const setters = {
            relief: setReliefSupplies,
            medical: setMedicalSupport,
            shelter: setShelterEssentials,
            human: setHumanResources
        };

        const setter = setters[category];
        setter(prev => ({
            ...prev,
            [resourceKey]: {
                ...prev[resourceKey],
                [field]: field === 'quantity' ? (value === '' ? '' : parseInt(value) || 0) : value
            }
        }));
    };

    const handleUpdateResources = async () => {
        setUpdating(true);
        setMessage({ type: "", text: "" });

        try {
            const updatedProfile = await ngoApi.updateResources({
                ngoId: ngoProfile.ngoId,
                reliefSupplies,
                medicalSupport,
                shelterEssentials,
                humanResources,
                additionalNotes
            });


            const finalProfile = await ngoApi.updateAvailability({
                ngoId: ngoProfile.ngoId,
                availabilityStatus,
                responseTime,
                coverageRadius
            });

            localStorage.setItem("ngoProfile", JSON.stringify(finalProfile));
            setNgoProfile(finalProfile);

            setMessage({ type: "success", text: "Resources updated successfully!" });


            setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        } catch (error) {
            setMessage({ type: "error", text: "Failed to update resources. Please try again." });
        } finally {
            setUpdating(false);
        }
    };

    const handleMarkEmergencyReady = async () => {
        setUpdating(true);
        setMessage({ type: "", text: "" });

        try {
            const updatedProfile = await ngoApi.updateAvailability({
                ngoId: ngoProfile.ngoId,
                availabilityStatus: "AVAILABLE",
                responseTime: "IMMEDIATE",
                coverageRadius: coverageRadius
            });

            setAvailabilityStatus("AVAILABLE");
            setResponseTime("IMMEDIATE");

            localStorage.setItem("ngoProfile", JSON.stringify(updatedProfile));
            setNgoProfile(updatedProfile);

            setMessage({ type: "success", text: "Marked as Emergency Ready!" });
            setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        } catch (error) {
            setMessage({ type: "error", text: "Failed to update status. Please try again." });
        } finally {
            setUpdating(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("ngoProfile");
        localStorage.removeItem("ngoId");
        navigate("/login");
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


    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-emerald-400 text-xl font-mono animate-pulse">Establishing Secure Connection...</div>
            </div>
        );
    }

    if (!ngoProfile) {
        return null;
    }

    return (
        <div className="min-h-screen bg-black p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-emerald-900/20 to-black border border-white/10 rounded-xl p-6 mb-6 shadow-xl backdrop-blur-md">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-4xl font-bold text-white tracking-tight">{ngoProfile.ngoName}</h1>
                                <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/50 rounded-full text-emerald-400 text-xs font-semibold">
                                    Demo Account
                                </span>
                            </div>
                            <div className="flex items-center gap-6 text-gray-300">
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span>{ngoProfile.city}, {ngoProfile.state}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <span>{ngoProfile.contactNumber}</span>
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

                {/* Message Display */}
                {message.text && (
                    <div className={`mb-6 p-4 rounded-lg border ${message.type === 'success'
                        ? 'bg-green-500/10 border-green-500/50 text-green-300'
                        : 'bg-red-500/10 border-red-500/50 text-red-300'
                        }`}>
                        {message.text}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Overview */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Overview Card */}
                        <div className="bg-white/[0.02] border border-white/10 rounded-xl p-6 shadow-xl backdrop-blur-sm">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                NGO Overview
                            </h2>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <p className="text-gray-400">Registration ID</p>
                                    <p className="text-white font-semibold">{ngoProfile.registrationId}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400">Operating Region</p>
                                    <p className="text-white font-semibold">{ngoProfile.operatingRegion}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 mb-2">Supported Disaster Types</p>
                                    <div className="flex flex-wrap gap-2">
                                        {ngoProfile.supportedDisasterTypes?.map((type, index) => (
                                            <span key={index} className="px-2 py-1 bg-purple-500/20 border border-purple-500/50 rounded text-purple-300 text-xs">
                                                {type}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Availability Section */}
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
                                        className="w-full p-3 bg-black/40 border border-white/10 rounded text-white focus:outline-none focus:border-purple-500"
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
                                        className="w-full p-3 bg-black/40 border border-white/10 rounded text-white focus:outline-none focus:border-purple-500"
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
                                        className="w-full p-3 bg-black/40 border border-white/10 rounded text-white focus:outline-none focus:border-purple-500"
                                    >
                                        <option value="FIVE_KM">5 km</option>
                                        <option value="TEN_KM">10 km</option>
                                        <option value="DISTRICT_WIDE">District-wide</option>
                                        <option value="STATE_WIDE">State-wide</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Resources */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Relief Supplies */}
                        <div className="bg-[#1e293b] border border-white/10 rounded-xl p-6 shadow-xl">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <span className="text-2xl">📦</span>
                                Relief Supplies
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <ResourceCheckbox category="relief" resourceKey="foodPackets" label="Food Packets" icon="🍱" resource={reliefSupplies.foodPackets} onResourceChange={handleResourceChange} />
                                <ResourceCheckbox category="relief" resourceKey="drinkingWater" label="Drinking Water" icon="💧" resource={reliefSupplies.drinkingWater} onResourceChange={handleResourceChange} />
                                <ResourceCheckbox category="relief" resourceKey="sanitaryKits" label="Sanitary Kits" icon="🧼" resource={reliefSupplies.sanitaryKits} onResourceChange={handleResourceChange} />
                            </div>
                        </div>

                        {/* Medical Support */}
                        <div className="bg-[#1e293b] border border-white/10 rounded-xl p-6 shadow-xl">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <span className="text-2xl">⚕️</span>
                                Medical Support
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <ResourceCheckbox category="medical" resourceKey="firstAidKits" label="First Aid Kits" icon="🩹" resource={medicalSupport.firstAidKits} onResourceChange={handleResourceChange} />
                                <ResourceCheckbox category="medical" resourceKey="doctors" label="Doctors" icon="👨‍⚕️" resource={medicalSupport.doctors} onResourceChange={handleResourceChange} />
                                <ResourceCheckbox category="medical" resourceKey="nurses" label="Nurses" icon="👩‍⚕️" resource={medicalSupport.nurses} onResourceChange={handleResourceChange} />
                                <ResourceCheckbox category="medical" resourceKey="ambulances" label="Ambulances" icon="🚑" resource={medicalSupport.ambulances} onResourceChange={handleResourceChange} />
                            </div>
                        </div>

                        {/* Shelter & Essentials */}
                        <div className="bg-[#1e293b] border border-white/10 rounded-xl p-6 shadow-xl">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <span className="text-2xl">🏕️</span>
                                Shelter & Essentials
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <ResourceCheckbox category="shelter" resourceKey="tents" label="Tents" icon="⛺" resource={shelterEssentials.tents} onResourceChange={handleResourceChange} />
                                <ResourceCheckbox category="shelter" resourceKey="beds" label="Beds" icon="🛏️" resource={shelterEssentials.beds} onResourceChange={handleResourceChange} />
                                <ResourceCheckbox category="shelter" resourceKey="blankets" label="Blankets" icon="🧺" resource={shelterEssentials.blankets} onResourceChange={handleResourceChange} />
                                <ResourceCheckbox category="shelter" resourceKey="clothes" label="Clothes" icon="👕" resource={shelterEssentials.clothes} onResourceChange={handleResourceChange} />
                            </div>
                        </div>

                        {/* Human Resources */}
                        <div className="bg-[#1e293b] border border-white/10 rounded-xl p-6 shadow-xl">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <span className="text-2xl">👥</span>
                                Human Resources
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <ResourceCheckbox category="human" resourceKey="volunteers" label="Volunteers" icon="🙋" resource={humanResources.volunteers} onResourceChange={handleResourceChange} />
                                <ResourceCheckbox category="human" resourceKey="rescueWorkers" label="Rescue Workers" icon="🦺" resource={humanResources.rescueWorkers} onResourceChange={handleResourceChange} />
                            </div>
                        </div>

                        {/* Additional Notes */}
                        <div className="bg-[#1e293b] border border-white/10 rounded-xl p-6 shadow-xl">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Additional Notes
                            </h2>
                            <textarea
                                value={additionalNotes}
                                onChange={(e) => setAdditionalNotes(e.target.value)}
                                placeholder="Enter any special instructions, limitations, or additional information..."
                                rows="4"
                                className="w-full p-3 bg-black/40 border border-white/10 rounded text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
                            />
                        </div>

                        {/* Action Buttons */}
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
                                Last Updated: <span className="text-white font-semibold">{formatLastUpdated(ngoProfile.lastUpdated)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const ResourceCheckbox = ({ category, resourceKey, label, icon, resource, onResourceChange }) => {
    return (
        <div className="flex items-center gap-3 p-3 bg-black/20 rounded border border-white/5 hover:border-white/10 transition-colors">
            <input
                type="checkbox"
                checked={resource?.available || false}
                onChange={(e) => onResourceChange(category, resourceKey, 'available', e.target.checked)}
                className="w-5 h-5 rounded border-white/20 bg-black/40 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-0 cursor-pointer"
            />
            <span className="text-2xl">{icon}</span>
            <div className="flex-1">
                <label className="text-white font-medium text-sm">{label}</label>
            </div>
            <input
                type="number"
                min="0"
                value={resource?.quantity !== undefined ? resource.quantity : 0}
                onChange={(e) => onResourceChange(category, resourceKey, 'quantity', e.target.value)}
                disabled={!resource?.available}
                className="w-24 px-3 py-1.5 bg-black/40 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Qty"
            />
        </div>
    );
};
