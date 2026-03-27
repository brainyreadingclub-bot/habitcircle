export interface Insight {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  body: string[];
  source?: string;
  triggerCondition?: {
    streakBroken?: boolean;
    daysSinceJoin?: [number, number];
    completionRate?: [number, number];
    noHabits?: boolean;
  };
}

export interface InsightCategory {
  id: string;
  emoji: string;
  title: string;
  description: string;
}

export const INSIGHT_CATEGORIES: InsightCategory[] = [
  { id: 'self-efficacy', emoji: '💪', title: '나는 할 수 있다', description: '"안 되는 사람"이라는 믿음 깨기' },
  { id: 'perfectionism', emoji: '🎯', title: '완벽하지 않아도', description: '전부 아니면 전무 사고 벗어나기' },
  { id: 'present-bias', emoji: '⏰', title: '지금 시작하기', description: '"내일부터" 탈출법' },
  { id: 'social', emoji: '🤝', title: '함께하는 힘', description: '혼자보다 함께가 나은 이유' },
  { id: 'science', emoji: '🧠', title: '습관의 과학', description: '뇌과학이 말하는 습관 형성' },
];

export const INSIGHTS: Insight[] = [
  // A: 자기효능감 — "나는 안 되는 사람" 반박
  {
    id: 'a1',
    category: 'self-efficacy',
    title: '의지력은 근육이 아닙니다',
    subtitle: '습관은 의지가 아니라 환경 설계의 결과입니다',
    body: [
      '혹시 "나는 의지가 약한 사람"이라고 생각한 적 있나요?',
      '오랫동안 심리학자들은 의지력을 근육처럼 쓰면 닳는 자원이라고 믿었습니다. 하지만 최근 연구들은 이 모델에 강하게 반박하고 있어요.',
      '실제로 습관을 잘 유지하는 사람들은 의지력이 강한 게 아니라, 의지력을 쓸 필요가 없는 환경을 만든 사람들이었습니다.',
      '운동화를 현관 앞에 두고, 책을 베개 위에 올려두고, 물병을 책상 위에 놓아두세요. 이것이 의지력보다 2.5배 더 효과적입니다.',
      '당신의 의지가 약한 게 아닙니다. 환경이 아직 준비되지 않은 것뿐이에요.',
    ],
    source: 'Wood & Neal, 2007; Adriaanse et al., 2014',
    triggerCondition: { daysSinceJoin: [0, 7] },
  },
  {
    id: 'a2',
    category: 'self-efficacy',
    title: '작은 습관이 정체성을 바꿉니다',
    subtitle: '1페이지를 읽으면 당신은 "독서하는 사람"입니다',
    body: [
      '"겨우 이거 하나 한 걸로 뭐가 달라져?"라는 생각, 해본 적 있죠?',
      'James Clear는 이렇게 말합니다: "목표는 책 한 권을 읽는 게 아니라, 독서하는 사람이 되는 것이다."',
      '매번 1페이지를 읽을 때마다, 당신은 "나는 독서하는 사람이다"에 한 표를 행사하는 겁니다. 선거에서 이기려면 만장일치가 필요한 게 아니에요. 과반수면 됩니다.',
      '오늘 하나를 체크하세요. 그것이 정체성에 대한 투표입니다.',
    ],
    source: 'James Clear, Atomic Habits',
    triggerCondition: { daysSinceJoin: [0, 14] },
  },
  {
    id: 'a3',
    category: 'self-efficacy',
    title: '성공한 사람의 85%가 중간에 깨졌습니다',
    subtitle: '완벽한 기록은 성공의 조건이 아닙니다',
    body: [
      '습관 연구에서 흥미로운 사실이 있어요. 장기적으로 습관을 유지하는 데 성공한 사람들의 대부분이 중간에 한 번 이상 끊어진 경험이 있습니다.',
      '차이를 만든 것은 "한 번도 안 깨진 것"이 아니라 "깨지고 나서 얼마나 빨리 다시 시작했는가"였습니다.',
      '하루 빠졌다면, 그냥 내일 다시 하세요. 이틀 연속 빠지지 않는 것이 핵심입니다. 한 번 빠진 건 사고지만, 두 번 연속은 패턴의 시작이거든요.',
      '지금 이 글을 읽고 있다면, 당신은 이미 돌아온 겁니다.',
    ],
    source: 'Lally et al., 2010, European Journal of Social Psychology',
    triggerCondition: { streakBroken: true },
  },
  {
    id: 'a4',
    category: 'self-efficacy',
    title: '비교는 도둑입니다',
    subtitle: '남의 Day 100과 나의 Day 3은 같은 레이스가 아닙니다',
    body: [
      '친구의 피드를 보면서 "저 사람은 되는데 나는 왜 안 되지?"라고 느낀 적 있나요?',
      '심리학에서는 이것을 "상향 사회비교"라고 부릅니다. 우리는 본능적으로 나보다 잘하는 사람과 비교하고, 그 결과 자기 진전을 과소평가합니다.',
      '하지만 생각해보세요. 그 사람의 Day 100은 그 사람의 Day 1에서 시작했습니다. 당신의 Day 3도 누군가에게는 부러운 시작이에요.',
      '비교하려면 어제의 나와 하세요. 어제보다 하나라도 했다면, 그것이 진짜 성장입니다.',
    ],
    source: 'Festinger, 1954, Social Comparison Theory',
  },

  // B: 완벽주의 — "제대로 안 하면 의미 없어" 반박
  {
    id: 'b1',
    category: 'perfectionism',
    title: '1분도 0분보다 무한히 낫습니다',
    subtitle: '양보다 출석이 중요합니다',
    body: [
      '"30분 운동할 시간이 없으니까 오늘은 안 해야지." 이 생각, 익숙하지 않나요?',
      '이것이 바로 "전부-아니면-전무" 사고입니다. 30분을 못 하면 0분을 선택하는 거죠. 하지만 습관 형성에서 가장 중요한 것은 양이 아니라 빈도입니다.',
      '1분 스트레칭, 1페이지 독서, 팔굽혀펴기 1개. 이것들이 우스워 보이지만, 신경과학적으로는 "이 행동을 하는 사람"이라는 뉴런 경로를 강화합니다.',
      '오늘 시간이 없다면, 가장 작은 버전을 해보세요. 그것만으로도 충분합니다.',
    ],
    source: 'BJ Fogg, Tiny Habits',
    triggerCondition: { completionRate: [0, 50] },
  },
  {
    id: 'b2',
    category: 'perfectionism',
    title: '스트릭이 깨져도 습관은 안 깨져요',
    subtitle: '신경 회로는 하루 쉬었다고 사라지지 않습니다',
    body: [
      '21일 연속 기록이 깨졌을 때의 그 좌절감. 모든 노력이 물거품이 된 것 같죠.',
      '하지만 뇌과학이 말하는 사실은 다릅니다. 반복된 행동으로 만들어진 신경 경로는 하루이틀 안 한다고 사라지지 않아요. 수영을 1년 안 해도 물에 들어가면 몸이 기억하는 것처럼요.',
      '숫자가 0으로 돌아갔다고 해서 당신의 뇌까지 0으로 돌아간 건 아닙니다. 축적된 노력은 그대로 있어요.',
      '스트릭은 도구일 뿐입니다. 도구가 깨졌으면 새 도구를 들면 됩니다.',
    ],
    source: 'Hebb, 1949; Graybiel, 2008, Annual Review of Neuroscience',
    triggerCondition: { streakBroken: true },
  },
  {
    id: 'b3',
    category: 'perfectionism',
    title: '완벽한 날은 존재하지 않습니다',
    subtitle: '10일 중 8일이면 충분합니다',
    body: [
      '연구자들이 발견한 흥미로운 숫자가 있습니다. 장기 습관 유지에 필요한 달성률은 100%가 아니라 약 80%입니다.',
      '10일 중 8일. 일주일에 5~6일. 이 정도면 신경 경로가 충분히 강화되고, 습관이 "자동 모드"로 전환됩니다.',
      '완벽을 추구하면 첫 번째 실패에서 무너집니다. 하지만 80%를 목표로 하면, 실패를 예산에 포함시킬 수 있어요.',
      '오늘 못했어도 괜찮습니다. 이번 주 전체를 봤을 때 대부분 했다면, 당신은 이미 궤도 위에 있는 거예요.',
    ],
    source: 'Kaushal & Rhodes, 2015, Health Psychology Review',
  },
  {
    id: 'b4',
    category: 'perfectionism',
    title: '줄이는 것도 전략입니다',
    subtitle: '30분을 5분으로 줄여도 연속성은 유지됩니다',
    body: [
      '바쁜 주가 오면 습관을 아예 포기하고 싶어지죠. "어차피 제대로 못 할 건데."',
      '하지만 연구자 BJ Fogg가 제안하는 방법이 있습니다: 기대치를 낮추세요. 30분 운동을 5분으로, 30분 독서를 1페이지로 줄이세요.',
      '핵심은 "얼마나 했느냐"가 아니라 "했느냐 안 했느냐"입니다. 5분이라도 한 날은 뇌에게 "나는 이런 사람이야"라는 신호를 보냅니다.',
      '힘든 날에는 최소 버전을 하세요. 좋은 날에 더 하면 됩니다.',
    ],
    source: 'BJ Fogg, Tiny Habits',
  },

  // C: 현재 편향 — "내일부터 할게" 반박
  {
    id: 'c1',
    category: 'present-bias',
    title: '미래의 나도 지금의 나와 같습니다',
    subtitle: '"내일부터"의 내일은 오지 않습니다',
    body: [
      '"오늘은 피곤하니까 내일부터 하자." 이 문장을 올해 몇 번이나 말했나요?',
      '행동경제학에서는 이것을 "현재 편향"이라고 부릅니다. 우리는 미래의 자신이 지금보다 더 동기부여되고, 더 에너지가 넘칠 거라고 착각합니다.',
      '하지만 내일의 나도 피곤하고, 바쁘고, 하기 싫을 거예요. 정확히 지금의 나처럼.',
      '그래서 "기분이 좋을 때 하자"가 아니라 "이 시간에 이 장소에서 하자"가 효과적입니다. 실행 의도를 정해두면, 내일의 나에게 의존하지 않아도 됩니다.',
    ],
    source: "O'Donoghue & Rabin, 1999, American Economic Review",
  },
  {
    id: 'c2',
    category: 'present-bias',
    title: '5초 안에 시작하세요',
    subtitle: '생각하기 전에 움직이기',
    body: [
      '멜 로빈스의 "5초 규칙"은 단순하지만 강력합니다: 무언가를 해야겠다는 충동이 들면, 5초 안에 물리적으로 움직이세요.',
      '5-4-3-2-1, 그리고 일어나세요. 운동복을 입든, 책을 집어들든, 물을 한 잔 따르든.',
      '왜 5초인가요? 뇌의 전전두엽이 "안 해도 되는 이유"를 만들어내는 데 약 5초가 걸리기 때문입니다. 그 5초 안에 행동으로 넘어가면, 뇌가 끼어들 틈이 없어요.',
      '지금 이 글을 읽고 있다면, 5초 카운트다운을 시작해보세요.',
    ],
    source: 'Mel Robbins, The 5 Second Rule',
  },
  {
    id: 'c3',
    category: 'present-bias',
    title: '환경이 동기를 이깁니다',
    subtitle: '실행 의도를 정하면 성공률이 2.5배 올라갑니다',
    body: [
      '"나는 더 건강해질 거야"라는 목표와 "나는 매일 아침 7시에 거실에서 스트레칭을 할 거야"라는 계획. 어느 쪽이 더 효과적일까요?',
      '심리학자 Peter Gollwitzer의 연구에 따르면, 구체적인 실행 의도(언제, 어디서, 무엇을)를 정한 사람들은 그렇지 않은 사람들보다 2~3배 더 높은 달성률을 보였습니다.',
      '이것이 HabitCircle에서 "습관 설계"를 제공하는 이유예요. 시간과 장소를 정해두면, 뇌가 자동으로 그 상황을 트리거로 인식하기 시작합니다.',
      '아직 습관 설계를 안 했다면, 지금 설정해보세요. 작은 차이가 큰 결과를 만듭니다.',
    ],
    source: 'Gollwitzer & Sheeran, 2006, Advances in Experimental Social Psychology',
  },
  {
    id: 'c4',
    category: 'present-bias',
    title: '보상은 즉각적이어야 합니다',
    subtitle: '"6개월 후 건강해질 거야"로는 오늘을 움직일 수 없습니다',
    body: [
      '우리의 뇌는 먼 미래의 보상보다 즉각적인 보상에 훨씬 강하게 반응합니다. 이것을 "지연 할인"이라고 해요.',
      '"6개월 후 10kg 감량"은 이성적으로는 강력한 동기지만, 오늘 저녁 소파에 누워있고 싶은 충동을 이기기엔 턱없이 약합니다.',
      '해결책: 습관 완료 직후에 즉각적인 보상을 연결하세요. 운동 후 좋아하는 팟캐스트 듣기, 독서 후 맛있는 차 한 잔, 명상 후 5분 멍때리기.',
      '습관 자체가 보상이 되려면 시간이 걸립니다. 그전까지는 인공적인 보상이 다리 역할을 해줍니다.',
    ],
    source: 'Ainslie, 2001; Laibson, 1997, Quarterly Journal of Economics',
  },

  // D: 소셜 — "유치하잖아" / "앱이 뭘 해줘" 반박
  {
    id: 'd1',
    category: 'social',
    title: '기록하는 사람이 2배 성공합니다',
    subtitle: '자기 모니터링은 가장 강력한 행동 변화 도구입니다',
    body: [
      '"이런 걸 기록한다고 뭐가 달라져?"라고 생각할 수 있어요.',
      '하지만 100개 이상의 연구를 분석한 메타분석에 따르면, 자기 모니터링(self-monitoring)은 행동 변화를 위한 가장 효과적인 단일 전략입니다.',
      '체중을 기록하는 사람은 그렇지 않은 사람보다 2배 더 체중 감량에 성공했고, 운동을 기록하는 사람은 1.5배 더 꾸준했습니다.',
      '기록의 힘은 "측정"이 아니라 "인식"에 있습니다. 기록하는 순간, 무의식적 행동이 의식적 선택이 됩니다.',
    ],
    source: 'Harkin et al., 2016, Psychological Bulletin',
  },
  {
    id: 'd2',
    category: 'social',
    title: '혼자보다 함께가 42% 더 지속됩니다',
    subtitle: '사회적 약속은 자기 약속보다 강합니다',
    body: [
      '미국 임상스포츠의학회의 연구에 따르면, 혼자 운동하는 사람의 1년 지속률은 약 25%인 반면, 파트너와 함께하는 사람은 67%까지 올라갑니다.',
      '왜일까요? 인간은 사회적 동물이고, "남에게 한 약속"은 "나에게 한 약속"보다 훨씬 강력한 구속력을 가지기 때문입니다.',
      '서클에 참여하거나 친구와 습관을 공유하는 것은 유치한 게 아닙니다. 과학적으로 검증된 행동 변화 전략이에요.',
      '혼자서도 할 수 있습니다. 하지만 함께하면 더 오래 갑니다.',
    ],
    source: 'Wing & Jeffery, 1999, Journal of Consulting and Clinical Psychology',
  },
  {
    id: 'd3',
    category: 'social',
    title: '시스템은 자유를 뺏지 않습니다',
    subtitle: '루틴이 있어야 진짜 자유가 생깁니다',
    body: [
      '"난 자유로운 사람이야. 규칙에 얽매이기 싫어." 이 생각을 가진 사람이 의외로 많습니다.',
      '하지만 역설적으로, 루틴이 없는 사람이 더 많은 "의사결정 피로"에 시달립니다. "오늘 뭐하지?" "운동할까 말까?" 이런 사소한 결정들이 하루의 에너지를 갉아먹어요.',
      '루틴이 있으면 이런 결정을 자동화할 수 있습니다. 아침 7시에 일어나서 스트레칭하는 사람은 "오늘 운동할까?"를 고민하지 않아요. 그냥 합니다.',
      '자유는 아무것도 안 하는 게 아니라, 중요한 것에 에너지를 쓸 수 있는 상태입니다.',
    ],
    source: 'Baumeister & Tierney, 2011, Willpower',
  },
  {
    id: 'd4',
    category: 'social',
    title: '느끼지 못해도 변하고 있습니다',
    subtitle: '고원기를 지나면 도약이 옵니다',
    body: [
      '1개월째 매일 운동하는데 체중이 안 빠져요. 2주째 매일 공부하는데 실력이 안 느는 것 같아요.',
      '이것은 학습 곡선의 "고원기(Plateau)"입니다. 눈에 보이는 변화가 멈추는 시기. 대부분의 사람이 이 시점에서 포기합니다.',
      '하지만 뇌과학적으로 보면, 고원기에도 신경 경로는 계속 강화되고 있습니다. 마치 얼음을 녹이는 것처럼 — 0도에서 오랫동안 아무 변화도 없다가, 특정 시점에서 갑자기 녹기 시작하죠.',
      '변화는 선형적이지 않습니다. 계속하세요. 어느 날 갑자기 "언제부터 이렇게 쉬워졌지?"라고 느끼는 순간이 옵니다.',
    ],
    source: 'Clear, 2018, Atomic Habits; Ericsson, 2006',
    triggerCondition: { daysSinceJoin: [25, 60] },
  },

  // E: 습관의 과학
  {
    id: 'e1',
    category: 'science',
    title: '정체성 먼저, 행동은 그 다음',
    subtitle: '결과가 아니라 정체성에서 시작하세요',
    body: [
      '대부분의 사람은 습관을 결과에서 시작합니다. "10kg 빼야지", "책 12권 읽어야지."',
      'James Clear는 이것을 뒤집어야 한다고 말합니다. 변화의 세 가지 층: 결과(What) → 과정(How) → 정체성(Who). 가장 깊고 지속적인 변화는 정체성에서 시작합니다.',
      '"살 빼야지"가 아니라 "나는 건강한 사람이다." "책 읽어야지"가 아니라 "나는 독서하는 사람이다."',
      '정체성이 바뀌면 행동은 자연스럽게 따라옵니다. 건강한 사람은 운동을 "해야 할 일"이 아니라 "나답게 하는 일"로 인식하니까요.',
    ],
    source: 'James Clear, Atomic Habits, Chapter 2',
  },
  {
    id: 'e2',
    category: 'science',
    title: '습관 쌓기: 기존 습관에 연결하세요',
    subtitle: '"[기존 습관] 후에 [새 습관]을 한다"',
    body: [
      '새 습관을 처음부터 만드는 것보다 기존 습관에 연결하는 것이 훨씬 쉽습니다. 이것을 "습관 쌓기(Habit Stacking)"라고 해요.',
      '공식: "[현재 습관]을 한 후에 [새 습관]을 한다."',
      '예시: "아침에 커피를 내린 후에 감사일기 3줄을 쓴다." "양치질을 한 후에 1분 스트레칭을 한다." "점심을 먹은 후에 10분 산책을 한다."',
      '이미 자동화된 행동(커피, 양치, 식사)이 새 습관의 트리거가 됩니다. 별도의 알림이나 의지력 없이도 자연스럽게 연결돼요.',
    ],
    source: 'BJ Fogg, Tiny Habits; James Clear, Atomic Habits',
  },
  {
    id: 'e3',
    category: 'science',
    title: '동기는 행동 뒤에 옵니다',
    subtitle: '기분이 좋아서 하는 게 아니라, 해서 기분이 좋아집니다',
    body: [
      '"오늘은 기분이 안 좋아서 안 해야지." "동기가 생기면 그때 시작해야지."',
      '이것은 직관적이지만 틀린 생각입니다. 인지행동치료(CBT)의 핵심 원리 중 하나인 "행동 활성화"에 따르면, 기분은 행동의 원인이 아니라 결과입니다.',
      '우울한 사람에게 "기분 좋아지면 산책하세요"가 아니라 "산책하면 기분이 좋아집니다"가 맞는 순서예요.',
      '동기를 기다리지 마세요. 일단 시작하면 동기가 따라옵니다. 행동이 감정을 만들고, 감정이 다시 행동을 강화합니다.',
    ],
    source: 'Jacobson et al., 2001; Martell et al., 2010, Behavioral Activation for Depression',
  },
  {
    id: 'e4',
    category: 'science',
    title: '66일의 과학',
    subtitle: '습관이 자동화되는 데 걸리는 실제 시간',
    body: [
      '"21일이면 습관이 된다"는 말을 들어보셨죠? 이건 사실 과학이 아니라 성형외과 의사의 관찰에서 나온 속설입니다.',
      'Phillippa Lally의 2009년 연구에 따르면, 새로운 행동이 자동화되는 데 걸리는 시간은 평균 66일이었습니다. 하지만 개인차가 커서 18일에서 254일까지 범위가 넓었어요.',
      '중요한 발견: 중간에 하루이틀 빠져도 자동화 과정에 큰 영향을 주지 않았습니다. 완벽하지 않아도 괜찮다는 뜻이에요.',
      '21일에 안 됐다고 실망하지 마세요. 66일, 혹은 그 이상이 걸릴 수 있습니다. 그리고 그것은 완전히 정상입니다.',
    ],
    source: 'Lally et al., 2010, European Journal of Social Psychology',
    triggerCondition: { daysSinceJoin: [14, 30] },
  },
];

/**
 * Get today's insight for the dashboard card.
 * Priority: context-matched trigger > date-based rotation
 */
export function getTodayInsight(context: {
  daysSinceJoin: number;
  streakBroken: boolean;
  completionRate7: number;
  habitCount: number;
}): Insight {
  // 1. Check for context-matched insights (priority triggers)
  if (context.streakBroken) {
    const matched = INSIGHTS.filter(i => i.triggerCondition?.streakBroken);
    if (matched.length > 0) {
      // Rotate among streak-broken insights by day
      const dayIndex = Math.floor(Date.now() / 86400000) % matched.length;
      return matched[dayIndex];
    }
  }

  if (context.habitCount === 0) {
    return INSIGHTS.find(i => i.id === 'a2') || INSIGHTS[0];
  }

  // 2. Check daysSinceJoin triggers
  const dayMatched = INSIGHTS.filter(i => {
    const cond = i.triggerCondition?.daysSinceJoin;
    if (!cond) return false;
    return context.daysSinceJoin >= cond[0] && context.daysSinceJoin <= cond[1];
  });
  if (dayMatched.length > 0) {
    const dayIndex = Math.floor(Date.now() / 86400000) % dayMatched.length;
    return dayMatched[dayIndex];
  }

  // 3. Default: rotate through all insights by date
  const dayIndex = Math.floor(Date.now() / 86400000) % INSIGHTS.length;
  return INSIGHTS[dayIndex];
}

/**
 * Get recommended insights for the insights listing page.
 * Returns top 3 most relevant insights based on user context.
 */
export function getRecommendedInsights(context: {
  daysSinceJoin: number;
  streakBroken: boolean;
  completionRate7: number;
  habitCount: number;
}): Insight[] {
  const scored = INSIGHTS.map(insight => {
    let score = 0;
    const cond = insight.triggerCondition;
    if (!cond) return { insight, score: 1 };

    if (cond.streakBroken && context.streakBroken) score += 10;
    if (cond.noHabits && context.habitCount === 0) score += 10;
    if (cond.daysSinceJoin) {
      if (context.daysSinceJoin >= cond.daysSinceJoin[0] && context.daysSinceJoin <= cond.daysSinceJoin[1]) {
        score += 5;
      }
    }
    if (cond.completionRate) {
      if (context.completionRate7 >= cond.completionRate[0] && context.completionRate7 <= cond.completionRate[1]) {
        score += 5;
      }
    }
    return { insight, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 3).map(s => s.insight);
}
