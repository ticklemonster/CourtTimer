import React from 'react';
import { ScreenOrientation } from 'expo';
import { View, ActivityIndicator } from 'react-native';
import { createStackNavigator } from 'react-navigation';

import HomeScreen from './screens/HomeScreen';
import EditTeamScreen from './screens/EditTeamScreen';
import GameScreen from './screens/GameScreen';

const StackNavigator = createStackNavigator({
  HomeScreen: { screen: HomeScreen },
  EditScreen: { screen: EditTeamScreen },
  GameScreen: { screen: GameScreen },
}, {
  initialRouteName: 'HomeScreen',
  navigationOptions: {
    headerMode: 'screen',
    headerStyle: { backgroundColor: '#9ea7aa' },
  },
});

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      ready: false,
    };

    ScreenOrientation.allowAsync(ScreenOrientation.Orientation.ALL_BUT_UPSIDE_DOWN);
  }

  async componentDidMount() {
    // await Expo.Font.loadAsync({
    //   'Roboto': require('native-base/Fonts/Roboto.ttf'),
    //   'Roboto_medium': require('native-base/Fonts/Roboto_medium.ttf'),
    // });

    this.setState({ ready: true });
  }

  render() {
    const { ready } = this.state;

    if (!ready) {
      return (<View style={{ flex: 1 }}><ActivityIndicator size="large" /></View>);
    }

    return (<StackNavigator />);
  }
}
