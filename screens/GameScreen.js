import React from 'react';
import PropTypes from 'prop-types';
import {
  Dimensions,
  BackHandler,
  ToastAndroid,
  StyleSheet,
  View,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {
  Appbar,
  Card,
  Title,
  Avatar,
  Checkbox,
} from 'react-native-paper';


import TeamStore from '../TeamStore';

const DEFAULT_TIME = 1200000;

const styles = StyleSheet.create({
  pageView: {
    // ...colourStyles.primary,
    flex: 1,
    alignContent: 'center',
    flexDirection: 'column',
  },
  playerListStyle: {
    flex: 1, margin: 5,
  },
  titleViewStyle: {
    // ...colourStyles.secondaryDark,
    flex: 0, paddingHorizontal: 5, borderRadius: 8,
  },
  titleTextStyle: {
    // ...colourStyles.secondaryDark,
    fontSize: 18, fontWeight: 'bold', alignSelf: 'center',
  },
  playerCardStyle: {
    // ...colourStyles.primaryLight,
    flex: 0,
    borderRadius: 8,
    margin: 1,
    flexDirection: 'column',
    alignItems: 'center',
    height: '20%',
    elevation: 4,
  },
  playerCardSelectedStyle: {
    // ...colourStyles.secondaryLight,
    elevation: 1,
  },
  playerNumberStyle: {
    flex: 1, fontSize: 18, fontWeight: 'bold',
  },
  playerNameStyle: {
    flex: 2, fontSize: 24, fontWeight: 'bold', textAlignVertical: 'center',
  },
  playerTimeStyle: {
    flex: 1, fontSize: 18, textAlignVertical: 'top', paddingTop: 0,
  },
  footerBar: {
    // borderTopWidth: 1,
    // borderTopColor: 'red',
    justifyContent: 'center',
  },
  footerAction: {
    marginHorizontal: 20,
  },
});

// helpful player sorting functions
function sortPlayersByNumberAsc(a, b) { return parseInt(a.number, 10) - parseInt(b.number, 10); }
function sortPlayersByGametimeAsc(a, b) { return a.gameTime - b.gameTime; }
function sortPlayersByGametimeDsc(a, b) { return b.gameTime - a.gameTime; }

class GameScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      name: '',
      ready: false,
      isRunning: false,
      msecs: DEFAULT_TIME,
      players: [],
    };

    // non-display stuff
    this.backPressed = false;

    // events that need binding
    this.handleBackPress = this.handleBackPress.bind(this);
    this.handleDimensionChange = this.handleDimensionChange.bind(this);
    this.onTeamDataLoaded = this.onTeamDataLoaded.bind(this);

    // Load the data from storage...
    TeamStore.getTeam(props.id).then(this.onTeamDataLoaded);
  }

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
    Dimensions.addEventListener('change', this.handleDimensionChange);

    // work out the initial dimensions...
    this.handleDimensionChange();
  }

  componentWillUnmount() {
    // cancel listeners and timers
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
    Dimensions.removeEventListener('change', this.handleDimensionChange);
    if (this.backpressTimer) clearTimeout(this.backpressTimer);
    if (this.intervalId) clearInterval(this.intervalId);
  }

  onTeamDataLoaded(team) {
    const { prefs } = this.props;
    const { balancePlayers } = prefs;

    console.debug(`GameScreen.onTeamDataLoaded() - fetched team key=${team.key} name=${team.name}`);
    const players = team.players.map((item) => (
      { ...item, gameTime: 0, selected: false, playing: false }
    ));
    if (balancePlayers && players.length >= 5) {
      // automatically select a starting five...
      for (let i = 0; i < 5; i++) players[i].playing = true;
    }

    this.setState({
      name: team.name,
      players,
      ready: true,
    });
  }

  handleBackPress() {
    const { onBack } = this.props;
    const { isRunning } = this.state;

    if (isRunning) {
      ToastAndroid.show('Stop the timer to go back', ToastAndroid.SHORT);
      return true;
    }

    onBack(); // commenting this line out disabled back-press
    return true;
  }

  handleDimensionChange() {
    const { width, height } = Dimensions.get('screen');

    this.setState({ orientation: (height >= width) ? 'portrait' : 'landscape' });
  }

  tick() {
    const { isRunning, msecs, players } = this.state;

    if (!isRunning) {
      this.stopTimer();
      return;
    }

    // countdown the timer...
    const elapsed = new Date() - this.lastTick;
    this.lastTick = new Date();
    let newtime = msecs - elapsed;
    if (newtime < 0) {
      this.stopTimer();
      newtime = 0;
    }

    // update the active players
    const newPlayers = players.map((item) => (
      { ...item, gameTime: item.playing ? item.gameTime + elapsed : item.gameTime }
    ));

    this.setState({ msecs: newtime, players: newPlayers });
  }

  startTimer() {
    this.lastTick = new Date();
    this.intervalId = setInterval(() => this.tick(), 1000);
    this.setState({ isRunning: true });
  }

  stopTimer() {
    clearInterval(this.intervalId);
    this.setState({ isRunning: false });
  }

  resetTimer() {
    const { isRunning, msecs, players } = this.state;

    // if the timer running, then stop it and reset to the default time
    // then stop the timer and reset to the default time
    if (isRunning || msecs !== DEFAULT_TIME) {
      this.setState({ isRunning: false, msecs: DEFAULT_TIME });
      this.stopTimer();
    } else {
      // reest the court time for all players
      const newplayers = players
        .map((item) => ({ ...item, gameTime: 0 }))
        .sort(sortPlayersByNumberAsc);
      this.setState({ players: newplayers });
    }
  }

  selectPlayer(number) {
    const { players } = this.state;
    const { prefs } = this.props;
    const { balancePlayers } = prefs;

    const p = players.find((item) => item.number === number);
    p.selected = !p.selected;

    const selectedPlayingCount = players.filter((item) => item.selected && item.playing).length;
    const selectedBenchCount = players.filter((item) => item.selected && !item.playing).length;

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

    this.setState({ players });
  }


  subPlayers() {
    const { players } = this.state;

    // assume that the selected players can be sub'd
    // TODO: add a check?

    // copy the player array and swap selected players on/off court
    const newplayers = players
      .map((item) => ({
        ...item,
        selected: false,
        playing: (item.selected ? !item.playing : item.playing),
      }))
      .sort(sortPlayersByNumberAsc)
      .sort(sortPlayersByGametimeAsc);

    this.setState({ players: newplayers });
  }

  render() {
    const { isRunning, orientation, players, msecs, ready, name } = this.state;

    if (!ready) {
      return (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator size="large" />
        </View>
      );
    }

    const timestr = new Date(msecs).toISOString().substr(14, 5);

    const playingCount = players.filter((item) => item.playing).length;
    const selectedPlayingCount = players.filter((item) => item.selected && item.playing).length;
    const selectedBenchCount = players.filter((item) => item.selected && !item.playing).length;
    const subButtonEnabled = (playingCount + selectedBenchCount - selectedPlayingCount <= 5)
      && (selectedPlayingCount + selectedBenchCount > 0);


    // if (orientation === 'landscape') {
    //   // Landscape mode
    //   return (
    //     <View style={styles.pageView}>
    //       <Appbar.Header>
    //         <Appbar.BackAction onPress={() => { this.handleBackPress(); }} />
    //         <Appbar.Content title="Play" />
    //         {/* <Appbar.Action icon="close" accessibilityLabel="cancel" onPress={() => { this.cancelEditTeam(); }} />
    //         <Appbar.Action icon="check" accessibilityLabel="save" disabled={!saveNeeded} onPress={() => { this.saveTeam(); }} /> */}
    //       </Appbar.Header>
    //       <View style={{ flex: 3, flexDirection: 'column' }}>
    //         <View style={styles.titleViewStyle}>
    //           <Text style={styles.titleTextStyle}>ON COURT</Text>
    //         </View>
    //         <View style={{ ...styles.playerListStyle, flexDirection: 'row', margin: 2 }}>
    //           {playing.map(item => (
    //             <TouchableNativeFeedback
    //               key={item.number}
    //               onPress={() => this.selectPlayer(item.number, true)}
    //             >
    //               <View style={{
    //                 flex: 0,
    //                 borderRadius: 2,
    //                 flexDirection: 'column',
    //                 alignItems: 'center',
    //                 width: '20%',
    //                 margin: 1,
    //                 elevation: item.selected ? 1 : 4,
    //                 backgroundColor: item.selected ? '#6ec6ff' : '#ffffff',
    //               }}
    //               >
    //                 <Text style={styles.playerNumberStyle}>{item.number}</Text>
    //                 <Text style={styles.playerNameStyle}>{item.name}</Text>
    //                 <Text style={styles.playerTimeStyle}>
    //                   {new Date(item.gameTime).toISOString().substr(14, 5)}
    //                 </Text>
    //               </View>
    //             </TouchableNativeFeedback>
    //           ))}
    //         </View>
    //       </View>
    //       <View style={{ flex: 3, flexDirection: 'column' }}>
    //         <View style={styles.titleViewStyle}>
    //           <Text style={styles.titleTextStyle}>ON BENCH</Text>
    //         </View>
    //         <View style={{ ...styles.playerListStyle, flexDirection: 'row', justifyContent: 'center' }}>
    //           {bench.map(item => (
    //             <TouchableNativeFeedback
    //               key={item.number}
    //               onPress={() => this.selectPlayer(item.number, false)}
    //             >
    //               <View style={{
    //                 flex: 0,
    //                 borderRadius: 2,
    //                 margin: 1,
    //                 flexDirection: 'column',
    //                 alignItems: 'center',
    //                 width: '20%',
    //                 elevation: item.selected ? 1 : 4,
    //                 backgroundColor: item.selected ? '#6ec6ff' : '#ffffff',
    //               }}
    //               >
    //                 <Text style={styles.playerNumberStyle}>{item.number}</Text>
    //                 <Text style={styles.playerNameStyle}>{item.name}</Text>
    //                 <Text style={styles.playerTimeStyle}>
    //                   {new Date(item.gameTime).toISOString().substr(14, 5)}
    //                 </Text>
    //               </View>
    //             </TouchableNativeFeedback>
    //           ))}
    //         </View>
    //       </View>
    //       <View style={styles.footerBar}>
    //         { buttons }
    //       </View>
    //     </View>
    //   );
    // }

    // Portrait mode
    return (
      <View style={styles.pageView}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => { this.handleBackPress(); }} />
          <Appbar.Content title={`Run Game - ${name}`} />
          <Appbar.Content style={{ flex: 0 }} title={timestr} />
        </Appbar.Header>

        <View style={{
          flex: 1, flexDirection: 'row', alignItems: 'stretch', margin: 5, justifyContent: 'space-around',
        }}
        >
          <View style={styles.playerListStyle}>
            <Title style={{ alignSelf: 'center' }}>BENCH</Title>
            <ScrollView contentContainerStyle={{ justifyContent: 'flex-start' }}>
              { players.filter((item) => !item.playing).map((item) => (
                <Card
                  key={item.number}
                  style={{
                    marginVertical: 6,
                    borderRadius: 12,
                    borderColor: item.selected ? 'purple' : '#666',
                    borderWidth: item.selected ? 2 : 1,
                  }}
                  onPress={() => this.selectPlayer(item.number)}
                >
                  <Card.Title
                    title={item.name}
                    subtitle={<Title>{new Date(item.gameTime).toISOString().substr(14, 5)}</Title>}
                    left={(props) => <Avatar.Text {...props} label={item.number} />}
                    right={(props) => <Checkbox {...props} status={item.selected ? 'checked' : 'unchecked'} />}
                  />
                  {/* <Card.Content><Text>{JSON.stringify(item)}</Text></Card.Content> */}
                </Card>
              ))}
            </ScrollView>
          </View>
          <View style={styles.playerListStyle}>
            <Title style={{ alignSelf: 'center' }}>COURT</Title>
            <ScrollView contentContainerStyle={{ justifyContent: 'flex-start' }}>
              {players.filter((item) => item.playing).map((item) => (
                <Card
                  key={item.number}
                  style={{ marginVertical: 6,
                    borderRadius: 12,
                    borderColor: item.selected ? 'purple' : '#666',
                    borderWidth: item.selected ? 2 : 1 }}
                  onPress={() => this.selectPlayer(item.number)}
                >
                  <Card.Title
                    title={item.name}
                    subtitle={<Title>{new Date(item.gameTime).toISOString().substr(14, 5)}</Title>}
                    left={(props) => <Avatar.Text {...props} label={item.number} />}
                    right={(props) => <Checkbox {...props} status={item.selected ? 'checked' : 'unchecked'} />}
                  />
                </Card>
              ))}
            </ScrollView>
          </View>
        </View>
        <Appbar style={{ justifyContent: 'space-evenly' }}>
          <Appbar.Action
            icon="timer"
            accessibilityLabel="RESET"
            onPress={() => this.resetTimer()}
            disabled={isRunning}
          />
          <Appbar.Action
            icon="swap-horiz"
            accessibilityLabel="SUBS"
            size={64}
            onPress={() => this.subPlayers()}
            disabled={!subButtonEnabled}
          />
          { isRunning ? (
            <Appbar.Action
              icon="pause"
              accessibilityLabel="PAUSE"
              onPress={() => {}}
              onLongPress={() => { this.stopTimer(); }}
            />
          ) : (
            <Appbar.Action icon="play-arrow" accessibilityLabel="PLAY" onPress={() => { this.startTimer(); }} />
          ) }
        </Appbar>
      </View>
    );
  }
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
