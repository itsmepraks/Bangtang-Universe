/**
 * Export Service
 * 
 * Provides client-side export functionality for data in JSON and CSV formats.
 */

import { saveAs } from 'file-saver';
import { SONGS, type Song } from '../data/songs';
import { MEMBER_DATA, type ExtendedMember } from '../data/members';
import { ALBUMS, type Album } from '../data/albums';

// ============ CSV CONVERSION ============

/**
 * Convert array of objects to CSV string
 */
const toCSV = <T extends object>(data: T[], columns?: (keyof T)[]): string => {
    if (data.length === 0) return '';

    const cols = columns || (Object.keys(data[0]) as (keyof T)[]);

    // Header row
    const header = cols.map(c => String(c)).join(',');

    // Data rows
    const rows = data.map(item => {
        return cols.map(col => {
            const value = item[col];

            // Handle arrays
            if (Array.isArray(value)) {
                return `"${value.join('; ')}"`;
            }

            // Handle strings with commas or quotes
            if (typeof value === 'string') {
                if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            }

            // Handle other types
            return String(value ?? '');
        }).join(',');
    });

    return [header, ...rows].join('\n');
};

// ============ EXPORT FUNCTIONS ============

/**
 * Export songs to JSON
 */
export const exportSongsJSON = (): void => {
    const json = JSON.stringify(SONGS, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    saveAs(blob, 'bts-songs.json');
};

/**
 * Export songs to CSV
 */
export const exportSongsCSV = (): void => {
    const columns: (keyof Song)[] = [
        'id', 'title', 'album', 'releaseDate', 'bpm',
        'energy', 'valence', 'danceability', 'sentiment'
    ];

    const csv = toCSV(SONGS, columns);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, 'bts-songs.csv');
};

/**
 * Export members to JSON
 */
export const exportMembersJSON = (): void => {
    const json = JSON.stringify(MEMBER_DATA, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    saveAs(blob, 'bts-members.json');
};

/**
 * Export members to CSV
 */
export const exportMembersCSV = (): void => {
    // Flatten for CSV
    const flatMembers = MEMBER_DATA.map(m => ({
        id: m.id,
        name: m.name,
        fullName: m.full,
        role: m.role,
        color: m.color,
        mic: m.mic,
        komca: m.komca,
        birthDate: m.birthDate,
        mbti: m.mbti,
        soloTracks: m.soloTracks.join('; '),
        achievements: m.achievements.join('; ')
    }));

    const csv = toCSV(flatMembers);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, 'bts-members.csv');
};

/**
 * Export albums to JSON
 */
export const exportAlbumsJSON = (): void => {
    const json = JSON.stringify(ALBUMS, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    saveAs(blob, 'bts-albums.json');
};

/**
 * Export albums to CSV
 */
export const exportAlbumsCSV = (): void => {
    const columns: (keyof Album)[] = [
        'id', 'title', 'releaseDate', 'type', 'trackCount', 'era'
    ];

    const csv = toCSV(ALBUMS, columns);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, 'bts-albums.csv');
};

/**
 * Export all data as a single JSON archive
 */
export const exportFullArchive = (): void => {
    const archive = {
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        data: {
            members: MEMBER_DATA,
            songs: SONGS,
            albums: ALBUMS
        },
        stats: {
            totalMembers: MEMBER_DATA.length,
            totalSongs: SONGS.length,
            totalAlbums: ALBUMS.length,
            totalKOMCACredits: MEMBER_DATA.reduce((sum, m) => sum + m.komca, 0)
        }
    };

    const json = JSON.stringify(archive, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    saveAs(blob, 'bts-neural-archive.json');
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
