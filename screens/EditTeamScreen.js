import React from 'react';
import PropTypes from 'prop-types';
import {
  PixelRatio, BackHandler, StyleSheet, ActivityIndicator,
  View, SafeAreaView, KeyboardAvoidingView, ScrollView,
  Text, TextInput, ToastAndroid,
} from 'react-native';
import TeamStore from '../TeamStore';
import PlayerRow from '../components/PlayerRow';
import IconButton from '../components/IconButton';

// STYLES - MOVE TO CSS
const styles = StyleSheet.create({
  playerListStyle: {
    // backgroundColor: '#cfd8dc', borderWidth: 5, borderColor: '#0069c0' };
    margin: 5,
  },
  titleViewStyle: {
    backgroundColor: '#0069c0',
    paddingHorizontal: 5,
  },
  titleTextStyle: {
    fontSize: 18,
    fontWeight: 'bold',
    alignSelf: 'center',
    color: 'white',
    marginTop: 5,
  },
  warningMessageViewStyle: {
    backgroundColor: 'orange',
    marginVertical: 10,
    padding: 8,
  },
  warningMessageTextStyle: {
    fontSize: 18,
    color: 'black',
  },
});

class EditTeamScreen extends React.Component {
  constructor(props) {
    super(props);

    // setup an initial blank team structure
    this.state = {
      ready: false,
      name: '',
      players: [],
      // addNewEnabled: false,
      // newPlayerNumber: undefined,
      // newPlayerName: undefined,
      saveNeeded: false,
    };

    // bind event handlers
    this.onTeamDataLoaded = this.onTeamDataLoaded.bind(this);
    this.handleBackPress = this.handleBackPress.bind(this);
  }

  componentDidMount() {
    const { navigation } = this.props;

    const teamkey = navigation.getParam('key');
    console.debug(`EditTeamScreen with team key: ${teamkey}`);
    TeamStore.getTeam(teamkey).then(this.onTeamDataLoaded);

    BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
  }

  onTeamDataLoaded(team) {
    if (team === null) {
      this.setState({ ready: true, name: '', players: [] });
    } else {
      this.setState({ ready: true, name: team.name, players: team.players.slice() });
    }
  }

  handleBackPress() {
    const { saveNeeded } = this.state;

    if (saveNeeded) {
      ToastAndroid.show('Press back again to cancel edits', ToastAndroid.LONG);
      this.setState({ saveNeeded: false });
      return true;
    }

    return false;
  }

  //
  // Team update functions
  //
  updateTeamName(newName) {
    const { navigation } = this.props;

    navigation.setParams({ teamname: newName });
    this.setState({ name: newName, saveNeeded: true });
  }

  // TODO: update team icons??


  //
  // Payer row data functions
  //
  addPlayer(number, name) {
    const { players } = this.state;

    console.debug(`\tAdd player: ${number} ${name}`);
    if (number === undefined || name === undefined) return;

    // check player number is unique
    if (players.find(item => item.number === number)) {
      this.setState({ warningMessage: 'Player numbers must be unique.' });
      return;
    }

    // all is OK
    const newPlayers = players.slice(0);
    newPlayers.push({ number, name, gameTime: 0 });
    newPlayers.sort((a, b) => parseInt(a.number, 10) - parseInt(b.number, 10));
    this.setState({ players: newPlayers, saveNeeded: true });
  }

  updatePlayer(oldnumber, newnumber, newname) {
    const { players } = this.state;

    console.debug(`\tUpdate player: ${oldnumber} ${newnumber} ${newname}`);

    // check player number is unique
    if (oldnumber !== newnumber && players.find(item => item.number === newnumber)) {
      this.setState({ warningMessage: 'Player numbers must be unique.' });
      return false;
    }

    const newplayers = players.slice(0);
    const updatedplayer = newplayers.findIndex(item => (item.number === oldnumber));
    if (!updatedplayer) {
      console.warn(`Attempt to update player with no matching old number ${oldnumber}`);
      return false;
    }

    if (newnumber !== undefined) updatedplayer.number = newnumber;
    if (newname !== undefined) updatedplayer.name = newname;
    newplayers.sort((a, b) => parseInt(a.number, 10) - parseInt(b.number, 10));
    this.setState({ players: newplayers, saveNeeded: true });

    return true;
  }

  deletePlayer(number) {
    const { players } = this.state;

    console.log(`\tDelete player: ${number}`);

    try {
      const newplayers = players.slice(0);
      const index = newplayers.findIndex(item => (item.number === number));
      if (index >= 0) {
        newplayers.splice(index, 1);
        this.setState({ players: newplayers, saveNeeded: true });
      }
    } catch (err) {
      console.error(`Error deleting player #${number}:`, err);
    }
  }

  //
  // Persist team data functions
  //
  async deleteTeam() {
    const { navigation } = this.props;

    await TeamStore.deleteTeam(navigation.getParam('key'));
    navigation.popToTop();
  }

  async saveEdits() {
    const { navigation } = this.props;
    const { saveNeeded, name, players } = this.state;

    if (!saveNeeded) return;

    // build a new team object from tghe current (edited) state...
    const newTeamRecord = {
      key: navigation.getParam('key'),
      name,
      players,
    };
    await TeamStore.updateTeam(newTeamRecord);
    navigation.popToTop();
  }

  cancelEdit() {
    const { navigation } = this.props;

    if (!this.handleBackPress()) {
      navigation.popToTop();
    }
  }

  render() {
    const { ready, warningMessage, name, players, saveNeeded } = this.state;

    if (!ready) {
      return <ActivityIndicator size="large" />;
    }

    const listFontSize = 10 * PixelRatio.get();
    // const btnFontSize = 8 * PixelRatio.get();

    return (
      <View style={{ flex: 1, padding: 5, backgroundColor: '#cfd8dc' }}>
        { warningMessage && (
          <View style={styles.warningMessageViewStyle}>
            <Text style={styles.warningMessageTextStyle}>
              <Text style={{ fontWeight: 'bold' }}>WARNING: </Text>
              {warningMessage}
            </Text>
          </View>
        ) }

        <View style={styles.titleViewStyle}>
          <Text style={styles.titleTextStyle}>Team:</Text>
        </View>
        <View style={{ flex: 0 }}>
          <TextInput
            style={{ fontSize: listFontSize, padding: 5 }}
            placeholder="Team Name Here"
            onChangeText={(text) => { this.setState({ name: text }); }}
            onEndEditing={(e) => { this.updateTeamName(e.nativeEvent.text); }}
            value={name}
          />
        </View>

        <View style={styles.titleViewStyle}>
          <Text style={styles.titleTextStyle}>Players:</Text>
        </View>
        <KeyboardAvoidingView style={{ flex: 1 }} enabled behavior="padding" keyboardVerticalOffset={100}>
          <ScrollView style={styles.playerListStyle}>
            { players.map(item => (
              <PlayerRow
                key={item.number}
                name={item.name}
                number={item.number}
                onSave={(_number, _name) => { this.updatePlayer(item.number, _number, _name); }}
                onDelete={() => { this.deletePlayer(item.number); }}
              />
            )) }
            <PlayerRow
              name=""
              number=""
              onAdd={(_number, _name) => this.addPlayer(_number, _name)}
            />
          </ScrollView>
        </KeyboardAvoidingView>

        <View style={{ flex: 0, flexDirection: 'row', padding: 5 }}>
          <IconButton
            iconName="md-close"
            title="CANCEL"
            onPress={() => { this.cancelEdit(); }}
          />
          <IconButton
            iconName="md-checkmark"
            title="SAVE"
            disabled={!saveNeeded}
            onPress={() => { this.saveEdits(); }}
          />
        </View>
      </View>
    );
  }
}

EditTeamScreen.navigationOptions = ({ navigation }) => {
  const teamname = navigation.getParam('teamname');
  return {
    title: `Edit Team - ${teamname}`,
  };
};

EditTeamScreen.propTypes = {
  navigation: PropTypes.instanceOf(Object).isRequired,
};

export default EditTeamScreen;
