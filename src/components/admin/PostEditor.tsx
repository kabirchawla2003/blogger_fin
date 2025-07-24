// components/admin/PostEditor.tsx
'use client';

import { useState, useEffect } from 'react';
import { Save, Eye, Calendar, Upload, Tag, Folder } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { v4 as uuidv4 } from 'uuid';

interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: string;
  category: string;
  tags: string[];
  featuredImage?: string;
  status: 'draft' | 'published' | 'scheduled';
  publishedAt?: string;
  scheduledFor?: string;
}

export default function PostEditor() {
  const [post, setPost] = useState<BlogPost>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    author: 'Author Name',
    category: '',
    tags: [],
    status: 'draft',
  });
  
  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [categories] = useState(['Zindagi', 'Society', 'Parvarish', 'Sehat', 'Ghar ki baat', 'Dil se', 'Kahani']);


  useEffect(() => {
    if (post.title) {
      const slug = post.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setPost(prev => ({ ...prev, slug }));
    }
  }, [post.title]);

  const handleSave = async (status: 'draft' | 'published' | 'scheduled' = post.status) => {
    if (!post.title.trim() || !post.content.trim()) {
      alert('Title and content are required');
      return;
    }

    setSaving(true);

    try {
      const postData = {
        ...post,
        status,
        publishedAt: status === 'published' ? new Date().toISOString() : post.publishedAt,
        readTime: Math.ceil(post.content.split(' ').length / 200),
      };

      const response = await fetch('/api/admin/posts', {
        method: post.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('adminAuth') || '',
        },
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        const savedPost = await response.json();
        setPost(savedPost);
        alert(`Post ${status === 'draft' ? 'saved as draft' : status === 'published' ? 'published' : 'scheduled'} successfully!`);
      } else {
        throw new Error('Failed to save post');
      }
    } catch (error) {
      alert('Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          'Authorization': localStorage.getItem('adminAuth') || '',
        },
        body: formData,
      });

      if (response.ok) {
        const { url } = await response.json();
        setPost(prev => ({ ...prev, featuredImage: url }));
      }
    } catch (error) {
      alert('Failed to upload image');
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !post.tags.includes(tagInput.trim())) {
      setPost(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setPost(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-serif text-3xl font-bold text-earth-green-800">
          {post.id ? 'Edit Post' : 'Create New Post'}
        </h2>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center space-x-2 btn-secondary"
          >
            <Eye className="h-4 w-4" />
            <span>{previewMode ? 'Edit' : 'Preview'}</span>
          </button>
          
          <button
            onClick={() => handleSave('draft')}
            disabled={saving}
            className="flex items-center space-x-2 btn-secondary"
          >
            <Save className="h-4 w-4" />
            <span>Save Draft</span>
          </button>
          
          <button
            onClick={() => handleSave('published')}
            disabled={saving}
            className="flex items-center space-x-2 btn-primary"
          >
            <span>{saving ? 'Publishing...' : 'Publish'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Editor */}
        <div className="lg:col-span-3">
          {!previewMode ? (
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-earth-green-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={post.title}
                  onChange={(e) => setPost({ ...post, title: e.target.value })}
                  className="input-field w-full text-xl font-serif"
                  placeholder="Enter your story title..."
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-earth-green-700 mb-2">
                  URL Slug
                </label>
                <input
                  type="text"
                  value={post.slug}
                  onChange={(e) => setPost({ ...post, slug: e.target.value })}
                  className="input-field w-full font-mono text-sm"
                  placeholder="url-friendly-slug"
                />
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-medium text-earth-green-700 mb-2">
                  Excerpt
                </label>
                <textarea
                  value={post.excerpt}
                  onChange={(e) => setPost({ ...post, excerpt: e.target.value })}
                  className="input-field w-full h-20 resize-none"
                  placeholder="Brief description of your post..."
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-earth-green-700 mb-2">
                  Content (Markdown)
                </label>
                <textarea
                  value={post.content}
                  onChange={(e) => setPost({ ...post, content: e.target.value })}
                  className="input-field w-full h-96 font-mono text-sm resize-none"
                  placeholder="Write your story here using Markdown..."
                />
              </div>
            </div>
          ) : (
            /* Preview */
            <div className="prose-custom">
              <h1 className="font-serif text-4xl font-bold text-earth-green-800 mb-4">
                {post.title || 'Untitled Post'}
              </h1>
              
              {post.excerpt && (
                <p className="text-xl text-earth-green-600 mb-8 italic">
                  {post.excerpt}
                </p>
              )}
              
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {post.content || 'No content yet...'}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish Settings */}
          <div className="bg-earth-green-50 rounded-lg p-6">
            <h3 className="font-semibold text-earth-green-800 mb-4 flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Publish Settings</span>
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-earth-green-700 mb-2">
                  Status
                </label>
                <select
                  value={post.status}
                  onChange={(e) => setPost({ ...post, status: e.target.value as any })}
                  className="input-field w-full"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>

              {post.status === 'scheduled' && (
                <div>
                  <label className="block text-sm font-medium text-earth-green-700 mb-2">
                    Publish Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={post.scheduledFor}
                    onChange={(e) => setPost({ ...post, scheduledFor: e.target.value })}
                    className="input-field w-full"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Category */}
          <div className="bg-earth-green-50 rounded-lg p-6">
            <h3 className="font-semibold text-earth-green-800 mb-4 flex items-center space-x-2">
              <Folder className="h-5 w-5" />
              <span>Category</span>
            </h3>
            
            <select
              value={post.category}
              onChange={(e) => setPost({ ...post, category: e.target.value })}
              className="input-field w-full"
            >
              <option value="">Select category...</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="bg-earth-green-50 rounded-lg p-6">
            <h3 className="font-semibold text-earth-green-800 mb-4 flex items-center space-x-2">
              <Tag className="h-5 w-5" />
              <span>Tags</span>
            </h3>
            
            <div className="space-y-3">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="input-field flex-1"
                  placeholder="Add tag..."
                />
                <button
                  onClick={addTag}
                  className="bg-earth-green-600 text-white px-3 py-2 rounded-lg hover:bg-earth-green-700 transition-colors"
                >
                  Add
                </button>
              </div>
              
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.map(tag => (
                    <span
                      key={tag}
                      className="bg-sage text-white px-3 py-1 rounded-full text-sm flex items-center space-x-1 cursor-pointer"
                      onClick={() => removeTag(tag)}
                    >
                      <span>{tag}</span>
                      <span>×</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Featured Image */}
          <div className="bg-earth-green-50 rounded-lg p-6">
            <h3 className="font-semibold text-earth-green-800 mb-4 flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Featured Image</span>
            </h3>
            
            <div className="space-y-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="input-field w-full"
              />
              
              {post.featuredImage && (
                <div className="relative">
                  <img
                    src={post.featuredImage}
                    alt="Featured"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => setPost({ ...post, featuredImage: undefined })}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
