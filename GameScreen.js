import React from 'react';
import { View } from 'react-native';
import { Container, Header, Content, Footer, Left, Body, Right, FooterTab, Button, Title, List, ListItem, Text, Icon, H1 } from 'native-base';
import TimeText from './timetext';
import PlayerList from './playerlist';

const DEFAULT_TIME = 1200000;

export default class GameScreen extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isRunning: false,
      msecs: DEFAULT_TIME,
      players: [ ...props.team.players ]
    };

  }

  updatePlayerTimes( player_array, elapsed )
  {
    let rval = [];
    for( p in player_array ) {
      let player = Object.assign({},player_array[p]); // force object shallow copy
      if( player.onCourt ) {
        if( !player.gameTime ) player.gameTime = 0;
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

  resetTimer = () => {
    // stop the timer and reset to the default time
    if( this.state.isRunning ) {
      this.stopTimer();
    }

    // remove all player selection markers and take all off-court
    let newPlayers = [];
    for( let p=0; p<this.state.players.length; p++ ) {
      let player = Object.assign({},this.state.players[p]);
      player.selected = false;
      player.onCourt = false;
      newPlayers.push( player );
    }


    this.setState({
      msecs: DEFAULT_TIME,
      players: newPlayers
    });
  }

  playerSelected = (playerKey) => {
    // copy the player array and update the selected player
    let newPlayers = [];
    for( let p=0; p<this.state.players.length; p++ ) {
      let player = Object.assign({},this.state.players[p]);
      if( player.key === playerKey ) {
        player.selected = (player.selected)?false:true;
      }
      newPlayers.push( player );
    }

    this.setState( { players: newPlayers } );
  }

  subPlayers = () => {
    // copy the player array and swap selected players on/off court
    let newPlayers = [];
    for( let p in this.state.players ) {
      let player = Object.assign({},this.state.players[p]);
      if( player.selected === true ) {
        player.onCourt = (player.onCourt)?false:true;
        player.selected = false;
      }
      newPlayers.push( player );
    }

    this.setState( { players: newPlayers } );

  }

  render() {
    return (
      <Container>
        <Header>
          <Left>
            <Button transparent>
              <Icon name='arrow-back' onPress={ this.props.nav.home } />
            </Button>
          </Left>
          <Body>
            <Title>Court Timer - {this.props.team.name}</Title>
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
          <PlayerList players={this.state.players} onPress={ this.playerSelected }/>
          </View>
        </Content>
        <Footer>
          <FooterTab>
            <Left>
              <Button full onPress={this.toggleTimer}>
                <Icon name='alarm' /><Text>{ (this.state.isRunning ? 'STOP' : 'START') }</Text>
              </Button>
            </Left>
            <Body>
              <Button full onPress={this.subPlayers}>
                <Icon name='swap' /><Text>SUBS</Text>
              </Button>
            </Body>
            <Right>
              <Button full onPress={this.resetTimer}>
                <Icon name='refresh' /><Text>RESET</Text>
              </Button>
            </Right>
          </FooterTab>
        </Footer>
      </Container>
    );
  }

  componentWillMount() {

  }

  componentWillUnmount() {
    this.stopTimer();
  }

}
