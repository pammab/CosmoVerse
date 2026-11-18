// 🧭 From the Universe to Me (and back) · 从宇宙到我 · Del universo a mí · Do universo até mim
// The trip flies down the levels to Earth, then turns the globe so the visitor's region faces them, with a glowing dot
// on it ("You are here · Menlo Park"). "Me → Universe" plays it backwards. The same on the computer, phone and in VR.
//   • Place names: OpenStreetMap Nominatim (© OpenStreetMap contributors, ODbL), only to turn a typed city into a position
//   • Privacy: the position is rounded to ~2 km and kept on this device; we show the city / country, never a street.
const L = (en, zh, es, pt) => ({ en, zh, es, pt });

export const ME_SRC = { names: 'https://www.openstreetmap.org/copyright', namesCredit: '© OpenStreetMap contributors' };

export const ME_UI = {
  down: L('🧭 Universe → Me', '🧭 宇宙 → 我', '🧭 Universo → Yo', '🧭 Universo → Eu'),
  up: L('🧭 Me → Universe', '🧭 我 → 宇宙', '🧭 Yo → Universo', '🧭 Eu → Universo'),
  change: L('📍 Change my place', '📍 更改我的位置', '📍 Cambiar mi lugar', '📍 Mudar o meu lugar'),
  title: L('Where are you?', '你在哪里？', '¿Dónde estás?', 'Onde você está?'),
  intro: L('CosmoVerse flies from the edge of the observable universe down to Earth and turns it to your part of the world, and back out again.',
    'CosmoVerse 会从可观测宇宙的边缘一路飞到地球，把地球转到你所在的地方，再飞回去。',
    'CosmoVerse vuela desde el borde del universo observable hasta la Tierra, la gira hacia tu parte del mundo, y vuelve.',
    'O CosmoVerse voa da borda do universo observável até a Terra, gira o planeta até a sua parte do mundo, e volta.'),
  useGeo: L('📍 Use my location', '📍 使用我的位置', '📍 Usar mi ubicación', '📍 Usar a minha localização'),
  or: L('or type a city', '或输入城市', 'o escribe una ciudad', 'ou digite uma cidade'),
  placeholder: L('e.g. Menlo Park', '例如：上海', 'p. ej., Madrid', 'ex.: Maputo'),
  go: L('Go', '出发', 'Ir', 'Ir'),
  privacy: L('Rounded to about 2 km and kept on this device. We only show your city and country.',
    '位置会四舍五入到约 2 公里，只保存在本设备上。只显示你的城市和国家。',
    'Se redondea a unos 2 km y se queda en este dispositivo. Solo mostramos tu ciudad y tu país.',
    'Arredondado para cerca de 2 km e guardado só neste aparelho. Só mostramos a sua cidade e o seu país.'),
  looking: L('Finding it…', '正在查找…', 'Buscando…', 'Procurando…'),
  notFound: L('No place found with that name. Try a city and a country.', '没有找到这个地方。试试“城市, 国家”。', 'No se encontró ese lugar. Prueba con ciudad y país.', 'Lugar não encontrado. Tente cidade e país.'),
  geoDenied: L('Location not available. Type a city instead.', '无法获取位置。请输入城市。', 'Ubicación no disponible. Escribe una ciudad.', 'Localização indisponível. Digite uma cidade.'),
  close: L('Close', '关闭', 'Cerrar', 'Fechar'),
  here: L('You are here', '你在这里', 'Estás aquí', 'Você está aqui'),
  yourArea: L('Your part of the world', '你所在的地方', 'Tu parte del mundo', 'A sua parte do mundo'),
  eyebrow: L('UNIVERSE → ME', '宇宙 → 我', 'UNIVERSO → YO', 'UNIVERSO → EU'),
};

// Round to a 0.02° grid (~2 km): never the exact spot · 四舍五入到约 2 公里
export const roundPlace = (lat, lon) => ({ lat: Math.round(lat * 50) / 50, lon: Math.round(lon * 50) / 50 });
// Nominatim address → the names we keep (no street, no house number) · 只取国家/地区/城市
export function namesFrom(addr = {}) {
  return {
    country: addr.country || '',
    region: addr.state || addr.region || addr.province || '',
    city: addr.city || addr.town || addr.municipality || addr.village || addr.county || '',
  };
}
// "Los Angeles, California, United States" (what we have) · 显示的地名
export const placeLine = (n = {}) => [n.city, n.region, n.country].filter((x, i, a) => x && a.indexOf(x) === i).join(', ');
// Levels the trip passes, largest first · 经过的尺度
export const ME_LEVELS = ['universe', 'supercluster', 'local-group', 'galaxy', 'neighbourhood', 'solar-system'];
// Point on a three.js sphere (equirectangular map, u = 0 at 180°W) for a latitude / longitude · 球面上的点
export function spherePoint(lat, lon) {
  const φ = (lon + 180) / 360 * Math.PI * 2, θ = lat * Math.PI / 180;
  return { x: -Math.cos(φ) * Math.cos(θ), y: Math.sin(θ), z: Math.sin(φ) * Math.cos(θ) };
}
// Spin angle (about the axis) that turns the place towards a viewer direction given in the axis frame · 让该地点朝向观看者的自转角
export const spinToFace = (p, v) => Math.atan2(v.x, v.z) - Math.atan2(p.x, p.z);
