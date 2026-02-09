import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAppointments } from '@/context/AppointmentContext';
import { useAppTheme } from '@/context/ThemeContext';
import { useResponsive } from '@/hooks/use-responsive';
import { Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

export default function RevenueScreen() {
    const { colors, isDark } = useAppTheme();
    const { appointments } = useAppointments();
    const r = useResponsive();

    // Calculate earnings per day
    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const dayMap: Record<string, number> = { 'Lunes': 0, 'Martes': 1, 'Miércoles': 2, 'Jueves': 3, 'Viernes': 4, 'Sábado': 5 };
    const earningsPerDay = [0, 0, 0, 0, 0, 0];

    appointments.forEach(apt => {
        let price = 0;
        if (apt.service.includes('Adulto')) price = 250;
        else if (apt.service.includes('Niño')) price = 150;
        else if (apt.service.includes('Barba')) price = 150;
        else price = 200;

        const dayIndex = dayMap[apt.date];
        if (dayIndex !== undefined) {
            earningsPerDay[dayIndex] += price;
        }
    });

    const weeklyData = {
        labels: ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'],
        datasets: [{ data: earningsPerDay.map(e => e || 0) }],
    };

    const totalEarnings = earningsPerDay.reduce((a, b) => a + b, 0);
    const maxEarnings = Math.max(...earningsPerDay);
    const busiestDayIndex = earningsPerDay.indexOf(maxEarnings);
    const busiestDay = days[busiestDayIndex];
    const totalAppointments = appointments.length;
    const completedAppointments = appointments.filter(a => a.status === 'completed').length;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            {/* Header */}
            <View style={[styles.header, { paddingHorizontal: r.screenPadding }]}>
                <ThemedText style={[styles.title, { color: colors.text, fontSize: r.fontXxl }]}>
                    Ganancias
                </ThemedText>
                <ThemedText style={[styles.subtitle, { color: colors.textSecondary, fontSize: r.fontSm }]}>
                    Resumen semanal
                </ThemedText>
            </View>

            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingHorizontal: r.screenPadding, gap: r.spacing.xl }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Main Revenue Card */}
                <View style={[styles.mainCard, { backgroundColor: colors.tint, borderRadius: r.radius.xl, padding: r.spacing.xxl }]}>
                    <ThemedText style={[styles.mainCardLabel, { fontSize: r.fontSm }]}>Total de la semana</ThemedText>
                    <ThemedText style={[styles.mainCardAmount, { fontSize: r.moderateScale(40) }]}>${totalEarnings.toLocaleString()}</ThemedText>
                    <View style={[styles.mainCardFooter, { gap: r.spacing.lg, marginTop: r.spacing.sm }]}>
                        <View style={[styles.mainCardStat, { gap: r.spacing.xs + 2 }]}>
                            <IconSymbol name="calendar" size={r.iconSmall - 2} color="rgba(255,255,255,0.8)" />
                            <ThemedText style={[styles.mainCardStatText, { fontSize: r.fontSm }]}>
                                {totalAppointments} citas
                            </ThemedText>
                        </View>
                        <View style={[styles.mainCardStat, { gap: r.spacing.xs + 2 }]}>
                            <IconSymbol name="checkmark.circle" size={r.iconSmall - 2} color="rgba(255,255,255,0.8)" />
                            <ThemedText style={[styles.mainCardStatText, { fontSize: r.fontSm }]}>
                                {completedAppointments} completadas
                            </ThemedText>
                        </View>
                    </View>
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
                            Mayor ingreso
                        </ThemedText>
                        <ThemedText style={[styles.statValue, { color: colors.text, fontSize: r.fontLg }]}>
                            ${maxEarnings}
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

    // Main Card
    mainCard: {
        gap: 8,
    },
    mainCardLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '500',
        lineHeight: 20,
        includeFontPadding: false,
    },
    mainCardAmount: {
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: -1,
        lineHeight: 48,
        includeFontPadding: false,
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
        lineHeight: 18,
        includeFontPadding: false,
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
        lineHeight: 16,
        includeFontPadding: false,
    },
    statValue: {
        fontWeight: '700',
        lineHeight: 24,
        includeFontPadding: false,
    },

    // Chart Section
    chartSection: {},
    sectionTitle: {
        fontWeight: '600',
        lineHeight: 22,
        includeFontPadding: false,
    },
    chartCard: {
        borderWidth: 1,
    },
    chart: {
        marginLeft: -16,
        borderRadius: 16,
    },
});
