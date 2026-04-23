import { BORAHAE_COLORS } from '../constants/colors';

export interface Album {
    id: number;
    title: string;
    titleKorean?: string;
    releaseDate: string;
    type: 'Studio' | 'Mini' | 'Compilation' | 'Single' | 'Repackage';
    trackCount: number;
    description: string;
    era: string;
    coverColor: string;
    coverArtUrl?: string | null;
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
        coverColor: '#1F2937',
        coverArtUrl: 'https://coverartarchive.org/release/d2a0e518-1f1a-4544-bc4f-da9fc19f3e43/25521306633-500.jpg',
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
        coverColor: '#FEF3C7',
        coverArtUrl: 'http://coverartarchive.org/release/889b199e-747d-459b-8240-95fd687e90b8/10271387361-500.jpg',
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
        coverColor: '#FDE68A',
        coverArtUrl: 'http://coverartarchive.org/release/6aa7171b-8be5-450b-b6bc-7324ca2f9988/12132875653-500.jpg',
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
        coverColor: '#D1FAE5',
        coverArtUrl: 'http://coverartarchive.org/release/9cc33bce-5696-477e-aee2-44fe18a595c9/13459418520-500.jpg',
    },
    {
        id: 5,
        title: 'Wings',
        releaseDate: '2016-10-10',
        type: 'Studio',
        trackCount: 15,
        description: 'Second studio album inspired by Hermann Hesse\'s "Demian". Each member has a solo track exploring personal growth and temptation.',
        era: 'Wings',
        coverColor: '#1E1B4B',
        coverArtUrl: 'http://coverartarchive.org/release/cc613cb1-be50-4627-9ca5-68b09f58a8e4/14849913797-500.jpg',
    },
    {
        id: 6,
        title: 'You Never Walk Alone',
        releaseDate: '2017-02-13',
        type: 'Repackage',
        trackCount: 18,
        description: 'Wings repackage with new tracks including the iconic "Spring Day", one of the longest-charting songs in Korean history.',
        era: 'Wings',
        coverColor: '#A7F3D0',
        coverArtUrl: null,
    },
    {
        id: 7,
        title: 'Love Yourself: Her',
        releaseDate: '2017-09-18',
        type: 'Mini',
        trackCount: 9,
        description: 'First installment of the Love Yourself series. "DNA" became BTS\'s first song to enter Billboard Hot 100.',
        era: 'Love Yourself',
        coverColor: '#F9A8D4',
        coverArtUrl: 'http://coverartarchive.org/release/5f47c9ae-b213-43c3-9a32-2f656a57dc4b/17820984530-500.jpg',
    },
    {
        id: 8,
        title: 'Love Yourself: Tear',
        releaseDate: '2018-05-18',
        type: 'Studio',
        trackCount: 11,
        description: 'Third studio album exploring the pain of love\'s end. "Fake Love" captures the masks we wear in relationships.',
        era: 'Love Yourself',
        coverColor: '#4C1D95',
        coverArtUrl: 'http://coverartarchive.org/release/a9af433d-8e96-4a43-aca2-99de8aa7f776/25521616714-500.jpg',
    },
    {
        id: 9,
        title: 'Love Yourself: Answer',
        releaseDate: '2018-08-24',
        type: 'Compilation',
        trackCount: 25,
        description: 'Conclusion of the Love Yourself series with the message that self-love is the answer. Features "IDOL" and "Euphoria".',
        era: 'Love Yourself',
        coverColor: '#EC4899',
        coverArtUrl: 'http://coverartarchive.org/release/0e791714-b3e3-4daf-bb00-ac1926597cd7/20759834301-500.jpg',
    },
    {
        id: 10,
        title: 'Map of the Soul: Persona',
        releaseDate: '2019-04-12',
        type: 'Mini',
        trackCount: 7,
        description: 'Beginning of the Map of the Soul series based on Jungian psychology. "Boy With Luv" ft. Halsey celebrates joy in small things.',
        era: 'Map of the Soul',
        coverColor: '#FDF4FF',
        coverArtUrl: 'http://coverartarchive.org/release/c238e2a3-a1a3-4f79-bf55-e5a588aa3666/22755801286-500.jpg',
    },
    {
        id: 11,
        title: 'Map of the Soul: 7',
        releaseDate: '2020-02-21',
        type: 'Studio',
        trackCount: 20,
        description: 'Fourth studio album celebrating 7 years of BTS. Each member contributes solo tracks exploring their shadow and ego.',
        era: 'Map of the Soul',
        coverColor: '#C7D2FE',
        coverArtUrl: 'http://coverartarchive.org/release/bdf973ab-5a6b-452c-91c5-df0706526d71/25478145851-500.jpg',
    },
    {
        id: 12,
        title: 'BE',
        releaseDate: '2020-11-20',
        type: 'Studio',
        trackCount: 8,
        description: 'Created during the pandemic, this self-produced album captures life in 2020 with "Life Goes On" offering comfort.',
        era: 'BE',
        coverColor: '#D1D5DB',
        coverArtUrl: 'http://coverartarchive.org/release/75622cd1-7bf0-497d-a2ad-76a1dcb5d578/27844283090-500.jpg',
    },
    {
        id: 13,
        title: 'Butter',
        releaseDate: '2021-07-09',
        type: 'Single',
        trackCount: 3,
        description: 'Summer single album with the mega-hit "Butter" and Ed Sheeran-co-written "Permission to Dance".',
        era: 'Butter',
        coverColor: '#FEF08A',
        coverArtUrl: 'http://coverartarchive.org/release/732ae5b8-fe97-4075-ac80-555460de9c2c/30254061669-500.jpg',
    },
    {
        id: 14,
        title: 'Proof',
        releaseDate: '2022-06-10',
        type: 'Compilation',
        trackCount: 48,
        description: 'Anthology album for BTS\'s 9th anniversary, featuring hits from 2013-2022 plus new tracks before hiatus.',
        era: 'Proof',
        coverColor: '#020617',
        coverArtUrl: 'http://coverartarchive.org/release/18f3f673-ae29-4dda-b855-ef4830041663/32750960123-500.jpg',
    },
    {
        id: 15,
        title: 'Take Two',
        releaseDate: '2023-06-09',
        type: 'Single',
        trackCount: 1,
        description: 'Digital single released for BTS\'s 10th anniversary FESTA, expressing gratitude to ARMY.',
        era: 'Chapter 2',
        coverColor: BORAHAE_COLORS.PRIMARY,
        coverArtUrl: 'http://coverartarchive.org/release/47915090-9b99-4cfe-9326-92b40332c345/35879173466-500.jpg',
    }
];

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
