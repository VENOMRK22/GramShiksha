export const LEVEL_PASS_THRESHOLD = 0.6; // 60% to pass

export interface QuizResult {
    score: number;
    total: number;
    stars: number;
    passed: boolean;
    coinsEarned: number;
}

export const calculateResult = (correctAnswers: number, totalQuestions: number): QuizResult => {
    const percentage = correctAnswers / totalQuestions;
    let stars = 0;
    let coinsEarned = 0;

    if (percentage >= 0.6) stars = 1;
    if (percentage >= 0.8) stars = 2;
    if (percentage === 1.0) stars = 3;

    if (stars === 1) coinsEarned = 10;
    if (stars === 2) coinsEarned = 25;
    if (stars === 3) coinsEarned = 50;

    return {
        score: Math.round(percentage * 100),
        total: totalQuestions,
        stars,
        passed: stars > 0,
        coinsEarned
    };
};

export const getPointsForStars = (stars: number) => {
    switch (stars) {
        case 1: return 10;
        case 2: return 25;
        case 3: return 50;
        default: return 0;
    }
};
