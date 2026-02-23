/**
 * useMembers Hook
 * 
 * Fetches member data from Supabase database
 * Falls back to local data if database is unavailable
 */

import { useState, useEffect, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Member } from '../types/database';
import { MEMBER_DATA } from '../data/members';

interface UseMembersResult {
    members: Member[];
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

// Convert local member format to database format
function convertLocalMember(m: typeof MEMBER_DATA[0]): Member {
    return {
        id: m.id,
        stage_name: m.name,
        full_name: m.full,
        color: m.color,
        role: m.role,
        mic_color: m.mic,
        komca_credits: m.komca,
        bio: m.bio,
        birth_date: m.birthDate,
        birth_place: m.birthPlace,
        height: m.height,
        mbti: m.mbti,
        zodiac: m.zodiac,
        instagram: m.instagram,
        image_url: m.image,
        solo_tracks: m.soloTracks,
        achievements: m.achievements,
        featured_tracks: m.featuredTracks,
        producer_credits: m.producerCredits,
        writer_credits: m.writerCredits,
        created_at: new Date().toISOString(),
        birth_name_ko: null,
        education: null,
        enlistment_start: null,
        enlistment_end: null,
        solo_debut_date: null,
        instagram_handle: m.instagram || null,
        bio_long: null,
    };
}

export function useMembers(): UseMembersResult {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchMembers = async () => {
        if (!isSupabaseConfigured()) {
            console.log('👥 Using local member data (Supabase not configured)');
            setMembers(MEMBER_DATA.map(convertLocalMember));
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const { data, error: dbError } = await supabase
                .from('members')
                .select('*')
                .order('komca_credits', { ascending: false });

            if (dbError) throw dbError;

            setMembers(data || []);
            console.log(`👥 Loaded ${data?.length || 0} members from database`);
        } catch (err) {
            console.error('Failed to fetch members:', err);
            setError(err as Error);
            setMembers(MEMBER_DATA.map(convertLocalMember));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    return { members, loading, error, refetch: fetchMembers };
}

// Get member by ID
export function useMemberById(id: string) {
    const { members, loading, error } = useMembers();
    return {
        member: members.find(m => m.id === id) || null,
        loading,
        error,
    };
}

// Get member color
export function useMemberColor(id: string): string {
    const { member } = useMemberById(id);
    return member?.color || '#A855F7'; // Default purple
}

// Get members sorted by KOMCA credits
export function useMembersByCredits() {
    const { members, loading, error } = useMembers();
    const sortedMembers = useMemo(
        () => [...members].sort((a, b) => b.komca_credits - a.komca_credits),
        [members]
    );
    return { members: sortedMembers, loading, error };
}

// Get total KOMCA credits
export function useTotalKOMCACredits(): number {
    const { members } = useMembers();
    return members.reduce((sum, m) => sum + m.komca_credits, 0);
}

export default useMembers;
