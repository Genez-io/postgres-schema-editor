import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const OpenPage: React.FC = () => {
  const { token: token, dbId } = useParams<{ token: string; dbId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (token && dbId) {
      // Save token and dbId to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('dbId', dbId);

      // Redirect to the root path
      navigate('/edit/' + dbId);
    } else {
      // Handle missing parameters, e.g., navigate to an error page
      console.error('Missing token or dbId in URL parameters.');
      navigate('/error'); // Or any appropriate route
    }
  }, [token, dbId, navigate]);

  // Optionally, you can display a loading indicator
  return null;
};

export default OpenPage;
