import type { Dictionary } from './types';

export const es = {
  metadata: {
    title: 'HUD9 Studios | Videojuegos y tecnología inmersiva',
    description:
      'HUD9 Studios desarrolla videojuegos y experiencias interactivas inmersivas.',
  },
  landing: {
    header: {
      navigation: 'Navegación principal',
      menu: 'Menú',
      language: 'Idioma',
      languageNames: { en: 'Inglés', es: 'Español' },
      skip: 'Ir al contenido',
      home: 'Inicio',
      studio: 'El estudio',
      contact: 'Contacto',
      contactPending: 'Contacto aún no disponible',
      whatsappPending: 'WhatsApp aún no disponible',
    },
    hero: {
      eyebrow: 'Estudio independiente de videojuegos.',
      titleStart: 'Creamos',
      titleEmphasis: 'videojuegos.',
      titleTail: 'Exploramos nuevas experiencias.',
      description:
        'Diseño, desarrollo y experimentación en videojuegos y tecnologías interactivas.',
      action: 'Conoce el estudio',
    },
    protocol: {
      eyebrow: 'Experimento interactivo',
      title: 'Core Protocol 09',
      description:
        'Pon a prueba tu ingenio, resuelve el desafío y descubre un fragmento de nuestro universo.',
      action: 'Sobre el experimento',
      status:
        'Core Protocol 09 está en desarrollo. El minijuego aún no está disponible.',
    },
    services: {
      label: 'Áreas de trabajo',
      games: {
        title: 'Videojuegos',
        description: 'Ideas originales y experiencias interactivas',
      },
      vr: {
        title: 'Realidad virtual (VR)',
        description: 'Entrenamiento y simulación inmersiva',
      },
      ar: {
        title: 'Realidad aumentada (AR)',
        description: 'Experiencias que conectan el mundo físico y digital',
      },
      simulators: {
        title: 'Simuladores',
        description: 'Soluciones interactivas y a medida',
      },
    },
    studio: {
      title: 'El estudio',
      description:
        'HUD9 Studios es un estudio independiente de videojuegos y experiencias interactivas.',
      processTitle: 'Proceso',
      process:
        'Diseñamos, desarrollamos y experimentamos con videojuegos y tecnologías interactivas.',
    },
  },
} satisfies Dictionary;
