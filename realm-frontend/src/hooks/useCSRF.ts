import { useEffect, useState } from 'react';
import axios from 'axios';

export const useCSRF = () => {
  const [csrfToken, setCSRFToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCSRFToken = async () => {
      try {
        const response = await axios.get('http://localhost:8081/csrf-token', {
          withCredentials: true
        });
        setCSRFToken(response.data.token);
      } catch (error) {
        console.error('Failed to fetch CSRF token:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCSRFToken();
  }, []);

  return { csrfToken, loading };
};