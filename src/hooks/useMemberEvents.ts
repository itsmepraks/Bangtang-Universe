/**
 * useMemberEvents Hook
 *
 * Fetches member event data from Supabase database
 * Falls back to empty array if database is unavailable
 */

import { useState, useEffect, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { MemberEvent } from '../types/database';

interface UseMemberEventsResult {
    memberEvents: MemberEvent[];
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

export function useMemberEvents(): UseMemberEventsResult {
    const [memberEvents, setMemberEvents] = useState<MemberEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchMemberEvents = async () => {
        if (!isSupabaseConfigured()) {
            setMemberEvents([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const { data, error: dbError } = await supabase
                .from('member_events')
                .select('*')
                .order('date', { ascending: false });

            if (dbError) throw dbError;

            setMemberEvents(data || []);
        } catch (err) {
            console.error('Failed to fetch member events:', err);
            setError(err as Error);
            setMemberEvents([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMemberEvents();
    }, []);

    return { memberEvents, loading, error, refetch: fetchMemberEvents };
}

// Get member events by member
export function useMemberEventsByMember(memberId: string) {
    const { memberEvents, loading, error } = useMemberEvents();
    const filtered = useMemo(
        () => memberEvents.filter(e => e.member_id === memberId),
        [memberEvents, memberId]
    );
    return { memberEvents: filtered, loading, error };
}

// Get member events by type
export function useMemberEventsByType(eventType: string) {
    const { memberEvents, loading, error } = useMemberEvents();
    const filtered = useMemo(
        () => memberEvents.filter(e => e.event_type === eventType),
        [memberEvents, eventType]
    );
    return { memberEvents: filtered, loading, error };
}

export default useMemberEvents;
