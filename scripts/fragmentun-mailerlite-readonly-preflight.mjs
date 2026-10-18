// Read-only FRAGMENTUN MailerLite group verification. Never writes subscribers.
const token = process.env.MAILERLITE_API_TOKEN;
const groupIds = [process.env.MAILERLITE_GROUP_FRAGMENTUN_CAP1_ES, process.env.MAILERLITE_GROUP_FRAGMENTUN_CAP1_EN];
if (!token || groupIds.some(id => !id || !/^\d+$/.test(id)) || groupIds[0] === groupIds[1]) {
  console.error('Mailerlite preflight: missing or invalid configuration');
  process.exitCode = 1;
} else {
  try {
    const response = await fetch('https://connect.mailerlite.com/api/groups?limit=100', {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      signal: AbortSignal.timeout(10000)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const body = await response.json();
    const available = new Set((Array.isArray(body.data) ? body.data : []).map(item => String(item.id)));
    groupIds.forEach((id, index) => {
      const valid = available.has(id);
      console.log(`${index === 0 ? 'ES' : 'EN'} group: ${valid ? 'VERIFIED' : 'NOT FOUND'}`);
      if (!valid) process.exitCode = 1;
    });
    if (body.links?.next) { console.error('More group pages exist; verification incomplete'); process.exitCode = 1; }
  } catch (error) {
    console.error('MailerLite read-only group verification failed:', error instanceof Error ? error.message : 'unknown');
    process.exitCode = 1;
  }
}
