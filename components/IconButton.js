import React from 'react';
import PropTypes from 'prop-types';
import { TouchableNativeFeedback, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';


// Theme light colour: 2196f3 / 6ec6ff / 0069c0
// Contrast colors: ffab00 / ffdd4b / c67c00
const styles = StyleSheet.create({
  IconButtonStyle: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#2196f3',
    margin: 2,
    borderRadius: 8,
  },
  IconButtonDisabledStyle: {
    backgroundColor: '#8fa8ac',
  },
  IconButtonDefaultText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'black',
  },
  IconButtonDisabledText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4f536a',
  },
});

class IconButton extends React.PureComponent {
  render() {
    const { disabled, onPress, iconName, title } = this.props;

    return (
      <TouchableNativeFeedback
        disabled={disabled}
        onPress={onPress}
      >
        <View style={[styles.IconButtonStyle, disabled && styles.IconButtonDisabledStyle]}>
          <Ionicons name={iconName} size={18} />
          <Text style={disabled ? styles.IconButtonDisabledText : styles.IconButtonDefaultText}>
            {title}
          </Text>
        </View>
      </TouchableNativeFeedback>
    );
  }
}

IconButton.propTypes = {
  disabled: PropTypes.bool,
  onPress: PropTypes.func.isRequired,
  iconName: PropTypes.string,
  title: PropTypes.string,
};

IconButton.defaultProps = {
  disabled: false,
  iconName: 'basketball',
  title: '',
};

export default IconButton;
