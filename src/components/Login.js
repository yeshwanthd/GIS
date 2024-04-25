import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import '../App.css'; // Import the CSS file

const Login = ({ handleLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const logInUser = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log(data);

      if (!response.ok) {
          setErrorMessage(data.error || 'Login failed');
      } else {
          // Login successful handling
          sessionStorage.setItem('user_id', data.id);
          handleLogin(true); // Set login state to true
          setEmail('');
          setPassword('');
          navigate('/home');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      setErrorMessage('Login failed'); // Handle generic error
    }
  };

  return (
    <div className="form-container"> {/* Apply form-container class */}
      <form onSubmit={logInUser}>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
      </form>
    </div>
  );
};

export default Login;
