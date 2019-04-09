import React from 'react';
import PropTypes from 'prop-types';
import { TouchableNativeFeedback, View, Text, StyleSheet } from 'react-native';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Ionicons } from '@expo/vector-icons';
import { colours, colourStyles } from '../styles/common';


// Theme light colour: 2196f3 / 6ec6ff / 0069c0
// Contrast colors: ffab00 / ffdd4b / c67c00
const styles = StyleSheet.create({
  IconButton: {
    flex: 1,
    alignItems: 'center',
    margin: 2,
    borderRadius: 8,
    ...colourStyles.secondaryDark,
  },
  IconButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    ...colourStyles.secondaryDark,
  },
  IconButtonDisabled: {
    flex: 1,
    alignItems: 'center',
    margin: 2,
    borderRadius: 8,
    ...colourStyles.primaryDark,
  },
  IconButtonDisabledText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colours.primaryLight,
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
        <View style={disabled ? styles.IconButtonDisabled : styles.IconButton}>
          <Ionicons
            name={iconName}
            size={18}
            style={disabled ? styles.IconButtonDisabledText : styles.IconButtonText}
          />
          <Text style={disabled ? styles.IconButtonDisabledText : styles.IconButtonText}>
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
