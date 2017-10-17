import React from 'react';
import { View } from 'react-native';
import { Container, Header, Body, Left, Right, Title, Content,
  Footer, FooterTab, Button, Icon, Form, Item, Input, Label, Text, Separator
  } from 'native-base';


export default class EditTeamScreen extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      name: props.team.name,
      players: [...props.team.players],
      addNewEnabled: false
    };

    this._newPlayerNumber = null;
    this._newPlayerName = null;
  }

  // updateAddNewButtonState
  // - The add new player button should be enabled when
  //   both Number and Name have content
  updateAddNewButtonState() {
    let enabledState = (
      this._newPlayerName && this._newPlayerName > '' &&
      this._newPlayerNumber && this._newPlayerNumber > '' );

    if( enabledState != this.state.addNewEnabled )
      this.setState({ addNewEnabled: enabledState });
  }

  newNumberChanged = (text) => {
    this._newPlayerNumber = text;
    this.updateAddNewButtonState();
  }

  newNameChanged = (text) => {
    this._newPlayerName = text;
    this.updateAddNewButtonState();
  }

  // adds a new player to the list (based on this._newPlayerNumber and ...Name)
  addNewPlayer = () => {
    if( !this.state.addNewEnabled ) return;

    let newPlayer = {
      key: this._newPlayerNumber,
      name: this._newPlayerName
    };
    this._newPlayerName = null;
    this._newPlayerNumber = null;

    this.setState({
      players: [...this.state.players, newPlayer ],
      addNewEnabled: false
    });
  }

  // Update team name...
  updateTeamName = (newName) => {
    this.setState({ name: newName });
  }

  // Update existing player in list functions...
  updatePlayerKey = (fromKey,e) => {
    console.log('try to update player key for {key:' + fromKey + '} to ' + e.nativeEvent.text );
    let newplayers = [];
    let newValue = e.nativeEvent.text;
    for( p in this.state.players ) {
      let player = Object.assign({},this.state.players[p]); //copy player obj
      if( player.key === fromKey ) {
        player.key = newValue;
      }
      newplayers.push(player);
    }

    this.setState({ players: newplayers });
  }

  updatePlayerName = (fromKey,e) => {
    console.log('try to update player name for {key:', fromKey, '} to ', e.nativeEvent.text );
    let newplayers = [];
    let newValue = e.nativeEvent.text;
    for( p in this.state.players ) {
      let player = Object.assign({},this.state.players[p]);
      if( player.key === fromKey ) {
        player.name = newValue;
      }
      newplayers.push(player);
    }

    this.setState({ players: newplayers });
  }

  deletePlayer = (key) => {
    console.log('DeletePlayer: ' + key);
    let newplayers = [];
    for( p in this.state.players ) {
      let player = Object.assign({},this.state.players[p]);
      if( player.key !== key ) newplayers.push(player);
    }

    this.setState({ players: newplayers });
  }

  saveEdits = () => {
    let team = {
      key: this.props.team.key,
      name: this.state.name,
      players: this.state.players
    };
    this.props.nav.save( team );
    this.props.nav.home();
  }

  confirmDelete = () => {
    console.log('TODO: Should delete team with key = ', this.props.team.key );
    this.props.nav.delete( this.props.team.key );
    this.props.nav.home();
  }

  render() {
    console.log('EditTeamScreen with name: ' + this.state.name + ' players: ' + this.state.players.length );

    return (
      <Container>
        <Header>
          <Left>
            <Button transparent>
              <Icon name='arrow-back' onPress={this.props.nav.home} />
            </Button>
          </Left>
          <Body>
            <Title>Edit Team Details</Title>
          </Body>
          <Right>
            <Button transparent onPress={ this.saveEdits }>
              <Text>Save</Text>
            </Button>
          </Right>
        </Header>
        <Content>
          <Form>
            <Separator style={{marginTop: 20}}><Label>Team Name</Label></Separator>
            <Item>
              <Input underline style={{fontWeight: 'bold'}}
                onEndEditing={(e) => this.updateTeamName(e.nativeEvent.text)}
                placeholder="Enter team name">
                {this.state.name}
              </Input>
            </Item>

            <Separator style={{marginTop: 20}}><Label>Team Roster</Label></Separator>
            { this.state.players.map( (player) => {
              return (<Item key={player.key}>
                <Input style={{flex: 1}}
                  onEndEditing={ (e) => this.updatePlayerKey(player.key,e) }>
                  {player.key}
                </Input>
                <Input style={{flex: 4}}
                  onEndEditing={ (e) => this.updatePlayerName(player.key,e)} >
                  {player.name}
                </Input>
                <Icon name='close-circle' style={{color: 'red'}}
                  onPress={ () => this.deletePlayer(player.key) }
                />
              </Item>);
            }) }
          </Form>

          <Form style={{marginTop: 60, backgroundColor: '#ccf'}}>
            <Item>
              <Input placeholder='#' keyboardType='numeric' style={{flex: 1}}
                onChangeText={ this.newNumberChanged } >
                { this._newPlayerNumber }
              </Input>
              <Input placeholder='New player name' autoCapitalize='words'
                style={{flex: 4}} onChangeText={ this.newNameChanged }
                onEndEditing={ this.addNewPlayer }>
                { this._newPlayerName }
              </Input>
              <Button primary disabled={ !this.state.addNewEnabled }
                onPress={ this.addNewPlayer } >
                <Icon name='add' />
              </Button>
            </Item>
          </Form>

        </Content>
        <Footer>
          <FooterTab>
            <Left><Button onPress={this.props.nav.home}><Icon name='close'/><Text>Cancel</Text></Button></Left>
            <Body><Button full critical onPress={this.confirmDelete}><Icon name='trash'/><Text>Delete</Text></Button></Body>
            <Right><Button primary onPress={this.saveEdits}><Icon name='checkmark'/><Text>Save</Text></Button></Right>
          </FooterTab>
        </Footer>
      </Container>
    );
  }

}
