const MALE = new Set(`
achim ahmet alexander ali andreas anton armin axel benjamin bernd bernhard burak can carl cem christian christoph daniel david denis dennis detlef dieter dietmar dirk eckhard emre enes erich ernst felix florian frank franz friedrich fritz georg gerhard gerd gottfried guenter gunter gunther günter günther hans harald hartmut hasan heinz helmut herbert holger horst huseyin hüseyin ibrahim ingo jan joachim jochen johannes jonas joerg jörg josef juergen jürgen kai karl karsten kerem klaus kurt lars leon lothar ludwig lukas manfred marcel marco mario markus martin matthias max mehmet michael murat mustafa norbert olaf oliver omer oemer onur otto paul peter philipp rainer ralf ralph reinhard reinhold rolf roland rudolf sebastian serkan siegfried stefan steffen stephan sven thomas thorsten tim tobias tolga torsten ulrich uwe volker volkmar walter werner wilhelm willi winfried wolfgang yunus yusuf
`.trim().split(/\s+/));

const FEMALE = new Set(`
andrea angelika anja anna anneliese antje astrid barbara beate bettina bianca birgit brigitte britta carola caroline charlotte christa christina christine claudia cornelia dagmar daniela diana doris dorothea edith elfriede elke elisabeth emmi erika eva franziska frieda friederike gabriele gabi gerda gertrud gisela grete gudrun hanna hannah hannelore heidi heike helene helga hildegard huriye ilse ina ingrid irene irma irmgard isolde jana janina johanna judith julia jutta kaethe katharina katrin katja kerstin kirsten kristin laura lena leonie lieselotte lisa lotti luisa luise lydia manuela margarete margot maria marianne marina marion marlene martina mathilde melanie meta michaela minna miriam monika nadine nicole nina olga ottilie patricia paula petra ramona regina renate rosa roswitha ruth sabine sandra sarah selma silke simone sonja sophie stefanie stephanie susanne svenja sylvia tanja thea theresa ulrike ursula ute vanessa vera veronika waltraud wilhelmine yvonne
`.trim().split(/\s+/));

const PARTICLES = new Set(['von', 'van', 'de', 'da', 'zu', 'zur', 'zum', 'ten', 'ter', 'dem', 'den', 'der']);

const COMPANY_RE = /\b(gmbh|mbh|ag|ug|kg|ohg|gbr|se|ltd|inc|co\.|partg|e\.?\s?k\.?|e\.?\s?v\.?|stiftung|holding|gruppe)\b/i;

function fold(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function genderOf(firstName) {
  const full = fold(firstName);
  if (!full) return null;
  if (MALE.has(full)) return 'm';
  if (FEMALE.has(full)) return 'f';
  const head = full.split('-')[0];
  if (head !== full) {
    if (MALE.has(head)) return 'm';
    if (FEMALE.has(head)) return 'f';
  }
  return null;
}

function looksLikeCompany(value) {
  return COMPANY_RE.test(value);
}

export function formalGreeting(contactPerson, companyName = '') {
  let raw = String(contactPerson || '').trim().replace(/\s+/g, ' ');
  raw = raw.replace(/^(z\.?\s*hd\.?)\s+/i, '').trim();
  const company = String(companyName || '').trim();
  if (!raw || (company && fold(raw) === fold(company)) || looksLikeCompany(raw)) {
    return 'Sehr geehrte Damen und Herren,';
  }

  let gender = null;
  if (/^(frau|fr\.)\b/i.test(raw)) {
    gender = 'f';
    raw = raw.replace(/^(frau|fr\.)\s*/i, '').trim();
  } else if (/^(herr|hr\.)\b/i.test(raw)) {
    gender = 'm';
    raw = raw.replace(/^(herr|hr\.)\s*/i, '').trim();
  }

  raw = raw.replace(/^(prof\.|dr\.|dipl\.-ing\.|ing\.)\s+/i, '').trim();
  const parts = raw.split(' ').filter(Boolean);
  if (parts.length === 0) return 'Sehr geehrte Damen und Herren,';

  if (!gender) gender = genderOf(parts[0]);
  if (!gender && parts.length === 1) return 'Sehr geehrte Damen und Herren,';

  const particleAt = parts.findIndex((part, index) => index > 0 && PARTICLES.has(fold(part)));
  const lastName = particleAt > 0 ? parts.slice(particleAt).join(' ') : parts[parts.length - 1];

  if (gender === 'm') return `Sehr geehrter Herr ${lastName},`;
  if (gender === 'f') return `Sehr geehrte Frau ${lastName},`;
  return `Guten Tag ${parts.join(' ')},`;
}
