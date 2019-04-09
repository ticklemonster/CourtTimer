import React from 'react';
import { ScreenOrientation } from 'expo';
import {
  ActivityIndicator, AsyncStorage,
  UIManager, View,
} from 'react-native';

import { Colors, DefaultTheme, Provider as PaperProvider } from 'react-native-paper';

import TeamListScreen from './screens/TeamListScreen';
import EditTeamScreen from './screens/EditTeamScreen';
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


const WaitScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator size="large" /></View>
);

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      screen: null,
      id: null,
      ready: false,
      prefs: {},
    };

    // enable screen rotation
    ScreenOrientation.allowAsync(ScreenOrientation.Orientation.ALL_BUT_UPSIDE_DOWN);

    // enable animations
    // UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);

    // bind event handlers
  }

  async componentDidMount() {
    // Load saved state
    console.debug('App.js DID MOUNT');

    const prefsAsStr = await AsyncStorage.getItem('@CourtTimer/prefs');
    const prefs = JSON.parse(prefsAsStr);

    const screen = await AsyncStorage.getItem('@CourtTimer/currentView');
    const id = await AsyncStorage.getItem('@CourtTimer/currentKey');

    this.setState({ ready: true, screen: screen || 'TEAM_LIST', id, prefs });
  }

  componentWillUnmount() {
  }

  changeScreen(toScreen, toId) {
    AsyncStorage.setItem('@CourtTimer/currentView', toScreen);
    AsyncStorage.setItem('@CourtTimer/currentKey', toId);

    this.setState({ screen: toScreen, id: toId });
  }

  async updatePrefs(newprefs) {
    const { prefs } = this.state;

    const mixedPrefs = Object.assign({}, prefs, newprefs);
    const prefsAsStr = JSON.stringify(mixedPrefs);

    await AsyncStorage.setItem('@CourtTimer/prefs', prefsAsStr);
    this.setState({ prefs: mixedPrefs });
  }

  onEditSave = () => {
    console.log('SAVE EDITS')
  }

  render() {
    const { ready, screen, id, prefs } = this.state;

    if (!ready) {
      return (<WaitScreen />);
    }

    return (
      <PaperProvider theme={theme}>
        { screen === 'PREFERENCES' && (
          <PreferencesScreen
            prefs={prefs}
            theme={theme}
            onBack={(p) => { this.updatePrefs(p); this.changeScreen('TEAM_LIST', null); } }
          />
        )}
        { screen === 'GAME_TIMER' && (
          <GameScreen
            prefs={prefs}
            theme={theme}
            id={id}
            onBack={() => { this.changeScreen('TEAM_LIST', null); }}
          />
        )}
        { screen === 'EDIT_TEAM' && (
          <EditTeamScreen
            prefs={prefs}
            theme={theme}
            id={id}
            onBack={() => { this.changeScreen('TEAM_LIST', null); }}
            onSave={this.onEditSave}
          />
        )}
        { screen === 'TEAM_LIST' && (
          <TeamListScreen
            theme={theme}
            prefs={prefs}
            onEdit={(k) => { this.changeScreen('EDIT_TEAM', k); }}
            onPlay={(k) => { this.changeScreen('GAME_TIMER', k); }}
            onNavigate={(scr, key) => this.changeScreen(scr, key)}
          />
        )}
      </PaperProvider>
    );
  }
}
