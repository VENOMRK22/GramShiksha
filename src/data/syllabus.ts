export type Standard = '1st-4th' | '5th-8th' | '9th-10th';
export type Medium = 'english' | 'marathi';

export const getSubjects = (standardVal: string, medium: Medium): string[] => {
    // Normalize standard input (handle '1st', '4th', '10', etc.)
    const stdNum = parseInt(standardVal.replace(/\D/g, ''));
    let standardGroup: Standard;

    if (stdNum >= 1 && stdNum <= 4) standardGroup = '1st-4th';
    else if (stdNum >= 5 && stdNum <= 8) standardGroup = '5th-8th';
    else if (stdNum >= 9 && stdNum <= 10) standardGroup = '9th-10th';
    else return []; // Default empty if out of range

    const subjects: Record<Medium, Record<Standard, string[]>> = {
        english: {
            '1st-4th': ['English', 'Marathi', 'Mathematics', 'Environmental Studies'],
            '5th-8th': ['English', 'Hindi', 'Marathi', 'Mathematics', 'General Science', 'History & Civics', 'Geography'],
            '9th-10th': [
                'English', 'Hindi', 'Marathi',
                'Mathematics Part-I (Algebra)', 'Mathematics Part-II (Geometry)',
                'Science & Technology Part-I', 'Science & Technology Part-II',
                'History & Political Science', 'Geography',
                ...(stdNum === 10 ? ['Defense Studies'] : [])
            ]
        },
        marathi: {
            '1st-4th': ['Marathi', 'English', 'Mathematics', 'Environmental Studies'],
            '5th-8th': ['Marathi', 'Hindi', 'English', 'Mathematics', 'General Science', 'History & Civics', 'Geography'],
            '9th-10th': [
                'Marathi', 'Hindi', 'English',
                'Mathematics Part-I (Algebra)', 'Mathematics Part-II (Geometry)',
                'Science & Technology Part-I', 'Science & Technology Part-II',
                'History & Political Science', 'Geography',
                ...(stdNum === 10 ? ['Defense Studies'] : [])
            ]
        }
    };

    return subjects[medium][standardGroup];
};
