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
    instagramHref: socialProfile(
      process.env.HUD9_INSTAGRAM_URL,
      'instagram.com',
    ),
    facebookHref: socialProfile(process.env.HUD9_FACEBOOK_URL, 'facebook.com'),
  };
}

function socialProfile(value: string | undefined, host: string) {
  if (!value || !URL.canParse(value)) return undefined;
  const url = new URL(value);
  const correctHost = url.hostname === host || url.hostname === 'www.' + host;
  if (
    url.protocol !== 'https:' ||
    !correctHost ||
    url.username ||
    url.password ||
    url.port ||
    url.pathname === '/'
  )
    return undefined;

  return url.href;
}
