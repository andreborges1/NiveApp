import React, { useState } from 'react';
import { Text, View, StyleSheet, TextInput, TouchableWithoutFeedback, Keyboard, Platform, Alert, LogBox } from 'react-native';
import { MaterialCommunityIcons } from 'react-native-vector-icons'; // Importando os ícones
import { VStack } from '@/components/ui/vstack';
import { Radio, RadioGroup, RadioLabel } from '@/components/ui/radio';
import { Button, ButtonGroup, ButtonText } from '@/components/ui/button';
import useAuthStore from '@/store/useAuthStore';
import { useRouter } from 'expo-router';
import { Heading } from '@/components/ui/heading';

// Desabilitando o warning específico
LogBox.ignoreLogs([
    'Warning: Text strings must be rendered within a <Text> component.',
]);

// Função para converter o formato da data
const convertToISOString = (Day, Time) => {
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

    const [dayOfMonth, monthName, year] = Day.split(' de ');
    const month = months[monthName.toLowerCase()];
    const isoString = `${year}-${month}-${dayOfMonth.padStart(2, '0')}T${Time}:00.000Z`;

    return isoString;
};

const ServiceBookingScreen = () => {
    const router = useRouter();
    const [notes, setNotes] = useState('');
    let { Day, Time, setDay, accessToken } = useAuthStore();
    const [values, setValues] = useState("Manicure"); // Estado para o serviço selecionado

    // Função para lidar com o botão de confirmação
    const handleConfirmBooking = () => {
        if (!values) {
            Alert.alert("Erro", "Por favor, selecione um serviço");
            return;
        }

        // Lógica para confirmar o agendamento
        Alert.alert(
            "Agendamento Confirmado",
            `Serviço: ${values}\nNotas: ${notes || "Nenhuma nota"}`,
            [{ text: "OK" }]
        );
    };

    const sendDateToApi = async () => {
        const formattedDate = convertToISOString(Day, Time);
        try {
            const response = await fetch('http://192.168.0.158:3000/createappointment', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    appointmentDate: formattedDate,
                    serviceType: values,
                    notes: notes
                }),
            });
            const result = await response.json();
            console.log('Data agendada com sucesso!', result);
            setDay(null);
            router.replace("/explore");
        } catch (error) {
            console.error('Erro ao enviar a data:', error);
        }
    };

    // Função para retornar ícone dependendo da seleção
    const getRadioIcon = (service) => {
        if (values === service) {
            return <MaterialCommunityIcons name="radiobox-marked" size={24} color="#000" />;
        }
        return <MaterialCommunityIcons name="radiobox-blank" size={24} color="#000" />;
    };

    return (
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View style={styles.container}>
                <Heading style={styles.header} size="3xl">
                    <Text>Selecione um Serviço</Text>
                </Heading>

                {/* Opções de Serviço com ícones radiais */}
                <RadioGroup style={styles.servicos} value={values} onChange={setValues}>
                    <VStack space="lg">
                        <Radio size="lg" value="Manicure">
                            <View style={styles.iconContainer}>
                                {getRadioIcon("Manicure")}
                            </View>
                            <RadioLabel><Text>Manicure</Text></RadioLabel>
                        </Radio>
                        <Text style={styles.serviceDescription}>
                            Unhas das mãos, com ou sem aplicação de Gel.
                        </Text>

                        <Radio size="lg" value="Pedicure">
                            <View style={styles.iconContainer}>
                                {getRadioIcon("Pedicure")}
                            </View>
                            <RadioLabel><Text>Pedicure</Text></RadioLabel>
                        </Radio>
                        <Text style={styles.serviceDescription}>
                            Unhas dos pés, com ou sem aplicação de Gel.
                        </Text>

                        <Radio size="lg" value="Mãos e Pés">
                            <View style={styles.iconContainer}>
                                {getRadioIcon("Mãos e Pés")}
                            </View>
                            <RadioLabel><Text>Manicure e Pedicure</Text></RadioLabel>
                        </Radio>
                        <Text style={styles.serviceDescription}>
                            Mãos e pés, sem aplicação de Gel.
                        </Text>

                        <Radio size="lg" value="Cabelos">
                            <View style={styles.iconContainer}>
                                {getRadioIcon("Cabelos")}
                            </View>
                            <RadioLabel><Text>Cabelereira</Text></RadioLabel>
                        </Radio>
                        <Text style={styles.serviceDescription}>
                            Pintura e tratamento.
                        </Text>
                    </VStack>
                </RadioGroup>

                {/* Área de Anotações */}
                <TextInput
                    style={styles.textInput}
                    placeholder="Deixe uma observação ou recado..."
                    multiline
                    value={notes}
                    onChangeText={setNotes}
                />

                {/* Botão de Confirmar Agendamento */}
                <ButtonGroup>
                    <Button onPress={sendDateToApi}>
                        <ButtonText style={styles.buttonText}>Confirmar Agendamento</ButtonText>
                    </Button>
                </ButtonGroup>
            </View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    servicos: {
        marginTop: 15,
        marginBottom: 35,
    },
    header: {
        marginBottom: 20,
    },
    iconContainer: {
        marginRight: 10,
    },
    serviceDescription: {
        marginLeft: 30,
        color: '#555',
    },
    textInput: {
        height: 100,
        borderColor: '#ccc',
        borderWidth: 1,
        padding: 10,
        marginBottom: 20,
        borderRadius: 5,
        textAlignVertical: 'top',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
});

export default ServiceBookingScreen;
