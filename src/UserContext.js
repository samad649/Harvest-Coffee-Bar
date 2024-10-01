import axios from 'axios';
import { createContext, useContext, useReducer } from 'react';

// Initial state for the context
const initialState = {
  user: null,
  profile: null,
  email: null
};

// Create the context
const UserContext = createContext();


// Create a reducer function to handle state updates
const userReducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE':
        localStorage.setItem('profile', action.payload);
        localStorage.setItem('email', action.payload.email);
        return { ...state, profile: action.payload, email: action.payload.email};
    case 'LOGIN':
        localStorage.setItem('token', action.payload.access_token);
        localStorage.setItem('user', action.payload);
        localStorage.setItem('profile', action.payload);
        localStorage.setItem('email', action.payload.email);
        return { ...state, profile: action.payload, email: action.payload.email };
    case 'LOGOUT':
        localStorage.setItem('token', "");
        localStorage.setItem('user', "");
        localStorage.setItem('profile', "");
        localStorage.setItem('email', "");
        return { ...state, user: null, profile: null,};
    default:
        return state;
    }
};

// Create a context provider
export const UserProvider = ({ children }) => {
    const [state, dispatch] = useReducer(userReducer, initialState);
    var token = localStorage.getItem('token')
    if (token) {
        axios
            .get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${token}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json'
                }
            })
            .then((res) => {
                dispatch({ type: 'UPDATE', payload: res.data});
            })
            .catch((err) => console.log(err));
    } else if(localStorage.getItem('profile')) {
        dispatch({ type: 'LOGOUT'});
    }

    return (
        <UserContext.Provider value={{ state, dispatch }}>
            {children}
        </UserContext.Provider>
    );
};

// Create a custom hook to use the context
export const useUserContext = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUserContext must be used within a UserProvider');
    }
    return context;
};