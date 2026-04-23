// Local fallback for solo albums; matches the SoloAlbum DB type.

import type { SoloAlbum } from '../types/database';

export const SOLO_ALBUMS: SoloAlbum[] = [
    // ============ RM ============
    {
        id: 1,
        member_id: 'rm',
        title: 'RM (Mixtape)',
        release_date: '2015-03-20',
        type: 'Mixtape',
        tracks: ['Voice', 'Do You', 'Awakening', 'Monster', 'Throw Away', 'Joke', 'God Rap', 'Rush', 'Life', 'Adrift'],
        created_at: '2024-01-01T00:00:00Z'
    },
    {
        id: 2,
        member_id: 'rm',
        title: 'mono.',
        release_date: '2018-10-23',
        type: 'Mixtape',
        tracks: ['tokyo', 'seoul', 'moonchild', 'badbye', 'uhgood', 'everythingoes', 'forever rain'],
        created_at: '2024-01-01T00:00:00Z'
    },
    {
        id: 3,
        member_id: 'rm',
        title: 'Indigo',
        release_date: '2022-12-02',
        type: 'Studio',
        tracks: ['Yun', 'Still Life', 'All Day', 'Lonely', 'Change pt.2', 'Closer', 'Wild Flower', 'Hectic', 'Forg_tful', 'No.2'],
        created_at: '2024-01-01T00:00:00Z'
    },
    {
        id: 4,
        member_id: 'rm',
        title: 'Right Place, Wrong Person',
        release_date: '2024-05-24',
        type: 'Studio',
        tracks: ['Right Place, Wrong Person', 'Nuts', 'out of love', 'Domodachi', 'Heaven', 'Lost', 'LOST!!!', 'Around the world in a day', 'Groin', 'Come back to me', '?'],
        created_at: '2024-01-01T00:00:00Z'
    },

    // ============ JIN ============
    {
        id: 5,
        member_id: 'jin',
        title: 'Happy',
        release_date: '2024-11-15',
        type: 'Studio',
        tracks: ['Running Wild', 'I\'ll Be There', 'Another Level', 'Until It Reaches You', 'Heart on the Window', 'In Yearning/Longing'],
        created_at: '2024-01-01T00:00:00Z'
    },

    // ============ SUGA ============
    {
        id: 6,
        member_id: 'suga',
        title: 'Agust D',
        release_date: '2016-08-15',
        type: 'Mixtape',
        tracks: ['Intro: Dt sugA', 'Agust D', 'Give It To Me', 'Skit', 'Tony Montana', 'Interlude: Dream, Reality', 'So Far Away', 'The Last', '724148'],
        created_at: '2024-01-01T00:00:00Z'
    },
    {
        id: 7,
        member_id: 'suga',
        title: 'D-2',
        release_date: '2020-05-22',
        type: 'Mixtape',
        tracks: ['Moonlight', 'Daechwita', 'What Do You Think?', 'Strange', '28', 'Burn It', 'People', 'Honsool', 'Interlude: Set Me Free', 'Dear My Friend'],
        created_at: '2024-01-01T00:00:00Z'
    },
    {
        id: 8,
        member_id: 'suga',
        title: 'D-DAY',
        release_date: '2023-04-21',
        type: 'Studio',
        tracks: ['D-Day', 'Haegeum', 'Amygdala', 'SDL', 'People Pt.2', 'Polar Night', 'Interlude: Dawn', 'AMYGDALA', 'Snooze', 'Life Goes On'],
        created_at: '2024-01-01T00:00:00Z'
    },

    // ============ J-HOPE ============
    {
        id: 9,
        member_id: 'jh',
        title: 'Hope World',
        release_date: '2018-03-02',
        type: 'Mixtape',
        tracks: ['Hope World', 'P.O.P (Piece of Peace) Pt.1', 'Daydream', 'Base Line', 'Hangsang', 'Airplane', 'Blue Side'],
        created_at: '2024-01-01T00:00:00Z'
    },
    {
        id: 10,
        member_id: 'jh',
        title: 'Jack In The Box',
        release_date: '2022-07-15',
        type: 'Studio',
        tracks: ['Intro', 'Pandora\'s Box', 'MORE', 'STOP', 'Equal Sign', '= (Equal Sign)', 'Music Box: Reflection', 'What If...', 'Safety Zone', 'Future', 'Arson'],
        created_at: '2024-01-01T00:00:00Z'
    },
    {
        id: 11,
        member_id: 'jh',
        title: 'HOPE ON THE STREET VOL.1',
        release_date: '2024-03-29',
        type: 'EP',
        tracks: ['on the street', 'i wonder...', 'lock / unlock', 'i don\'t know', 'NEURON', 'Dejavu'],
        created_at: '2024-01-01T00:00:00Z'
    },

    // ============ JIMIN ============
    {
        id: 12,
        member_id: 'jm',
        title: 'FACE',
        release_date: '2023-03-24',
        type: 'Studio',
        tracks: ['Face-Off', 'Interlude: Dive', 'Like Crazy', 'Alone', 'Set Me Free Pt.2', 'Letter'],
        created_at: '2024-01-01T00:00:00Z'
    },
    {
        id: 13,
        member_id: 'jm',
        title: 'MUSE',
        release_date: '2024-07-19',
        type: 'Studio',
        tracks: ['Rebirth (Intro)', 'Interlude: Showtime', 'Slow Motion', 'Be Mine', 'Smeraldo Garden Marching Band (feat. Loco)', 'Who', 'Closer Than This'],
        created_at: '2024-01-01T00:00:00Z'
    },

    // ============ V ============
    {
        id: 14,
        member_id: 'v',
        title: 'Layover',
        release_date: '2023-09-08',
        type: 'EP',
        tracks: ['Rainy Days', 'Blue', 'Love Me Again', 'Slow Dancing', 'For Us'],
        created_at: '2024-01-01T00:00:00Z'
    },

    // ============ JK ============
    {
        id: 15,
        member_id: 'jk',
        title: 'GOLDEN',
        release_date: '2023-11-03',
        type: 'Studio',
        tracks: ['Standing Next to You', 'Yes or No', 'Please Don\'t Change', 'Hate You', 'Too Sad to Dance', 'Shot Glass of Tears', '3D', 'Closer to You', 'Seven', 'Somebody'],
        created_at: '2024-01-01T00:00:00Z'
    }
];

export default SOLO_ALBUMS;
