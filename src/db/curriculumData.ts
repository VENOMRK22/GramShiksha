import { v4 as uuidv4 } from 'uuid';

// Types
export interface ContentItem {
    id: string;
    type: 'subject' | 'lesson' | 'module';
    title: string;
    description?: string;
    classId: string;
    subjectId?: string;
    medium: 'english' | 'marathi';
    createdAt: number;
    thumbnail?: string; // Optional
    data?: any;
}

const subjectsMap: Record<string, { en: string; mr: string; icon?: string }> = {
    // Languages
    'english': { en: 'English', mr: 'इंग्रजी' },
    'marathi': { en: 'Marathi', mr: 'मराठी' },
    'hindi': { en: 'Hindi', mr: 'हिंदी' },

    // Core
    'math': { en: 'Mathematics', mr: 'गणित' },
    'evs': { en: 'Environmental Studies', mr: 'परिसर अभ्यास' },

    // Middle School
    'science': { en: 'General Science', mr: 'सामान्य विज्ञान' },
    'history_civics': { en: 'History & Civics', mr: 'इतिहास आणि नागरिकशास्त्र' },
    'geography': { en: 'Geography', mr: 'भूगोल' },

    // High School (9th & 10th)
    'math_1': { en: 'Mathematics Part-I (Algebra)', mr: 'गणित भाग-१ (बीजगणित)' },
    'math_2': { en: 'Mathematics Part-II (Geometry)', mr: 'गणित भाग-२ (भूमिती)' },
    'science_1': { en: 'Science & Technology Part-I', mr: 'विज्ञान आणि तंत्रज्ञान भाग-१' },
    'science_2': { en: 'Science & Technology Part-II', mr: 'विज्ञान आणि तंत्रज्ञान भाग-२' },
    'history_poly': { en: 'History & Political Science', mr: 'इतिहास आणि राज्यशास्त्र' },
    'defense': { en: 'Defense Studies', mr: 'संरक्षण शास्त्र' },
};

// Map generic templates to new keys if needed, or simply reuse 'math' template for 'math_1' etc for MVP
const lessonTemplates: Record<string, { en: string[], mr: string[] }> = {
    'math': {
        en: ['Number Systems', 'Addition', 'Subtraction', 'Multiplication', 'Shapes'],
        mr: ['संख्या प्रणाली', 'बेरीज', 'वजाबाकी', 'गुणाकार', 'आकार']
    },
    'math_1': {
        en: ['Linear Equations', 'Quadratic Equations', 'Arithmetic Progression', 'Financial Planning', 'Probability', 'Statistics'],
        mr: ['दोन चलांतील रेषीय समीकरणे', 'वर्गसमीकरणे', 'अंकगणिती श्रेढी', 'अर्थनियोजन', 'संभाव्यता', 'सांख्यिकी']
    },
    'math_2': {
        en: ['Similarity', 'Pythagoras Theorem', 'Circle', 'Geometric Constructions', 'Coordinate Geometry', 'Trigonometry', 'Mensuration'],
        mr: ['समरूपता', 'पायथागोरसचे प्रमेय', 'वर्तुळ', 'भौमितिक रचना', 'निर्देशांक भूमिती', 'त्रिकोणमिती', 'महत्त्वमापन']
    },
    'science': {
        en: ['Living World', 'Force and Motion', 'Current Electricity', 'Measurement of Matter', 'Acids, Bases and Salts', 'Sound', 'Light'],
        mr: ['सजीव सृष्टी', 'बल आणि गती', 'धारा विद्युत', 'द्रव्याचे मोजमाप', 'आम्ल, आम्लारी आणि क्षार', 'ध्वनी', 'प्रकाश']
    },
    'science_1': {
        en: ['Gravitation', 'Periodic Classification of Elements', 'Chemical Reactions', 'Effects of Electric Current', 'Heat', 'Refraction of Light'],
        mr: ['गुरुत्वाकर्षण', 'मूलद्रव्यांचे आवर्ती वर्गीकरण', 'रासायनिक अभिक्रिया', 'विद्युत धारेचे परिणाम', 'उष्णता', 'प्रकाशाचे अपवर्तन']
    },
    'science_2': {
        en: ['Heredity and Evolution', 'Life Processes', 'Environmental Management', 'Animal Classification', 'Introduction to Microbiology', 'Cell Biology'],
        mr: ['अनुवंशिकता आणि उत्क्रांती', 'सजीवांतील जीवनप्रक्रिया', 'पर्यावरण व्यवस्थापन', 'प्राण्यांचे वर्गीकरण', 'सूक्ष्मजीवशास्त्राची ओळख', 'पेशीविज्ञान']
    },
    'history_civics': {
        en: ['Sources of History', 'India before 1947', 'The Constitution', 'Local Government', 'Fundamental Rights'],
        mr: ['इतिहासाची साधने', '१९४७ पूर्वीचा भारत', 'संविधान', 'स्थानिक शासन संस्था', 'मूलभूत हक्क']
    },
    'history_poly': {
        en: ['Historiography', 'Applied History', 'Mass Media and History', 'Working of the Constitution', 'Electoral Process', 'Political Parties'],
        mr: ['इतिहासलेखन', 'उपयोजित इतिहास', 'प्रसारमाध्यमे आणि इतिहास', 'संविधानाची वाटचाल', 'निवडणूक प्रक्रिया', 'राजकीय पक्ष']
    },
    'geography': {
        en: ['The Earth', 'Interior of Earth', 'Climate', 'Natural Vegetation', 'Water Resources', 'Agriculture', 'Human Geography'],
        mr: ['पृथ्वी', 'पृथ्वीचे अंतरंग', 'हवामान', 'नैसर्गिक वनस्पती', 'जलसंपत्ती', 'शेती', ' मानवी भूगोल']
    },
    'english': {
        en: ['The Fun They Had', 'Sound of Music', 'Little Girl', 'Snake and Mirror', 'My Childhood', 'Packing'],
        mr: ['द फन दे हॅड', 'साउन्ड ऑफ म्युझिक', 'लिटल गर्ल', 'स्नेक अँड मिरर', 'माय चाइल्डहूड', 'पॅकिंग']
    },
    'marathi': {
        en: ['Santvani', 'Beta Me Aikato Ahe', 'G.P.', 'Vayam Motham Khotam', 'Maza Abhyas', 'Aaji Kuthe?'],
        mr: ['संतवाणी', 'बेटा मी ऐकतो आहे', 'जी.आय.पी. रेल्वे', 'वयं मोठं खोटं', 'माझा अभ्यास', 'आजी कुठे?']
    },
    'hindi': {
        en: ['Dukh Ka Adhikar', 'Everest: Meri Shikhar Yatra', 'Tum Kab Jaoge Atithi', 'Vaigyanik Chetana', 'Kichad Ka Kavya'],
        mr: ['दुःख का अधिकार', 'एव्हरेस्ट: मेरी शिखर यात्रा', 'तुम कब जाओगे अतिथी', 'वैज्ञानिक चेतना', 'कीचड का काव्य']
    },
    'evs': {
        en: ['Our Surroundings', 'Water for All', 'Food for Health', 'Shelter', 'Clothes We Wear'],
        mr: ['आपला परिसर', 'पाणी सर्वांसाठी', 'अन्न आणि आरोग्य', 'निवारा', 'आपले कपडे']
    },
    'defense': {
        en: ['National Security', 'Internal Security', 'Disaster Management', 'Armed Forces'],
        mr: ['राष्ट्रीय सुरक्षा', 'अंतर्गत सुरक्षा', 'आपत्ती व्यवस्थापन', 'सशस्त्र सेना']
    }
};

export const generateCurriculum = (): any[] => {
    const data: any[] = [];
    const classes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
    const mediums: ('english' | 'marathi')[] = ['english', 'marathi'];

    classes.forEach(cls => {
        mediums.forEach(med => {
            const classNum = parseInt(cls);
            let subjectKeys: string[] = [];

            // 1st to 4th
            if (classNum >= 1 && classNum <= 4) {
                subjectKeys = ['english', 'marathi', 'math', 'evs'];
            }
            // 5th to 8th
            else if (classNum >= 5 && classNum <= 8) {
                subjectKeys = ['english', 'hindi', 'marathi', 'math', 'science', 'history_civics', 'geography'];
            }
            // 9th and 10th
            else if (classNum >= 9) {
                subjectKeys = [
                    'english', 'hindi', 'marathi',
                    'math_1', 'math_2',
                    'science_1', 'science_2',
                    'history_poly', 'geography'
                ];
                // 10th Only
                if (classNum === 10) {
                    subjectKeys.push('defense');
                }
            }

            subjectKeys.forEach(subjKey => {
                // Determine Title
                const subjectId = uuidv4();
                const subTitle = med === 'marathi' ? subjectsMap[subjKey].mr : subjectsMap[subjKey].en;

                // Fallback English title for internal description if needed
                const enTitle = subjectsMap[subjKey].en;

                data.push({
                    id: subjectId,
                    type: 'subject',
                    title: subTitle,
                    description: `${enTitle} for Class ${cls} (${med === 'english' ? 'English' : 'Marathi'} Medium)`,
                    classId: cls,
                    medium: med,
                    createdAt: Date.now()
                });

                // Generate Lessons
                // Use specific template if exists, else fallback to generic keys (e.g. math_1 -> math template is NOT ideal, so we defined math_1)
                const template = lessonTemplates[subjKey] || lessonTemplates['math']; // Safe Fallback? No, better empty.

                if (template) {
                    const lessonList = med === 'marathi' ? template.mr : template.en;

                    lessonList.forEach((lTitle, idx) => {
                        const lessonId = uuidv4();
                        data.push({
                            id: lessonId,
                            type: 'lesson',
                            title: lTitle,
                            description: `Chapter ${idx + 1} of ${subTitle}`,
                            classId: cls,
                            subjectId: subjectId,
                            medium: med,
                            createdAt: Date.now() + idx,
                            thumbnail: `https://source.unsplash.com/random/800x600?${subjKey.split('_')[0]},education,${idx}`,
                            data: {
                                attachments: [
                                    {
                                        id: uuidv4(),
                                        name: 'TextBook.pdf',
                                        type: 'application/pdf',
                                        data: 'data:application/pdf;base64,JVBERi0xLjAKMSAwIG9iajw8L1BhZ2VzIDIgMCBSPj5lbmRvYmogMiAwIG9iajw8L0tpZHNbMyAwIFJdL0NvdW50IDE+PmVuZG9iaWogMyAwIG9iajw8L01lZGlhQm94WzAgMCAzIDNdPj5lbmRvYmoKdHJhaWxlcjw8L1Jvb3QgMSAwIFI+Pgo='
                                    }
                                ]
                            }
                        });
                    });
                }
            });
        });
    });

    return data;
};
