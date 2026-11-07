import React from 'react';
import { Clock } from 'lucide-react';

export interface DaySchedule {
  day: string;
  hours: string;
  isClosed?: boolean;
  highlight?: boolean;
  dayColor?: string;
  timeColor?: string;
}

export interface WeeklyBusinessHoursProps {
  id?: string;
  title?: string;
  schedule?: DaySchedule[];
  highlightCurrentDay?: boolean;
}

export const DEFAULT_SCHEDULE: DaySchedule[] = [
  { day: 'Lundi', hours: '9h00 - 19h00', isClosed: false, highlight: true },
  { day: 'Mardi', hours: '9h00 - 19h00', isClosed: false, highlight: true },
  { day: 'Mercredi', hours: '9h00 - 19h00', isClosed: false, highlight: true },
  { day: 'Jeudi', hours: '9h00 - 19h00', isClosed: false, highlight: true },
  { day: 'Vendredi', hours: '9h00 - 19h00', isClosed: false, highlight: true },
  { day: 'Samedi', hours: '9h00 - 19h00', isClosed: false, highlight: true },
  { day: 'Dimanche', hours: 'Fermé', isClosed: true, highlight: true, timeColor: '#FA2D2D' },
];

export const WeeklyBusinessHours: React.FC<WeeklyBusinessHoursProps> = ({
  title = "Horaires d'ouverture",
  schedule = DEFAULT_SCHEDULE,
  highlightCurrentDay = true,
}) => {
  // Determine if currently open based on local day and time
  const now = new Date();
  const currentDayIndex = now.getDay(); // 0 is Sunday, 1 is Monday...
  const currentHour = now.getHours();

  // Sunday is 0, Monday is 1, ..., Saturday is 6
  // Map index to match our Monday-first schedule
  // schedule[0] = Lundi (1), schedule[6] = Dimanche (0)
  const scheduleDayIndex = currentDayIndex === 0 ? 6 : currentDayIndex - 1;

  const isSunday = currentDayIndex === 0;
  const isOpenNow = !isSunday && currentHour >= 9 && currentHour < 19;

  return (
    <div
      className="puck-business-hours-card"
      style={{
        margin: 0,
        padding: '1.25rem 1rem',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div
        className="flex items-center justify-between flex-wrap gap-2"
        style={{ marginBottom: '1rem', borderBottom: '2px solid var(--cordo-chocolate)', paddingBottom: '0.5rem' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={20} color="var(--cordo-chocolate)" />
          <h3 style={{ margin: 0, fontFamily: 'var(--font-title)', fontSize: '1.15rem', color: 'var(--cordo-chocolate)' }}>
            {title}
          </h3>
        </div>

        {/* Dynamic Live Status Indicator */}
        <div
          className="live-status-badge"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.2rem 0.6rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 700,
            backgroundColor: isOpenNow ? 'rgba(27, 108, 48, 0.12)' : 'rgba(250, 45, 45, 0.12)',
            color: isOpenNow ? '#1B6C30' : '#FA2D2D',
            border: `1px solid ${isOpenNow ? '#1B6C30' : '#FA2D2D'}`,
          }}
        >
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: isOpenNow ? '#1B6C30' : '#FA2D2D',
              display: 'inline-block',
            }}
          />
          <span>{isOpenNow ? 'Ouvert actuellement' : 'Fermé actuellement'}</span>
        </div>
      </div>

      {/* Schedule Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
        <tbody>
          {schedule.map((row, idx) => {
            const isToday = highlightCurrentDay && idx === scheduleDayIndex;

            return (
              <tr
                key={idx}
                style={{
                  backgroundColor: isToday ? 'var(--cordo-cream)' : 'transparent',
                  borderLeft: isToday ? '4px solid var(--cordo-gold)' : '4px solid transparent',
                  borderBottom: '1px solid var(--cordo-border)',
                  fontWeight: isToday ? 700 : 500,
                  transition: 'background-color var(--transition-fast)',
                }}
              >
                <td style={{ padding: '0.45rem 0.5rem', color: row.dayColor || 'var(--cordo-chocolate)' }}>
                  {row.day} {isToday && <span style={{ fontSize: '0.75rem', color: 'var(--cordo-gold)' }}>(Aujourd'hui)</span>}
                </td>
                <td
                  style={{
                    padding: '0.45rem 0.5rem',
                    textAlign: 'right',
                    color: row.isClosed ? '#FA2D2D' : row.timeColor || 'inherit',
                  }}
                >
                  {row.hours}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div
        style={{
          marginTop: '0.75rem',
          fontSize: '0.78rem',
          color: 'var(--cordo-muted)',
          textAlign: 'center',
          fontStyle: 'italic',
        }}
      >
        Sans interruption du lundi au samedi dans la galerie marchande Intermarché.
      </div>
    </div>
  );
};

export default WeeklyBusinessHours;
