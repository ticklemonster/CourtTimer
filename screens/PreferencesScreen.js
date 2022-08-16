import React, { useState, useEffect } from 'react';
import { View, BackHandler } from 'react-native';
import { ActivityIndicator, List, Switch } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PropTypes from 'prop-types';

import { styles } from '../styles/CourtTimerStyles';

const DEFAULT_PREFS = {
  showMembersAsList: true,
  balancePlayers: false,
};

async function loadPrefs() {
  const prefsAsStr = await AsyncStorage.getItem('@CourtTimer/prefs');

  if (prefsAsStr === null) return { ...DEFAULT_PREFS };
  return JSON.parse(prefsAsStr);
}

async function savePrefs(prefs) {
  const prefsAsStr = JSON.stringify(prefs);
  await AsyncStorage.setItem('@CourtTimer/prefs', prefsAsStr);
}

function PreferencesScreen({ navigation }) {
  const onBackPressed = () => {
    if (navigation.canGoBack()) navigation.goBack();
    return true;
  };

  const [prefs, setPrefs] = useState(null);
  useEffect(() => {
    loadPrefs().then((p) => setPrefs(p));
    BackHandler.addEventListener('hardwareBackPress', onBackPressed);

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', onBackPressed);
    };
  }, []);

  const updatePref = async (key, val) => {
    const newPrefs = { ...prefs };
    newPrefs[key] = val;
    await savePrefs(newPrefs);
    setPrefs(newPrefs);
  };

  const prefSwitch = (name) => (
    <Switch
      value={prefs[name]}
      onValueChange={(v) => { updatePref(name, v); }}
    />
  );

  if (prefs === null) {
    return <ActivityIndicator size="large" style={styles.centered} />;
  }

  return (
    <View style={styles.container}>
      <List.Item
        title="Show Team Members as list"
        description="Team members can be displayed in a list or as chips"
        right={() => prefSwitch('showMembersAsList')}
      />

      <List.Item
        title="Auto-select subs"
        description="Choose a substitue player automatically based on the time spent on-court"
        right={() => prefSwitch('balancePlayers')}
      />

    </View>
  );
}

PreferencesScreen.propTypes = {
  navigation: PropTypes.shape({
    canGoBack: PropTypes.func.isRequired,
    goBack: PropTypes.func,
  }).isRequired,
};

export default PreferencesScreen;
export { loadPrefs, savePrefs };
