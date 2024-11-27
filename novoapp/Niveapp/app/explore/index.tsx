// app/explore/index.tsx
import React, { useEffect } from 'react';
import { View, FlatList, Alert, Linking, ScrollView } from 'react-native';
import useAuthStore from '@/store/useAuthStore';
import { useState } from 'react';
import { format } from 'date-fns';
import * as SecureStore from "expo-secure-store";
import { Link, useNavigation, useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { Text } from '@/components/ui/text';
import { ActivityIndicator } from 'react-native';
import {
  Button,
  ButtonText,
  ButtonSpinner,
  ButtonIcon,
  ButtonGroup,
} from '@/components/ui/button';
import { Center } from '@/components/ui/center';
import { Heading } from '@/components/ui/heading';
import {
  Avatar,
  AvatarBadge,
  AvatarFallbackText,
  AvatarImage,
} from '@/components/ui/avatar';
import { Box } from '@/components/ui/box';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppointmentsComponent from '@/components/appointmentRender';
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogCloseButton,
  AlertDialogFooter,
  AlertDialogBody,
} from "@/components/ui/alert-dialog";


console.error = () => { };
console.warn = () => { };
console.log = () => { };

const ExploreScreen = () => {
  const { setAppointmentsTypeList, userAppointmentDates, loginToken, setAccessToken, setRefreshToken, setFirstName, setEmail, setPicture, firstName, email, picture, accessToken, refreshToken, clearAuthData, searching, setSearching, expiredToken, setExpiredToken, scheduledDates, setUserAppointmentDates, setScheduledDates } = useAuthStore();
  const { user } = useUser();
  const clerkID = user?.id
  console.log(clerkID, accessToken)
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const router = useRouter();
  const [dates, setDates] = useState([]);

  const navigation = useNavigation();

  const handleReload = () => {
    const state = navigation.getState(); // Obtém o estado da navegação
    const currentRoute = state.routes[state.index];
    navigation.reset({
      index: 0, // Reseta a pilha de navegação para a tela inicial
      routes: [{ name: currentRoute.name }], // Volta para a tela atual
    });
  };


  const [message, setMessage] = useState(''); // Estado que vai armazenar a mensagem do filho

  // Função que será chamada pelo filho
  const handleMessageFromChild = (childMessage) => {
    console.log("oi ChatGpt3!!!", childMessage)
    setMessage(childMessage); // Atualiza o estado com a mensagem recebida
  };

  useEffect(() => {
    // Esse efeito será executado sempre que o valor de `message` mudar
    console.log("Atualizou a mensagem:", message);
  }, [message]); // Dependência no estado `message`


  useEffect(() => {
    // Somente faz a requisição se o loginToken estiver presente
    if (!loginToken && !accessToken && !user) {
      handleReload();
    }
    if (!loginToken && !accessToken) {
      checkTokens();
    } else if (accessToken && !email) {
      fetchProfileAndAppointments(accessToken, refreshToken);
      setLoading(false);
    }
    if (loginToken && !accessToken && clerkID) {
      fetchAccessTokens();
    }
    if (accessToken) {
      fetchAppointmentDates();
    }
  }, [user]);

  const checkTokens = async () => {
    try {
      const accessTokenas = await SecureStore.getItemAsync("accessToken");
      const refreshTokenas = await SecureStore.getItemAsync("refreshToken");
      if (!accessTokenas && !refreshTokenas) {
        router.replace("/");
        throw new Error('Tokens não encontrados');
      }
      await setAccessToken(accessTokenas);
      await setRefreshToken(accessTokenas);
      handleReload();
    } catch (error) {
      router.replace("/");
      console.error("Erro ao carregar os dados de autenticação", error);
    }
  }

  const fetchAccessTokens = async () => {

    setLoading(true);
    setError(null); // Limpar erro antes de tentar a requisição
    console.log("Pedindo accessToken e RefreshToken")
    try {
      // Fazendo a requisição POST
      const response = await fetch(`http://192.168.0.158:3000/auth/userid/${clerkID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: loginToken }),
      });
      console.log(loginToken)
      if (!response.ok) {
        console.log(response)
        throw new Error('Erro ao fazer requisição');
      }

      const data = await response.json();
      const { accessToken: receivedAccessToken, refreshToken: receivedRefreshToken } = data;

      // Armazenando os tokens no Zustand
      await setAccessToken(receivedAccessToken);
      await setRefreshToken(receivedRefreshToken);
      handleReload();
    } catch (error) {
      setLoading(false);
      setError('Falha ao recuperar os tokens. Tente novamente.');
      console.error(error);
    }
  };

  const fetchProfileAndAppointments = async (currentAccessToken = accessToken, currentRefreshToken = refreshToken) => {
    try {
      const responseProfile = await fetch('http://192.168.0.158:3000/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${currentAccessToken}`,
        },
      });
      console.log('fetch profile status:', responseProfile.statusText, responseProfile.status)
      if (responseProfile.status === 401) {
        // Se a resposta for Unauthorized, solicita novos tokens e reinicia a página
        console.log("tokenExpirado")
        if (!searching) {
          setSearching(true);
          await refreshTokensFromServer(currentAccessToken, currentRefreshToken);
          return;
        }
        return
      }

      if (!responseProfile.ok) {
        throw new Error('Erro ao obter o perfil');
      }
      const data2 = await responseProfile.json();
      const { firstName: recfirstName, email: recemail, picture: recpicture } = data2;
      setFirstName(recfirstName);
      setEmail(recemail);
      setPicture(recpicture);
      const appointmentDatesFetch = await fetch('http://192.168.0.158:3000/allapp', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${currentAccessToken}`,
        },
      });
      const data3 = await appointmentDatesFetch.json();
      setDates(data3);
      console.log(appointmentDatesFetch)
      setLoading(false);

    } catch (err) {
      setLoading(false);
      setError('Falha ao recuperar os tokens. Tente novamente.');
      console.error(err);
    }
  };

  const refreshTokensFromServer = async (accessToken, refreshToken) => {
    try {
      console.log("Refresh Tokens From Server", accessToken, refreshToken)
      const response = await fetch(`http://192.168.0.158:3000/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${refreshToken}`,
        },
        body: JSON.stringify({ accessToken }),
      });
      if (response.status === 401) {
        // Se a resposta for Unauthorized, solicita novos tokens e reinicia a página
        console.log("refreshTokenTBMExpirado")
        await clearAuthData();
        setSearching(false);
        router.replace("./");
        return;
      }

      const data = await response.json();
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = data;
      // Atualiza o Zustand com os novos tokens
      await setAccessToken(newAccessToken);
      await setRefreshToken(newRefreshToken);
      console.log("accessTokenRenovado", newAccessToken, newRefreshToken, accessToken, refreshToken)
      setSearching(false);
      handleReload();
    } catch (error) {
      setSearching(false);
      setError('Falha ao atualizar tokens. Tente novamente.');
      console.error(error);
    }
  };

  const [showAlertDialog, setShowAlertDialog] = React.useState(false)
  const handleClose = () => setShowAlertDialog(false)

  const fetchAppointmentDates = async () => {
    if (!accessToken) {
      console.error("Access Token não encontrado!");
      return;
    }

    try {
      const response = await fetch('http://192.168.0.158:3000/getappointments', {
        method: 'GET',
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) throw new Error('Erro ao buscar os agendamentos');

      const { appointments = [], scheduledDates = [] } = await response.json();

      // Se appointments estiver vazio, usa lista vazia para userAppointmentDates e appointmentsTypeList
      const userAppointmentDates = appointments.length > 0
        ? appointments.map((appointment) => appointment.appointmentDate)
        : [];

      // Atualizar estado com listas vazias ou dados válidos
      setUserAppointmentDates(userAppointmentDates);
      setScheduledDates(scheduledDates);
      setAppointmentsTypeList(appointments); // Atualizando com os dados de appointments, que pode ser vazio

      // Exibir as variáveis no console para depuração
      console.log('User Appointment Dates:', userAppointmentDates);
      console.log('Scheduled Dates:', scheduledDates);
      console.log('Appointments List:', appointments);

    } catch (error) {
      console.error('Erro ao buscar os agendamentos:', error);
    }
  };


  const deleteAppointments = async () => {
    console.log("caralho", message)

    if (!accessToken) {
      console.error("Access Token não encontrado!");
      return;
    }
    try {
      console.log("entrou")
      const response = await fetch('http://192.168.0.158:3000/deleteappointment', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',  // Certificando que o corpo é enviado como JSON
        },
        body: JSON.stringify({
          appointmentDate: message, // Dados a serem enviados no corpo da requisição
        }),
      });
      console.log("passou", response, message)
      if (!response.ok) {
        throw new Error('Erro ao excluir o agendamento');
      }

      const data = await response.json();
      console.log(data);
      setMessage(null); // Dados retornados pela API
      handleReload();


    } catch (error) {
      console.error('Erro ao fazer requisição:', error);
    }
  };
  const [key, setKey] = useState(0); // Estado para controlar a chave


  const toggleAlertDialog = () => {
    setShowAlertDialog(!showAlertDialog);
  };

  return (
    <SafeAreaView>
      <View>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : error ? (
          <Text style={{ color: 'red' }}>{error}</Text>
        ) : (
          <>

            <View style={{ position: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginLeft: 25, marginRight: 25, alignItems: 'center', textAlign: 'center', marginTop: 10, marginBottom: 10 }}>
              <Heading size="xl">Olá, {firstName}!</Heading>
              <Avatar size="lg"><AvatarFallbackText>{firstName}</AvatarFallbackText><AvatarImage source={{ uri: picture }}></AvatarImage></Avatar>
            </View>
            <ScrollView>
              <Box style={{
                height: 180,
                marginHorizontal: 25,
                backgroundColor: 'black',
                alignSelf: 'center',
                borderRadius: 20,
                alignItems: 'center', // Centralizando os itens dentro do Box
                justifyContent: 'space-around',
                marginTop: 30,
                paddingLeft: 20,
                paddingRight: 20,
              }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <Link href={'/createAppointment'} >
                    <Ionicons name="calendar-outline" size={40} color="white" />
                  </Link>
                  <Link href={'/createAppointment'} >
                    <FontAwesome name="chevron-right" size={30} color="white" />
                  </Link>

                </View>
                <View style={{ gap: 1, marginLeft: -10 }}>
                  <Heading style={{ color: 'white' }}>Inicie o Agendamento</Heading>
                  <Text size="sm" className="text-typography-0">Veja horários disponíveis, escolha os serviços...</Text>
                </View>
              </Box>

              <Box style={{ marginBottom: 200 }}>
                <Box style={{ justifyContent: 'center', marginLeft: 30, marginTop: 35, flexDirection: 'column' }}>
                  <Heading size="2xl" style={{}}>Meus horários</Heading>
                </Box>
                <Box>
                  <AppointmentsComponent key={key} onMessageSend={handleMessageFromChild} setShowAlertDialog={setShowAlertDialog} toggleAlertDialog={toggleAlertDialog} userAppointmentDates={userAppointmentDates}></AppointmentsComponent>
                </Box>
              </Box>

              <AlertDialog isOpen={showAlertDialog} onClose={handleClose} size="full">
                <AlertDialogBackdrop />
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <Heading className="text-typography-950 font-semibold" size="md">
                      <Text>Gostaria de desmarcar seu agendamento?</Text>
                    </Heading>
                  </AlertDialogHeader>
                  <AlertDialogBody className="mt-3 mb-4">
                    <Text size="sm">
                      Ao desmarcar, avalie reagendar seu horário para outra data!
                    </Text>
                  </AlertDialogBody>
                  <AlertDialogFooter className="">
                    <Button size="sm" action="negative" onPress={() => deleteAppointments(message)}>
                      <ButtonText>Desmarcar</ButtonText>
                    </Button>
                    <Button size="sm" onPress={handleClose}>
                      <ButtonText>Voltar</ButtonText>
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </ScrollView>
          </>
        )
        }
      </View >
    </SafeAreaView >
  );
};
export default ExploreScreen;

/*
              <View style={{ flexDirection: 'row', position: 'relative', marginTop: 15, gap: 5, borderWidth: 1, borderColor: 'black', borderRadius: 10, marginHorizontal: 15, height: 140, alignItems: 'center', justifyContent: 'left' }}>
                <View style={{ flexDirection: 'row', marginTop: -30, gap: 5 }}>
                  <Box style={{ marginLeft: 5, borderWidth: 0, borderColor: 'black', borderRadius: 5, width: 50, height: 50, alignItems: 'center', justifyContent: 'center', marginTop: 10 }}><FontAwesome color="gray" name="exclamation-triangle" size={30} /></Box>
                  <View style={{ flexDirection: 'column', marginTop: 10 }}>
                    <Text size="lg" style={{ alignSelf: 'center' }} bold="true">Você ainda não possui horários.</Text>
                    <Text size="sm" style={{ alignSelf: 'center' }}>Agende até 2 horários com antecedência.</Text>
                  </View>
                </View>
                <Button onPress={() => { router.push('/createAppointment'); }} action="positive" style={{ position: 'absolute', bottom: 10, right: 10 }}><ButtonText>Antecipe-se!</ButtonText></Button>
              </View>

              <View style={{ flexDirection: 'row', position: 'relative', marginTop: 15, gap: 5, borderWidth: 1, borderColor: 'black', borderRadius: 10, marginHorizontal: 15, height: 140, alignItems: 'center', justifyContent: 'left' }}>
                <View style={{ flexDirection: 'row', marginTop: -30, gap: 5 }}>
                  <Box style={{ marginLeft: 5, borderWidth: 0, borderColor: 'black', borderRadius: 5, width: 50, height: 50, alignItems: 'center', justifyContent: 'center', marginTop: 10 }}><FontAwesome color="gray" name="exclamation-triangle" size={30} /></Box>
                  <View style={{ flexDirection: 'column', marginTop: 10 }}>
                    <Text size="lg" style={{ alignSelf: 'center' }} bold="true">Você ainda não possui horários.</Text>
                    <Text size="sm" style={{ alignSelf: 'center' }}>Agende até 2 horários com antecedência.</Text>
                  </View>
                </View>
                <Button onPress={() => { router.push('/createAppointment'); }} action="positive" style={{ position: 'absolute', bottom: 10, right: 10 }}><ButtonText>Antecipe-se!</ButtonText></Button>
              </View>
*/