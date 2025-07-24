// src/components/AllPostsClient.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Filter, Calendar, Eye, Clock, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { BlogPost } from '@/lib/types'; // Import the actual type

interface AllPostsClientProps {
  posts: BlogPost[];
  categories: string[];
}

export default function AllPostsClient({ posts, categories }: AllPostsClientProps) {
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>(posts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    filterAndSortPosts();
  }, [posts, searchTerm, selectedCategory, sortBy]);

  const filterAndSortPosts = () => {
    let filtered = posts.filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });

    // Sort posts with defensive programming
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          // Handle null/undefined publishedAt values defensively
          const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
          const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
          return dateB - dateA;
        case 'popularity':
          return (b.views || 0) - (a.views || 0);
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    setFilteredPosts(filtered);
  };

  // Helper function to safely format dates
  const formatPostDate = (publishedAt: string | null) => {
    if (!publishedAt) return 'Draft';
    try {
      return format(new Date(publishedAt), 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  return (
    <>
      {/* Filters */}
      <section className="bg-white border-b border-earth-green-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-earth-green-400" />
              <input
                type="text"
                placeholder="Search posts, tags, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-earth-green-200 rounded-lg focus:outline-none focus:border-earth-green-500 focus:ring-2 focus:ring-earth-green-200"
              />
            </div>

            <div className="flex gap-4">
              {/* Category Filter */}
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none bg-white border border-earth-green-200 rounded-lg px-4 py-3 pr-8 focus:outline-none focus:border-earth-green-500 focus:ring-2 focus:ring-earth-green-200"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-5 w-5 text-earth-green-400 pointer-events-none" />
              </div>

              {/* Sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-earth-green-200 rounded-lg px-4 py-3 pr-8 focus:outline-none focus:border-earth-green-500 focus:ring-2 focus:ring-earth-green-200"
                >
                  <option value="date">Latest First</option>
                  <option value="popularity">Most Popular</option>
                  <option value="title">Alphabetical</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-5 w-5 text-earth-green-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="mt-4 text-sm text-earth-green-600">
            Showing {filteredPosts.length} of {posts.length} posts
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  {post.featuredImage && (
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={post.featuredImage}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="flex items-center space-x-4 text-sm text-earth-green-500 mb-3">
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatPostDate(post.publishedAt)}</span>
                      </span>
                      
                      <span className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{post.readTime || 0} min</span>
                      </span>
                      
                      <span className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>{post.views || 0}</span>
                      </span>
                    </div>

                    <h3 className="font-serif text-xl font-semibold text-earth-green-800 mb-3 group-hover:text-terracotta transition-colors">
                      <Link href={`/posts/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h3>

                    <p className="text-earth-green-600 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="inline-block bg-sage/20 text-sage px-3 py-1 rounded-full text-sm font-medium">
                        {post.category || 'Uncategorized'}
                      </span>
                      
                      <Link
                        href={`/posts/${post.slug}`}
                        className="text-terracotta hover:text-terracotta/80 font-medium text-sm transition-colors"
                      >
                        Read More →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-earth-green-600 text-lg mb-4">
                No posts found matching your criteria.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSortBy('date');
                }}
                className="btn-secondary"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
