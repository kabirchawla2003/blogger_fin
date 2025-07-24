// src/components/admin/BackupManager.tsx
'use client';

import { useState, useEffect } from 'react';
import { Download, Upload, Trash2, RefreshCw, Database, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

// Update the BackupFile interface to be more flexible:

interface BackupFile {
  name: string;
  size: number;
  created: Date | string; // Allow both Date and string
}


export default function BackupManager() {
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [lastBackup, setLastBackup] = useState<Date | null>(null);

  useEffect(() => {
    fetchBackups();
  }, []);

  // In the fetchBackups function, add data validation:

const fetchBackups = async () => {
  try {
    const response = await fetch('/api/admin/backup', {
      headers: {
        'Authorization': localStorage.getItem('adminAuth') || '',
      },
    });

    if (response.ok) {
      const data = await response.json();
      
      // Validate and sanitize backup data
      const sanitizedBackups = (data.backups || []).map((backup: any) => ({
        ...backup,
        created: backup.created ? new Date(backup.created) : new Date(),
        size: backup.size || 0,
        name: backup.name || 'Unknown'
      }));
      
      setBackups(sanitizedBackups);
      
      // Handle lastBackup with validation
      const lastBackupDate = data.lastBackup ? new Date(data.lastBackup) : null;
      setLastBackup(isNaN(lastBackupDate?.getTime() || 0) ? null : lastBackupDate);
    }
  } catch (error) {
    console.error('Error fetching backups:', error);
  } finally {
    setLoading(false);
  }
};


  const createBackup = async () => {
    setCreating(true);
    try {
      const response = await fetch('/api/admin/backup', {
        method: 'POST',
        headers: {
          'Authorization': localStorage.getItem('adminAuth') || '',
        },
      });

      if (response.ok) {
        const data = await response.json();
        alert(`✅ Backup created successfully: ${data.fileName}`);
        fetchBackups();
      } else {
        const error = await response.json();
        alert(`❌ Backup failed: ${error.error}`);
      }
    } catch (error) {
      alert(`❌ Backup failed: ${error}`);
    } finally {
      setCreating(false);
    }
  };

  const restoreBackup = async (backupName: string) => {
    if (!confirm(`⚠️  Are you sure you want to restore from "${backupName}"? This will replace all current data!`)) {
      return;
    }

    setRestoring(backupName);
    try {
      const response = await fetch('/api/admin/backup/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('adminAuth') || '',
        },
        body: JSON.stringify({ backupName }),
      });

      if (response.ok) {
        alert(`✅ Successfully restored from backup: ${backupName}`);
        window.location.reload(); // Refresh to show restored data
      } else {
        const error = await response.json();
        alert(`❌ Restore failed: ${error.error}`);
      }
    } catch (error) {
      alert(`❌ Restore failed: ${error}`);
    } finally {
      setRestoring(null);
    }
  };

  const deleteBackup = async (backupName: string) => {
    if (!confirm(`Are you sure you want to delete backup "${backupName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/backup/${encodeURIComponent(backupName)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': localStorage.getItem('adminAuth') || '',
        },
      });

      if (response.ok) {
        alert(`✅ Backup deleted: ${backupName}`);
        fetchBackups();
      } else {
        alert('❌ Failed to delete backup');
      }
    } catch (error) {
      alert(`❌ Delete failed: ${error}`);
    }
  };

  const exportData = async () => {
    try {
      const response = await fetch('/api/admin/backup/export', {
        headers: {
          'Authorization': localStorage.getItem('adminAuth') || '',
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ghar-nari-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        alert('✅ Data exported successfully!');
      }
    } catch (error) {
      alert(`❌ Export failed: ${error}`);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // src/components/admin/BackupManager.tsx
// Find and replace the formatDate function:

const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) {
    return 'Unknown Date';
  }

  try {
    // Handle both Date objects and date strings
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }

    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj);
  } catch (error) {
    console.warn('Date formatting error:', error, 'Date value:', date);
    return 'Invalid Date';
  }
};


  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-earth-green-600 mx-auto"></div>
        <p className="mt-4 text-earth-green-600">Loading backup data...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-serif text-3xl font-bold text-earth-green-800 flex items-center space-x-2">
          <Database className="h-8 w-8" />
          <span>Backup & Data Management</span>
        </h2>
        
        <button
          onClick={fetchBackups}
          className="btn-secondary flex items-center space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Backup Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="admin-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-earth-green-600">Total Backups</p>
              <p className="text-3xl font-bold text-earth-green-800">{backups.length}</p>
            </div>
            <Database className="h-8 w-8 text-earth-green-500" />
          </div>
        </div>

        <div className="admin-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-earth-green-600">Last Backup</p>
              <p className="text-lg font-semibold text-earth-green-800">
                {lastBackup ? formatDate(lastBackup) : 'Never'}
              </p>
            </div>
            <Clock className="h-8 w-8 text-earth-green-500" />
          </div>
        </div>

        <div className="admin-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-earth-green-600">Auto Backup</p>
              <p className="text-lg font-semibold text-green-600 flex items-center space-x-1">
                <CheckCircle className="h-4 w-4" />
                <span>Daily at Midnight</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mb-8">
        <button
          onClick={createBackup}
          disabled={creating}
          className="btn-primary flex items-center space-x-2"
        >
          <Database className="h-4 w-4" />
          <span>{creating ? 'Creating...' : 'Create Backup Now'}</span>
        </button>

        <button
          onClick={exportData}
          className="btn-secondary flex items-center space-x-2"
        >
          <Download className="h-4 w-4" />
          <span>Export All Data</span>
        </button>
      </div>

      {/* Backup List */}
      <div className="admin-card">
        <h3 className="font-serif text-xl font-semibold text-earth-green-800 mb-6">
          Available Backups
        </h3>

        {backups.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-earth-green-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-earth-green-800">File Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-earth-green-800">Created</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-earth-green-800">Size</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-earth-green-800">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-earth-green-100">
                {backups.map((backup) => (
                  <tr key={backup.name} className="hover:bg-earth-green-50">
                    <td className="px-6 py-4 text-sm font-medium text-earth-green-800">
                      {backup.name}
                    </td>
                    // In the table body, add safe date rendering:

                    <td className="px-6 py-4 text-sm text-earth-green-600">
                    {formatDate(backup.created)}
                    </td>

                    <td className="px-6 py-4 text-sm text-earth-green-600">
                      {formatFileSize(backup.size)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => restoreBackup(backup.name)}
                          disabled={restoring === backup.name}
                          className="text-blue-600 hover:text-blue-800 transition-colors flex items-center space-x-1"
                          title="Restore from this backup"
                        >
                          <Upload className="h-4 w-4" />
                          <span>{restoring === backup.name ? 'Restoring...' : 'Restore'}</span>
                        </button>
                        
                        <button
                          onClick={() => deleteBackup(backup.name)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Delete this backup"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Database className="h-12 w-12 text-earth-green-300 mx-auto mb-4" />
            <p className="text-earth-green-600 text-lg mb-2">No backups found</p>
            <p className="text-earth-green-500 text-sm">Create your first backup to get started</p>
          </div>
        )}
      </div>

      {/* Warning Notice */}
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start space-x-3">
        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-yellow-800">
          <p className="font-semibold mb-1">Important Notes:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Backups are created automatically every day at midnight</li>
            <li>Only the last 30 backups are kept to save storage space</li>
            <li>Restoring a backup will replace ALL current data</li>
            <li>A backup is automatically created before any restore operation</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
