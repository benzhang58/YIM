import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Text } from "react-native";
import { fonts } from "../constants/typography";
import { ExploreScreen } from "../screens/explore/ExploreScreen";
import { GymDetailScreen } from "../screens/explore/GymDetailScreen";
import { NearbyScreen } from "../screens/explore/NearbyScreen";
import { AccountDeletionScreen } from "../screens/profile/AccountDeletionScreen";
import { PrivacyScreen } from "../screens/profile/PrivacyScreen";
import { ProfileScreen } from "../screens/profile/ProfileScreen";
import { TermsScreen } from "../screens/profile/TermsScreen";
import { QueueScreen } from "../screens/queue/QueueScreen";
import { SubmitGymScreen } from "../screens/submit/SubmitGymScreen";
import { colors } from "../theme/colors";

export type RootStackParamList = {
  MainTabs: undefined;
  GymDetail: { gymId: string };
  Privacy: undefined;
  Terms: undefined;
  AccountDeletion: undefined;
};

export type MainTabParamList = {
  Explore: undefined;
  Nearby: undefined;
  Submit: undefined;
  Queue: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    primary: colors.highlight,
    border: colors.border
  }
};

function labelForRoute(name: keyof MainTabParamList) {
  switch (name) {
    case "Explore":
      return "Explore";
    case "Nearby":
      return "Map";
    case "Submit":
      return "Add";
    case "Queue":
      return "Queue";
    case "Profile":
      return "Profile";
  }
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 76,
          paddingBottom: 10,
          paddingTop: 8
        },
        tabBarLabelStyle: {
          fontFamily: fonts.semibold,
          fontSize: 12
        },
        tabBarActiveTintColor: colors.highlightStrong,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIcon: ({ focused, color }) => (
          <Text style={{ color, fontFamily: fonts.display, fontSize: focused ? 14 : 12 }}>
            {focused ? "●" : "○"}
          </Text>
        ),
        tabBarLabel: labelForRoute(route.name as keyof MainTabParamList)
      })}
    >
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Nearby" component={NearbyScreen} />
      <Tab.Screen name="Submit" component={SubmitGymScreen} />
      <Tab.Screen name="Queue" component={QueueScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false
        }}
      >
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="GymDetail" component={GymDetailScreen} />
        <Stack.Screen name="Privacy" component={PrivacyScreen} />
        <Stack.Screen name="Terms" component={TermsScreen} />
        <Stack.Screen name="AccountDeletion" component={AccountDeletionScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
