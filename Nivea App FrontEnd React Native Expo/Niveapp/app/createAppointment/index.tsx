import React, { useState } from 'react';
import { Platform } from 'react-native';
import useAuthStore from '@/store/useAuthStore';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Calendar from '@/components/Calendar';
import ScheduleSelector from '@/components/ScheduleSelector';
import { ScrollView } from 'react-native';
import { Button, ButtonGroup, ButtonText } from '@/components/ui/button';
import { useShallow } from 'zustand/react/shallow'

const DatePickerScreen = () => {
    const [date, setDate] = useState(new Date());
    const [show, setShow] = useState(false);
    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setShow(Platform.OS === 'ios' ? true : false);
        setDate(currentDate);
    };
    const router = useRouter();

    let { Day, Time } = useAuthStore(useShallow((state) => ({ Day: state.Day, Time: state.Time })));
    const goToServices = () => {
        router.push('/createAppointment/services');
    };
    return (
        <SafeAreaView>
            <ScrollView>
                <Calendar></Calendar>
                <ScheduleSelector></ScheduleSelector>
                <ButtonGroup style={{ flex: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 10, paddingTop: 10, marginBottom: 50 }}>
                    {Day && Time ? (
                        <Button size="xl" action="positive" onPress={goToServices}><ButtonText>Continuar</ButtonText></Button>
                    ) : (
                        <Button size="xl" variant='outline'><ButtonText>Selecione o dia e o horário</ButtonText></Button>
                    )}
                </ButtonGroup>
            </ScrollView>
        </SafeAreaView >
    );
};

export default DatePickerScreen;
