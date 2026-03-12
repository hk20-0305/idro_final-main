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
import About from "./pages/About";


import IdroHome from './components/IdroHome';

function App() {
  return (
    <Router>
      <Routes>

        <Route path="/" element={<IdroHome />} />
        <Route path="/command" element={<IdroHome />} />


        <Route path="/active-disasters" element={<ActiveDisasters />} />


        <Route path="/login" element={<VolunteerLogin />} />
        <Route path="/volunteer-form" element={<VolunteerForm />} />


        <Route path="/ngo-dashboard" element={<NGODashboard />} />


        <Route path="/government-login" element={<GovernmentAgencyLogin />} />
        <Route path="/government-dashboard" element={<GovernmentAgencyDashboard />} />

        <Route path="/impact-analysis" element={<ImpactList />} />

        <Route path="/impact-analysis/:id" element={<DisasterAnalyzer />} />

        <Route path="/mission-control" element={<MissionControl />} />
        <Route path="/disasterdetails2/:id" element={<DisasterDetails2 />} />
        <Route path="/deployment-status" element={<DeploymentStatus />} />
        <Route path="/deployment-analyzer/:id" element={<DeploymentAnalyzer />} />
        <Route path="/about" element={<About />} />


      </Routes>



    </Router>
  );
}

export default App;