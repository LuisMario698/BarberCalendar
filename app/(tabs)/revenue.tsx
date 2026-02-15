import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAppointments } from '@/context/AppointmentContext';
import { useAppTheme } from '@/context/ThemeContext';
import { useResponsive } from '@/hooks/use-responsive';
import React, { useMemo, useState } from 'react';
import { Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

export default function RevenueScreen() {
    const { colors, isDark } = useAppTheme();
    const { appointments } = useAppointments();
    const r = useResponsive();

    const [weekOffset, setWeekOffset] = useState(0);

    // Calculate Week Dates
    const { weekStart, weekEnd, weekLabel } = useMemo(() => {
        const now = new Date();
        // Adjust to previous Monday
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1) + (weekOffset * 7); // Monday

        const start = new Date(now.setDate(diff));
        start.setHours(0, 0, 0, 0);

        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);

        // Format Label
        const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
        const label = `${start.toLocaleDateString('es-ES', options)} - ${end.toLocaleDateString('es-ES', options)}`;

        return { weekStart: start, weekEnd: end, weekLabel: label };
    }, [weekOffset]);

    // Filter Earnings
    const { earningsPerDay, totalEarnings, completedAppointments, pendingAppointments, busiestDay, totalPending, avgPerAppointment } = useMemo(() => {
        const earnings = [0, 0, 0, 0, 0, 0, 0]; // Mon-Sun
        const pending = [0, 0, 0, 0, 0, 0, 0];
        let completed = 0;
        let pends = 0;

        const filtered = appointments.filter(apt => {
            if (!apt.isoDate) return false;
            const d = new Date(apt.isoDate + 'T00:00:00'); // Ensure local/consistent parsing
            return d >= weekStart && d <= weekEnd;
        });

        filtered.forEach(apt => {
            const d = new Date(apt.isoDate + 'T00:00:00');
            // getDay: 0=Sun, 1=Mon. Map to 0=Mon, 6=Sun
            let idx = d.getDay() - 1;
            if (idx === -1) idx = 6;

            if (apt.status === 'completed') {
                earnings[idx] += apt.price;
                completed++;
            } else {
                pending[idx] += apt.price;
                pends++;
            }
        });

        const totalEarn = earnings.reduce((a, b) => a + b, 0);
        const totalPend = pending.reduce((a, b) => a + b, 0);

        const maxE = Math.max(...earnings);
        const maxIdx = earnings.indexOf(maxE);
        const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
        const busyDay = maxE > 0 ? days[maxIdx] : '—';
        const avg = completed > 0 ? Math.round(totalEarn / completed) : 0;

        return {
            earningsPerDay: earnings,
            totalEarnings: totalEarn,
            completedAppointments: completed,
            pendingAppointments: pends,
            busiestDay: busyDay,
            totalPending: totalPend,
            avgPerAppointment: avg
        };
    }, [appointments, weekStart, weekEnd]);

    // Chart Data (Mon-Sun -> display Mon-Sat usually? Barber shop usually closed Sunday?)
    // User requested "diferentes semanas". Assuming Mon-Sat or Mon-Sun.
    // Let's show Mon-Sat for cleaner UI if Sunday is empty? Or all 7?
    // User schema had Sunday closed.
    const weeklyData = {
        labels: ['L', 'M', 'M', 'J', 'V', 'S'],
        datasets: [{ data: earningsPerDay.slice(0, 6) }], // Show Mon-Sat
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            {/* Header */}
            <View style={[styles.header, { paddingHorizontal: r.screenPadding }]}>
                <ThemedText style={[styles.title, { color: colors.text, fontSize: r.fontXxl }]}>
                    Ganancias
                </ThemedText>

                {/* Week Selector */}
                <View style={[styles.weekSelector, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: r.radius.lg }]}>
                    <TouchableOpacity onPress={() => setWeekOffset(p => p - 1)} style={styles.arrowButton}>
                        <IconSymbol name="chevron.left" size={20} color={colors.text} />
                    </TouchableOpacity>
                    <ThemedText style={[styles.weekLabel, { color: colors.text, fontSize: r.fontSm }]}>
                        {weekLabel}
                    </ThemedText>
                    <TouchableOpacity onPress={() => setWeekOffset(p => p + 1)} style={styles.arrowButton}>
                        <IconSymbol name="chevron.right" size={20} color={colors.text} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingHorizontal: r.screenPadding, gap: r.spacing.xl }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Main Revenue Card */}
                <View style={[styles.mainCard, { backgroundColor: colors.tint, borderRadius: r.radius.xl, padding: r.spacing.xxl }]}>
                    <ThemedText style={[styles.mainCardLabel, { fontSize: r.fontSm }]}>Ganado esta semana</ThemedText>
                    <ThemedText style={[styles.mainCardAmount, { fontSize: r.moderateScale(40) }]}>${totalEarnings.toLocaleString()}</ThemedText>
                    <View style={[styles.mainCardFooter, { gap: r.spacing.lg, marginTop: r.spacing.sm }]}>
                        <View style={[styles.mainCardStat, { gap: r.spacing.xs + 2 }]}>
                            <IconSymbol name="checkmark.circle" size={r.iconSmall - 2} color="rgba(255,255,255,0.8)" />
                            <ThemedText style={[styles.mainCardStatText, { fontSize: r.fontSm }]}>
                                {completedAppointments} completadas
                            </ThemedText>
                        </View>
                        <View style={[styles.mainCardStat, { gap: r.spacing.xs + 2 }]}>
                            <IconSymbol name="calendar" size={r.iconSmall - 2} color="rgba(255,255,255,0.8)" />
                            <ThemedText style={[styles.mainCardStatText, { fontSize: r.fontSm }]}>
                                {pendingAppointments} pendientes
                            </ThemedText>
                        </View>
                    </View>
                    {totalPending > 0 && (
                        <View style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: r.radius.md, padding: r.spacing.md, marginTop: r.spacing.md }}>
                            <ThemedText style={{ color: '#FFFFFF', fontSize: r.fontSm, fontWeight: '600' }}>
                                ${totalPending.toLocaleString()} por cobrar
                            </ThemedText>
                        </View>
                    )}
                </View>

                {/* Stats Row */}
                <View style={[styles.statsRow, { gap: r.spacing.md }]}>
                    <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border, padding: r.spacing.lg, borderRadius: r.radius.md + 2, gap: r.spacing.sm + 2 }]}>
                        <IconSymbol name="chart.line.uptrend.xyaxis" size={r.iconMedium} color={colors.tint} />
                        <ThemedText style={[styles.statLabel, { color: colors.textSecondary, fontSize: r.fontXs }]}>
                            Día más activo
                        </ThemedText>
                        <ThemedText style={[styles.statValue, { color: colors.text, fontSize: r.fontLg }]}>
                            {busiestDay}
                        </ThemedText>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border, padding: r.spacing.lg, borderRadius: r.radius.md + 2, gap: r.spacing.sm + 2 }]}>
                        <IconSymbol name="dollarsign.circle" size={r.iconMedium} color={colors.tint} />
                        <ThemedText style={[styles.statLabel, { color: colors.textSecondary, fontSize: r.fontXs }]}>
                            Promedio por cita
                        </ThemedText>
                        <ThemedText style={[styles.statValue, { color: colors.text, fontSize: r.fontLg }]}>
                            ${avgPerAppointment}
                        </ThemedText>
                    </View>
                </View>

                {/* Chart Section */}
                <View style={[styles.chartSection, { gap: r.spacing.md }]}>
                    <ThemedText style={[styles.sectionTitle, { color: colors.text, fontSize: r.fontMd }]}>
                        Tendencia semanal
                    </ThemedText>
                    <View style={[styles.chartCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: r.radius.lg, padding: r.spacing.lg }]}>
                        <LineChart
                            data={weeklyData}
                            width={r.screenWidth - (r.screenPadding * 2) - (r.spacing.lg * 2)}
                            height={r.verticalScale(180)}
                            chartConfig={{
                                backgroundColor: 'transparent',
                                backgroundGradientFrom: colors.surface,
                                backgroundGradientTo: colors.surface,
                                decimalPlaces: 0,
                                color: () => colors.tint,
                                labelColor: () => colors.textSecondary,
                                style: { borderRadius: 16 },
                                propsForDots: {
                                    r: String(r.moderateScale(5)),
                                    strokeWidth: '2',
                                    stroke: colors.tint,
                                    fill: colors.surface,
                                },
                                propsForBackgroundLines: {
                                    stroke: colors.border,
                                    strokeDasharray: '4',
                                },
                            }}
                            bezier
                            style={styles.chart}
                            withInnerLines={true}
                            withOuterLines={false}
                        />
                    </View>
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
    header: {
        paddingTop: 16,
        paddingBottom: 20,
        gap: 16,
    },
    title: {
        fontWeight: '700',
    },
    weekSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        paddingVertical: 8,
        borderWidth: 1,
    },
    arrowButton: {
        padding: 8,
    },
    weekLabel: {
        fontWeight: '600',
    },
    scrollContent: {
        paddingBottom: 40,
    },

    // Main Card
    mainCard: {
        gap: 8,
    },
    mainCardLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '500',
    },
    mainCardAmount: {
        fontWeight: '700',
        color: '#FFFFFF',
    },
    mainCardFooter: {
        flexDirection: 'row',
    },
    mainCardStat: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    mainCardStatText: {
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '500',
    },

    // Stats Row
    statsRow: {
        flexDirection: 'row',
    },
    statCard: {
        flex: 1,
        borderWidth: 1,
    },
    statLabel: {
        fontWeight: '500',
    },
    statValue: {
        fontWeight: '700',
    },

    // Chart Section
    chartSection: {},
    sectionTitle: {
        fontWeight: '600',
    },
    chartCard: {
        borderWidth: 1,
    },
    chart: {
        marginLeft: -16,
        borderRadius: 16,
    },
});
