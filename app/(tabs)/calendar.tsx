import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAppointments } from '@/context/AppointmentContext';
import { useAppTheme } from '@/context/ThemeContext';
import { useResponsive } from '@/hooks/use-responsive';
import React from 'react';
import { Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function CalendarScreen() {
    const { colors, isDark } = useAppTheme();
    const { appointments } = useAppointments();
    const [expandedDay, setExpandedDay] = React.useState<string | null>(() => {
        const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const today = days[new Date().getDay()];
        return today === 'Domingo' ? null : today;
    });

    const r = useResponsive();

    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    const toggleDay = (day: string) => {
        setExpandedDay(expandedDay === day ? null : day);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            {/* Header */}
            <View style={[styles.header, { paddingHorizontal: r.screenPadding }]}>
                <View>
                    <ThemedText style={[styles.title, { color: colors.text, fontSize: r.fontXxl }]}>
                        Calendario
                    </ThemedText>
                    <ThemedText style={[styles.subtitle, { color: colors.textSecondary, fontSize: r.fontSm }]}>
                        Gestiona tus citas
                    </ThemedText>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingHorizontal: r.screenPadding, gap: r.spacing.sm + 2 }]}
                showsVerticalScrollIndicator={false}
            >
                {days.map((day) => {
                    const dayAppointments = appointments.filter(a => a.date === day);
                    const pendingCount = dayAppointments.filter(a => a.status === 'pending').length;
                    const isExpanded = expandedDay === day;

                    return (
                        <View key={day} style={styles.dayContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.dayHeader,
                                    {
                                        backgroundColor: colors.surface,
                                        borderColor: colors.border,
                                        padding: r.spacing.lg,
                                        borderRadius: r.radius.md,
                                    }
                                ]}
                                onPress={() => toggleDay(day)}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.dayHeaderLeft, { gap: r.spacing.sm + 2 }]}>
                                    <ThemedText style={[styles.dayName, { color: colors.text, fontSize: r.fontMd }]}>
                                        {day}
                                    </ThemedText>
                                    {pendingCount > 0 && (
                                        <View style={[styles.badge, { backgroundColor: colors.tintMuted, paddingHorizontal: r.spacing.sm, paddingVertical: r.spacing.xs }]}>
                                            <ThemedText style={[styles.badgeText, { color: colors.tint, fontSize: r.fontXs }]}>
                                                {pendingCount}
                                            </ThemedText>
                                        </View>
                                    )}
                                </View>
                                <IconSymbol
                                    name={isExpanded ? 'chevron.up' : 'chevron.down'}
                                    size={r.iconSmall}
                                    color={colors.textMuted}
                                />
                            </TouchableOpacity>

                            {isExpanded && (
                                <View style={[styles.dayContent, { borderColor: colors.border, paddingLeft: r.spacing.lg, marginLeft: r.screenPadding, gap: r.spacing.lg }]}>
                                    {dayAppointments.length > 0 ? (
                                        dayAppointments.map((apt) => (
                                            <View
                                                key={apt.id}
                                                style={[styles.appointmentRow, { opacity: apt.status === 'completed' ? 0.5 : 1, gap: r.spacing.md }]}
                                            >
                                                <View style={[styles.timeIndicator, { backgroundColor: colors.tint, width: r.moderateScale(3), borderRadius: r.moderateScale(2) }]} />
                                                <View style={styles.appointmentDetails}>
                                                    <ThemedText style={[styles.appointmentTime, { color: colors.tint, fontSize: r.fontXs }]}>
                                                        {apt.time} {apt.period}
                                                    </ThemedText>
                                                    <ThemedText
                                                        style={[
                                                            styles.appointmentClient,
                                                            {
                                                                color: colors.text,
                                                                textDecorationLine: apt.status === 'completed' ? 'line-through' : 'none',
                                                                fontSize: r.fontMd,
                                                            }
                                                        ]}
                                                    >
                                                        {apt.client}
                                                    </ThemedText>
                                                    <ThemedText style={[styles.appointmentService, { color: colors.textSecondary, fontSize: r.fontSm }]}>
                                                        {apt.service}
                                                    </ThemedText>
                                                </View>
                                                {apt.status === 'completed' && (
                                                    <IconSymbol name="checkmark.circle.fill" size={r.iconMedium - 2} color={colors.success} />
                                                )}
                                            </View>
                                        ))
                                    ) : (
                                        <ThemedText style={[styles.emptyText, { color: colors.textMuted, fontSize: r.fontSm }]}>
                                            Sin citas programadas
                                        </ThemedText>
                                    )}
                                </View>
                            )}
                        </View>
                    );
                })}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    header: {
        paddingTop: 16,
        paddingBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    modeButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    title: {
        fontWeight: '700',
        letterSpacing: -0.5,
        marginBottom: 2,
        lineHeight: 36,
        includeFontPadding: false,
    },
    subtitle: {
        fontWeight: '500',
        lineHeight: 20,
        includeFontPadding: false,
    },
    scrollContent: {
        paddingBottom: 40,
    },

    // Day Container
    dayContainer: {
        marginBottom: 2,
    },
    dayHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
    },
    dayHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dayName: {
        fontWeight: '600',
        lineHeight: 22,
        includeFontPadding: false,
    },
    badge: {
        borderRadius: 6,
    },
    badgeText: {
        fontWeight: '700',
        lineHeight: 16,
        includeFontPadding: false,
    },

    // Day Content
    dayContent: {
        marginTop: 2,
        paddingTop: 12,
        paddingBottom: 8,
        borderLeftWidth: 2,
    },

    // Appointment Row
    appointmentRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    timeIndicator: {
        height: '100%',
        minHeight: 40,
    },
    appointmentDetails: {
        flex: 1,
        gap: 2,
    },
    appointmentTime: {
        fontWeight: '600',
        lineHeight: 16,
        includeFontPadding: false,
    },
    appointmentClient: {
        fontWeight: '600',
        lineHeight: 20,
        includeFontPadding: false,
    },
    appointmentService: {
        lineHeight: 18,
        includeFontPadding: false,
    },
    emptyText: {
        fontStyle: 'italic',
        paddingVertical: 8,
        lineHeight: 18,
        includeFontPadding: false,
    },
});
