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
import { colours, styles } from '../styles/CourtTimerStyles';

const DEFAULT_TIME = 20 * 60;

// const styles = StyleSheet.create({
//   pageView: {
//     // ...colourStyles.primary,
//     flex: 1,
//     alignContent: 'center',
//     flexDirection: 'column',
//   },
//   playerListStyle: {
//     flex: 1, margin: 5,
//   },
//   titleViewStyle: {
//     // ...colourStyles.secondaryDark,
//     flex: 0, paddingHorizontal: 5, borderRadius: 8,
//   },
//   titleTextStyle: {
//     // ...colourStyles.secondaryDark,
//     fontSize: 18, fontWeight: 'bold', alignSelf: 'center',
//   },
//   playerCardStyle: {
//     // ...colourStyles.primaryLight,
//     flex: 0,
//     borderRadius: 8,
//     margin: 1,
//     flexDirection: 'column',
//     alignItems: 'center',
//     height: '20%',
//     elevation: 4,
//   },
//   playerCardSelectedStyle: {
//     // ...colourStyles.secondaryLight,
//     elevation: 1,
//   },
//   playerNumberStyle: {
//     flex: 1, fontSize: 18, fontWeight: 'bold',
//   },
//   playerNameStyle: {
//     flex: 2, fontSize: 24, fontWeight: 'bold', textAlignVertical: 'center',
//   },
//   playerTimeStyle: {
//     flex: 1, fontSize: 18, textAlignVertical: 'top', paddingTop: 0,
//   },
//   footerBar: {
//     // borderTopWidth: 1,
//     // borderTopColor: 'red',
//     justifyContent: 'center',
//   },
//   footerAction: {
//     marginHorizontal: 20,
//   },
// });

// helpful player sorting functions
function sortPlayersByNumberAsc(a, b) { return parseInt(a.number, 10) - parseInt(b.number, 10); }
function sortPlayersByGametimeAsc(a, b) { return a.gameTime - b.gameTime; }
function sortPlayersByGametimeDsc(a, b) { return b.gameTime - a.gameTime; }

function GameScreen({ navigation, route, }) {
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
        { ...item, gameTime: 0, selected: false, playing: true }
      ));
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

    // update the active players
    // const newPlayers = players.map((item) => (
    //   { ...item, gameTime: item.playing ? item.gameTime + elapsed : item.gameTime }
    // ));
  }, [secs]);

  useEffect(() => {
    console.debug('GAME is ', isRunning ? 'RUNNING' : 'STOPPED');
    if (isRunning) {
      setIntervalId(setInterval(() => setSecs((secs) => secs - 1), 1000));
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
    const newPlayers = players.map((p) => ({ ...p, selected: p.id === playerId ? !p.selected : p.selected }));

    //   const selectedPlayingCount = players.filter((item) => item.selected && item.playing).length;
    //   const selectedBenchCount = players.filter((item) => item.selected && !item.playing).length;
  
    //   if (balancePlayers && p.playing && p.selected && selectedPlayingCount > selectedBenchCount) {
    //     // balancing and just selected an active player
    //     // need to auto-select a benched player
    //     // console.debug('GameScreen: balance after selecting player');
    //     const bench = players
    //       .filter((item) => !item.playing && !item.selected)
    //       .sort(sortPlayersByGametimeAsc);
    //     if (bench.length > 0) bench[0].selected = true;
    //   }
    //   if (balancePlayers && !p.playing && p.selected && selectedPlayingCount < selectedBenchCount) {
    //     // balancing and just selecetd a bench player
    //     // need to auto-select a playing player
    //     // console.debug('GameScreen: balance after selecting bench');
    //     const playing = players.filter((item) => item.playing && !item.selected)
    //       .sort(sortPlayersByGametimeDsc);
    //     if (playing.length > 0) playing[0].selected = true;
    //   }

    setPlayers(newPlayers);
  };

  const subPlayers = () => {
    const newPlayers = players.map((p) => (
      p.selected ? { ...p, playing: !p.playing, selected: false } : p
    ));

    setPlayers(newPlayers);
  };

  if (!players) return <ActivityIndicator size="large" style={styles.centered} />;

  //
  // Render Function
  //
  const timestr = new Date(secs * 1000).toISOString().substring(14, 19);
  // const playingCount = players.filter((item) => item.playing).length;
  // const selectedPlayingCount = players.filter((item) => item.selected && item.playing).length;
  // const selectedBenchCount = players.filter((item) => item.selected && !item.playing).length;
  // const subButtonEnabled = (playingCount + selectedBenchCount - selectedPlayingCount <= 5)
  //   && (selectedPlayingCount + selectedBenchCount > 0);

  return (
    <View style={styles.page}>
      <Surface style={styles.container}>
        <Text style={{ fontSize: '2em', color: colours.secondary, textAlign: 'center', marginVertical: 8 }}>
          {timestr}
        </Text>

      {/* <View style={{
        flex: 1, flexDirection: 'row', alignItems: 'stretch', margin: 5, justifyContent: 'space-around',
      }}
      > */}
        <View style={{ flex: 1, margin: 4 }}>
          <Title style={{ alignSelf: 'center' }}>BENCH</Title>
          <ScrollView contentContainerStyle={{ justifyContent: 'flex-start' }}>
            { players.filter((item) => !item.playing).map((item) => (
              <Card
                key={item.id}
                style={{
                  marginVertical: 6,
                  borderRadius: 12,
                  borderColor: item.selected ? 'purple' : '#666',
                  borderWidth: item.selected ? 2 : 1,
                }}
                onPress={() => selectPlayer(item.id)}
              >
                <Card.Title
                  title={item.name}
                  subtitle={<Title>{new Date(item.gameTime * 1000).toISOString().substring(14, 19)}</Title>}
                  left={(props) => <Avatar.Text {...props} label={item.number} />}
                  right={(props) => <Checkbox {...props} status={item.selected ? 'checked' : 'unchecked'} />}
                />
              </Card>
            ))}
          </ScrollView>
        </View>
        <View style={{ flex: 1, margin: 4 }}>
          <Title style={{ alignSelf: 'center' }}>COURT</Title>
          <ScrollView contentContainerStyle={{ justifyContent: 'flex-start' }}>
            {players.filter((item) => item.playing).map((item) => (
              <Card
                key={item.id}
                style={{ marginVertical: 6,
                  borderRadius: 12,
                  borderColor: item.selected ? 'purple' : '#666',
                  borderWidth: item.selected ? 2 : 1 }}
                onPress={() => selectPlayer(item.id)}
              >
                <Card.Title
                  title={item.name}
                  subtitle={<Title>{new Date(item.gameTime * 1000).toISOString().substring(14, 19)}</Title>}
                  left={(props) => <Avatar.Text {...props} label={item.number} />}
                  right={(props) => <Checkbox {...props} status={item.selected ? 'checked' : 'unchecked'} />}
                />
              </Card>
            ))}
          </ScrollView>
        </View>
      {/* </View> */}
      </Surface>
      <Portal>
        <Dialog visible={showCancelDialog} onDismiss={() => setShowCancelDialog(false)}>
          <Dialog.Title>Game is Running</Dialog.Title>
          <Dialog.Content>
            <Paragraph>Going back will stop the game in progress. Are you sure?</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button mode="contained" onPress={() => setShowCancelDialog(false)}>Play On</Button>
            <Button mode="text" onPress={() => {
              setRunning(false);
              setShowCancelDialog(false);
              InteractionManager.runAfterInteractions(() => loadTeamData(null));
            }}>
              End Game
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <Appbar style={{ justifyContent: 'space-evenly' }}>
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
  id: PropTypes.string,
  prefs: PropTypes.shape({
    balancePlayers: PropTypes.bool,
  }),
};

GameScreen.defaultProps = {
  id: null,
  prefs: {
    balancePlayers: false,
  },
};

export default GameScreen;
