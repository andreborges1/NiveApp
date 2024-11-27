import React, { useState } from 'react';
import { Text } from './ui/text';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { format, addMonths, subMonths, addDays, isSameMonth, isSameDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import useAuthStore from '@/store/useAuthStore';

const Calendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(null);
    const { setDay, Day } = useAuthStore();
    // Verifica se o botão de "anterior" deve ser desabilitado
    const canNavigatePrev = !isSameMonth(startOfMonth(currentDate), startOfMonth(new Date())); // Impede navegar para meses anteriores ao atual

    // Navega para o mês anterior
    const handlePrev = () => {
        if (canNavigatePrev) {
            setCurrentDate(subMonths(currentDate, 1)); // Move um mês para trás
        }
    };

    // Navega para o mês seguinte
    const handleNext = () => {
        setCurrentDate(addMonths(currentDate, 1)); // Sempre move para o próximo mês
    };

    // Lida com o clique no dia
    const handleDayPress = (day) => {
        if (!isBefore(day, new Date())) { // Só seleciona se o dia não for anterior ao de hoje
            let dia = new Intl.DateTimeFormat('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',  // Inclui o ano na formatação
            }).format(day);
            setSelectedDay(day); // Define o dia selecionado
            setDay(dia);
            console.log(dia)
        }
    };

    // Renderiza os dias do calendário
    const renderDays = () => {
        const start = startOfWeek(startOfMonth(currentDate));
        const end = endOfWeek(endOfMonth(currentDate));

        let day = start;
        let days = [];

        // Adiciona os dias do calendário
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
                {/* Condiciona a visibilidade do botão "anterior" */}
                {canNavigatePrev ? (
                    <TouchableOpacity onPress={handlePrev}>
                        <Text style={styles.navButton}>{"<"}</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={{ marginRight: '12%' }}>
                    </TouchableOpacity>
                )}
                <Text style={styles.headerText}>{format(currentDate, 'MMMM yyyy', { locale: ptBR })}</Text>
                <TouchableOpacity onPress={handleNext}>
                    <Text style={styles.navButton}>{">"}</Text>
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
        justifyContent: 'space-between', // Centraliza o cabeçalho
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
        paddingHorizontal: 10, // Ajustando o espaçamento dos botões de navegação
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
        justifyContent: 'space-between', // Ajuste para garantir que os dias estejam alinhados corretamente
        paddingHorizontal: 0,
    },
    dayContainer: {
        width: '13.5%', // Garantir que os dias se ajustem corretamente
        height: 32,

        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 5,
    },
    inactiveDay: {
        opacity: 0.5, // Menos opacidade para dias do mês anterior
    },
    inactiveDayText: {
        textDecorationLine: 'none',
        color: 'gray', // Cor mais escura para dias fora do mês atual
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
