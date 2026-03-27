/**
 * Seed script: creates demo data for testing
 * Run: npx tsx scripts/seed.ts
 */
import Database from 'better-sqlite3';
import { hash } from 'bcryptjs';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'habitcircle.db');

// Safety check: warn before deleting existing data
if (fs.existsSync(dbPath) && !process.argv.includes('--force')) {
  console.error('⚠️  habitcircle.db already exists. This will DELETE ALL DATA.');
  console.error('   Run with --force to confirm: npx tsx scripts/seed.ts --force');
  process.exit(1);
}

// Delete existing DB for clean seed
if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const schemaPath = path.join(process.cwd(), 'src', 'lib', 'db', 'schema.sql');
db.exec(fs.readFileSync(schemaPath, 'utf-8'));

async function seed() {
  console.log('🌱 Seeding database...');

  // Create users
  const pw = await hash('password', 12);
  const users = [
    { username: 'minjun', email: 'minjun@test.com', displayName: '김민준', color: '#6366f1' },
    { username: 'soyeon', email: 'soyeon@test.com', displayName: '이소연', color: '#ec4899' },
    { username: 'jihoon', email: 'jihoon@test.com', displayName: '박지훈', color: '#f97316' },
  ];

  const insertUser = db.prepare(
    'INSERT INTO users (username, email, password_hash, display_name, avatar_color) VALUES (?, ?, ?, ?, ?)'
  );
  for (const u of users) {
    insertUser.run(u.username, u.email, pw, u.displayName, u.color);
  }
  console.log('  ✅ 3 users created (password: "password" for all)');

  // Create habits for user 1 (minjun)
  const habits = [
    { name: '30분 독서', emoji: '📚', shared: 1 },
    { name: '아침 운동', emoji: '🏃', shared: 1 },
    { name: '물 8잔 마시기', emoji: '💧', shared: 0 },
    { name: '명상 10분', emoji: '🧘', shared: 1 },
    { name: '일기 쓰기', emoji: '✍️', shared: 0 },
  ];

  const insertHabit = db.prepare(
    'INSERT INTO habits (user_id, name, emoji, is_shared) VALUES (?, ?, ?, ?)'
  );
  for (const h of habits) {
    insertHabit.run(1, h.name, h.emoji, h.shared);
  }

  // Habits for user 2 (soyeon)
  insertHabit.run(2, '30분 독서', '📚', 1);
  insertHabit.run(2, '스트레칭', '🧘', 1);
  insertHabit.run(2, '영어 공부', '📝', 1);

  // Habits for user 3 (jihoon)
  insertHabit.run(3, '아침 운동', '🏃', 1);
  insertHabit.run(3, '코딩 1시간', '💻', 1);

  console.log('  ✅ 10 habits created');

  // Generate habit logs for past 30 days
  const insertLog = db.prepare(
    'INSERT OR IGNORE INTO habit_logs (habit_id, user_id, date) VALUES (?, ?, ?)'
  );

  const today = new Date();
  for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
    const d = new Date(today);
    d.setDate(d.getDate() - dayOffset);
    const dateStr = d.toISOString().split('T')[0];

    // User 1: strong habits (80% completion)
    for (let habitId = 1; habitId <= 5; habitId++) {
      if (Math.random() < 0.8 || dayOffset < 7) {
        insertLog.run(habitId, 1, dateStr);
      }
    }

    // User 2: moderate habits (60% completion)
    for (let habitId = 6; habitId <= 8; habitId++) {
      if (Math.random() < 0.6) {
        insertLog.run(habitId, 2, dateStr);
      }
    }

    // User 3: new user habits (50% completion, recent only)
    if (dayOffset < 14) {
      for (let habitId = 9; habitId <= 10; habitId++) {
        if (Math.random() < 0.5) {
          insertLog.run(habitId, 3, dateStr);
        }
      }
    }
  }
  console.log('  ✅ Habit logs generated (30 days)');

  // Create friendships
  db.prepare('INSERT INTO friendships (requester_id, addressee_id, status) VALUES (?, ?, ?)').run(1, 2, 'accepted');
  db.prepare('INSERT INTO friendships (requester_id, addressee_id, status) VALUES (?, ?, ?)').run(1, 3, 'accepted');
  db.prepare('INSERT INTO friendships (requester_id, addressee_id, status) VALUES (?, ?, ?)').run(2, 3, 'pending');
  console.log('  ✅ Friendships created');

  // Create a circle
  db.prepare('INSERT INTO circles (name, description, emoji, invite_code, created_by) VALUES (?, ?, ?, ?, ?)').run(
    '독서 챌린지', '매일 30분씩 독서하기 챌린지!', '📚', 'READ30', 1
  );
  db.prepare('INSERT INTO circle_members (circle_id, user_id, role) VALUES (?, ?, ?)').run(1, 1, 'owner');
  db.prepare('INSERT INTO circle_members (circle_id, user_id, role) VALUES (?, ?, ?)').run(1, 2, 'member');

  // Link habits to circle
  db.prepare('INSERT INTO circle_habits (circle_id, habit_id, user_id) VALUES (?, ?, ?)').run(1, 1, 1); // minjun's reading habit
  db.prepare('INSERT INTO circle_habits (circle_id, habit_id, user_id) VALUES (?, ?, ?)').run(1, 6, 2); // soyeon's reading habit

  // Second circle
  db.prepare('INSERT INTO circles (name, description, emoji, invite_code, created_by) VALUES (?, ?, ?, ?, ?)').run(
    '운동 모임', '함께 운동하는 모임', '💪', 'FIT123', 1
  );
  db.prepare('INSERT INTO circle_members (circle_id, user_id, role) VALUES (?, ?, ?)').run(2, 1, 'owner');
  db.prepare('INSERT INTO circle_members (circle_id, user_id, role) VALUES (?, ?, ?)').run(2, 3, 'member');

  db.prepare('INSERT INTO circle_habits (circle_id, habit_id, user_id) VALUES (?, ?, ?)').run(2, 2, 1); // minjun's exercise
  db.prepare('INSERT INTO circle_habits (circle_id, habit_id, user_id) VALUES (?, ?, ?)').run(2, 9, 3); // jihoon's exercise

  console.log('  ✅ 2 circles created with members');

  console.log('\n🎉 Seed complete!');
  console.log('\n📋 Test accounts:');
  console.log('  minjun@test.com / password (5 habits, 2 friends, 2 circles)');
  console.log('  soyeon@test.com / password (3 habits, 1 friend, 1 circle)');
  console.log('  jihoon@test.com / password (2 habits, 1 friend, 1 circle)');
}

seed().then(() => db.close());
