import React from 'react';
import { View, StyleSheet } from 'react-native';
import { List, ListItem, Left, Body, Right, Button, Text, Icon } from 'native-base';
import TimeText from './timetext';

export default class PlayerListItem extends React.Component {

  render() {
    let item_icon = (!this.props.player.selected)?'more':(this.props.player.onCourt?'arrow-down':'arrow-up');

    return (<ListItem key={this.props.player.key}
          onPress={ this.props.onPress.bind(this,this.props.player.key) }
          style={ this.props.player.selected ? styles.selectedRow : {} }  >
      <Left style={{flex: 1}}>
        <Icon name={ item_icon }/>
      </Left>
      <Body style={{flex: 7}}>
        <Text style={ this.props.player.selected ? styles.selectedPlayer : styles.unselectedPlayer } >
        {this.props.player.key}. {this.props.player.name}
        </Text>
      </Body>
      <Right style={{flex: 2}}>
        <TimeText msecs={this.props.player.gameTime}></TimeText>
      </Right>
    </ListItem>);
  }

};

const styles = StyleSheet.create({
  selectedRow: {
    flex: 1,
    backgroundColor: '#ddf',
  },
  unselectedPlayer: {
    fontSize: 26
  },
  selectedPlayer: {
    fontSize: 26,
    color: 'darkblue',
  },
});
