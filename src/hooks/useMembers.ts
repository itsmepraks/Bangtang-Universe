import { useMemo } from 'react';
import type { Member } from '../types/database';
import { BORAHAE_COLORS } from '../constants/colors';
import type { AsyncResource } from './types';
import { useCatalogResource } from './useCatalogResource';

interface UseMembersResult extends AsyncResource {
    members: Member[];
}

export function useMembers(): UseMembersResult {
    const { data: members, loading, error, refetch } = useCatalogResource('members');
    return { members, loading, error, refetch };
}

export function useMemberById(id: string) {
    const { members, loading, error } = useMembers();
    return {
        member: members.find(m => m.id === id) || null,
        loading,
        error,
    };
}

export function useMemberColor(id: string): string {
    const { member } = useMemberById(id);
    return member?.color || BORAHAE_COLORS.PRIMARY;
}

export function useMembersByCredits() {
    const { members, loading, error } = useMembers();
    const sortedMembers = useMemo(
        () => [...members].sort((a, b) => b.komca_credits - a.komca_credits),
        [members]
    );
    return { members: sortedMembers, loading, error };
}

export function useTotalKOMCACredits(): number {
    const { members } = useMembers();
    return members.reduce((sum, m) => sum + m.komca_credits, 0);
}

export default useMembers;
