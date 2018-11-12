/* eslint-disable linebreak-style */
import React from 'react';
import PropTypes from 'prop-types';
import {
  Dimensions, BackHandler, ToastAndroid, StyleSheet,
  SafeAreaView, View, Text, TouchableNativeFeedback,
} from 'react-native';

import IconButton from '../components/IconButton';
import TeamStore from '../TeamStore';

const DEFAULT_TIME = 1200000;

const styles = StyleSheet.create({
  playerListStyle: {
    flex: 1, margin: 5,
  },
  titleViewStyle: {
    flex: 0, backgroundColor: '#0069c0', paddingHorizontal: 5,
  },
  titleTextStyle: {
    fontSize: 18, fontWeight: 'bold', alignSelf: 'center', color: 'white',
  },
  defaultPlayerBtnStyle: {
    flex: 1, elevation: 4, backgroundColor: '#ffffff', borderRadius: 2, marginHorizontal: 0, marginBottom: 2, flexDirection: 'column', alignItems: 'center',
  },
  selctedPlayerBtnStyle: {
    flex: 1, elevation: 1, backgroundColor: '#6ec6ff', borderRadius: 2, marginHorizontal: 0, marginBottom: 2, flexDirection: 'column', alignItems: 'center',
  },
  playerNumberStyle: {
    flex: 1, color: 'black', fontSize: 18, fontWeight: 'bold',
  },
  playerNameStyle: {
    flex: 2, color: 'black', fontSize: 24, fontWeight: 'bold',
  },
  playerTimeStyle: {
    flex: 1, color: 'black', fontSize: 18,
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
      isRunning: false,
      msecs: DEFAULT_TIME,
      playing: [],
      bench: [],
    };

    // non-display stuff
    this.backPressed = false;

    // events that need binding
    this.handleBackPress = this.handleBackPress.bind(this);
    this.handleDimensionChange = this.handleDimensionChange.bind(this);
    this.onTeamDataLoaded = this.onTeamDataLoaded.bind(this);

    // Load the data from storage...
    TeamStore.getTeam(props.navigation.getParam('key')).then(this.onTeamDataLoaded);
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
    const { navigation } = this.props;

    console.debug(`GameScreen.onTeamDataLoaded() - fetched team key=${team.key} name=${team.name}`);
    this.setState({ playing: team.players.slice(0, 5), bench: team.players.slice(5) });
    navigation.setParams({ title: `Playing - ${team.name}` });
  }


  handleBackPress() {
    const { isRunning } = this.state;

    if (isRunning && !this.backPressed) {
      this.backPressed = true;
      this.backpressTimer = setTimeout(() => { this.backPressed = false; }, 3000);
      ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);
      return true;
    }

    return false;
  }

  handleDimensionChange() {
    const { width, height } = Dimensions.get('screen');

    console.log('dimension change: ', width, height);
    this.setState({ orientation: (height >= width) ? 'portrait' : 'landscape' });
  }

  tick() {
    const { isRunning, msecs, playing } = this.state;

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
    const newPlayers = playing.map((item) => {
      const rval = Object.assign({}, item);
      rval.gameTime = item.gameTime ? item.gameTime + elapsed : elapsed;
      return rval;
    });

    this.setState({ msecs: newtime, playing: newPlayers });
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

  toggleTimer() {
    const { isRunning } = this.state;

    if (isRunning) {
      this.stopTimer();
    } else {
      this.startTimer();
    }
  }

  resetTimer() {
    const { isRunning, msecs, playing, bench } = this.state;

    // if the timer running, then stop it and reset to the default time
    // then stop the timer and reset to the default time
    if (isRunning || msecs !== DEFAULT_TIME) {
      this.stopTimer();
      this.setState({ isRunning: false, msecs: DEFAULT_TIME });
    } else {
      // reest the court time for all players
      const newPlaying = playing
        .map(item => ({ ...item, gameTime: 0 }))
        .sort(this.sortPlayersByNumberAsc);
      const newBench = bench
        .map(item => ({ ...item, gameTime: 0 }))
        .sort(this.sortPlayersByNumberAsc);
      this.setState({ playing: newPlaying, bench: newBench });
    }
  }

  selectPlayer(number, isActive) {
    const { playing, bench } = this.state;
    const { balance, screenProps } = this.props;

    const newPlaying = playing.slice(0);
    const newBench = bench.slice(0);
    const selPlayer = isActive ? newPlaying.find(item => item.number === number)
      : newBench.find(item => item.number === number);

    if (selPlayer === undefined) return;

    // update the player selection toggle
    const wasSelected = (selPlayer === undefined ? undefined : selPlayer.selected || false);
    selPlayer.selected = !wasSelected;

    // auto-balance player selection only when selecting a new player
    const shouldBalance = balance || screenProps.balance;
    const playingSelectCount = newPlaying.reduce((count, i) => count + (i.selected ? 1 : 0), 0);
    const benchSelectCount = newBench.reduce((count, i) => count + (i.selected ? 1 : 0), 0);
    if (!wasSelected && shouldBalance) {
      if (isActive && playingSelectCount > bench.length) {
        console.log('SelectPlayer: more active selected than bench depth. Auto unselect active?');
      } else if (!isActive && benchSelectCount > playing.length) {
        console.log('SelectPlayer: more bench selected than possible active players. Auto unselect bench?');
      } else if (isActive && !wasSelected && playingSelectCount > benchSelectCount) {
        console.debug('SelectPlayer: balance active > bench -> try to auto-select bench');
        // select the first unselected bench player
        const benchIdx = newBench.findIndex(player => !player.selected);
        newBench[benchIdx].selected = true;
      } else if (!isActive && !wasSelected && benchSelectCount > playingSelectCount) {
        console.debug('SelectPlayer: balance bench > active -> try to auto-select active');
        // select the first unselected playing player
        const activeIdx = newPlaying.findIndex(player => !player.selected);
        newPlaying[activeIdx].selected = true;
      }
    }

    this.setState({ playing: newPlaying, bench: newBench });
  }

  subPlayers() {
    const { playing, bench } = this.state;

    // validate that subs are valid
    const selectedActiveCount = playing.filter(item => item.selected).length;
    const selectedBenchCount = bench.filter(item => item.selected).length;
    if (selectedActiveCount !== selectedBenchCount) { return; }

    // copy the player array and swap selected players on/off court
    let newPlaying = [];
    let newBench = [];
    playing.forEach(item => (item.selected ? newBench.push(item) : newPlaying.push(item)));
    bench.forEach(item => (item.selected ? newPlaying.push(item) : newBench.push(item)));

    // sort the arrays by gametime and number and remove current selections...
    newPlaying = newPlaying
      .sort(this.sortPlayersByNumberAsc)
      .sort(this.sortPlayersByGametimeDsc)
      .map(p => ({ ...p, selected: false }));
    newBench = newBench
      .sort(this.sortPlayersByNumberAsc)
      .sort(this.sortPlayersByGametimeAsc)
      .map(a => ({ ...a, selected: false }));

    this.setState({ playing: newPlaying, bench: newBench });
  }

  render() {
    const { isRunning, msecs, orientation, playing, bench } = this.state;

    const timestr = new Date(msecs).toISOString().substr(14, 5);
    const selectedActiveCount = playing.filter(item => item.selected).length;
    const selectedBenchCount = bench.filter(item => item.selected).length;

    const buttons = [
      <IconButton
        key="PLAY-PAUSE"
        onPress={() => this.toggleTimer()}
        iconName={isRunning ? 'md-pause' : 'md-play'}
        title={(isRunning ? 'STOP' : 'START')}
      />,
      <IconButton
        key="SUBS"
        onPress={() => this.subPlayers()}
        iconName="md-swap"
        title="SUBS"
        disabled={selectedActiveCount === 0 || selectedActiveCount !== selectedBenchCount}
      />,
      <IconButton
        key="RESET"
        onPress={() => this.resetTimer()}
        iconName="md-timer"
        title="RESET"
      />,
    ];

    if (orientation === 'landscape') {
      // Landscape mode
      return (
        <View style={
          { flex: 1, alignContent: 'center', backgroundColor: '#cfd8dc', flexDirection: 'column' }
        }
        >
          <View style={{ flex: 0, alignSelf: 'center', alignContent: 'center' }}>
            <Text style={{ fontSize: 24, color: 'blue' }}>{timestr}</Text>
          </View>
          <View style={{ flex: 3, flexDirection: 'column' }}>
            <View style={styles.titleViewStyle}>
              <Text style={styles.titleTextStyle}>ON COURT</Text>
            </View>
            <View style={{ ...styles.playerListStyle, flexDirection: 'row', margin: 2 }}>
              {playing.map(item => (
                <TouchableNativeFeedback
                  key={item.number}
                  onPress={() => this.selectPlayer(item.number, true)}
                >
                  <View style={{
                    flex: 0,
                    borderRadius: 2,
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '20%',
                    margin: 1,
                    elevation: item.selected ? 1 : 4,
                    backgroundColor: item.selected ? '#6ec6ff' : '#ffffff',
                  }}
                  >
                    <Text style={styles.playerNumberStyle}>{item.number}</Text>
                    <Text style={styles.playerNameStyle}>{item.name}</Text>
                    <Text style={styles.playerTimeStyle}>
                      {new Date(item.gameTime).toISOString().substr(14, 5)}
                    </Text>
                  </View>
                </TouchableNativeFeedback>
              ))}
            </View>
          </View>
          <View style={{ flex: 3, flexDirection: 'column' }}>
            <View style={styles.titleViewStyle}>
              <Text style={styles.titleTextStyle}>ON BENCH</Text>
            </View>
            <View style={{ ...styles.playerListStyle, flexDirection: 'row', justifyContent: 'center' }}>
              {bench.map(item => (
                <TouchableNativeFeedback
                  key={item.number}
                  onPress={() => this.selectPlayer(item.number, false)}
                >
                  <View style={{
                    flex: 0,
                    borderRadius: 2,
                    margin: 1,
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '20%',
                    elevation: item.selected ? 1 : 4,
                    backgroundColor: item.selected ? '#6ec6ff' : '#ffffff',
                  }}
                  >
                    <Text style={styles.playerNumberStyle}>{item.number}</Text>
                    <Text style={styles.playerNameStyle}>{item.name}</Text>
                    <Text style={styles.playerTimeStyle}>
                      {new Date(item.gameTime).toISOString().substr(14, 5)}
                    </Text>
                  </View>
                </TouchableNativeFeedback>
              ))}
            </View>
          </View>
          <View style={{ flex: 0, flexDirection: 'row' }}>
            { buttons }
          </View>
        </View>
      );
    }

    // Portrait mode
    return (
      <View style={{ flex: 1, alignItems: 'stretch', flexDirection: 'column' }}>
        <View style={{ flex: 0, alignSelf: 'center', alignContent: 'center' }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'blue' }}>{timestr}</Text>
        </View>
        <View style={{
          flex: 1, flexDirection: 'row', alignItems: 'stretch', margin: 5, justifyContent: 'space-around',
        }}
        >
          <View style={styles.playerListStyle}>
            <View style={styles.titleViewStyle}>
              <Text style={styles.titleTextStyle}>BENCH</Text>
            </View>
            <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'flex-start' }}>
              { bench.map(item => (
                <TouchableNativeFeedback
                  key={item.number}
                  onPress={() => this.selectPlayer(item.number, false)}
                >
                  <View style={{
                    flex: 0,
                    borderRadius: 2,
                    margin: 1,
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: '20%',
                    elevation: item.selected ? 1 : 4,
                    backgroundColor: item.selected ? '#6ec6ff' : '#ffffff',
                  }}
                  >
                    <Text style={styles.playerNumberStyle}>{item.number}</Text>
                    <Text style={styles.playerNameStyle}>{item.name}</Text>
                    <Text style={styles.playerTimeStyle}>
                      {new Date(item.gameTime).toISOString().substr(14, 5)}
                    </Text>
                  </View>
                </TouchableNativeFeedback>
              ))}
            </View>
          </View>
          <View style={styles.playerListStyle}>
            <View style={styles.titleViewStyle}>
              <Text style={styles.titleTextStyle}>COURT</Text>
            </View>
            <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'flex-start' }}>
              {playing.map(item => (
                <TouchableNativeFeedback
                  key={item.number}
                  onPress={() => this.selectPlayer(item.number, true)}
                >
                  <View style={{
                    flex: 0,
                    borderRadius: 2,
                    margin: 1,
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: '20%',
                    elevation: item.selected ? 1 : 4,
                    backgroundColor: item.selected ? '#6ec6ff' : '#ffffff',
                  }}
                  >
                    <Text style={styles.playerNumberStyle}>{item.number}</Text>
                    <Text style={styles.playerNameStyle}>{item.name}</Text>
                    <Text style={styles.playerTimeStyle}>
                      {new Date(item.gameTime).toISOString().substr(14, 5)}
                    </Text>
                  </View>
                </TouchableNativeFeedback>
              ))}
            </View>
          </View>
        </View>
        <View style={{ flex: 0, flexDirection: 'row' }}>
          { buttons }
        </View>
      </View>
    );
  }
}

GameScreen.navigationOptions = ({ navigation }) => ({
  title: navigation.getParam('title', 'Court Timer'),
});

GameScreen.propTypes = {
  navigation: PropTypes.instanceOf(Object).isRequired,
  balance: PropTypes.bool,
  screenProps: PropTypes.instanceOf(Object),
};

GameScreen.defaultProps = {
  balance: false,
  screenProps: { balance: false },
};

export default GameScreen;
