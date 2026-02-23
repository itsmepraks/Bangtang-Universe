/**
 * Knowledge Index Service
 *
 * Pre-computes aggregates from all BTS data (songs, albums, members,
 * awards, chart entries, concerts, collaborations, member events)
 * and provides fuzzy search over awards and concerts via Fuse.js.
 */

import Fuse from 'fuse.js';
import type {
  Song,
  Album,
  Member,
  Award,
  ChartEntry,
  Concert,
  Collaboration,
  MemberEvent,
} from '../types/database';

// ==================== TYPES ====================

export interface KnowledgeContext {
  songs: Song[];
  albums: Album[];
  members: Member[];
  awards: Award[];
  chartEntries: ChartEntry[];
  concerts: Concert[];
  collaborations: Collaboration[];
  memberEvents: MemberEvent[];
}

export interface Aggregates {
  totalSongs: number;
  totalAlbums: number;
  totalAwards: number;
  totalAwardsWon: number;
  totalConcerts: number;
  totalCollaborations: number;
  uniqueCeremonies: string[];
  uniqueTours: string[];
  uniqueCharts: string[];
  awardsByMember: Map<string, number>;
  awardsByCeremony: Map<string, number>;
  concertsByTour: Map<string, number>;
  concertsByCountry: Map<string, number>;
  chartRecords: { chart: string; bestPosition: number; song: string }[];
}

// ==================== KNOWLEDGE INDEX ====================

export class KnowledgeIndex {
  public context: KnowledgeContext;
  public aggregates: Aggregates;
  private awardFuse: Fuse<Award>;
  private concertFuse: Fuse<Concert>;

  constructor(ctx: KnowledgeContext) {
    this.context = ctx;
    this.aggregates = this.computeAggregates(ctx);
    this.awardFuse = new Fuse(ctx.awards, {
      keys: ['name', 'ceremony', 'category'],
      threshold: 0.4,
    });
    this.concertFuse = new Fuse(ctx.concerts, {
      keys: ['tour_name', 'venue', 'city'],
      threshold: 0.4,
    });
  }

  /** Fuzzy-search awards by name, ceremony, or category. */
  searchAwards(query: string) {
    return this.awardFuse.search(query);
  }

  /** Fuzzy-search concerts by tour name, venue, or city. */
  searchConcerts(query: string) {
    return this.concertFuse.search(query);
  }

  // -------------------- aggregate computation --------------------

  private computeAggregates(ctx: KnowledgeContext): Aggregates {
    // Awards by member and ceremony (wins only)
    const awardsByMember = new Map<string, number>();
    const awardsByCeremony = new Map<string, number>();
    ctx.awards.forEach((a) => {
      if (a.result === 'won') {
        if (a.member_id) {
          awardsByMember.set(
            a.member_id,
            (awardsByMember.get(a.member_id) || 0) + 1,
          );
        }
        awardsByCeremony.set(
          a.ceremony,
          (awardsByCeremony.get(a.ceremony) || 0) + 1,
        );
      }
    });

    // Concerts by tour and country
    const concertsByTour = new Map<string, number>();
    const concertsByCountry = new Map<string, number>();
    ctx.concerts.forEach((c) => {
      concertsByTour.set(
        c.tour_name,
        (concertsByTour.get(c.tour_name) || 0) + 1,
      );
      concertsByCountry.set(
        c.country,
        (concertsByCountry.get(c.country) || 0) + 1,
      );
    });

    // Best chart positions per chart
    const chartBest = new Map<string, { position: number; song: string }>();
    ctx.chartEntries.forEach((ce) => {
      const existing = chartBest.get(ce.chart_name);
      if (!existing || ce.peak_position < existing.position) {
        const song = ctx.songs.find((s) => s.id === ce.song_id);
        chartBest.set(ce.chart_name, {
          position: ce.peak_position,
          song: song?.title || 'Unknown',
        });
      }
    });

    return {
      totalSongs: ctx.songs.length,
      totalAlbums: ctx.albums.length,
      totalAwards: ctx.awards.length,
      totalAwardsWon: ctx.awards.filter((a) => a.result === 'won').length,
      totalConcerts: ctx.concerts.length,
      totalCollaborations: ctx.collaborations.length,
      uniqueCeremonies: [...new Set(ctx.awards.map((a) => a.ceremony))],
      uniqueTours: [...new Set(ctx.concerts.map((c) => c.tour_name))],
      uniqueCharts: [...new Set(ctx.chartEntries.map((c) => c.chart_name))],
      awardsByMember,
      awardsByCeremony,
      concertsByTour,
      concertsByCountry,
      chartRecords: Array.from(chartBest.entries()).map(([chart, data]) => ({
        chart,
        bestPosition: data.position,
        song: data.song,
      })),
    };
  }
}
