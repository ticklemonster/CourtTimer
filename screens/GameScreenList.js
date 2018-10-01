import React from 'react';
import { 
  Dimensions, BackHandler, ToastAndroid,
  SafeAreaView, View, FlatList, Text, TouchableNativeFeedback, Button, 
} from 'react-native';
import IconButton from '../components/IconButton';
import TeamStore from '../TeamStore';

const DEFAULT_TIME = 1200000;

const playerListStyle = { margin: 5 }; //backgroundColor: '#cfd8dc', borderWidth: 5, borderColor: '#0069c0' };
const titleViewStyle = { backgroundColor: '#0069c0', paddingHorizontal: 5 };
const titleTextStyle = { fontSize: 18, fontWeight: 'bold', alignSelf: 'center', color: 'white' };

export default class GameScreen extends React.Component {
  static navigationOptions = ({navigation}) => {
    return {
      title: navigation.getParam('title','Court Timer')
    };
  };

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
  }

  componentDidMount () {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
    Dimensions.addEventListener('change', this.handleDimensionChange);

    // Load the data from storage...
    TeamStore.getTeam(this.props.navigation.getParam('teamkey'))
      .then((team) => {
        console.debug('GameScreen.componentDidMount() - fetched team key=' + team.key + ' name=' + team.name );
        this.setState({ playing: team.players.slice(0,5), bench: team.players.slice(5)});

        this.props.navigation.setParams({title: 'Playing - ' + team.name});
      })
      .catch((err) => {
        console.log('GameScreen.componentDidMount() - failed to load team from store. Ignored.', err);
      });

    // work out the initial dimensions...
    this.handleDimensionChange();
  }

  componentWillUnmount () {
    // cancel listeners and timers
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
    Dimensions.removeEventListener('change', this.handleDimensionChange);
    if (this.backpressTimer) clearTimeout (this.backpressTimer);
    if (this.intervalId) clearInterval(this.intervalId);
  }

  handleBackPress () {
    
    if (this.state.isRunning && !this.backPressed) {
      this.backPressed = true;
      this.backpressTimer = setTimeout( () => {this.backPressed = false}, 3000 );
      ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);
      return true;
    }

    return false;
  }

  handleDimensionChange () {
    const {width, height} = Dimensions.get('screen');

    this.setState({ orientation: (height >= width) ? 'portrait' : 'landscape' });
  }

  tick = () => {
    if( !this.state.isRunning ) {
      this.stopTimer();
      return;
    }

    // countdown the timer...
    const elapsed = new Date() - this.lastTick;
    this.lastTick = new Date();
    let newtime = this.state.msecs - elapsed;
    if( newtime < 0 ) {
      this.stopTimer();
      newtime = 0;
    }

    // update the active players
    newPlayers = this.state.playing.map( (item) => {
      item.gameTime = item.gameTime ? item.gameTime + elapsed : elapsed;
      return item;
    });

    this.setState({ msecs: newtime, playing: newPlayers });
  }

  startTimer() {
    this.lastTick = new Date();
    this.intervalId = setInterval(this.tick, 1000);
    this.setState({ isRunning: true });
  }

  stopTimer() {
    clearInterval(this.intervalId);
    this.setState({ isRunning: false });
  }

  toggleTimer = () => {
    if( this.state.isRunning ) {
      this.stopTimer();
    } else {
      this.startTimer();
    }
  }

  // helpful player sorting functions
  sortPlayersByNumberAsc = (a, b) => parseInt(a.number) - parseInt(b.number)
  sortPlayersByGametimeAsc = (a, b) => a.gameTime - b.gameTime
  sortPlayersByGametimeDsc = (a, b) => b.gameTime - a.gameTime

  resetTimer = () => {
    // if the timer running, then stop it and reset to the default time
    // then stop the timer and reset to the default time
    if( this.state.isRunning || this.state.msecs !== DEFAULT_TIME) {
      this.stopTimer();
      this.setState({ isRunning: false, msecs: DEFAULT_TIME });
    }

    // reest the court time for all players
    else {
      const newPlaying = this.state.playing
        .map(item => { item.gameTime = 0; return item; })
        .sort(this.sortPlayersByNumberAsc);
      const newBench = this.state.bench
        .map(item => { item.gameTime = 0; return item; })
        .sort(this.sortPlayersByNumberAsc)
      this.setState({ playing: newPlaying, bench: newBench });
    }
  }

  selectPlayer (number, isActive) {
    const newPlaying = this.state.playing.slice(0);
    const newBench = this.state.bench.slice(0);
    const selPlayer = isActive ? newPlaying.find(item => item.number === number) : newBench.find(item => item.number === number);
    const wasSelected = (selPlayer === undefined ? undefined : selPlayer.selected || false);

    if (selPlayer === undefined) return;

    // update the player selection toggle
    selPlayer.selected = !wasSelected;

    // auto-balance player selection only when selecting a new player
    const shouldBalance = this.props.balance || this.props.screenProps.balance
    if (!wasSelected && shouldBalance) {
      const playingSelectCount = newPlaying.reduce((count,item) => count + (item.selected?1:0), 0);
      const benchSelectCount = newBench.reduce((count,item) => count + (item.selected?1:0), 0);

      if (isActive && playingSelectCount > this.state.bench.length) {
        console.log('SelectPlayer: more active selected than bench depth. Auto unselect active?');
      }
      else if (!isActive && benchSelectCount > this.state.playing.length) {
        console.log('SelectPlayer: more bench selected than possible active players. Auto unselect bench?');
      }
      else if (isActive && !wasSelected && playingSelectCount > benchSelectCount) {
        console.debug('SelectPlayer: balance active > bench -> try to auto-select bench');
        // select the first unselected bench player
        let benchIdx = newBench.findIndex(player => !player.selected);
        newBench[benchIdx].selected = true;
      }
      else if (!isActive && !wasSelected && benchSelectCount > playingSelectCount) {
        console.debug('SelectPlayer: balance bench > active -> try to auto-select active');
        // select the first unselected playing player
        let activeIdx = newPlaying.findIndex(player => !player.selected);
        newPlaying[activeIdx].selected = true;
      }
    }
    
    this.setState({ playing: newPlaying, bench: newBench });
  }

  subPlayers = () => {
    // validate that subs are valid
    const selectedActiveCount  = this.state.playing.filter(item => item.selected).length;
    const selectedBenchCount  = this.state.bench.filter(item => item.selected).length;
    if (selectedActiveCount != selectedBenchCount)
      return;

    // copy the player array and swap selected players on/off court
    const newPlaying = [];
    const newBench = [];
    this.state.playing.forEach(item => item.selected ? newBench.push(item) : newPlaying.push(item));
    this.state.bench.forEach(item => item.selected ? newPlaying.push(item) : newBench.push(item));

    // sort the arrays by gametime and number and remove current selections...
    newPlaying
      .sort(this.sortPlayersByNumberAsc)
      .sort(this.sortPlayersByGametimeDsc)
      .forEach(a => a.selected = false);
    newBench
      .sort(this.sortPlayersByNumberAsc)
      .sort(this.sortPlayersByGametimeAsc)
      .forEach(a => a.selected = false);
    
    this.setState( { playing: newPlaying, bench: newBench } );
  }

  render() {
    const timestr = new Date(this.state.msecs).toISOString().substr(14,5);
    // const selectedActiveCount = this.state.playing.reduce((count,item) => (item.selected ? count+1 : count));
    const selectedActiveCount  = this.state.playing.filter(item => item.selected).length;
    const selectedBenchCount  = this.state.bench.filter(item => item.selected).length;

    const buttons = [        
      <IconButton key='PLAY-PAUSE' onPress={this.toggleTimer}
        iconName={this.state.isRunning ? 'md-pause' : 'md-play'} 
        title={(this.state.isRunning ? 'STOP' : 'START')} />,
      <IconButton key='SUBS' onPress={this.subPlayers} iconName='md-swap' title='SUBS' 
        disabled={ selectedActiveCount == 0 || selectedActiveCount != selectedBenchCount } />,
      <IconButton key='RESET' onPress={this.resetTimer} iconName='md-timer' title='RESET' />,
    ];

    if (this.state.orientation == 'landscape') {
      // Landscape mode
      return (
        <SafeAreaView style={{ flex: 1, alignContent: 'center', backgroundColor: '#cfd8dc' }}>
          <View style={{ flex: 1, alignSelf: 'center', alignContent: 'center', flexDirection: 'row' }}>
            <Text style={{ fontSize: 24, color: 'blue' }}>{timestr}</Text>
          </View>       
          <View style={{ flex: 6, flexDirection: 'row' }}>
            <View style={{ flex: 1, ...playerListStyle }}>
              <View style={titleViewStyle}><Text style={titleTextStyle}>ON COURT</Text></View>
              <FlatList data={this.state.playing}
                keyExtractor={ (item) => item.number.toString() }
                renderItem={({item}) => 
                  <PlayerTimerSelectable player={item}
                    onPress={() => this.selectPlayer(item.number, true)} 
                  />
                }>
              </FlatList>
            </View>
            <View style={{ flex: 1, ...playerListStyle }}>
              <View style={titleViewStyle}><Text style={titleTextStyle}>ON BENCH</Text></View>
              <FlatList data={this.state.bench}
                keyExtractor={ (item) => item.number.toString() }
                renderItem={({item}) =>
                  <PlayerTimerSelectable player={item}
                    onPress={() => this.selectPlayer(item.number, false)} 
                  />
                }>              
              </FlatList>
            </View>
          </View>
          <View style={{ flex: 1, flexDirection: 'row' }}>
            { buttons }
          </View>
        </SafeAreaView>
      );
    } else {
      // Portrait mode
      return (
        <SafeAreaView style={{ flex: 1, alignItems: 'stretch' }}>
          <View style={{ flex: 1, alignSelf: 'center', alignContent: 'center', flexDirection: 'row' }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'blue' }}>{timestr}</Text>
          </View> 
          <View style={{ flex: 6, ...playerListStyle }}>
            <View style={titleViewStyle}><Text style={titleTextStyle}>COURT</Text></View>
            <FlatList data={this.state.playing}
              keyExtractor={ (item) => item.number.toString() }
              renderItem={({item}) => 
                <PlayerTimerSelectable player={item}
                  onPress={() => this.selectPlayer(item.number, true)} 
                />
              } 
            >
            </FlatList>
          </View>
          <View style={{ flex: 6, ...playerListStyle }}>
          <View style={titleViewStyle}><Text style={titleTextStyle}>BENCH</Text></View>
            <FlatList data={this.state.bench}
              keyExtractor={ (item) => item.number.toString() }
              renderItem={({item}) => 
                <PlayerTimerSelectable player={item}
                  onPress={() => this.selectPlayer(item.number, false)} 
                />
              } 
            >
            </FlatList>
          </View>
          <View style={{ flex: 1, flexDirection: 'row' }}>
            { buttons }
          </View>
        </SafeAreaView>
      );
    }
  }

}

// 
// Players are drawn as buttons for the game
// -- Should move to a separate class! --
//
const defaultPlayerBtnStyle = { elevation: 4, backgroundColor: '#ffffff', borderRadius: 2, marginHorizontal: 0, marginBottom: 2, flexDirection: 'row' };
const selctedPlayerBtnStyle = { elevation: 1, backgroundColor: '#6ec6ff', borderRadius: 2, marginHorizontal: 0 /* 5 */, marginBottom: 2, flexDirection: 'row'  };
const defaultPlayerTextStyle = { flex: 1, color: 'black', padding: 8, fontSize: 18, fontWeight: '500', textAlign: 'left' };
const defaultTimerTextStyle = { flex: 0, color: 'black', padding: 8, fontSize: 18, fontWeight: '300', textAlign: 'right' };

class PlayerTimerSelectable extends React.PureComponent {
  render () {
    const msecstr = new Date(this.props.player.gameTime).toISOString().substr(14,5);
  
    return (<TouchableNativeFeedback
      onPress={this.props.onPress}>
      <View style={ this.props.player.selected ? selctedPlayerBtnStyle : defaultPlayerBtnStyle }>
        <Text style={ defaultPlayerTextStyle }>
          {this.props.player.number}: {this.props.player.name}
        </Text>
        <Text style={ defaultTimerTextStyle }>
          {msecstr}
        </Text>
      </View>
    </TouchableNativeFeedback>);
  }
}