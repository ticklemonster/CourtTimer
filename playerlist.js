import React from 'react';
import { View } from 'react-native';
import { List, ListItem, Left, Body, Right, Button, Text, Icon } from 'native-base';
import PlayerListItem from './playerlistitem';

export default class PlayerList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      history:  []
    };
  }

  gameTimeAsc(a,b) {
    return a.gameTime - b.gameTime;
  }
  gameTimeDesc(a,b) {
    return b.gameTime - a.gameTime;
  }

  renderRow = (item) => {
    if( item.key < 0 ) {
      return (<ListItem itemDivider><Text>{item.name}</Text></ListItem>);
    } else {
      return (<PlayerListItem player={item} />);
    }

  }

  render() {
    const onCourtHeader = { key: -1, name: 'ON COURT' };
    const onBenchHeader = { key: -2, name: 'ON BENCH' };

    //console.log('PlayerList render with players=',this.props.players);
    let onCourt = this.props.players.filter( (player) => { return player.onCourt; } );
    let onBench = this.props.players.filter( (player) => { return (!player.onCourt); } );
    onCourt.sort(this.gameTimeDesc);
    onBench.sort(this.gameTimeAsc);

    let renderData = [ onCourtHeader ].concat( onCourt ).concat([onBenchHeader]).concat(onBench);

    return (
      <View>
        <List
          dataArray={ renderData }
          renderRow={ this.renderRow }
        />
      </View>
    );
  }

}
