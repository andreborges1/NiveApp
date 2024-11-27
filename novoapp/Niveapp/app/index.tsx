import React, { useEffect, useState } from 'react';
import { View, ImageBackground, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import useAuthStore from '@/store/useAuthStore'
import * as SecureStore from "expo-secure-store";
import { useOAuth } from '@clerk/clerk-expo';
import {
  Button,
  ButtonText,
  ButtonSpinner,
  ButtonIcon,
  ButtonGroup,
} from '@/components/ui/button';
import { Image } from 'react-native';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { FontAwesome, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { Center } from '@/components/ui/center';
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogCloseButton,
  AlertDialogFooter,
  AlertDialogBody,
} from "@/components/ui/alert-dialog"
import { Divider } from '@/components/ui/divider';
import * as Liking from 'expo-linking';

export default function HomeScreen() {
  const googleOAuth = useOAuth({ strategy: 'oauth_google' });
  const { loginToken, setLoginToken, refreshToken, accessToken, setRefreshToken, setAccessToken } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [stop, setStop] = useState(false);
  const router = useRouter(); // Use expo-router's navigation
  const [showAlertDialog, setShowAlertDialog] = React.useState(false)
  const handleClose = () => setShowAlertDialog(false)

  const redirectURL = Liking.createURL('/explore');
  const fetchData = async () => {
    const numero = Math.floor(Math.random() * 90000000) + 10000000;
    try {
      const response = await fetch(`http://192.168.0.158:3000/auth/generate-token/${numero}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("data.token", data.token)
      setLoginToken(data.token); // Store the token
    } catch (err: any) {
      setError(err.message || 'Something went wrong, please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const checkTokens = async () => {
    try {
      let accessTokenas = await SecureStore.getItemAsync("accessToken");
      let refreshTokenas = await SecureStore.getItemAsync("refreshToken");
      if (!accessTokenas && !refreshTokenas) {
        setLoading(false);
        throw new Error('Tokens não encontrados');
      }
      console.log('tokens encontrados!', accessTokenas, refreshTokenas)
      if (typeof accessTokenas !== 'string') {
        accessTokenas = JSON.stringify(accessTokenas);
      }

      if (typeof refreshTokenas !== 'string') {
        refreshTokenas = JSON.stringify(refreshTokenas);
      }
      console.log(accessTokenas, refreshTokenas)
      await setAccessToken(accessTokenas);
      await setRefreshToken(refreshTokenas);
      setStop(true);
      console.log("encontrou tokens e foi ao explorer", accessTokenas, refreshTokenas)
      router.replace("/explore");
    } catch (error) {
      console.log("Erro ao carregar os dados de autenticação", error);
    }
  }

  useEffect(() => {
    if (!accessToken) {
      checkTokens();
      if (stop) {
        return
      }
    }
    fetchData();
  }, []);

  const onGoogleSignIn = async () => {
    try {
      setLoading(true);
      const oAuthFlow = await googleOAuth.startOAuthFlow({ redirectUrl: redirectURL });
      if (oAuthFlow.authSessionResult?.type === 'success') {
        if (oAuthFlow.setActive) {
          await setLoginToken(loginToken);
          await oAuthFlow.setActive({ session: oAuthFlow.createdSessionId });
          if (loginToken) {
            console.log("Enviando loginToken para a página autenticada: ", loginToken);
            setLoading(false);

            router.replace('/explore');
          } else {
            console.error('loginToken não está disponível');
            setLoading(false);
          }
        }
      }
    } catch (error) {
      console.error('Erro durante o login com Google: ', error);
      setLoading(false);
    }
  };


  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{
        width: 150,
        height: 150,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: 'gray',
        overflow: 'hidden',
        marginTop: 50
      }}>
        <Image source={require("@/assets/images/nails.jpg")} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
      </View>

      {/* Envolvendo o texto com o componente <Text> */}
      <Heading size="2xl" style={{ textAlign: 'center' }} className="mt-10 mb-3">
        Nívea Salão de Beleza
      </Heading>

      {/* Envolvendo o texto com o componente <Text> */}
      <Text size="xl" className="mt-3" style={{ textAlign: 'center', marginHorizontal: '10%', marginBottom: '5%' }}>
        Escolha a melhor data e horário através do App!
      </Text>

      <Center className="h-[300px] gap-5">
        {loading ? (
          <Button size="lg" style={{ overflow: 'hidden', height: 60, width: 280 }} variant="outline">
            {/* O texto dentro do ButtonText deve ser um componente <Text> */}
            <ButtonText>
              <ButtonSpinner size="large" />
            </ButtonText>
          </Button>
        ) : error ? (
          <Text>{error}</Text>
        ) : (
          <Button size="lg" style={{ overflow: 'hidden', height: 60, width: 280 }} variant="outline" onPress={onGoogleSignIn} >
            <FontAwesome name="google" size={30} color="black" />
            <ButtonText className="text-xl">Login com o Google</ButtonText>
          </Button>
        )}

        <Button variant="solid" onPress={() => setShowAlertDialog(true)} size="lg" style={{ overflow: 'hidden', height: 60, width: 280, }} className='' >
          <Ionicons name="logo-apple" size={30} color="black" />
          {/* Envolvendo o texto com o componente <Text> */}
          <ButtonText className="text-xl">Login com a Apple</ButtonText>
        </Button>

        <Button variant="outline" onPress={() => setShowAlertDialog(true)} size="lg" style={{ overflow: 'hidden', height: 60, width: 280 }} >
          <FontAwesome5 name="tiktok" size={30} color="black" />
          {/* Envolvendo o texto com o componente <Text> */}
          <ButtonText className="text-xl">Login com o TikTok</ButtonText>
        </Button>
      </Center>

      <AlertDialog isOpen={showAlertDialog} onClose={handleClose} size="md">
        <AlertDialogBackdrop />
        <AlertDialogContent>
          <AlertDialogHeader>
            <Heading className="text-typography-950 font-semibold" size="md">
              <Text>Não está funcionando!!</Text>
            </Heading>
          </AlertDialogHeader>
          <AlertDialogBody className="mt-3 mb-4">
            <Text size="sm">
              Aguarde, algumas funcionalidades ainda estão por vir!
            </Text>
          </AlertDialogBody>
          <AlertDialogFooter className="">
            <Button size="sm" onPress={handleClose}>
              <ButtonText>Okay</ButtonText>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </View >

  );
}



/*





*/