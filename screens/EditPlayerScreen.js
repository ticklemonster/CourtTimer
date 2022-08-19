import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { ActivityIndicator, View } from 'react-native';
import { TextInput, Snackbar, Surface, Headline, Text, Button } from 'react-native-paper';

import TeamStore from '../stores/TeamStore';
import ConfirmButton from '../components/ConfirmButton';
import { colours, styles } from '../styles/CourtTimerStyles';

function EditPlayerScreen({ navigation, route }) {
  const { teamId, playerId } = route.params;

  const [teamName, setTeamName] = useState(null);
  const [player, setPlayer] = useState(null);
  const [undo, setUndo] = useState(null);
  const [showUndoSnack, setShowUndoSnack] = useState(false);

  // action functions
  const handleDeletePressed = async () => {
    await TeamStore.deletePlayer(player);
    navigation.goBack();
  };

  const saveChanges = async () => {
    // TODO: Validate input - has a name and a unique number
    if (player.name === null || player.name === ''
      || player.number === null || player.number === '') {
      return;
    }

    // Perform the save
    // console.log('Saving changes...', player);
    const lastSave = await TeamStore.readPlayer(player.teamId, player.id);
    const saveData = await TeamStore.updatePlayer(player);
    // console.debug('Saved: [old=', lastSave, ']\n       [new=', saveData, ']');
    if (saveData) {
      setUndo(lastSave);
      setShowUndoSnack(true);
      setPlayer(saveData);
    }
  };

  const undoAction = async () => {
    if (undo === null || undo === undefined) {
      // console.debug('Undo initial save -> ', undo);
      await TeamStore.deletePlayer(player);
    } else {
      // console.debug('Undo last change -> ', undo);
      setPlayer(await TeamStore.updatePlayer(undo));
    }
  };

  // Load team and player data if there is a change in the route
  useEffect(() => {
    const fetchData = async () => {
      const teamdata = await TeamStore.readTeam(teamId);
      if (teamdata === null) navigation.navigate('Teams');

      setTeamName(teamdata.name);
      const loadedPlayer = await TeamStore.readPlayer(teamId, playerId);
      if (loadedPlayer === null || loadedPlayer === undefined) {
        const newPlayer = TeamStore.createPlayer(teamId);
        console.debug('Created new player ', newPlayer);
        setPlayer(newPlayer);
      } else {
        console.debug('Loaded player ', loadedPlayer);
        setPlayer(loadedPlayer);
      }
    };

    // there MUST be a team ID
    if (teamId === null || teamId === undefined) {
      navigation.navigate('Teams');
    }

    // Fetch the team and the player info
    fetchData();
  }, [route]);

  // Show activity screen until the team info is loaded...
  if (player === null) return <ActivityIndicator size="large" style={styles.centered} />;

  //
  // RENDER - Edit Player Screen
  //
  return (
    <View style={styles.page}>
      <Surface style={styles.container}>
        <Headline>{`Team: ${teamName}`}</Headline>
        <View style={styles.horizontalContainer}>
          <TextInput
            style={styles.playerNumberInput}
            mode="outlined"
            label="No"
            value={player.number}
            onChangeText={(txt) => setPlayer({ ...player, number: txt })}
            onBlur={saveChanges}
            autoFocus
          />
          <TextInput
            style={styles.playerNameInput}
            mode="outlined"
            label="Name"
            value={player.name}
            onChangeText={(txt) => setPlayer({ ...player, name: txt })}
            onBlur={saveChanges}
          />
        </View>
        <View style={[styles.horizontalContainer, styles.spacedButtonBar]}>
          <Button onPress={() => saveChanges().then(() => navigation.replace('Edit.Player', { teamId, playerId: null }))}>Save &amp; New</Button>
          <Button mode="outlined" onPress={() => saveChanges().then(() => navigation.goBack())}>Save</Button>
        </View>
        <View style={styles.dividerMd}>
          <Text>{`Game time: ${player.gameTime}`}</Text>
        </View>

        <View style={styles.bottomDeleteBar}>
          <ConfirmButton
            confirmTitle="Delete Player"
            confirmText="Are you sure you want to delete this player?"
            confirmLabel="Delete"
            onPress={handleDeletePressed}
            color={colours.danger}
          >
            Delete Player
          </ConfirmButton>
        </View>
      </Surface>
      <Snackbar
        visible={showUndoSnack}
        style={styles.snackSave}
        onDismiss={() => setShowUndoSnack(false)}
        action={{ label: 'UNDO', color: colours.primaryLight, onPress: () => undoAction() }}
      >
        Player changes saved
      </Snackbar>
    </View>
  );
}

//
// PROPTYPE VALIDATION
//
EditPlayerScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    popToTop: PropTypes.func.isRequired,
    goBack: PropTypes.func,
    replace: PropTypes.func,
    setOptions: PropTypes.func,
  }).isRequired,
  route: PropTypes.shape({
    params: PropTypes.shape({
      teamId: PropTypes.string.isRequired,
      playerId: PropTypes.string,
    }),
  }).isRequired,
};

export default EditPlayerScreen;
