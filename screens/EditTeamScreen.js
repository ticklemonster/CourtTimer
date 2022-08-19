import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { ActivityIndicator, View } from 'react-native';
import {
  TextInput, Button, List, Avatar, Surface, Headline, Subheading, Divider, Snackbar,
} from 'react-native-paper';
import { SwipeListView } from 'react-native-swipe-list-view';

import TeamStore from '../stores/TeamStore';
import ConfirmButton from '../components/ConfirmButton';
import { colours, styles } from '../styles/CourtTimerStyles';

function EditTeamScreen({ navigation, route }) {
  const { id } = route.params;

  const [team, setTeam] = useState(null);
  const [undo, setUndo] = useState([]);
  const [showUndoSnack, setShowUndoSnack] = useState(false);

  // action functions
  const loadTeamData = async (teamId) => {
    if (teamId === null || teamId === undefined) {
      console.debug('EditTeamScreen.loadTeamData - creating new team...');
      setTeam(await TeamStore.createTeam());
    } else {
      console.debug(`EditTeamScreen.loadTeamData - loading team ${teamId}...`);
      const newteam = (await TeamStore.readTeam(teamId)) || TeamStore.createTeam();
      setTeam(newteam);
      setUndo([]);
    }
  };

  const handleDeleteTeamPressed = async () => {
    await TeamStore.deleteTeam(id);
    navigation.popToTop();
  };

  const handleDeletePlayer = async (player) => {
    console.debug('TODO: Should Delete Player: ', player);
    await TeamStore.deletePlayer(player);

    loadTeamData(id);
  };

  const saveChanges = async () => {
    console.debug('Saving changes...');
    if (team === undo[0]) {
      console.debug('No changes to be saved');
      return;
    }

    const lastData = await TeamStore.readTeam(id);
    const savedData = await TeamStore.updateTeam(team);
    if (lastData) setUndo([lastData, ...undo]);
    setTeam(savedData);
    setShowUndoSnack(true);

    if (id === null || id === undefined) navigation.replace('Edit.Team', { id: savedData.id });
  };

  const undoAction = async () => {
    setShowUndoSnack(false);
    if (undo && undo.length > 0) {
      const undoVal = undo[0];
      setUndo(undo.slice(1));
      console.debug('Undo last change -> ', undoVal);
      if (undoVal) {
        const undodata = await TeamStore.updateTeam(undoVal);
        setTeam(undodata);
      }
    }
  };

  // Set up the initial state on load
  useEffect(() => {
    console.log(`EditTeamScreen.setup id=${id}. Adding Listener...`);
    navigation.setOptions({ onUndo: null });
    const unsubscribe = navigation.addListener('focus', () => loadTeamData(id));

    return () => {
      console.log('EditTeamScreen - removing listener');
      unsubscribe();
    };
  }, []);

  // Load team data if there is a change in id prop
  // useEffect(() => {
  //   console.debug(`EditTeamScreen: route changed to id=${id}`);
  //   loadTeamData(id);

  //   return () => {
  //     console.debug(`EditTeamScreen: route changed from id=${id}`);
  //   };
  // }, [route]);

  // update the actions on the app bar
  useEffect(() => {
    console.debug(`Undo list: ${undo.length}`, undo);
    navigation.setOptions({ onUndo: (undo.length > 0) ? undoAction : null });
  }, [undo]);

  // Show activity screen until the team info is loaded...
  if (team === null) return <ActivityIndicator size="large" style={styles.centered} />;

  //
  // -- Render helper functions --
  //

  // List render helpers
  const emptyListComponent = () => (
    <Subheading style={styles.playerListEmpty}>No players here</Subheading>
  );

  const renderHiddenItem = (rowData /* , rowMap */) => (
    <View style={styles.playerListBack}>
      <Button
        icon="delete"
        mode="contained"
        style={styles.playerBackDangerButton}
        onPress={() => handleDeletePlayer(rowData.item)}
      >
        Delete
      </Button>
    </View>
  );

  const renderPlayerItem = (rowData) => {
    const { item } = rowData;

    // console.debug('renderPlayerItem: ', item);
    const playerNumberAvatar = () => (
      <Avatar.Text size={36} label={`${item.number}`} />
    );

    return (
      <List.Item
        style={styles.playerListRow}
        left={playerNumberAvatar}
        titleStyle={styles.playerListItem}
        title={item.name}
        onPress={() => navigation.navigate('Edit.Player', { teamId: team.id, playerId: String(item.id) })}
      />
    );
  };

  //
  // RENDER - Edit Team Screen
  //
  const headlineIcon = () => (<List.Icon icon="account" size="1.5em" />);
  const headlineButton = () => (
    <Button
      mode="outlined"
      disabled={id === null || id === undefined}
      style={styles.playerListButton}
      onPress={() => navigation.navigate('Edit.Player', { teamId: team.id })}
    >
      Add Player
    </Button>
  );
  return (
    <View style={styles.page}>
      <Surface style={styles.container}>
        <TextInput
          style={styles.editTeamName}
          mode="outlined"
          label="Team Name:"
          value={team.name}
          placeholder="My Team Name"
          onChangeText={(txt) => setTeam({ ...team, name: txt })}
          onBlur={saveChanges}
        />
        <TextInput
          style={styles.editTeamDetail}
          mode="outlined"
          label="Details:"
          multiline
          numberOfLines={2}
          value={team.description}
          placeholder="Additional Details"
          onChangeText={(txt) => setTeam({ ...team, description: txt })}
          onBlur={saveChanges}
        />

        <Divider style={styles.dividerMd} />

        <List.Item
          left={headlineIcon}
          title={(<Headline>Players</Headline>)}
          right={headlineButton}
        />

        <SwipeListView
          data={team.players.sort((a, b) => parseInt(a.number, 10) - parseInt(b.number, 10))}
          keyExtractor={(item) => item.id}
          renderItem={renderPlayerItem}
          renderHiddenItem={renderHiddenItem}
          // leftOpenValue={100}
          closeOnRowOpen
          closeOnRowPress
          disableRightSwipe
          rightOpenValue={-100}
          rightActivationValue={-200}
          rightActionValue={-250}
          // onRightActionStatusChange={(data) => console.debug('Right Action Status Change', data)}
          onRightAction={(key) => handleDeletePlayer({ teamId: team.id, id: key })}
          ListEmptyComponent={emptyListComponent}
        />
      </Surface>
      <View style={styles.bottomDeleteBar}>
        <ConfirmButton
          confirmTitle="Delete Team"
          confirmText={`Are you sure you want to delete this team (${team.name})?`}
          confirmLabel="Delete"
          onPress={handleDeleteTeamPressed}
          color={colours.danger}
        >
          Delete Team
        </ConfirmButton>
      </View>
      <Snackbar
        visible={showUndoSnack}
        style={styles.snackSave}
        onDismiss={() => setShowUndoSnack(false)}
        action={{ label: 'UNDO', color: colours.primaryLight, onPress: () => undoAction() }}
      >
        Team changes saved
      </Snackbar>

    </View>
  );
}

//
// PROPTYPE VALIDATION
//

EditTeamScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    popToTop: PropTypes.func.isRequired,
    replace: PropTypes.func,
    addListener: PropTypes.func,
    removeListener: PropTypes.func,
    setOptions: PropTypes.func,
  }).isRequired,
  route: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string,
    }),
  }).isRequired,
};

export default EditTeamScreen;
