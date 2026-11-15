interface ServiceCopy {
  title: string;
  description: string;
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
      contactPending: string;
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
  };
}
