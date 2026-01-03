export const progressSchema = {
    version: 0,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: {
            type: 'string',
            maxLength: 100
        },
        userId: {
            type: 'string', // linking to user
            maxLength: 100
        },
        levelId: {
            type: 'string'
        },
        score: {
            type: 'number'
        },
        stars: {
            type: 'number',
            minimum: 0,
            maximum: 3
        },
        timestamp: {
            type: 'number'
        }
    },
    required: ['id', 'userId', 'levelId', 'score', 'stars', 'timestamp'],
    indexes: ['userId'] // Crucial for querying specific user's progress
} as const;
