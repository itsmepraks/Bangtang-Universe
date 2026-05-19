import type { Member } from '../types/index';
import { BORAHAE_COLORS } from '../constants/colors';

export interface ExtendedMember extends Member {
    birthDate: string;
    birthPlace: string;
    height: string;
    mbti: string;
    zodiac: string;
    position: string[];
    debutDate: string;
    instagram: string;
    soloAlbums: SoloAlbum[];
    featuredTracks: string[];
    producerCredits: number;
    writerCredits: number;
    image: string;
    /** ISO date the member began mandatory military service, if known. */
    enlistmentStart?: string;
    /** ISO date the member completed service, if known. */
    enlistmentEnd?: string;
}

export interface SoloAlbum {
    title: string;
    releaseDate: string;
    type: 'Studio' | 'Mixtape' | 'EP' | 'Single';
    tracks: string[];
}

export const MEMBER_DATA: ExtendedMember[] = [
    {
        id: 'rm',
        name: 'RM',
        full: 'Kim Namjoon',
        color: '#2563EB',
        role: 'Leader / Main Rapper / Producer',
        mic: 'Blue',
        komca: 227,
        image: '/assets/members/rm.jpg',
        bio: 'The philosophical leader and main rapper of BTS. A self-taught English speaker with an IQ of 148, RM is the primary songwriter of the group and has been credited on over 200 songs. His solo work explores themes of nature, identity, and the human condition.',
        soloTracks: ['Wild Flower', 'Still Life', 'Yun', 'All Day', 'Lonely', 'Change pt.2', 'Closer', 'Domodachi', 'Come back to me'],
        achievements: [
            'UN General Assembly Speaker (2018, 2021)',
            'Youngest Korean to receive Order of Cultural Merit',
            'First K-pop artist to speak at LACMA Art+Film Gala',
            'Billboard 200 #1 (Indigo)',
            'Over 200 KOMCA registered songs'
        ],
        birthDate: '1994-09-12',
        birthPlace: 'Ilsan, Goyang, South Korea',
        height: '181 cm',
        mbti: 'ENFP',
        zodiac: 'Virgo',
        position: ['Leader', 'Main Rapper', 'Producer', 'Songwriter'],
        debutDate: '2013-06-13',
        instagram: '@rkive',
        soloAlbums: [
            {
                title: 'RM (Mixtape)',
                releaseDate: '2015-03-20',
                type: 'Mixtape',
                tracks: ['Voice', 'Do You', 'Awakening', 'Monster', 'Throw Away', 'Joke', 'God Rap', 'Rush', 'Life', 'Adrift']
            },
            {
                title: 'mono.',
                releaseDate: '2018-10-23',
                type: 'Mixtape',
                tracks: ['tokyo', 'seoul', 'moonchild', 'badbye', 'uhgood', 'everythingoes', 'forever rain']
            },
            {
                title: 'Indigo',
                releaseDate: '2022-12-02',
                type: 'Studio',
                tracks: ['Yun', 'Still Life', 'All Day', 'Lonely', 'Change pt.2', 'Closer', 'Wild Flower', 'Hectic', 'Forg_tful', 'No.2']
            },
            {
                title: 'Right Place, Wrong Person',
                releaseDate: '2024-05-24',
                type: 'Studio',
                tracks: ['Right Place, Wrong Person', 'Nuts', 'out of love', 'Domodachi', 'Heaven', 'Lost', 'LOST!!!', 'Around the world in a day', 'Groin', 'Come back to me', '?']
            }
        ],
        featuredTracks: ['Champion (Remix) with Fall Out Boy', 'Waste It On Me with Steve Aoki', 'Seoul Town Road with Lil Nas X'],
        producerCredits: 175,
        writerCredits: 218,
        enlistmentStart: '2023-12-11',
        enlistmentEnd: '2025-06-10',
    },
    {
        id: 'jin',
        name: 'JIN',
        full: 'Kim Seokjin',
        color: '#EC4899',
        role: 'Sub Vocalist / Visual',
        mic: 'Pink',
        komca: 35,
        image: '/assets/members/jin.jpg',
        bio: 'Known as "Worldwide Handsome," Jin possesses a powerful tenor voice and is celebrated for his emotional ballads. He graduated from Konkuk University with a degree in Film and studied at Hanyang Cyber University. His solo work showcases his versatility from powerful rock ballads to heartfelt melodies.',
        soloTracks: ['The Astronaut', 'Epiphany', 'Awake', 'Moon', 'Abyss', 'Yours', 'Super Tuna', 'Tonight', 'Running Wild'],
        achievements: [
            'Order of Cultural Merit (2018)',
            'Mandatory military service completed (Jun 2024) — first member discharged',
            'The Astronaut #1 in 102 countries on iTunes',
            'First BTS member to release official OST (Yours)',
            'Konkuk University Alumni of the Year'
        ],
        birthDate: '1992-12-04',
        birthPlace: 'Gwacheon, Gyeonggi-do, South Korea',
        height: '179 cm',
        mbti: 'INTP',
        zodiac: 'Sagittarius',
        position: ['Sub Vocalist', 'Visual'],
        debutDate: '2013-06-13',
        instagram: '@jin',
        soloAlbums: [
            {
                title: 'Happy',
                releaseDate: '2024-11-15',
                type: 'Studio',
                tracks: ['Running Wild', 'I\'ll Be There', 'Another Level', 'Until It Reaches You', 'Heart on the Window', 'In Yearning/Longing']
            }
        ],
        featuredTracks: ['Yours (Jirisan OST)', 'It\'s Definitely You (Hwarang OST) with V'],
        producerCredits: 5,
        writerCredits: 35,
        enlistmentStart: '2022-12-13',
        enlistmentEnd: '2024-06-12',
    },
    {
        id: 'suga',
        name: 'SUGA',
        full: 'Min Yoongi',
        color: '#64748B',
        role: 'Lead Rapper / Producer',
        mic: 'Black',
        komca: 177,
        image: '/assets/members/suga.jpg',
        bio: 'A prolific producer and rapper who goes by the alias Agust D for his solo work. Before BTS, he worked as an underground rapper. SUGA is known for addressing mental health, social issues, and personal struggles in his music. He has produced songs for artists like IU, Halsey, PSY, and Juice WRLD.',
        soloTracks: ['Daechwita', 'Haegeum', 'People', 'Amygdala', 'Snooze', 'The Last', 'Agust D', 'Give It To Me', 'HUH?!', 'SDL'],
        achievements: [
            'Order of Cultural Merit (2018)',
            'Mandatory military service completed as social-service agent (Jun 2025)',
            'First K-pop soloist to headline US stadium tour',
            'D-DAY #1 on Billboard 200',
            'Produced for IU, PSY, Halsey, MAX, Juice WRLD',
            'Samsung Galaxy Global Ambassador',
            'NBA Korea Ambassador'
        ],
        birthDate: '1993-03-09',
        birthPlace: 'Daegu, South Korea',
        height: '174 cm',
        mbti: 'ISTP',
        zodiac: 'Pisces',
        position: ['Lead Rapper', 'Producer', 'Songwriter'],
        debutDate: '2013-06-13',
        instagram: '@agaboramyeonguhjji',
        soloAlbums: [
            {
                title: 'Agust D',
                releaseDate: '2016-08-15',
                type: 'Mixtape',
                tracks: ['Intro: Dt sugA', 'Agust D', 'Give It To Me', 'Skit', 'Tony Montana', 'Interlude: Dream, Reality', 'So Far Away', 'The Last', '724148']
            },
            {
                title: 'D-2',
                releaseDate: '2020-05-22',
                type: 'Mixtape',
                tracks: ['Moonlight', 'Daechwita', 'What Do You Think?', 'Strange', '28', 'Burn It', 'People', 'Honsool', 'Interlude: Set Me Free', 'Dear My Friend']
            },
            {
                title: 'D-DAY',
                releaseDate: '2023-04-21',
                type: 'Studio',
                tracks: ['D-Day', 'Haegeum', 'Amygdala', 'SDL', 'People Pt.2', 'Polar Night', 'Interlude: Dawn', 'AMYGDALA', 'Snooze', 'Life Goes On']
            }
        ],
        featuredTracks: ['Eight (IU)', 'Blueberry Eyes (MAX)', 'That That (PSY)', 'Girl of My Dreams (Juice WRLD)'],
        producerCredits: 150,
        writerCredits: 175,
        enlistmentStart: '2023-09-22',
        enlistmentEnd: '2025-06-21',
    },
    {
        id: 'jh',
        name: 'J-HOPE',
        full: 'Jung Hoseok',
        color: '#EF4444',
        role: 'Main Dancer / Sub Rapper',
        mic: 'Silver',
        komca: 150,
        image: '/assets/members/jh.jpg',
        bio: 'Known as the group\'s "sunshine," J-Hope is the main dancer and a skilled rapper. Before BTS, he was part of the underground dance team NEURON. His solo music blends hip-hop with dance and electronic elements, often exploring themes of identity and self-discovery.',
        soloTracks: ['Arson', 'MORE', 'Chicken Noodle Soup', 'Daydream', 'Airplane', 'Blue Side', 'On the Street', 'NEURON', 'i wonder...'],
        achievements: [
            'Order of Cultural Merit (2018)',
            'Mandatory military service completed (Oct 2024)',
            'First Korean artist to headline Lollapalooza',
            'Jack In The Box #1 in 49 countries',
            'Louis Vuitton Global Ambassador',
            'Dior Ambassador'
        ],
        birthDate: '1994-02-18',
        birthPlace: 'Gwangju, South Korea',
        height: '177 cm',
        mbti: 'INFJ',
        zodiac: 'Aquarius',
        position: ['Main Dancer', 'Sub Rapper', 'Choreographer'],
        debutDate: '2013-06-13',
        instagram: '@uarmyhope',
        soloAlbums: [
            {
                title: 'Hope World',
                releaseDate: '2018-03-02',
                type: 'Mixtape',
                tracks: ['Hope World', 'P.O.P (Piece of Peace) Pt.1', 'Daydream', 'Base Line', 'Hangsang', 'Airplane', 'Blue Side']
            },
            {
                title: 'Jack In The Box',
                releaseDate: '2022-07-15',
                type: 'Studio',
                tracks: ['Intro', 'Pandora\'s Box', 'MORE', 'STOP', 'Equal Sign', '= (Equal Sign)', 'Music Box: Reflection', 'What If...', 'Safety Zone', 'Future', 'Arson']
            },
            {
                title: 'HOPE ON THE STREET VOL.1',
                releaseDate: '2024-03-29',
                type: 'EP',
                tracks: ['on the street', 'i wonder...', 'lock / unlock', 'i don\'t know', 'NEURON', 'Dejavu']
            }
        ],
        featuredTracks: ['Chicken Noodle Soup (with Becky G)', 'On the Street (with J. Cole)', 'Dance The Night Away'],
        producerCredits: 95,
        writerCredits: 145,
        enlistmentStart: '2023-04-18',
        enlistmentEnd: '2024-10-17',
    },
    {
        id: 'jm',
        name: 'JIMIN',
        full: 'Park Jimin',
        color: '#F59E0B',
        role: 'Lead Vocalist / Main Dancer',
        mic: 'Gold',
        komca: 27,
        image: '/assets/members/jm.jpg',
        bio: 'A classically trained contemporary dancer who graduated top of his class at Busan High School of Arts. Jimin is known for his powerful yet emotive vocals and elegant dancing. His solo debut album "FACE" explores personal struggles with honesty and vulnerability.',
        soloTracks: ['Like Crazy', 'Set Me Free Pt.2', 'Face-Off', 'Interlude: Dive', 'Alone', 'Letter', 'Serendipity', 'Filter', 'Promise', 'Who'],
        achievements: [
            'Order of Cultural Merit (2018)',
            'Mandatory military service completed (Jun 2025)',
            'Billboard Hot 100 #1 (Like Crazy) — first Korean solo artist',
            'FACE #1 on Billboard 200',
            'Dior Global Ambassador',
            'Tiffany & Co. Ambassador',
            'Most days at #1 on Billboard Artist 100'
        ],
        birthDate: '1995-10-13',
        birthPlace: 'Busan, South Korea',
        height: '174 cm',
        mbti: 'ESTP',
        zodiac: 'Libra',
        position: ['Lead Vocalist', 'Main Dancer'],
        debutDate: '2013-06-13',
        instagram: '@j.m',
        soloAlbums: [
            {
                title: 'FACE',
                releaseDate: '2023-03-24',
                type: 'Studio',
                tracks: ['Face-Off', 'Interlude: Dive', 'Like Crazy', 'Alone', 'Set Me Free Pt.2', 'Letter']
            },
            {
                title: 'MUSE',
                releaseDate: '2024-07-19',
                type: 'Studio',
                tracks: ['Rebirth (Intro)', 'Interlude: Showtime', 'Slow Motion', 'Be Mine', 'Smeraldo Garden Marching Band (feat. Loco)', 'Who', 'Closer Than This']
            }
        ],
        featuredTracks: ['With You (Our Blues OST with Ha Sung-woon)', 'Christmas Love', 'Promise (self-composed)'],
        producerCredits: 8,
        writerCredits: 25,
        enlistmentStart: '2023-12-12',
        enlistmentEnd: '2025-06-11',
    },
    {
        id: 'v',
        name: 'V',
        full: 'Kim Taehyung',
        color: '#22C55E',
        role: 'Sub Vocalist / Visual',
        mic: 'Green',
        komca: 25,
        image: '/assets/members/v.jpg',
        bio: 'Known for his deep, soulful baritone and artistic vision, V brings jazz and R&B influences to his music. A trained actor who has appeared in the drama "Hwarang," he is celebrated for his unique vocal color and emotional expressiveness. His solo album "Layover" showcases his love for jazz and R&B.',
        soloTracks: ['Slow Dancing', 'Rainy Days', 'Love Me Again', 'Blue', 'For Us', 'Singularity', 'Stigma', 'Inner Child', 'Winter Bear', 'Sweet Night'],
        achievements: [
            'Order of Cultural Merit (2018)',
            'Mandatory military service completed (Jun 2025)',
            'Sweet Night #1 in 117 countries (most #1s for an OST)',
            'Layover highest first-week sales for a K-pop solo album (2023)',
            'CELINE Global Ambassador',
            'Cartier Global Ambassador',
            'Vogue Korea Cover Star'
        ],
        birthDate: '1995-12-30',
        birthPlace: 'Daegu, South Korea',
        height: '179 cm',
        mbti: 'INFP',
        zodiac: 'Capricorn',
        position: ['Sub Vocalist', 'Visual', 'Actor'],
        debutDate: '2013-06-13',
        instagram: '@thv',
        soloAlbums: [
            {
                title: 'Layover',
                releaseDate: '2023-09-08',
                type: 'EP',
                tracks: ['Rainy Days', 'Blue', 'Love Me Again', 'Slow Dancing', 'For Us']
            }
        ],
        featuredTracks: ['Sweet Night (Itaewon Class OST)', 'It\'s Definitely You (Hwarang OST) with Jin', 'Winter Bear', 'Scenery', 'Christmas Tree (Our Beloved Summer OST)'],
        producerCredits: 5,
        writerCredits: 24,
        enlistmentStart: '2023-12-11',
        enlistmentEnd: '2025-06-10',
    },
    {
        id: 'jk',
        name: 'JK',
        full: 'Jeon Jungkook',
        color: '#8B5CF6',
        role: 'Main Vocalist / Lead Dancer / Center / Maknae',
        mic: 'Purple',
        komca: 30,
        image: '/assets/members/jk.jpg',
        bio: 'The youngest member, known as the "Golden Maknae" for his exceptional talent in vocals, dance, and various other skills. JK joined BTS at age 15 and has grown into one of the most successful solo artists globally. His debut album "GOLDEN" broke numerous records worldwide.',
        soloTracks: ['Standing Next to You', 'Seven', '3D', 'Yes or No', 'Please Don\'t Change', 'Hate You', 'Euphoria', 'My Time', 'Still With You', 'Left and Right'],
        achievements: [
            'Order of Cultural Merit (2018)',
            'Mandatory military service completed (Jun 2025)',
            'FIFA World Cup 2022 Official Soundtrack (Dreamers)',
            'Seven — most weeks at #1 on Billboard Global 200',
            'GOLDEN — highest-selling solo album in Hanteo history',
            'Calvin Klein Global Ambassador',
            'First Korean solo artist to perform at the VMAs'
        ],
        birthDate: '1997-09-01',
        birthPlace: 'Busan, South Korea',
        height: '179 cm',
        mbti: 'INTP',
        zodiac: 'Virgo',
        position: ['Main Vocalist', 'Lead Dancer', 'Center', 'Maknae'],
        debutDate: '2013-06-13',
        instagram: '@jungkook.97',
        soloAlbums: [
            {
                title: 'GOLDEN',
                releaseDate: '2023-11-03',
                type: 'Studio',
                tracks: ['Standing Next to You', 'Yes or No', 'Please Don\'t Change', 'Hate You', 'Too Sad to Dance', 'Shot Glass of Tears', '3D', 'Closer to You', 'Seven', 'Somebody']
            }
        ],
        featuredTracks: ['Dreamers (FIFA World Cup 2022)', 'Left and Right (with Charlie Puth)', 'Bad Decisions (with Benny Blanco & Snoop Dogg)', 'Stay Alive (Chakho OST)'],
        producerCredits: 10,
        writerCredits: 28,
        enlistmentStart: '2023-12-12',
        enlistmentEnd: '2025-06-11',
    }
];

export const getMemberById = (id: string): ExtendedMember | undefined => {
    return MEMBER_DATA.find(m => m.id === id);
};

export const getMemberColor = (id: string): string => {
    const member = getMemberById(id);
    return member?.color || BORAHAE_COLORS.PRIMARY;
};

export const getTotalKOMCACredits = (): number => {
    return MEMBER_DATA.reduce((sum, m) => sum + m.komca, 0);
};

export const getMembersByCredits = (): ExtendedMember[] => {
    return [...MEMBER_DATA].sort((a, b) => b.komca - a.komca);
};

export default MEMBER_DATA;
