import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  ScrollView,
  ActivityIndicator,
  InteractionManager,
} from 'react-native';
import {
  Appbar,
  Button,
  Card,
  Title,
  Text,
  Avatar,
  Checkbox,
  Surface,
  Dialog,
  Paragraph,
  Portal,
} from 'react-native-paper';

import TeamStore from '../stores/TeamStore';
import { styles } from '../styles/CourtTimerStyles';

const DEFAULT_TIME = 20 * 60;

// helpful player sorting functions
function sortPlayersByNumberAsc(a, b) { return parseInt(a.number, 10) - parseInt(b.number, 10); }
function sortPlayersByGametimeAsc(a, b) { return a.gameTime - b.gameTime; }
function sortPlayersByGametimeDsc(a, b) { return b.gameTime - a.gameTime; }

function GameScreen({ navigation, route }) {
  const { id } = route.params;

  const [isRunning, setRunning] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const [secs, setSecs] = useState(DEFAULT_TIME);
  const [players, setPlayers] = useState(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // actions
  const loadTeamData = async (teamId) => {
    if (teamId === null || teamId === undefined) {
      navigation.pop();
    } else {
      const newteam = (await TeamStore.readTeam(id));
      const newplayers = newteam.players.map((item) => (
        { ...item, gameTime: 0, selected: false, playing: false }
      )).sort(sortPlayersByNumberAsc);
      // if (balancePlayers && players.length >= 5) {
      //   // automatically select a starting five...
      //   for (let i = 0; i < 5; i++) players[i].playing = true;
      // }

      setPlayers(newplayers);
    }
  };

  // lifecycle hooks
  useEffect(() => {
    console.debug(`GameScreen: first load with ${id}`);

    loadTeamData(id);
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [id]);

  useEffect(() => {
    console.debug('GameScreen: change in navigation/isRunning', navigation, isRunning);

    if (isRunning) {
      const unsubscribe = navigation.addListener('beforeRemove', (e) => {
        e.preventDefault();
        setShowCancelDialog(true);
      });

      return unsubscribe;
    }

    return null;
  }, [navigation, isRunning]);

  useEffect(() => {
    if (!isRunning) return;

    if (secs <= 0) {
      setRunning(false);
      setSecs(0);
    }

    setPlayers(players.map((p) => (
      { ...p, gameTime: (p.playing) ? p.gameTime + 1 : p.gameTime }
    )));
  }, [secs]);

  useEffect(() => {
    console.debug('GAME is ', isRunning ? 'RUNNING' : 'STOPPED');
    if (isRunning) {
      const timerId = setInterval(() => setSecs((s) => s - 1), 1000);
      setIntervalId(timerId);
    } else {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  }, [isRunning]);

  // requestAnimationFrame((t) => {
  //   console.debug('Animation at', t);
  // });

  const resetTimer = () => {
    if (isRunning) { setRunning(false); return; }
    if (secs !== DEFAULT_TIME) { setSecs(DEFAULT_TIME); return; }

    const newp = players.map((p) => ({ ...p, gameTime: 0 }));
    setPlayers(newp);
  };

  const selectPlayer = (playerId) => {
    //   const { balancePlayers } = prefs;

    const newPlayers = players.map((p) => (
      p.id === playerId ? { ...p, selected: !p.selected } : p
    ));

    /*
    const selectedPlayingCount = players.filter((item) => item.selected && item.playing).length;
    const selectedBenchCount = players.filter((item) => item.selected && !item.playing).length;

    // if we selected a bench player and there are playing players unselected,
    // select the player with the longest court time
    if (players.includes((p) => p.id === playerId && !p.playing)) {
      // && selectedBenchCount > selectedPlayingCount) {
      console.debug('Selected bench player: should auto-select court player');
    }

      if (balancePlayers && p.playing && p.selected && selectedPlayingCount > selectedBenchCount) {
        // balancing and just selected an active player
        // need to auto-select a benched player
        // console.debug('GameScreen: balance after selecting player');
        const bench = players
          .filter((item) => !item.playing && !item.selected)
          .sort(sortPlayersByGametimeAsc);
        if (bench.length > 0) bench[0].selected = true;
      }
      if (balancePlayers && !p.playing && p.selected && selectedPlayingCount < selectedBenchCount) {
        // balancing and just selecetd a bench player
        // need to auto-select a playing player
        // console.debug('GameScreen: balance after selecting bench');
        const playing = players.filter((item) => item.playing && !item.selected)
          .sort(sortPlayersByGametimeDsc);
        if (playing.length > 0) playing[0].selected = true;
      }
    */

    setPlayers(newPlayers);
  };

  const subPlayers = () => {
    const newPlayers = players.map((p) => (
      p.selected ? { ...p, playing: !p.playing, selected: false } : p
    ));

    setPlayers(newPlayers);
  };

  const confirmCancel = () => {
    setRunning(false);
    setShowCancelDialog(false);
    InteractionManager.runAfterInteractions(() => loadTeamData(null));
  };

  // Waiting ....
  if (!players) return <ActivityIndicator size="large" style={styles.centered} />;

  //
  // Render Function
  //
  const timestr = new Date(secs * 1000).toISOString().substring(14, 19);
  const mmss = (s) => (new Date(s * 1000).toISOString().substring(14, 19));
  const playerAvatar = (size, num) => (<Avatar.Text size={size} label={num} />);
  const playerCheckbox = (size, sel) => (<Checkbox size={size} status={sel ? 'checked' : 'unchecked'} />);

  // const playingCount = players.filter((item) => item.playing).length;
  // const selectedPlayingCount = players.filter((item) => item.selected && item.playing).length;
  // const selectedBenchCount = players.filter((item) => item.selected && !item.playing).length;
  // const subButtonEnabled = (playingCount + selectedBenchCount - selectedPlayingCount <= 5)
  //   && (selectedPlayingCount + selectedBenchCount > 0);

  return (
    <View style={styles.page}>
      <Surface style={styles.containerFull}>
        <Text style={styles.gameClock}>
          {timestr}
        </Text>

        <View style={styles.gameLayout}>
          <View style={styles.gameBlock}>
            <Title style={styles.centered}>BENCH</Title>
            <ScrollView contentContainerStyle={styles.gameCardContainer}>
              {players.filter((item) => !item.playing).sort(sortPlayersByGametimeAsc).map((item) => (
                <Card
                  key={item.id}
                  style={item.selected ? styles.gameCardSelected : styles.gameCard}
                  onPress={() => selectPlayer(item.id)}
                >
                  <Card.Title
                    title={item.name}
                    titleStyle={styles.gameCardTitle}
                    subtitle={mmss(item.gameTime)}
                    subtitleStyle={styles.gameCardBody}
                    left={({ size }) => playerAvatar(size, item.number)}
                    right={({ size }) => playerCheckbox(size, item.selected)}
                  />
                </Card>
              ))}
            </ScrollView>
          </View>
          <View style={styles.gameBlock}>
            <Title style={styles.centered}>COURT</Title>
            <ScrollView contentContainerStyle={styles.gameCardContainer}>
              {players.filter((item) => item.playing).sort(sortPlayersByGametimeDsc).map((item) => (
                <Card
                  key={item.id}
                  style={item.selected ? styles.gameCardSelected : styles.gameCard}
                  onPress={() => selectPlayer(item.id)}
                >
                  <Card.Title
                    title={item.name}
                    titleStyle={styles.gameCardTitle}
                    subtitle={mmss(item.gameTime)}
                    subtitleStyle={styles.gameCardBody}
                    left={({ size }) => playerAvatar(size, item.number)}
                    right={({ size }) => playerCheckbox(size, item.selected)}
                  />
                </Card>
              ))}
            </ScrollView>
          </View>
        </View>
      </Surface>
      <Portal>
        <Dialog visible={showCancelDialog} onDismiss={() => setShowCancelDialog(false)}>
          <Dialog.Title>Game is Running</Dialog.Title>
          <Dialog.Content>
            <Paragraph>Going back will stop the game in progress. Are you sure?</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button mode="contained" onPress={() => setShowCancelDialog(false)}>Play On</Button>
            <Button mode="text" onPress={() => confirmCancel()}>End Game</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <Appbar style={styles.spacedButtonBar}>
        <Appbar.Action
          icon="timer"
          accessibilityLabel="RESET"
          onPress={resetTimer}
          disabled={isRunning}
        />
        <Appbar.Action
          icon="swap-horizontal"
          accessibilityLabel="SUBS"
          size={64}
          onPress={subPlayers}
          // disabled={!subButtonEnabled}
        />
        { isRunning && (
          <Appbar.Action icon="pause" accessibilityLabel="PAUSE" onPress={() => setRunning(false)} />
        )}
        { !isRunning && (
          <Appbar.Action icon="play" accessibilityLabel="PLAY" onPress={() => setRunning(true)} />
        )}
      </Appbar>
    </View>
  );
}

GameScreen.propTypes = {
  navigation: PropTypes.shape({
    pop: PropTypes.func,
    addListener: PropTypes.func,
    removeListener: PropTypes.func,
  }).isRequired,
  route: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }),
  }).isRequired,
  prefs: PropTypes.shape({
    balancePlayers: PropTypes.bool,
  }),
};

GameScreen.defaultProps = {
  prefs: {
    balancePlayers: false,
  },
};

export default GameScreen;
