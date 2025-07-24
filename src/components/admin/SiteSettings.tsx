'use client';

import { useState, useEffect } from 'react';
import { Save, Settings, Globe, User } from 'lucide-react';

interface SiteSettings {
  siteName: string;
  tagline: string;
  welcomeMessage: string;
  aboutSection: string;
  authorName: string;
  authorBio: string;
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

export default function SiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: '',
    tagline: '',
    welcomeMessage: '',
    aboutSection: '',
    authorName: '',
    authorBio: '',
    socialLinks: {},
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings', {
        headers: {
          'Authorization': localStorage.getItem('adminAuth') || '',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('adminAuth') || '',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        alert('Settings saved successfully!');
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      alert('Failed to save settings');
    } finally {
      setSaving(false);
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
          <Settings className="h-8 w-8" />
          <span>Site Settings</span>
        </h2>
        
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center space-x-2"
        >
          <Save className="h-4 w-4" />
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Basic Settings */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h3 className="font-serif text-xl font-semibold text-earth-green-800 mb-6 flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <span>Site Information</span>
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-earth-green-700 mb-2">
                Site Name
              </label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="input-field w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-earth-green-700 mb-2">
                Tagline
              </label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="input-field w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-earth-green-700 mb-2">
                Welcome Message
              </label>
              <textarea
                value={settings.welcomeMessage}
                onChange={(e) => setSettings({ ...settings, welcomeMessage: e.target.value })}
                className="input-field w-full h-24 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-earth-green-700 mb-2">
                About Section
              </label>
              <textarea
                value={settings.aboutSection}
                onChange={(e) => setSettings({ ...settings, aboutSection: e.target.value })}
                className="input-field w-full h-32 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Author Settings */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="font-serif text-xl font-semibold text-earth-green-800 mb-6 flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Author Information</span>
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-earth-green-700 mb-2">
                  Author Name
                </label>
                <input
                  type="text"
                  value={settings.authorName}
                  onChange={(e) => setSettings({ ...settings, authorName: e.target.value })}
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-earth-green-700 mb-2">
                  Author Bio
                </label>
                <textarea
                  value={settings.authorBio}
                  onChange={(e) => setSettings({ ...settings, authorBio: e.target.value })}
                  className="input-field w-full h-24 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="font-serif text-xl font-semibold text-earth-green-800 mb-6">
              Social Media Links
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-earth-green-700 mb-2">
                  Twitter URL
                </label>
                <input
                  type="url"
                  value={settings.socialLinks.twitter || ''}
                  onChange={(e) => setSettings({ 
                    ...settings, 
                    socialLinks: { ...settings.socialLinks, twitter: e.target.value }
                  })}
                  className="input-field w-full"
                  placeholder="https://twitter.com/username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-earth-green-700 mb-2">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  value={settings.socialLinks.linkedin || ''}
                  onChange={(e) => setSettings({ 
                    ...settings, 
                    socialLinks: { ...settings.socialLinks, linkedin: e.target.value }
                  })}
                  className="input-field w-full"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-earth-green-700 mb-2">
                  GitHub URL
                </label>
                <input
                  type="url"
                  value={settings.socialLinks.github || ''}
                  onChange={(e) => setSettings({ 
                    ...settings, 
                    socialLinks: { ...settings.socialLinks, github: e.target.value }
                  })}
                  className="input-field w-full"
                  placeholder="https://github.com/username"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
