import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useResponsive } from '@/hooks/use-responsive';
import { router } from 'expo-router';
import React from 'react';
import { ImageBackground, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';

import { useAppointments } from '@/context/AppointmentContext';
import { useAppTheme } from '@/context/ThemeContext';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const { colors, isDark } = useAppTheme();
  const { appointments, toggleStatus } = useAppointments();
  const [selectedDate, setSelectedDate] = React.useState('Lunes');
  const r = useResponsive();

  const filteredAppointments = appointments.filter(apt => apt.date === selectedDate);
  const nextAppointment = appointments.find(apt => apt.status === 'pending');

  const dates = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { padding: r.screenPadding }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { marginBottom: r.spacing.xxl }]}>
          <View>
            <ThemedText style={[styles.greeting, { color: colors.textSecondary, fontSize: r.fontSm }]}>
              Bienvenido
            </ThemedText>
            <ThemedText style={[styles.title, { color: colors.text, fontSize: r.fontXxl }]}>
              ANDRES
            </ThemedText>
          </View>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.tint, width: r.moderateScale(44), height: r.moderateScale(44), borderRadius: r.radius.md }]}
            onPress={() => router.push('/book')}
          >
            <IconSymbol name="plus" size={r.iconMedium} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Next Appointment Card */}
        {nextAppointment ? (
          <View
            style={[
              styles.featuredCard,
              {
                backgroundColor: '#000000',
                borderColor: colors.tint,
                borderWidth: 1,
                borderRadius: r.radius.xl,
                marginBottom: r.spacing.xxl,
                height: r.verticalScale(250),
                overflow: 'hidden',
              }
            ]}
          >
            {/* Logo Background */}
            <ImageBackground
              source={require('../../assets/logoBarber.png')}
              style={styles.bannerBackground}
              imageStyle={{ opacity: 0.85, resizeMode: 'cover' }}
            >
              {/* Gradient overlay for text readability */}
              <View style={styles.bannerGradient}>
                {/* Content */}
                <View style={styles.bannerContent}>
                  <View style={styles.bannerTop}>
                    <View style={[styles.statusBadge, { backgroundColor: colors.tint }]}>
                      <ThemedText style={{ color: '#000000', fontSize: r.fontXs, fontWeight: '700' }}>
                        PRÓXIMA CITA
                      </ThemedText>
                    </View>
                  </View>

                  <View style={styles.bannerBottom}>
                    <View>
                      <ThemedText style={[styles.bannerTime, { fontSize: r.moderateScale(36) }]}>
                        {nextAppointment.time} {nextAppointment.period}
                      </ThemedText>
                      <ThemedText style={[styles.bannerClient, { fontSize: r.fontMd }]}>
                        {nextAppointment.client}
                      </ThemedText>
                    </View>
                    <View style={[styles.bannerService, { backgroundColor: 'rgba(201, 162, 39, 0.2)', paddingHorizontal: r.spacing.md, paddingVertical: r.spacing.sm, borderRadius: r.radius.sm, borderWidth: 1, borderColor: colors.tint }]}>
                      <ThemedText style={{ color: colors.tint, fontSize: r.fontSm, fontWeight: '600' }}>
                        {nextAppointment.service}
                      </ThemedText>
                    </View>
                  </View>
                </View>
              </View>
            </ImageBackground>
          </View>
        ) : (
          <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border, padding: r.moderateScale(40), borderRadius: r.radius.xl, marginBottom: r.spacing.xxl }]}>
            <IconSymbol name="calendar" size={r.iconXLarge} color={colors.textMuted} />
            <ThemedText style={[styles.emptyText, { color: colors.textMuted, fontSize: r.fontMd }]}>
              No hay citas pendientes
            </ThemedText>
          </View>
        )}

        {/* Day Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.daySelector, { gap: r.spacing.sm + 2, marginBottom: r.spacing.xxl }]}
        >
          {dates.map((day) => {
            const isSelected = selectedDate === day;
            const dayCount = appointments.filter(a => a.date === day && a.status === 'pending').length;

            return (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayChip,
                  {
                    backgroundColor: isSelected ? colors.tint : colors.surface,
                    borderColor: isSelected ? colors.tint : colors.border,
                    paddingHorizontal: r.spacing.lg,
                    paddingVertical: r.spacing.sm + 2,
                    borderRadius: r.radius.md,
                  }
                ]}
                onPress={() => setSelectedDate(day)}
              >
                <ThemedText style={[styles.dayText, { color: isSelected ? '#FFFFFF' : colors.text, fontSize: r.fontSm }]}>
                  {day.slice(0, 3)}
                </ThemedText>
                {dayCount > 0 && (
                  <View style={[
                    styles.dayBadge,
                    {
                      backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : colors.tintMuted,
                      paddingHorizontal: r.spacing.xs + 2,
                      paddingVertical: r.spacing.xs / 2,
                      borderRadius: r.spacing.sm - 2,
                    }
                  ]}>
                    <ThemedText style={[styles.dayBadgeText, { color: isSelected ? '#FFFFFF' : colors.tint, fontSize: r.fontXs }]}>
                      {dayCount}
                    </ThemedText>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Appointments Section */}
        <View style={[styles.section, { gap: r.spacing.lg }]}>
          <View style={styles.sectionHeader}>
            <ThemedText style={[styles.sectionTitle, { color: colors.text, fontSize: r.fontLg }]}>
              Citas del {selectedDate}
            </ThemedText>
            <ThemedText style={[styles.sectionCount, { color: colors.textMuted, fontSize: r.fontSm }]}>
              {filteredAppointments.length} {filteredAppointments.length === 1 ? 'cita' : 'citas'}
            </ThemedText>
          </View>

          {filteredAppointments.length > 0 ? (
            <ScrollView
              style={{ maxHeight: r.verticalScale(300) }}
              contentContainerStyle={[styles.appointmentsList, { gap: r.spacing.sm + 2 }]}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
            >
              {filteredAppointments.map((apt) => (
                <View
                  key={apt.id}
                  style={[
                    styles.appointmentCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      opacity: apt.status === 'completed' ? 0.6 : 1,
                      padding: r.spacing.md + 2,
                      borderRadius: r.radius.md + 2,
                      gap: r.spacing.md + 2,
                    }
                  ]}
                >
                  <View style={[
                    styles.timeBlock,
                    {
                      backgroundColor: apt.status === 'completed' ? colors.success + '15' : colors.tintMuted,
                      width: r.moderateScale(54),
                      height: r.moderateScale(54),
                      borderRadius: r.radius.md,
                    }
                  ]}>
                    <ThemedText style={[styles.timeText, { color: apt.status === 'completed' ? colors.success : colors.tint, fontSize: r.fontMd }]}>
                      {apt.time}
                    </ThemedText>
                    <ThemedText style={[styles.periodText, { color: apt.status === 'completed' ? colors.success : colors.tint, fontSize: r.fontXs - 1 }]}>
                      {apt.period}
                    </ThemedText>
                  </View>

                  <View style={styles.appointmentInfo}>
                    <ThemedText
                      style={[
                        styles.clientName,
                        {
                          color: colors.text,
                          textDecorationLine: apt.status === 'completed' ? 'line-through' : 'none',
                          fontSize: r.fontMd,
                        }
                      ]}
                    >
                      {apt.client}
                    </ThemedText>
                    <ThemedText style={[styles.serviceName, { color: colors.textSecondary, fontSize: r.fontSm }]}>
                      {apt.service}
                    </ThemedText>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      {
                        backgroundColor: apt.status === 'pending' ? colors.tint : 'transparent',
                        borderColor: apt.status === 'pending' ? colors.tint : colors.border,
                        width: r.moderateScale(36),
                        height: r.moderateScale(36),
                        borderRadius: r.radius.sm + 2,
                      }
                    ]}
                    onPress={() => toggleStatus(apt.id)}
                  >
                    <IconSymbol
                      name={apt.status === 'pending' ? 'checkmark' : 'arrow.uturn.backward'}
                      size={r.iconSmall - 2}
                      color={apt.status === 'pending' ? '#FFFFFF' : colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border, padding: r.spacing.xxxl, borderRadius: r.radius.md + 2 }]}>
              <ThemedText style={[styles.emptyStateText, { color: colors.textMuted, fontSize: r.fontSm }]}>
                Sin citas para este día
              </ThemedText>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'visible',
  },
  greeting: {
    fontWeight: '500',
    marginBottom: 4,
    lineHeight: 20,
  },
  title: {
    fontWeight: '700',
    letterSpacing: -0.5,
    lineHeight: 36,
    includeFontPadding: false,
  },
  addButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Featured Card
  featuredCard: {
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  featuredHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  statusDot: {
    borderRadius: 4,
  },
  featuredLabel: {
    fontWeight: '500',
  },
  featuredContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  featuredInfo: {
    flex: 1,
  },
  featuredTime: {
    fontWeight: '700',
    letterSpacing: -1,
    marginBottom: 4,
  },
  featuredClient: {
    fontWeight: '500',
  },
  serviceChip: {},
  serviceChipText: {
    fontWeight: '600',
  },
  logoWatermark: {
    position: 'absolute',
    right: -20,
    top: -20,
    opacity: 0.08,
  },
  emptyCard: {
    borderWidth: 1,
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontWeight: '500',
  },

  // Day Selector
  daySelector: {
    paddingBottom: 4,
  },
  dayChip: {
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dayText: {
    fontWeight: '600',
    lineHeight: 18,
    includeFontPadding: false,
  },
  dayBadge: {
    minWidth: 20,
    alignItems: 'center',
  },
  dayBadgeText: {
    fontWeight: '700',
    lineHeight: 14,
    includeFontPadding: false,
  },

  // Section
  section: {},
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontWeight: '600',
    lineHeight: 24,
    includeFontPadding: false,
  },
  sectionCount: {
    fontWeight: '500',
    lineHeight: 18,
    includeFontPadding: false,
  },

  // Appointments List
  appointmentsList: {},
  appointmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  timeBlock: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeText: {
    fontWeight: '700',
    lineHeight: 20,
    includeFontPadding: false,
  },
  periodText: {
    fontWeight: '600',
    lineHeight: 14,
    includeFontPadding: false,
  },
  appointmentInfo: {
    flex: 1,
    gap: 2,
  },
  clientName: {
    fontWeight: '600',
    lineHeight: 20,
    includeFontPadding: false,
  },
  serviceName: {
    lineHeight: 18,
    includeFontPadding: false,
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },

  // Empty State
  emptyState: {
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyStateText: {
    fontWeight: '500',
  },

  // Banner Styles
  bannerBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  bannerGradient: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 28,
  },
  bannerContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  bannerTop: {
    alignItems: 'flex-start',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  bannerBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  bannerTime: {
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: -0.5,
    lineHeight: 44,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  bannerClient: {
    color: '#E0E0E0',
    fontWeight: '600',
    marginTop: 4,
    lineHeight: 22,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  bannerService: {},
});
