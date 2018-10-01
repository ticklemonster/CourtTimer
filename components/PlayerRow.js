import React from 'react';
import { 
  PixelRatio, View, TextInput, Text, TouchableNativeFeedback,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';


export default class PlayerRow extends React.PureComponent {
  static defaultProps = {
    fontSize: 10,
    buttonSize: 12,
  }

  constructor (props) {
    super(props);
    this.state = { 
      name: undefined, 
      number: undefined, 
      saveEnabled: false,
    }

    this.nameInput = null;
    this.numberInput = null;
  }

  componentWillMount () {
    // set initial state based on supplied props
    this.setState({
      number: this.props.number,
      name: this.props.name,
    });
  }

  updateNumber (text) {
    if (isNaN(parseInt(text))) {
      this.setState({ number: '', saveEnabled: false });
    } else {
      this.setState({ number: text, saveEnabled: this.state.name > '' });
    }
  }

  updateName (text) {
    if (text === undefined || text == '') {
      this.setState({name: '', saveEnabled: false});
    } else {
      this.setState({name: text, saveEnabled: this.state.number > ''});
    }
  }

  onSubmitNumber = () => {
    if (this.state.saveEnabled) {
      // submit the changes automajically
      if (this.props.onSave) this.onSavePressed()
      else if (this.props.onAdd) this.onAddPressed();
      if (this.numberInput) this.numberInput.blur();
    }
    else {
      // not ready to save - go to the name field
      if (this.nameInput) this.nameInput.focus();
    }
  }

  onSubmitName = () => {
    if (this.state.saveEnabled) {
      // submit the changes automajically
      if (this.props.onSave) this.onSavePressed()
      else if (this.props.onAdd) this.onAddPressed();
      if (this.nameInput) this.nameInput.blur();
    }
    else {
      // more editing to do...
      if (this.numberInput) this.numberInput.focus();
    }
  }

  onAddPressed = () => {
    if (!this.props.onAdd) return;

    this.props.onAdd (this.state.number, this.state.name);
    this.setState({ name: undefined, number: undefined, saveEnabled: false });
  }
  onSavePressed = () => {
    if (!this.props.onSave) return;

    this.props.onSave (this.state.number, this.state.name);
    this.setState({ saveEnabled: false });
  }
  onDeletePressed = () => {
    if (!this.props.onDelete) return;

    this.props.onDelete(this.props.number);
  }


  render () {
    const scaledFontSize = this.props.fontSize * PixelRatio.get();
    const scaledButtonSize = this.props.buttonSize * PixelRatio.get();

    if (this.props.reset === true) {
      this.setState({ name: this.props.name, number: this.props.number });
      return null;
    }

    // EDITABLE VIEW
    return ( 
      <View style={{ flex: 0, flexDirection: 'row', marginVertical: 5 }}>
        <TextInput 
          style={{ flex: 1, fontSize: scaledFontSize }}
          keyboardType='numeric' maxLength={3}
          ref={ref => this.numberInput = ref}
          onChangeText={ (text) => this.updateNumber(text) }
          onSubmitEditing={ this.onSubmitNumber }
          blurOnSubmit={ false }
          value={this.state.number} />
        <TextInput 
          style={{ flex: 4, fontSize: scaledFontSize }}
          ref={ ref => this.nameInput = ref }
          onChangeText={ (text) => this.updateName(text) }
          onSubmitEditing={ this.onSubmitName }
          blurOnSubmit={ false }
          value={this.state.name} />
        {
          this.props.onAdd && <Icon name='md-add' 
          style={{color: this.state.saveEnabled?'#48c':'#777', marginLeft: 10 }} 
          size={scaledButtonSize}
          disabled={!this.state.saveEnabled} 
          onPress={this.onAddPressed} />
        }
        {
          this.props.onDelete && <Icon name='md-trash' 
          style={{color: 'red', marginLeft: 10}} 
          size={scaledButtonSize}
          onPress={this.onDeletePressed} />
        }
        {
          false && this.props.onSave && <Icon name='md-checkmark'
          style={{color: this.state.saveEnabled?'#4c8':'#777', marginLeft: 10}} 
          size={scaledButtonSize}
          disabled={!this.state.saveEnabled} 
          onPress={this.onSavePressed} />
        }
    </View>);
  }

}
