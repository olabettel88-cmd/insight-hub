import { NextRequest, NextResponse } from 'next/server';

function randomChar() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No visually ambiguous chars like I, 1, 0, O
  return chars.charAt(Math.floor(Math.random() * chars.length));
}

function randomColor() {
  const colors = ['#ec1313', '#ff0000', '#cc0000', '#990000'];
  return colors[Math.floor(Math.random() * colors.length)];
}

export async function GET(request: NextRequest) {
  // Generate random string
  let text = '';
  for (let i = 0; i < 6; i++) {
    text += randomChar();
  }

  // Create SVG
  const width = 200;
  const height = 80;
  
  // Add noise lines
  let noise = '';
  for (let i = 0; i < 15; i++) {
    const x1 = Math.random() * width;
    const y1 = Math.random() * height;
    const x2 = Math.random() * width;
    const y2 = Math.random() * height;
    noise += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${randomColor()}" stroke-width="1" opacity="0.5" />`;
  }

  // Add dots
  for (let i = 0; i < 50; i++) {
     const cx = Math.random() * width;
     const cy = Math.random() * height;
     const r = Math.random() * 2;
     noise += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${randomColor()}" opacity="0.5" />`;
  }

  // Add text with distortion
  let textSvg = '';
  for (let i = 0; i < text.length; i++) {
    const x = 20 + i * 30 + (Math.random() - 0.5) * 10;
    const y = 50 + (Math.random() - 0.5) * 10;
    const rotate = (Math.random() - 0.5) * 40;
    const fontSize = 30 + Math.random() * 10;
    textSvg += `<text x="${x}" y="${y}" font-family="monospace" font-weight="bold" font-size="${fontSize}" fill="${randomColor()}" transform="rotate(${rotate}, ${x}, ${y})" style="filter: blur(0.5px);">${text[i]}</text>`;
  }

  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="background-color: #000;">
      <rect width="100%" height="100%" fill="black"/>
      ${noise}
      ${textSvg}
    </svg>
  `;

  // Create response with cookie
  const response = new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'no-store, max-age=0',
    },
  });

  // Simple encryption/hashing for the cookie to verify later
  // In production, sign this with a secret. For now, we store the raw value in a httpOnly cookie.
  // Ideally, use a signed cookie or store hash in DB/Redis.
  // Here we will use a simple obfuscation for demo purposes or a proper hash if we have the util.
  // Let's just store the text in a cookie named 'pka_captcha'
  
  response.cookies.set('pka_captcha', text, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 300, // 5 minutes
    path: '/',
    sameSite: 'strict',
  });

  return response;
}
