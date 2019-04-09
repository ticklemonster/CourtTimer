/* eslint-disable react/jsx-one-expression-per-line */
import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, TouchableNativeFeedback, StyleSheet } from 'react-native';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Ionicons } from '@expo/vector-icons';

import { colours, colourStyles } from '../styles/common';

const styles = StyleSheet.create({
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    margin: 5,
  },
  rowHighlight: {
    ...colourStyles.secondaryLight,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    margin: 5,
    // backgroundColor: '#2196f3',
  },
  smallContainer: { flex: 1, alignSelf: 'flex-start', padding: 5 },
  mainContainer: { flex: 4, alignItems: 'center' },
  primaryButton: {
    ...colourStyles.secondaryDark,
    alignItems: 'center',
    fontWeight: 'bold',
    textAlign: 'center',
    // backgroundColor: '#6ec6ff',
    borderRadius: 8,
    padding: 4,
  },
  dangerButton: {
    // backgroundColor: '#ffab00',
    color: colours.danger,
    // color: 'white',
    textAlign: 'center',
    padding: 2,
  },
});


class TeamItem extends React.PureComponent {
  render() {
    const { team, highlighted, onSelect, onEdit, onDelete, onPress } = this.props;

    if (team === undefined) return null;

    return (
      <TouchableNativeFeedback onPress={onSelect} onLongPress={onSelect}>
        <View style={highlighted ? styles.rowHighlight : styles.row}>

          <View style={styles.smallContainer}>
            { highlighted && onEdit && (
              <TouchableNativeFeedback onPress={onEdit} onLongPress={onSelect}>
                <Text style={styles.primaryButton}>
                  <Ionicons name="md-create" size={18} />  EDIT
                </Text>
              </TouchableNativeFeedback>
            ) }
          </View>

          <TouchableNativeFeedback onPress={onPress} onLongPress={onSelect}>
            <View style={styles.mainContainer}>
              <Ionicons name={team.iconName} size={96} />
              <Text style={{ fontSize: 24 }}>{team.name}</Text>
            </View>
          </TouchableNativeFeedback>

          <View style={styles.smallContainer}>
            { highlighted && onDelete && (
              <TouchableNativeFeedback onPress={onDelete} onLongPress={onSelect}>
                <Text style={styles.dangerButton}>
                  <Ionicons name="md-trash" size={18} />  DELETE
                </Text>
              </TouchableNativeFeedback>
            ) }
          </View>
        </View>
      </TouchableNativeFeedback>
    );
  }
}

TeamItem.propTypes = {
  team: PropTypes.instanceOf(Object),
  highlighted: PropTypes.bool,
  onSelect: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onPress: PropTypes.func,
};

TeamItem.defaultProps = {
  team: { iconName: '', name: 'undefined' },
  highlighted: false,
  onSelect: null,
  onEdit: null,
  onDelete: null,
  onPress: null,
};

export default TeamItem;
