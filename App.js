import React from 'react';
import { View } from 'react-native';
import { Container, Header, Content, Footer, Left, Body, Right, FooterTab, Button, Title, List, ListItem, Text, Icon, H1 } from 'native-base';
import TimeText from './timetext';
import PlayerList from './playerlist';

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      isReady: false,
      teamName: 'Lakers B04',
      players: [
        { key: 4, name: 'Ben', gameTime: 0 },
        { key: 6, name: 'Jaimyn', gameTime: 0 },
        { key: 7, name: 'Ayden', gameTime: 0 },
        { key: 9, name: 'Euan', gameTime: 0 },
        { key: 10, name: 'Chris', gameTime: 0 },
        { key: 11, name: 'Sam', gameTime: 0 },
        { key: 13, name: 'Jack', gameTime: 0 },
        { key: 14, name: 'Alex', gameTime: 0 }
      ],
      isRunning: false,
      msecs: 1200000
    };
  }

  updatePlayerTimes( player_array, elapsed )
  {
    let rval = [];
    for( p in player_array ) {
      let player = Object.assign({},player_array[p]); // force object shallow copy
      if( player.onCourt ) {
        player.gameTime += elapsed;
      }
      rval.push( player );
    }

    return rval;
  }

  tick = () => {
    if( !this.state.isRunning ) return;

    let now = new Date();
    let elapsed = now - this.lastTick;
    let newtime = this.state.msecs - elapsed;
    if( newtime < 0 ) {
      this.stopTimer();
      newtime = 0;
    }
    newPlayers = this.updatePlayerTimes( this.state.players, elapsed );
    this.setState({ msecs: newtime, players: newPlayers });
    this.lastTick = now;
  }

  startTimer() {
    this.lastTick = new Date();
    this.intervalId = setInterval(this.tick, 1000);
    this.setState({ isRunning: true });
  }

  stopTimer() {
    clearInterval(this.intervalId)
    this.setState({
      isRunning: false,
      //msecs: this.state.msecs + (new Date() - this.lastTick)
    });
  }

  toggleTimer = () => {
    if( this.state.isRunning ) {
      this.stopTimer();
    } else {
      this.startTimer();
    }
  }

  playerPressed = (item) => {
    playerIdx = -1;
    onCourtCount = 0;
    for( p=0; p<this.state.players.length; p++ ) {
      if(this.state.players[p].key === item.key) {
        playerIdx = p;
      }
      if( this.state.players[p].onCourt ) onCourtCount++;
    }
    if( playerIdx < 0 ) return;

    //item.onCourt = (item.onCourt)?false:true;
    console.log('App found player to update: ' + this.state.players[playerIdx].name + ' is now on ' + (item.onCourt?'court':'bench') );

    newPlayers = this.state.players.slice(0,playerIdx)
      .concat([item])
      .concat( this.state.players.slice(playerIdx+1) );

    this.setState( { players: newPlayers } );
  }

  render() {
    if( !this.state.isReady ) {
      return <Expo.AppLoading />;
    }

    return (
      <Container>
        <Header>
          <Left>
            <Button transparent>
              <Icon name='menu' />
            </Button>
          </Left>
          <Body>
            <Title>Court Timer</Title>
          </Body>
        </Header>
        <Content>
          <View style={{flex: 3, alignContent: 'center'}}>
            <Button transparent full large onPress={this.toggleTimer}>
              <Icon name={this.state.isRunning?'pause':'play'}/>
              <TimeText msecs={this.state.msecs} />
            </Button>
          </View>

          <View style={{flex: 3}}>
          <PlayerList players={this.state.players} onPress={ this.playerPressed }/>
          </View>
        </Content>
        <Footer>
          <FooterTab>
            <Button transparent>
              <Text>Footer</Text>
            </Button>
          </FooterTab>
        </Footer>
      </Container>
    );
  }

  async componentWillMount() {
    await Expo.Font.loadAsync({
      'Roboto': require('native-base/Fonts/Roboto.ttf'),
      'Roboto_medium': require('native-base/Fonts/Roboto_medium.ttf'),
    });
    this.setState( {isReady: true } );
  }

}
