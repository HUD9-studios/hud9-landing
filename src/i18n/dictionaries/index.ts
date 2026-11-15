import type { Locale } from '../config';
import type { Dictionary } from './types';

type Translate = (es: string, en: string) => string;

function createHeader(t: Translate): Dictionary['landing']['header'] {
  return {
    navigation: t('Navegación principal', 'Main navigation'),
    menu: t('Menú', 'Menu'),
    language: t('Idioma', 'Language'),
    languageNames: {
      en: t('Inglés', 'English'),
      es: t('Español', 'Spanish'),
    },
    skip: t('Ir al contenido', 'Skip to content'),
    home: t('Inicio', 'Home'),
    studio: t('El estudio', 'The studio'),
    contact: t('Contacto', 'Contact'),
    contactPending: t(
      'Contacto aún no disponible',
      'Contact is not yet available',
    ),
    whatsappPending: t(
      'WhatsApp aún no disponible',
      'WhatsApp is not yet available',
    ),
  };
}

function createHeroSections(
  t: Translate,
): Pick<Dictionary['landing'], 'hero' | 'protocol'> {
  return {
    hero: {
      eyebrow: t(
        'Estudio independiente de videojuegos.',
        'Independent game studio.',
      ),
      titleStart: t('Creamos', 'We make'),
      titleEmphasis: t('videojuegos.', 'video games.'),
      titleTail: t(
        'Exploramos nuevas experiencias.',
        'We explore new experiences.',
      ),
      description: t(
        'Diseño, desarrollo y experimentación en videojuegos y tecnologías interactivas.',
        'Design, development and experimentation in video games and interactive technologies.',
      ),
      action: t('Conoce el estudio', 'Meet the studio'),
    },
    protocol: {
      eyebrow: t('Experimento interactivo', 'Interactive experiment'),
      title: 'Core Protocol 09',
      description: t(
        'Pon a prueba tu ingenio, resuelve el desafío y descubre un fragmento de nuestro universo.',
        'Put your ingenuity to the test, solve the challenge and discover a fragment of our universe.',
      ),
      action: t('Sobre el experimento', 'About the experiment'),
      status: t(
        'Core Protocol 09 está en desarrollo. El minijuego aún no está disponible.',
        'Core Protocol 09 is in development. The minigame is not available yet.',
      ),
    },
  };
}

function createServices(t: Translate): Dictionary['landing']['services'] {
  return {
    label: t('Áreas de trabajo', 'Areas of work'),
    games: {
      title: t('Videojuegos', 'Video games'),
      description: t(
        'Ideas originales y experiencias interactivas',
        'Original ideas and interactive experiences',
      ),
    },
    vr: {
      title: t('Realidad virtual (VR)', 'Virtual reality (VR)'),
      description: t(
        'Entrenamiento y simulación inmersiva',
        'Immersive training and simulation',
      ),
    },
    ar: {
      title: t('Realidad aumentada (AR)', 'Augmented reality (AR)'),
      description: t(
        'Experiencias que conectan el mundo físico y digital',
        'Experiences that connect the physical and digital worlds',
      ),
    },
    simulators: {
      title: t('Simuladores', 'Simulators'),
      description: t(
        'Soluciones interactivas y a medida',
        'Custom interactive solutions',
      ),
    },
  };
}

function createDictionary(locale: Locale): Dictionary {
  const t: Translate = (es, en) => ({ es, en })[locale];

  return {
    metadata: {
      title: t(
        'HUD9 Studios | Videojuegos y tecnología inmersiva',
        'HUD9 Studios | Games and immersive technology',
      ),
      description: t(
        'HUD9 Studios desarrolla videojuegos y experiencias interactivas inmersivas.',
        'HUD9 Studios develops games and immersive interactive experiences.',
      ),
    },
    landing: {
      header: createHeader(t),
      ...createHeroSections(t),
      services: createServices(t),
      studio: {
        title: t('El estudio', 'The studio'),
        description: t(
          'HUD9 Studios es un estudio independiente de videojuegos y experiencias interactivas.',
          'HUD9 Studios is an independent studio creating video games and interactive experiences.',
        ),
        processTitle: t('Proceso', 'Process'),
        process: t(
          'Diseñamos, desarrollamos y experimentamos con videojuegos y tecnologías interactivas.',
          'We design, develop and experiment with video games and interactive technologies.',
        ),
      },
    },
  };
}

const dictionaries = {
  en: createDictionary('en'),
  es: createDictionary('es'),
} satisfies Record<Locale, Dictionary>;

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
