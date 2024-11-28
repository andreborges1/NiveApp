import React, { useEffect, useState } from 'react';
import { View, FlatList, TouchableWithoutFeedback } from 'react-native';
import { Box } from './ui/box';
import { Button, ButtonText } from './ui/button';
import { FontAwesome } from '@expo/vector-icons';
import { Text } from './ui/text';
import useAuthStore from '@/store/useAuthStore';
import { useRouter } from 'expo-router';
import {
    AlertDialog,
    AlertDialogBackdrop,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogCloseButton,
    AlertDialogFooter,
    AlertDialogBody,
} from "./ui/alert-dialog";
import { Heading } from './ui/heading';

// Função para ajustar o horário ao fuso horário GMT-3 de maneira correta
const convertToGmtMinus3 = (utcDate) => {
    const localDate = new Date(utcDate);
    // Adicionando o deslocamento de fuso horário (em minutos)
    const gmtMinus3Offset = 1 * 60; // GMT-3
    const utcOffset = localDate.getTimezoneOffset(); // Diferença UTC atual em minutos
    const totalOffset = utcOffset;
    localDate.setMinutes(localDate.getMinutes() + totalOffset);
    return localDate;
};

// Formata o horário sem segundos
const formatTime = (date) => {
    return date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
};

// Função para formatar o dia da semana com a primeira letra maiúscula
const formatWeekday = (date) => {
    const weekday = date.toLocaleDateString('pt-BR', { weekday: 'long' });
    return weekday.charAt(0).toUpperCase() + weekday.slice(1);
};

// Função para encontrar o serviceType correspondente ao appointmentDate
const getServiceTypeForDate = (appointmentDate, appointmentsTypeList) => {
    // Vamos criar uma função que comparamos apenas ano, mês, dia, hora e minuto
    const normalizedAppointmentDate = new Date(appointmentDate);
    const normalizedAppointments = appointmentsTypeList.map(app => {
        const appointmentTime = new Date(app.appointmentDate);
        // Normalizamos a data para comparar apenas ano, mês, dia, hora e minuto
        return {
            ...app,
            normalizedDate: new Date(appointmentTime.setSeconds(0, 0)) // Ignorando segundos e milissegundos
        };
    });

    // Comparando o appointmentDate com as datas normalizadas
    const matchedAppointment = normalizedAppointments.find(app => {
        const normalizedUserDate = new Date(normalizedAppointmentDate.setSeconds(0, 0)); // Normaliza o usuário também
        return normalizedUserDate.getTime() === app.normalizedDate.getTime(); // Compara as datas sem os segundos/milissegundos
    });

    // Retorna o serviceType se encontrar o correspondente
    return matchedAppointment ? matchedAppointment.serviceType : "Serviço não disponível";
};

// Componente principal
const AppointmentsComponent = ({ onMessageSend, setShowAlertDialog, toggleAlertDialog, userAppointmentDates }) => {
    let { appointmentsTypeList } = useAuthStore();
    let [message, setMessage] = useState(''); // Estado que o filho vai manipular

    // Função chamada quando o botão é pressionado
    const sendMessageToParent = (utcDate2) => {
        console.log("oi ChatGpt2!", utcDate2)
        onMessageSend(utcDate2); // Chama a função do pai passando a mensagem
    };

    const router = useRouter();
    // Renderização de cada item da lista de agendamentos
    const renderAppointment = ({ item }) => {
        const utcDate = new Date(item);
        if (isNaN(utcDate)) {
            console.error('Invalid date format for appointment:', item);
            return <Text>Data inválida</Text>;
        }

        const startDate = convertToGmtMinus3(utcDate);
        const endDate = new Date(startDate);
        endDate.setHours(startDate.getHours() + 1); // Adiciona 1 hora para o horário de término

        const startFormatted = formatTime(startDate);
        const endFormatted = formatTime(endDate);
        const weekday = formatWeekday(startDate);

        const serviceType = getServiceTypeForDate(item, appointmentsTypeList);

        const handleTouchEnd = async () => {
            if (userAppointmentDates && userAppointmentDates.length > 0) {
                setShowAlertDialog(true); // Abre o diálogo de alerta
                console.log(utcDate); // Exibe no console a variável utcDate
                console.log("oi ChatGPT")
                // Atualiza o estado com o valor de utcDate
                setMessage(utcDate);
                // Envia a mensagem para o componente pai
                await sendMessageToParent(utcDate);
            }
        };

        return (
            <TouchableWithoutFeedback onPress={handleTouchEnd}>
                <View
                    style={{
                        flexDirection: 'row',
                        position: 'relative',
                        marginTop: 15,
                        gap: 0,
                        borderWidth: 1,
                        borderColor: 'black',
                        borderRadius: 10,
                        marginHorizontal: 15,
                        height: 140,
                        alignItems: 'center',
                        justifyContent: 'left',
                    }}
                >
                    <View style={{ flexDirection: 'column', position: 'absolute', top: 15, left: 10 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                            <Text size="5xl" bold="false">{startDate.getDate()}</Text>
                            <Text size="2xl" bold="false"> de {startDate.toLocaleDateString('pt-BR', { month: 'long' })}</Text>
                        </View>
                        <Text size="xl" style={{ color: 'gray', marginLeft: 10 }}>{weekday}</Text>
                    </View>

                    <Box style={{ height: '70%', width: 1, left: '60%', backgroundColor: 'lightgray' }} />

                    <Button variant="outline" size="sm" style={{ position: 'absolute', bottom: '8%', left: '4%' }}>
                        <ButtonText>{serviceType}</ButtonText>
                    </Button>

                    <Text style={{ marginLeft: '74%', top: '10%', position: 'absolute', color: 'gray' }}>Início</Text>
                    <Text style={{ marginLeft: '73%', top: '25%', position: 'absolute' }}>{startFormatted}</Text>
                    <Text style={{ marginLeft: '75%', top: '50%', position: 'absolute', color: 'gray' }}>Fim</Text>
                    <Text style={{ marginLeft: '73%', top: '65%', position: 'absolute' }}>{endFormatted}</Text>
                </View>
            </TouchableWithoutFeedback>
        );
    };

    // Caso não existam agendamentos
    if (!userAppointmentDates || userAppointmentDates.length === 0) {
        return (
            <View
                style={{
                    flexDirection: 'row',
                    position: 'relative',
                    marginTop: 15,
                    gap: 5,
                    borderWidth: 1,
                    borderColor: 'black',
                    borderRadius: 10,
                    marginHorizontal: 15,
                    height: 140,
                    alignItems: 'center',
                    justifyContent: 'left',
                }}
            >
                <View style={{ flexDirection: 'row', marginTop: -30, gap: 5 }}>
                    <Box
                        style={{
                            marginLeft: 5,
                            borderWidth: 0,
                            borderColor: 'black',
                            borderRadius: 5,
                            width: 50,
                            height: 50,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginTop: 10,
                        }}
                    >
                        <FontAwesome color="gray" name="exclamation-triangle" size={30} />
                    </Box>
                    <View style={{ flexDirection: 'column', marginTop: 10 }}>
                        <Text size="lg" style={{ alignSelf: 'center' }} bold="true">Você ainda não possui horários.</Text>
                        <Text size="sm" style={{ alignSelf: 'center' }}>Agende até 2 horários com antecedência.</Text>
                    </View>
                </View>
                <Button
                    onPress={() => { router.push('/createAppointment'); }}
                    action="positive"
                    style={{ position: 'absolute', bottom: 10, right: 10 }}
                >
                    <ButtonText>Antecipe-se!</ButtonText>
                </Button>
            </View>
        );
    }

    // Lista de agendamentos
    return (
        <FlatList
            data={userAppointmentDates || []} // Definindo valor padrão como lista vazia caso não exista
            renderItem={renderAppointment}
            keyExtractor={(item, index) => index.toString()}
            scrollEnabled={false}
        />
    );
};

export default AppointmentsComponent;
