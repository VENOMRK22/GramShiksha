import type { RxCollection } from 'rxdb';
import { generateCurriculum } from './curriculumData';

export async function seedContent(contentCollection: RxCollection) {
    const count = await contentCollection.count().exec();

    // If we have less than 50 items, assume it's empty or old mock data
    // The full curriculum is ~1000 items.
    if (count > 100) {
        console.log('Database likely already seeded with full curriculum. Skipping. (Count:', count, ')');
        return;
    }

    console.log('Seeding comprehensive curriculum (Classes 1-10, English & Marathi)...');
    try {
        const data = generateCurriculum();

        // Chunk insert to avoid browser/memory limits if needed
        // For ~1500 items, bulkInsert should handle it, but chunking is safer for Dexie
        const chunkSize = 100;
        for (let i = 0; i < data.length; i += chunkSize) {
            const chunk = data.slice(i, i + chunkSize);
            await contentCollection.bulkUpsert(chunk);
            console.log(`Seeded chunk ${i} to ${i + chunk.length}`);
        }

        console.log('Seeding complete! 🚀 Total items:', data.length);
    } catch (err) {
        console.error('Seeding failed:', err);
    }
}
