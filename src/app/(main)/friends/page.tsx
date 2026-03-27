'use client';

import { useState, useEffect } from 'react';
import { useAuthFetch } from '@/hooks/useAuthFetch';

interface Friend {
  id: number;
  username: string;
  display_name: string;
  avatar_color: string;
  completed_today: number;
  total_habits: number;
}

interface PendingRequest {
  friendship_id: number;
  id: number;
  username: string;
  display_name: string;
  avatar_color: string;
}

interface FeedItem {
  date: string;
  created_at: string;
  habit_name: string;
  habit_emoji: string;
  username: string;
  display_name: string;
  avatar_color: string;
}

function relativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr.includes('T') ? dateStr : dateStr + 'T12:00:00+09:00');
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return '어제';
  if (diffDays < 7) return `${diffDays}일 전`;
  return dateStr;
}

export default function FriendsPage() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingReceived, setPendingReceived] = useState<PendingRequest[]>([]);
  const [pendingSent, setPendingSent] = useState<PendingRequest[]>([]);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [tab, setTab] = useState<'friends' | 'feed'>('friends');
  const [searchName, setSearchName] = useState('');
  const [searchMsg, setSearchMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const authFetch = useAuthFetch();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [friendsRes, feedRes] = await Promise.all([
        authFetch('/api/friends').then(r => r.json()),
        authFetch('/api/feed').then(r => r.json()),
      ]);
      setFriends(friendsRes.friends || []);
      setPendingReceived(friendsRes.pendingReceived || []);
      setPendingSent(friendsRes.pendingSent || []);
      setFeed(feedRes.feed || []);
    } catch {
      // API error handled by authFetch (401 redirect)
    } finally {
      setLoading(false);
    }
  }

  async function sendRequest(e: React.FormEvent) {
    e.preventDefault();
    setSearchMsg('');
    const res = await authFetch('/api/friends', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: searchName }),
    });
    const data = await res.json();
    setSearchMsg(data.message || data.error);
    if (res.ok) {
      setSearchName('');
      loadData();
    }
  }

  async function handleRequest(friendshipId: number, action: 'accept' | 'decline') {
    await authFetch(`/api/friends/${friendshipId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    loadData();
  }

  async function cancelRequest(friendshipId: number) {
    await authFetch(`/api/friends/${friendshipId}`, { method: 'DELETE' });
    loadData();
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-6 h-6 border-2 border-teal/20 border-t-teal rounded-full animate-spin" /></div>;
  }

  return (
    <div className="px-5 pt-12 pb-6">
      <h1 className="text-2xl font-bold mb-6 animate-in">친구</h1>

      {/* Add friend */}
      <form onSubmit={sendRequest} className="flex gap-2 mb-6 animate-in delay-1">
        <input
          type="text" value={searchName} onChange={e => setSearchName(e.target.value)}
          placeholder="사용자명으로 친구 추가"
          className="flex-1 px-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:border-teal outline-none"
        />
        <button type="submit" className="px-4 py-2.5 bg-teal text-white rounded-xl text-sm font-medium hover:bg-teal-dark transition-colors shrink-0">추가</button>
      </form>
      {searchMsg && <p className="text-sm text-center mb-4 text-warm-gray">{searchMsg}</p>}

      {/* Pending received */}
      {pendingReceived.length > 0 && (
        <div className="mb-6 animate-in delay-2">
          <h2 className="text-sm font-medium text-warm-gray mb-3">받은 요청</h2>
          <div className="space-y-2">
            {pendingReceived.map(req => (
              <div key={req.friendship_id} className="flex items-center gap-3 p-3 bg-amber-light/50 rounded-xl">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ backgroundColor: req.avatar_color }}>
                  {req.username[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{req.username}</p>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => handleRequest(req.friendship_id, 'accept')} className="px-3 py-1.5 bg-teal text-white rounded-lg text-xs font-medium">수락</button>
                  <button onClick={() => handleRequest(req.friendship_id, 'decline')} className="px-3 py-1.5 bg-border text-warm-gray rounded-lg text-xs font-medium">거절</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending sent */}
      {pendingSent.length > 0 && (
        <div className="mb-6 animate-in delay-2">
          <h2 className="text-sm font-medium text-warm-gray mb-3">보낸 요청</h2>
          <div className="space-y-2">
            {pendingSent.map(req => (
              <div key={req.friendship_id} className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-border-light">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ backgroundColor: req.avatar_color }}>
                  {req.username[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{req.username}</p>
                </div>
                <button onClick={() => cancelRequest(req.friendship_id)}
                  className="px-3 py-1.5 bg-cream-dark text-warm-gray rounded-lg text-xs font-medium hover:bg-border transition-colors">
                  취소
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-cream-dark rounded-xl p-1 mb-4 animate-in delay-2">
        <button onClick={() => setTab('friends')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'friends' ? 'bg-surface text-charcoal shadow-sm' : 'text-warm-gray'}`}>
          친구 {friends.length > 0 && <span className="text-warm-gray-light ml-1">{friends.length}</span>}
        </button>
        <button onClick={() => setTab('feed')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'feed' ? 'bg-surface text-charcoal shadow-sm' : 'text-warm-gray'}`}>
          활동 피드
        </button>
      </div>

      {tab === 'friends' ? (
        friends.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-warm-gray text-sm">아직 친구가 없어요</p>
            <p className="text-warm-gray-light text-xs mt-1">사용자명으로 친구를 추가해보세요</p>
          </div>
        ) : (
          <div className="space-y-2">
            {friends.map((friend, i) => (
              <div key={friend.id} className={`flex items-center gap-3 p-4 bg-surface rounded-2xl border border-border-light animate-in delay-${Math.min(i + 3, 8)}`}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ backgroundColor: friend.avatar_color }}>
                  {friend.username[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[15px] truncate">{friend.username}</p>
                </div>
                {friend.total_habits > 0 && (
                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium text-teal">{friend.completed_today}/{friend.total_habits}</p>
                    <p className="text-[10px] text-warm-gray-light">오늘 완료</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      ) : (
        feed.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-warm-gray text-sm">아직 활동이 없어요</p>
            <p className="text-warm-gray-light text-xs mt-1">친구가 공유한 습관의 활동이 여기에 표시됩니다</p>
          </div>
        ) : (
          <div className="space-y-2">
            {feed.map((item, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 bg-surface rounded-xl border border-border-light animate-in delay-${Math.min(i + 3, 8)}`}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: item.avatar_color }}>
                  {item.username[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">{item.username}</span>
                    <span className="text-warm-gray">님이 </span>
                    <span className="font-medium">{item.habit_emoji} {item.habit_name}</span>
                    <span className="text-warm-gray"> 완료!</span>
                  </p>
                  <p className="text-[11px] text-warm-gray-light mt-0.5">{relativeTime(item.created_at || item.date)}</p>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
