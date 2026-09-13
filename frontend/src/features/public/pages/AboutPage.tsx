export function AboutPage() {
  return (
    <div className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Notre Mission</h1>
        <p className="text-xl text-gray-600 leading-relaxed mb-12">
          AgriRisk AI a été fondée avec une vision claire : démocratiser l'accès aux technologies de pointe pour les agriculteurs africains. 
          Nous croyons que l'Intelligence Artificielle peut transformer l'agriculture en réduisant les pertes liées aux maladies et en optimisant les rendements.
        </p>
        
        <div className="grid md:grid-cols-2 gap-8 mt-16 text-left">
          <div className="p-8 bg-[#f7f9f7] rounded-2xl">
            <h3 className="text-2xl font-bold text-[#1a2e1d] mb-4">Pour les agriculteurs</h3>
            <p className="text-gray-600">Nous fournissons un outil de diagnostic de poche, rapide et fiable, qui aide à prendre les bonnes décisions au bon moment pour sauver les récoltes.</p>
          </div>
          <div className="p-8 bg-[#f7f9f7] rounded-2xl">
            <h3 className="text-2xl font-bold text-[#1a2e1d] mb-4">Pour les fournisseurs</h3>
            <p className="text-gray-600">Nous offrons une vitrine digitale qui connecte directement les vendeurs de produits agricoles avec ceux qui en ont le plus besoin, stimulant ainsi l'économie locale.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
