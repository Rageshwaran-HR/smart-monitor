'use client';

import { useState, useEffect } from 'react';

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  location?: string;
}

// Hardcoded sample events
const getHardcodedEvents = (): CalendarEvent[] => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

  return [
    {
      id: '1',
      title: 'Team Meeting',
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 0),
      description: 'Weekly team sync meeting',
      location: 'Conference Room A'
    },
    {
      id: '2',
      title: 'Code Review',
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 30),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 15, 30),
      description: 'Review pull requests'
    },
    {
      id: '3',
      title: 'Project Planning',
      start: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 9, 0),
      end: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 10, 30),
      description: 'Plan next sprint tasks',
      location: 'Meeting Room B'
    },
    {
      id: '4',
      title: 'Client Presentation',
      start: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 16, 0),
      end: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 17, 0),
      description: 'Present project progress to client',
      location: 'Virtual Meeting'
    },
    {
      id: '5',
      title: 'Workshop: React Best Practices',
      start: new Date(nextWeek.getFullYear(), nextWeek.getMonth(), nextWeek.getDate(), 13, 0),
      end: new Date(nextWeek.getFullYear(), nextWeek.getMonth(), nextWeek.getDate(), 16, 0),
      description: 'Learning session on React patterns',
      location: 'Training Room'
    },
    {
      id: '6',
      title: 'Design Review',
      start: new Date(dayAfterTomorrow.getFullYear(), dayAfterTomorrow.getMonth(), dayAfterTomorrow.getDate(), 11, 0),
      end: new Date(dayAfterTomorrow.getFullYear(), dayAfterTomorrow.getMonth(), dayAfterTomorrow.getDate(), 12, 0),
      description: 'Review UI/UX designs',
      location: 'Design Studio'
    },
    {
      id: '7',
      title: 'Lunch & Learn',
      start: new Date(dayAfterTomorrow.getFullYear(), dayAfterTomorrow.getMonth(), dayAfterTomorrow.getDate(), 12, 30),
      end: new Date(dayAfterTomorrow.getFullYear(), dayAfterTomorrow.getMonth(), dayAfterTomorrow.getDate(), 13, 30),
      description: 'Tech talk on new frameworks',
      location: 'Cafeteria'
    }
  ];
};

export function GoogleCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  // Load hardcoded events on component mount
  useEffect(() => {
    setEvents(getHardcodedEvents());
  }, []);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-6"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayEvents = getEventsForDate(date);
      const isSelected = selectedDate.toDateString() === date.toDateString();
      const isToday = new Date().toDateString() === date.toDateString();

      days.push(
        <div
          key={day}
          onClick={() => setSelectedDate(date)}
          className={`
            h-6 w-6 flex items-center justify-center text-xs cursor-pointer rounded transition-all relative
            ${isSelected ? 'bg-blue-500 text-white' : ''}
            ${isToday && !isSelected ? 'bg-blue-400/20 text-blue-300 ring-1 ring-blue-400' : ''}
            ${!isSelected && !isToday ? 'text-white/80 hover:bg-white/10' : ''}
            ${dayEvents.length > 0 ? 'font-semibold' : ''}
          `}
        >
          {day}
          {dayEvents.length > 0 && (
            <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-green-400 rounded-full transform translate-x-0.5 translate-y-0.5"></div>
          )}
        </div>
      );
    }

    return days;
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const selectedDateEvents = getEventsForDate(selectedDate);

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className="bg-black/40 backdrop-blur-md rounded-lg p-3 border border-white/20 w-60">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="text-white text-xs font-medium">Calendar</div>
          <div className="text-green-400 text-xs">Demo</div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={prevMonth}
            className="text-white/70 hover:text-white p-1 rounded hover:bg-white/10 transition-all"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h4 className="text-white font-medium text-xs">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h4>
          <button
            onClick={nextMonth}
            className="text-white/70 hover:text-white p-1 rounded hover:bg-white/10 transition-all"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Day Labels */}
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {dayNames.map(day => (
            <div key={day} className="text-white/60 text-xs text-center py-0.5 font-medium">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-0.5 mb-3">
          {renderCalendarDays()}
        </div>

        {/* Selected Date Events */}
        {selectedDateEvents.length > 0 && (
          <div className="border-t border-white/20 pt-3">
            <div className="text-white/90 text-xs font-medium mb-2">
              {selectedDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              })}
            </div>
            <div className="space-y-1 overflow-hidden">
              {selectedDateEvents.slice(0, 2).map(event => (
                <div key={event.id} className="bg-white/10 rounded-md p-1.5">
                  <div className="text-white text-xs font-medium truncate">{event.title}</div>
                  <div className="text-white/70 text-xs">
                    {formatTime(event.start)}
                    {event.location && (
                      <span className="ml-1 text-white/50">📍</span>
                    )}
                  </div>
                </div>
              ))}
              {selectedDateEvents.length > 2 && (
                <div className="text-white/60 text-xs text-center py-1">
                  +{selectedDateEvents.length - 2} more
                </div>
              )}
            </div>
          </div>
        )}

        {/* No events message */}
        {selectedDateEvents.length === 0 && (
          <div className="border-t border-white/20 pt-3">
            <div className="text-white/90 text-xs font-medium mb-2">
              {selectedDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              })}
            </div>
            <div className="text-white/60 text-xs text-center py-2">
              No events scheduled
            </div>
          </div>
        )}

        {/* Info footer */}
        <div className="border-t border-white/20 pt-2 mt-2">
          <div className="text-white/50 text-xs text-center">
            Sample events for demo
          </div>
        </div>
      </div>
    </div>
  );
}
