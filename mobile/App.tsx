import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { LoginScreen } from "./src/screens/LoginScreen";
import { DashboardScreen } from "./src/screens/DashboardScreen";
import { ProjectsScreen } from "./src/screens/ProjectsScreen";
import { NotificationsScreen } from "./src/screens/NotificationsScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { MoreScreen } from "./src/screens/MoreScreen";
// Stack screens (accessed from More)
import { PropertiesScreen } from "./src/screens/PropertiesScreen";
import { CustomersScreen } from "./src/screens/CustomersScreen";
import { TransactionsScreen } from "./src/screens/TransactionsScreen";
import { ExpensesScreen } from "./src/screens/ExpensesScreen";
import { LandTitlesScreen } from "./src/screens/LandTitlesScreen";
import { ReportsScreen } from "./src/screens/ReportsScreen";
import { colors } from "./src/constants/theme";
import { ActivityIndicator, View } from "react-native";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const MoreStack = createNativeStackNavigator();

const HEADER_OPTS = {
  headerStyle: { backgroundColor: colors.surface },
  headerTintColor: colors.text,
  headerTitleStyle: { fontWeight: "800" as const, fontSize: 17 },
  headerShadowVisible: false,
};

// Stack navigator for "More" section
function MoreNavigator() {
  return (
    <MoreStack.Navigator screenOptions={HEADER_OPTS}>
      <MoreStack.Screen name="MoreHome" component={MoreScreen} options={{ title: "More" }} />
      <MoreStack.Screen name="Properties" component={PropertiesScreen} options={{ title: "Properties" }} />
      <MoreStack.Screen name="Customers" component={CustomersScreen} options={{ title: "Customers" }} />
      <MoreStack.Screen name="Transactions" component={TransactionsScreen} options={{ title: "Transactions" }} />
      <MoreStack.Screen name="Expenses" component={ExpensesScreen} options={{ title: "Expenses" }} />
      <MoreStack.Screen name="Documents" component={LandTitlesScreen} options={{ title: "Land Title Documents" }} />
      <MoreStack.Screen name="Reports" component={ReportsScreen} options={{ title: "Reports & Analytics" }} />
    </MoreStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        ...HEADER_OPTS,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: 6,
          height: 62,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textDim,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, [string, string]> = {
            Dashboard:     ["grid",                "grid-outline"],
            Projects:      ["map",                 "map-outline"],
            Notifications: ["notifications",       "notifications-outline"],
            More:          ["apps",                "apps-outline"],
            Profile:       ["person-circle",       "person-circle-outline"],
          };
          const [active, inactive] = icons[route.name] || ["ellipse", "ellipse-outline"];
          return <Ionicons name={(focused ? active : inactive) as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Projects" component={ProjectsScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen}
        options={({ navigation }) => ({
          headerShown: true,
          title: "Notifications",
          tabBarBadge: undefined, // will be set dynamically via context if needed
        })} />
      <Tab.Screen name="More" component={MoreNavigator} options={{ headerShown: false }} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user
        ? <Stack.Screen name="Main" component={MainTabs} />
        : <Stack.Screen name="Login" component={LoginScreen} />}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
