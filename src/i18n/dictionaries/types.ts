interface ServiceCopy {
  title: string;
  description: string;
}

export type Translate = (es: string, en: string) => string;

interface ContactFormCopy {
  title: string;
  name: ServiceLabel;
  email: ServiceLabel;
  phone: ServiceLabel & { country: string; search: string; noResults: string };
  reason: ServiceLabel;
  message: ServiceLabel;
  reasons: Record<
    'game' | 'collaboration' | 'immersive' | 'general' | 'other',
    string
  >;
  characterCount: string;
  submit: string;
  unavailable: string;
  required: string;
  invalidEmail: string;
  invalidPhone: string;
  messageTooLong: string;
}

interface ServiceLabel {
  label: string;
  placeholder: string;
}

export interface Dictionary {
  metadata: {
    title: string;
    description: string;
  };
  landing: {
    header: {
      navigation: string;
      menu: string;
      language: string;
      languageNames: { en: string; es: string };
      skip: string;
      home: string;
      studio: string;
      contact: string;
      whatsappPending: string;
    };
    hero: {
      eyebrow: string;
      titleStart: string;
      titleEmphasis: string;
      titleTail: string;
      description: string;
      action: string;
    };
    protocol: {
      eyebrow: string;
      title: string;
      description: string;
      action: string;
      status: string;
    };
    services: {
      label: string;
      games: ServiceCopy;
      vr: ServiceCopy;
      ar: ServiceCopy;
      simulators: ServiceCopy;
    };
    studio: {
      label: string;
      title: string;
      titleStart: string;
      titleEmphasis: string;
      introduction: string;
      approach: string;
      pillars: {
        experience: ServiceCopy;
        creativity: ServiceCopy;
        technology: ServiceCopy;
      };
    };
    contact: {
      label: string;
      titleStart: string;
      titleEmphasis: string;
      description: string;
      open: ServiceCopy & { status: string };
      email: ServiceCopy;
      whatsapp: ServiceCopy & { action: string; unavailable: string };
      form: ContactFormCopy;
    };
  };
}
