import React from 'react';
import PropTypes from 'prop-types';
import {
  BackHandler, StyleSheet, ActivityIndicator,
  View, KeyboardAvoidingView, ScrollView, FlatList,
  Text, ToastAndroid,
} from 'react-native';
import { Appbar, TextInput, Subheading, Banner, HelperText, Snackbar, Drawer, Headline, Title,
  Divider, Dialog, Portal, Button, IconButton, List, Chip, Avatar,
} from 'react-native-paper';

import TeamStore from '../TeamStore';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  playerListContainer: {
    flex: 1,
    borderWidth: 1,
    padding: 10,
  },

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

const hex2rgba = (hex, alpha = 1) => {
  const [r, g, b] = hex.match(/\w\w/g).map(x => parseInt(x, 16));
  return `rgba(${r},${g},${b},${alpha})`;
};

class EditTeamScreen extends React.Component {
  constructor(props) {
    super(props);

    // setup an initial blank team structure
    this.state = {
      ready: false,
      name: '',
      description: '',
      players: [],
      editing: null,
      saveNeeded: false,
    };

    // bind event handlers
    this.onTeamDataLoaded = this.onTeamDataLoaded.bind(this);
    this.handleBackPress = this.handleBackPress.bind(this);
    this.updateTeamName = this.updateTeamName.bind(this);
    this.updateTeamDescription = this.updateTeamDescription.bind(this);
  }

  //
  // Component Lifecycle Events
  //
  componentDidMount() {
    const { id } = this.props;

    console.debug(`EditTeamScreen with team key: ${id}`);
    TeamStore.getTeam(id).then(this.onTeamDataLoaded);

    BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
  }

  onTeamDataLoaded(team) {
    console.debug('EditTeamScreen.onTeamDataLoaded -', (team && team.name) || 'NEW TEAM');
    if (team === null) {
      this.setState({ ready: true, name: '', description: '', players: [] });
    } else {
      this.setState({ ready: true, name: team.name, description: team.description, players: team.players.slice() });
    }
  }

  // eslint-disable-next-line react/sort-comp
  handleBackPress() {
    const { onBack } = this.props;
    const { saveNeeded } = this.state;

    if (saveNeeded) {
      ToastAndroid.show('Press back again to cancel edits', ToastAndroid.LONG);
      this.setState({ saveNeeded: false });
      return true;
    }

    onBack();
    return true;
  }

  //
  // Team update functions
  //
  updateTeamName(newName) {
    this.setState({ name: newName, saveNeeded: true });
  }

  updateTeamDescription(newDescription) {
    this.setState({ description: newDescription, saveNeeded: true });
  }

  //
  // Payer row data functions
  //

  deletePlayer(number) {
    const { players } = this.state;

    try {
      const undoPlayers = players.slice();
      const postPlayers = players.filter(item => item.number !== number);

      this.setState({ players: postPlayers, saveNeeded: true, undoState: { players: undoPlayers }, warningMessage: `Player #${number} deleted`})
    } catch (err) {
      console.error(`Error deleting player #${number}:`, err);
    }
    
  }

  //
  // Player editing
  //
  startEditPlayer(player) {
    const { players } = this.state;

    const name = player ? player.name : '';
    const number = player ? player.number : '';
    const count = players.reduce((prev, curr) => prev + (curr.number === number), 0);
    const editing = { id: number, name, number, duplicatenumber: (count > 1) };

    this.setState({ editing });
  }

  onEditName(newname) {
    const { editing } = this.state;

    if (editing === null) return;

    const newediting = { ...editing, name: newname };
    this.setState({ editing: newediting });
  }

  onEditNumber(newnumber) {
    const { editing, players } = this.state;

    if (editing === null) return;

    const count = players.reduce((prev, curr) => prev + (curr.number === newnumber && curr.number !== editing.id), 0);

    const newediting = { ...editing, number: newnumber, duplicatenumber: (count > 0) };

    console.debug('onEditNumber: ', newediting);

    this.setState({ editing: newediting });
  }

  savePlayerEdits() {
    const { editing, players } = this.state;

    if (editing === null) return;
    console.debug(`SavePlayerEdits: #${editing.id} => ${editing.number}. ${editing.name}`);

    if (editing.duplicatenumber) {
      this.setState({ editing: null, warningMessage: 'Duplicate player numbers not allowed. Changes not saved.'});
      return;
    }

    // duplicate the player list with full object copy!
    const newplayers = [];
    for (let p = 0; p < players.length; p++) {
      const player = Object.assign({}, players[p]);
      if (player.number === editing.id) {
        player.name = editing.name;
        player.number = editing.number;
      }
      newplayers.push(player);
    }
    if (!newplayers.find(item => item.number === editing.number)) {
      newplayers.push({ number: editing.number, name: editing.name });
    }
    newplayers.sort((a, b) => parseInt(a.number, 10) - parseInt(b.number, 10));

    this.setState({ players: newplayers, editing: null });
  }

  undoAction() {
    const { undoState } = this.state;

    if (!undoState) {
      console.warn('UndoAction with no undo buffer!');
      return;
    }

    this.setState({ undoState: null, ...undoState });
  }
  
  //
  // Persist team data functions
  //
  async deleteTeam() {
    const { id, onBack } = this.props;

    await TeamStore.deleteTeam(id);
    onBack();
  }

  async saveTeam() {
    const { id, onBack } = this.props;
    const { saveNeeded, name, description, players } = this.state;

    if (!saveNeeded) return;

    // build a new team object from the current (edited) state...
    const newTeamRecord = {
      key: id,
      name,
      description,
      players,
    };

    await TeamStore.updateTeam(newTeamRecord);
    onBack();
  }

  cancelEditTeam() {
    const { onBack } = this.props;

    if (!this.handleBackPress()) {
      onBack();
    }
  }

  playersAsList(players, theme) {
    // const accentBg = hex2rgba(theme.colors.accent, 0.3);
    return (
      <FlatList
        data={players}
        keyExtractor={item => item.number}
        renderItem={({ item }) => (
          <List.Item
            theme={theme}
            left={() => (
              <Avatar.Text label={item.number} size={36} />
            )}
            title={item.name}
            right={() => (
              <IconButton
                theme={theme}
                style={{ margin: 0, pading: 0 }}
                icon="close"
                onPress={() => this.deletePlayer(item.number)}
              />
            )}
            onPress={() => this.startEditPlayer(item)}
          />
        )}
      />);
  }

  playersAsChips(players, theme) {
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        { players.map(item => (
          <Chip
            theme={theme}
            style={{ margin: 6 }}
            key={item.number}
            avatar={<Avatar.Text theme={theme} label={item.number} size={36} />}
            mode="flat"
            onPress={() => this.startEditPlayer(item)}
            onClose={() => this.deletePlayer(item.number)}
          >
            {item.name}
          </Chip>
        ))}
      </View>
    );
  }

  render() {
    const { ready, warningMessage, name, description, players, saveNeeded, editing } = this.state;
    const { theme, prefs } = this.props;
    const { showMembersAsList } = prefs;

    if (!ready) {
      return <ActivityIndicator size="large" />;
    }

    //
    // RENDER
    //
    return (
      <React.Fragment>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => { this.cancelEditTeam(); }} />
          <Appbar.Content title={`Edit Team - ${name}`} />
          <Appbar.Action icon="check" accessibilityLabel="save" disabled={!saveNeeded} onPress={() => { this.saveTeam(); }} />
        </Appbar.Header>

        <View style={{ ...styles.container, backgroundColor: theme.colors.background, paddingHorizontal: 16 }}>
          {/* <KeyboardAvoidingView enabled behavior="padding" keyboardVerticalOffset={100}> */}
          <Headline style={{ color: theme.colors.primary }}>Team Details</Headline>
          <TextInput label="Team Name:" value={name} placeholder="My Team Name" onChangeText={this.updateTeamName} />
          <TextInput label="Details:" value={description} placeholder="Description" onChangeText={this.updateTeamDescription} />

          <Headline style={{ color: theme.colors.primary, marginTop: 16 }}>
            {`Players (${players.length})`}
          </Headline>
          <ScrollView>
            {showMembersAsList ? this.playersAsList(players, theme) : this.playersAsChips(players, theme)}
          </ScrollView>
          {/* </KeyboardAvoidingView> */}
        </View>

        <FAB
          style={{ position: 'absolute', margin: 16, bottom: 0, alignSelf: 'center' }}
          // small
          icon="add"
          onPress={() => this.startEditPlayer(null)}
        />

        <Snackbar
          visible={warningMessage}
          style={{ paddingRight: 20 }}
          onDismiss={() => this.setState({ warningMessage: null, undoState: null })}
          action={{ label: 'UNDO', onPress: () => this.undoAction() }}
        >
          {warningMessage}
        </Snackbar>

        <Portal>
          {editing && (
          <Dialog
            visible
            onDismiss={() => this.setState({ editing: null })}>
            <Dialog.Title>Update Player Details</Dialog.Title>
            <Dialog.Content>
              <View style={{ flexDirection: 'row' }}>
                <TextInput
                  style={{ flex: 1, marginRight: 2 }}
                  label="No."
                  value={editing.number}
                  placeholder="00"
                  keyboardType="number-pad"
                  error={editing.duplicatenumber}
                  onChangeText={(t) => { this.onEditNumber(t); }}
                />
                <TextInput
                  style={{ flex: 4 }}
                  label="Name"
                  value={editing.name}
                  placeholder="Enter Name"
                  onChangeText={(t) => { this.onEditName(t); }}
                />
              </View>
              <HelperText type="error" visible={editing.duplicatenumber}>
                <Text>Duplicate player number!</Text>
              </HelperText>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => this.savePlayerEdits()}>SAVE</Button>
              <Button onPress={() => this.setState({ editing: null })}>CANCEL</Button>
            </Dialog.Actions>
          </Dialog>
          )}
        </Portal>
      </React.Fragment>
    );
  }
}

EditTeamScreen.propTypes = {
  id: PropTypes.string,
  theme: PropTypes.shape(),
  prefs: PropTypes.shape({ showMembersAsList: PropTypes.bool }),
  onBack: PropTypes.func.isRequired,
};

EditTeamScreen.defaultProps = {
  id: null,
  theme: {},
  prefs: { showMembersAsList: false },
};

export default EditTeamScreen;
