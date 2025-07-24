// src/components/Footer.tsx
import { DataStorage } from '@/lib/storage';
import { Heart, Twitter, Linkedin, Github } from 'lucide-react';

export default async function Footer() {
  const settings = await DataStorage.getSettings();

  return (
    <footer className="bg-earth-green-800 text-earth-green-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="font-serif text-xl font-bold text-white mb-4">
              {settings.siteName}
            </h3>
            <p className="text-earth-green-200 leading-relaxed">
              {settings.aboutSection}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-serif text-xl font-bold text-white mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-earth-green-200 hover:text-white transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="/all-posts" className="text-earth-green-200 hover:text-white transition-colors">
                  All Posts
                </a>
              </li>
              <li>
                <a href="/about" className="text-earth-green-200 hover:text-white transition-colors">
                  About
                </a>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="font-serif text-xl font-bold text-white mb-4">
              Connect
            </h3>
            <div className="flex space-x-4">
              {settings.socialLinks.twitter && (
                <a
                  href={settings.socialLinks.twitter}
                  className="text-earth-green-200 hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              )}
              {settings.socialLinks.linkedin && (
                <a
                  href={settings.socialLinks.linkedin}
                  className="text-earth-green-200 hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              )}
              {settings.socialLinks.github && (
                <a
                  href={settings.socialLinks.github}
                  className="text-earth-green-200 hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-earth-green-700 mt-8 pt-8 text-center">
          <p className="text-earth-green-200 flex items-center justify-center space-x-1">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-terracotta" />
            <span>by {settings.authorName}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
