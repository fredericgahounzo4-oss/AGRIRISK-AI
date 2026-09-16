import { Bug, Cpu, Handshake } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface BlogSection {
  heading?: string;
  paragraphs: string[];
  list?: string[];
}

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  icon: LucideIcon;
  accent: string; // couleur d'accent pour l'illustration
  sections: BlogSection[];
}

export const posts: BlogPost[] = [
  {
    id: 1,
    slug: 'rouille-du-mais',
    title: "Comment lutter efficacement contre la rouille du maïs cette saison",
    excerpt: "La rouille du maïs fait son retour. Découvrez nos meilleures pratiques et traitements pour protéger vos parcelles.",
    category: 'Conseil Agronomique',
    date: '18 Mai 2024',
    icon: Bug,
    accent: '#ef4444',
    sections: [
      {
        paragraphs: [
          "La rouille du maïs (Puccinia sorghi) est l'une des maladies fongiques les plus fréquentes sur cette culture en Afrique de l'Ouest. Elle se manifeste par de petites pustules brun-orangé sur les deux faces des feuilles, qui finissent par éclater et libérer des spores capables de se propager rapidement d'une parcelle à l'autre par le vent.",
          "Une humidité élevée combinée à des températures modérées (16 à 25°C) crée les conditions idéales pour son développement, ce qui explique les recrudescences observées en début et fin de saison des pluies.",
        ],
      },
      {
        heading: 'Reconnaître les premiers signes',
        paragraphs: [
          "Les symptômes apparaissent d'abord sur les feuilles les plus basses avant de remonter vers le haut du plant. Une inspection régulière, idéalement chaque semaine à partir de la levée, permet de détecter la maladie avant qu'elle ne compromette le rendement.",
        ],
        list: [
          "Pustules poudreuses brun-rouille sur les feuilles",
          "Jaunissement progressif du feuillage atteint",
          "Dessèchement prématuré en cas de forte infestation",
        ],
      },
      {
        heading: 'Les bons réflexes de prévention',
        paragraphs: [
          "La prévention reste le levier le plus efficace et le moins coûteux. Elle repose sur quelques principes simples mais qu'il faut appliquer avec rigueur.",
        ],
        list: [
          "Privilégier des variétés de maïs tolérantes ou résistantes à la rouille",
          "Espacer suffisamment les plants pour favoriser la circulation de l'air",
          "Pratiquer la rotation des cultures pour limiter la persistance du champignon dans le sol",
          "Éviter les excès d'irrigation par aspersion qui prolongent l'humidité foliaire",
        ],
      },
      {
        heading: 'Que faire si la maladie est déjà présente ?',
        paragraphs: [
          "Si les seuils de tolérance sont dépassés (plus de 5 % de la surface foliaire touchée sur les feuilles supérieures), un traitement fongicide à base de triazole ou de strobilurine peut être appliqué. Il est préférable d'intervenir tôt le matin ou en fin de journée pour une meilleure efficacité et pour préserver les pollinisateurs.",
          "Dans tous les cas, un diagnostic précis avant traitement évite les dépenses inutiles : notre outil de Diagnostic IA permet d'identifier la rouille du maïs à partir d'une simple photo et vous oriente vers le traitement le plus adapté à votre situation.",
        ],
      },
    ],
  },
  {
    id: 2,
    slug: 'ia-agriculture-africaine',
    title: "Intelligence Artificielle : Quel avenir pour l'agriculture africaine ?",
    excerpt: "L'IA n'est plus de la science-fiction. Comment les petits exploitants peuvent-ils en tirer profit dès aujourd'hui ?",
    category: 'Technologie',
    date: '12 Mai 2024',
    icon: Cpu,
    accent: '#3b82f6',
    sections: [
      {
        paragraphs: [
          "Pendant longtemps, l'intelligence artificielle appliquée à l'agriculture a été perçue comme un outil réservé aux grandes exploitations mécanisées des pays du Nord. La démocratisation du smartphone change radicalement la donne : aujourd'hui, un agriculteur équipé d'un téléphone d'entrée de gamme et d'une connexion mobile peut accéder aux mêmes capacités de diagnostic qu'un laboratoire agronomique, en quelques secondes et gratuitement.",
        ],
      },
      {
        heading: "Trois usages concrets qui changent déjà la donne",
        paragraphs: [
          "Sur le terrain, trois applications concrètes de l'IA se démarquent particulièrement pour les petits exploitants d'Afrique de l'Ouest.",
        ],
        list: [
          "Diagnostic visuel des maladies et carences à partir d'une photo prise au champ",
          "Assistants conversationnels capables de répondre en langage naturel à des questions agronomiques précises",
          "Prévision et alerte précoce sur les risques sanitaires régionaux, basées sur l'agrégation de signaux remontés par les utilisateurs",
        ],
      },
      {
        heading: 'Les vrais obstacles à lever',
        paragraphs: [
          "La technologie seule ne suffit pas. Trois freins majeurs subsistent : la couverture réseau encore inégale en zone rurale, le coût des données mobiles, et surtout le manque de données d'entraînement représentatives des cultures et maladies propres au contexte ouest-africain — la plupart des modèles existants ayant été entraînés sur des jeux de données majoritairement occidentaux.",
          "C'est précisément sur ce dernier point que la contribution de chaque agriculteur compte : chaque diagnostic réalisé, une fois anonymisé, permet d'améliorer la précision du modèle pour les cultures et maladies locales.",
        ],
      },
      {
        heading: 'Une évolution, pas une révolution brutale',
        paragraphs: [
          "L'IA ne remplace pas le savoir-faire paysan accumulé sur des générations — elle vient l'outiller. Le diagnostic précoce d'une maladie ne sert à rien si l'agriculteur n'a pas ensuite accès à un traitement adapté à un prix raisonnable, ce qui explique pourquoi les plateformes les plus utiles combinent diagnostic IA et mise en relation directe avec des fournisseurs d'intrants vérifiés.",
        ],
      },
    ],
  },
  {
    id: 3,
    slug: 'partenariat-semenciers',
    title: "Nouveau partenariat avec l'association des semenciers",
    excerpt: "Plus de 50 nouveaux fournisseurs certifiés rejoignent AgriRisk AI pour vous proposer les meilleures semences.",
    category: 'Actualités',
    date: '5 Mai 2024',
    icon: Handshake,
    accent: '#22c55e',
    sections: [
      {
        paragraphs: [
          "AgriRisk AI annonce un partenariat avec l'association régionale des semenciers, qui permet à plus de 50 fournisseurs de semences certifiées de rejoindre notre réseau de mise en relation. Cette collaboration vise à faciliter l'accès des agriculteurs à des semences de qualité contrôlée, traçables et adaptées aux conditions climatiques locales.",
        ],
      },
      {
        heading: 'Pourquoi la qualité des semences change tout',
        paragraphs: [
          "Le choix de la semence est souvent le facteur le plus déterminant du rendement final, avant même la qualité du sol ou la conduite culturale. Une semence non certifiée peut porter des maladies, avoir un taux de germination faible, ou ne pas correspondre à la variété annoncée.",
        ],
        list: [
          "Taux de germination garanti et contrôlé en laboratoire",
          "Traçabilité complète de la variété jusqu'au producteur",
          "Adaptation aux zones agro-climatiques locales",
        ],
      },
      {
        heading: 'Ce que ça change concrètement pour vous',
        paragraphs: [
          "Les fournisseurs partenaires apparaissent désormais avec un badge « Vérifié » sur la Carte des Fournisseurs et dans l'annuaire public. Vous pouvez consulter leur catalogue, comparer les prix et envoyer une demande directement depuis l'application, sans intermédiaire.",
          "Ce partenariat est le premier d'une série d'accords à venir avec des associations professionnelles du secteur, dans l'objectif de structurer progressivement un réseau de confiance entre agriculteurs et fournisseurs à travers la région.",
        ],
      },
    ],
  },
];

export function getPostBySlug(slug: string | undefined): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}
