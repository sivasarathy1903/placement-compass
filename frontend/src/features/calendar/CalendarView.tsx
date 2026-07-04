import React, { useEffect, useState, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventSourceInput } from '@fullcalendar/core';
import { 
  BriefcaseIcon, 
  CalendarDaysIcon, 
  ClockIcon 
} from '@heroicons/react/24/outline';
import { applicationService } from '../applications/applicationService';
import type { Application } from '../applications/applicationService';
import { STATUS_COLORS } from '../applications/types';
import './calendar.css';

// Map interview types to basic hex colors for the calendar
const ROUND_COLORS: Record<string, string> = {
  RESUME_SHORTLIST:  '#71717a', // zinc-500
  ONLINE_ASSESSMENT: '#06b6d4', // cyan-500
  APTITUDE_TEST:     '#8b5cf6', // violet-500
  GROUP_DISCUSSION:  '#f97316', // orange-500
  TECHNICAL:         '#4f46e5', // brand-600
  SYSTEM_DESIGN:     '#6366f1', // indigo-500
  MANAGERIAL:        '#f43f5e', // rose-500
  HR:                '#10b981', // emerald-500
  OTHER:             '#71717a', // zinc-500
};

const CalendarView: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const pages = await applicationService.getAll({ size: 500 });
        setApplications(pages.content);
      } catch (error) {
        console.error('Failed to load applications for calendar:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, []);

  const events = useMemo<EventSourceInput>(() => {
    const mappedEvents: any[] = [];

    applications.forEach(app => {
      // 1. Add Application Deadline / Next Action (All Day)
      if (app.nextActionDate) {
        mappedEvents.push({
          id: `app-${app.id}`,
          title: `Deadline: ${app.companyName}`,
          date: app.nextActionDate,
          allDay: true,
          backgroundColor: STATUS_COLORS[app.status]?.dot || '#a1a1aa', // Fallback color
          extendedProps: {
            type: 'deadline',
            company: app.companyName,
            role: app.role,
            status: app.status
          }
        });
      }

      // 2. Add Interview Rounds (Timed)
      if (app.rounds && app.rounds.length > 0) {
        app.rounds.forEach(round => {
          if (round.scheduledAt) {
            // End time defaults to +1 hour if duration is not provided
            const startDate = new Date(round.scheduledAt);
            const endDate = new Date(startDate.getTime() + (round.durationMinutes || 60) * 60000);

            mappedEvents.push({
              id: `round-${round.roundId}`,
              title: `${app.companyName} - ${round.type.replace('_', ' ')}`,
              start: startDate.toISOString(),
              end: endDate.toISOString(),
              allDay: false,
              backgroundColor: ROUND_COLORS[round.type] || '#71717a',
              extendedProps: {
                type: 'interview',
                company: app.companyName,
                roundType: round.type,
                interviewer: round.interviewer,
                platform: round.platform
              }
            });
          }
        });
      }
    });

    return mappedEvents;
  }, [applications]);

  // Custom Event Render
  const renderEventContent = (eventInfo: any) => {
    const { extendedProps } = eventInfo.event;
    
    if (extendedProps.type === 'deadline') {
      return (
        <div className="flex items-center gap-1 overflow-hidden px-1 py-0.5 text-[10px] sm:text-xs text-white" title={`${extendedProps.company} - ${extendedProps.role} (${extendedProps.status})`}>
          <BriefcaseIcon className="w-3 h-3 shrink-0" />
          <span className="font-semibold truncate">{extendedProps.company}</span>
        </div>
      );
    }
    
    if (extendedProps.type === 'interview') {
      return (
        <div className="flex flex-col gap-0.5 p-1 overflow-hidden text-[10px] sm:text-xs text-white leading-tight" title={`${extendedProps.company} - ${extendedProps.roundType}\nPlatform: ${extendedProps.platform || 'N/A'}\nInterviewer: ${extendedProps.interviewer || 'N/A'}`}>
          <div className="flex items-center gap-1 font-semibold truncate">
            <CalendarDaysIcon className="w-3 h-3 shrink-0" />
            <span className="truncate">{extendedProps.company}</span>
          </div>
          <div className="flex items-center gap-1 opacity-90 truncate">
            <ClockIcon className="w-3 h-3 shrink-0" />
            <span className="truncate">{eventInfo.timeText}</span>
          </div>
        </div>
      );
    }
    
    return <>{eventInfo.event.title}</>;
  };

  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
      {/* Header */}
      <header className="px-8 py-6 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Calendar</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Track upcoming application deadlines and scheduled interviews.
        </p>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden p-6 sm:p-8">
        <div className="h-full max-w-7xl mx-auto bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-4 sm:p-6 overflow-hidden">
          {loading ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
            </div>
          ) : (
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              events={events}
              eventContent={renderEventContent}
              height="100%"
              dayMaxEvents={3}
              eventDisplay="block"
              nowIndicator={true}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default CalendarView;
