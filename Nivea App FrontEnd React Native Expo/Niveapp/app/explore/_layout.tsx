import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';


export default function TabLayout() {
    return (
        <Tabs screenOptions={{
            tabBarActiveTintColor: 'black',
            tabBarStyle: {
                height: '11%',
                borderWidth: 1,
                borderTopRightRadius: 0,
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
                borderColor: 'gray',
                borderTopColor: 'gray',
                backgroundColor: 'white',
                marginBottom: 0,
                marginHorizontal: 0,
                alignItems: 'flex-end',
                paddingTop: 10,
            },
            headerShown: false,
            tabBarLabelStyle: {
                fontSize: 12,
                fontWeight: "bold",
            },
        }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Principal',

                    tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Perfil',
                    tabBarIcon: ({ color }) => <FontAwesome size={28} name="user" color={color} />,
                }}
            />
        </Tabs>
    );
}
