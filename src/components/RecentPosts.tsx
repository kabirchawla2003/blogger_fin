// src/components/RecentPosts.tsx
import Link from 'next/link';
import Image from 'next/image';
import { DataStorage } from '@/lib/storage';
import { format } from 'date-fns';
import { Clock, Eye, Calendar } from 'lucide-react';

export default async function RecentPosts() {
  const posts = await DataStorage.getPosts();
  const recentPosts = posts
    .filter(post => post.status === 'published')
    .sort((a, b) => new Date(b.publishedAt!).getTime() - new Date(a.publishedAt!).getTime())
    .slice(0, 6);

  return (
    <section id="recent-posts" className="py-20 bg-warm-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl font-bold text-earth-green-800 mb-4">
            हाल की कहानियाँ
          </h2>
          <p className="text-lg text-earth-green-600 max-w-2xl mx-auto">
            मेरी साहित्यिक यात्रा की नवीनतम कहानियों में गोता लगाएं
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {recentPosts.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group"
            >
              {post.featuredImage && (
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={post.featuredImage}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
              )}
              
              <div className="p-6">
                <div className="flex items-center space-x-4 text-sm text-earth-green-500 mb-3">
                  <span className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(post.publishedAt!), 'MMM dd, yyyy')}</span>
                  </span>
                  
                  <span className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{post.readTime || 0} min read</span>
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

                {/* 🔥 NEW: Only show excerpt if it exists */}
                {post.excerpt && post.excerpt.trim() && (
                  <blockquote className="excerpt-simple mb-4">
                    <p className="text-earth-green-600 text-sm italic mb-0 line-clamp-3">
                      {post.excerpt}
                    </p>
                  </blockquote>
                )}

                <div className="flex items-center justify-between">
                  <span className="inline-block bg-sage/20 text-sage px-3 py-1 rounded-full text-sm font-medium">
                    {post.category}
                  </span>
                  
                  <Link
                    href={`/posts/${post.slug}`}
                    className="text-terracotta hover:text-terracotta/80 font-medium text-sm transition-colors"
                  >
                    और पढ़ें →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {recentPosts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-earth-green-600 text-lg">
              अभी तक कोई पोस्ट नहीं है। नई कहानियों के लिए जल्द ही वापस आएं!
            </p>
          </div>
        )}

        <div className="text-center mt-12">
          <Link href="/all-posts" className="btn-primary">
            सभी पोस्ट देखें
          </Link>
        </div>
      </div>
    </section>
  );
}
