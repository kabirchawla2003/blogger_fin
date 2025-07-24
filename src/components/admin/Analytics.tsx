'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Eye, TrendingUp, Users, Calendar } from 'lucide-react';

interface AnalyticsData {
  totalViews: number;
  totalPosts: number;
  totalComments: number;
  topPosts: Array<{
    id: string;
    title: string;
    views: number;
    slug: string;
  }>;
  recentActivity: Array<{
    type: string;
    description: string;
    timestamp: string;
  }>;
}

export default function Analytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7days');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/admin/analytics?range=${timeRange}`, {
        headers: {
          'Authorization': localStorage.getItem('adminAuth') || '',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-earth-green-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-serif text-3xl font-bold text-earth-green-800 flex items-center space-x-2">
          <BarChart3 className="h-8 w-8" />
          <span>Analytics Dashboard</span>
        </h2>
        
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="input-field"
        >
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="90days">Last 90 Days</option>
          <option value="1year">Last Year</option>
        </select>
      </div>

      {analytics && (
        <div className="space-y-8">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-earth-green-600">Total Views</p>
                  <p className="text-3xl font-bold text-earth-green-800">{analytics.totalViews}</p>
                </div>
                <Eye className="h-8 w-8 text-earth-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-earth-green-600">Published Posts</p>
                  <p className="text-3xl font-bold text-earth-green-800">{analytics.totalPosts}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-earth-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-earth-green-600">Total Comments</p>
                  <p className="text-3xl font-bold text-earth-green-800">{analytics.totalComments}</p>
                </div>
                <Users className="h-8 w-8 text-earth-green-500" />
              </div>
            </div>
          </div>

          {/* Top Posts */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="font-serif text-xl font-semibold text-earth-green-800 mb-4">
              Most Popular Posts
            </h3>
            <div className="space-y-3">
              {analytics.topPosts.map((post, index) => (
                <div key={post.id} className="flex items-center justify-between py-3 border-b border-earth-green-100 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <span className="font-semibold text-earth-green-500">#{index + 1}</span>
                    <div>
                      <h4 className="font-medium text-earth-green-800">{post.title}</h4>
                      <p className="text-sm text-earth-green-500">/{post.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 text-earth-green-600">
                    <Eye className="h-4 w-4" />
                    <span>{post.views}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
