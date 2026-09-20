import { useMemo } from 'react';
import type { MemberEvent } from '../types/database';
import type { AsyncResource } from './types';
import { useCatalogResource } from './useCatalogResource';

interface UseMemberEventsResult extends AsyncResource {
    memberEvents: MemberEvent[];
}

export function useMemberEvents(): UseMemberEventsResult {
    const { data: memberEvents, loading, error, refetch } = useCatalogResource('member_events');
    return { memberEvents, loading, error, refetch };
}

export function useMemberEventsByMember(memberId: string) {
    const { memberEvents, loading, error } = useMemberEvents();
    const filtered = useMemo(
        () => memberEvents.filter(e => e.member_id === memberId),
        [memberEvents, memberId]
    );
    return { memberEvents: filtered, loading, error };
}

export function useMemberEventsByType(eventType: string) {
    const { memberEvents, loading, error } = useMemberEvents();
    const filtered = useMemo(
        () => memberEvents.filter(e => e.event_type === eventType),
        [memberEvents, eventType]
    );
    return { memberEvents: filtered, loading, error };
}

export default useMemberEvents;
