import React, { createContext, useState, useEffect } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  useColorScheme,
  Platform,
  StyleSheet, // For absolute positioning styles
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
  useTheme,
} from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Dashboard } from 'components/Dashboard';
import 'global.css' // Assuming NativeWind is configured
import InvoiceForm from 'components/InvoiceForm';

// --- 1. Theme Context Setup (Unchanged) ---
const ThemeContext = createContext();
const useThemeContext = () => React.useContext(ThemeContext);

// --- 2. Theme Colors and Configuration (Unchanged) ---
const PRIMARY_COLOR_LIGHT = '#10b981';
const BACKGROUND_COLOR_LIGHT = '#f3f4f6';
const CARD_COLOR_LIGHT = '#FFFFFF';
const TEXT_COLOR_LIGHT = '#1f2937';

const PRIMARY_COLOR_DARK = '#34d399';
const BACKGROUND_COLOR_DARK = '#1f2937';
const CARD_COLOR_DARK = '#374151';
const TEXT_COLOR_DARK = '#f3f4f6';

const CustomDefaultTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: PRIMARY_COLOR_LIGHT,
    background: BACKGROUND_COLOR_LIGHT,
    card: CARD_COLOR_LIGHT,
    text: TEXT_COLOR_LIGHT,
    border: CARD_COLOR_LIGHT,
  },
};

const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: PRIMARY_COLOR_DARK,
    background: BACKGROUND_COLOR_DARK,
    card: CARD_COLOR_DARK,
    text: TEXT_COLOR_DARK,
    border: CARD_COLOR_DARK,
  },
};

// --- 3. Universal Screen Wrapper (Unchanged) ---
const ScreenWrapper = ({ children }) => {
  return (
    <SafeAreaProvider className="flex-1 bg-gray-100 dark:bg-gray-800">
      <View className="flex-1">
        {children}
      </View>
    </SafeAreaProvider>
  );
};

// --- 4. Screen Content Placeholders (Unchanged) ---
const ThemedContent = ({ title }) => {
  return (
    <View className="flex-1 justify-center items-center">
      <Text className="text-xl font-bold text-gray-800 dark:text-gray-100">{title}</Text>
    </View>
  );
};

// --- 5. Screens (Unchanged) ---
const DashboardScreen = () => <ScreenWrapper><Dashboard /></ScreenWrapper>;
const NewInvoiceScreen = () => <ScreenWrapper><InvoiceForm/></ScreenWrapper>;
const HistoryScreen = () => <ScreenWrapper><ThemedContent title="History" /></ScreenWrapper>;
const DriversScreen = () => <ScreenWrapper><ThemedContent title="Drivers" /></ScreenWrapper>;

// --- 6. Dropdown Menu Component (New) ---

const HeaderMenu = () => {
  const { toggleTheme, themeMode } = useThemeContext();
  const { colors } = useTheme();
  const [menuVisible, setMenuVisible] = useState(false);

  // Icon name for the 3-dots menu button (Vertical Ellipsis)
  const menuIconName = 'ellipsis-vertical';

  // Toggle button for Theme Switcher
  const ThemeSwitchButton = () => {
    const iconName = themeMode === 'light' ? 'moon-outline' : 'sunny-outline';
    const text = themeMode === 'light' ? 'Switch to Dark' : 'Switch to Light';

    return (
      <TouchableOpacity
        onPress={() => {
          toggleTheme();
          setMenuVisible(false); // Close menu after switching
        }}
        className="flex-row items-center p-3 rounded-lg"
        style={{ backgroundColor: colors.background }} // Use background for item touch feedback
      >
        <Ionicons name={iconName} size={20} color={colors.text} />
        <Text style={{ color: colors.text }} className="ml-3 font-medium text-base">
          {text}
        </Text>
      </TouchableOpacity>
    );
  };
  
  // Placeholder for another menu item
  const ProfileButton = () => (
    <TouchableOpacity
        onPress={() => {
            alert('View Profile');
            setMenuVisible(false);
        }}
        className="flex-row items-center p-3 rounded-lg"
        style={{ backgroundColor: colors.background }}
    >
        <Ionicons name="person-circle-outline" size={20} color={colors.text} />
        <Text style={{ color: colors.text }} className="ml-3 font-medium text-base">
            Profile
        </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.menuContainer}>
      {/* 3-Dot Menu Button */}
      <TouchableOpacity
        onPress={() => setMenuVisible(!menuVisible)}
        className="p-2 mr-2"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name={menuIconName} size={24} color={colors.text} />
      </TouchableOpacity>

      {/* Dropdown Content */}
      {menuVisible && (
        // The View needs to be absolutely positioned relative to its container (the Tab.Navigator header)
        <View
          style={[
            styles.dropdown,
            { backgroundColor: colors.card, borderColor: colors.border + '30' }
          ]}
          className="shadow-xl dark:shadow-2xl" // Apply shadow with NativeWind
        >
          <ProfileButton />
          <View className="h-px w-full my-1" style={{ backgroundColor: colors.border + '15' }} />
          <ThemeSwitchButton />
        </View>
      )}
    </View>
  );
};

// Styles for absolute positioning of the dropdown
const styles = StyleSheet.create({
  menuContainer: {
    // This container is the headerRight element
    position: 'relative',
    zIndex: 1000, // Ensure the dropdown is on top of screen content
    height: '100%', // Take full height for better alignment
    justifyContent: 'center',
  },
  dropdown: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 50 : 55, // Position below the header button (adjust as needed)
    right: 10, // Align to the right
    width: 200,
    borderRadius: 8,
    padding: 8,
    // Native shadow replacement for better cross-platform support if needed
    elevation: 10, // Android shadow
  },
});

// --- 7. Bottom Tabs ---
const Tab = createBottomTabNavigator();

// --- 8. Main App Component (Updated) ---

export default function App() {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState(systemColorScheme);

  useEffect(() => {
    if (!themeMode) { 
        setThemeMode(systemColorScheme);
    }
  }, [systemColorScheme, themeMode]);


  const toggleTheme = () => {
    setThemeMode(currentMode => currentMode === 'light' ? 'dark' : 'light');
  };

  const theme = themeMode === 'dark' ? CustomDarkTheme : CustomDefaultTheme;
  const contextValue = React.useMemo(() => ({ themeMode, toggleTheme }), [themeMode]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <NavigationContainer theme={theme}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: true, 
            
            // --- HEADER COMPONENTS ---
            // 1. Remove headerLeft
            headerLeft: () => null, 
            // 2. Use the new HeaderMenu for headerRight
            headerRight: () => <HeaderMenu />, 
            
            // Header styles use NavigationContainer theme colors
            headerStyle: {
              backgroundColor: theme.colors.card,
              shadowColor: 'transparent',
              borderBottomWidth: 0,
              ...Platform.select({
                android: { elevation: 0 },
                ios: { shadowOpacity: 0 },
              }),
            },
            headerTitleStyle: {
              fontWeight: '700',
              fontSize: 20,
              color: theme.colors.text,
            },

            // --- TAB BAR ICONS & STYLES (Unchanged) ---
            tabBarIcon: ({ color, size }) => {
              const icons = {
                Dashboard: 'home',
                'New Invoice': 'document-text',
                History: 'time',
                Drivers: 'people',
              };
              const iconName = color === theme.colors.primary ? icons[route.name] : `${icons[route.name]}-outline`;
              return <Ionicons name={iconName} size={size} color={color} />;
            },

            tabBarActiveTintColor: theme.colors.primary,
            tabBarInactiveTintColor: theme.colors.text + '80',
            tabBarLabelStyle: { fontWeight: '600' },
            tabBarStyle: {
              backgroundColor: theme.colors.card,
              borderTopWidth: 0,
              paddingTop: 4,
              paddingBottom: 8,
              height: 80,
              ...Platform.select({
                android: { elevation: 0 },
                ios: { shadowOpacity: 0 },
              }),
            },
          })}
        >
          <Tab.Screen name="Dashboard" component={DashboardScreen} />
          <Tab.Screen name="New Invoice" component={NewInvoiceScreen} />
          <Tab.Screen name="History" component={HistoryScreen} />
          <Tab.Screen name="Drivers" component={DriversScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </ThemeContext.Provider>
  );
}