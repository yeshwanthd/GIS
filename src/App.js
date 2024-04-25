import './App.css';
import React, { useState } from 'react';
import Login from './components/Login';
import Signup from './components/Signup';
import HomePage from './components/Home';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    // Perform any necessary cleanup (e.g., clearing session data)
  };

  return (
    <Router>
      <div className="App">
        {/* {isLoggedIn && <Navbar onLogout={handleLogout} />} */}
        <Routes>
          {/* Redirect authenticated users to home */}
          {isLoggedIn ? (
             <Route path="/" element={<HomePage/>} />
            // <Route path="/home" element={<HomePage />} />
          ) : (
            <>
              {/* Show login page if not authenticated */}
              <Route path="/login" element={<Login handleLogin={handleLogin} />} />
              {/* Show signup page if not authenticated */}
              <Route path="/signup" element={<Signup handleLogin={handleLogin} />} />
              {/* Redirect to login by default */}
              <Route path="/" element={<Login handleLogin={handleLogin} />} />
              {/* <Route path="/home" element={<HomePage />} /> */}
            </>
          )}
          {/* Always show home page when authenticated */}
          <Route path="/home" element={<HomePage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
