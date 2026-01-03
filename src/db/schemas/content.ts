export const contentSchema = {
    version: 6,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: {
            type: 'string',
            maxLength: 100
        },
        type: {
            type: 'string',
            enum: ['subject', 'module', 'text', 'quiz', 'lesson']
        },
        title: {
            type: 'string'
        },
        thumbnail: {
            type: 'string'
        },
        description: {
            type: 'string'
        },
        classId: {
            type: 'string'
        },
        subjectId: {
            type: 'string' // Optional, for module/lesson/quiz
        },
        moduleId: {
            type: 'string' // Optional, for lesson/quiz
        },
        isHomework: {
            type: 'boolean'
        },
        data: {
            type: 'object',
            properties: {
                content: { type: 'string' }, // Legacy single-lang content
                questions: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            text: { type: 'string' },
                            options: {
                                type: 'array',
                                items: { type: 'string' }
                            },
                            correctAnswer: { type: 'number' }
                        }
                    }
                },
                // New Fields for v4
                translations: {
                    type: 'object',
                    // Map of langCode -> htmlContent
                    // e.g., { "en": "...", "hi": "...", "mr": "..." }
                },
                attachments: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            name: { type: 'string' },
                            type: { type: 'string' }, // e.g. application/pdf
                            data: { type: 'string' }  // Base64
                        }
                    }
                }
            }
        },
        teacherId: {
            type: 'string'
        },
        createdAt: {
            type: 'number'
        },
        updatedAt: {
            type: 'number'
        },
        medium: {
            type: 'string', // 'english' | 'marathi'
            enum: ['english', 'marathi']
        }
    },
    required: ['id', 'type', 'title', 'createdAt']
} as const;
