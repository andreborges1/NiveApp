import React, { useState } from 'react';
import { Text } from './ui/text';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { format, addMonths, subMonths, addDays, isSameMonth, isSameDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import useAuthStore from '@/store/useAuthStore';
import { FontAwesome } from '@expo/vector-icons';

const Calendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(null);
    const { setDay, Day } = useAuthStore();
    const canNavigatePrev = !isSameMonth(startOfMonth(currentDate), startOfMonth(new Date()));
    const handlePrev = () => {
        if (canNavigatePrev) {
            setCurrentDate(subMonths(currentDate, 1));
        }
    };
    const handleNext = () => {
        setCurrentDate(addMonths(currentDate, 1));
    };
    const handleDayPress = (day) => {
        if (!isBefore(day, new Date())) {
            let dia = new Intl.DateTimeFormat('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
            }).format(day);
            setSelectedDay(day);
            setDay(dia);
            console.log(dia)
        }
    };
    const renderDays = () => {
        const start = startOfWeek(startOfMonth(currentDate));
        const end = endOfWeek(endOfMonth(currentDate));

        let day = start;
        let days = [];

        while (day <= end) {
            days.push(day);
            day = addDays(day, 1);
        }

        return (
            <View style={styles.daysContainer}>
                {days.map((day, index) => (
                    <View key={index} style={[styles.dayContainer, !isSameMonth(day, currentDate) && styles.inactiveDay]}>
                        <TouchableOpacity onPress={() => handleDayPress(day)} disabled={isBefore(day, new Date())}>
                            <Text style={[
                                isSameDay(day, new Date()) ? styles.currentDay :
                                    isSameDay(day, selectedDay) ? styles.selectedDay :
                                        isBefore(day, new Date()) ? styles.pastDay : styles.dayText,
                                !isSameMonth(day, currentDate) && styles.inactiveDayText
                            ]}>
                                {format(day, 'd')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                {canNavigatePrev ? (
                    <TouchableOpacity onPress={handlePrev}>
                        <Text style={styles.navButton}><FontAwesome name="arrow-circle-left" color='black' size='20'></FontAwesome></Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={{ marginRight: '12%' }}>
                    </TouchableOpacity>
                )}
                <Text style={styles.headerText}>{format(currentDate, 'MMMM yyyy', { locale: ptBR })}</Text>
                <TouchableOpacity onPress={handleNext}>
                    <Text style={styles.navButton}><FontAwesome name="arrow-circle-right" color='black' size='20'></FontAwesome></Text>
                </TouchableOpacity>
            </View>

            <View style={styles.weekRow}>
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map((day, index) => (
                    <Text key={index} style={styles.weekDay}>{day}</Text>
                ))}
            </View>

            {renderDays()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: 'fff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 35,
        marginTop: 30,
        paddingHorizontal: 10,
    },
    headerText: {
        textTransform: 'capitalize',
        textAlign: 'center',
        fontSize: 22,
        fontWeight: 'bold',
    },
    navButton: {
        fontSize: 20,
        fontWeight: 'bold',
        paddingHorizontal: 10,
    },
    weekRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
        textAlign: 'center',
        paddingHorizontal: 9,
        borderBottomWidth: 1,
        borderColor: 'black',
        paddingBottom: 15,
    },
    weekDay: {
        width: 32,
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#333',
    },
    daysContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 10,
        justifyContent: 'space-between',
        paddingHorizontal: 0,
    },
    dayContainer: {
        width: '13.5%',
        height: 32,

        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 5,
    },
    inactiveDay: {
        opacity: 0.5,
    },
    inactiveDayText: {
        textDecorationLine: 'none',
        color: 'gray',
    },
    dayText: {
        fontSize: 16,
        textAlign: 'center',
        color: '#000',
    },
    currentDay: {
        fontSize: 16,
        color: 'black',
        fontWeight: 'bold',
    },
    selectedDay: {
        fontSize: 20,
        color: 'white',
        fontWeight: 'bold',
        borderWidth: 1,
        borderColor: 'black',
        padding: 5,
        borderRadius: 70,
        backgroundColor: 'black',

    },
    pastDay: {

        fontSize: 16,
        textDecorationLine: 'line-through',
        color: 'gray',
    },
});

export default Calendar;
