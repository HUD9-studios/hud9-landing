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

function createStudio(t: Translate): Dictionary['landing']['studio'] {
  return {
    label: t('02 / EL ESTUDIO', '02 / THE STUDIO'),
    title: t('El estudio', 'The studio'),
    titleStart: t('Distintas trayectorias.', 'Different backgrounds.'),
    titleEmphasis: t('Una misma visión.', 'One shared vision.'),
    introduction: t(
      'HUD9 Studios nace de la unión de profesionales con experiencia en el desarrollo de videojuegos y aplicaciones interactivas para clientes y empresas.',
      'HUD9 Studios brings together professionals with experience developing video games and interactive applications for clients and businesses.',
    ),
    approach: t(
      'Reunimos talento creativo y conocimiento técnico para dar vida a nuevas ideas, construir experiencias memorables y explorar las posibilidades de la tecnología interactiva.',
      'We combine creative talent and technical expertise to bring new ideas to life, build memorable experiences, and explore the possibilities of interactive technology.',
    ),
    pillars: {
      experience: {
        title: t('Experiencia', 'Experience'),
        description: t(
          'Trayectoria en proyectos reales para clientes y empresas.',
          'Hands-on experience delivering projects for clients and businesses.',
        ),
      },
      creativity: {
        title: t('Creatividad', 'Creativity'),
        description: t(
          'Diseño, narrativa e ideas que dan vida a nuevas experiencias.',
          'Design, storytelling, and ideas that bring new experiences to life.',
        ),
      },
      technology: {
        title: t('Tecnología', 'Technology'),
        description: t(
          'Desarrollo sólido y soluciones interactivas multiplataforma.',
          'Robust development and cross-platform interactive solutions.',
        ),
      },
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
      studio: createStudio(t),
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
