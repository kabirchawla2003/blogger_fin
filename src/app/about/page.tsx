import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { DataStorage } from '@/lib/storage';
import { PenTool, Heart, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation'; 

export default async function AboutPage() {
  const settings = await DataStorage.getSettings();

  return (
    <div className="min-h-screen bg-warm-cream">
      <Navigation />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-earth-green-600 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6">
              About {settings.authorName}
            </h1>
            <p className="text-xl text-earth-green-100 max-w-2xl mx-auto">
              {settings.tagline}
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <div className="prose prose-lg max-w-none">
                  <h2 className="font-serif text-3xl font-bold text-earth-green-800 mb-6">
                    My Story
                  </h2>
                  <p className="text-earth-green-700 leading-relaxed mb-6">
                    {settings.aboutSection}
                  </p>
                  <p className="text-earth-green-700 leading-relaxed mb-6">
                    Welcome to my literary sanctuary, where words dance on pages and stories come alive. 
                    This space represents my journey through the realm of storytelling, where I explore 
                    the depths of human experience through carefully crafted narratives.
                  </p>
                  <p className="text-earth-green-700 leading-relaxed">
                    Every post here is a window into different worlds, emotions, and perspectives. 
                    I believe in the power of words to transform, inspire, and connect us across 
                    the boundaries of time and space.
                  </p>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-8">
                <div className="bg-white rounded-xl p-6 shadow-md">
                  <h3 className="font-serif text-xl font-semibold text-earth-green-800 mb-4 flex items-center space-x-2">
                    <PenTool className="h-5 w-5 text-earth-green-600" />
                    <span>Writing Philosophy</span>
                  </h3>
                  <ul className="space-y-3 text-earth-green-700">
                    <li className="flex items-start space-x-2">
                      <Heart className="h-4 w-4 text-terracotta mt-1 flex-shrink-0" />
                      <span>Every story has the power to touch a soul</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <BookOpen className="h-4 w-4 text-terracotta mt-1 flex-shrink-0" />
                      <span>Words are bridges between hearts and minds</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <PenTool className="h-4 w-4 text-terracotta mt-1 flex-shrink-0" />
                      <span>Authenticity is the essence of great writing</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-earth-green-50 rounded-xl p-6">
                  <h3 className="font-serif text-xl font-semibold text-earth-green-800 mb-4">
                    Connect With Me
                  </h3>
                  <p className="text-earth-green-600 text-sm mb-4">
                    Join me on this literary journey. Share your thoughts, discuss stories, 
                    and become part of our growing community of story lovers.
                  </p>
                  <Link href="/all-posts" className="btn-primary">
                    Explore My Stories
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
