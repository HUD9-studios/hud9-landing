export function getContactChannels() {
  const email = process.env.HUD9_CONTACT_EMAIL?.trim();
  const number = process.env.HUD9_WHATSAPP_NUMBER?.trim().replace(/^\+/, '');

  return {
    email:
      email && /^[\w.+-]+@(?:[\da-z-]+\.)+[a-z]{2,}$/i.test(email)
        ? email
        : undefined,
    whatsappHref:
      number && /^[1-9]\d{7,14}$/.test(number)
        ? `https://wa.me/${number}`
        : undefined,
  };
}
