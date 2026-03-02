import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import ActiveDisasters from './pages/ActiveDisasters';
import DeploymentStatus from "./pages/DeploymentStatus";
import DisasterAnalyzer from "./pages/DisasterAnalyzer";
import DisasterDetails2 from "./pages/DisasterDetails2";
import GovernmentAgencyDashboard from "./pages/GovernmentAgencyDashboard";
import GovernmentAgencyLogin from "./pages/GovernmentAgencyLogin";
import ImpactList from "./pages/ImpactList";
import MissionControl from "./pages/MissionControl";
import NGODashboard from "./pages/NGODashboard";
import VolunteerForm from "./pages/VolunteerForm";
import VolunteerLogin from "./pages/VolunteerLogin";
import DeploymentAnalyzer from "./pages/DeploymentAnalyzer";

// Import the components
import IdroHome from './components/IdroHome';

function App() {
  return (
    <Router>
      <Routes>
        {/* Main pages */}
        <Route path="/" element={<IdroHome />} />
        <Route path="/command" element={<IdroHome />} />

        {/* Disaster flow */}
        <Route path="/active-disasters" element={<ActiveDisasters />} />

        {/* Volunteer flow */}
        <Route path="/login" element={<VolunteerLogin />} />
        <Route path="/volunteer-form" element={<VolunteerForm />} />

        {/* NGO flow */}
        <Route path="/ngo-dashboard" element={<NGODashboard />} />

        {/* Government Agency flow */}
        <Route path="/government-login" element={<GovernmentAgencyLogin />} />
        <Route path="/government-dashboard" element={<GovernmentAgencyDashboard />} />

        <Route path="/impact-analysis" element={<ImpactList />} />

        <Route path="/impact-analysis/:id" element={<DisasterAnalyzer />} />

        <Route path="/mission-control" element={<MissionControl />} />
        <Route path="/disasterdetails2/:id" element={<DisasterDetails2 />} />
        <Route path="/deployment-status" element={<DeploymentStatus />} />
        <Route path="/deployment-analyzer/:id" element={<DeploymentAnalyzer />} />


      </Routes>



    </Router>
  );
}

export default App;