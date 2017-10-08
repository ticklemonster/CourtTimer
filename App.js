import React from 'react';
import { AsyncStorage } from 'react-native';
import { Content, Text } from 'native-base';
import GameScreen from './GameScreen';
import HomeScreen from './HomeScreen';
import EditTeamScreen from './EditTeamScreen';

const HOME_SCREEN = 'home';
const GAME_SCREEN = 'game';
const ADD_SCREEN  = 'add_team';
const EDIT_SCREEN = 'edit_team';

const SAMPLE_TEAM = {
  name: 'Sample Team',
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
const BLANK_TEAM = {
  name: '',
  players: []
}

export default class App extends React.Component {

  constructor() {
    super();
    this.state = {
      isReady: false,
      screen: HOME_SCREEN,
      teams: []
    };

    this.loadTeams();
  }

  async loadTeams() {
    try {
      const savedteams = await AsyncStorage.getItem('@CourtTimer:teams');
      if (savedteams !== null){
        // We have data!!
        console.log('Loaded team data from AsyncStorage: ', savedteams);
        this.setState({ teams: savedteams });
      } else {
        console.log('No team data in AsyncStorage - use sample team.');
        this.setState({ teams: [ SAMPLE_TEAM ]});
      }
    } catch (error) {
      console.log('Error loading data from AsyncStorage: ', error);
    }
  }

  // navigation routes
  toGame = (teamname) => {
    console.log('Go to game screen for team ', teamname );
    this.team = null;
    for( t in this.state.teams ) {
      if( this.state.teams[t].name === teamname ) {
        this.team = this.state.teams[t];
        break;
      }
    }
    if( this.team === null ) {
      this.setState({ screen: HOME_SCREEN });
    } else {
      this.setState({ screen: GAME_SCREEN });
    }
  }

  toHome = () => {
    this.setState({ screen: HOME_SCREEN });
  }

  toAdd = () => {
    console.log('App.js: ADD team');
    this.setState({ screen: ADD_SCREEN });
  }

  // simple screen display selector
  render() {
    if( !this.state.isReady ) {
      return <Expo.AppLoading />;
    }

    // super simple state-based render choice (no stacking)
    switch( this.state.screen ) {
      case HOME_SCREEN:
        return <HomeScreen navGame={ this.toGame } navAdd={ this.toAdd } teams={ this.state.teams } />;
      case GAME_SCREEN:
        return <GameScreen navHome={ this.toHome } team={ this.team }/>;
      case ADD_SCREEN:
        return <EditTeamScreen navHome={ this.toHome } team={ BLANK_TEAM } />;
      default:
        console.log('Unexpected lack of screen name!');
        return <Content><Text>Screen {this.state.screen} does not exist!</Text></Content>;
    }
  }

  // load fonts before displaying anything
  async componentWillMount() {
    await Expo.Font.loadAsync({
      'Roboto': require('native-base/Fonts/Roboto.ttf'),
      'Roboto_medium': require('native-base/Fonts/Roboto_medium.ttf'),
    });
    this.setState( {isReady: true } );
  }

}
