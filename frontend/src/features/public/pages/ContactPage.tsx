import { Mail, MapPin, Phone } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function ContactPage() {
  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contactez-nous</h1>
          <p className="text-lg text-gray-600">Une question, une suggestion ou besoin d'assistance ? Notre équipe est là pour vous aider.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Info */}
          <div className="lg:col-span-1 space-y-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e8f5e9] shrink-0">
                <MapPin className="w-6 h-6 text-[#1a5c2a]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Notre bureau</h3>
                <p className="text-gray-600 mt-1">Plateau, Abidjan<br />Côte d'Ivoire</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e8f5e9] shrink-0">
                <Mail className="w-6 h-6 text-[#1a5c2a]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Email</h3>
                <p className="text-gray-600 mt-1">contact@agririsk-ai.com<br />support@agririsk-ai.com</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e8f5e9] shrink-0">
                <Phone className="w-6 h-6 text-[#1a5c2a]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Téléphone</h3>
                <p className="text-gray-600 mt-1">+225 07 00 00 00 00<br />Lun-Ven, 8h-18h</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <form className="bg-[#f7f9f7] p-8 rounded-3xl space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Nom complet" placeholder="Votre nom" />
                <Input label="Adresse email" type="email" placeholder="votre@email.com" />
              </div>
              <Input label="Sujet" placeholder="Comment pouvons-nous vous aider ?" />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#1a2e1d]">Message</label>
                <textarea 
                  rows={5} 
                  className="w-full rounded-xl border border-[#e2e8e4] bg-white px-4 py-3 text-sm text-[#1a2e1d] focus:border-[#1a5c2a] focus:ring-2 focus:ring-[#1a5c2a]/20 outline-none resize-none"
                  placeholder="Décrivez votre besoin..."
                ></textarea>
              </div>
              <Button size="lg" className="w-full sm:w-auto px-8 bg-[#1a5c2a] hover:bg-[#15803d]">
                Envoyer le message
              </Button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
