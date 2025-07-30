// src/components/admin/PostEditor.tsx
'use client';

import { useState, useRef } from 'react';
import { Save, Eye, EyeOff, Upload, Bold, Italic, Underline, List, ListOrdered, Heading1, Heading2, Link, Code, Quote } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { v4 as uuidv4 } from 'uuid';

export default function PostEditor() {
  const [post, setPost] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    category: '',
    featuredImage: '',
    status: 'draft' as 'draft' | 'published' | 'scheduled',
    author: 'Admin',
  });

  const [categories] = useState(['Zindagi', 'Society', 'Parvarish', 'Sehat', 'Ghar ki baat', 'Dil se', 'Kahani']);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

const generateSlug = (title: string) => {
  console.log('🔥 generateSlug called with title:', title);
  
  if (!title) return '';
  
  // Create a hash from the title
  const hash = title
    .split('')
    .reduce((acc, char) => {
      return ((acc << 5) - acc + char.charCodeAt(0)) & 0xffffffff;
    }, 0);
  
  // Convert to positive number and then to base36 for shorter string
  const hashString = Math.abs(hash).toString(36);
  
  // Create slug with hash
  const slug = `post-${hashString}`;
  
  console.log('🎯 Generated hash-based slug:', slug);
  console.log('🎯 Slug length:', slug.length);
  
  return slug;
};


  // Enhanced title change handler with debugging
  const handleTitleChange = (title: string) => {
    console.log('🔥 handleTitleChange called with:', title);
    const generatedSlug = generateSlug(title);
    console.log('🔥 Generated slug:', generatedSlug);
    
    setPost({
      ...post,
      title,
      slug: generatedSlug,
    });
    
    console.log('🔥 Post state updated with slug:', generatedSlug);
  };

  // Formatting toolbar functions
  const insertText = (before: string, after: string = '', placeholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const textToInsert = selectedText || placeholder;
    const newText = before + textToInsert + after;
    
    const newValue = textarea.value.substring(0, start) + newText + textarea.value.substring(end);
    setPost({ ...post, content: newValue });

    // Focus and set cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + textToInsert.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 10);
  };

  const formatText = (type: string) => {
    switch (type) {
      case 'bold':
        insertText('**', '**', 'bold text');
        break;
      case 'italic':
        insertText('*', '*', 'italic text');
        break;
      case 'underline':
        insertText('<u>', '</u>', 'underlined text');
        break;
      case 'h1':
        insertText('# ', '', 'Heading 1');
        break;
      case 'h2':
        insertText('## ', '', 'Heading 2');
        break;
      case 'bulletList':
        insertText('- ', '', 'List item');
        break;
      case 'numberedList':
        insertText('1. ', '', 'List item');
        break;
      case 'link':
        insertText('[', '](url)', 'link text');
        break;
      case 'code':
        insertText('`', '`', 'code');
        break;
      case 'quote':
        insertText('> ', '', 'Quote text');
        break;
    }
  };

  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
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
        const data = await response.json();
        setPost({ ...post, featuredImage: data.url });
      } else {
        alert('Failed to upload image');
      }
    } catch (error) {
      alert('Error uploading image');
    } finally {
      setIsUploading(false);
    }
  };

  // Enhanced save handler with comprehensive debugging
  const handleSave = async () => {
    if (!post.title.trim() || !post.content.trim()) {
    alert('Title and content are required');
    return;
  }

  setIsSaving(true);

  const postData = {
    ...post,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    publishedAt: post.status === 'published' ? new Date().toISOString() : null,
    readTime: calculateReadTime(post.content),
    views: 0,
    tags: [], // Ensure tags is always an empty array
    excerpt: post.excerpt.trim() || '', // Ensure empty string if no excerpt
  };

    // 🔥 DETAILED DEBUGGING
    console.log('=== POST DATA BEING SENT ===');
    console.log('Full post data:', JSON.stringify(postData, null, 2));
    console.log('Title length:', postData.title.length);
    console.log('Content length:', postData.content.length);
    console.log('Excerpt length:', postData.excerpt.length);
    console.log('Slug:', postData.slug);
    console.log('Category:', postData.category);
    console.log('Status:', postData.status);
    console.log('Featured Image:', postData.featuredImage);

    try {
      const response = await fetch('/api/admin/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('adminAuth') || '',
        },
        body: JSON.stringify(postData),
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        alert('Post saved successfully!');
        // Reset form
        setPost({
          title: '',
          slug: '',
          content: '',
          excerpt: '',
          category: '',
          featuredImage: '',
          status: 'draft',
          author: 'Admin',
        });
      } else {
        const error = await response.json();
        
        // 🔥 ENHANCED ERROR LOGGING
        console.log('=== ERROR RESPONSE ===');
        console.log('Full error:', error);
        console.log('Error message:', error.error);
        console.log('Validation details:', error.details);
        
        // Show detailed error to user
        let errorMessage = `Failed to save post: ${error.error}`;
        if (error.details && Array.isArray(error.details)) {
          errorMessage += '\n\nValidation issues:';
          error.details.forEach((issue: any, index: number) => {
            errorMessage += `\n${index + 1}. ${issue.path?.join('.')} - ${issue.message}`;
          });
        }
        
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('Network error saving post');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-serif text-3xl font-bold text-earth-green-800">
          Write New Post
        </h2>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center space-x-2 px-4 py-2 bg-organic-brown-100 hover:bg-organic-brown-200 text-organic-brown-800 rounded-lg transition-colors"
          >
            {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span>{showPreview ? 'Hide Preview' : 'Show Preview'}</span>
          </button>
          
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? 'Saving...' : 'Save Post'}</span>
          </button>
        </div>
      </div>

      <div className={`grid gap-8 ${showPreview ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {/* Editor Section */}
        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="form-label">Title</label>
            <input
              type="text"
              value={post.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="form-input text-xl font-semibold"
              placeholder="Enter your post title..."
            />
          </div>

          {/* Slug */}
          <div>
            <label className="form-label">URL Slug</label>
            <input
              type="text"
              value={post.slug}
              onChange={(e) => setPost({ ...post, slug: e.target.value })}
              className="form-input font-mono text-sm"
              placeholder="url-friendly-slug"
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className="form-label">Excerpt</label>
            <textarea
              value={post.excerpt}
              onChange={(e) => setPost({ ...post, excerpt: e.target.value })}
              className="form-textarea h-20"
              placeholder="Brief description of your post..."
            />
          </div>

          {/* Content with Formatting Toolbar */}
          <div>
            <label className="form-label">Content (Markdown)</label>
            
            {/* Formatting Toolbar */}
            <div className="border border-earth-green-200 rounded-t-lg bg-earth-green-50 p-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => formatText('bold')}
                className="p-2 hover:bg-earth-green-100 rounded text-earth-green-700 transition-colors"
                title="Bold"
              >
                <Bold className="h-4 w-4" />
              </button>
              
              <button
                type="button"
                onClick={() => formatText('italic')}
                className="p-2 hover:bg-earth-green-100 rounded text-earth-green-700 transition-colors"
                title="Italic"
              >
                <Italic className="h-4 w-4" />
              </button>
              
              <button
                type="button"
                onClick={() => formatText('underline')}
                className="p-2 hover:bg-earth-green-100 rounded text-earth-green-700 transition-colors"
                title="Underline"
              >
                <Underline className="h-4 w-4" />
              </button>
              
              <div className="w-px h-6 bg-earth-green-300 mx-1"></div>
              
              <button
                type="button"
                onClick={() => formatText('h1')}
                className="p-2 hover:bg-earth-green-100 rounded text-earth-green-700 transition-colors"
                title="Heading 1"
              >
                <Heading1 className="h-4 w-4" />
              </button>
              
              <button
                type="button"
                onClick={() => formatText('h2')}
                className="p-2 hover:bg-earth-green-100 rounded text-earth-green-700 transition-colors"
                title="Heading 2"
              >
                <Heading2 className="h-4 w-4" />
              </button>
              
              <div className="w-px h-6 bg-earth-green-300 mx-1"></div>
              
              <button
                type="button"
                onClick={() => formatText('bulletList')}
                className="p-2 hover:bg-earth-green-100 rounded text-earth-green-700 transition-colors"
                title="Bullet List"
              >
                <List className="h-4 w-4" />
              </button>
              
              <button
                type="button"
                onClick={() => formatText('numberedList')}
                className="p-2 hover:bg-earth-green-100 rounded text-earth-green-700 transition-colors"
                title="Numbered List"
              >
                <ListOrdered className="h-4 w-4" />
              </button>
              
              <div className="w-px h-6 bg-earth-green-300 mx-1"></div>
              
              <button
                type="button"
                onClick={() => formatText('link')}
                className="p-2 hover:bg-earth-green-100 rounded text-earth-green-700 transition-colors"
                title="Link"
              >
                <Link className="h-4 w-4" />
              </button>
              
              <button
                type="button"
                onClick={() => formatText('code')}
                className="p-2 hover:bg-earth-green-100 rounded text-earth-green-700 transition-colors"
                title="Inline Code"
              >
                <Code className="h-4 w-4" />
              </button>
              
              <button
                type="button"
                onClick={() => formatText('quote')}
                className="p-2 hover:bg-earth-green-100 rounded text-earth-green-700 transition-colors"
                title="Quote"
              >
                <Quote className="h-4 w-4" />
              </button>
            </div>

            {/* Content Textarea */}
            <textarea
              ref={textareaRef}
              value={post.content}
              onChange={(e) => setPost({ ...post, content: e.target.value })}
              className="form-textarea h-96 font-mono text-sm border-t-0 rounded-t-none"
              placeholder="Write your post content in Markdown..."
            />
          </div>

          {/* Category and Status */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="form-label">Category</label>
              <select
                value={post.category}
                onChange={(e) => setPost({ ...post, category: e.target.value })}
                className="form-input"
              >
                <option value="">Select category...</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Status</label>
              <select
                value={post.status}
                onChange={(e) => setPost({ ...post, status: e.target.value as any })}
                className="form-input"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>
          </div>

          {/* Featured Image */}
          <div>
            <label className="form-label">Featured Image</label>
            <div className="space-y-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="form-input"
                disabled={isUploading}
              />
              {isUploading && (
                <p className="text-earth-green-600 text-sm">Uploading image...</p>
              )}
              {post.featuredImage && (
                <div className="relative w-full h-48 rounded-lg overflow-hidden border border-earth-green-200">
                  <img
                    src={post.featuredImage}
                    alt="Featured"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Preview Section */}
        {showPreview && (
          <div className="border-l border-earth-green-200 pl-8">
            <h3 className="font-serif text-2xl font-bold text-earth-green-800 mb-6">
              Preview
            </h3>
            
            <div className="bg-white rounded-xl p-6 shadow-md">
              {post.featuredImage && (
                <div className="relative w-full h-48 rounded-lg overflow-hidden mb-6">
                  <img
                    src={post.featuredImage}
                    alt="Featured"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <h1 className="font-serif text-3xl font-bold text-earth-green-800 mb-4">
                {post.title || 'Post Title'}
              </h1>
              
              {post.excerpt && (
                <blockquote className="excerpt-quote mb-6">
                  <p className="text-xl text-earth-green-700 leading-relaxed italic font-medium mb-0 relative z-10">
                    {post.excerpt}
                  </p>
                </blockquote>
              )}
              
              <div className="prose-custom">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                >
                  {post.content || '*Start writing to see preview...*'}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
