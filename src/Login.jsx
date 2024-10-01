import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import React from 'react';
// import './Login.css';

import { useUserContext } from './UserContext';

const Login = () => {
    const {state, dispatch } = useUserContext();

    const handleLogin = useGoogleLogin({
        onSuccess: (codeResponse) => {
            dispatch({ type: 'LOGIN', payload: codeResponse});
        },
        onError: (error) => console.log('Login Failed:', error)
    });

    const logOut = () => {
      localStorage.clear();
      dispatch({ type: 'LOGOUT'});
      googleLogout();
    };

    window.onbeforeunload = function () {
        logOut();
    };

    return (
        <div>
          <div className="login-container">
            {state.profile ? (
              <div>
                <img src={state.profile.picture} alt="user profile picture" />
                <h3>User Logged in</h3>
                <p>Name: {state.profile.name}</p>
                <p>Email Address: {state.profile.email}</p>
                <br />
                <br />
                <button onClick={logOut}>Log out</button>
              </div>
            ) : (
              <button onClick={() => handleLogin()}> Google Sign-In </button>
            )}
          </div>
        </div>
      );
    }

export default Login;