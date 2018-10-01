import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createStackNavigator } from 'react-navigation';

import HomeScreen from './screens/HomeScreen';
import EditTeamScreen from './screens/EditTeamScreen';
import GameScreen from './screens/GameScreen';

const StackNavigator = createStackNavigator({
  'HomeScreen': { screen: HomeScreen },
  'EditScreen': { screen: EditTeamScreen },
  'GameScreen': { screen: GameScreen },
}, {
  initialRouteName: 'HomeScreen',
  navigationOptions: {
    headerStyle: { backgroundColor: '#9ea7aa' },
  }
});

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      ready: false,
    }
  }
  render() {
    if (!this.state.ready) {
      return (<View style={{flex:1}}><ActivityIndicator size='large'/></View>);
    }

    return (<StackNavigator screenProps={{balance: true}}/>);
  }

  async componentWillMount() {
    // TODO - preload things needed before the Navigator...
    
    this.setState({ready: true});
  }
}