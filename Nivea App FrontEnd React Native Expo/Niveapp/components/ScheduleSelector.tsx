import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from './ui/text';
import { Button } from './ui/button';
import useAuthStore from '@/store/useAuthStore';
import { useShallow } from 'zustand/react/shallow';

interface ScheduleSelectorProps {
    unavailableTimes?: string[];
}

const ScheduleSelector: React.FC<ScheduleSelectorProps> = ({ unavailableTimes = [] }) => {
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const { setTime, Time, scheduledDates, userAppointmentDates } = useAuthStore();
    const { Day } = useAuthStore(useShallow((state) => ({ Day: state.Day })));

    const [unavailableTimesForSelectedDay, setUnavailableTimesForSelectedDay] = useState<string[]>([]);

    const times = {
        morning: ['08:00', '09:00', '10:00', '11:00'],
        afternoon: ['13:00', '14:00', '15:00', '16:00', '17:00', '18:00'],
        evening: ['19:00', '20:00', '21:00', '22:00'],
    };
    const getCombinedScheduledDates = () => {
        const allScheduledDates = [...scheduledDates];
        if (userAppointmentDates) {
            allScheduledDates.push(...userAppointmentDates);
        }
        return allScheduledDates;
    };
    const getUnavailableTimesForSelectedDay = () => {
        const formattedUnavailableTimes: string[] = [];

        if (!Day) {
            return formattedUnavailableTimes;
        }
        const [dayOfMonth, monthName, year] = Day.split(' de ');

        if (!dayOfMonth || !monthName || !year) {
            return formattedUnavailableTimes;
        }
        const months = {
            janeiro: '01',
            fevereiro: '02',
            março: '03',
            abril: '04',
            maio: '05',
            junho: '06',
            julho: '07',
            agosto: '08',
            setembro: '09',
            outubro: '10',
            novembro: '11',
            dezembro: '12',
        };

        const month = months[monthName.toLowerCase()];

        if (!month) {
            return formattedUnavailableTimes;
        }
        const selectedDate = `${year}-${month}-${dayOfMonth.padStart(2, '0')}`;
        const combinedScheduledDates = getCombinedScheduledDates();
        combinedScheduledDates.forEach((scheduledDate) => {
            const dateOnly = scheduledDate.split('T')[0];
            if (dateOnly === selectedDate) {
                const timeString = scheduledDate.split('T')[1].slice(0, 5);
                formattedUnavailableTimes.push(timeString);
            }
        });

        return formattedUnavailableTimes;
    };

    useEffect(() => {
        if (Day) {
            const unavailableTimes = getUnavailableTimesForSelectedDay();
            setUnavailableTimesForSelectedDay(unavailableTimes);
        }
    }, [Day, scheduledDates, userAppointmentDates]);

    const handleSelect = (time: string) => {
        if (!unavailableTimesForSelectedDay.includes(time)) {
            setSelectedTime(time);
            setTime(time);
            console.log(time, Time);
        }
    };

    const renderTimeBlock = (title: string, timeArray: string[]) => (
        <View style={styles.blockContainer}>
            <Text style={styles.blockTitle}>{title}</Text>
            <View style={styles.timesRow}>
                {timeArray.map((time) => {
                    const isUnavailable = unavailableTimesForSelectedDay.includes(time);
                    const isSelected = selectedTime === time;

                    return (
                        <Button
                            key={time}
                            style={[
                                styles.timeBubble,
                                isUnavailable && styles.unavailableTime,
                                isSelected && styles.selectedTime,
                            ]}
                            onPress={() => handleSelect(time)}
                            disabled={isUnavailable}
                        >
                            <Text style={[styles.timeText, isSelected && styles.selectedTimeText]}>
                                {time}
                            </Text>
                        </Button>
                    );
                })}
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {renderTimeBlock('Manhã', times.morning)}
            {renderTimeBlock('Tarde', times.afternoon)}
            {renderTimeBlock('Noite', times.evening)}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 0,
        paddingTop: 15,
        paddingBottom: 10,
    },
    blockContainer: {
        marginBottom: 10,
    },
    blockTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5,
        marginLeft: 10,
    },
    timesRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingLeft: 15,
    },
    timeBubble: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 10,
        margin: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    timeText: {
        fontSize: 16,
        color: '#000',
    },
    unavailableTime: {
        backgroundColor: 'red',
        textDecorationLine: 'line-through',
    },
    selectedTime: {
        backgroundColor: 'black',
        borderWidth: 1,
    },
    selectedTimeText: {
        color: 'white',
        fontSize: 18,
    },
});

export default ScheduleSelector;
