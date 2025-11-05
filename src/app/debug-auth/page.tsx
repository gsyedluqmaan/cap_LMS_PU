'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DebugAuthPage() {
  const [authState, setAuthState] = useState({
    localStorageToken: null as string | null,
    localStorageUser: null as any,
    cookieCheck: null as boolean | null,
  });
  const router = useRouter();

  useEffect(() => {
    // Check localStorage
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    
    setAuthState({
      localStorageToken: token,
      localStorageUser: user ? JSON.parse(user) : null,
      cookieCheck: null // Will be checked via API
    });

    // Check if cookies are working via API call
    checkCookies();
  }, []);

  const checkCookies = async () => {
    try {
      const response = await fetch('/api/auth/check', {
        credentials: 'include'
      });
      const result = await response.json();
      setAuthState(prev => ({ ...prev, cookieCheck: response.ok }));
    } catch (error) {
      setAuthState(prev => ({ ...prev, cookieCheck: false }));
    }
  };

  const clearAll = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    // Call logout API to clear cookies
    fetch('/api/auth/logout', { 
      method: 'POST', 
      credentials: 'include' 
    }).then(() => {
      router.push('/login');
    });
  };

  const testCalendarAccess = () => {
    router.push('/dashboard/calendar');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Authentication Debug</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Auth State</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-700">LocalStorage Token:</h3>
              <p className="text-sm bg-gray-100 p-2 rounded">
                {authState.localStorageToken ? 
                  `Present (${authState.localStorageToken.substring(0, 20)}...)` : 
                  'Not found'
                }
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-700">LocalStorage User:</h3>
              <p className="text-sm bg-gray-100 p-2 rounded">
                {authState.localStorageUser ? 
                  JSON.stringify(authState.localStorageUser, null, 2) : 
                  'Not found'
                }
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-700">Cookie Auth:</h3>
              <p className="text-sm bg-gray-100 p-2 rounded">
                {authState.cookieCheck === null ? 
                  'Checking...' : 
                  (authState.cookieCheck ? 'Working' : 'Not working')
                }
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="space-x-4">
            <button 
              onClick={clearAll}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Clear All Auth & Logout
            </button>
            
            <button 
              onClick={testCalendarAccess}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Test Calendar Access
            </button>
            
            <button 
              onClick={() => router.push('/login')}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}