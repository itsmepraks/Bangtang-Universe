import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Globe, Calendar, Users, Ticket } from 'lucide-react';
import type { Concert } from '../../../../types/database';
import { CHART_STYLES, BORAHAE_COLORS } from '../../../../constants/colors';

interface TourStatsProps {
  concerts: Concert[];
}

export default function TourStats({ concerts }: TourStatsProps) {
  // Summary stats
  const summary = useMemo(() => {
    const tourSet = new Set(concerts.map((c) => c.tour_name));
    const countrySet = new Set(concerts.map((c) => c.country));
    const totalAttendance = concerts.reduce((sum, c) => sum + (c.attendance || 0), 0);
    return {
      totalTours: tourSet.size,
      totalConcerts: concerts.length,
      totalAttendance,
      countriesVisited: countrySet.size,
    };
  }, [concerts]);

  // Concerts per year
  const concertsPerYear = useMemo(() => {
    const yearMap = new Map<number, number>();
    concerts.forEach((c) => {
      const year = new Date(c.date).getFullYear();
      yearMap.set(year, (yearMap.get(year) || 0) + 1);
    });
    return Array.from(yearMap.entries())
      .map(([year, count]) => ({ year: year.toString(), count }))
      .sort((a, b) => parseInt(a.year) - parseInt(b.year));
  }, [concerts]);

  // Top countries by concert count
  const topCountries = useMemo(() => {
    const countryMap = new Map<string, number>();
    concerts.forEach((c) => {
      countryMap.set(c.country, (countryMap.get(c.country) || 0) + 1);
    });
    return Array.from(countryMap.entries())
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);
  }, [concerts]);

  // Total attendance per tour
  const attendancePerTour = useMemo(() => {
    const tourMap = new Map<string, number>();
    concerts.forEach((c) => {
      tourMap.set(c.tour_name, (tourMap.get(c.tour_name) || 0) + (c.attendance || 0));
    });
    return Array.from(tourMap.entries())
      .map(([tour, attendance]) => ({
        tour: tour.length > 25 ? tour.slice(0, 22) + '...' : tour,
        fullTour: tour,
        attendance,
      }))
      .sort((a, b) => b.attendance - a.attendance);
  }, [concerts]);

  if (concerts.length === 0) {
    return (
      <div className="py-16 text-center">
        <Calendar className="w-12 h-12 text-white/20 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white/60 mb-2">No concert data yet</h3>
        <p className="text-sm text-white/40">Run the concerts scraper to populate.</p>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Tours',
      value: summary.totalTours.toLocaleString(),
      icon: Ticket,
    },
    {
      label: 'Total Concerts',
      value: summary.totalConcerts.toLocaleString(),
      icon: Calendar,
    },
    {
      label: 'Total Attendance',
      value: summary.totalAttendance.toLocaleString(),
      icon: Users,
    },
    {
      label: 'Countries Visited',
      value: summary.countriesVisited.toLocaleString(),
      icon: Globe,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-xl border border-white/[0.06] bg-[#0c0c12] p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4 text-purple-400" />
                <span className="text-[10px] font-medium text-white/40 uppercase tracking-wide">
                  {card.label}
                </span>
              </div>
              <div className="text-2xl font-bold text-white/90 tabular-nums">{card.value}</div>
            </div>
          );
        })}
      </div>

      {/* Concerts per Year */}
      {concertsPerYear.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-white/70">Concerts per Year</h3>
          <div className="h-64 rounded-xl border border-white/[0.06] bg-[#0c0c12] p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={concertsPerYear}>
                <CartesianGrid {...CHART_STYLES.GRID} />
                <XAxis dataKey="year" tick={CHART_STYLES.AXIS} axisLine={false} tickLine={false} />
                <YAxis
                  tick={CHART_STYLES.AXIS}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={CHART_STYLES.TOOLTIP.contentStyle}
                  labelStyle={CHART_STYLES.TOOLTIP.labelStyle}
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                />
                <Bar dataKey="count" name="Concerts" fill={BORAHAE_COLORS.PRIMARY} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Top Countries */}
      {topCountries.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-white/70">Top Countries by Concert Count</h3>
          <div
            className="rounded-xl border border-white/[0.06] bg-[#0c0c12] p-4"
            style={{ height: Math.max(200, topCountries.length * 32 + 40) }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCountries} layout="vertical">
                <CartesianGrid {...CHART_STYLES.GRID} horizontal={false} />
                <XAxis
                  type="number"
                  tick={CHART_STYLES.AXIS}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="country"
                  tick={CHART_STYLES.AXIS}
                  axisLine={false}
                  tickLine={false}
                  width={100}
                />
                <Tooltip
                  contentStyle={CHART_STYLES.TOOLTIP.contentStyle}
                  labelStyle={CHART_STYLES.TOOLTIP.labelStyle}
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                />
                <Bar dataKey="count" name="Concerts" fill={BORAHAE_COLORS.INDIGO} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Attendance per Tour */}
      {attendancePerTour.length > 0 && attendancePerTour.some((t) => t.attendance > 0) && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-white/70">Total Attendance per Tour</h3>
          <div
            className="rounded-xl border border-white/[0.06] bg-[#0c0c12] p-4"
            style={{ height: Math.max(250, attendancePerTour.length * 36 + 40) }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendancePerTour} layout="vertical">
                <CartesianGrid {...CHART_STYLES.GRID} horizontal={false} />
                <XAxis
                  type="number"
                  tick={CHART_STYLES.AXIS}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value: number) => {
                    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
                    if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
                    return value.toString();
                  }}
                />
                <YAxis
                  type="category"
                  dataKey="tour"
                  tick={CHART_STYLES.AXIS}
                  axisLine={false}
                  tickLine={false}
                  width={160}
                />
                <Tooltip
                  contentStyle={CHART_STYLES.TOOLTIP.contentStyle}
                  labelStyle={CHART_STYLES.TOOLTIP.labelStyle}
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  formatter={((value: number) => [
                    value != null ? value.toLocaleString() : '0',
                    'Attendance' as const,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  ]) as any}
                  labelFormatter={((
                    _label: unknown,
                    payload?: ReadonlyArray<{ payload?: { fullTour?: string } }>
                  ) => {
                    if (payload && payload.length > 0 && payload[0].payload) {
                      return payload[0].payload.fullTour || String(_label);
                    }
                    return String(_label);
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  }) as any}
                />
                <Bar
                  dataKey="attendance"
                  name="Attendance"
                  fill={BORAHAE_COLORS.VIOLET}
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
