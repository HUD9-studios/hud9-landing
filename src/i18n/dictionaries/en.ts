import type { Dictionary } from './types';

export const en = {
  metadata: {
    title: 'HUD9 Studios | Games and immersive technology',
    description:
      'HUD9 Studios develops games and immersive interactive experiences.',
  },
  landing: {
    header: {
      navigation: 'Main navigation',
      menu: 'Menu',
      language: 'Language',
      languageNames: { en: 'English', es: 'Spanish' },
      skip: 'Skip to content',
      home: 'Home',
      studio: 'The studio',
      contact: 'Contact',
      contactPending: 'Contact is not yet available',
      whatsappPending: 'WhatsApp is not yet available',
    },
    hero: {
      eyebrow: 'Independent game studio.',
      titleStart: 'We make',
      titleEmphasis: 'video games.',
      titleTail: 'We explore new experiences.',
      description:
        'Design, development and experimentation in video games and interactive technologies.',
      action: 'Meet the studio',
    },
    protocol: {
      eyebrow: 'Interactive experiment',
      title: 'Core Protocol 09',
      description:
        'Put your ingenuity to the test, solve the challenge and discover a fragment of our universe.',
      action: 'About the experiment',
      status:
        'Core Protocol 09 is in development. The minigame is not available yet.',
    },
    services: {
      label: 'Areas of work',
      games: {
        title: 'Video games',
        description: 'Original ideas and interactive experiences',
      },
      vr: {
        title: 'Virtual reality (VR)',
        description: 'Immersive training and simulation',
      },
      ar: {
        title: 'Augmented reality (AR)',
        description: 'Experiences that connect the physical and digital worlds',
      },
      simulators: {
        title: 'Simulators',
        description: 'Custom interactive solutions',
      },
    },
    studio: {
      title: 'The studio',
      description:
        'HUD9 Studios is an independent studio creating video games and interactive experiences.',
      processTitle: 'Process',
      process:
        'We design, develop and experiment with video games and interactive technologies.',
    },
  },
} satisfies Dictionary;
