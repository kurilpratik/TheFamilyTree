// CommonJS module for maximum compatibility on Netlify
const nodemailer = require(nodemailer);

function parseBody(event) {
  const contentType = (
    event.headers['content-type'] ||
    event.headers['Content-Type'] ||
    ''
  ).toLowerCase();

  // Support JSON fetch and <form> POST (urlencoded)
  if (contentType.includes('application/json')) {
    return JSON.parse(event.body || '{}');
  }

  // application/x-www-form-urlencoded
  const params = new URLSearchParams(event.body || '');
  const data = {};
  for (const [key, value] of params.entries()) {
    // Collapse keys like interests[] -> interests
    const k = key.endsWith('[]') ? key.slice(0, -2) : key;
    if (k in data) {
      if (Array.isArray(data[k])) data[k].push(value);
      else data[k] = [data[k], value];
    } else {
      data[k] = value;
    }
  }
  return data;
}

function esc(str = '') {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function kvHtmlTable(obj) {
  const rows = Object.entries(obj)
    .map(([k, v]) => {
      const val = Array.isArray(v) ? v.map(esc).join(', ') : esc(v);
      return `<tr><td style="padding:6px 10px;border:1px solid #ddd;"><b>${esc(k)}</b></td><td style="padding:6px 10px;border:1px solid #ddd;">${val}</td></tr>`;
    })
    .join('');
  return `<table style="border-collapse:collapse;font-family:system-ui,Segoe UI,Arial;font-size:14px">${rows}</table>`;
}

exports.handler = async event => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Simple bot honeypot
  if (event.queryStringParameters && event.queryStringParameters.hp === '1') {
    return { statusCode: 200, body: 'OK' };
  }

  const data = parseBody(event);

  // Optional honeypot field in the form
  if (data.website) {
    return { statusCode: 200, body: 'OK' };
  }

  const name = (data.name || '').trim();
  const email = (data.email || '').trim();

  if (!name || !email) {
    return { statusCode: 400, body: 'Missing required fields: name, email' };
  }

  // Build HTML bodies
  const submittedAt = new Date().toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' });

  const followUpDay = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
    weekday: 'long',
  });

  const ownerHtml = `
    <div style="font-family:system-ui,Segoe UI,Arial">
      <h2>New form submission</h2>
      <p><b>Received:</b> ${esc(submittedAt)}</p>
      ${kvHtmlTable(data)}
    </div>
  `;
  const userHtml = `
    <div style="font-family:system-ui,Segoe UI,Arial">
      <p>Hi ${esc(name)},</p>
      <p>Thank you for your message. You can expect to hear from us by the following <b>${esc(followUpDay)}</b>.</p>
      <br/>
      <p>Please note:</p>
      <p>Our appointment times are pre-allocated. 
        Appointment availability is subject to cancellation and there is a waitlist. 
        </p>
        <br/>
        <p>Once you write to us, we will discuss your request in the team and get back to you with the next available slot, based on the waitlist. 
        <p/>
        <br/>
        <p>(Average wait time: one week)</p>
      <p style="margin-top:16px">— Team ${esc(process.env.BRAND_NAME || 'Support')}</p>
    </div>
  `;

  const ownerText = `New form submission (${submittedAt})\n\n${JSON.stringify(data, null, 2)}`;
  const userText = `Hi ${name},\n\nThanks for reaching out on ${submittedAt}.\n\nYour submission:\n${JSON.stringify(data, null, 2)}\n\n— Team ${process.env.BRAND_NAME || 'Support'}`;

  // Configure Zoho SMTP
  const transporter = nodemailer.createTransport({
    host: process.env.ZOHO_SMTP_HOST || 'smtp.zoho.in', // or smtp.zoho.in for India DC
    port: Number(process.env.ZOHO_SMTP_PORT || 465),
    secure: String(process.env.ZOHO_SMTP_SECURE || 'true') === 'true',
    auth: {
      user: process.env.ZOHO_USER, // your full Zoho mailbox
      pass: process.env.ZOHO_PASS, // Zoho app password
    },
  });

  try {
    // Send to owner
    await transporter.sendMail({
      from: `"Website" <${process.env.ZOHO_USER}>`,
      to: process.env.OWNER_TO || process.env.ZOHO_USER,
      subject: `New form submission: ${name}`,
      replyTo: email,
      text: ownerText,
      html: ownerHtml,
    });

    // Confirmation to user
    await transporter.sendMail({
      from: `"${process.env.BRAND_NAME || 'Support'}" <${process.env.ZOHO_USER}>`,
      to: email,
      subject: `We received your message`,
      text: userText,
      html: userHtml,
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true, message: 'Emails sent' }),
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: 'Failed to send email' };
  }
};
