import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { idroApi } from "../services/api";

export default function MissionControl() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await idroApi.getAlerts();
        const active = res.data.filter(a => a.missionStatus === "OPEN");
        setAlerts(active);
      } catch (err) {
        console.error("Failed to load alerts", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  if (loading) {
    return <div className="p-10 text-white">Loading Mission Control...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-10">
      <h1 className="text-3xl font-bold text-yellow-400 mb-6">
        Mission Control
      </h1>

      <div className="space-y-4">
        {alerts.length === 0 && (
          <p className="text-slate-400">No active disasters.</p>
        )}

        {alerts.map(alert => (
          <div
            key={alert.id}
            onClick={() => navigate(`/disasterdetails2/${alert.id}`)}
            className="cursor-pointer bg-[#1e293b] p-5 rounded-lg border border-white/10 hover:border-yellow-500 transition"
          >
            <h2 className="text-xl font-bold text-yellow-300">
              {alert.type} - {alert.location}
            </h2>

            <p className="text-sm text-slate-400 mt-1">
              Severity: {alert.magnitude || "N/A"}
            </p>

            <p className="text-sm text-slate-400">
              Affected: {alert.affectedCount || 0}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
