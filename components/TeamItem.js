import React from 'react';
import { View, Text, TouchableNativeFeedback } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export default class TeamItem extends React.PureComponent {
  static defaultProps = {
    primaryButtonStyle: { 
      fontWeight: 'bold', textAlign: 'center', 
      backgroundColor: '#6ec6ff', color: 'black', 
      borderRadius: 8, padding: 4 
    },
    altButtonStyle: {
      fontWeight: 'bold', textAlign: 'center', 
      backgroundColor: '#ffab00', color: 'black', 
      borderRadius: 8, padding: 4 
    },
    rowStyle: {
      flex: 1, flexDirection: 'row', alignItems: 'center', margin: 5,
    },
    highlightRowStyle: {
      flex: 1, flexDirection: 'row', alignItems: 'center', margin: 5,
      backgroundColor: '#2196f3'
    }
  }

  constructor (props) {
    super(props);
  }

  render () {
    if (this.props.team === undefined) return null;
    //console.log('render team: ', this.props.team.key, this.props.team.name, this.props.team.iconName);

    return (
      <TouchableNativeFeedback onPress={this.props.onSelected} onLongPress={this.props.onSelected}>
      <View style={this.props.highlighed ? this.props.highlightRowStyle : this.props.rowStyle}>

        <View style={{ flex: 1, alignSelf: 'flex-start', padding: 5 }}>
        { this.props.highlighed && this.props.onEdit &&
          <TouchableNativeFeedback onPress={this.props.onEdit} onLongPress={this.props.onSelected}>
            <Text style={this.props.primaryButtonStyle}>EDIT</Text>
          </TouchableNativeFeedback>
        }
        </View>

        <TouchableNativeFeedback onPress={this.props.onPress} onLongPress={this.props.onSelected}>
        <View style={{ flex: 4, alignItems: 'center' }}>
          <Icon name={ this.props.team.iconName } size={ 96 } />
          <Text style={{ fontSize: 24 }}>{this.props.team.name}</Text>
        </View>
        </TouchableNativeFeedback>

        <View style={{ flex: 1, alignSelf: 'flex-start', padding: 5 }}>
        { this.props.highlighed && this.props.onDelete && 
          <TouchableNativeFeedback onPress={this.props.onDelete} onLongPress={this.props.onSelected}>
            <Text style={this.props.altButtonStyle}>DELETE</Text>
          </TouchableNativeFeedback>
        }
        </View>
      </View>
      </TouchableNativeFeedback>
    );
  }
}