import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';

const faqs = [
  {
    question: "Comment fonctionne le diagnostic IA ?",
    answer: "C'est très simple : prenez une photo de la partie malade de votre plante (feuille, tige, fruit) ou de votre animal. Téléversez-la sur notre plateforme. Notre intelligence artificielle analyse l'image instantanément et vous indique la maladie probable avec un niveau de confiance, ainsi que les traitements recommandés."
  },
  {
    question: "Est-ce que l'application fonctionne sans internet ?",
    answer: "Pour l'instant, une connexion internet est requise pour effectuer le diagnostic IA, car l'analyse nécessite la puissance de nos serveurs. Cependant, vous pouvez consulter l'historique de vos anciens diagnostics hors-ligne."
  },
  {
    question: "Comment puis-je devenir fournisseur partenaire ?",
    answer: "Cliquez sur 'S'inscrire' puis 'Fournisseur'. Remplissez le formulaire avec les informations de votre entreprise. Une fois inscrit, vous pourrez immédiatement ajouter vos produits et recevoir des demandes de la part des agriculteurs."
  },
  {
    question: "L'inscription est-elle vraiment gratuite ?",
    answer: "Oui, la création d'un compte agriculteur et l'utilisation des fonctions de base (diagnostic IA, annuaire des fournisseurs) sont totalement gratuites."
  }
];

export function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="py-20 bg-gray-50 min-h-[calc(100vh-64px)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Questions Fréquentes</h1>
          <p className="text-gray-600">Retrouvez les réponses aux questions les plus posées par notre communauté.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-2xl overflow-hidden transition-all duration-200 shadow-sm">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="text-lg font-semibold text-gray-900">{faq.question}</span>
                <ChevronDown className={cn("w-5 h-5 text-gray-400 transition-transform duration-200", openIndex === index && "rotate-180")} />
              </button>
              <div 
                className={cn(
                  "px-6 overflow-hidden transition-all duration-200 ease-in-out",
                  openIndex === index ? "pb-6 max-h-[400px] opacity-100" : "max-h-0 opacity-0"
                )}
              >
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
