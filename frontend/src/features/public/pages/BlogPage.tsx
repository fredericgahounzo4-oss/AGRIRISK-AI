import { ArrowRight, Bug, Cpu, Handshake } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const posts = [
  {
    id: 1,
    title: "Comment lutter efficacement contre la rouille du maïs cette saison",
    excerpt: "La rouille du maïs fait son retour. Découvrez nos meilleures pratiques et traitements pour protéger vos parcelles.",
    category: "Conseil Agronomique",
    date: "18 Mai 2024",
    icon: Bug,
  },
  {
    id: 2,
    title: "Intelligence Artificielle : Quel avenir pour l'agriculture africaine ?",
    excerpt: "L'IA n'est plus de la science-fiction. Comment les petits exploitants peuvent-ils en tirer profit dès aujourd'hui ?",
    category: "Technologie",
    date: "12 Mai 2024",
    icon: Cpu,
  },
  {
    id: 3,
    title: "Nouveau partenariat avec l'association des semenciers",
    excerpt: "Plus de 50 nouveaux fournisseurs certifiés rejoignent AgriRisk AI pour vous proposer les meilleures semences.",
    category: "Actualités",
    date: "5 Mai 2024",
    icon: Handshake,
  }
];

function PostIllustration({ icon: Icon, gradientId }: { icon: LucideIcon; gradientId: string }) {
  return (
    <svg viewBox="0 0 400 200" role="img" className="w-full h-full">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1a5c2a" />
          <stop offset="100%" stopColor="#0a1f11" />
        </linearGradient>
      </defs>
      <rect width="400" height="200" fill={`url(#${gradientId})`} />
      <circle cx="40" cy="170" r="60" fill="#22c55e" opacity="0.15" />
      <circle cx="360" cy="30" r="70" fill="#4ade80" opacity="0.12" />
      <foreignObject x="160" y="60" width="80" height="80">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
          <Icon size={40} color="#ffffff" strokeWidth={1.5} />
        </div>
      </foreignObject>
    </svg>
  );
}

function comingSoon() {
  toast('Le blog complet arrive bientôt !', { icon: '📝' });
}

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
              <div className="relative h-48 overflow-hidden">
                <PostIllustration icon={post.icon} gradientId={`post-grad-${post.id}`} />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-[#1a5c2a]">
                  {post.category}
                </div>
              </div>
              <div className="p-6">
                <p className="text-xs text-gray-400 mb-3">{post.date}</p>
                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-[#1a5c2a] transition-colors">
                  {post.title}
                </h3>
                <p className="text-gray-600 text-sm mb-5 line-clamp-3">
                  {post.excerpt}
                </p>
                <button
                  onClick={comingSoon}
                  className="inline-flex items-center gap-2 text-sm font-bold text-[#1a5c2a] group-hover:gap-3 transition-all"
                >
                  Lire l'article <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-16 text-center">
          <button
            onClick={comingSoon}
            className="px-6 py-3 border-2 border-gray-200 rounded-xl font-medium text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Voir tous les articles
          </button>
        </div>
      </div>
    </div>
  );
}
