import React from 'react';
import { 
  Dimensions, PixelRatio, BackHandler, 
  View, SafeAreaView, KeyboardAvoidingView, ScrollView, 
  Text, TextInput, ToastAndroid,
} from 'react-native';
import TeamStore from '../TeamStore';
import PlayerRow from '../components/PlayerRow';
import IconButton from '../components/IconButton';

// STYLES - SHOULD BE CENTRALISED?
const playerListStyle = { margin: 5 }; //backgroundColor: '#cfd8dc', borderWidth: 5, borderColor: '#0069c0' };
const titleViewStyle = { backgroundColor: '#0069c0', paddingHorizontal: 5 };
const titleTextStyle = { fontSize: 18, fontWeight: 'bold', alignSelf: 'center', color: 'white', marginTop: 5 };

const warningMessageViewStyle = { backgroundColor: 'orange', marginVertical: 10, padding: 8 };
const warningMessageTextStyle = { fontSize: 18, color: 'black' };

export default class EditTeamScreen extends React.Component {
  static navigationOptions = ({navigation}) => {
    const teamname = navigation.getParam('teamname');
    return {
      title: 'Edit Team - ' + teamname
    };
  };

  constructor(props) {
    super(props);

    // setup an initial blank team structure
    this.state = {
      name: '',
      players: [],
      addNewEnabled: false,
      newPlayerNumber: undefined,
      newPlayerName: undefined,
      saveNeeded: false,
      resetRows: false,
    };
    this._initialTeam = {};
    
    // bind event handlers
    this.handleBackPress = this.handleBackPress.bind(this);
  }

  componentDidMount () {
    const teamkey = this.props.navigation.getParam('teamkey');
    console.debug('EditTeamScreen with team key: ' + teamkey);

    if (teamkey !== undefined) {
      TeamStore.getTeam(teamkey)
        .then((team) => {
          this._initialTeam = team;
          this.setState( { name: team.name, players: team.players.slice(0) }) 
        })
        .catch((err) => {
          console.log('EditTeamScreen.componentDidMount() - failed to load team from store. Ignored.', err);
          this._initialTeam = {};
        });
    } 
    
    BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
  }

  componentWillUnmount () {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
  }

  handleBackPress () {
    if (this.state.saveNeeded) {
      console.log('TODO: NEED TO REMIND ABOUT A SAVE ON IOS!');
      ToastAndroid.show('Press back again to cancel edits', ToastAndroid.LONG);
      this.setState({saveNeeded: false});
      return true;
    }

    return false;
  }

  //
  // Team update functions
  //
  updateTeamName(newName) {
    this.props.navigation.setParams({teamname: newName});
    this.setState({ name: newName, saveNeeded: true });
  }

  // TODO: update team icons??

  
  //
  // Payer row data functions
  //
  addPlayer(number, name) {
    console.debug(`\tAdd player: ${number} ${name}`);
    if (number === undefined || name === undefined) return;

    // check player number is unique
    if (this.state.players.find( (item) => item.number === number)) {
      console.log('\tAdd Player has duplicate number - do not save!');
      this.setState({warningMessage: 'Player numbers must be unique.'});
      return;
    }

    // all is OK
    let newPlayers = [ ...this.state.players.slice(0), { number: number, name: name, gameTime: 0} ];
    newPlayers.sort( (a, b) => parseInt(a.number) - parseInt(b.number) );
    this.setState({ players: newPlayers, saveNeeded: true
    
    });
  }

  updatePlayer (oldnumber, number, name) {
    console.debug(`\tUpdate player: ${oldnumber} ${number} ${name}`);

    // check player number is unique
    if (oldnumber !== number && this.state.players.find( (item) => item.number === number)) {
      console.log('Update player attempted to make duplicate player number');
      this.setState({warningMessage: 'Player numbers must be unique.', resetRows: true});
      return false;
    }

    try {
      let players = this.state.players.slice(0);
      let index = players.findIndex ((item) => (item.number === oldnumber));
      if (index >= 0) {
        if( number !== undefined ) players[index].number = number;
        if( name !== undefined ) players[index].name = name;

        players.sort( (a, b) => parseInt(a.number) - parseInt(b.number) );
        this.setState({ players: players, saveNeeded: true });
      }
      return true;
    } catch(err) {
      console.error('Error updating player @' + index + '. ', err);
    }    
    return false;
  }

  deletePlayer (number) {
    console.log(`\tDelete player: ${number}`);

    try {
      let players = this.state.players.slice(0);
      let index = players.findIndex ((item) => (item.number === number));
      if (index >= 0) {
        players.splice (index, 1);
        this.setState({ players: players, saveNeeded: true });  
      }
    } catch (err) {
      console.error('Error deleting player @' + index + ':', err);
    }
  }

  // 
  // Persist team data functions
  //
  async deleteTeam () {
    await TeamStore.deleteTeam(this.props.navigation.getParam('teamkey'));
    this.props.navigation.popToTop();
  }

  async saveEdits () {
    if (!this.state.saveNeeded) return;

    // build a new team object by merging the original team and current (edited) state...
    let newTeamRecord = Object.assign (this._initialTeam, {name: this.state.name, players: this.state.players});
    await TeamStore.updateTeam (newTeamRecord);
    this.props.navigation.popToTop();
  }

  cancelEdit () {
    if( !this.handleBackPress() ) 
      this.props.navigation.popToTop();
  }

  //{{ flex: 0, marginTop: 10, paddingHorizontal: 10, backgroundColor: '#ccc' }}>
  //{{ fontSize: listFontSize, fontWeight: 'bold' }}

  render() {
    //console.debug(`EditTeamScreen.render() team ${this.state.name} with ${this.state.players.length} players`);
    const listFontSize = 10 * PixelRatio.get();
    const btnFontSize = 8 * PixelRatio.get();

    if (this.state.resetRows) {
      this.setState({resetRows: false});
      return null;
    }

    return (
      <SafeAreaView style={{ flex: 1, padding: 5, backgroundColor: '#cfd8dc' }}>
        { this.state.warningMessage && 
          <View style={warningMessageViewStyle}>
            <Text style={warningMessageTextStyle}>
              <Text style={{fontWeight: 'bold'}}>WARNING: </Text>
              {this.state.warningMessage}
            </Text>
          </View>
        }

        <View style={titleViewStyle}> 
          <Text style={titleTextStyle}>Team:</Text>
        </View>
        <View style={{ flex: 0 }}>
          <TextInput 
            style={{ fontSize: listFontSize, padding: 5}} 
            placeholder='Team Name Here' 
            onChangeText={(text) => this.setState({name: text})}
            onEndEditing={(e) => this.updateTeamName(e.nativeEvent.text)}
            value={this.state.name}>
          </TextInput>
        </View>

        <View style={titleViewStyle}>
          <Text style={titleTextStyle}>Players:</Text>
        </View>
        <KeyboardAvoidingView style={{ flex: 1 }} enabled behavior='padding' keyboardVerticalOffset={100} >
          <ScrollView style={playerListStyle}>
            { this.state.players.map((item) => 
              <PlayerRow key={item.number} name={item.name} number={item.number} reset={this.state.resetRows}
                onSave={(_number, _name) => this.updatePlayer(item.number, _number, _name)}
                onDelete={() => this.deletePlayer(item.number)}/>
            )}
            <PlayerRow onAdd={(_number, _name) => this.addPlayer(_number, _name)}/>
          </ScrollView>
          <Text style={{ flex: 0 }}>Players: {this.state.players.length}</Text>
        </KeyboardAvoidingView>
        
        <View style={{ flex: 0, flexDirection: 'row', padding: 5 }}>
          <IconButton iconName='md-close' title='CANCEL'
            onPress={ () => this.cancelEdit() } />
          <IconButton iconName='md-checkmark' title='SAVE'
            disabled={ !this.state.saveNeeded }
            onPress={ () => this.saveEdits() } />
        </View>  
              
      </SafeAreaView>
    );
  }

}
