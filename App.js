import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { Colors, DefaultTheme, Provider as PaperProvider } from 'react-native-paper';

import TopAppBar from './components/TopAppBar';
import TeamListScreen from './screens/TeamListScreen';
import EditTeamScreen from './screens/EditTeamScreen';
import EditPlayerScreen from './screens/EditPlayerScreen';
import GameScreen from './screens/GameScreen';
import PreferencesScreen from './screens/PreferencesScreen';

const theme = {
  ...DefaultTheme,
  roundness: 2,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.blue600,
    accent: Colors.purple800,
  },
};

const Stack = createNativeStackNavigator();

function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        theme={theme}
        initialRouteName="Teams"
        screenOptions={{ header: TopAppBar }}
      >
        <Stack.Screen name="Preferences" component={PreferencesScreen} />
        <Stack.Screen name="Game" component={GameScreen} />
        <Stack.Screen name="Edit.Team" component={EditTeamScreen} options={{ title: 'Edit Team', onSave: null }} />
        <Stack.Screen name="Edit.Player" component={EditPlayerScreen} options={{ title: 'Edit Player' }} />
        <Stack.Screen name="Teams" component={TeamListScreen} options={{ title: 'Court Timer', showSettings: true }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// The App is the AppNavigator wrapped in a PaperProvider (for a theme)
function App() {
  return (
    <PaperProvider theme={theme}>
      <AppNavigator />
    </PaperProvider>
  );
}

export default App;
