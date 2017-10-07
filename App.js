import React from 'react';
import { View } from 'react-native';
import { Text } from 'native-base';
import GameScreen from './GameScreen';
import HomeScreen from './HomeScreen';
import EditTeamScreen from './EditTeamScreen';

const HOME_SCREEN = 'home';
const GAME_SCREEN = 'game';
const ADD_SCREEN  = 'add_team';
const EDIT_SCREEN = 'edit_team';

const TEAM = {
  name: 'Lakers B04',
  players: [
    { key: 4, name: 'Ben', gameTime: 0 },
    { key: 6, name: 'Jaimyn', gameTime: 0 },
    { key: 7, name: 'Ayden', gameTime: 0 },
    { key: 9, name: 'Euan', gameTime: 0 },
    { key: 10, name: 'Chris', gameTime: 0 },
    { key: 11, name: 'Sam', gameTime: 0 },
    { key: 13, name: 'Jack', gameTime: 0 },
    { key: 14, name: 'Alex', gameTime: 0 }
  ]
}
export default class App extends React.Component {

  constructor() {
    super();
    this.state = {
      isReady: false,
      screen: HOME_SCREEN
    };
  }

  toGame = (teamname) => {
    this.setState({ screen: GAME_SCREEN });
  }

  toHome = () => {
    this.setState({ screen: HOME_SCREEN });
  }

  toAdd = () => {
    console.log('App.js: ADD team');
    this.setState({ screen: ADD_SCREEN });
  }

  render() {
    if( !this.state.isReady ) {
      return <Expo.AppLoading />;
    }

//    console.log('Render screen from state: ', this.state.screen );
    switch( this.state.screen ) {
      case HOME_SCREEN:
        return <HomeScreen navGame={ this.toGame } navAdd={ this.toAdd } />;
      case GAME_SCREEN:
        return <GameScreen navHome={ this.toHome } team={ TEAM }/>;
      case ADD_SCREEN:
        return <EditTeamScreen navHome={ this.toHome } team={ TEAM } />;
      default:
        console.log('Unexpected lack of screen name!');
        return <View><Text>Screen {this.state.screen} does not exist!</Text></View>;
    }
  }

  async componentWillMount() {
    await Expo.Font.loadAsync({
      'Roboto': require('native-base/Fonts/Roboto.ttf'),
      'Roboto_medium': require('native-base/Fonts/Roboto_medium.ttf'),
    });
    this.setState( {isReady: true } );
  }

}
