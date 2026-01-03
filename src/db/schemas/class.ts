export const classSchema = {
    version: 3,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: {
            type: 'string',
            maxLength: 100
        },
        name: {
            type: 'string'
        },
        standard: {
            type: 'string'
        },
        medium: {
            type: 'string',
            enum: ['english', 'marathi']
        },
        teacherId: {
            // The teacher who owns this class
            type: 'string'
        },
        code: {
            type: 'string',
            maxLength: 6
        },
        createdAt: {
            type: 'number'
        }
    },
    required: ['id', 'name', 'teacherId', 'createdAt']
} as const;
