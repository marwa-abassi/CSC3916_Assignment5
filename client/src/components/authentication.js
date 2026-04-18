import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Login from './login';
import Register from './register';
import { logoutUser } from '../actions/authActions';
import actionTypes from '../constants/actionTypes';
import { Nav, Button, Alert } from 'react-bootstrap';

const Authentication = () => {
  const [activeTab, setActiveTab] = useState('login');
  const dispatch = useDispatch(); 

  // Retrieve Redux state values
  const loggedIn = useSelector((state) => state.auth.loggedIn);
  const username = useSelector((state) => state.auth.username);
  const error = useSelector((state) => state.auth.error);

  // Switch tabs when user selects a tab
  const handleSelect = (selectedKey) => {
    setActiveTab(selectedKey);
    dispatch({ type: actionTypes.AUTH_ERROR, message: '' });
  };

  const logout = () => {
    dispatch(logoutUser());
  };

  const userNotLoggedIn = (
    <div className="auth-container">
      {/* Render Nav tabs */}
      <Nav variant="tabs" activeKey={activeTab} onSelect={handleSelect} className="mb-3 dark-tabs justify-content-center">
        <Nav.Item>
          <Nav.Link eventKey="login">Login</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="register">Register</Nav.Link>
        </Nav.Item>
      </Nav>
      {error ? <Alert variant="danger" className="mb-3">{error}</Alert> : null}
      {/* Conditionally render based on the active tab */}
      {activeTab === 'register' ? <Register /> : <Login />}
    </div>
  );

  const userLoggedIn = (
    <div className="text-center">
      Logged in as: {username}{' '}
      <Button variant="outline-light" onClick={logout}>
        Logout
      </Button>
    </div>
  );

  return <div>{loggedIn ? userLoggedIn : userNotLoggedIn}</div>;
};

export default Authentication;