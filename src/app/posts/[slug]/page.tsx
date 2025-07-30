// src/app/posts/[slug]/page.tsx
import { notFound } from 'next/navigation';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Comments from '@/components/Comments';
import ShareButton from '@/components/ShareButton';
import { DataStorage } from '@/lib/storage';
import { format } from 'date-fns';
import { Calendar, Clock, Eye, Tag, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

// Helper function for safe date formatting
function formatPostDate(publishedAt: string | null, createdAt: string): string {
  // Try publishedAt first
  if (publishedAt && publishedAt.trim() !== '') {
    try {
      const publishDate = new Date(publishedAt);
      if (!isNaN(publishDate.getTime())) {
        return format(publishDate, 'MMMM dd, yyyy');
      }
    } catch (error) {
      console.warn('Invalid publishedAt date:', publishedAt);
    }
  }
  
  // Fall back to createdAt
  try {
    const createDate = new Date(createdAt);
    return isNaN(createDate.getTime()) 
      ? 'Unknown Date' 
      : format(createDate, 'MMMM dd, yyyy');
  } catch (error) {
    return 'Unknown Date';
  }
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const posts = await DataStorage.getPosts();
  const post = posts.find(p => p.slug === slug && p.status === 'published');
  
  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: `${post.title} | घर नारी`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.featuredImage ? [{ url: post.featuredImage }] : [],
    },
  };
}

// Track view
async function trackView(postId: string) {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/posts/${postId}/view`, {
      method: 'POST',
    });
  } catch (error) {
    console.error('Error tracking view:', error);
  }
}

export default async function PostPage({ params }: Props) {
  const encodedSlug = (await params).slug;
  const slug = decodeURIComponent(encodedSlug);
  if (!slug) {
    notFound();
  }

  const posts = await DataStorage.getPosts();
  const post = posts.find(p => p.slug === slug && p.status === 'published');
  
  if (!post) {
    notFound();
  }

  // Track view on server side
  trackView(post.id);

  const relatedPosts = posts
    .filter(p => p.id !== post.id && p.status === 'published' && p.category === post.category)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-warm-cream">
      <Navigation />
      
      <main className="pt-20">
        {/* Header */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <Link 
              href="/all-posts"
              className="inline-flex items-center space-x-2 text-earth-green-600 hover:text-terracotta transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to All Posts</span>
            </Link>

            <div className="flex flex-wrap items-center gap-4 text-sm text-earth-green-500 mb-6">
              <span className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{formatPostDate(post.publishedAt, post.createdAt)}</span>
              </span>
              
              <span className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{post.readTime || 0} minute read</span>
              </span>
              
              <span className="flex items-center space-x-1">
                <Eye className="h-4 w-4" />
                <span>{(post.views || 0) + 1} views</span>
              </span>

              <span className="inline-block bg-sage/20 text-sage px-3 py-1 rounded-full font-medium">
                {post.category}
              </span>
            </div>

            <h1 className="font-serif text-4xl md:text-5xl font-bold text-earth-green-800 mb-6 leading-tight">
              {post.title}
            </h1>

            {/* 🔥 NEW: Only show excerpt if it exists */}
            {post.excerpt && post.excerpt.trim() && (
              <blockquote className="excerpt-quote mb-8">
                <p className="text-xl text-earth-green-700 leading-relaxed italic font-medium mb-0 relative z-10">
                  {post.excerpt}
                </p>
              </blockquote>
            )}

            <ShareButton title={post.title} />
          </div>

          {post.featuredImage && (
            <div className="relative h-64 md:h-96 rounded-xl overflow-hidden mb-12">
              <Image
                src={post.featuredImage}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Content */}
          <div className="prose-custom">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={{
                img: ({ src, alt }) => (
                  <div className="relative h-64 md:h-96 rounded-lg overflow-hidden my-8">
                    <Image
                      src={src || ''}
                      alt={alt || ''}
                      fill
                      className="object-cover"
                    />
                  </div>
                ),
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          {/* Author Bio */}
          <div className="mt-16 p-8 bg-earth-green-50 rounded-xl">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-earth-green-200 rounded-full flex items-center justify-center">
                <span className="text-earth-green-700 font-serif font-bold text-xl">
                  {post.author.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="font-serif text-xl font-semibold text-earth-green-800 mb-2">
                  {post.author}
                </h3>
                <p className="text-earth-green-600">
                  दिल से एक कहानीकार, जीवन के खूबसूरत पलों से कहानियाँ बुनता हूं।
                </p>
              </div>
            </div>
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="bg-white py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="font-serif text-3xl font-bold text-earth-green-800 mb-8 text-center">
                संबंधित कहानियाँ
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {relatedPosts.map((relatedPost) => (
                  <article
                    key={relatedPost.id}
                    className="bg-warm-cream rounded-xl p-6 hover:shadow-lg transition-shadow"
                  >
                    <h3 className="font-serif text-lg font-semibold text-earth-green-800 mb-3">
                      <Link 
                        href={`/posts/${relatedPost.slug}`}
                        className="hover:text-terracotta transition-colors"
                      >
                        {relatedPost.title}
                      </Link>
                    </h3>
                    
                    <blockquote className="border-l-4 border-sage bg-earth-green-50 pl-4 pr-3 py-3 mb-4 rounded-r-md">
                      <p className="text-earth-green-600 text-sm italic mb-0 line-clamp-3">
                        {relatedPost.excerpt}
                      </p>
                    </blockquote>
                    
                    <div className="flex items-center justify-between text-xs text-earth-green-500">
                      <span>{formatPostDate(relatedPost.publishedAt, relatedPost.createdAt)}</span>
                      <span>{relatedPost.readTime || 0} min read</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Comments Section */}
        <Comments postId={post.id} />
      </main>

      <Footer />
    </div>
  );
}
