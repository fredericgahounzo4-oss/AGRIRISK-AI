import { Link, useParams, Navigate } from 'react-router-dom';
import { ArrowLeft, Calendar } from 'lucide-react';
import { getPostBySlug, posts } from '../data/posts';
import { BlogIllustration } from '../components/BlogIllustration';

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = getPostBySlug(slug);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const otherPosts = posts.filter((p) => p.id !== post.id).slice(0, 2);

  return (
    <div className="py-16 bg-white min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-medium text-[#1a5c2a] hover:underline mb-8">
          <ArrowLeft className="w-4 h-4" /> Retour au blog
        </Link>

        <div className="h-64 sm:h-80 rounded-3xl overflow-hidden shadow-lg mb-8">
          <BlogIllustration icon={post.icon} accent={post.accent} gradientId="post-hero" iconSize={72} />
        </div>

        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold text-[#1a5c2a] bg-[#e8f5e9] mb-4">
          {post.category}
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 leading-tight">{post.title}</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-10">
          <Calendar className="w-4 h-4" />
          {post.date}
        </div>

        <div className="space-y-8">
          {post.sections.map((section, i) => (
            <div key={i}>
              {section.heading && (
                <h2 className="text-xl font-bold text-gray-900 mb-3">{section.heading}</h2>
              )}
              {section.paragraphs.map((p, j) => (
                <p key={j} className="text-gray-700 leading-relaxed mb-4">{p}</p>
              ))}
              {section.list && (
                <ul className="space-y-2 mt-2">
                  {section.list.map((item, k) => (
                    <li key={k} className="flex items-start gap-3 text-gray-700">
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#22c55e] shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {otherPosts.length > 0 && (
          <div className="mt-16 pt-10 border-t border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">À lire aussi</h3>
            <div className="grid sm:grid-cols-2 gap-6">
              {otherPosts.map((p) => (
                <Link
                  key={p.id}
                  to={`/blog/${p.slug}`}
                  className="flex gap-4 p-4 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                    <BlogIllustration icon={p.icon} accent={p.accent} gradientId={`related-${p.id}`} iconSize={28} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400 mb-1">{p.date}</p>
                    <p className="text-sm font-bold text-gray-900 line-clamp-2">{p.title}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
