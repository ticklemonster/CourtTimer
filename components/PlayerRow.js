import React from 'react';
import PropTypes from 'prop-types';
import { PixelRatio, View, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

class PlayerRow extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      currentName: props.name,
      validName: props.name > '',
      currentNumber: props.number,
      validNumber: !Number.isNaN(parseInt(props.number, 10)),
    };

    this.nameInput = null;
    this.numberInput = null;
  }

  onAddPressed() {
    const { onAdd } = this.props;
    const { currentName, currentNumber } = this.state;

    if (!onAdd) return;

    onAdd(currentNumber, currentName);
    this.setState({ validNumber: false, validName: false });
  }

  onSavePressed() {
    const { onSave } = this.props;
    const { currentName, currentNumber } = this.state;

    if (!onSave) return;

    onSave(currentNumber, currentName);
    this.setState({ validNumber: false, validName: false });
  }

  onDeletePressed() {
    const { onDelete } = this.props;
    const { currentNumber } = this.state;

    if (!onDelete) return;
    onDelete(currentNumber);
  }

  onUpdateName(text) {
    if (text === undefined || text === '') {
      this.setState({ currentName: '', validName: false });
    } else {
      this.setState({ currentName: text, validName: true });
    }
  }

  onUpdateNumber(text) {
    const num = parseInt(text, 10);
    if (Number.isNaN(num)) {
      this.setState({ currentNumber: '', validNumber: false });
    } else {
      this.setState({ currentNumber: num.toString(10), validNumber: true });
    }
  }

  onSubmitNumber() {
    const { validName, validNumber } = this.state;
    const { onAdd, onSave } = this.props;

    // if the name isn't finished, switch inputs
    if (!validName && this.nameInput) {
      this.nameInput.focus();
      return;
    }

    // if both are finished, automatically save changes
    if (validName && validNumber) {
      if (onSave) this.onSavePressed();
      else if (onAdd) this.onAddPressed();

      if (this.numberInput) this.numberInput.blur();
    }
  }

  onSubmitName() {
    const { validNumber, validName } = this.state;
    const { onAdd, onSave } = this.props;

    // if the number isn't finished, switch inputs
    if (!validNumber && this.numberInput) {
      this.numberInput.focus();
      return;
    }

    // if both are finished, automatically save changes
    if (validNumber && validName) {
      if (onSave) this.onSavePressed();
      else if (onAdd) this.onAddPressed();

      if (this.nameInput) this.nameInput.blur();
    }
  }

  render() {
    const { fontSize, buttonSize, onAdd, onDelete } = this.props;
    const { currentName, currentNumber, validName, validNumber } = this.state;

    const scaledFontSize = fontSize * PixelRatio.get();
    const scaledButtonSize = buttonSize * PixelRatio.get();

    // EDITABLE VIEW
    return (
      <View style={{ flex: 0, flexDirection: 'row', marginVertical: 5 }}>
        <TextInput
          style={{ flex: 1, fontSize: scaledFontSize }}
          keyboardType="numeric"
          maxLength={3}
          ref={(ref) => { this.numberInput = ref; }}
          onChangeText={(text) => { this.onUpdateNumber(text); }}
          onSubmitEditing={() => { this.onSubmitNumber(); }}
          blurOnSubmit={false}
          value={currentNumber}
        />
        <TextInput
          style={{ flex: 4, fontSize: scaledFontSize }}
          ref={(ref) => { this.nameInput = ref; }}
          onChangeText={(text) => { this.onUpdateName(text); }}
          onSubmitEditing={() => { this.onSubmitName(); }}
          blurOnSubmit={false}
          value={currentName}
        />
        { onAdd && (
          <Ionicons
            name="md-add"
            style={{ color: (validName && validNumber) ? '#48c' : '#777', marginLeft: 10 }}
            size={scaledButtonSize}
            disabled={!(validName && validNumber)}
            onPress={() => { this.onAddPressed(); }}
          />
        ) }
        { onDelete && (
          <Ionicons
            name="md-trash"
            style={{ color: 'red', marginLeft: 10 }}
            size={scaledButtonSize}
            onPress={() => { this.onDeletePressed(); }}
          />
        ) }
      </View>
    );
  }
}

PlayerRow.propTypes = {
  name: PropTypes.string,
  number: PropTypes.string,
  fontSize: PropTypes.number,
  buttonSize: PropTypes.number,

  onAdd: PropTypes.func,
  onDelete: PropTypes.func,
  onSave: PropTypes.func,
};

PlayerRow.defaultProps = {
  name: '',
  number: '',
  fontSize: 10,
  buttonSize: 12,

  onAdd: null,
  onDelete: null,
  onSave: null,
};

export default PlayerRow;
