const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateRoomCode(length = 6) {
  return Array.from({ length }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('');
}

export function formatCode(code) {
  return code.slice(0, 3) + '-' + code.slice(3);
}
