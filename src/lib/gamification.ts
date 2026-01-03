import type { EduDatabase } from '../db/database';


export interface LeaderboardEntry {
    id: string;
    name: string;
    avatarId: string;
    totalStars: number;
    totalScore: number;
    rank: number;
}

export const getLeaderboard = async (db: EduDatabase, classId?: string): Promise<LeaderboardEntry[]> => {
    // 1. Get Users
    const allDocs = await db.users.find().exec();
    const students = allDocs.filter((u: any) => {
        const isStudent = u.get('role') !== 'teacher';
        if (classId) {
            return isStudent && u.get('teacherClassId') === classId;
        }
        return isStudent;
    });

    // 2. Get Progress
    const allProgress = await db.progress.find().exec();

    // 3. Aggregate
    const scores: Record<string, number> = {};
    const stars: Record<string, number> = {};

    allProgress.forEach((doc: any) => {
        const uid = doc.get('userId');
        const s = doc.get('score') || 0;
        const st = doc.get('stars') || 0;

        if (!scores[uid]) scores[uid] = 0;
        if (!stars[uid]) stars[uid] = 0;

        stars[uid] += st;
        scores[uid] += s;
    });

    // 4. Map & Sort
    const ranked: LeaderboardEntry[] = students.map((u: any) => ({
        id: u.get('id'),
        name: u.get('name'),
        avatarId: u.get('avatarId'),
        totalStars: stars[u.get('id')] || 0,
        totalScore: scores[u.get('id')] || 0,
        rank: 0 // placeholder
    }));

    // Sort by STARS first, then SCORE
    ranked.sort((a, b) => {
        if (b.totalStars !== a.totalStars) return b.totalStars - a.totalStars;
        return b.totalScore - a.totalScore;
    });

    // Assign Ranks
    return ranked.map((entry, index) => ({
        ...entry,
        rank: index + 1
    }));
};
