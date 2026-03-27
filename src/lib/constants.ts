export const IDENTITY_OPTIONS = [
  { id: 'healthy', emoji: '💪', label: '건강한 사람', desc: '몸과 마음을 돌보는' },
  { id: 'learner', emoji: '📚', label: '배우는 사람', desc: '매일 성장하는' },
  { id: 'creative', emoji: '🎨', label: '창의적인 사람', desc: '꾸준히 만들어가는' },
  { id: 'mindful', emoji: '🧘', label: '마음챙김하는 사람', desc: '의식적으로 사는' },
  { id: 'productive', emoji: '🎯', label: '생산적인 사람', desc: '목표를 달성하는' },
  { id: 'social', emoji: '🤝', label: '관계를 가꾸는 사람', desc: '사람을 소중히 여기는' },
];

export interface HabitTemplate {
  name: string;
  emoji: string;
  category: string;
}

export const HABIT_TEMPLATES: Record<string, HabitTemplate[]> = {
  healthy: [
    { name: '아침 운동 30분', emoji: '🏃', category: 'healthy' },
    { name: '물 8잔 마시기', emoji: '💧', category: 'healthy' },
    { name: '7시간 수면', emoji: '😴', category: 'healthy' },
    { name: '스트레칭 10분', emoji: '🧘', category: 'healthy' },
    { name: '건강한 식사', emoji: '🥗', category: 'healthy' },
  ],
  learner: [
    { name: '30분 독서', emoji: '📚', category: 'learner' },
    { name: '새로운 것 배우기', emoji: '🧠', category: 'learner' },
    { name: '영어 공부 20분', emoji: '📝', category: 'learner' },
    { name: '온라인 강의 1강', emoji: '💻', category: 'learner' },
    { name: '일기 쓰기', emoji: '✍️', category: 'learner' },
  ],
  creative: [
    { name: '글쓰기 30분', emoji: '✍️', category: 'creative' },
    { name: '그림 그리기', emoji: '🎨', category: 'creative' },
    { name: '악기 연습', emoji: '🎵', category: 'creative' },
    { name: '사진 촬영', emoji: '📷', category: 'creative' },
    { name: '아이디어 기록', emoji: '💡', category: 'creative' },
  ],
  mindful: [
    { name: '명상 10분', emoji: '🧘', category: 'mindful' },
    { name: '감사일기 3줄', emoji: '🙏', category: 'mindful' },
    { name: '디지털 디톡스 1시간', emoji: '📵', category: 'mindful' },
    { name: '산책 20분', emoji: '🚶', category: 'mindful' },
    { name: '호흡 운동', emoji: '🌬️', category: 'mindful' },
  ],
  productive: [
    { name: '오늘 할 일 3개 정하기', emoji: '📋', category: 'productive' },
    { name: '딥워크 2시간', emoji: '🎯', category: 'productive' },
    { name: '이메일 정리', emoji: '📧', category: 'productive' },
    { name: '하루 회고 5분', emoji: '📝', category: 'productive' },
    { name: '코딩 1시간', emoji: '💻', category: 'productive' },
  ],
  social: [
    { name: '가족에게 연락하기', emoji: '👨‍👩‍👧', category: 'social' },
    { name: '친구에게 안부 묻기', emoji: '💬', category: 'social' },
    { name: '칭찬 1번 하기', emoji: '👏', category: 'social' },
    { name: '경청 연습', emoji: '👂', category: 'social' },
    { name: '봉사/기부', emoji: '❤️', category: 'social' },
  ],
};

export const ALL_POPULAR: HabitTemplate[] = [
  { name: '30분 독서', emoji: '📚', category: 'learner' },
  { name: '아침 운동', emoji: '🏃', category: 'healthy' },
  { name: '물 8잔 마시기', emoji: '💧', category: 'healthy' },
  { name: '명상 10분', emoji: '🧘', category: 'mindful' },
  { name: '일기 쓰기', emoji: '✍️', category: 'learner' },
  { name: '7시간 수면', emoji: '😴', category: 'healthy' },
  { name: '감사일기 3줄', emoji: '🙏', category: 'mindful' },
  { name: '코딩 1시간', emoji: '💻', category: 'productive' },
];

export function getIdentityByid(id: string) {
  return IDENTITY_OPTIONS.find(o => o.id === id);
}
