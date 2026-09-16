import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { posts } from '../data/posts';
import { BlogIllustration } from '../components/BlogIllustration';

export function BlogPage() {
  return (
    <div className="py-20 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Le Blog AgriRisk</h1>
          <p className="text-lg text-gray-600">Actualités, conseils agronomiques et nouveautés technologiques.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map(post => (
            <article key={post.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all group">
              <Link to={`/blog/${post.slug}`} className="block relative h-48 overflow-hidden">
                <BlogIllustration icon={post.icon} accent={post.accent} gradientId={`post-grad-${post.id}`} />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-[#1a5c2a]">
                  {post.category}
                </div>
              </Link>
              <div className="p-6">
                <p className="text-xs text-gray-400 mb-3">{post.date}</p>
                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-[#1a5c2a] transition-colors">
                  {post.title}
                </h3>
                <p className="text-gray-600 text-sm mb-5 line-clamp-3">
                  {post.excerpt}
                </p>
                <Link
                  to={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-2 text-sm font-bold text-[#1a5c2a] group-hover:gap-3 transition-all"
                >
                  Lire l'article <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
