const shapes = {
  home: 'm3 15 13-11 13 11m-23-2v15h7m6 0h7V13',
  games:
    'M7 7h4l2 2h6l2-2h4c2 0 3 1 4 4l2 9c.6 4-1 6-3 6-1 0-2-1-3-2l-4-4H11l-4 4c-1 1-2 2-3 2-2 0-3.6-2-3-6l2-9c1-3 2-4 4-4Zm2 4v8m-4-4h8m9-4h.1m4 4h.1m-8 0h.1m4 4h.1',
  vr: 'M2 19v-7c0-2 6-4 14-4s14 2 14 4v7l-4 2m-20 0-4-2m4-5c0-1 4-2 10-2s10 1 10 2v7a3 3 0 0 1-3 3h-3l-2-4-2-1-2 1-2 4H9a3 3 0 0 1-3-3v-7Z',
  ar: 'M12 4l4-2 4 2m6 4 4 2v5m0 4v5l-4 2m-6 3-4 2-4-2m-6-3-4-2v-5m0-4v-5l4-2m2 3 8-4 8 4v10l-8 4-8-4V11Zm0 0 8 5 8-5m-8 5v9',
  simulators:
    'M2 9 16 2l14 7-14 8L2 9Zm0 7 5-3m18 0 5 3-14 8-14-8Zm0 7 5-3m18 0 5 3-14 8-14-8Z',
  signal:
    'M16 11v6m-7 10 7-10 7 10M11 24h10M11 7a7 7 0 0 0 0 10M21 7a7 7 0 0 1 0 10M7 4a11 11 0 0 0 0 16M25 4a11 11 0 0 1 0 16',
  email: 'M4 7h24v18H4V7Zm0 2 12 9L28 9',
  send: 'm3 14 26-10-7 25-7-9-7-2-5-4Zm12 6L29 4M8 18l1 9 6-7',
  person:
    'M16 15a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM6 27v-2c0-4 4-7 10-7s10 3 10 7v2H6Z',
  phone:
    'm10 5 4 6-3 3c1 3 4 6 7 7l3-3 6 4c1 1-1 5-4 5C13 27 5 19 5 9c0-3 4-5 5-4Z',
  message: 'M28 15a12 10 0 0 1-17 9l-6 3 2-6a12 10 0 1 1 21-6Z',
};

export function LandingIcon({ name }: { name: keyof typeof shapes }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={shapes[name]} />
    </svg>
  );
}
