// Shared return shape for data-loading hooks. Each hook aliases the collection
// field to a domain-specific name (songs, albums, etc.) via an intersection.
export interface AsyncResource {
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}
