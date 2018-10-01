import React from 'react';
import { TouchableNativeFeedback, View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';


// Theme light colour: 2196f3 / 6ec6ff / 0069c0
// Contrast colors: ffab00 / ffdd4b / c67c00
const IconButtonDefaultStyle = { flex: 1, alignItems: 'center', backgroundColor: '#2196f3', margin: 2, borderRadius: 8 }
const IconButtonDisabledStyle = { ...IconButtonDefaultStyle, backgroundColor: '#8fa8ac' }
const IconButtonDefaultText = { fontSize: 14, fontWeight: 'bold', color: 'black' }
const IconButtonDisabledText = { ...IconButtonDefaultText, color: '#4f536a' }

export default class IconButton extends React.PureComponent {
  render () {
    return (
      <TouchableNativeFeedback 
        disabled={ this.props.disabled }
        onPress={ this.props.onPress }>
        <View style={ this.props.disabled ? IconButtonDisabledStyle : IconButtonDefaultStyle }>
          <Icon name={ this.props.iconName } size={ 18 }/>
          <Text style={ this.props.disabled ? IconButtonDisabledText : IconButtonDefaultText }>
            {this.props.title}
          </Text>
        </View>
      </TouchableNativeFeedback>
    );
  }

  static defaultProps = {
    iconSize: 18,
    textSize: 14,
  }
}
