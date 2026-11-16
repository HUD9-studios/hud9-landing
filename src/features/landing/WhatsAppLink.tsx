export function WhatsAppLink({
  href,
  label,
  unavailable,
  className,
}: {
  href: string | undefined;
  label: string;
  unavailable: string;
  className: string;
}) {
  const content = (
    <>
      <WhatsAppIcon />
      {label}
    </>
  );

  return href ? (
    <a className={className} href={href}>
      {content}
    </a>
  ) : (
    <button className={className} type="button" title={unavailable} disabled>
      {content}
    </button>
  );
}

export function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M20.8 11.7a8.8 8.8 0 0 1-13 7.7L3 20.8l1.4-4.6a8.8 8.8 0 1 1 16.4-4.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M9.4 7.2a.8.8 0 0 0-.7-.3c-.4 0-1.2.3-1.2 1.9s1 2.9 2.6 4.5c1.5 1.5 3.2 2.4 4.5 2.4s1.9-.7 1.9-1.2c0-.3-.1-.5-.4-.7l-1.8-1a.6.6 0 0 0-.8.1l-.7.8c-1.1-.5-2.7-1.9-3.1-3l.7-.7c.2-.2.3-.5.1-.8l-1.1-2Z"
        fill="currentColor"
      />
    </svg>
  );
}
