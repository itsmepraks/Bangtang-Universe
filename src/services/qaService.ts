import type { Song, Album, Member, Award, ChartEntry, Concert, Collaboration, MemberEvent } from '../types/database';
import { getRecommendations } from './recommendationService';

export interface QAContext {
  songs: Song[];
  albums: Album[];
  members: Member[];
  awards?: Award[];
  chartEntries?: ChartEntry[];
  concerts?: Concert[];
  collaborations?: Collaboration[];
  memberEvents?: MemberEvent[];
}

export interface QAResponse {
  text: string;
  data?: Array<Record<string, unknown>>;
  type: 'text' | 'ranking' | 'comparison' | 'stat' | 'list';
  confidence: number; // 0-1
}

// Abstraction so rule-based QA can be swapped for an AI-backed provider.
export interface QAProvider {
  answer(question: string, context: QAContext): QAResponse;
}

function findMember(query: string, members: Member[]): Member | undefined {
  const q = query.toLowerCase().trim();

  const exact = members.find((m) => m.stage_name.toLowerCase() === q);
  if (exact) return exact;

  const exactFull = members.find((m) => m.full_name?.toLowerCase() === q);
  if (exactFull) return exactFull;

  // Word-boundary stage-name match (so "who is rm" finds RM).
  const stageInQuery = members.find((m) => {
    const name = m.stage_name.toLowerCase();
    const regex = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return regex.test(q);
  });
  if (stageInQuery) return stageInQuery;

  const fullInQuery = members.find((m) => {
    if (!m.full_name) return false;
    return q.includes(m.full_name.toLowerCase());
  });
  if (fullInQuery) return fullInQuery;

  // Partial full-name match on first/last name (min length 3 to avoid noise).
  const partialFull = members.find((m) => {
    if (!m.full_name) return false;
    const parts = m.full_name.toLowerCase().split(/\s+/);
    return parts.some((part) => part.length >= 3 && q.includes(part));
  });
  if (partialFull) return partialFull;

  return undefined;
}

// Word-boundary match for short titles (≤3 chars) to avoid matching "ON"
// inside "on the way".
function findSong(query: string, songs: Song[]): Song | undefined {
  const q = query.toLowerCase().trim();

  const exact = songs.find((s) => s.title.toLowerCase() === q);
  if (exact) return exact;

  const titleContains = songs.find((s) => s.title.toLowerCase().includes(q));
  if (titleContains) return titleContains;

  const queryContains = songs.find((s) => {
    const title = s.title.toLowerCase();
    if (!q.includes(title)) return false;
    if (title.length >= 4) return true;
    const regex = new RegExp(`\\b${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return regex.test(q);
  });
  return queryContains;
}

function albumForSong(song: Song, albums: Album[]): Album | undefined {
  if (song.album_id === null) return undefined;
  return albums.find((a) => a.id === song.album_id);
}

function fmt(value: number | null, digits = 2): string {
  if (value === null) return 'N/A';
  return value.toFixed(digits);
}

function getAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

class RuleBasedQA implements QAProvider {
  answer(question: string, context: QAContext): QAResponse {
    const q = question.toLowerCase().trim();
    const { songs, albums, members } = context;

    if (
      /who wrote the most|top writer|most prolific/i.test(q)
    ) {
      return this.handleTopWriter(members);
    }

    // "compare" checked early so it doesn't collide with other handlers.
    if (/compare\s+(.+?)\s+and\s+(.+)/i.test(q)) {
      const match = q.match(/compare\s+(.+?)\s+and\s+(.+)/i)!;
      return this.handleCompare(match[1], match[2], members);
    }

    if (/similar\s+to\s+(.+)/i.test(q)) {
      const match = q.match(/similar\s+to\s+(.+)/i)!;
      return this.handleSimilar(match[1].trim(), songs, albums);
    }

    if (/(?:what|which)\s+era\s+(?:has\s+(?:the\s+)?)?(?:highest|most|best)\s+(\w+)/i.test(q)) {
      const match = q.match(/(?:what|which)\s+era\s+(?:has\s+(?:the\s+)?)?(?:highest|most|best)\s+(\w+)/i)!;
      return this.handleEraRanking(match[1], songs, albums);
    }

    if (/songs?\s+(?:in|from)\s+(?:the\s+)?(.+?)(?:\s+era)?$/i.test(q)) {
      const match = q.match(/songs?\s+(?:in|from)\s+(?:the\s+)?(.+?)(?:\s+era)?$/i)!;
      return this.handleSongsInEra(match[1].trim(), songs, albums);
    }

    if (/most energetic|highest energy/i.test(q)) {
      return this.handleSortedSongs(songs, albums, 'energy', 'desc', 'most energetic');
    }

    if (/most danceable|best dance/i.test(q)) {
      return this.handleSortedSongs(songs, albums, 'danceability', 'desc', 'most danceable');
    }

    if (/saddest|lowest valence|melancholic/i.test(q)) {
      return this.handleSortedSongs(songs, albums, 'valence', 'asc', 'saddest');
    }

    if (/happiest|most positive|highest valence/i.test(q)) {
      return this.handleSortedSongs(songs, albums, 'valence', 'desc', 'happiest');
    }

    if (/fastest|highest bpm/i.test(q)) {
      return this.handleSortedSongs(songs, albums, 'bpm', 'desc', 'fastest');
    }

    if (/slowest|lowest bpm/i.test(q)) {
      return this.handleSortedSongs(songs, albums, 'bpm', 'asc', 'slowest');
    }

    if (/title tracks?|lead singles?/i.test(q)) {
      return this.handleTitleTracks(songs, albums);
    }

    if (/how many songs|total songs/i.test(q)) {
      return this.handleSongCount(songs);
    }

    if (/how many albums/i.test(q)) {
      return this.handleAlbumCount(albums);
    }

    if (/(?:who(?:'s| is)|about|tell me about)\s+(.+)/i.test(q)) {
      const match = q.match(/(?:who(?:'s| is)|about|tell me about)\s+(.+)/i)!;
      const member = findMember(match[1].trim(), members);
      if (member) return this.handleAboutMember(member.stage_name, members);
    }

    if (/(?:when was|how old|birthday|birth date|born)\b/i.test(q)) {
      const member = findMember(q, members);
      if (member) return this.handleMemberBirthday(member);
    }

    if (/how many awards|total awards/i.test(q)) {
      return this.handleAwardCount(context);
    }

    if (/awards?\s+at\s+(.+)/i.test(q)) {
      const match = q.match(/awards?\s+at\s+(.+)/i)!;
      return this.handleAwardsByCeremony(match[1].trim(), context);
    }
    if (/(.+?)\s+awards?/i.test(q)) {
      const match = q.match(/(.+?)\s+awards?/i)!;
      return this.handleAwardsByCeremony(match[1].trim(), context);
    }

    if (/awards?\s+in\s+(\d{4})/i.test(q)) {
      const match = q.match(/awards?\s+in\s+(\d{4})/i)!;
      return this.handleAwardsByYear(parseInt(match[1], 10), context);
    }

    if (/how many concerts|total concerts|how many shows/i.test(q)) {
      return this.handleConcertCount(context);
    }

    if (/(.+?)\s+tour/i.test(q)) {
      const match = q.match(/(.+?)\s+tour/i)!;
      return this.handleConcertsByTour(match[1].trim(), context);
    }

    if (/concerts?\s+in\s+(.+)/i.test(q) || /shows?\s+in\s+(.+)/i.test(q)) {
      const match = q.match(/(?:concerts?|shows?)\s+in\s+(.+)/i)!;
      return this.handleConcertsByCountry(match[1].trim(), context);
    }

    if (/billboard|hot 100|chart/i.test(q)) {
      return this.handleChartEntries(context);
    }

    if (/number one|#1|first place/i.test(q)) {
      return this.handleNumberOnes(context);
    }

    if (/collaborat|featured|worked with/i.test(q)) {
      return this.handleCollaborations(context);
    }

    if (/enlist|military|service/i.test(q)) {
      return this.handleEnlistment(context);
    }

    // Keyword fallbacks for short queries.
    if (/\bconcert|perform|tour|show|live\b/i.test(q)) {
      return this.handleConcertCount(context);
    }
    if (/\baward|prize|win|won|trophy|grammy|billboard music|ama|mama\b/i.test(q)) {
      return this.handleAwardCount(context);
    }
    if (/\bchart|billboard|hot\s?100|ranking|peak\b/i.test(q)) {
      return this.handleChartEntries(context);
    }
    if (/\bsong|track|music|discograph/i.test(q)) {
      return this.handleSongCount(context.songs);
    }
    if (/\balbum/i.test(q)) {
      return this.handleAlbumCount(context.albums);
    }
    if (/\bmember|lineup|group|bangtan/i.test(q)) {
      return this.handleMemberOverview(context.members);
    }
    if (/\bcollab/i.test(q)) {
      return this.handleCollaborations(context);
    }
    if (/\benlist|military|army|service|discharge/i.test(q)) {
      return this.handleEnlistment(context);
    }

    const memberMatch = findMember(q, context.members);
    if (memberMatch) {
      return this.handleAboutMember(memberMatch.stage_name, context.members);
    }

    const songMatch = findSong(q, context.songs);
    if (songMatch) {
      return this.handleSongInfo(songMatch, context.songs, context.albums);
    }

    return this.fallback();
  }

  private handleTopWriter(members: Member[]): QAResponse {
    const sorted = [...members].sort((a, b) => b.writer_credits - a.writer_credits);
    const top = sorted[0];
    if (!top) {
      return { text: 'No member data available.', type: 'text', confidence: 0.5 };
    }

    return {
      text: `${top.stage_name} has the most writing credits with ${top.writer_credits} songs written. They also have ${top.producer_credits} producer credits and ${top.komca_credits} total KOMCA credits.`,
      data: sorted.slice(0, 7).map((m) => ({
        member: m.stage_name,
        writerCredits: m.writer_credits,
        producerCredits: m.producer_credits,
        komcaCredits: m.komca_credits,
      })),
      type: 'ranking',
      confidence: 0.95,
    };
  }

  private handleSortedSongs(
    songs: Song[],
    albums: Album[],
    feature: keyof Pick<Song, 'energy' | 'valence' | 'danceability' | 'bpm' | 'acousticness'>,
    direction: 'asc' | 'desc',
    label: string,
  ): QAResponse {
    const withValue = songs.filter((s) => s[feature] !== null);
    if (withValue.length === 0) {
      return {
        text: `No songs have ${feature} data available.`,
        type: 'text',
        confidence: 0.5,
      };
    }

    const sorted = [...withValue].sort((a, b) => {
      const aVal = a[feature] as number;
      const bVal = b[feature] as number;
      return direction === 'desc' ? bVal - aVal : aVal - bVal;
    });

    const count = feature === 'valence' ? 5 : Math.min(sorted.length, 10);
    const top = sorted.slice(0, count);

    return {
      text: `Here are the ${label} songs by ${feature}:`,
      data: top.map((s, i) => {
        const album = albumForSong(s, albums);
        return {
          rank: i + 1,
          title: s.title,
          [feature]: fmt(s[feature] as number | null),
          album: album?.title ?? 'Unknown Album',
        };
      }),
      type: 'ranking',
      confidence: 0.9,
    };
  }

  private handleCompare(nameA: string, nameB: string, members: Member[]): QAResponse {
    const memberA = findMember(nameA, members);
    const memberB = findMember(nameB, members);

    if (!memberA && !memberB) {
      return {
        text: `Could not find members matching "${nameA}" or "${nameB}".`,
        type: 'text',
        confidence: 0.3,
      };
    }
    if (!memberA) {
      return {
        text: `Could not find a member matching "${nameA}".`,
        type: 'text',
        confidence: 0.3,
      };
    }
    if (!memberB) {
      return {
        text: `Could not find a member matching "${nameB}".`,
        type: 'text',
        confidence: 0.3,
      };
    }

    return {
      text: `Comparing ${memberA.stage_name} and ${memberB.stage_name}:`,
      data: [
        {
          stat: 'KOMCA Credits',
          [memberA.stage_name]: memberA.komca_credits,
          [memberB.stage_name]: memberB.komca_credits,
        },
        {
          stat: 'Writer Credits',
          [memberA.stage_name]: memberA.writer_credits,
          [memberB.stage_name]: memberB.writer_credits,
        },
        {
          stat: 'Producer Credits',
          [memberA.stage_name]: memberA.producer_credits,
          [memberB.stage_name]: memberB.producer_credits,
        },
        {
          stat: 'Role',
          [memberA.stage_name]: memberA.role ?? 'N/A',
          [memberB.stage_name]: memberB.role ?? 'N/A',
        },
      ],
      type: 'comparison',
      confidence: 0.95,
    };
  }

  private handleSongsInEra(era: string, songs: Song[], albums: Album[]): QAResponse {
    const eraLower = era.toLowerCase();
    const matchingAlbumIds = new Set(
      albums
        .filter((a) => a.era !== null && a.era.toLowerCase().includes(eraLower))
        .map((a) => a.id),
    );

    if (matchingAlbumIds.size === 0) {
      return {
        text: `No albums found for the "${era}" era.`,
        type: 'text',
        confidence: 0.4,
      };
    }

    const eraSongs = songs.filter(
      (s) => s.album_id !== null && matchingAlbumIds.has(s.album_id),
    );

    if (eraSongs.length === 0) {
      return {
        text: `No songs found in the "${era}" era.`,
        type: 'text',
        confidence: 0.5,
      };
    }

    return {
      text: `Found ${eraSongs.length} songs in the ${era} era:`,
      data: eraSongs.map((s) => {
        const album = albumForSong(s, albums);
        return {
          title: s.title,
          album: album?.title ?? 'Unknown Album',
          titleTrack: s.is_title_track ? 'Yes' : 'No',
        };
      }),
      type: 'list',
      confidence: 0.85,
    };
  }

  private handleEraRanking(feature: string, songs: Song[], albums: Album[]): QAResponse {
    const featureKey = feature.toLowerCase() as keyof Pick<
      Song,
      'energy' | 'valence' | 'danceability' | 'bpm' | 'acousticness'
    >;

    const validFeatures: Array<keyof Song> = [
      'energy',
      'valence',
      'danceability',
      'bpm',
      'acousticness',
    ];
    if (!validFeatures.includes(featureKey)) {
      return {
        text: `Unknown audio feature "${feature}". Try energy, valence, danceability, bpm, or acousticness.`,
        type: 'text',
        confidence: 0.4,
      };
    }

    const eraValues = new Map<string, number[]>();

    for (const song of songs) {
      const val = song[featureKey];
      if (val === null || song.album_id === null) continue;
      const album = albums.find((a) => a.id === song.album_id);
      const era = album?.era;
      if (!era) continue;

      const arr = eraValues.get(era) ?? [];
      arr.push(val as number);
      eraValues.set(era, arr);
    }

    if (eraValues.size === 0) {
      return {
        text: `Not enough data to compute era averages for ${feature}.`,
        type: 'text',
        confidence: 0.4,
      };
    }

    const eraAverages = Array.from(eraValues.entries())
      .map(([era, values]) => ({
        era,
        average: values.reduce((sum, v) => sum + v, 0) / values.length,
        songCount: values.length,
      }))
      .sort((a, b) => b.average - a.average);

    const top = eraAverages[0];

    return {
      text: `The ${top.era} era has the highest average ${featureKey} (${fmt(top.average)}) across ${top.songCount} songs.`,
      data: eraAverages.map((e) => ({
        era: e.era,
        [`avg_${featureKey}`]: fmt(e.average),
        songCount: e.songCount,
      })),
      type: 'ranking',
      confidence: 0.85,
    };
  }

  private handleSongCount(songs: Song[]): QAResponse {
    const totalSongs = songs.length;
    const titleTracks = songs.filter((s) => s.is_title_track).length;

    return {
      text: `There are ${totalSongs} songs in the database, including ${titleTracks} title tracks.`,
      data: [
        { stat: 'Total Songs', value: totalSongs },
        { stat: 'Title Tracks', value: titleTracks },
      ],
      type: 'stat',
      confidence: 1,
    };
  }

  private handleAlbumCount(albums: Album[]): QAResponse {
    const total = albums.length;
    const byType = new Map<string, number>();
    for (const album of albums) {
      byType.set(album.type, (byType.get(album.type) ?? 0) + 1);
    }

    const breakdown = Array.from(byType.entries()).map(([type, count]) => ({
      type,
      count,
    }));

    return {
      text: `There are ${total} albums in the database.`,
      data: breakdown as Array<Record<string, unknown>>,
      type: 'stat',
      confidence: 1,
    };
  }

  private handleSimilar(titleQuery: string, songs: Song[], albums: Album[]): QAResponse {
    const song = findSong(titleQuery, songs);
    if (!song) {
      return {
        text: `Could not find a song matching "${titleQuery}".`,
        type: 'text',
        confidence: 0.3,
      };
    }

    const recommendations = getRecommendations(song, songs, albums, 5);
    if (recommendations.length === 0) {
      return {
        text: `No similar songs found for "${song.title}".`,
        type: 'text',
        confidence: 0.5,
      };
    }

    return {
      text: `Songs similar to "${song.title}":`,
      data: recommendations.map((rec, i) => ({
        rank: i + 1,
        title: rec.song.title,
        album: rec.albumTitle,
        similarity: `${(rec.similarity * 100).toFixed(1)}%`,
        reasons: rec.reasons.join(', '),
      })),
      type: 'ranking',
      confidence: 0.85,
    };
  }

  private handleTitleTracks(songs: Song[], albums: Album[]): QAResponse {
    const titleTracks = songs.filter((s) => s.is_title_track);
    if (titleTracks.length === 0) {
      return {
        text: 'No title tracks found in the database.',
        type: 'text',
        confidence: 0.5,
      };
    }

    return {
      text: `There are ${titleTracks.length} title tracks:`,
      data: titleTracks.map((s) => {
        const album = albumForSong(s, albums);
        return {
          title: s.title,
          album: album?.title ?? 'Unknown Album',
          era: album?.era ?? 'N/A',
        };
      }),
      type: 'list',
      confidence: 0.95,
    };
  }

  private handleAboutMember(nameQuery: string, members: Member[]): QAResponse {
    const member = findMember(nameQuery, members);
    if (!member) {
      return {
        text: `Could not find a member matching "${nameQuery}".`,
        type: 'text',
        confidence: 0.3,
      };
    }

    const bio = member.bio ? ` ${member.bio}` : '';
    const age = member.birth_date ? ` (${getAge(member.birth_date)} years old)` : '';

    return {
      text: `${member.stage_name}${member.full_name ? ` (${member.full_name})` : ''} — ${member.role ?? 'Member'}.${age}${bio}`,
      data: [
        { stat: 'Role', value: member.role ?? 'N/A' },
        { stat: 'Birth Date', value: member.birth_date ?? 'N/A' },
        { stat: 'Birth Place', value: member.birth_place ?? 'N/A' },
        { stat: 'MBTI', value: member.mbti ?? 'N/A' },
        { stat: 'KOMCA Credits', value: member.komca_credits },
        { stat: 'Writer Credits', value: member.writer_credits },
        { stat: 'Producer Credits', value: member.producer_credits },
        { stat: 'Zodiac', value: member.zodiac ?? 'N/A' },
      ],
      type: 'stat',
      confidence: 0.95,
    };
  }

  private handleMemberBirthday(member: Member): QAResponse {
    if (!member.birth_date) {
      return {
        text: `Birth date not available for ${member.stage_name}.`,
        type: 'text',
        confidence: 0.5,
      };
    }
    const age = getAge(member.birth_date);
    return {
      text: `${member.stage_name} was born on ${member.birth_date}${member.birth_place ? ` in ${member.birth_place}` : ''}. He is currently ${age} years old.`,
      data: [
        { stat: 'Birth Date', value: member.birth_date },
        { stat: 'Age', value: age },
        { stat: 'Birth Place', value: member.birth_place ?? 'N/A' },
        { stat: 'Zodiac', value: member.zodiac ?? 'N/A' },
      ],
      type: 'stat',
      confidence: 0.95,
    };
  }

  private handleAwardCount(context: QAContext): QAResponse {
    const awards = context.awards || [];
    if (awards.length === 0) {
      return { text: 'No award data available.', type: 'text', confidence: 0.5 };
    }
    const won = awards.filter((a) => a.result === 'won');
    const nominated = awards.filter((a) => a.result === 'nominated');
    return {
      text: `BTS has won ${won.length} awards out of ${awards.length} total nominations.`,
      data: [
        { stat: 'Total Awards Won', value: won.length },
        { stat: 'Total Nominations', value: nominated.length },
        { stat: 'Total Entries', value: awards.length },
      ],
      type: 'stat',
      confidence: 0.95,
    };
  }

  private handleAwardsByCeremony(ceremony: string, context: QAContext): QAResponse {
    const awards = context.awards || [];
    if (awards.length === 0) {
      return { text: 'No award data available.', type: 'text', confidence: 0.5 };
    }
    const ceremonyLower = ceremony.toLowerCase();
    const matching = awards.filter((a) =>
      a.ceremony.toLowerCase().includes(ceremonyLower),
    );
    if (matching.length === 0) {
      return {
        text: `No awards found for "${ceremony}".`,
        type: 'text',
        confidence: 0.4,
      };
    }
    const won = matching.filter((a) => a.result === 'won');
    return {
      text: `Found ${matching.length} entries at ${matching[0].ceremony} (${won.length} won):`,
      data: matching.map((a) => ({
        name: a.name,
        category: a.category ?? 'N/A',
        year: a.year,
        result: a.result,
      })),
      type: 'list',
      confidence: 0.85,
    };
  }

  private handleAwardsByYear(year: number, context: QAContext): QAResponse {
    const awards = context.awards || [];
    if (awards.length === 0) {
      return { text: 'No award data available.', type: 'text', confidence: 0.5 };
    }
    const matching = awards.filter((a) => a.year === year);
    if (matching.length === 0) {
      return {
        text: `No awards found for the year ${year}.`,
        type: 'text',
        confidence: 0.4,
      };
    }
    const won = matching.filter((a) => a.result === 'won');
    return {
      text: `In ${year}, BTS had ${matching.length} award entries (${won.length} won):`,
      data: matching.map((a) => ({
        name: a.name,
        ceremony: a.ceremony,
        category: a.category ?? 'N/A',
        result: a.result,
      })),
      type: 'list',
      confidence: 0.9,
    };
  }

  private handleConcertCount(context: QAContext): QAResponse {
    const concerts = context.concerts || [];
    if (concerts.length === 0) {
      return { text: 'No concert data available.', type: 'text', confidence: 0.5 };
    }
    const tours = new Set(concerts.map((c) => c.tour_name));
    const countries = new Set(concerts.map((c) => c.country));
    const totalAttendance = concerts.reduce(
      (sum, c) => sum + (c.attendance || 0),
      0,
    );
    return {
      text: `BTS has performed ${concerts.length} concerts across ${tours.size} tours in ${countries.size} countries.`,
      data: [
        { stat: 'Total Shows', value: concerts.length },
        { stat: 'Total Tours', value: tours.size },
        { stat: 'Countries Visited', value: countries.size },
        ...(totalAttendance > 0
          ? [{ stat: 'Total Attendance', value: totalAttendance }]
          : []),
      ],
      type: 'stat',
      confidence: 0.95,
    };
  }

  private handleConcertsByTour(tourQuery: string, context: QAContext): QAResponse {
    const concerts = context.concerts || [];
    if (concerts.length === 0) {
      return { text: 'No concert data available.', type: 'text', confidence: 0.5 };
    }
    const tourLower = tourQuery.toLowerCase();
    const matching = concerts.filter((c) =>
      c.tour_name.toLowerCase().includes(tourLower),
    );
    if (matching.length === 0) {
      return {
        text: `No concerts found for tour matching "${tourQuery}".`,
        type: 'text',
        confidence: 0.4,
      };
    }
    const sorted = [...matching].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
    return {
      text: `Found ${sorted.length} shows for the ${sorted[0].tour_name} tour:`,
      data: sorted.map((c) => ({
        venue: c.venue,
        city: c.city,
        country: c.country,
        date: c.date,
        attendance: c.attendance ?? 'N/A',
      })),
      type: 'list',
      confidence: 0.85,
    };
  }

  private handleConcertsByCountry(countryQuery: string, context: QAContext): QAResponse {
    const concerts = context.concerts || [];
    if (concerts.length === 0) {
      return { text: 'No concert data available.', type: 'text', confidence: 0.5 };
    }
    const countryLower = countryQuery.toLowerCase();
    const matching = concerts.filter(
      (c) =>
        c.country.toLowerCase().includes(countryLower) ||
        c.city.toLowerCase().includes(countryLower),
    );
    if (matching.length === 0) {
      return {
        text: `No concerts found in "${countryQuery}".`,
        type: 'text',
        confidence: 0.4,
      };
    }
    return {
      text: `Found ${matching.length} concerts in ${countryQuery}:`,
      data: matching.map((c) => ({
        tour: c.tour_name,
        venue: c.venue,
        city: c.city,
        country: c.country,
        date: c.date,
      })),
      type: 'list',
      confidence: 0.85,
    };
  }

  private handleChartEntries(context: QAContext): QAResponse {
    const chartEntries = context.chartEntries || [];
    const songs = context.songs;
    if (chartEntries.length === 0) {
      return { text: 'No chart data available.', type: 'text', confidence: 0.5 };
    }
    const numberOnes = chartEntries.filter((ce) => ce.peak_position === 1);
    const sorted = [...chartEntries].sort(
      (a, b) => a.peak_position - b.peak_position,
    );
    const top = sorted.slice(0, 10);
    return {
      text: `BTS has ${chartEntries.length} chart entries, including ${numberOnes.length} #1 hits.`,
      data: top.map((ce) => {
        const song = songs.find((s) => s.id === ce.song_id);
        return {
          chart: ce.chart_name,
          peakPosition: ce.peak_position,
          song: song?.title ?? ce.chart_name,
          weeksOnChart: ce.weeks_on_chart ?? 'N/A',
          certification: ce.certification ?? 'N/A',
        };
      }),
      type: 'ranking',
      confidence: 0.9,
    };
  }

  private handleNumberOnes(context: QAContext): QAResponse {
    const chartEntries = context.chartEntries || [];
    const songs = context.songs;
    if (chartEntries.length === 0) {
      return { text: 'No chart data available.', type: 'text', confidence: 0.5 };
    }
    const numberOnes = chartEntries.filter((ce) => ce.peak_position === 1);
    if (numberOnes.length === 0) {
      return {
        text: 'No #1 chart entries found in the database.',
        type: 'text',
        confidence: 0.7,
      };
    }
    return {
      text: `BTS has achieved ${numberOnes.length} #1 chart positions:`,
      data: numberOnes.map((ce) => {
        const song = songs.find((s) => s.id === ce.song_id);
        return {
          chart: ce.chart_name,
          song: song?.title ?? 'Unknown',
          weeksOnChart: ce.weeks_on_chart ?? 'N/A',
          date: ce.entry_date ?? 'N/A',
        };
      }),
      type: 'list',
      confidence: 0.9,
    };
  }

  private handleCollaborations(context: QAContext): QAResponse {
    const collaborations = context.collaborations || [];
    const members = context.members;
    if (collaborations.length === 0) {
      return { text: 'No collaboration data available.', type: 'text', confidence: 0.5 };
    }
    return {
      text: `BTS has ${collaborations.length} collaborations:`,
      data: collaborations.map((c) => {
        const member = members.find((m) => m.id === c.member_id);
        return {
          title: c.title,
          artist: c.artist,
          type: c.type,
          member: member?.stage_name ?? 'Group',
          releaseDate: c.release_date ?? 'N/A',
        };
      }),
      type: 'list',
      confidence: 0.85,
    };
  }

  private handleEnlistment(context: QAContext): QAResponse {
    const memberEvents = context.memberEvents || [];
    const members = context.members;
    if (memberEvents.length === 0) {
      return { text: 'No member event data available.', type: 'text', confidence: 0.5 };
    }
    const enlistmentEvents = memberEvents.filter(
      (e) =>
        e.event_type === 'enlistment_start' || e.event_type === 'enlistment_end',
    );
    if (enlistmentEvents.length === 0) {
      return {
        text: 'No enlistment records found in the database.',
        type: 'text',
        confidence: 0.6,
      };
    }
    const sorted = [...enlistmentEvents].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
    return {
      text: `Found ${sorted.length} enlistment events:`,
      data: sorted.map((e) => {
        const member = members.find((m) => m.id === e.member_id);
        return {
          member: member?.stage_name ?? e.member_id,
          event: e.event_type === 'enlistment_start' ? 'Enlisted' : 'Discharged',
          date: e.date,
          description: e.description ?? 'N/A',
        };
      }),
      type: 'list',
      confidence: 0.9,
    };
  }

  private handleMemberOverview(members: Member[]): QAResponse {
    if (members.length === 0) {
      return { text: 'No member data available.', type: 'text', confidence: 0.5 };
    }
    return {
      text: `BTS has ${members.length} members:`,
      data: members.map((m) => ({
        name: m.stage_name,
        role: m.role ?? 'N/A',
        writerCredits: m.writer_credits,
        komcaCredits: m.komca_credits,
      })),
      type: 'list',
      confidence: 0.85,
    };
  }

  private handleSongInfo(song: Song, _songs: Song[], albums: Album[]): QAResponse {
    const album = albumForSong(song, albums);
    return {
      text: `"${song.title}" ${album ? `from ${album.title} (${album.era ?? 'Unknown'} era)` : ''}`,
      data: [
        { stat: 'Energy', value: fmt(song.energy) },
        { stat: 'Valence', value: fmt(song.valence) },
        { stat: 'Danceability', value: fmt(song.danceability) },
        { stat: 'BPM', value: fmt(song.bpm, 0) },
        { stat: 'Title Track', value: song.is_title_track ? 'Yes' : 'No' },
      ],
      type: 'stat',
      confidence: 0.8,
    };
  }

  private fallback(): QAResponse {
    return {
      text: "I'm not sure how to answer that. Try asking about:",
      data: [
        { suggestion: 'Who wrote the most songs?' },
        { suggestion: 'What are the most energetic songs?' },
        { suggestion: 'Compare RM and SUGA' },
        { suggestion: 'Songs in the Love Yourself era' },
        { suggestion: 'Songs similar to Dynamite' },
        { suggestion: 'How many songs are there?' },
        { suggestion: 'What are the title tracks?' },
        { suggestion: 'How many awards has BTS won?' },
        { suggestion: 'Billboard Hot 100 entries' },
        { suggestion: 'When did BTS members enlist?' },
      ],
      type: 'list',
      confidence: 0.1,
    };
  }
}

export const qaService = new RuleBasedQA();

export const SUGGESTED_QUESTIONS = [
  'Who wrote the most songs?',
  'What are the most energetic songs?',
  'Compare RM and SUGA',
  'Songs in the Love Yourself era',
  'What is the saddest song?',
  'Songs similar to Dynamite',
  'Which era has the highest energy?',
  'How many title tracks are there?',
  'How many awards has BTS won?',
  'Awards at Billboard Music Awards',
  'How many concerts has BTS performed?',
  'Love Yourself tour',
  'Billboard Hot 100 entries',
  'When did BTS members enlist?',
];
