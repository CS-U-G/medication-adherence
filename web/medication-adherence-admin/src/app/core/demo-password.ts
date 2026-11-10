export interface DemoPassword {
  salt: string;
  hash: string;
}

function encode(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

async function hashPassword(password: string, salt: Uint8Array<ArrayBuffer>): Promise<string> {
  if (!crypto.subtle) throw new Error('Open the demo on localhost or over HTTPS to set a password.');
  const material = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'],
  );
  const hash = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 600_000, hash: 'SHA-256' },
    material, 256,
  );
  return encode(new Uint8Array(hash));
}

export async function storeDemoPassword(password: string): Promise<DemoPassword> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return { salt: encode(salt), hash: await hashPassword(password, salt) };
}

export async function matchesDemoPassword(password: string, saved: DemoPassword): Promise<boolean> {
  const salt = Uint8Array.from(atob(saved.salt), char => char.charCodeAt(0));
  return await hashPassword(password, salt) === saved.hash;
}
