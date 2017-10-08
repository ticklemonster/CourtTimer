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
      newPlayerName: '',
      newPlayerKey: ''
    };
  }

  editNewPlayerName = (e) => {
    if( !e.nativeEvent.text || e.nativeEvent.text.length < 1 ) return;
    this.shouldAddNewPlayer({ key: '', name: e.nativeEvent.text });
    this._newNameText._root.clear();
  }

  editNewPlayerNumber = (e) => {
    if( !e.nativeEvent.text || e.nativeEvent.text.length < 1 ) return;
    this.shouldAddNewPlayer({ key: e.nativeEvent.text, name: '' });
    this._newNumberText._root.clear();
  }

  shouldAddNewPlayer = ( player_obj ) => {
    console.log('ShouldAddNewPlayer: ', player_obj );
    if( player_obj.key || player_obj.name ) {
      this.setState({
        players: [...this.state.players, player_obj ],
        newPlayerName: '',
        newPlayerKey: ''
      });
    } else {
      console.log(' - not valid. ignore');
    }
  }

  updatePlayerKey = (fromKey,e) => {
    console.log('try to update player key for {key:' + fromKey + '} to ' + e.nativeEvent.text );
    let newplayers = [];
    for( p in this.state.players ) {
      let player = Object.assign({},this.state.players[p]);
      if( player.key === fromKey ) {
        player.key = e.nativeEvent.text;
      }
      newplayers.push(player);
    }

    this.setState({ players: newplayers });
  }

  updatePlayerName = (fromKey,e) => {
    console.log('try to update player name for {key:', fromKey, '} to ', e.nativeEvent.text );
    let newplayers = [];
    for( p in this.state.players ) {
      let player = Object.assign({},this.state.players[p]);
      if( player.key === fromKey ) {
        player.name = e.nativeEvent.text;
      }
      newplayers.push(player);
    }

    this.setState({ players: newplayers });
  }

  render() {
    console.log('EditTeamScreen with team name: ' + this.state.name + ' players: ', this.state.players );
    return (
      <Container>
        <Header>
          <Body>
            <Title>Edit Team Details</Title>
          </Body>
          <Right>
            <Button transparent>
              <Icon name='arrow-back' onPress={this.props.navHome} />
            </Button>
          </Right>
        </Header>
        <Content>
          <Form>
            <Item fixedLabel>
              <Label>Team Name:</Label>
              <Input underline style={{fontWeight: 'bold'}}
                placeholder="Enter team name">{this.state.name}</Input>
            </Item>

            <Separator style={{marginTop: 20}}><Label>Team Roster</Label></Separator>
            { this.state.players.map( (player) => {
              return (<Item key={player.key}>
                <Input style={{flex: 1}}
                  onEndEditing={ (e) => this.updatePlayerKey(player.key,e) }>
                  {player.key}
                </Input>
                <Input style={{flex: 4}} onEndEditing={ (e) => this.updatePlayerName(player.key,e)}>{player.name}</Input>
                <Icon name='close-circle' style={{color: 'red'}} />
              </Item>);
            }) }

            <Item>
              <Input placeholder='#' keyboardType='numeric' style={{flex: 1}}
                onEndEditing={ this.editNewPlayerNumber } ref={ (c) => this._newNumberText = c }>
                {this.state.newPlayerKey}
              </Input>
              <Input placeholder='New player name' autoCapitalize='words' style={{flex: 4}}
                onEndEditing={ this.editNewPlayerName } ref={ (c) => this._newNameText = c }>
                {this.state.newPlayerName}
              </Input>
            </Item>
          </Form>

          <View style={{marginTop: 20, padding: 20, flexDirection: 'row', justifyContent: 'space-between' }}>
            <Button primary><Icon name='checkmark' /><Text>Save</Text></Button>
            <Button light onPress={ this.props.navHome }><Icon name='close' /><Text>Cancel</Text></Button>
          </View>
        </Content>
      </Container>
    );
  }

}
