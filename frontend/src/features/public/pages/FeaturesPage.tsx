import { Leaf, CheckCircle, Microscope, MessageCircle, Network } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

function FeatureIllustration({ icon: Icon, gradientId }: { icon: LucideIcon; gradientId: string }) {
  return (
    <svg viewBox="0 0 500 400" role="img" className="relative z-10 rounded-3xl shadow-xl w-full h-[400px]">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e8f5e9" />
          <stop offset="100%" stopColor="#c8e6c9" />
        </linearGradient>
      </defs>
      <rect width="500" height="400" rx="24" fill={`url(#${gradientId})`} />
      <circle cx="60" cy="340" r="70" fill="#1a5c2a" opacity="0.06" />
      <circle cx="440" cy="60" r="90" fill="#1a5c2a" opacity="0.06" />
      <circle cx="250" cy="200" r="90" fill="#ffffff" />
      <foreignObject x="200" y="150" width="100" height="100">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
          <Icon size={56} color="#1a5c2a" strokeWidth={1.5} />
        </div>
      </foreignObject>
    </svg>
  );
}

export function FeaturesPage() {
  const features = [
    {
      title: "Diagnostic Phytosanitaire et Animal",
      desc: "Grâce à notre modèle d'Intelligence Artificielle entraîné sur des milliers d'images, détectez instantanément les maladies de vos cultures et de vos animaux. Recevez un rapport détaillé avec le niveau de risque et les traitements recommandés.",
      icon: Microscope,
      points: ["Analyse instantanée par photo", "Précision de 95%", "Recommandations de traitements locaux"]
    },
    {
      title: "Assistant Agronome Virtuel",
      desc: "Posez toutes vos questions à notre assistant conversationnel spécialisé en agriculture africaine. De la préparation du sol à la récolte, obtenez des conseils adaptés à votre région et à vos cultures.",
      icon: MessageCircle,
      points: ["Disponible 24h/24 et 7j/7", "Conseils personnalisés", "Historique de vos conversations"]
    },
    {
      title: "Mise en relation B2B",
      desc: "Accédez à un vaste réseau de fournisseurs certifiés. Comparez les produits, consultez les avis et trouvez les intrants agricoles les plus proches de votre exploitation grâce à notre carte interactive.",
      icon: Network,
      points: ["Fournisseurs vérifiés", "Géolocalisation précise", "Demandes de devis en ligne"]
    }
  ];

  return (
    <div className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Nos Fonctionnalités</h1>
          <p className="text-lg text-gray-600">Découvrez comment AgriRisk AI facilite votre quotidien d'agriculteur en vous offrant des outils technologiques de pointe.</p>
        </div>

        <div className="space-y-24">
          {features.map((feat, idx) => (
            <div key={idx} className={`flex flex-col lg:flex-row items-center gap-12 ${idx % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>
              <div className="flex-1 space-y-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e8f5e9]">
                  <Leaf className="w-6 h-6 text-[#1a5c2a]" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">{feat.title}</h2>
                <p className="text-lg text-gray-600 leading-relaxed">{feat.desc}</p>
                <ul className="space-y-3 pt-4">
                  {feat.points.map((p, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-[#22c55e]" />
                      <span className="text-gray-700 font-medium">{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 relative">
                <div className="absolute inset-0 bg-[#22c55e] rounded-3xl translate-x-4 translate-y-4 opacity-20"></div>
                <FeatureIllustration icon={feat.icon} gradientId={`feature-grad-${idx}`} />
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
