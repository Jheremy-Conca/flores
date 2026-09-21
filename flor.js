'use strict';

/* =========================================================
   Ramo de primavera: flores amarillas únicas por nombre
   ========================================================= */

const SVG_NS = 'http://www.w3.org/2000/svg';
const MAX_NOMBRE = 30;

/* ---------- Nombre: limpieza y normalización ---------- */

function limpiarNombre(crudo) {
  const t = String(crudo == null ? '' : crudo)
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return Array.from(t).slice(0, MAX_NOMBRE).join('').trim();
}

// "Ángela  " -> "angela"
function normalizar(nombre) {
  return nombre
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/* ---------- Hash y generador pseudoaleatorio ---------- */

function cyrb53(str, seed = 0) {
  let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------- Datos de diseño ---------- */

const FORMAS = ['redondo', 'puntiagudo', 'corazon', 'ondulado', 'alargado'];
const ANCHO_FORMA = { redondo: 1, puntiagudo: .92, corazon: 1.05, ondulado: 1, alargado: 1 };

const COLORES = [
  { h: 50, s: 92,  l: 82 }, // mantequilla
  { h: 60, s: 100, l: 68 }, // limón
  { h: 54, s: 100, l: 58 }, // canario
  { h: 46, s: 96,  l: 52 }, // dorado
  { h: 42, s: 100, l: 50 }, // girasol
  { h: 49, s: 78,  l: 36 }, // mostaza
  { h: 38, s: 92,  l: 54 }, // miel
  { h: 31, s: 100, l: 48 }  // ámbar
];

const FILLERS = ['#fff9e6', '#f0d6ff', '#ffd3df', '#fff0a0', '#ffffff'];

const CENTROS = [
  { h: 25, s: 70, l: 28 },
  { h: 32, s: 80, l: 34 },
  { h: 18, s: 60, l: 24 },
  { h: 85, s: 35, l: 28 },
  { h: 12, s: 65, l: 30 },
  { h: 48, s: 95, l: 52 },
  { h: 35, s: 90, l: 46 },
  { h: 280, s: 40, l: 22 }
];

const ALAS_MARIPOSA = [
  [285, 55, 70], [340, 70, 74], [200, 70, 68], [18, 85, 64], [160, 50, 62]
];

// papel de envolver: [trasero, delantero, pliegue]
const PAPELES = [
  [[34, 42, 62], [36, 55, 78], [34, 40, 50]],   // kraft
  [[45, 50, 82], [48, 60, 93], [40, 35, 66]],   // crema
  [[130, 18, 58], [125, 25, 74], [130, 18, 46]],// salvia
  [[10, 50, 74], [12, 70, 87], [10, 40, 62]]    // rosado
];
const CINTAS = [[120, 34, 32], [8, 66, 56], [28, 45, 28], [280, 30, 45]];
const JARRONES = [[18, 55, 52], [210, 45, 45], [40, 30, 92], [150, 30, 40], [270, 30, 60], [8, 60, 45]];

const MENSAJES = [
  n => `${n}, que hoy florezca todo lo bueno que llevas dentro. Que la primavera te regale días largos, cielos claros y motivos de sobra para sonreír.`,
  n => `Como este ramo, ${n}, que la primavera te encuentre brillando. Ojalá cada mañana te reciba con sol y cada tarde te devuelva la calma.`,
  n => `Para ${n}: que cada día te traiga un poquito más de sol. Que las cosas buenas te lleguen sin prisa, pero sin falta, como llegan las flores.`,
  n => `${n}, eres de esas personas que hacen florecer todo a su alrededor. Gracias por tu forma de ser; este ramo es un pequeño abrazo amarillo para ti.`,
  n => `Feliz primavera, ${n}. Que nunca te falte luz ni tiempo para crecer, y que cada paso que des deje flores en el camino.`,
  n => `${n}, que se te llenen los días de colores, abejas y buenas noticias. Que esta primavera te encuentre con el corazón abierto y las manos llenas de sol.`,
  n => `Hay flores que nacen solo para alguien. Este ramo es tuyo, ${n}, para que recuerdes que mereces cosas bonitas hoy y todos los días del año.`,
  n => `${n}, que esta primavera te abrace despacito y te haga sonreír. Que encuentres tiempo para descansar, para reír fuerte y para quienes más quieres.`,
  n => `Cada flor de este ramo lleva un deseo para ti, ${n}: salud, alegría, tranquilidad y muchas ganas de seguir floreciendo, un día a la vez.`,
  n => `${n}, ojalá tus sueños se abran tan bonito como estas flores. Que nada te apure, que todo llegue a su tiempo y que el camino sea lindo.`,
  n => `Que la alegría te encuentre siempre en primavera, ${n}. Que los días tibios te den energía y las noches te regalen descanso y buenos sueños.`,
  n => `${n}, contigo el jardín siempre se ve más lindo. Que este día esté lleno de sol, de abrazos sinceros y de esas pequeñas cosas que llenan el alma.`,
  n => `Un ramo de sol para ti, ${n}. Que se te note la sonrisa, que te sobren los buenos momentos y que la primavera te trate con todo su cariño.`,
  n => `${n}, que florezcan las ganas, los abrazos y los planes. Que cada semilla que sembraste con paciencia se convierta en algo hermoso muy pronto.`,
  n => `Esta primavera te toca brillar, ${n}. Estas flores lo saben, y yo también: mereces un tiempo lleno de luz, de risas y de todo lo que te hace feliz.`,
  n => `${n}, que nada te apague la luz que ya tienes. Como estas flores, sigue buscando el sol y verás que siempre hay un motivo para volver a abrirte.`,
  n => `Para ${n}, con todo el amarillo de la primavera. Que el color del sol se te pegue en el ánimo y que tus días se sientan tan cálidos como este ramo.`,
  n => `${n}, que cada mañana huela a flores y a cosas buenas. Que la vida te sorprenda con ratos tranquilos, con gente linda y con muchas razones para agradecer.`,
  n => `Si las flores hablaran, ${n}, dirían gracias por existir. Que hoy te sientas querido o querida, cuidado o cuidada, y recuerdes cuánto vales.`,
  n => `${n}, que llegue todo lo que estás esperando, como llega la primavera después del invierno: sin avisar, poco a poco y llenándolo todo de color.`,
  n => `Este ramo es pequeño, ${n}, pero el cariño que trae es enorme. Que te acompañe hoy, que te recuerde lo importante que eres y que te arranque una sonrisa.`,
  n => `${n}, que la vida te sorprenda con flores donde menos lo esperas. Que en los días difíciles encuentres un rayito de sol y en los buenos, muchas risas.`,
  n => `Que tu primavera sea larga, tibia y llena de risas, ${n}. Que te sobren los abrazos, los paseos con sol y los momentos que uno quiere guardar para siempre.`,
  n => `${n}, hoy el sol y las flores se pusieron de acuerdo: tú brillas. Que lo sepas, que lo sientas y que esa luz te acompañe toda la temporada.`
];

// Cierre que se suma al mensaje principal
const CIERRES = [
  'Feliz Día de la Primavera.',
  'Que este día llegue lleno de flores y de cariño.',
  'Que la primavera te llene de esperanza y de ganas de empezar.',
  'Gracias por ser parte de esta primavera.',
  'Guarda este ramo y ábrelo cada vez que necesites un poco de sol.',
  'Que nunca te falte un motivo para sonreír.',
  'Ojalá cada pétalo te recuerde lo valioso que eres.',
  'Hoy el jardín entero se viste de amarillo para ti.'
];

/* ---------- Utilidades SVG ---------- */

const f = n => Math.round(n * 100) / 100;
const hsl = (h, s, l) => `hsl(${f(h)},${f(s)}%,${f(l)}%)`;
const hsla = (h, s, l, a) => `hsla(${f(h)},${f(s)}%,${f(l)}%,${a})`;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

function el(tag, attrs, padre) {
  const e = document.createElementNS(SVG_NS, tag);
  if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (padre) padre.appendChild(e);
  return e;
}

function gradiente(defs, id, tipo, attrs, paradas) {
  const g = el(tipo, Object.assign({ id }, attrs), defs);
  for (const [off, color] of paradas) el('stop', { offset: off, 'stop-color': color }, g);
  return g;
}

// Pétalo apuntando hacia arriba, base en (0,0). wl/wr: ancho de cada lado; tx: desvío de la punta
function trazoPetalo(forma, L, W, wl, wr, tx) {
  const a = W * wl, b = W * wr;
  switch (forma) {
    case 'puntiagudo':
      return `M0,0C${f(-a)},${f(-L * .3)} ${f(-a * .45 + tx)},${f(-L * .7)} ${f(tx)},${f(-L)}` +
             `C${f(b * .45 + tx)},${f(-L * .7)} ${f(b)},${f(-L * .3)} 0,0Z`;
    case 'corazon': {
      const H = L * 1.1;
      return `M0,0C${f(-a * 1.2)},${f(-H * .35)} ${f(-a * 1.1)},${f(-H * 1.05)} ${f(tx * .5)},${f(-H * .88)}` +
             `C${f(b * 1.1)},${f(-H * 1.05)} ${f(b * 1.2)},${f(-H * .35)} 0,0Z`;
    }
    case 'ondulado':
      return `M0,0C${f(-a * .9)},${f(-L * .2)} ${f(-a)},${f(-L * .4)} ${f(-a * .7)},${f(-L * .55)}` +
             `C${f(-a * 1.05)},${f(-L * .7)} ${f(-a * .6)},${f(-L * .98)} ${f(tx)},${f(-L)}` +
             `C${f(b * .6 + tx * .5)},${f(-L * .98)} ${f(b * 1.05)},${f(-L * .7)} ${f(b * .7)},${f(-L * .55)}` +
             `C${f(b)},${f(-L * .4)} ${f(b * .9)},${f(-L * .2)} 0,0Z`;
    case 'alargado':
      return `M0,0C${f(-a * .6)},${f(-L * .2)} ${f(-a * .6)},${f(-L * .85)} ${f(tx)},${f(-L)}` +
             `C${f(b * .6)},${f(-L * .85)} ${f(b * .6)},${f(-L * .2)} 0,0Z`;
    default: // redondo
      return `M0,0C${f(-a)},${f(-L * .25)} ${f(-a * 1.05 + tx * .5)},${f(-L * .95)} ${f(tx)},${f(-L)}` +
             `C${f(b * 1.05 + tx * .5)},${f(-L * .95)} ${f(b)},${f(-L * .25)} 0,0Z`;
  }
}

/* ---------- El ramo ---------- */

function crearFlor(nombre, pref) {
  const norm = normalizar(nombre);
  const hash = cyrb53(norm);
  const rnd = mulberry32(hash);
  const r = (a, b) => a + (b - a) * rnd();
  const pick = arr => arr[Math.floor(rnd() * arr.length)];

  // Cada letra aporta un valor 0..1 (depende de la letra y de su posición)
  const codigos = Array.from(norm.replace(/ /g, '')).map(c => c.codePointAt(0));
  if (!codigos.length) codigos.push(97);
  const nL = codigos.length;
  const valor = i => {
    const k = ((i % nL) + nL) % nL;
    return ((codigos[k] * 31 + k * 17 + nL * 7) % 101) / 100;
  };

  // Estilo del ramo: 0 abanico, 1 esbelto (pocas flores grandes), 2 cúpula (muchas pequeñas)
  const estilo = Math.floor(rnd() * 3);
  const nComp = estilo === 0 ? 9 + Math.floor(rnd() * 5) : estilo === 1 ? 6 + Math.floor(rnd() * 4) : 12 + Math.floor(rnd() * 5);
  const m = nComp + 1;

  // Esquema de amarillos: la flor principal manda; las demás son del mismo tono, vecinas o libres
  const base = Math.floor(rnd() * COLORES.length);
  const modo = Math.floor(rnd() * 3);
  const colorDe = principal => {
    if (principal) return COLORES[base];
    if (modo === 0) {
      const c = COLORES[base];
      return { h: c.h + r(-8, 8), s: c.s, l: clamp(c.l + r(-10, 10), 25, 92) };
    }
    if (modo === 1) return COLORES[(base + Math.floor(rnd() * 5) - 2 + COLORES.length) % COLORES.length];
    return pick(COLORES);
  };

  // Tiempos (segundos)
  const tFlor0 = 1.5, sep = Math.min(.45, 3.2 / (m - 1));
  const lastStart = tFlor0 + (m - 1) * sep;
  const t = { nombre: lastStart, extra: lastStart + 1.2 };
  t.mensaje = t.nombre + 1;
  t.acciones = t.mensaje + .5;
  const retraso = (e, s) => { e.style.animationDelay = `${f(s)}s`; };

  const svg = el('svg', { viewBox: '0 0 400 540', xmlns: SVG_NS });
  const defs = el('defs', null, svg);

  const [pTras, pDel, pPli] = pick(PAPELES);
  const cinta = pick(CINTAS);
  const holder = Math.floor(rnd() * 3);   // 0 papel, 1 jarrón, 2 frasco de vidrio
  const gx = 200 + r(-4, 4), gy = holder === 2 ? 500 : 452;   // punto donde se juntan los tallos

  // Aura suave detrás del ramo
  gradiente(defs, `${pref}-aura`, 'radialGradient', {}, [
    [0, 'rgba(255,240,150,.55)'], [1, 'rgba(255,240,150,0)']
  ]);
  retraso(el('circle', { class: 'aura', cx: 200, cy: 250, r: 235, fill: `url(#${pref}-aura)` }, svg), .6);

  // Papel trasero (ancho variable según el ramo)
  const sx = r(.85, 1.2);
  const tilt = r(-7, 7);
  const ancho = `translate(200,0) scale(${f(sx)},1) translate(-200,0)`;
  if (holder === 0) {
    const trasero = el('g', { class: 'papel' }, el('g', { transform: ancho }, svg));
    retraso(trasero, .3);
    el('path', {
      d: 'M76,386Q138,372 200,390Q262,372 324,386L215,535Q200,541 185,535Z',
      fill: hsl(pTras[0], pTras[1], pTras[2]), stroke: hsl(pPli[0], pPli[1], pPli[2] - 10),
      'stroke-width': 1, 'stroke-linejoin': 'round'
    }, trasero);
  }

  // Hoja alargada (sirve para follaje y para hojas de tallo)
  const hoja = (x, y, ang, L, ancho, tono, d, padre) => {
    const W = L * ancho;
    const g = el('g', { transform: `translate(${f(x)},${f(y)}) rotate(${f(ang)})` }, padre || capa);
    const h = el('g', { class: 'hoja' }, g);
    retraso(h, d);
    el('path', {
      d: `M0,0C${f(-W)},${f(-L * .25)} ${f(-W * r(.8, 1))},${f(-L * .75)} ${f(r(-4, 4))},${f(-L)}` +
         `C${f(W * r(.8, 1))},${f(-L * .75)} ${f(W)},${f(-L * .25)} 0,0Z`,
      fill: hsl(tono, 42, r(30, 46)), stroke: hsl(tono, 42, 26), 'stroke-width': .8, 'stroke-opacity': .6
    }, h);
    el('path', {
      d: `M0,${f(-L * .06)}L0,${f(-L * .82)}`, fill: 'none',
      stroke: hsl(tono, 45, 58), 'stroke-width': 1.1, 'stroke-linecap': 'round', 'stroke-opacity': .7
    }, h);
  };

  const hojaTono = r(85, 140);
  const capa = el('g', { transform: `rotate(${f(tilt)} ${f(gx)} ${gy})` }, svg);
  const folAncho = r(.08, .3);
  const fillerColor = pick(FILLERS);

  // Follaje que abre el ramo
  const nFol = 3 + Math.floor(rnd() * 6);
  for (let i = 0; i < nFol; i++) {
    const lado = i % 2 ? 1 : -1;
    const ang = lado * (10 + (i >> 1) * r(14, 22) + r(0, 8));
    hoja(gx, gy - 10, ang, r(120, 220), folAncho * r(.8, 1.2), hojaTono + r(-12, 12), .3 + i * .1);
  }

  // Ramitas de nube (gypsophila)
  const nRamas = Math.floor(rnd() * 5);
  for (let k = 0; k < nRamas; k++) {
    const lado = k % 2 ? 1 : -1;
    const tx = 200 + lado * r(60, 150), ty = r(215, 300);
    const s = el('path', {
      class: 'tallo', pathLength: 1,
      d: `M${f(gx)},${gy - 20}C${f(gx + lado * 20)},${f(gy - 110)} ${f(tx - lado * 10)},${f(ty + 70)} ${f(tx)},${f(ty)}`,
      fill: 'none', stroke: hsl(110, 25, 42), 'stroke-width': 1.8, 'stroke-linecap': 'round'
    }, capa);
    retraso(s, .5 + k * .15);
    for (let j = 0; j < 7; j++) {
      const a = r(0, Math.PI * 2), d = j ? r(3, 15) : 0;
      const p = el('circle', {
        class: 'punto', cx: f(tx + Math.cos(a) * d), cy: f(ty + Math.sin(a) * d), r: f(r(2.4, 4.2)),
        fill: fillerColor, stroke: hsla(40, 30, 50, .5), 'stroke-width': .6
      }, capa);
      retraso(p, 1.3 + k * .2 + j * .05);
    }
  }

  // Cabezas del ramo (la principal + las compañeras)
  const cabezas = [];
  const nuevaCabeza = (fi, principal, hx, hy, R, z) => ({
    fi, principal, hx, hy, R, z,
    nPet: principal ? clamp(nL, 5, 14) : 5 + Math.floor(valor(fi * 5 + 2) * 14),
    forma: pick(FORMAS),
    capas: principal ? 1 + Math.floor(rnd() * 3) : (nComp > 10 ? 1 : 1 + Math.floor(rnd() * 2)),
    amarillo: colorDe(principal),
    dBrillo: r(-4, 4),
    rot0: r(0, 360),
    sa: r(1.1, 2.4) * (rnd() < .5 ? 1 : -1), sd: r(4.5, 7.5), sb: -r(0, 7)
  });
  const RP = estilo === 0 ? [76, 86] : estilo === 1 ? [90, 100] : [60, 68];
  const HP = estilo === 0 ? [165, 178] : estilo === 1 ? [140, 155] : [178, 192];
  cabezas.push(nuevaCabeza(0, true, 200 + r(-10, 10), r(HP[0], HP[1]), r(RP[0], RP[1]), 2));
  const PUESTOS = [
    [ // abanico
      () => [r(90, 104), r(212, 242), r(52, 60), 1],
      () => [r(46, 62), r(292, 312), r(44, 52), 3],
      () => [r(128, 138), r(290, 320), r(38, 44), 0],
      () => [r(150, 158), r(225, 245), r(34, 38), 0],
      () => [r(22, 34), r(262, 278), r(38, 44), 3],
      () => [r(104, 116), r(150, 166), r(36, 42), 0],
      () => [r(70, 84), r(330, 345), r(34, 38), 3]],
    [ // esbelto
      () => [r(68, 84), r(248, 270), r(64, 74), 1],
      () => [r(30, 42), r(322, 336), r(50, 56), 3],
      () => [r(112, 122), r(292, 308), r(46, 52), 0],
      () => [r(120, 132), r(190, 205), r(40, 46), 0],
      () => [r(70, 84), r(350, 364), r(34, 40), 3]],
    [ // cúpula
      () => [r(58, 66), r(128, 144), r(42, 48), 0],
      () => [r(104, 114), r(190, 206), r(44, 50), 1],
      () => [r(58, 70), r(262, 278), r(46, 52), 3],
      () => [r(140, 148), r(250, 268), r(38, 42), 0],
      () => [r(150, 158), r(190, 206), r(32, 36), 0],
      () => [r(30, 42), r(100, 112), r(34, 38), 0],
      () => [r(104, 114), r(300, 316), r(36, 40), 3],
      () => [r(22, 32), r(330, 346), r(34, 38), 3]]
  ][estilo];
  for (let k = 0; k < nComp; k++) {
    const lado = k % 2 ? 1 : -1;
    const [dx, hy, R, z] = PUESTOS[k >> 1]();
    cabezas.push(nuevaCabeza(k + 1, false, 200 + lado * dx, hy, R, z));
  }

  // Tallos con sus hojas
  const bez = (u, p0, p1, p2, p3) => {
    const v = 1 - u;
    return v * v * v * p0 + 3 * v * v * u * p1 + 3 * v * u * u * p2 + u * u * u * p3;
  };
  const dbez = (u, p0, p1, p2, p3) => {
    const v = 1 - u;
    return 3 * v * v * (p1 - p0) + 6 * v * u * (p2 - p1) + 3 * u * u * (p3 - p2);
  };
  // Vaivén propio de cada flor (tallo y cabeza giran juntos alrededor de la base)
  const mece = (g, c) => {
    const v = (x) => `${f(x)} ${f(gx)} ${gy}`;
    el('animateTransform', {
      attributeName: 'transform', type: 'rotate', values: `${v(-c.sa)};${v(c.sa)};${v(-c.sa)}`,
      keyTimes: '0;.5;1', calcMode: 'spline', keySplines: '.45 0 .55 1;.45 0 .55 1',
      dur: `${f(c.sd)}s`, begin: `${f(c.sb)}s`, repeatCount: 'indefinite'
    }, g);
  };
  for (const c of cabezas) {
    const c1x = gx + (c.hx - gx) * .15 + r(-12, 12), c1y = gy - 52;
    const c2x = c.hx + r(-22, 22), c2y = c.hy + (gy - c.hy) * .4;
    const d = `M${f(gx)},${gy}C${f(c1x)},${c1y} ${f(c2x)},${f(c2y)} ${f(c.hx)},${f(c.hy)}`;
    const dl = .2 + c.fi * .1;
    const gt = el('g', null, capa);
    mece(gt, c);
    retraso(el('path', { class: 'tallo', pathLength: 1, d, fill: 'none', stroke: hsl(108, 36, 30), 'stroke-width': c.principal ? 6.5 : 5, 'stroke-linecap': 'round' }, gt), dl);
    retraso(el('path', { class: 'tallo', pathLength: 1, d, fill: 'none', stroke: hsl(105, 40, 46), 'stroke-width': 1.6, 'stroke-linecap': 'round', 'stroke-opacity': .5, transform: 'translate(-1,0)' }, gt), dl);

    const nH = c.principal ? 2 : 1;
    for (let k = 0; k < nH; k++) {
      const u = clamp(.42 + k * .2 + r(-.05, .05), .3, .75);
      const px = bez(u, gx, c1x, c2x, c.hx), py = bez(u, gy, c1y, c2y, c.hy);
      const a0 = Math.atan2(dbez(u, gx, c1x, c2x, c.hx), -dbez(u, gy, c1y, c2y, c.hy)) * 180 / Math.PI;
      const lado = (c.fi + k) % 2 ? 1 : -1;
      const L = 40 + 46 * valor(c.fi * 3 + k + 1);
      hoja(px, py, a0 + lado * r(40, 68), L, .3, hojaTono + r(-8, 8), dl + .2 + u * 1.1, gt);
    }
  }

  // Dibuja una flor completa
  const dibujarCabeza = c => {
    const total = c.nPet * c.capas;
    const paso = Math.min(.07, 1 / total);
    const inicio = tFlor0 + c.fi * sep;
    const sw = el('g', null, capa);
    mece(sw, c);
    const g0 = el('g', { transform: `translate(${f(c.hx)},${f(c.hy)})` }, sw);
    const cab = el('g', { class: 'cabeza' }, g0);
    retraso(cab, inicio + total * paso + 1.2 + c.fi * .3);
    const ring = el('circle', {
      class: 'destello', r: f(c.R * .95), fill: 'none', opacity: 0,
      stroke: hsla(52, 100, 88, .95), 'stroke-width': 3
    }, g0);
    retraso(ring, inicio + total * paso + .1);

    const escalas = [1, .76, .54];
    const pasoAng = 360 / c.nPet;
    let idx = 0;
    for (let li = 0; li < c.capas; li++) {
      const esc = escalas[li];
      const off = c.rot0 + li * pasoAng / 2 + (li ? r(-pasoAng * .15, pasoAng * .15) : 0);
      const h = c.amarillo.h - li * 2.5, s = c.amarillo.s;
      const l = c.amarillo.l + c.dBrillo - li * 2;
      for (let i = 0; i < c.nPet; i++) {
        const v = valor(i + li * 2 + c.fi * 4);
        const L = c.R * esc * (.68 + .64 * v);
        const W = L * clamp(1.9 / c.nPet, .09, .4) * ANCHO_FORMA[c.forma];
        const ang = off + i * pasoAng + (valor(i + 7 + c.fi) - .5) * pasoAng * .2;
        const dl = (valor(i + 3 + li + c.fi) - .5) * 7;
        const gid = `${pref}-c${c.fi}-${idx}`;
        gradiente(defs, gid, 'linearGradient', { x1: 0, y1: 1, x2: 0, y2: 0 }, [
          [0, hsl(h, s, clamp(l + dl - 16, 20, 90))],
          [.55, hsl(h, s, clamp(l + dl, 20, 90))],
          [1, hsl(h, s, clamp(l + dl + 9, 20, 92))]
        ]);
        const g = el('g', { transform: `rotate(${f(ang)})` }, cab);
        const p = el('g', { class: 'petalo' }, g);
        retraso(p, inicio + idx * paso);
        el('path', {
          d: trazoPetalo(c.forma, L, W, r(.86, 1.14), r(.86, 1.14), r(-.14, .14) * W),
          fill: `url(#${gid})`, stroke: hsl(h, s - 5, l - 22), 'stroke-width': .8, 'stroke-opacity': .5,
          'stroke-linejoin': 'round'
        }, p);
        el('path', {
          d: `M0,${f(-L * .08)}Q${f(r(-2, 2))},${f(-L * .4)} ${f(r(-2, 2))},${f(-L * .66)}`, fill: 'none',
          stroke: hsl(h, s, l + 18), 'stroke-width': 1, 'stroke-linecap': 'round', 'stroke-opacity': .4
        }, p);
        idx++;
      }
    }

    // Centro: puntitos, espiral de semillas o círculo con anillo
    const rc = c.R * r(.13, .32);
    const cc = pick(CENTROS);
    const centro = el('g', { class: 'centro' }, cab);
    retraso(centro, inicio + (total - 1) * paso + .35);
    const tipo = Math.floor(rnd() * 3);
    if (tipo === 0) {
      el('circle', { r: f(rc), fill: hsl(cc.h, cc.s, cc.l - 4) }, centro);
      const n = 22 + Math.floor(rnd() * 20);
      for (let i = 0; i < n; i++) {
        const a = r(0, Math.PI * 2), d = Math.sqrt(rnd()) * rc * .86;
        el('circle', {
          cx: f(Math.cos(a) * d), cy: f(Math.sin(a) * d), r: f(rc * r(.07, .15)),
          fill: hsl(cc.h + r(-6, 10), cc.s, cc.l + r(-6, 22))
        }, centro);
      }
    } else if (tipo === 1) {
      el('circle', { r: f(rc * 1.04), fill: hsl(cc.h, cc.s, cc.l - 6) }, centro);
      const n = 55 + Math.floor(rnd() * 50);
      for (let i = 1; i <= n; i++) {
        const q = i / n, a = i * 2.39996323, d = rc * .97 * Math.sqrt(q);
        el('circle', {
          cx: f(Math.cos(a) * d), cy: f(Math.sin(a) * d), r: f(rc * (.06 + .05 * q)),
          fill: hsl(cc.h + q * 10, cc.s, cc.l + (i % 2 ? 6 : 16) + q * 8)
        }, centro);
      }
    } else {
      el('circle', { r: f(rc), fill: hsl(cc.h, cc.s, cc.l) }, centro);
      el('circle', { r: f(rc * .72), fill: 'none', stroke: hsl(cc.h + 12, cc.s, cc.l + 24), 'stroke-width': f(rc * .14) }, centro);
      el('circle', { r: f(rc * .38), fill: hsl(cc.h + 8, cc.s, cc.l + 12) }, centro);
      el('circle', { cx: f(-rc * .12), cy: f(-rc * .12), r: f(rc * .1), fill: hsla(50, 100, 90, .7) }, centro);
    }
  };

  // De atrás hacia adelante
  cabezas.slice().sort((a, b) => a.z - b.z || a.fi - b.fi).forEach(dibujarCabeza);

  if (holder === 0) {
  // Papel delantero con pliegues
  const delantero = el('g', { class: 'papel' }, el('g', { transform: ancho }, svg));
  retraso(delantero, 1);
  el('path', {
    d: 'M112,396Q158,412 200,430Q242,412 288,396L216,531Q200,539 184,531Z',
    fill: hsl(pDel[0], pDel[1], pDel[2]), stroke: hsl(pPli[0], pPli[1], pPli[2]), 'stroke-width': 1, 'stroke-linejoin': 'round'
  }, delantero);
  for (const [x1, x2] of [[160, 192], [240, 208], [128, 176]]) {
    el('path', {
      d: `M${x1},${x1 < 200 ? 414 : 414}L${x2},528`, fill: 'none',
      stroke: hsla(pPli[0], pPli[1], pPli[2], .5), 'stroke-width': 1.1, 'stroke-linecap': 'round'
    }, delantero);
  }
  el('path', { d: 'M200,432L204,526', fill: 'none', stroke: hsla(0, 0, 100, .35), 'stroke-width': 2, 'stroke-linecap': 'round' }, delantero);

  // Cinta con lazo
  const cn = hsl(cinta[0], cinta[1], cinta[2]), cnO = hsl(cinta[0], cinta[1], cinta[2] - 12);
  const lazo = el('g', { class: 'cinta' }, el('g', { transform: ancho }, svg));
  retraso(lazo, 1.25);
  el('path', { d: 'M140,448Q200,468 260,448L252,463Q200,483 148,463Z', fill: cn, stroke: cnO, 'stroke-width': .8 }, lazo);
  for (const sg of [1, -1]) {
    const g = el('g', { transform: sg === 1 ? '' : 'translate(400,0) scale(-1,1)' }, lazo);
    el('path', { d: 'M199,470C193,488 183,500 170,512L181,516C188,506 196,495 203,481Z', fill: cn, stroke: cnO, 'stroke-width': .8, 'stroke-linejoin': 'round' }, g);
    el('path', { d: 'M200,466C172,436 146,462 174,474C186,478 196,472 200,466Z', fill: cn, stroke: cnO, 'stroke-width': .8, 'stroke-linejoin': 'round' }, g);
    el('path', { d: 'M196,467C182,458 166,462 172,470', fill: 'none', stroke: hsla(0, 0, 100, .3), 'stroke-width': 1.2, 'stroke-linecap': 'round' }, g);
  }
  el('ellipse', { cx: 200, cy: 468, rx: 7, ry: 6, fill: cn, stroke: cnO, 'stroke-width': .8 }, lazo);
  } else if (holder === 1) {
    // Jarrón de cerámica
    const [vh, vs, vl] = pick(JARRONES);
    const deco = Math.floor(rnd() * 3);
    const cuerpo = 'M158,402Q150,402 152,416Q150,436 130,470Q118,512 158,530Q200,538 242,530Q282,512 270,470Q250,436 248,416Q250,402 242,402Z';
    gradiente(defs, `${pref}-vz`, 'linearGradient', { x1: 0, y1: 0, x2: 1, y2: 0 }, [
      [0, hsl(vh, vs, vl + 12)], [.45, hsl(vh, vs, vl)], [1, hsl(vh, vs, vl - 14)]
    ]);
    el('path', { d: cuerpo }, el('clipPath', { id: `${pref}-vc` }, defs));
    const frente = el('g', { class: 'papel' }, svg);
    retraso(frente, 1);
    el('path', { d: cuerpo, fill: `url(#${pref}-vz)`, stroke: hsl(vh, vs, vl - 22), 'stroke-width': 1.2, 'stroke-linejoin': 'round' }, frente);
    const dec = el('g', { 'clip-path': `url(#${pref}-vc)` }, frente);
    if (deco === 0) {
      el('rect', { x: 110, y: 446, width: 180, height: 10, fill: hsla(0, 0, 100, .4) }, dec);
      el('rect', { x: 110, y: 492, width: 180, height: 5, fill: hsla(vh, vs, vl - 25, .5) }, dec);
    } else if (deco === 1) {
      for (let row = 0; row < 4; row++) for (let col = 0; col < 7; col++) {
        el('circle', { cx: 132 + col * 22 + (row % 2) * 11, cy: 450 + row * 18, r: 3.2, fill: hsla(0, 0, 100, .45) }, dec);
      }
    } else {
      for (const y of [468, 490, 512]) {
        el('path', { d: `M120,${y}Q160,${y - 15} 200,${y}T280,${y}`, fill: 'none', stroke: hsla(0, 0, 100, .45), 'stroke-width': 3 }, dec);
      }
    }
    el('path', { d: 'M166,420Q146,470 158,518', fill: 'none', stroke: hsla(0, 0, 100, .32), 'stroke-width': 6, 'stroke-linecap': 'round' }, frente);
    el('path', { d: 'M152,404Q200,414 248,404', fill: 'none', stroke: hsl(vh, vs, vl + 18), 'stroke-width': 3, 'stroke-linecap': 'round' }, frente);
  } else {
    // Frasco de vidrio con agua y cordel
    const cuerpo = 'M150,404L150,420Q140,432 140,450L140,516Q140,534 158,534L242,534Q260,534 260,516L260,450Q260,432 250,420L250,404Z';
    el('path', { d: cuerpo }, el('clipPath', { id: `${pref}-jc` }, defs));
    const frente = el('g', { class: 'papel' }, svg);
    retraso(frente, 1);
    const agua = el('g', { 'clip-path': `url(#${pref}-jc)` }, frente);
    el('rect', { x: 130, y: 438, width: 140, height: 100, fill: 'hsla(195,60%,82%,.35)' }, agua);
    el('path', { d: 'M130,438Q150,431 170,438T210,438T250,438T290,438', fill: 'none', stroke: 'hsla(0,0%,100%,.6)', 'stroke-width': 2 }, agua);
    el('path', { d: cuerpo, fill: 'rgba(255,255,255,.16)', stroke: 'rgba(255,255,255,.8)', 'stroke-width': 2, 'stroke-linejoin': 'round' }, frente);
    el('path', { d: 'M154,432Q148,470 150,514', fill: 'none', stroke: 'rgba(255,255,255,.55)', 'stroke-width': 5, 'stroke-linecap': 'round' }, frente);
    const cn2 = hsl(cinta[0], cinta[1], cinta[2]);
    el('path', { d: 'M147,418Q200,430 253,418', fill: 'none', stroke: cn2, 'stroke-width': 3.4, 'stroke-linecap': 'round' }, frente);
    el('path', { d: 'M200,427C188,411 174,424 190,430Z', fill: cn2 }, frente);
    el('path', { d: 'M200,427C212,411 226,424 210,430Z', fill: cn2 }, frente);
    el('circle', { cx: 200, cy: 428, r: 3, fill: cn2 }, frente);
  }

  // Voladores: mariposas, abejas y luciérnagas (2 o 3, distintas según el nombre)
  const volador = (tipo, i, ex, ey, lado) => {
    const escE = r(.95, 1.25);
    const ext = el('g', { transform: `translate(${f(ex)},${f(ey)}) rotate(${f(r(-18, 18))}) scale(${f(escE)})` }, svg);
    const flota = el('g', { class: 'extra' }, ext);
    retraso(flota, t.extra + i * .5);
    flota.style.animationDuration = `.9s, ${f(r(7, 13))}s`;

    if (tipo === 0) {
      const [ah, as, al] = pick(ALAS_MARIPOSA);
      const ala = padre => {
        const a = el('g', { class: 'ala' }, padre);
        el('path', { d: 'M0,0C-6,-24 -34,-28 -30,-8C-28,0 -10,4 0,0Z', fill: hsl(ah, as, al), stroke: hsl(ah, as, al - 22), 'stroke-width': .8 }, a);
        el('path', { d: 'M0,2C-16,4 -26,16 -20,22C-14,26 -4,14 0,2Z', fill: hsl(ah + 10, as, al + 6), stroke: hsl(ah, as, al - 22), 'stroke-width': .8 }, a);
        el('circle', { cx: -22, cy: -11, r: 3.2, fill: hsla(0, 0, 100, .75) }, a);
        el('circle', { cx: -15, cy: 14, r: 2, fill: hsla(0, 0, 100, .7) }, a);
      };
      ala(flota);
      ala(el('g', { transform: 'scale(-1,1)' }, flota));
      el('ellipse', { cx: 0, cy: 4, rx: 1.8, ry: 10, fill: '#3a2c10' }, flota);
      el('path', { d: 'M0,-5Q-4,-14 -8,-15M0,-5Q4,-14 8,-15', fill: 'none', stroke: '#3a2c10', 'stroke-width': 1, 'stroke-linecap': 'round' }, flota);
    } else if (tipo === 1) {
      const cid = `${pref}-abeja${i}`;
      const dir = el('g', { transform: lado === -1 ? 'scale(-1,1)' : '' }, flota);
      el('path', { d: 'M12,2C30,-14 46,18 66,0', fill: 'none', stroke: hsla(35, 40, 30, .4), 'stroke-width': 1.4, 'stroke-dasharray': '2 5', 'stroke-linecap': 'round' }, dir);
      el('ellipse', { cx: 0, cy: 0, rx: 12, ry: 8.5 }, el('clipPath', { id: cid }, defs));
      for (const rot of [-20, 20]) {
        const w = el('g', { transform: `translate(1,-7) rotate(${rot})` }, dir);
        el('ellipse', { class: 'alab', cx: 0, cy: -6, rx: 5, ry: 8, fill: 'rgba(255,255,255,.75)', stroke: 'rgba(120,170,200,.6)', 'stroke-width': .8 }, w);
      }
      el('ellipse', { cx: 0, cy: 0, rx: 12, ry: 8.5, fill: '#ffc933' }, dir);
      const rayas = el('g', { 'clip-path': `url(#${cid})` }, dir);
      el('rect', { x: -4, y: -10, width: 4, height: 20, fill: '#3a2c10' }, rayas);
      el('rect', { x: 4, y: -10, width: 4, height: 20, fill: '#3a2c10' }, rayas);
      el('circle', { cx: -12, cy: 0, r: 5.5, fill: '#3a2c10' }, dir);
      el('circle', { cx: -14, cy: -1.5, r: 1.1, fill: '#fff' }, dir);
      el('path', { d: 'M12,0L17,0', stroke: '#3a2c10', 'stroke-width': 2, 'stroke-linecap': 'round' }, dir);
    } else {
      if (!defs.querySelector(`[id="${pref}-luz"]`)) {
        gradiente(defs, `${pref}-luz`, 'radialGradient', {}, [
          [0, 'rgba(240,255,120,.95)'], [.4, 'rgba(230,255,100,.4)'], [1, 'rgba(230,255,100,0)']
        ]);
      }
      el('circle', { class: 'brillo', cx: 0, cy: 7, r: 20, fill: `url(#${pref}-luz)` }, flota);
      el('ellipse', { cx: -4, cy: -2, rx: 3, ry: 6, fill: 'rgba(255,255,255,.6)', transform: 'rotate(-30 -4 -2)' }, flota);
      el('ellipse', { cx: 4, cy: -2, rx: 3, ry: 6, fill: 'rgba(255,255,255,.6)', transform: 'rotate(30 4 -2)' }, flota);
      el('ellipse', { cx: 0, cy: 0, rx: 2.6, ry: 6, fill: '#3a2c10' }, flota);
      el('circle', { cx: 0, cy: -6.5, r: 2.4, fill: '#3a2c10' }, flota);
      el('ellipse', { class: 'brillo', cx: 0, cy: 7, rx: 3.2, ry: 4, fill: '#f4ff8a' }, flota);
    }
  };
  const nVol = 2 + Math.floor(rnd() * 2);
  const ladoIni = rnd() < .5 ? -1 : 1;
  for (let i = 0; i < nVol; i++) {
    const lado = i % 2 ? -ladoIni : ladoIni;
    const tipo = i === 0 ? hash % 3 : Math.floor(rnd() * 3);
    volador(tipo, i, 200 + lado * r(150, 178), r(45, 115) + i * r(45, 80), lado);
  }

  // Chispitas que titilan
  const nChispas = 3 + Math.floor(rnd() * 8);
  for (let i = 0; i < nChispas; i++) {
    const s = r(.6, 1.2);
    const g = el('g', { transform: `translate(${f(r(30, 370))},${f(r(40, 340))}) scale(${f(s)})` }, svg);
    const ch = el('path', {
      class: 'chispa', d: 'M0,-6C1,-2 2,-1 6,0C2,1 1,2 0,6C-1,2 -2,1 -6,0C-2,-1 -1,-2 0,-6Z',
      fill: '#fffdf0', stroke: hsla(40, 80, 60, .6), 'stroke-width': .5
    }, g);
    retraso(ch, t.extra + r(0, 3));
  }

  // Polen que sube flotando desde las flores
  const nPolen = 8 + Math.floor(rnd() * 8);
  for (let i = 0; i < nPolen; i++) {
    const c = cabezas[Math.floor(rnd() * cabezas.length)];
    const g = el('g', { transform: `translate(${f(c.hx + r(-c.R, c.R))},${f(c.hy + r(-c.R * .3, c.R * .3))})` }, svg);
    const p = el('circle', { class: 'polen', r: f(r(1.2, 2.6)), fill: hsla(52, 100, 80, .95), opacity: 0 }, g);
    retraso(p, t.extra + r(0, 5));
    p.style.animationDuration = `${f(r(4, 8))}s`;
  }

  return {
    svg,
    tiempos: t,
    mensaje: `${MENSAJES[cyrb53(norm, 17) % MENSAJES.length](nombre)} ${CIERRES[cyrb53(norm, 31) % CIERRES.length]}`
  };
}

/* =========================================================
   Interfaz
   ========================================================= */

const $ = id => document.getElementById(id);
const inicio = $('inicio'), resultado = $('resultado'), form = $('form');
const campo = $('nombre'), errorEl = $('error'), contFlor = $('flor');
const nombreEl = $('nombre-flor'), mensajeEl = $('mensaje'), avisoEl = $('aviso');
let nombreActual = '';
let avisoTimer = 0;

function urlBase() { return location.href.split(/[?#]/)[0]; }

function linkDe(nombre) { return `${urlBase()}?nombre=${encodeURIComponent(nombre)}`; }

async function copiarTexto(texto) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(texto);
      return true;
    }
  } catch (e) { /* cae al plan B */ }
  const ta = document.createElement('textarea');
  ta.value = texto;
  ta.setAttribute('readonly', '');
  ta.style.cssText = 'position:fixed;top:0;opacity:0';
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try { ok = document.execCommand('copy'); } catch (e) { /* nada */ }
  ta.remove();
  return ok;
}

function aviso(texto) {
  avisoEl.textContent = texto;
  avisoEl.classList.add('visible');
  clearTimeout(avisoTimer);
  avisoTimer = setTimeout(() => avisoEl.classList.remove('visible'), 2200);
}

function mostrarFlor(crudo) {
  const nombre = limpiarNombre(crudo);
  if (!nombre) return false;
  nombreActual = nombre;

  const { svg, tiempos, mensaje } = crearFlor(nombre, 'f');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', `Ramo de primavera de ${nombre}`);
  contFlor.replaceChildren(svg);
  nombreEl.textContent = nombre;
  mensajeEl.textContent = mensaje;

  resultado.style.setProperty('--d-nombre', `${tiempos.nombre}s`);
  resultado.style.setProperty('--d-mensaje', `${tiempos.mensaje}s`);
  resultado.style.setProperty('--d-acciones', `${tiempos.acciones}s`);
  resultado.classList.remove('anim');
  void resultado.offsetWidth;
  resultado.classList.add('anim');

  inicio.hidden = true;
  resultado.hidden = false;
  document.title = `El ramo de ${nombre}`;
  window.scrollTo(0, 0);
  try { history.replaceState(null, '', `?nombre=${encodeURIComponent(nombre)}`); } catch (e) { /* file:// */ }
  return true;
}

function volverAlInicio() {
  resultado.hidden = true;
  inicio.hidden = false;
  campo.value = '';
  errorEl.textContent = '';
  document.title = 'Tu flor de primavera';
  try { history.replaceState(null, '', urlBase()); } catch (e) { /* file:// */ }
  window.scrollTo(0, 0);
  campo.focus();
}

/* ---------- Descargar PNG ---------- */

function partirLineas(ctx, texto, ancho) {
  const palabras = texto.split(' ');
  const lineas = [];
  let actual = '';
  for (const p of palabras) {
    const prueba = actual ? `${actual} ${p}` : p;
    if (ctx.measureText(prueba).width > ancho && actual) { lineas.push(actual); actual = p; }
    else actual = prueba;
  }
  if (actual) lineas.push(actual);
  return lineas;
}

async function descargarPng() {
  const original = contFlor.querySelector('svg');
  if (!original) return;
  const clon = original.cloneNode(true);
  clon.setAttribute('xmlns', SVG_NS);
  clon.setAttribute('width', 960);
  clon.setAttribute('height', 1296);
  const url = URL.createObjectURL(new Blob(
    [new XMLSerializer().serializeToString(clon)], { type: 'image/svg+xml;charset=utf-8' }));

  try {
    const img = new Image();
    await new Promise((ok, ko) => { img.onload = ok; img.onerror = ko; img.src = url; });

    const W = 1080, H = 1900;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const ctx = c.getContext('2d');

    const fondo = ctx.createLinearGradient(0, 0, 0, H);
    fondo.addColorStop(0, '#ffe98f'); fondo.addColorStop(.5, '#ffd678'); fondo.addColorStop(1, '#ffc59a');
    ctx.fillStyle = fondo; ctx.fillRect(0, 0, W, H);
    const sol = ctx.createRadialGradient(W, 0, 0, W, 0, 700);
    sol.addColorStop(0, 'rgba(255,252,214,.95)'); sol.addColorStop(1, 'rgba(255,245,190,0)');
    ctx.fillStyle = sol; ctx.fillRect(0, 0, W, H);

    ctx.drawImage(img, 60, 30, 960, 1296);

    const serif = '"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#3a2c10';

    let tam = 104;
    ctx.font = `italic 500 ${tam}px ${serif}`;
    while (ctx.measureText(nombreActual).width > 940 && tam > 36) {
      tam -= 4; ctx.font = `italic 500 ${tam}px ${serif}`;
    }
    ctx.fillText(nombreActual, W / 2, 1436);

    ctx.fillStyle = '#7a6432';
    ctx.font = `italic 38px ${serif}`;
    const lineas = partirLineas(ctx, mensajeEl.textContent, 900).slice(0, 7);
    lineas.forEach((l, i) => ctx.fillText(l, W / 2, 1508 + i * 52));

    ctx.font = `700 26px system-ui, sans-serif`;
    if ('letterSpacing' in ctx) ctx.letterSpacing = '6px';
    ctx.fillText('FELIZ DÍA DE LA PRIMAVERA', W / 2, H - 46);

    // Grano de papel
    const ruido = document.createElement('canvas');
    ruido.width = ruido.height = 256;
    const rc = ruido.getContext('2d');
    const datos = rc.createImageData(256, 256);
    for (let i = 0; i < datos.data.length; i += 4) {
      datos.data[i] = 90; datos.data[i + 1] = 70; datos.data[i + 2] = 30;
      datos.data[i + 3] = Math.random() * 34;
    }
    rc.putImageData(datos, 0, 0);
    ctx.fillStyle = ctx.createPattern(ruido, 'repeat');
    ctx.fillRect(0, 0, W, H);

    const blob = await new Promise(ok => c.toBlob(ok, 'image/png'));
    if (!blob) throw new Error('sin blob');
    const slug = normalizar(nombreActual).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'flor';
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `flor-${slug}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    aviso('¡Flor descargada!');
  } catch (e) {
    aviso('No se pudo descargar la flor');
  } finally {
    URL.revokeObjectURL(url);
  }
}

/* ---------- Pétalos cayendo ---------- */

function crearLluvia() {
  const cont = $('lluvia');
  const colores = ['#ffe27a', '#ffd23f', '#fff1a8', '#ffc4a3', '#ffefc2'];
  for (let i = 0; i < 16; i++) {
    const p = document.createElement('i');
    p.style.setProperty('--x', `${Math.random() * 100}%`);
    p.style.setProperty('--s', `${8 + Math.random() * 10}px`);
    p.style.setProperty('--c', colores[i % colores.length]);
    p.style.setProperty('--t', `${14 + Math.random() * 12}s`);
    p.style.setProperty('--w', `${-Math.random() * 24}s`);
    p.style.setProperty('--dx', `${(Math.random() - .3) * 140}px`);
    cont.appendChild(p);
  }
}

/* ---------- Eventos ---------- */

form.addEventListener('submit', e => {
  e.preventDefault();
  if (!mostrarFlor(campo.value)) {
    errorEl.textContent = 'Escribe tu nombre para que nazca tu flor.';
    campo.classList.remove('tiembla');
    void campo.offsetWidth;
    campo.classList.add('tiembla');
    campo.focus();
    return;
  }
  errorEl.textContent = '';
});
campo.addEventListener('input', () => { errorEl.textContent = ''; });
$('btn-png').addEventListener('click', descargarPng);
$('btn-copiar').addEventListener('click', async () => {
  const ok = await copiarTexto(linkDe(nombreActual));
  aviso(ok ? '¡Link copiado!' : 'No se pudo copiar el link');
});
$('btn-otra').addEventListener('click', volverAlInicio);

/* ---------- Arranque ---------- */

crearLluvia();

// Adorno de la pantalla inicial: un ramito de muestra
(function () {
  const { svg } = crearFlor('Primavera', 'o');
  svg.setAttribute('aria-hidden', 'true');
  $('adorno').appendChild(svg);
})();

(function () {
  let param = null;
  try { param = new URLSearchParams(location.search).get('nombre'); } catch (e) { /* nada */ }
  if (param && !mostrarFlor(param)) volverAlInicio();
})();
