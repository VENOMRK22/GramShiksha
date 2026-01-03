export interface User {
    id: string;
    name: string;
    avatarId: string;
    pinHash: string;
    role: 'student' | 'teacher';
    classId?: string;
    createdAt: number;

    // New Fields v3
    birthdate?: string;
    rollNo?: string;
    schoolName?: string;
    villageName?: string;
    state?: string;
    country?: string;
    ipAddress?: string;
    password?: string; // Storing plain or hashed, locally
    phone?: string; // New Field v5
    medium?: 'english' | 'marathi'; // New Field v4
    teacherClassId?: string; // v7: Linked Teacher Class UUID
}

export const userSchema = {
    version: 7,
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
        avatarId: {
            type: 'string'
        },
        pinHash: {
            type: 'string'
        },
        role: {
            type: 'string',
            enum: ['student', 'teacher'],
            default: 'student'
        },
        classId: {
            type: 'string'
        },
        birthdate: {
            type: 'string'
        },
        rollNo: {
            type: 'string'
        },
        schoolName: {
            type: 'string'
        },
        villageName: {
            type: 'string'
        },
        state: {
            type: 'string'
        },
        country: {
            type: 'string'
        },
        ipAddress: {
            type: 'string'
        },
        password: {
            type: 'string'
        },
        medium: {
            type: 'string',
            enum: ['english', 'marathi']
        },
        phone: {
            type: 'string' // v5
        },
        teacherClassId: {
            type: 'string' // v7
        },
        createdAt: {
            type: 'number'
        }
    },
    required: ['id', 'name', 'avatarId', 'pinHash', 'createdAt', 'role']
} as const;
