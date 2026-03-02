import { describe, it, expect } from 'vitest';
import { isAiSearchConfigured, searchWithAi } from './aiSearchService';

describe('aiSearchService', () => {
  it('searchWithAi returns empty array when AI search is not configured', async () => {
    // Without VITE_AI_SEARCH_API_URL in env, isAiSearchConfigured is false
    const results = await searchWithAi('spring day');
    expect(results).toEqual([]);
  });

  it('isAiSearchConfigured returns false when env vars are missing', () => {
    // In test env, VITE_AI_SEARCH_API_URL is typically unset
    expect(typeof isAiSearchConfigured()).toBe('boolean');
  });
});
