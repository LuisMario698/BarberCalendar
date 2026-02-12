import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAppointments } from '@/context/AppointmentContext';
import { useAppTheme } from '@/context/ThemeContext';
import { useResponsive } from '@/hooks/use-responsive';
import { useServices } from '@/hooks/use-services';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';



const timeSlots = [
    { time: '09:00', period: 'AM' },
    { time: '10:00', period: 'AM' },
    { time: '11:00', period: 'AM' },
    { time: '12:00', period: 'PM' },
    { time: '01:00', period: 'PM' },
    { time: '02:00', period: 'PM' },
    { time: '03:00', period: 'PM' },
    { time: '04:00', period: 'PM' },
    { time: '05:00', period: 'PM' },
    { time: '06:00', period: 'PM' },
    { time: '07:00', period: 'PM' },
    { time: '08:00', period: 'PM' },
];

const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export default function BookScreen() {
    const { colors, isDark } = useAppTheme();
    const { addAppointment } = useAppointments();
    const r = useResponsive();
    const { services } = useServices();

    const [selectedService, setSelectedService] = useState<number | null>(null);
    const [selectedDay, setSelectedDay] = useState<string>(days[0]);
    const [selectedTime, setSelectedTime] = useState<{ time: string; period: string } | null>(null);
    const [clientName, setClientName] = useState('');

    const handleSave = async () => {
        if (!selectedService || !selectedTime) return;

        const service = services.find(s => s.id === selectedService);

        try {
            const success = await addAppointment({
                date: selectedDay,
                time: selectedTime.time,
                period: selectedTime.period as 'AM' | 'PM',
                client: clientName.trim() || 'Cliente',
                service: service?.name || 'Servicio',
            });

            if (success) {
                router.back();
            } else {
                Alert.alert('Error', 'Ya existe una cita programada para este horario.');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'No se pudo guardar la cita.');
        }
    };

    const isValid = selectedService && selectedTime;

    // Calculate widths for grids
    const serviceCardWidth = (r.screenWidth - (r.screenPadding * 2) - r.spacing.sm - 2) / 2;
    const timeSlotWidth = (r.screenWidth - (r.screenPadding * 2) - ((r.spacing.sm + 2) * 2)) / 3;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            {/* Header */}
            <View style={[styles.header, { paddingHorizontal: r.screenPadding }]}>
                <TouchableOpacity
                    style={[styles.closeButton, { backgroundColor: colors.surface, width: r.moderateScale(36), height: r.moderateScale(36), borderRadius: r.radius.sm + 2 }]}
                    onPress={() => router.back()}
                >
                    <IconSymbol name="xmark" size={r.iconMedium - 2} color={colors.text} />
                </TouchableOpacity>
                <ThemedText style={[styles.title, { color: colors.text, fontSize: r.fontLg }]}>Nueva Cita</ThemedText>
                <View style={[styles.placeholder, { width: r.moderateScale(36) }]} />
            </View>

            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingHorizontal: r.screenPadding, gap: r.spacing.xxl + 4 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Client Name */}
                <View style={[styles.section, { gap: r.spacing.md }]}>
                    <ThemedText style={[styles.sectionTitle, { color: colors.text, fontSize: r.fontSm }]}>
                        NOMBRE DEL CLIENTE
                    </ThemedText>
                    <TextInput
                        style={[
                            styles.input,
                            {
                                backgroundColor: colors.surface,
                                borderColor: colors.border,
                                color: colors.text,
                                height: r.inputHeight,
                                borderRadius: r.radius.md,
                                paddingHorizontal: r.spacing.lg,
                                fontSize: r.fontMd,
                            }
                        ]}
                        placeholder="Ej: Juan Pérez"
                        placeholderTextColor={colors.textMuted}
                        value={clientName}
                        onChangeText={setClientName}
                    />
                </View>

                {/* Services */}
                <View style={[styles.section, { gap: r.spacing.md }]}>
                    <ThemedText style={[styles.sectionTitle, { color: colors.text, fontSize: r.fontSm }]}>
                        SERVICIO
                    </ThemedText>
                    <View style={[styles.servicesGrid, { gap: r.spacing.sm + 2 }]}>
                        {services.map((service) => {
                            const isSelected = selectedService === service.id;
                            return (
                                <TouchableOpacity
                                    key={service.id}
                                    style={[
                                        styles.serviceCard,
                                        {
                                            width: serviceCardWidth,
                                            backgroundColor: isSelected ? colors.tint : colors.surface,
                                            borderColor: isSelected ? colors.tint : colors.border,
                                            padding: r.spacing.lg,
                                            borderRadius: r.radius.md,
                                            gap: r.spacing.xs,
                                        }
                                    ]}
                                    onPress={() => setSelectedService(service.id)}
                                >
                                    <ThemedText style={[styles.serviceName, { color: isSelected ? '#FFFFFF' : colors.text, fontSize: r.fontMd }]}>
                                        {service.name}
                                    </ThemedText>
                                    <ThemedText style={[styles.servicePrice, { color: isSelected ? 'rgba(255,255,255,0.8)' : colors.textSecondary, fontSize: r.fontSm }]}>
                                        ${service.price}
                                    </ThemedText>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Day Selection */}
                <View style={[styles.section, { gap: r.spacing.md }]}>
                    <ThemedText style={[styles.sectionTitle, { color: colors.text, fontSize: r.fontSm }]}>
                        DÍA
                    </ThemedText>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={[styles.daysScroll, { gap: r.spacing.sm }]}
                    >
                        {days.map((day) => {
                            const isSelected = selectedDay === day;
                            return (
                                <TouchableOpacity
                                    key={day}
                                    style={[
                                        styles.dayChip,
                                        {
                                            backgroundColor: isSelected ? colors.tint : colors.surface,
                                            borderColor: isSelected ? colors.tint : colors.border,
                                            paddingHorizontal: r.spacing.lg + 2,
                                            paddingVertical: r.spacing.md,
                                            borderRadius: r.radius.sm + 2,
                                        }
                                    ]}
                                    onPress={() => setSelectedDay(day)}
                                >
                                    <ThemedText style={[styles.dayText, { color: isSelected ? '#FFFFFF' : colors.text, fontSize: r.fontSm }]}>
                                        {day}
                                    </ThemedText>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* Time Selection */}
                <View style={[styles.section, { gap: r.spacing.md }]}>
                    <ThemedText style={[styles.sectionTitle, { color: colors.text, fontSize: r.fontSm }]}>
                        HORA
                    </ThemedText>

                    {/* Morning Slots */}
                    <ThemedText style={[styles.subsectionTitle, { color: colors.text, fontSize: r.fontXs, fontWeight: '600', opacity: 0.7 }]}>
                        MAÑANA
                    </ThemedText>
                    <View style={[styles.timesGrid, { gap: r.spacing.sm + 2 }]}>
                        {timeSlots.filter(s => s.period === 'AM').map((slot, index) => {
                            const isSelected = selectedTime?.time === slot.time;
                            return (
                                <TouchableOpacity
                                    key={`am-${index}`}
                                    style={[
                                        styles.timeSlot,
                                        {
                                            width: timeSlotWidth,
                                            backgroundColor: isSelected ? colors.tint : colors.surface,
                                            borderColor: isSelected ? colors.tint : colors.border,
                                            paddingVertical: r.spacing.md + 2,
                                            borderRadius: r.radius.sm + 2,
                                            gap: r.spacing.xs / 2,
                                        }
                                    ]}
                                    onPress={() => setSelectedTime(slot)}
                                >
                                    <ThemedText style={[styles.timeText, { color: isSelected ? '#FFFFFF' : colors.text, fontSize: r.fontMd }]}>
                                        {slot.time}
                                    </ThemedText>
                                    <ThemedText style={[styles.periodText, { color: isSelected ? 'rgba(255,255,255,0.8)' : colors.textSecondary, fontSize: r.fontXs }]}>
                                        {slot.period}
                                    </ThemedText>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Afternoon Slots */}
                    <ThemedText style={[styles.subsectionTitle, { color: colors.text, fontSize: r.fontXs, fontWeight: '600', opacity: 0.7, marginTop: r.spacing.sm }]}>
                        TARDE
                    </ThemedText>
                    <View style={[styles.timesGrid, { gap: r.spacing.sm + 2 }]}>
                        {timeSlots.filter(s => s.period === 'PM').map((slot, index) => {
                            const isSelected = selectedTime?.time === slot.time;
                            return (
                                <TouchableOpacity
                                    key={`pm-${index}`}
                                    style={[
                                        styles.timeSlot,
                                        {
                                            width: timeSlotWidth,
                                            backgroundColor: isSelected ? colors.tint : colors.surface,
                                            borderColor: isSelected ? colors.tint : colors.border,
                                            paddingVertical: r.spacing.md + 2,
                                            borderRadius: r.radius.sm + 2,
                                            gap: r.spacing.xs / 2,
                                        }
                                    ]}
                                    onPress={() => setSelectedTime(slot)}
                                >
                                    <ThemedText style={[styles.timeText, { color: isSelected ? '#FFFFFF' : colors.text, fontSize: r.fontMd }]}>
                                        {slot.time}
                                    </ThemedText>
                                    <ThemedText style={[styles.periodText, { color: isSelected ? 'rgba(255,255,255,0.8)' : colors.textSecondary, fontSize: r.fontXs }]}>
                                        {slot.period}
                                    </ThemedText>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                </View>
            </ScrollView>

            {/* Save Button */}
            <View style={[styles.footer, { backgroundColor: colors.background, borderColor: colors.border, padding: r.screenPadding, paddingBottom: r.verticalScale(36) }]}>
                <TouchableOpacity
                    style={[
                        styles.saveButton,
                        {
                            backgroundColor: isValid ? colors.tint : colors.surface,
                            opacity: isValid ? 1 : 0.5,
                            height: r.buttonHeight,
                            borderRadius: r.radius.md + 2,
                        }
                    ]}
                    onPress={handleSave}
                    disabled={!isValid}
                >
                    <ThemedText style={[styles.saveButtonText, { color: isValid ? '#FFFFFF' : colors.textMuted, fontSize: r.fontMd }]}>
                        Guardar Cita
                    </ThemedText>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
    },
    closeButton: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontWeight: '600',
        lineHeight: 24,
        includeFontPadding: false,
    },
    placeholder: {},
    scrollContent: {
        paddingBottom: 140,
    },

    // Section
    section: {},
    sectionTitle: {
        fontWeight: '600',
        letterSpacing: 0.5,
        lineHeight: 18,
        includeFontPadding: false,
    },
    subsectionTitle: {
        letterSpacing: 0.5,
        lineHeight: 16,
        includeFontPadding: false,
    },

    // Input
    input: {
        borderWidth: 1,
    },

    // Services
    servicesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    serviceCard: {
        borderWidth: 1,
    },
    serviceName: {
        fontWeight: '600',
        lineHeight: 20,
        includeFontPadding: false,
    },
    servicePrice: {
        lineHeight: 18,
        includeFontPadding: false,
    },

    // Days
    daysScroll: {},
    dayChip: {
        borderWidth: 1,
    },
    dayText: {
        fontWeight: '600',
        lineHeight: 18,
        includeFontPadding: false,
    },

    // Times
    timesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    timeSlot: {
        borderWidth: 1,
        alignItems: 'center',
    },
    timeText: {
        fontWeight: '600',
        lineHeight: 20,
        includeFontPadding: false,
    },
    periodText: {
        lineHeight: 14,
        includeFontPadding: false,
    },

    // Footer
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTopWidth: 1,
    },
    saveButton: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveButtonText: {
        fontWeight: '600',
        lineHeight: 22,
        includeFontPadding: false,
    },
});
