import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Create from "./pages/PlayerManagement";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/player-management" element={<Create />} />
      </Routes>
    </Router>
  );
}

export default App;
