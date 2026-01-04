'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  AlertTriangle,
  Bell,
  FileText,
  Briefcase,
  Users,
  Gavel,
  Filter,
  CheckCircle,
  Circle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Locale } from '@/i18n';

const translations = {
  en: {
    title: 'Legal Calendar',
    subtitle: 'Track deadlines, hearings, and important dates',
    today: 'Today',
    addEvent: 'Add Event',
    upcoming: 'Upcoming',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    overdue: 'Overdue',
    filters: 'Filters',
    allTypes: 'All Types',
    deadlines: 'Deadlines',
    hearings: 'Court Hearings',
    consultations: 'Consultations',
    signatures: 'Signatures',
    compliance: 'Compliance',
    reminders: 'Reminders',
    noEvents: 'No events on this day',
    markComplete: 'Mark Complete',
    setReminder: 'Set Reminder',
    eventTitle: 'Event Title',
    eventType: 'Event Type',
    eventDate: 'Date',
    eventTime: 'Time',
    eventDescription: 'Description',
    relatedCase: 'Related Case',
    reminderBefore: 'Remind me',
    save: 'Save Event',
    cancel: 'Cancel',
    days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    reminderOptions: {
      '15min': '15 minutes before',
      '1hour': '1 hour before',
      '1day': '1 day before',
      '1week': '1 week before',
    },
    priority: {
      high: 'High Priority',
      medium: 'Medium',
      low: 'Low',
    },
  },
  ar: {
    title: 'التقويم القانوني',
    subtitle: 'تتبع المواعيد النهائية والجلسات والتواريخ المهمة',
    today: 'اليوم',
    addEvent: 'إضافة حدث',
    upcoming: 'القادمة',
    thisWeek: 'هذا الأسبوع',
    thisMonth: 'هذا الشهر',
    overdue: 'متأخرة',
    filters: 'تصفية',
    allTypes: 'جميع الأنواع',
    deadlines: 'المواعيد النهائية',
    hearings: 'جلسات المحكمة',
    consultations: 'الاستشارات',
    signatures: 'التوقيعات',
    compliance: 'الامتثال',
    reminders: 'التذكيرات',
    noEvents: 'لا توجد أحداث في هذا اليوم',
    markComplete: 'وضع علامة مكتمل',
    setReminder: 'تعيين تذكير',
    eventTitle: 'عنوان الحدث',
    eventType: 'نوع الحدث',
    eventDate: 'التاريخ',
    eventTime: 'الوقت',
    eventDescription: 'الوصف',
    relatedCase: 'القضية المرتبطة',
    reminderBefore: 'ذكرني',
    save: 'حفظ الحدث',
    cancel: 'إلغاء',
    days: ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'],
    months: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
    reminderOptions: {
      '15min': 'قبل 15 دقيقة',
      '1hour': 'قبل ساعة',
      '1day': 'قبل يوم',
      '1week': 'قبل أسبوع',
    },
    priority: {
      high: 'أولوية عالية',
      medium: 'متوسطة',
      low: 'منخفضة',
    },
  },
};

interface CalendarEvent {
  id: string;
  title: string;
  type: 'deadline' | 'hearing' | 'consultation' | 'signature' | 'compliance' | 'reminder';
  date: string;
  time?: string;
  description?: string;
  caseId?: string;
  caseName?: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}

// Mock events data
const mockEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Contract Review Deadline',
    type: 'deadline',
    date: '2026-01-06',
    time: '17:00',
    description: 'Final review of employment contract for ABC Corp',
    caseId: 'case-1',
    caseName: 'ABC Corp Employment Matter',
    priority: 'high',
    completed: false,
  },
  {
    id: '2',
    title: 'Court Hearing - Civil Case',
    type: 'hearing',
    date: '2026-01-08',
    time: '09:30',
    description: 'Initial hearing at Dubai Courts',
    caseId: 'case-2',
    caseName: 'Smith vs. Johnson',
    priority: 'high',
    completed: false,
  },
  {
    id: '3',
    title: 'Consultation with Client',
    type: 'consultation',
    date: '2026-01-07',
    time: '14:00',
    description: 'Video consultation regarding property dispute',
    priority: 'medium',
    completed: false,
  },
  {
    id: '4',
    title: 'NDA Signature Required',
    type: 'signature',
    date: '2026-01-05',
    priority: 'high',
    completed: false,
  },
  {
    id: '5',
    title: 'Trade License Renewal',
    type: 'compliance',
    date: '2026-01-15',
    description: 'Annual trade license renewal deadline',
    priority: 'medium',
    completed: false,
  },
  {
    id: '6',
    title: 'Follow up on Case #1234',
    type: 'reminder',
    date: '2026-01-10',
    priority: 'low',
    completed: false,
  },
  {
    id: '7',
    title: 'Response Filing Deadline',
    type: 'deadline',
    date: '2026-01-04',
    time: '23:59',
    description: 'File response to opposition motion',
    priority: 'high',
    completed: true,
  },
];

const eventTypeConfig = {
  deadline: { icon: Clock, color: 'bg-red-100 text-red-700 border-red-200' },
  hearing: { icon: Gavel, color: 'bg-purple-100 text-purple-700 border-purple-200' },
  consultation: { icon: Users, color: 'bg-blue-100 text-blue-700 border-blue-200' },
  signature: { icon: FileText, color: 'bg-orange-100 text-orange-700 border-orange-200' },
  compliance: { icon: AlertTriangle, color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  reminder: { icon: Bell, color: 'bg-gray-100 text-gray-700 border-gray-200' },
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function CalendarPage() {
  const params = useParams();
  const locale = (params?.locale as Locale) || 'en';
  const isArabic = locale === 'ar';
  const t = translations[locale as keyof typeof translations] || translations.en;

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>(mockEvents);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = new Date().toISOString().split('T')[0];

  const filteredEvents = useMemo(() => {
    if (typeFilter === 'all') return events;
    return events.filter(e => e.type === typeFilter);
  }, [events, typeFilter]);

  const getEventsForDate = (date: string) => {
    return filteredEvents.filter(e => e.date === date);
  };

  const upcomingEvents = useMemo(() => {
    return filteredEvents
      .filter(e => e.date >= today && !e.completed)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5);
  }, [filteredEvents, today]);

  const overdueEvents = useMemo(() => {
    return filteredEvents
      .filter(e => e.date < today && !e.completed)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [filteredEvents, today]);

  const navigateMonth = (delta: number) => {
    setCurrentDate(new Date(year, month + delta, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(today);
  };

  const toggleEventComplete = (eventId: string) => {
    setEvents(prev =>
      prev.map(e => (e.id === eventId ? { ...e, completed: !e.completed } : e))
    );
  };

  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  }, [firstDay, daysInMonth]);

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <div className="min-h-screen bg-muted/30 py-8" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <CalendarIcon className="h-7 w-7 text-primary" />
              {t.title}
            </h1>
            <p className="text-muted-foreground mt-1">{t.subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={goToToday}>
              {t.today}
            </Button>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {t.addEvent}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t.addEvent}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label>{t.eventTitle}</Label>
                    <Input className="mt-1.5" placeholder="Enter event title" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{t.eventType}</Label>
                      <Select defaultValue="deadline">
                        <SelectTrigger className="mt-1.5">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="deadline">{t.deadlines}</SelectItem>
                          <SelectItem value="hearing">{t.hearings}</SelectItem>
                          <SelectItem value="consultation">{t.consultations}</SelectItem>
                          <SelectItem value="signature">{t.signatures}</SelectItem>
                          <SelectItem value="compliance">{t.compliance}</SelectItem>
                          <SelectItem value="reminder">{t.reminders}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>{t.eventDate}</Label>
                      <Input type="date" className="mt-1.5" />
                    </div>
                  </div>
                  <div>
                    <Label>{t.eventTime}</Label>
                    <Input type="time" className="mt-1.5" />
                  </div>
                  <div>
                    <Label>{t.eventDescription}</Label>
                    <Textarea className="mt-1.5" placeholder="Add description..." rows={3} />
                  </div>
                  <div>
                    <Label>{t.reminderBefore}</Label>
                    <Select defaultValue="1day">
                      <SelectTrigger className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15min">{t.reminderOptions['15min']}</SelectItem>
                        <SelectItem value="1hour">{t.reminderOptions['1hour']}</SelectItem>
                        <SelectItem value="1day">{t.reminderOptions['1day']}</SelectItem>
                        <SelectItem value="1week">{t.reminderOptions['1week']}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                      {t.cancel}
                    </Button>
                    <Button onClick={() => setShowAddDialog(false)}>
                      {t.save}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigateMonth(-1)}>
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <h2 className="text-xl font-semibold">
                      {t.months[month]} {year}
                    </h2>
                    <Button variant="ghost" size="icon" onClick={() => navigateMonth(1)}>
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[150px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t.allTypes}</SelectItem>
                      <SelectItem value="deadline">{t.deadlines}</SelectItem>
                      <SelectItem value="hearing">{t.hearings}</SelectItem>
                      <SelectItem value="consultation">{t.consultations}</SelectItem>
                      <SelectItem value="signature">{t.signatures}</SelectItem>
                      <SelectItem value="compliance">{t.compliance}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {t.days.map((day) => (
                    <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, index) => {
                    if (day === null) {
                      return <div key={`empty-${index}`} className="h-24" />;
                    }

                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const dayEvents = getEventsForDate(dateStr);
                    const isToday = dateStr === today;
                    const isSelected = dateStr === selectedDate;
                    const hasHighPriority = dayEvents.some(e => e.priority === 'high' && !e.completed);

                    return (
                      <button
                        key={day}
                        onClick={() => setSelectedDate(dateStr)}
                        className={`h-24 p-1 border rounded-lg text-left transition-colors ${
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : isToday
                            ? 'border-primary/50 bg-primary/5'
                            : 'border-transparent hover:border-muted-foreground/30'
                        }`}
                      >
                        <div className={`text-sm font-medium mb-1 ${isToday ? 'text-primary' : ''}`}>
                          {day}
                          {hasHighPriority && (
                            <span className="inline-block w-2 h-2 bg-red-500 rounded-full ml-1" />
                          )}
                        </div>
                        <div className="space-y-0.5 overflow-hidden">
                          {dayEvents.slice(0, 2).map((event) => {
                            const config = eventTypeConfig[event.type];
                            return (
                              <div
                                key={event.id}
                                className={`text-xs px-1 py-0.5 rounded truncate ${config.color} ${
                                  event.completed ? 'opacity-50 line-through' : ''
                                }`}
                              >
                                {event.title}
                              </div>
                            );
                          })}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-muted-foreground px-1">
                              +{dayEvents.length - 2} more
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Selected Day Events */}
            {selectedDate && (
              <Card className="mt-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">
                    {new Date(selectedDate + 'T00:00:00').toLocaleDateString(locale, {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedDateEvents.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">{t.noEvents}</p>
                  ) : (
                    <div className="space-y-3">
                      {selectedDateEvents.map((event) => {
                        const config = eventTypeConfig[event.type];
                        const Icon = config.icon;
                        return (
                          <div
                            key={event.id}
                            className={`p-4 rounded-lg border ${event.completed ? 'opacity-60' : ''}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg ${config.color}`}>
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className={`font-medium ${event.completed ? 'line-through' : ''}`}>
                                    {event.title}
                                  </h4>
                                  {event.priority === 'high' && !event.completed && (
                                    <Badge variant="destructive" className="text-xs">
                                      {t.priority.high}
                                    </Badge>
                                  )}
                                </div>
                                {event.time && (
                                  <p className="text-sm text-muted-foreground">{event.time}</p>
                                )}
                                {event.description && (
                                  <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                                )}
                                {event.caseName && (
                                  <Link
                                    href={`/${locale}/dashboard/cases/${event.caseId}`}
                                    className="text-sm text-primary hover:underline mt-1 inline-block"
                                  >
                                    {event.caseName}
                                  </Link>
                                )}
                              </div>
                              <Checkbox
                                checked={event.completed}
                                onCheckedChange={() => toggleEventComplete(event.id)}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Overdue */}
            {overdueEvents.length > 0 && (
              <Card className="border-red-200 bg-red-50/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2 text-red-700">
                    <AlertTriangle className="h-5 w-5" />
                    {t.overdue} ({overdueEvents.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {overdueEvents.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between p-2 bg-white rounded border border-red-200"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{event.title}</p>
                          <p className="text-xs text-red-600">
                            {new Date(event.date).toLocaleDateString()}
                          </p>
                        </div>
                        <Checkbox
                          checked={event.completed}
                          onCheckedChange={() => toggleEventComplete(event.id)}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Upcoming */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  {t.upcoming}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingEvents.map((event) => {
                    const config = eventTypeConfig[event.type];
                    const Icon = config.icon;
                    return (
                      <div
                        key={event.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                        onClick={() => setSelectedDate(event.date)}
                      >
                        <div className={`p-1.5 rounded ${config.color}`}>
                          <Icon className="h-3 w-3" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{event.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(event.date).toLocaleDateString(locale, {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                            {event.time && ` • ${event.time}`}
                          </p>
                        </div>
                        {event.priority === 'high' && (
                          <div className="w-2 h-2 bg-red-500 rounded-full" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Legend */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">{t.filters}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(eventTypeConfig).map(([type, config]) => {
                    const Icon = config.icon;
                    const label = t[type as keyof typeof t] || type;
                    return (
                      <button
                        key={type}
                        onClick={() => setTypeFilter(typeFilter === type ? 'all' : type)}
                        className={`flex items-center gap-2 w-full p-2 rounded-lg transition-colors ${
                          typeFilter === type ? 'bg-muted' : 'hover:bg-muted/50'
                        }`}
                      >
                        <div className={`p-1 rounded ${config.color}`}>
                          <Icon className="h-3 w-3" />
                        </div>
                        <span className="text-sm">{label as string}</span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
