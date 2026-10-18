// FRAGMENTUN / MailerLite: read-only credential and group preflight.
// Does not modify groups, subscribe contacts, or trigger automations.
const token = process.env.MAILERLITE_API_TOKEN;
const groupIds = {
  ES: process.env.MAILERLITE_GROUP_FRAGMENTUN_CAP1_ES,
  EN: process.env.MAILERLITE_GROUP_FRAGMENTUN_CAP1_EN,
};

if (!token || Object.values(groupIds).some(id => !id || !/^\d+$/.test(id)) || groupIds.ES === groupIds.EN) {
  console.error('MailerLite preflight: missing or invalid configuration');
  process.exitCode = 1;
} else {
  const allowedHost = 'connect.mailerlite.com';
  let url = new URL('https://connect.mailerlite.com/api/groups?limit=100');
  const seenUrls = new Set();
  const found = new Set();

  try {
    for (let page = 0; url && page < 20; page++) {
      if (url.protocol !== 'https:' || url.hostname !== allowedHost || seenUrls.has(url.href)) {
        throw new Error('Unsafe or repeated pagination URL');
      }
      seenUrls.add(url.href);
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        signal: AbortSignal.timeout(10000),
        redirect: 'error',
      });
      if (!response.ok) throw new Error(`Groups read HTTP ${response.status}`);
      const body = await response.json();
      if (!Array.isArray(body.data)) throw new Error('Invalid groups response');
      for (const item of body.data) found.add(String(item.id));
      const next = body.links?.next;
      url = next ? new URL(next, url) : null;
    }
    if (url) throw new Error('Groups pagination exceeds safety limit');
    for (const [language, id] of Object.entries(groupIds)) {
      const match = found.has(id);
      console.log(`${language} capture group: ${match ? 'VERIFIED' : 'NOT FOUND'}`);
      if (!match) process.exitCode = 1;
    }
  } catch (error) {
    console.error('MailerLite preflight incomplete:', error instanceof Error ? error.message : 'unknown error');
    process.exitCode = 1;
  }
}
