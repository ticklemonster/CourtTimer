import React from 'react';
import { View } from 'react-native';
import { List, ListItem, Left, Body, Right, Button, Text, Icon } from 'native-base';
import TimeText from './timetext';

export default class PlayerListItem extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selected: false
    };
  }

  toggleSelect = () => {
    console.log('toggleSelect ', this.props.player.name );
    this.setState( prevState => { return { selected: !prevState.selected } });
  }

  render() {
    let item_icon = (!this.state.selected)?'md-radio-button-off':(this.props.player.onCourt?'arrow-down':'arrow-up');

    //return (<ListItem onPress={ ()=>{ this.props.onPress(item) } } >
    return (<ListItem key={this.props.player.key} onPress={ this.toggleSelect }>
      <Left><Icon name={ item_icon }/></Left>
      <Body><Text>{this.props.player.key}. {this.props.player.name}</Text></Body>
      <Right><TimeText msecs={this.props.player.gameTime}></TimeText></Right>
    </ListItem>);
  }

}
