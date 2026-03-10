import { db } from './index.js';

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export async function saveMessage(userId: string, role: string, content: string) {
    const timestamp = Date.now();
    await db.collection('memory').doc(userId).collection('messages').add({
        role,
        content,
        timestamp
    });
}

export async function getHistory(userId: string, limit: number = 20): Promise<ChatMessage[]> {
    const snapshot = await db.collection('memory').doc(userId).collection('messages')
        .orderBy('timestamp', 'desc')
        .limit(limit)
        .get();

    const rows = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            role: data.role as 'system' | 'user' | 'assistant',
            content: data.content || ""
        };
    });
    // Reverse to get chronological order (oldest to newest)
    return rows.reverse();
}

export async function clearHistory(userId: string) {
    const snapshot = await db.collection('memory').doc(userId).collection('messages').get();
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });
    await batch.commit();
}
