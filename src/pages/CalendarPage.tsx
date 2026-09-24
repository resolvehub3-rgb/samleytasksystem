import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Folder,
  CheckSquare,
} from 'lucide-react';
import { Project, Task } from '../types/database';
import { formatDate } from '../utils/formatters';

interface CalendarPageProps {
  projects: Project[];
  tasks: Task[];
  onSelectProject: (projectId: string) => void;
  onSelectTask: (task: Task) => void;
}

export const CalendarPage: React.FC<CalendarPageProps> = ({
  projects,
  tasks,
  onSelectProject,
  onSelectTask,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Days in month calculation
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today.toISOString().split('T')[0]);
  };

  // Map events to date strings (YYYY-MM-DD)
  const eventsByDate = useMemo(() => {
    const map: Record<string, { projects: Project[]; tasks: Task[] }> = {};

    projects.forEach((p) => {
      if (p.deadline) {
        const d = p.deadline.split('T')[0];
        if (!map[d]) map[d] = { projects: [], tasks: [] };
        map[d].projects.push(p);
      }
    });

    tasks.forEach((t) => {
      if (t.due_date) {
        const d = t.due_date.split('T')[0];
        if (!map[d]) map[d] = { projects: [], tasks: [] };
        map[d].tasks.push(t);
      }
    });

    return map;
  }, [projects, tasks]);

  const selectedDateEvents = eventsByDate[selectedDate] || { projects: [], tasks: [] };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-[#0B5D3B]" />
            <span>Milestones &amp; Deadlines Calendar</span>
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Visualize client launch dates, deliverables, and urgent sprint items
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 rounded-lg transition-colors cursor-pointer"
          >
            Today
          </button>
          <div className="flex items-center border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800">
            <button
              onClick={prevMonth}
              className="p-1.5 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold text-neutral-800 dark:text-neutral-100 tabular-nums">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid (2 Cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-[#121A15] border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-neutral-400 py-2 border-b border-neutral-100 dark:border-neutral-800">
            {daysOfWeek.map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          {/* Month days */}
          <div className="grid grid-cols-7 gap-1 mt-2">
            {/* Blank leading days */}
            {Array.from({ length: firstDayIndex }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-20 sm:h-24 p-1 rounded-lg bg-transparent" />
            ))}

            {/* Actual Month Days */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(
                dayNum
              ).padStart(2, '0')}`;
              const dayEvents = eventsByDate[dateStr];
              const isSelected = selectedDate === dateStr;
              const isToday =
                new Date().toISOString().split('T')[0] === dateStr;

              const totalCount =
                (dayEvents?.projects.length || 0) + (dayEvents?.tasks.length || 0);

              return (
                <div
                  key={dayNum}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`h-20 sm:h-24 p-1.5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#0B5D3B] ring-2 ring-[#0B5D3B]/20 bg-[#EBF7F0]/30 dark:bg-[#0B5D3B]/10'
                      : isToday
                      ? 'border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/40'
                      : 'border-neutral-100 dark:border-neutral-800/60 hover:bg-neutral-50 dark:hover:bg-neutral-800/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold tabular-nums ${
                        isToday
                          ? 'w-5 h-5 rounded-full bg-[#0B5D3B] text-white flex items-center justify-center text-[10px]'
                          : 'text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {totalCount > 0 && (
                      <span className="w-2 h-2 rounded-full bg-[#D9A400]" />
                    )}
                  </div>

                  {/* Badges preview */}
                  <div className="space-y-0.5 overflow-hidden">
                    {dayEvents?.projects.slice(0, 1).map((p) => (
                      <div
                        key={p.id}
                        className="truncate text-[9px] font-semibold px-1 py-0.2 rounded-xs bg-[#0B5D3B] text-white"
                      >
                        {p.name}
                      </div>
                    ))}
                    {dayEvents?.tasks.slice(0, 1).map((t) => (
                      <div
                        key={t.id}
                        className="truncate text-[9px] font-medium px-1 py-0.2 rounded-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
                      >
                        {t.title}
                      </div>
                    ))}
                    {totalCount > 2 && (
                      <span className="text-[9px] text-neutral-400 block tabular-nums">
                        +{totalCount - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Date Detail Panel (1 Col) */}
        <div className="bg-white dark:bg-[#121A15] border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs text-xs space-y-4">
          <div className="border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <span className="text-neutral-400 font-semibold block text-[11px] uppercase tracking-wider">
              Selected Day
            </span>
            <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100 mt-0.5">
              {formatDate(selectedDate)}
            </h3>
          </div>

          {selectedDateEvents.projects.length === 0 &&
          selectedDateEvents.tasks.length === 0 ? (
            <p className="text-neutral-400 py-8 text-center italic">
              No milestones or tasks scheduled for this date.
            </p>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {/* Projects */}
              {selectedDateEvents.projects.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    Project Deadlines ({selectedDateEvents.projects.length})
                  </span>
                  {selectedDateEvents.projects.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => onSelectProject(p.id)}
                      className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-[#0B5D3B] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Folder className="w-4 h-4 text-[#0B5D3B]" />
                        <span className="font-bold text-neutral-900 dark:text-white">
                          {p.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-1">
                        Status: {p.status} · Priority: {p.priority}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Tasks */}
              {selectedDateEvents.tasks.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    Task Deadlines ({selectedDateEvents.tasks.length})
                  </span>
                  {selectedDateEvents.tasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => onSelectTask(t)}
                      className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-[#D9A400] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <CheckSquare className="w-4 h-4 text-[#D9A400]" />
                        <span className="font-bold text-neutral-900 dark:text-white">
                          {t.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-1">
                        {t.project?.name} · {t.status}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
