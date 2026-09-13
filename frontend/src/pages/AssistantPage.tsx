import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Bot, User, Sparkles } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import type { Message } from '../types';

const QUICK_QUESTIONS_FR = [
  'Pourquoi mon maïs jaunit-il ?',
  'Quel engrais utiliser pour le soja ?',
  'Quelle race de chèvre convient à Kara ?',
  'Comment réduire la mortalité des poussins ?',
  'Quand planter la tomate en saison sèche ?',
  'Comment lutter contre les chenilles légionnaires ?',
];

const AI_RESPONSES: Record<string, string> = {
  default: `Je suis votre assistant agricole et pastoral AgriRisk AI. Je peux vous aider sur :

🌱 **Agriculture** : Cultures, maladies, fertilisation, irrigation, récolte
🐄 **Élevage** : Maladies animales, nutrition, reproduction, bien-être animal
🌍 **Contexte local** : Adaptations aux régions du Togo (savane, forêt, montagne)

Posez votre question en français, en éwé ou en kabyè !`,

  maïs: `## Jaunissement du maïs — Causes et solutions

Le jaunissement du maïs peut avoir plusieurs origines :

**🔸 Carence en azote (cause la plus fréquente)**
Les feuilles vieilles jaunissent en commençant par la pointe. Solution : Appliquer de l'urée (46% N) à 50 kg/ha en side-dressing.

**🔸 Carence en soufre**
Jaunissement des jeunes feuilles. Utiliser du sulfate d'ammonium.

**🔸 Manque d'eau**
En saison sèche, irriguer si possible à raison de 25-30 mm/semaine.

**🔸 Maladie fongique (rouille, helminthosporiose)**
Appliquer un fongicide à base de mancozèbe ou triazole.

**Recommandation** : Analysez d'abord l'âge et la position des feuilles jaunes pour identifier la cause précise. Contactez un fournisseur d'engrais local pour le traitement adapté.`,

  soja: `## Fertilisation du soja au Togo

Le soja fixe l'azote atmosphérique, mais nécessite d'autres éléments :

**🌱 Programme de fertilisation recommandé :**

| Nutriment | Dose | Moment |
|-----------|------|--------|
| Phosphore (P₂O₅) | 30-40 kg/ha | Semis |
| Potasse (K₂O) | 30-40 kg/ha | Semis |
| Soufre | 15-20 kg/ha | Semis |

**Important :** L'inoculation des semences avec *Bradyrhizobium japonicum* est ESSENTIELLE pour maximiser la fixation azotée. Elle peut augmenter le rendement de 30 à 50%.

**Calendrier :** Planter en début de saison des pluies (avril-mai pour le sud, juin pour le nord).

**Rendements attendus :** 1,5 à 2,5 t/ha avec bonne gestion.`,

  chèvre: `## Races de chèvres adaptées à la région de Kara

La région de Kara (nord du Togo) présente un climat soudanien avec une saison sèche marquée.

**🐐 Races recommandées :**

**1. Chèvre du Sahel (Sahelian goat)** ⭐ Meilleure option
- Excellente adaptation à la chaleur et la sécheresse
- Bonne résistance aux maladies locales
- Production laitière : 0,5-1 L/jour
- Poids adulte : 25-35 kg

**2. Djallonké (West African Dwarf goat)**
- Très résistante aux trypanosomiases
- Taille petite mais robuste
- Adaptée aux zones forestières et de savane

**3. Croisé Sahel × Boer**
- Meilleure croissance pondérale
- Nécessite plus de soins et d'alimentation

**Conseil** : Commencez avec des races locales pures pour minimiser les risques. Les chèvres exotiques demandent des soins vétérinaires plus fréquents.`,

  poussins: `## Réduire la mortalité des poussins au Togo

La mortalité élevée en élevage de poulets est un problème majeur. Voici les solutions éprouvées :

**🏠 Conditions d'élevage (J0-J14)**
- Température poussinière : 32-35°C la première semaine, puis -3°C par semaine
- Humidité : 60-70%
- Litière propre et sèche (copeaux de bois)
- Ventilation sans courants d'air

**💉 Programme vaccinal obligatoire**
| Âge | Vaccin |
|-----|--------|
| J7 | Newcastle (La Sota) gouttes oculaires |
| J14 | Gumboro (IBD) eau de boisson |
| J21 | Newcastle rappel |
| J28 | Variole aviaire (peau) |

**🥗 Nutrition**
- Aliment démarrage : 20-22% protéines
- Eau fraîche disponible en permanence
- Vitamine C et électrolytes au stress

**🧹 Biosécurité**
- Nettoyage-désinfection entre bandes
- Quarantaine des nouveaux animaux
- Limiter les visites au poulailler

Suivez ces recommandations et la mortalité devrait passer sous 5%.`,

  tomate: `## Plantation de tomates en saison sèche au Togo

La culture de tomates en contre-saison est rentable mais demande une gestion rigoureuse.

**📅 Calendrier optimal**
- **Lomé et littoral** : Novembre-Décembre (saison fraîche)
- **Centre** (Atakpamé, Sokodé) : Octobre-Novembre
- **Nord** (Kara, Dapaong) : Novembre (nuits plus fraîches)

**💧 Irrigation**
- Goutte-à-goutte : 3-5 L/plant/jour
- Aspersion : 25-30 mm tous les 3-4 jours
- Éviter le mouillage du feuillage (mildiou)

**🌿 Variétés recommandées**
- **Roma VF** : Résistante, bonne conservation
- **Tropimech** : Adaptée chaleur tropicale  
- **Petomech** : Très productive

**⚠️ Maladies à surveiller en saison sèche**
- Acariens rouges : Abamectine + soufre mouillable
- Aleurodes : Imidaclopride ou insectes auxiliaires`,

  chenilles: `## Lutte contre les chenilles légionnaires (Spodoptera frugiperda)

La chenille légionnaire d'automne est le ravageur le plus destructeur du maïs en Afrique de l'Ouest.

**🔍 Identification**
- Chenille verte à brun-gris, 3-4 cm à maturité
- Marques en Y inversé sur la tête
- Dommages caractéristiques : feuilles perforées, sciure dans le cornet

**⚡ Seuil d'intervention**
Traiter si >20% de plants avec signes d'attaque OU >3 larves jeunes par plant

**💊 Traitements homologués**
| Produit | Mode d'action |
|---------|--------------|
| Emamectin benzoate 1,9% EC | Ingestion + contact |
| Chlorpyrifos 240 EC | Contact + ingestion |
| Spinosad | Biologique |
| Neem (Azadiractine) | Biologique |

**Technique d'application :** Traiter le soir (chenilles actives la nuit). Diriger le jet vers le cornet.

**🌿 Lutte intégrée**
- Semis synchronisé au niveau communautaire
- Rotation avec légumineuses
- Conservation des ennemis naturels (guêpes parasitoïdes)`,
};

const getAIResponse = (question: string): string => {
  const q = question.toLowerCase();
  if (q.includes('maïs') || q.includes('mais') || q.includes('jauni')) return AI_RESPONSES.maïs;
  if (q.includes('soja') || q.includes('engrais')) return AI_RESPONSES.soja;
  if (q.includes('chèvre') || q.includes('chevre') || q.includes('kara')) return AI_RESPONSES.chèvre;
  if (q.includes('poussin') || q.includes('poulet') || q.includes('mortalité')) return AI_RESPONSES.poussins;
  if (q.includes('tomate') || q.includes('saison sèche') || q.includes('planter')) return AI_RESPONSES.tomate;
  if (q.includes('chenille') || q.includes('légionnaire') || q.includes('ravageur')) return AI_RESPONSES.chenilles;
  return `Merci pour votre question sur "${question}". 

En tant qu'assistant agricole spécialisé pour le Togo, voici une réponse générale :

Pour obtenir les meilleurs résultats dans l'agriculture togolaise, il est important de :

1. **Adapter les pratiques à votre région** (nord/centre/sud ont des conditions très différentes)
2. **Travailler avec des intrants certifiés** disponibles auprès de nos fournisseurs partenaires
3. **Consulter des techniciens agricoles** pour des conseils personnalisés

Je vous recommande de consulter le module de diagnostic pour une analyse visuelle, ou de contacter l'un de nos fournisseurs locaux pour plus d'informations spécifiques.

*Note : Pour une réponse plus précise, essayez une des questions suggérées ci-dessus.*`;
};

const AssistantPage: React.FC = () => {
  const { t } = useApp();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: AI_RESPONSES.default,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    const reply: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: getAIResponse(text),
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, reply]);
    setLoading(false);
  };

  // Simple markdown parser
  const renderMarkdown = (text: string) => {
    return text
      .split('\n')
      .map((line, i) => {
        if (line.startsWith('## ')) return <h3 key={i} className="md-h3">{line.slice(3)}</h3>;
        if (line.startsWith('**') && line.endsWith('**')) return <strong key={i} className="md-bold">{line.slice(2, -2)}</strong>;
        if (line.startsWith('| ')) return <div key={i} className="md-table-row">{line}</div>;
        if (line.startsWith('- ') || line.startsWith('* ')) return <div key={i} className="md-li">• {line.slice(2)}</div>;
        if (line.match(/^\d+\. /)) return <div key={i} className="md-li">{line}</div>;
        if (line === '') return <br key={i} />;
        // Inline bold
        const parts = line.split(/\*\*(.*?)\*\*/g);
        return (
          <p key={i} className="md-p">
            {parts.map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}
          </p>
        );
      });
  };

  return (
    <div className="page-container assistant-page">
      <div className="page-header">
        <div className="page-header-icon teal"><MessageSquare size={28} /></div>
        <div>
          <h1>{t('aiAssistant')}</h1>
          <p>Posez vos questions agricoles et pastorales en français, éwé ou kabyè</p>
        </div>
      </div>

      <div className="assistant-layout">
        {/* Sidebar: Quick questions */}
        <div className="assistant-sidebar">
          <div className="sidebar-header">
            <Sparkles size={18} />
            <span>Questions fréquentes</span>
          </div>
          {QUICK_QUESTIONS_FR.map((q, i) => (
            <button key={i} className="quick-question" onClick={() => sendMessage(q)}>
              {q}
            </button>
          ))}
        </div>

        {/* Chat */}
        <div className="chat-container">
          <div className="chat-messages">
            {messages.map(msg => (
              <div key={msg.id} className={`message ${msg.role}`}>
                <div className="message-avatar">
                  {msg.role === 'assistant' ? <Bot size={20} /> : <User size={20} />}
                </div>
                <div className="message-bubble">
                  <div className="message-content">
                    {renderMarkdown(msg.content)}
                  </div>
                  <span className="message-time">
                    {new Date(msg.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            {loading && (
              <div className="message assistant">
                <div className="message-avatar"><Bot size={20} /></div>
                <div className="message-bubble loading">
                  <div className="typing-dots">
                    <span /><span /><span />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-area">
            <textarea
              className="chat-input"
              placeholder={t('chatPlaceholder')}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
              rows={2}
            />
            <button
              className={`send-btn ${(!input.trim() || loading) ? 'disabled' : ''}`}
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssistantPage;
