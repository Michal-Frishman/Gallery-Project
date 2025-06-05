import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Gallery from './components/Gallery';
import Login from './components/Login';
import Register from './components/Register';
import UploadImage from './components/UploadImage';


export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [showRegister, setShowRegister] = useState(false);

  const handleLogin = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  if (!token) {
    return showRegister ? (
      <Register
        onRegister={handleLogin}
        onSwitchToLogin={() => setShowRegister(false)}
      />
    ) : (
      <Login
        onLogin={handleLogin}
        onSwitchToRegister={() => setShowRegister(true)}
      />
    );
  }

  return (
    <Router>
      <nav style={{ margin: 10 }}>
        <button onClick={handleLogout}>Logout</button>
      </nav>
      <Routes>
        <Route path="/" element={<Gallery token={token} />} />
        <Route path="/upload" element={<UploadImage token={token} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
