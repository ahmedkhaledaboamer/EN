// ─────────────────────────────────────────────────────────────
//  Pronunciation for Arabic speakers: minimal pairs
//  (two words that differ in ONE sound, e.g. ship / sheep).
//  Each group targets a sound Egyptian learners often mix up.
// ─────────────────────────────────────────────────────────────

export const SOUND_GROUPS = [
  {
    id: 'p-b',
    title: 'P vs B',
    titleAr: 'الفرق بين P و B',
    emoji: '💨',
    sounds: ['/p/', '/b/'],
    tipAr:
      'العربي ما فيهوش حرف P، فبنقوله B. عشان تطلّع الـ P: اقفل شفايفك وطلّع نفس قوي من غير صوت من الزور، كأنك بتطفي شمعة. حط إيدك قدام بُقك: مع P هتحس بهوا، ومع B لأ.',
    pairs: [
      { a: 'pen', b: 'Ben', aAr: 'قلم', bAr: 'بن (اسم)' },
      { a: 'pig', b: 'big', aAr: 'خنزير', bAr: 'كبير' },
      { a: 'pack', b: 'back', aAr: 'يحزم / علبة', bAr: 'ظهر / ورا' },
      { a: 'pay', b: 'bay', aAr: 'يدفع', bAr: 'خليج' },
      { a: 'pie', b: 'buy', aAr: 'فطيرة', bAr: 'يشتري' },
      { a: 'pull', b: 'bull', aAr: 'يشد', bAr: 'ثور' },
      { a: 'cap', b: 'cab', aAr: 'كاب', bAr: 'تاكسي' },
      { a: 'rope', b: 'robe', aAr: 'حبل', bAr: 'روب' },
    ],
  },
  {
    id: 'f-v',
    title: 'F vs V',
    titleAr: 'الفرق بين F و V',
    emoji: '🦷',
    sounds: ['/f/', '/v/'],
    tipAr:
      'الحرفين بيتطلعوا بنفس الطريقة: سنانك اللي فوق على شفتك اللي تحت. الفرق إن F من غير صوت (هوا بس)، و V بصوت. حط صباعك على زورك: مع V هتحس برعشة.',
    pairs: [
      { a: 'fan', b: 'van', aAr: 'مروحة', bAr: 'عربية فان' },
      { a: 'fine', b: 'vine', aAr: 'كويس', bAr: 'كرمة عنب' },
      { a: 'fast', b: 'vast', aAr: 'سريع', bAr: 'واسع جداً' },
      { a: 'few', b: 'view', aAr: 'قليل', bAr: 'منظر' },
      { a: 'leaf', b: 'leave', aAr: 'ورقة شجر', bAr: 'يمشي / يسيب' },
      { a: 'safe', b: 'save', aAr: 'آمن', bAr: 'ينقذ / يحفظ' },
      { a: 'fail', b: 'veil', aAr: 'يفشل', bAr: 'طرحة / حجاب' },
      { a: 'ferry', b: 'very', aAr: 'معدّية', bAr: 'جداً' },
    ],
  },
  {
    id: 'th-s',
    title: 'TH (think) vs S',
    titleAr: 'صوت TH زي think والفرق بينه وبين S',
    emoji: '👅',
    sounds: ['/θ/', '/s/'],
    tipAr:
      'صوت θ زي حرف «ث» بالظبط! بس كتير مننا بيقوله «س» أو «ت». حط طرف لسانك بين سنانك وطلّع هوا. think تتنطق «ثِنك» مش «سِنك»، وإلا هتبقى كلمة تانية (sink = حوض).',
    pairs: [
      { a: 'think', b: 'sink', aAr: 'يفكر', bAr: 'حوض / يغرق' },
      { a: 'thick', b: 'sick', aAr: 'تخين', bAr: 'عيان' },
      { a: 'thin', b: 'sin', aAr: 'رفيع', bAr: 'ذنب' },
      { a: 'thank', b: 'sank', aAr: 'يشكر', bAr: 'غرق' },
      { a: 'path', b: 'pass', aAr: 'ممر / طريق', bAr: 'يعدّي' },
      { a: 'mouth', b: 'mouse', aAr: 'بُق', bAr: 'فار / ماوس' },
      { a: 'thumb', b: 'sum', aAr: 'الصباع الكبير', bAr: 'مجموع' },
      { a: 'worth', b: 'worse', aAr: 'يستاهل / قيمة', bAr: 'أسوأ' },
    ],
  },
  {
    id: 'th-d',
    title: 'TH (this) vs D / Z',
    titleAr: 'صوت TH زي this والفرق بينه وبين D و Z',
    emoji: '🗣️',
    sounds: ['/ð/', '/d/ /z/'],
    tipAr:
      'صوت ð زي حرف «ذ» بالظبط، وبيجي في كلمات كتير جداً زي the و this و they. ما تقولوش «د» ولا «ز». حط طرف لسانك بين سنانك وطلّع صوت.',
    pairs: [
      { a: 'then', b: 'den', aAr: 'بعدين', bAr: 'وكر / أوضة صغيرة' },
      { a: 'they', b: 'day', aAr: 'هما', bAr: 'يوم' },
      { a: 'those', b: 'doze', aAr: 'دول', bAr: 'يغفو' },
      { a: 'though', b: 'dough', aAr: 'مع إن', bAr: 'عجينة' },
      { a: 'there', b: 'dare', aAr: 'هناك', bAr: 'يتجرأ' },
      { a: 'breathe', b: 'breeze', aAr: 'يتنفس', bAr: 'نسمة هوا' },
      { a: 'clothing', b: 'closing', aAr: 'لبس', bAr: 'قفل / إغلاق' },
      { a: 'teething', b: 'teasing', aAr: 'تسنين', bAr: 'رخامة / مضايقة' },
    ],
  },
  {
    id: 'i-ee',
    title: 'Short I vs Long EE',
    titleAr: 'الفرق بين i القصيرة و ee الطويلة',
    emoji: '🚢',
    sounds: ['/ɪ/', '/i/'],
    tipAr:
      'ship (مركب) و sheep (خروف) مختلفين! الـ i القصيرة سريعة ومرخية زي «إ» خفيفة. الـ ee طويلة ومشدودة زي «ييي» وإنت بتضحك. لو قلت كله طويل، الناس هتفهم كلمة تانية.',
    pairs: [
      { a: 'ship', b: 'sheep', aAr: 'مركب', bAr: 'خروف' },
      { a: 'live', b: 'leave', aAr: 'يعيش / يسكن', bAr: 'يمشي / يسيب' },
      { a: 'sit', b: 'seat', aAr: 'يقعد', bAr: 'كرسي / مقعد' },
      { a: 'fill', b: 'feel', aAr: 'يملا', bAr: 'يحس' },
      { a: 'hit', b: 'heat', aAr: 'يضرب', bAr: 'حرارة' },
      { a: 'bit', b: 'beat', aAr: 'حتة صغيرة', bAr: 'يغلب / إيقاع' },
      { a: 'still', b: 'steal', aAr: 'لسه', bAr: 'يسرق' },
      { a: 'chip', b: 'cheap', aAr: 'شريحة', bAr: 'رخيص' },
    ],
  },
  {
    id: 'e-i',
    title: 'E (pen) vs I (pin)',
    titleAr: 'الفرق بين e في pen و i في pin',
    emoji: '🖊️',
    sounds: ['/ɛ/', '/ɪ/'],
    tipAr:
      'كتير من المصريين بيقولوا pen زي pin. صوت e في pen بقك فيه مفتوح أكتر شوية، زي «إيه» من غير ما تمطها. صوت i في pin بقك مقفول أكتر.',
    pairs: [
      { a: 'pen', b: 'pin', aAr: 'قلم', bAr: 'دبوس' },
      { a: 'ten', b: 'tin', aAr: 'عشرة', bAr: 'صفيح / علبة' },
      { a: 'bed', b: 'bid', aAr: 'سرير', bAr: 'عرض سعر' },
      { a: 'set', b: 'sit', aAr: 'يحط / طقم', bAr: 'يقعد' },
      { a: 'letter', b: 'litter', aAr: 'جواب / حرف', bAr: 'زبالة' },
      { a: 'bell', b: 'bill', aAr: 'جرس', bAr: 'فاتورة' },
      { a: 'check', b: 'chick', aAr: 'يتأكد', bAr: 'كتكوت' },
      { a: 'well', b: 'will', aAr: 'كويس / بير', bAr: 'هـ (مستقبل)' },
    ],
  },
];

export function getSoundGroup(id) {
  return SOUND_GROUPS.find((g) => g.id === id) ?? null;
}

/** All words of a group as flat items ({ word, ar, partner }). */
export function groupWords(group) {
  return group.pairs.flatMap((p) => [
    { word: p.a, ar: p.aAr, partner: p.b },
    { word: p.b, ar: p.bAr, partner: p.a },
  ]);
}

/** "Which word did you hear?" questions: play one word of each pair, choose between the two. */
export function buildListeningQuiz(group, count = 10, random = Math.random) {
  const qs = [];
  const pairs = [...group.pairs];
  for (let i = 0; qs.length < count; i++) {
    const pair = pairs[i % pairs.length];
    const target = random() < 0.5 ? pair.a : pair.b;
    qs.push({
      type: 'mcq',
      label: 'Which word?',
      prompt: 'Listen. Which word do you hear?',
      audio: target,
      question: '',
      options: [pair.a, pair.b],
      answer: target,
    });
  }
  // Shuffle question order
  for (let i = qs.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [qs[i], qs[j]] = [qs[j], qs[i]];
  }
  return qs;
}
