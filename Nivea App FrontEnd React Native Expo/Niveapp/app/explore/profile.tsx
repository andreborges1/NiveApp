import { Text } from "@/components/ui/text";
import React from "react";
import { View } from "react-native";
import {
    Avatar,
    AvatarBadge,
    AvatarFallbackText,
    AvatarImage,
} from "@/components/ui/avatar"
import useAuthStore from "@/store/useAuthStore";
import { Heading } from "@/components/ui/heading";
import { Button, ButtonGroup, ButtonText } from "@/components/ui/button";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
const profileScreen = () => {
    let router = useRouter();
    let { firstName, picture, email, clearAuthData } = useAuthStore();
    const logOut = async () => {
        await clearAuthData();
        router.replace("/");
    }

    return (

        < View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} >
            <Avatar style={{ marginBottom: 40 }} size="2xl">
                <AvatarFallbackText>{firstName}</AvatarFallbackText>
                <AvatarImage
                    source={{
                        uri: picture,
                    }}
                />
                <AvatarBadge />
            </Avatar>
            <Heading style={{ fontSize: 30, marginBottom: 3 }} size="2xl">{firstName}</Heading>
            <Text>{email}</Text>
            <ButtonGroup style={{ marginTop: 200, borderRadius: 10 }}>
                <Button size="xl" action="negative" onPress={logOut}><ButtonText>Sair do Aplicativo</ButtonText></Button>
            </ButtonGroup>
        </View >

    );
}
export default profileScreen