import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../utils/AuthContext';
import ThemeToggle from '../components/ThemeToggle';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [formError, setFormError] = useState('');
  const { register, loginAsGuest, error, clearError } = useContext(AuthContext);
  const navigate = useNavigate();

  const { email, password, confirmPassword } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormError('');
    clearError();
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password || !confirmPassword) {
      setFormError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }

    try {
      await register(email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  const handleGuestLogin = () => {
    loginAsGuest();
    navigate('/dashboard');
  };

  return (
    <div className="register-container">
      <div className="theme-toggle-container">
        <ThemeToggle />
      </div>
      <div className="register-form">
        <h1>Register</h1>
        <p>Create your account</p>

        {(formError || error) && (
          <div className="alert alert-danger">{formError || error}</div>
        )}

        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={onChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={onChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={onChange}
              placeholder="Confirm your password"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary">
            Register
          </button>
          
          <button 
            type="button" 
            className="btn btn-secondary guest-btn"
            onClick={handleGuestLogin}
            style={{ marginTop: '10px' }}
          >
            Continue as Guest
          </button>
        </form>

        <p className="login-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;