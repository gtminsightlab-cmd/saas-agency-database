// Consumer email domains we block at sign-up.
// Mirrors public.email_domain_denylist in Supabase; keep them roughly in sync.
const CONSUMER_DOMAINS = new Set([
  "gmail.com","googlemail.com",
  "yahoo.com","yahoo.co.uk","yahoo.ca","yahoo.fr","yahoo.de","yahoo.co.in",
  "ymail.com","rocketmail.com",
  "icloud.com","me.com","mac.com",
  "outlook.com","hotmail.com","live.com","msn.com","hotmail.co.uk","outlook.co.uk",
  "protonmail.com","proton.me","pm.me",
  "aol.com","aim.com",
  "mail.com","gmx.com","gmx.us","gmx.net",
  "zoho.com","yandex.com","yandex.ru",
  "fastmail.com","hey.com",
  "duck.com","tutanota.com","tuta.io"
]);

export function isConsumerEmail(email: string): boolean {
  const at = email.lastIndexOf("@");
  if (at < 0) return false;
  const domain = email.slice(at + 1).toLowerCase().trim();
  return CONSUMER_DOMAINS.has(domain);
}

export function validateCompanyEmail(email: string): string | null {
  if (!email || !email.includes("@")) return "Enter a valid email address.";
  if (isConsumerEmail(email)) {
    return "Please use your company email address — consumer email domains (Gmail, Yahoo, Outlook, iCloud, Proton, etc.) are not permitted.";
  }
  return null;
}
