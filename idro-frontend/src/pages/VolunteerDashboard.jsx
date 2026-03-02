import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function VolunteerDashboard() {
    const navigate = useNavigate();
    const [volunteers, setVolunteers] = useState([]);
    const [selectedVolunteer, setSelectedVolunteer] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load volunteer profile from localStorage
        const storedVolunteer = localStorage.getItem("volunteer");

        if (!storedVolunteer) {
            navigate("/login");
            return;
        }

        const volunteer = JSON.parse(storedVolunteer);
        setSelectedVolunteer(volunteer);

        // Fetch all volunteers for the scrollable list
        fetchAllVolunteers();
    }, [navigate]);

    const fetchAllVolunteers = async () => {
        try {
            const response = await axios.get("http://localhost:8085/api/volunteer/all");
            setVolunteers(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch volunteers:", error);
            setLoading(false);
        }
    };

    const handleVolunteerSelect = async (volunteerId) => {
        try {
            const response = await axios.get(`http://localhost:8085/api/volunteer/${volunteerId}`);
            setSelectedVolunteer(response.data);
            localStorage.setItem("volunteer", JSON.stringify(response.data));
        } catch (error) {
            console.error("Failed to fetch volunteer:", error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("volunteer");
        navigate("/login");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
                <div className="text-white text-xl">Loading dashboard...</div>
            </div>
        );
    }

    if (!selectedVolunteer) {
        return null;
    }

    return (
        <div className="min-h-screen bg-[#0f172a] p-6">
            <div className="max-w-7xl mx-auto">
                {/* Scrollable Volunteer IDs */}
                <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-white/10 rounded-xl p-4 mb-6 shadow-xl">
                    <h2 className="text-white text-sm font-semibold mb-3">Select Volunteer</h2>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                        {volunteers.map((vol) => (
                            <button
                                key={vol.volunteerId}
                                onClick={() => handleVolunteerSelect(vol.volunteerId)}
                                className={`px-6 py-3 rounded-lg font-bold text-sm whitespace-nowrap transition-all ${selectedVolunteer.volunteerId === vol.volunteerId
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/50"
                                        : "bg-white/10 text-gray-300 hover:bg-white/20"
                                    }`}
                            >
                                {vol.volunteerId}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Header Section - Name and Mobile */}
                <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-white/10 rounded-xl p-6 mb-6 shadow-xl">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-4xl font-bold text-white">{selectedVolunteer.name}</h1>
                                <span className="px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-full text-green-300 text-xs font-semibold">
                                    {selectedVolunteer.available ? "Available" : "Unavailable"}
                                </span>
                            </div>
                            <div className="flex items-center gap-6 text-gray-300">
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <span className="font-semibold">{selectedVolunteer.mobileNumber}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span>{selectedVolunteer.location}</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Volunteer Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Profile Info */}
                    <div className="bg-[#1e293b] border border-white/10 rounded-xl p-6 shadow-xl">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <span className="text-2xl">👤</span>
                            Volunteer Profile
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-gray-400 text-sm mb-1">Volunteer ID</label>
                                <div className="text-white font-semibold">{selectedVolunteer.volunteerId}</div>
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-1">Email</label>
                                <div className="text-white">{selectedVolunteer.email}</div>
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-1">Skills</label>
                                <div className="text-white">{selectedVolunteer.skills}</div>
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-1">Location</label>
                                <div className="text-white">{selectedVolunteer.location}</div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Availability Status */}
                    <div className="bg-[#1e293b] border border-white/10 rounded-xl p-6 shadow-xl">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <span className="text-2xl">📋</span>
                            Status
                        </h2>
                        <div className="space-y-4">
                            <div className="p-4 bg-black/20 rounded border border-white/5">
                                <div className="text-gray-400 text-sm mb-2">Current Status</div>
                                <div className={`text-lg font-bold ${selectedVolunteer.available ? "text-green-400" : "text-red-400"}`}>
                                    {selectedVolunteer.available ? "✓ Available for Deployment" : "✗ Not Available"}
                                </div>
                            </div>
                            <div className="p-4 bg-black/20 rounded border border-white/5">
                                <div className="text-gray-400 text-sm mb-2">Contact Information</div>
                                <div className="text-white">
                                    <div className="mb-2">📱 {selectedVolunteer.mobileNumber}</div>
                                    <div>📧 {selectedVolunteer.email}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
