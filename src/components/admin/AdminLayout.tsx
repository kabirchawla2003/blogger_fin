// components/admin/AdminLayout.tsx
'use client';

import { useState } from 'react';
import { PenTool, FileText, Settings, BarChart3, MessageSquare, LogOut } from 'lucide-react';
import PostEditor from './PostEditor';
import PostManager from './PostManager';
import SiteSettings from './SiteSettings';
import Analytics from './Analytics';
import CommentManager from './CommentManager';

export default function AdminLayout() {
  const [activeTab, setActiveTab] = useState('editor');

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    window.location.reload();
  };

  const tabs = [
    { id: 'editor', label: 'Write', icon: PenTool },
    { id: 'posts', label: 'Manage Posts', icon: FileText },
    { id: 'comments', label: 'Comments', icon: MessageSquare },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-warm-cream">
      {/* Header */}
      <header className="bg-white border-b border-earth-green-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <PenTool className="h-8 w-8 text-earth-green-600" />
              <h1 className="font-serif text-2xl font-bold text-earth-green-800">
                Author's Sanctuary
              </h1>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-earth-green-600 hover:text-terracotta transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <nav className="bg-white rounded-xl shadow-md p-2 mb-8">
          <div className="flex flex-wrap gap-2">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === id
                    ? 'bg-earth-green-600 text-white'
                    : 'text-earth-green-700 hover:bg-earth-green-50'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-md">
          {activeTab === 'editor' && <PostEditor />}
          {activeTab === 'posts' && <PostManager />}
          {activeTab === 'comments' && <CommentManager />}
          {activeTab === 'analytics' && <Analytics />}
          {activeTab === 'settings' && <SiteSettings />}
        </div>
      </div>
    </div>
  );
}
