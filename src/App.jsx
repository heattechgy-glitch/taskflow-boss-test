import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Board from './pages/Board.jsx';
import Login from './pages/Login.jsx';
import Navbar from './components/Navbar.jsx';

function App() {
  const [user, setUser] = useState(null);

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar user={user} setUser={setUser} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/board" element={<Board user={user} />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
      </Routes>
    </div>
  );
}

export default App;