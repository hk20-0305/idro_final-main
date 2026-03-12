import { useEffect, useState, useRef, useCallback } from "react";
import { idroApi } from "../services/api";

export default function VolunteerForm() {
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);

  const [selectedAlertId, setSelectedAlertId] = useState(null);
  const [fetchedAddress, setFetchedAddress] = useState("");
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const [form, setForm] = useState({
    location: "",
    latitude: "",
    longitude: "",
    type: "",
    severity: "",
    affectedCount: "",
    injuredCount: "",
    missing: "",
    verifiedBy: "",
    infra: [],
    needs: []
  });

  const [camps, setCamps] = useState([]);
  const isFetchingRef = useRef(false);

  const infraOptions = [
    "Roads Blocked",
    "Bridge Collapse",
    "Power Failure",
    "Water Failure",
    "Mobile Network Down"
  ];

  const needsOptions = [
    "Food", "Water", "Medicines", "Shelter", "Ambulance",
    "NDRF", "Evacuation", "Helicopter"
  ];

  const campNeeds = [
    "Food", "Water", "Medicines", "Beds", "Blankets",
    "Electricity", "Toilets", "Ambulance", "Volunteers"
  ];

  const disasterTypes = [
    "Flood", "Earthquake", "Fire", "Cyclone", "Landslide",
    "Tsunami", "Drought", "Heatwave", "Cold Wave",
    "Building Collapse", "Industrial Accident", "Gas Leak",
    "Explosion", "Road Accident", "Stampede", "Pandemic", "Other"
  ];

  const severityLevels = ["Low", "Moderate", "High"];

 
  const campUrgencyLevels = ["Immediate", "6 hours", "12 hours", "24 hours"];



  useEffect(() => {
    const storedVolunteer = localStorage.getItem("volunteer");
    if (storedVolunteer) {
      setSelectedVolunteer(JSON.parse(storedVolunteer));
    }
  }, []);

  const fetchAddressFromCoordinates = useCallback(async (lat, lon) => {
    if (!lat || !lon || isFetchingRef.current) {
      if (!lat || !lon) setFetchedAddress("");
      return;
    }

    setLoadingAddress(true);
    isFetchingRef.current = true;
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
      );

      if (!response.ok) {
        throw new Error(`Service unavailable (${response.status})`);
      }

      const data = await response.json();

      if (data) {
        const parts = [
          data.locality,
          data.principalSubdivision,
          data.countryName
        ].filter(Boolean);
        
        const fullAddress = parts.join(", ") || "Location found, but address details missing";
        
        setFetchedAddress(fullAddress);
        setForm(prev => ({ ...prev, location: fullAddress }));
      } else {
        setFetchedAddress("Location address not found");
      }
    } catch (error) {
      console.error("Geocoding Error:", error);
      setFetchedAddress(`Verification Status: ${error.message === 'Failed to fetch' ? 'Check your internet or browser tracking protection' : error.message}`);
    } finally {
      setLoadingAddress(false);
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (form.latitude && form.longitude) {
        fetchAddressFromCoordinates(form.latitude, form.longitude);
      }
    }, 1500);

    return () => clearTimeout(timeoutId);
  }, [form.latitude, form.longitude, fetchAddressFromCoordinates]);

  const getCurrentLocation = () => {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by this browser");
    return;
  }

  navigator.permissions.query({ name: "geolocation" }).then((result) => {
    if (result.state === "denied") {
      alert("Location access denied. Enable it in browser settings.");
      return;
    }

    setLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lon = position.coords.longitude.toFixed(6);

        setForm(prev => ({
          ...prev,
          latitude: lat,
          longitude: lon
        }));

        setLoadingLocation(false);
      },
      (error) => {
        setLoadingLocation(false);
        alert("Error getting location: " + error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  });
};


  const toggleArrayValue = (key, value) => {
    setForm(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(v => v !== value)
        : [...prev[key], value]
    }));
  };

  const addCamp = () => {
    setCamps([...camps, { name: "", location: "", currentPeople: "", injuredCount: "", people: "", needs: [], urgency: "" }]);
  };

  const updateCamp = (index, field, value) => {
    const copy = [...camps];
    copy[index][field] = value;
    setCamps(copy);
  };

  const toggleCampNeed = (index, need) => {
    const copy = [...camps];
    copy[index].needs = copy[index].needs.includes(need)
      ? copy[index].needs.filter(n => n !== need)
      : [...copy[index].needs, need];
    setCamps(copy);
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!form.latitude || !form.longitude || !form.type || !form.severity) {
      alert("Please fill Latitude, Longitude, Type and Severity");
      return;
    }

    for (const camp of camps) {
      if (Number(camp.injuredCount) > Number(camp.currentPeople)) {
        alert(`Camp "${camp.name || 'Unnamed'}": Injured people (${camp.injuredCount}) cannot exceed current people (${camp.currentPeople}).`);
        return;
      }
    }

    const payload = {
      location: fetchedAddress || `${form.latitude}, ${form.longitude}`,
      type: form.type.toUpperCase(),
      color: form.severity === "High" ? "RED" : "ORANGE",
      magnitude: form.severity,
      impact: `Needs: ${form.needs.join(", ")}`,
      time: new Date().toLocaleString(),

      affectedCount: Number(form.affectedCount) || 0,
      injuredCount: Number(form.injuredCount) || 0,
      missing: form.missing,

      details: `Infra: ${form.infra.join(", ")} | Needs: ${form.needs.join(", ")}`,
      reporterLevel: "VOLUNTEER",
      sourceType: "VOLUNTEER-APP",
      missionStatus: "OPEN",
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
      trustScore: 80
    };

    try {
      let alertId = selectedAlertId;

      if (selectedAlertId) {
        await idroApi.updateReport(selectedAlertId, payload);
      } else {
        const res = await idroApi.submitReport(payload);
        alertId = res.data.id;
      }


      for (const camp of camps) {
        if (!camp.name) continue;

        await idroApi.createCamp({
          name: camp.name,
          location: camp.location,
          population: Number(camp.currentPeople) || 0,
          injuredCount: Number(camp.injuredCount) || 0,
          medicinesNeeded: camp.needs.includes("Medicines"),
          latitude: Number(form.latitude),
          longitude: Number(form.longitude),
          alertId: alertId,
          urgency: camp.urgency,
          stock: {
            food: camp.needs.includes("Food") ? "Available" : "Low",
            water: camp.needs.includes("Water") ? "Available" : "Low",
            medicine: camp.needs.includes("Medicines") ? "Available" : "Low"
          }
        });
      }

      alert("✅ Submitted successfully");



      setForm({ location: "", latitude: "", longitude: "", type: "", severity: "", affectedCount: "", injuredCount: "", missing: "", verifiedBy: "", infra: [], needs: [] });
      setCamps([]);
      setSelectedAlertId(null);
      setFetchedAddress("");

    } catch (err) {
      console.error(err);
      alert(`❌ Submission failed: ${err.response?.data?.message || err.message || "Unknown error"}`);
    }
  };

  const resetForm = () => {
    setForm({ location: "", latitude: "", longitude: "", type: "", severity: "", affectedCount: "", injuredCount: "", missing: "", verifiedBy: "", infra: [], needs: [] });
    setCamps([]);
    setSelectedAlertId(null);
    setFetchedAddress("");
  };

  return (
    <div className="min-h-screen bg-black flex justify-center items-start pt-10 text-white">
      <form
        onSubmit={submit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
          }
        }}
        className="w-[1000px] bg-white/[0.02] rounded-2xl border border-white/10 p-8 shadow-2xl space-y-8 backdrop-blur-md"
      >
        {selectedVolunteer && (
          <div className="pb-6 border-b border-white/10">
            <div className="flex items-center justify-between bg-gradient-to-r from-emerald-900/20 to-black rounded-lg p-4 border border-white/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center text-xl font-bold shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                  {selectedVolunteer.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedVolunteer.name}</h3>
                  <div className="flex items-center gap-2 text-gray-300">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="font-semibold">{selectedVolunteer.mobileNumber}</span>
                  </div>
                </div>
              </div>
              <span className="px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-full text-green-300 text-sm font-semibold">
                Active
              </span>
            </div>
          </div>
        )}

        <h1 className="text-3xl font-bold text-center">
          Volunteer Disaster Intelligence Panel
        </h1>


        <section className="space-y-4">
          <h2 className="text-emerald-400 font-black uppercase tracking-[0.2em] text-[10px] mb-4">📍 Location Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">
                Latitude
              </label>
              <input
                type="number"
                step="any"
                value={form.latitude || ''}
                onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                placeholder="e.g., 19.0760"
                className="w-full bg-black/40 border border-white/10 p-3 rounded focus:border-emerald-500 focus:outline-none transition-colors"
              />
              <p className="text-xs text-gray-400 mt-1">Enter latitude coordinate</p>
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">
                Longitude
              </label>
              <input
                type="number"
                step="any"
                value={form.longitude || ''}
                onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                placeholder="e.g., 72.8777"
                className="w-full bg-black/40 border border-white/10 p-3 rounded-lg focus:border-emerald-500 focus:outline-none transition-all placeholder:text-slate-600"
              />
              <p className="text-xs text-gray-400 mt-1">Enter longitude coordinate</p>
            </div>
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={loadingLocation}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/50 text-white font-bold rounded-lg shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 disabled:scale-100 disabled:cursor-not-allowed"
            >
              {loadingLocation ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Getting Location...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Use Current Location</span>
                </>
              )}
            </button>
            <p className="text-xs text-gray-400 mt-2">
              📍 Click to automatically fill your current GPS coordinates
            </p>
          </div>

          {(fetchedAddress || loadingAddress) && (
            <div className="mt-4 p-4 bg-emerald-900/10 border border-emerald-500/30 rounded-lg backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <div className="text-green-400 mt-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-green-300 mb-1">📍 Detected Location Address:</p>
                  {loadingAddress ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-emerald-400 border-t-transparent"></div>
                      <p className="text-gray-400 text-sm">Fetching address...</p>
                    </div>
                  ) : (
                    <p className="text-white text-sm leading-relaxed">{fetchedAddress}</p>
                  )}
                </div>
              </div>
            </div>
          )}


        </section>



        <section className="space-y-3">
          <h2 className="text-emerald-400 font-black uppercase tracking-[0.2em] text-[10px] mb-4">🌀 Disaster Classification</h2>
          <div className="grid grid-cols-2 gap-4">
            <select
              value={form.type}
              onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value }))}
              className="bg-black/40 p-3 rounded border border-white/10 focus:border-emerald-500 focus:outline-none transition-colors"
            >
              <option value="">Select Disaster Type</option>
              {disasterTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <select
              value={form.severity}
              onChange={(e) => setForm(prev => ({ ...prev, severity: e.target.value }))}
              className="bg-black/40 p-3 rounded-lg border border-white/10 focus:border-emerald-500 focus:outline-none transition-all"
            >
              <option value="">Severity Level</option>
              {severityLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-emerald-400 font-black uppercase tracking-[0.2em] text-[10px] mb-4">👥 Human Impact</h2>

          <div className="grid grid-cols-3 gap-4">
            <input
              placeholder="People Affected"
              value={form.affectedCount}
              onChange={(e) => setForm(prev => ({ ...prev, affectedCount: e.target.value }))}
              className="bg-black/40 p-3 rounded border border-white/10 focus:border-emerald-500 focus:outline-none transition-colors"
            />

            <input
              placeholder="Injured Count"
              value={form.injuredCount}
              onChange={(e) => setForm(prev => ({ ...prev, injuredCount: e.target.value }))}
              className="bg-black/40 p-3 rounded border border-white/10 focus:border-emerald-500 focus:outline-none transition-colors"
            />

            <input
              placeholder="Missing People"
              value={form.missing}
              onChange={(e) => setForm(prev => ({ ...prev, missing: e.target.value }))}
              className="bg-black/40 p-3 rounded-lg border border-white/10 focus:border-emerald-500 focus:outline-none transition-all"
            />

          </div>
        </section>


        <section className="space-y-3">
          <h2 className="text-emerald-400 font-black uppercase tracking-[0.2em] text-[10px] mb-4">🏚 Infrastructure Damage</h2>
          <div className="grid grid-cols-3 gap-3">
            {infraOptions.map(opt => (
              <label key={opt} className="flex gap-2 items-center bg-black/40 p-3 rounded border border-white/5 hover:border-white/10 transition-colors">
                <input
                  type="checkbox"
                  checked={form.infra.includes(opt)}
                  onChange={() => toggleArrayValue("infra", opt)}
                />
                {opt}
              </label>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-emerald-400 font-black uppercase tracking-[0.2em] text-[10px] mb-4">Boxes Immediate Needs</h2>
          <div className="grid grid-cols-3 gap-3">
            {needsOptions.map(opt => (
              <label key={opt} className="flex gap-2 items-center bg-black/40 p-4 rounded-xl border border-white/5 hover:border-emerald-500/30 transition-all cursor-pointer group">
                <input
                  type="checkbox"
                  checked={form.needs.includes(opt)}
                  onChange={() => toggleArrayValue("needs", opt)}
                />
                {opt}
              </label>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-emerald-400 font-black uppercase tracking-[0.2em] text-[10px] mb-4">⛺ Relief Camps</h2>

          {camps.length === 0 && (
            <p className="text-sm text-slate-500">No camps added yet.</p>
          )}

          {camps.map((camp, index) => (
            <div
              key={index}
              className="bg-black/60 border border-white/10 p-6 rounded-2xl space-y-4 backdrop-blur-sm"
            >
              <div className="grid grid-cols-6 gap-4">
                <input
                  placeholder="Camp Name"
                  value={camp.name}
                  onChange={(e) => updateCamp(index, "name", e.target.value)}
                  className="bg-black/40 p-2 rounded-lg border border-white/10 focus:border-emerald-500 focus:outline-none transition-all"
                />

                <input
                  placeholder="Location"
                  value={camp.location}
                  onChange={(e) => updateCamp(index, "location", e.target.value)}
                  className="bg-black/40 p-2 rounded-lg border border-white/10 focus:border-emerald-500 focus:outline-none transition-all"
                />

                <input
                  placeholder="Current People"
                  type="number"
                  value={camp.currentPeople || ''}
                  onChange={(e) => updateCamp(index, "currentPeople", e.target.value)}
                  className="bg-black/40 p-2 rounded-lg border border-white/10 focus:border-emerald-500 focus:outline-none transition-all"
                />

                <input
                  placeholder="Injured People"
                  type="number"
                  value={camp.injuredCount || ''}
                  onChange={(e) => updateCamp(index, "injuredCount", e.target.value)}
                  className="bg-slate-900 p-2 rounded border border-slate-600 border-red-500/50"
                />

                <input
                  placeholder="Max Capacity"
                  type="number"
                  value={camp.people}
                  onChange={(e) => updateCamp(index, "people", e.target.value)}
                  className="bg-black/40 p-2 rounded-lg border border-white/10 focus:border-emerald-500 focus:outline-none transition-all"
                />

                <select
                  value={camp.urgency}
                  onChange={(e) => updateCamp(index, "urgency", e.target.value)}
                  className="bg-slate-900 p-2 rounded border border-slate-600"
                >
                  <option value="">Urgency</option>
                  {campUrgencyLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>

              </div>

              <div className="grid grid-cols-4 gap-3 pt-2">
                {campNeeds.map(need => (
                  <label
                    key={need}
                    className="flex items-center gap-2 bg-black/20 p-2 rounded border border-white/5 text-sm hover:border-white/10 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={camp.needs.includes(need)}
                      onChange={() => toggleCampNeed(index, need)}
                    />
                    {need}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </section>


        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={addCamp}
            className="bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded-lg font-bold shadow-lg shadow-emerald-900/20 transition-all hover:scale-105"
          >
            + Add Camp
          </button>

          <button
            type="button"
            onClick={resetForm}
            className="bg-neutral-800 hover:bg-neutral-700 px-6 py-3 rounded-lg font-bold border border-white/10 transition-all"
          >
            Reset Form
          </button>

          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-500 px-8 py-3 rounded-lg font-black uppercase tracking-widest shadow-lg shadow-emerald-900/20 transition-all hover:scale-105 active:scale-95"
          >
            Submit Report
          </button>
        </div>
      </form>
    </div>
  );
}
