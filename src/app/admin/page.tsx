// app/admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { createAuthHeader } from '@/lib/auth';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const authToken = localStorage.getItem('adminAuth');
    if (authToken) {
      try {
        const response = await fetch('/api/admin/verify', {
          headers: {
            'Authorization': authToken,
          },
        });
        
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('adminAuth');
        }
      } catch (error) {
        localStorage.removeItem('adminAuth');
      }
    }
    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const authHeader = createAuthHeader(credentials.username, credentials.password);
      const response = await fetch('/api/admin/verify', {
        headers: {
          'Authorization': authHeader,
        },
      });

      if (response.ok) {
        localStorage.setItem('adminAuth', authHeader);
        setIsAuthenticated(true);
      } else {
        alert('Invalid credentials');
      }
    } catch (error) {
      alert('Login failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-earth-green-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-warm-cream">
        <Navigation />
        
        <div className="pt-20 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <h1 className="font-serif text-3xl font-bold text-earth-green-800 mb-2">
                Admin Login
              </h1>
              <p className="text-earth-green-600">
                Access your writing sanctuary
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-earth-green-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  className="input-field w-full"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-earth-green-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="input-field w-full"
                  required
                />
              </div>

              <button type="submit" className="btn-primary w-full">
                Enter Your Sanctuary
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return <AdminLayout />;
}
