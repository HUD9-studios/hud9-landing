import type { Dictionary, Translate } from './types';

type ContactCopy = Dictionary['landing']['contact'];

export function createContact(t: Translate): ContactCopy {
  return {
    label: t('03 / CONTACTO', '03 / CONTACT'),
    titleStart: t(
      'Toda gran aventura comienza',
      'Every great adventure begins',
    ),
    titleEmphasis: t('con una conexión.', 'with a connection.'),
    description: t(
      '¿Tienes una idea, una propuesta o simplemente quieres saludarnos? Estamos al otro lado de la pantalla.',
      'Have an idea, a proposal, or just want to say hello? We’re on the other side of the screen.',
    ),
    open: {
      title: t('Canal abierto', 'Open channel'),
      description: t(
        'Proyectos, colaboraciones y mensajes de nuestra comunidad.',
        'Projects, collaborations, and messages from our community.',
      ),
      status: t('Listos para conectar', 'Ready to connect'),
    },
    email: {
      title: t('Correo electrónico', 'Email'),
      description: t(
        'Un canal directo para propuestas, alianzas y consultas.',
        'A direct line for proposals, partnerships, and inquiries.',
      ),
    },
    whatsapp: {
      title: 'WhatsApp',
      description: t(
        'Conversemos sobre tu idea, proyecto o colaboración.',
        'Let’s talk about your idea, project, or collaboration.',
      ),
      action: t('Escribir por WhatsApp', 'Message us on WhatsApp'),
      unavailable: t(
        'WhatsApp aún no disponible',
        'WhatsApp is not yet available',
      ),
    },
    form: createFormCopy(t),
  };
}

function createFormCopy(t: Translate): ContactCopy['form'] {
  return {
    title: t('Envíanos un mensaje', 'Send us a message'),
    name: {
      label: t('Nombre completo', 'Full name'),
      placeholder: t('¿Cómo te llamas?', 'What’s your name?'),
    },
    email: {
      label: t('Correo electrónico', 'Email'),
      placeholder: t('nombre@correo.com', 'name@example.com'),
    },
    phone: {
      label: t('Teléfono (opcional)', 'Phone (optional)'),
      placeholder: t('Número nacional', 'National number'),
      country: t('País e indicativo', 'Country and calling code'),
      search: t('Buscar país o indicativo', 'Search country or calling code'),
      noResults: t('No se encontraron países.', 'No countries found.'),
    },
    reason: {
      label: t(
        'Motivo del contacto (opcional)',
        'Reason for reaching out (optional)',
      ),
      placeholder: t('Sin seleccionar', 'No option selected'),
    },
    message: {
      label: t('Tu mensaje (opcional)', 'Your message (optional)'),
      placeholder: t(
        'Cuéntanos qué tienes en mente…',
        'Tell us what you have in mind…',
      ),
    },
    reasons: {
      game: t('Proyecto de videojuego', 'Video game project'),
      collaboration: t('Colaboración', 'Collaboration'),
      immersive: t('Experiencias inmersivas', 'Immersive experiences'),
      general: t('Consulta general', 'General inquiry'),
      other: t('Otros', 'Other'),
    },
    characterCount: t('Caracteres usados', 'Characters used'),
    submit: t('Enviar transmisión', 'Send transmission'),
    unavailable: t(
      'El envío todavía no está disponible.',
      'Sending is not available yet.',
    ),
    ...createValidationCopy(t),
  };
}

function createValidationCopy(t: Translate) {
  return {
    required: t('Completa este campo.', 'Complete this field.'),
    nameLength: t(
      'El nombre debe tener entre 2 y 100 caracteres.',
      'Enter a name between 2 and 100 characters.',
    ),
    contactMethodRequired: t(
      'Introduce un correo electrónico o un teléfono.',
      'Enter an email address or a phone number.',
    ),
    invalidEmail: t(
      'Introduce un correo electrónico válido.',
      'Enter a valid email address.',
    ),
    invalidPhone: t(
      'Introduce un teléfono válido, sin extensión.',
      'Enter a valid phone number without an extension.',
    ),
    invalidReason: t(
      'Selecciona un motivo de la lista.',
      'Choose a reason from the list.',
    ),
    messageTooShort: t(
      'El mensaje debe tener al menos 10 caracteres.',
      'Enter a message with at least 10 characters.',
    ),
    messageTooLong: t(
      'El mensaje no puede superar los 500 caracteres.',
      'The message cannot exceed 500 characters.',
    ),
  };
}
