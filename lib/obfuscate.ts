const API_ENDPOINT_MAP: Record<string, string> = {
  'x1': '/api/search',
  'x2': '/api/auth/login',
  'x3': '/api/auth/register',
  'x4': '/api/auth/logout',
  'x5': '/api/users',
  'x6': '/api/payment/create',
  'x7': '/api/payment/webhook',
  'x8': '/api/payment/status',
};

const REVERSE_MAP: Record<string, string> = Object.entries(API_ENDPOINT_MAP)
  .reduce((acc, [key, value]) => ({ ...acc, [value]: key }), {});

const XOR_KEY = 0x5A;

function xorEncode(str: string): string {
  return str.split('').map(char => 
    String.fromCharCode(char.charCodeAt(0) ^ XOR_KEY)
  ).join('');
}

function xorDecode(str: string): string {
  return xorEncode(str);
}

export function encodeEndpoint(endpoint: string): string {
  const shortCode = REVERSE_MAP[endpoint];
  if (shortCode) {
    return Buffer.from(xorEncode(shortCode)).toString('base64');
  }
  return Buffer.from(xorEncode(endpoint)).toString('base64');
}

export function decodeEndpoint(encoded: string): string {
  try {
    const decoded = xorDecode(Buffer.from(encoded, 'base64').toString());
    return API_ENDPOINT_MAP[decoded] || decoded;
  } catch {
    return encoded;
  }
}

export function obfuscateApiUrl(url: string): string {
  const timestamp = Date.now();
  const noise = Math.random().toString(36).substring(2, 8);
  const encoded = encodeEndpoint(url);
  return `/_proxy/${noise}/${timestamp}/${encoded}`;
}

export function deobfuscateApiUrl(obfuscatedUrl: string): string {
  const parts = obfuscatedUrl.split('/');
  if (parts.length >= 4 && parts[1] === '_proxy') {
    const encoded = parts[parts.length - 1];
    return decodeEndpoint(encoded);
  }
  return obfuscatedUrl;
}

export function generateClientObfuscator(): string {
  return `
(function(){
  var _0x${Math.random().toString(16).slice(2, 6)}=function(s){
    var k=${XOR_KEY};
    return s.split('').map(function(c){
      return String.fromCharCode(c.charCodeAt(0)^k);
    }).join('');
  };
  var _m=${JSON.stringify(Object.entries(API_ENDPOINT_MAP).map(([k,v]) => [k, Buffer.from(xorEncode(v)).toString('base64')]))};
  window._api=function(e){
    for(var i=0;i<_m.length;i++){
      if(_m[i][0]===e)return atob(_m[i][1]).split('').map(function(c){return String.fromCharCode(c.charCodeAt(0)^${XOR_KEY});}).join('');
    }
    return e;
  };
})();
`;
}

export const CLIENT_API_CODES = {
  SEARCH: 'x1',
  LOGIN: 'x2',
  REGISTER: 'x3',
  LOGOUT: 'x4',
  USERS: 'x5',
  PAYMENT_CREATE: 'x6',
  PAYMENT_WEBHOOK: 'x7',
  PAYMENT_STATUS: 'x8',
};

export function getApiEndpoint(code: string): string {
  return API_ENDPOINT_MAP[code] || code;
}
