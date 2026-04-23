import { saveAs } from 'file-saver';
import type { Song, Member, Album } from '../types/database';

const toCSV = <T extends object>(data: T[], columns?: (keyof T)[]): string => {
    if (data.length === 0) return '';

    const cols = columns || (Object.keys(data[0]) as (keyof T)[]);

    const header = cols.map(c => String(c)).join(',');

    const rows = data.map(item => {
        return cols.map(col => {
            const value = item[col];

            if (Array.isArray(value)) {
                return `"${value.join('; ')}"`;
            }

            if (typeof value === 'string') {
                if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            }

            return String(value ?? '');
        }).join(',');
    });

    return [header, ...rows].join('\n');
};

export const exportSongsJSON = (songs: Song[]): void => {
    const json = JSON.stringify(songs, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    saveAs(blob, 'bts-songs.json');
};

export const exportSongsCSV = (songs: Song[]): void => {
    const columns: (keyof Song)[] = [
        'id', 'title', 'album_id', 'release_date', 'bpm',
        'energy', 'valence', 'danceability', 'sentiment'
    ];

    const csv = toCSV(songs, columns);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, 'bts-songs.csv');
};

export const exportMembersJSON = (members: Member[]): void => {
    const json = JSON.stringify(members, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    saveAs(blob, 'bts-members.json');
};

export const exportMembersCSV = (members: Member[]): void => {
    const flatMembers = members.map(m => ({
        id: m.id,
        name: m.stage_name,
        fullName: m.full_name,
        role: m.role,
        color: m.color,
        mic: m.mic_color,
        komca: m.komca_credits,
        birthDate: m.birth_date,
        mbti: m.mbti,
        soloTracks: (m.solo_tracks || []).join('; '),
        achievements: (m.achievements || []).join('; ')
    }));

    const csv = toCSV(flatMembers);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, 'bts-members.csv');
};

export const exportAlbumsJSON = (albums: Album[]): void => {
    const json = JSON.stringify(albums, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    saveAs(blob, 'bts-albums.json');
};

export const exportAlbumsCSV = (albums: Album[]): void => {
    const columns: (keyof Album)[] = [
        'id', 'title', 'release_date', 'type', 'track_count', 'era'
    ];

    const csv = toCSV(albums, columns);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, 'bts-albums.csv');
};

export const exportFullArchive = (songs: Song[], members: Member[], albums: Album[]): void => {
    const archive = {
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        data: {
            members,
            songs,
            albums
        },
        stats: {
            totalMembers: members.length,
            totalSongs: songs.length,
            totalAlbums: albums.length,
            totalKOMCACredits: members.reduce((sum, m) => sum + m.komca_credits, 0)
        }
    };

    const json = JSON.stringify(archive, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    saveAs(blob, 'bangtan-universe.json');
};

export default {
    exportSongsJSON,
    exportSongsCSV,
    exportMembersJSON,
    exportMembersCSV,
    exportAlbumsJSON,
    exportAlbumsCSV,
    exportFullArchive
};
