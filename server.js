const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Load Urantia data
let urantiaData = null;
try {
  const dataPath = path.join(__dirname, 'urantia_data.json');
  urantiaData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  console.log(`✅ Urantia data loaded: ${urantiaData.all_keys.length} sections, ${Object.keys(urantiaData.papers_meta).length} papers`);
} catch (e) {
  console.error('❌ Failed to load urantia_data.json:', e.message);
}

// Glossary (from docx)
const GLOSSARY = {
  'Abner': '아브너', 'absonite': '아절대', 'actuality': '실제성',
  'adjutant': '보조 영', 'Ancient of days': '옛적부터 늘 계신 이',
  'Almighty Supreme': '전능 최상위', 'Andite': '안드족', 'Antioch': '안디옥',
  'architectural worlds': '건축 구체', 'architectural': '건축',
  'badonite': '바도난족', 'Bethsaida': '벳세다', 'blue': '청',
  'brilliant evening star': '찬란한 저녁 별', 'bright and morning star': '찬란한 새벽별',
  'career': '생애', 'chief of archangel': '천사장 책임자', 'Christ': '그리스도',
  'corpreal': '유형의', 'corpreal staff': '유형 참모진', 'creator son': '창조자 아들',
  'constellation': '별자리', 'conspiracy': '계획', 'creature': '창조체',
  'Dalamatia': '달라마시아', 'Damascus': '다마스커스', 'Deity': '신',
  'dispensational': '섭리 시대적', 'Dispensation': '섭리 시대',
  'divine reality': '신성한 실체', 'divine': '신성한', 'divinity': '신성',
  'reality': '실체', 'endogamy': '동족 결혼', 'Eternal Son': '영원 아들',
  'Evolutionary SERAPHIM': '진화 세라핌', 'evolutionary religion': '진화 종교',
  'exogamy': '족외 결혼', 'EDENTIA': '에덴시아', 'Ensa': '엔사',
  'Elaboration': '세부사항', 'Faith of Days': '충심으로 늘 계신 이',
  'Father-Infinite': '아버지-무한', 'finaliter': '최종자',
  'first source and center': '첫째 근원 중심', 'force organizer': '힘 조직자',
  'fragment': '단편', 'faith son': '믿음의 아들', 'garden': '동산',
  'gethsemane': '겟세마네', 'God': '하나님', 'God the sevenfold': '칠중 하나님',
  'green': '녹', 'God the Supreme': '최상 하나님', 'God the Ultimate': '궁극 하나님',
  'God the Absolute': '절대 하나님', 'Gravity': '중력',
  'Infinite Spirit': '무한 영', 'I Am': '스스로 계신 이', 'indigo': '남',
  'intelligent races': '지성적 인종들', 'Jesus': '예수', 'Jerusem': '예루셈',
  'kingdom': '하늘 왕국', 'local universe': '지역 우주', 'Magdala': '막달라',
  'marriage': '결혼', 'Master Spirit': '주(主) 영', 'material son': '물질 아들',
  'Michael': '미가엘', 'mansion world': '맨션 세계',
  'midway creature': '중도 창조체', 'midwayer': '중도자', 'Mind': '마음',
  'Monitor': '관찰자', 'mortal': '필사', 'mortal finality': '필사 최종자',
  'mortal host': '필사 대상자', 'Nodite': '놋족', 'Norlatiadek': '놀라시아덱',
  'Red man': '홍인', 'Yellow man': '황인', 'Blue man': '청인',
  'Orange man': '오렌지 인', 'Indigo man': '남인', 'Green man': '녹색인',
  'Order': '계층', 'Overcontroller': '상위통제자', 'Oversoul': '대혼',
  'pattern': '원형', 'personalized': '인격화된', 'personality': '인격',
  'personalization': '인격화', 'power director': '동력 감독자',
  'planetary prince': '행성 영주', 'present': '발표하다', 'priest': '사제',
  'prince': '영주', 'psychic circle': '정신 원',
  'Primary Master Force Organizers': '1차 힘 조직자', 'purple': '보라',
  'puissant energy': '유력 에너지', 'paradise': '파라다이스',
  'pilot world': '인도 세계', 'Qualified Absolute': '제한 절대',
  'Salvington': '샐빙턴', 'sangik': '산긱', 'Scripture': '성서',
  'second source and center': '둘째 근원 중심', 'seraphim': '세라핌',
  'Tertiaphim': '터티아핌', 'sevenfold': '칠중', 'Solitary Messenger': '단독 사자',
  'soul': '혼', 'spirit': '영', 'Supremacy of Deity': '신의 최상위성',
  'Supreme Being': '최상 존재', 'supreme mind': '최상 마음',
  'Supremacy': '최상위성', 'Supersustenance': '초월적 유지',
  'system': '체계', 'secretaries': '조수', 'station': '정거장',
  'Supernaphim': '수퍼나핌', 'The Supreme': '최상위',
  'The Supreme Being': '최상 존재', 'Taint': '길들이다', 'Tarsus': '다소',
  'the almighty': '전능자', 'the supreme': '최상위',
  'third source and center': '셋째 근원 중심', 'thought adjuster': '생각 조절자',
  'translated': '이주되다', 'triad': '삼원', 'triad deities': '삼원 신들',
  'triodite': '삼극일체', 'triune': '삼자일체의', 'trinuity': '삼자일체',
  'transcendental finaliters': '초월 최종자 군단', 'transit world': '이주 세계',
  'transit': '이주', 'tributaries': '파생들', 'trinitized': '삼위일체화',
  'transformers': '변형자', 'union of Days': '통합으로 늘 계신 이',
  'Universal Father': '우주 아버지', 'Unqualified Absolute': '무제한 절대',
  'Urantia': '유란시아', 'Uversa': '유버사', 'Ultimation': '극자',
  'Ultimacy of Deity': '신의 궁극위성', 'worship': '예배',
  'xebede': '세베데', 'yellow': '황'
};

const TRANSLATION_PRINCIPLES = `
번역 원칙:
- 원문은 가급적 직역하되, 한국어 문맥에 맞게 간결하게 다듬는다
- 문체는 '~이다' 종결형을 사용한다 (과거는 ~이었다/~했다, 현재는 ~이다/~한다, 미래는 미래형으로)
- 경어체(~이시다, 나타나셨고 등) 금지 - 일반 서술체 사용
- 성경적, 신학적 뉘앙스가 유지되도록 엄숙하고 학문적인 톤 유지
- 문장을 생략하지 않는다
- 용어집에 있는 용어는 반드시 용어집 기준으로 번역
- 용어집에 없는 용어는 기존 번역 유지
`;

// API: Get section data
app.get('/api/section/:key', (req, res) => {
  if (!urantiaData) return res.status(500).json({ error: 'Data not loaded' });
  const key = req.params.key;
  const eng = urantiaData.eng[key];
  const ko = urantiaData.ko[key];
  if (!eng) return res.status(404).json({ error: 'Section not found' });
  res.json({ key, eng, ko: ko || '' });
});

// API: Get paper structure
app.get('/api/papers', (req, res) => {
  if (!urantiaData) return res.status(500).json({ error: 'Data not loaded' });
  const result = {};
  for (const [p, sections] of Object.entries(urantiaData.papers_meta)) {
    result[p] = {
      title_eng: urantiaData.paper_titles_eng[p] || `Paper ${p}`,
      title_ko: urantiaData.paper_titles_ko[p] || `제 ${p} 편`,
      sections: Object.keys(sections).map(Number).sort((a,b) => a-b)
    };
  }
  res.json(result);
});

// API: Get navigation (prev/next keys)
app.get('/api/navigate/:key', (req, res) => {
  if (!urantiaData) return res.status(500).json({ error: 'Data not loaded' });
  const key = req.params.key;
  const keys = urantiaData.all_keys;
  const idx = keys.indexOf(key);
  res.json({
    current: key,
    prev: idx > 0 ? keys[idx - 1] : null,
    next: idx < keys.length - 1 ? keys[idx + 1] : null,
    index: idx,
    total: keys.length
  });
});

// API: Get all verses in a section
app.get('/api/paper/:paper/section/:section', (req, res) => {
  if (!urantiaData) return res.status(500).json({ error: 'Data not loaded' });
  const { paper, section } = req.params;
  const verses = urantiaData.papers_meta[paper]?.[section];
  if (!verses) return res.status(404).json({ error: 'Not found' });
  const result = verses.map(v => {
    const key = `${paper}:${section}.${v}`;
    return {
      key,
      eng: urantiaData.eng[key] || '',
      ko: urantiaData.ko[key] || ''
    };
  });
  res.json(result);
});

// API: AI Proofreading
app.post('/api/proofread', async (req, res) => {
  const { key, eng, ko } = req.body;
  if (!eng || !ko) return res.status(400).json({ error: 'Missing eng or ko' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set' });

  const client = new Anthropic({ apiKey });

  const glossaryText = Object.entries(GLOSSARY)
    .map(([en, kr]) => `${en} → ${kr}`)
    .join('\n');

  const prompt = `당신은 유란시아서(The Urantia Book) 전문 번역 교정자입니다.

${TRANSLATION_PRINCIPLES}

용어집 (반드시 준수):
${glossaryText}

아래 구절(${key})의 영어 원문과 한글 번역을 비교하여 교정이 필요한 부분만 지적해 주세요.

영어 원문:
${eng}

한글 번역:
${ko}

다음 형식으로 응답하세요. 교정할 부분이 없으면 "교정 사항 없음"이라고만 적으세요.

교정 대상 원문: [영어 원문에서 해당 부분]
기존 번역: [현재 번역된 부분]
수정 제안: [수정된 번역]
수정 이유: [간결한 이유]

교정 사항이 여러 개면 위 형식을 반복하세요. 표 형식 사용 금지, 열거식으로 작성하세요.`;

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }]
    });
    const text = message.content.map(b => b.text || '').join('');
    res.json({ result: text });
  } catch (e) {
    console.error('Claude API error:', e);
    res.status(500).json({ error: e.message });
  }
});

// Health check / keep-alive ping
app.get('/ping', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// Self keep-alive (prevents Render.com sleep)
if (process.env.RENDER_EXTERNAL_URL) {
  const selfUrl = process.env.RENDER_EXTERNAL_URL + '/ping';
  setInterval(async () => {
    try {
      const https = require('https');
      const http = require('http');
      const mod = selfUrl.startsWith('https') ? https : http;
      mod.get(selfUrl, (res) => {
        console.log(`[Keep-alive] ping → ${res.statusCode}`);
      }).on('error', (e) => {
        console.warn('[Keep-alive] ping error:', e.message);
      });
    } catch (e) {
      console.warn('[Keep-alive] error:', e.message);
    }
  }, 14 * 60 * 1000); // every 14 minutes
  console.log(`✅ Keep-alive enabled → ${selfUrl} (every 14 min)`);
}

app.listen(PORT, () => {
  console.log(`🚀 Urantia Proofreader running on port ${PORT}`);
});
