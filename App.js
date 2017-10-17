import React from 'react';
import { AsyncStorage, ActivityIndicator } from 'react-native';
import { Content, Text } from 'native-base';
import GameScreen from './GameScreen';
import HomeScreen from './HomeScreen';
import EditTeamScreen from './EditTeamScreen';

const HOME_SCREEN = 'home';
const GAME_SCREEN = 'game';
const ADD_SCREEN  = 'add_team';
const EDIT_SCREEN = 'edit_team';

const SAMPLE_TEAM = {
  key: -1,
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
  key: null,
  name: null,
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

    //AsyncStorage.clear();

    this.loadTeams();

    //AsyncStorage.clear();
  }

  // load/save teams
  async loadTeams() {
    try {
      const savedteamsStr = await AsyncStorage.getItem('@CourtTimer:teams');
      const savedteams = await JSON.parse(savedteamsStr);
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

  saveTeam = async ( teamdata ) => {
    if( teamdata.key < 0 ) return;  // don't save the sample teamdata

    let found = false;
    let maxKey = 0;
    let newTeams = [];
    for( let t in this.state.teams ) {
      let currentTeam = this.state.teams[t];
      maxKey = (maxKey>currentTeam.key)?maxKey:currentTeam.key;
      //console.log('SAVE: looking for: ' + teamdata.key + ' item ' + t + ': ' + currentTeam.key);
      if( currentTeam.key === teamdata.key ) {
        console.log('saveTeam is updating an existing team ('+currentTeam.key+')');
        found = true;
        newTeams.push( teamdata );
      }
      else if( currentTeam.key >= 0 ){
        newTeams.push( currentTeam );
      }
    }
    if( !found ) {
      teamdata.key = maxKey+1;
      console.log('New team - create new key: ' + teamdata.key );
      newTeams.push(teamdata)
    }

    await AsyncStorage.setItem('@CourtTimer:teams', JSON.stringify(newTeams) );
    this.setState({ teams: newTeams });
  }

  deleteTeam = async (teamkey) => {
    let newTeams = [];
    for( let t in this.state.teams ) {
      let currentTeam = this.state.teams[t];
      if( currentTeam.key === teamkey ) {
        console.log('deleteTeam(' + teamkey + ') will delete');
      } else {
        newTeams.push( currentTeam );
      }
    }
    await AsyncStorage.setItem('@CourtTimer:teams', JSON.stringify(newTeams) );
    this.setState({ teams: newTeams });
  }

  // navigation routes
  toGame = (teamkey) => {
    console.log('Go to game screen for team key='+teamkey );
    this.team = null;
    for( t in this.state.teams ) {
      if( this.state.teams[t].key === teamkey ) {
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
    this.team = null;
    this.setState({ screen: ADD_SCREEN });
  }

  toEdit = (teamkey) => {
    console.log('Go to edit screen for team key='+teamkey );
    this.team = null;
    for( t in this.state.teams ) {
      if( this.state.teams[t].key === teamkey ) {
        this.team = this.state.teams[t];
        break;
      }
    }
    if( this.team === null ) {
      this.setState({ screen: HOME_SCREEN });
    } else {
      this.setState({ screen: EDIT_SCREEN });
    }

  }

  // simple screen display selector
  render() {
    if( !this.state.isReady ) {
      return <ActivityIndicator />;
    }

    // super simple state-based render choice (no stacking)
    switch( this.state.screen ) {
      case HOME_SCREEN:
        return <HomeScreen nav={{game: this.toGame, add: this.toAdd, edit: this.toEdit}} teams={ this.state.teams } />;
      case GAME_SCREEN:
        return <GameScreen nav={{home: this.toHome}} team={ this.team }/>;
      case ADD_SCREEN:
        return <EditTeamScreen nav={{home: this.toHome, save: this.saveTeam}} team={ BLANK_TEAM } />;
      case EDIT_SCREEN:
        return <EditTeamScreen nav={{ home: this.toHome, save: this.saveTeam,
          delete: this.deleteTeam }} team={ this.team } />;
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
