import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Signup = ({ handleLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  // const [redirect, setRedirect] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrorMessage(errorData.message || 'Signup failed');
        return;
      }

      const data = await response.json();
      console.log(data);
      if (data.email && data.id) {
        handleLogin(true); // Call a prop function to handle signup state
        setName('');
        setEmail('');
        setPassword('');
        // setRedirect(true);
        setIsLogin(!isLogin);
        navigate('/home');
      } else {
        setErrorMessage(data.message || 'Signup failed1');
      }
    } catch (error) {
      console.error('Error signing up:', error);
      setErrorMessage('Signup failed'); // Handle generic error
    }
  };
  
  // if(redirect){
  //   return <Navigate to="/login" replace />;
  // }

  return (
    <div className='form-container'>
      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
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
        <button type="submit">Signup</button>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
      </form>
    </div>
  );
};

export default Signup;
