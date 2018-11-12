import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, TouchableNativeFeedback, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const styles = StyleSheet.create({
  buttonStyle: {
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: '#6ec6ff',
    color: 'black',
    borderRadius: 8,
    padding: 4,
  },
  buttonStyleAlt: {
    backgroundColor: '#ffab00',
  },
  rowStyle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    margin: 5,
  },
  rowStyleHighlight: {
    backgroundColor: '#2196f3',
  },
});


class TeamItem extends React.PureComponent {
  render() {
    const { team, highlighted, onSelect, onEdit, onDelete, onPress } = this.props;

    if (team === undefined) return null;

    return (
      <TouchableNativeFeedback onPress={onSelect} onLongPress={onSelect}>
        <View style={[styles.rowStyle, highlighted && styles.rowStyleHighlight]}>

          <View style={{ flex: 1, alignSelf: 'flex-start', padding: 5 }}>
            { highlighted && onEdit && (
              <TouchableNativeFeedback onPress={onEdit} onLongPress={onSelect}>
                <Text style={[styles.buttonStyle]}>EDIT</Text>
              </TouchableNativeFeedback>
            ) }
          </View>

          <TouchableNativeFeedback onPress={onPress} onLongPress={onSelect}>
            <View style={{ flex: 4, alignItems: 'center' }}>
              <Ionicons name={team.iconName} size={96} />
              <Text style={{ fontSize: 24 }}>{team.name}</Text>
            </View>
          </TouchableNativeFeedback>

          <View style={{ flex: 1, alignSelf: 'flex-start', padding: 5 }}>
            { highlighted && onDelete && (
              <TouchableNativeFeedback onPress={onDelete} onLongPress={onSelect}>
                <Text style={[styles.buttonStyle, styles.buttonStyleAlt]}>DELETE</Text>
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
