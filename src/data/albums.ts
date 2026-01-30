/**
 * BTS Album Database
 * 
 * Complete album metadata for all BTS Korean studio albums,
 * compilations, and major single releases.
 */

export interface Album {
    id: number;
    title: string;
    titleKorean?: string;
    releaseDate: string;
    type: 'Studio' | 'Mini' | 'Compilation' | 'Single' | 'Repackage';
    trackCount: number;
    description: string;
    era: string;
    coverColor: string; // Dominant color from album art
}

export const ALBUMS: Album[] = [
    {
        id: 1,
        title: 'Dark & Wild',
        releaseDate: '2014-08-19',
        type: 'Studio',
        trackCount: 14,
        description: 'BTS\'s first studio album exploring themes of youth, rebellion, and intense emotion. Features "Danger" and "War of Hormone".',
        era: 'School Trilogy',
        coverColor: '#1F2937'
    },
    {
        id: 2,
        title: 'The Most Beautiful Moment in Life Pt.1',
        titleKorean: '화양연화 pt.1',
        releaseDate: '2015-04-29',
        type: 'Mini',
        trackCount: 9,
        description: 'The beginning of the HYYH era, capturing the beauty and pain of youth. Features breakthrough hits "I Need U" and "Dope".',
        era: 'HYYH',
        coverColor: '#FEF3C7'
    },
    {
        id: 3,
        title: 'The Most Beautiful Moment in Life Pt.2',
        titleKorean: '화양연화 pt.2',
        releaseDate: '2015-11-30',
        type: 'Mini',
        trackCount: 9,
        description: 'Continuation of the HYYH narrative with "Run" exploring the recklessness of youth and "Butterfly" its fragility.',
        era: 'HYYH',
        coverColor: '#FDE68A'
    },
    {
        id: 4,
        title: 'The Most Beautiful Moment in Life: Young Forever',
        titleKorean: '화양연화 Young Forever',
        releaseDate: '2016-05-02',
        type: 'Compilation',
        trackCount: 23,
        description: 'Special compilation album concluding the HYYH trilogy with new tracks "Fire" and "Save Me".',
        era: 'HYYH',
        coverColor: '#D1FAE5'
    },
    {
        id: 5,
        title: 'Wings',
        releaseDate: '2016-10-10',
        type: 'Studio',
        trackCount: 15,
        description: 'Second studio album inspired by Hermann Hesse\'s "Demian". Each member has a solo track exploring personal growth and temptation.',
        era: 'Wings',
        coverColor: '#1E1B4B'
    },
    {
        id: 6,
        title: 'You Never Walk Alone',
        releaseDate: '2017-02-13',
        type: 'Repackage',
        trackCount: 18,
        description: 'Wings repackage with new tracks including the iconic "Spring Day", one of the longest-charting songs in Korean history.',
        era: 'Wings',
        coverColor: '#A7F3D0'
    },
    {
        id: 7,
        title: 'Love Yourself: Her',
        releaseDate: '2017-09-18',
        type: 'Mini',
        trackCount: 9,
        description: 'First installment of the Love Yourself series. "DNA" became BTS\'s first song to enter Billboard Hot 100.',
        era: 'Love Yourself',
        coverColor: '#F9A8D4'
    },
    {
        id: 8,
        title: 'Love Yourself: Tear',
        releaseDate: '2018-05-18',
        type: 'Studio',
        trackCount: 11,
        description: 'Third studio album exploring the pain of love\'s end. "Fake Love" captures the masks we wear in relationships.',
        era: 'Love Yourself',
        coverColor: '#4C1D95'
    },
    {
        id: 9,
        title: 'Love Yourself: Answer',
        releaseDate: '2018-08-24',
        type: 'Compilation',
        trackCount: 25,
        description: 'Conclusion of the Love Yourself series with the message that self-love is the answer. Features "IDOL" and "Euphoria".',
        era: 'Love Yourself',
        coverColor: '#EC4899'
    },
    {
        id: 10,
        title: 'Map of the Soul: Persona',
        releaseDate: '2019-04-12',
        type: 'Mini',
        trackCount: 7,
        description: 'Beginning of the Map of the Soul series based on Jungian psychology. "Boy With Luv" ft. Halsey celebrates joy in small things.',
        era: 'Map of the Soul',
        coverColor: '#FDF4FF'
    },
    {
        id: 11,
        title: 'Map of the Soul: 7',
        releaseDate: '2020-02-21',
        type: 'Studio',
        trackCount: 20,
        description: 'Fourth studio album celebrating 7 years of BTS. Each member contributes solo tracks exploring their shadow and ego.',
        era: 'Map of the Soul',
        coverColor: '#C7D2FE'
    },
    {
        id: 12,
        title: 'BE',
        releaseDate: '2020-11-20',
        type: 'Studio',
        trackCount: 8,
        description: 'Created during the pandemic, this self-produced album captures life in 2020 with "Life Goes On" offering comfort.',
        era: 'BE',
        coverColor: '#D1D5DB'
    },
    {
        id: 13,
        title: 'Butter',
        releaseDate: '2021-07-09',
        type: 'Single',
        trackCount: 3,
        description: 'Summer single album with the mega-hit "Butter" and Ed Sheeran-co-written "Permission to Dance".',
        era: 'Butter',
        coverColor: '#FEF08A'
    },
    {
        id: 14,
        title: 'Proof',
        releaseDate: '2022-06-10',
        type: 'Compilation',
        trackCount: 48,
        description: 'Anthology album for BTS\'s 9th anniversary, featuring hits from 2013-2022 plus new tracks before hiatus.',
        era: 'Proof',
        coverColor: '#020617'
    },
    {
        id: 15,
        title: 'Take Two',
        releaseDate: '2023-06-09',
        type: 'Single',
        trackCount: 1,
        description: 'Digital single released for BTS\'s 10th anniversary FESTA, expressing gratitude to ARMY.',
        era: 'Chapter 2',
        coverColor: '#A855F7'
    }
];

// ============ HELPER FUNCTIONS ============

export const getAlbumById = (id: number): Album | undefined => {
    return ALBUMS.find(a => a.id === id);
};

export const getAlbumsByEra = (era: string): Album[] => {
    return ALBUMS.filter(a => a.era === era);
};

export const getAlbumsByType = (type: Album['type']): Album[] => {
    return ALBUMS.filter(a => a.type === type);
};

export const getUniqueEras = (): string[] => {
    return [...new Set(ALBUMS.map(a => a.era))];
};

export const getTotalAlbumCount = (): number => ALBUMS.length;

export default ALBUMS;
