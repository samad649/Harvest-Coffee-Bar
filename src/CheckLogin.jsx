import axios from 'axios';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useUserContext } from './UserContext';

function CheckLogin({ checkManager, checkAdmin }) {
  const { state, dispatch } = useUserContext();
  const [isEmployee, setIsEmployee] = useState(false);
  const [isManager, setIsManager] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async (state) => {
      try {
        var email = "";
        if(state.profile){
          email = state.profile.email;
        } else if (localStorage.getItem('email')) {
          email = localStorage.getItem('email');
        }
        
        if(email){
          const response = await axios.get(`https://project-3-906-03.onrender.com/isEmployee/${email}`);
          console.log(email);
          setIsEmployee(response.data.isEmployee);
          setIsManager(response.data.isManager);
          setIsAdmin(response.data.isAdmin);
        }
      } catch (error) {
        console.error('Error fetching items:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData(state);
  }, []);

  if (isLoading) {
    return <p>Loading...</p>;
  } 
  
  if (!isEmployee || (checkManager && !isManager) || (checkAdmin && !isAdmin)) {
    return (
    <>
      {window.alert('You don\'t have permission to view this page')}
      <Navigate to="/" />
    </>
    )
  }

  //console.log(isEmployee);
}

export default CheckLogin;

