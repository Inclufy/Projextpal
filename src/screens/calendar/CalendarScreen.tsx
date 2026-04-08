import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { calendarService, CalendarEvent } from '../../services/calendarService';

const DAYS_NL = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];
const DAYS_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS_NL = ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'];
const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const CalendarScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { isNL } = useLanguage();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const months = isNL ? MONTHS_NL : MONTHS_EN;
  const days = isNL ? DAYS_NL : DAYS_EN;

  useEffect(() => { loadEvents(); }, [month, year]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await calendarService.getEvents(month + 1, year);
      setEvents(data);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  }, [month, year]);

  const changeMonth = (delta: number) => {
    const d = new Date(year, month + delta, 1);
    setCurrentDate(d);
    setSelectedDate(null);
  };

  const getDaysInMonth = () => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const offset = firstDay === 0 ? 6 : firstDay - 1; // Monday start
    const cells: (number | null)[] = [];
    for (let i = 0; i < offset; i++) cells.push(null);
    for (let i = 1; i <= daysInMonth; i++) cells.push(i);
    return cells;
  };

  const getEventsForDate = (dateStr: string) => events.filter(e => e.date?.startsWith(dateStr));
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#A855F7', '#C084FC']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>{isNL ? 'Kalender' : 'Calendar'}</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#A855F7']} />}
      >
        {/* Month Navigation */}
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={() => changeMonth(-1)}><Ionicons name="chevron-back" size={24} color="#1F2937" /></TouchableOpacity>
          <Text style={styles.monthLabel}>{months[month]} {year}</Text>
          <TouchableOpacity onPress={() => changeMonth(1)}><Ionicons name="chevron-forward" size={24} color="#1F2937" /></TouchableOpacity>
        </View>

        {/* Day Headers */}
        <View style={styles.dayHeaders}>
          {days.map(d => <Text key={d} style={styles.dayHeader}>{d}</Text>)}
        </View>

        {/* Calendar Grid */}
        {loading ? (
          <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#A855F7" /></View>
        ) : (
          <View style={styles.grid}>
            {getDaysInMonth().map((day, i) => {
              if (day === null) return <View key={`e${i}`} style={styles.cell} />;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const hasEvents = events.some(e => e.date?.startsWith(dateStr));
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDate;
              return (
                <TouchableOpacity key={dateStr} style={[styles.cell, isToday && styles.cellToday, isSelected && styles.cellSelected]} onPress={() => setSelectedDate(dateStr)}>
                  <Text style={[styles.cellText, isToday && styles.cellTextToday, isSelected && styles.cellTextSelected]}>{day}</Text>
                  {hasEvents && <View style={styles.eventDot} />}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Events for Selected Date */}
        {selectedDate && (
          <View style={styles.eventsSection}>
            <Text style={styles.eventsTitle}>
              {selectedEvents.length > 0
                ? `${selectedEvents.length} ${isNL ? 'evenement(en)' : 'event(s)'}`
                : (isNL ? 'Geen evenementen' : 'No events')}
            </Text>
            {selectedEvents.map(event => (
              <View key={event.id} style={styles.eventCard}>
                <View style={[styles.eventColor, { backgroundColor: event.color || '#8B5CF6' }]} />
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  {event.project_name && <Text style={styles.eventProject}>{event.project_name}</Text>}
                </View>
                <View style={styles.eventTypeBadge}>
                  <Text style={styles.eventTypeText}>{event.type}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' },
  backButton: { marginRight: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: 'white', flex: 1 },
  content: { flex: 1 },
  monthNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16 },
  monthLabel: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  dayHeaders: { flexDirection: 'row', paddingHorizontal: 16 },
  dayHeader: { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: '600', color: '#9CA3AF', paddingBottom: 8 },
  loadingContainer: { padding: 40, alignItems: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16 },
  cell: { width: '14.28%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  cellToday: { backgroundColor: '#F3E8FF', borderRadius: 20 },
  cellSelected: { backgroundColor: '#A855F7', borderRadius: 20 },
  cellText: { fontSize: 14, color: '#374151', fontWeight: '500' },
  cellTextToday: { color: '#A855F7', fontWeight: 'bold' },
  cellTextSelected: { color: 'white', fontWeight: 'bold' },
  eventDot: { position: 'absolute', bottom: 4, width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#A855F7' },
  eventsSection: { paddingHorizontal: 20, marginTop: 16 },
  eventsTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 12 },
  eventCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 12, padding: 14, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  eventColor: { width: 4, height: 32, borderRadius: 2, marginRight: 12 },
  eventInfo: { flex: 1 },
  eventTitle: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  eventProject: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  eventTypeBadge: { backgroundColor: '#F3E8FF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  eventTypeText: { fontSize: 10, color: '#7C3AED', fontWeight: '600' },
});

export default CalendarScreen;
