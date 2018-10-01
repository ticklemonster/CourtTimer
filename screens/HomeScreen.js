import React from 'react';
import { View, ActivityIndicator, Text, Alert, TouchableNativeFeedback } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import TeamStore from '../TeamStore';
import TeamItem from '../components/TeamItem';

class SettingsMenuItem extends React.PureComponent {
  render () {
    return (
      <TouchableNativeFeedback onPress={() => console.log('TODO: Implement settings screen')}>
        <Icon name='md-settings' size={24} style={{ marginHorizontal: 8 }}/>
      </TouchableNativeFeedback>
    )
  }
}

export default class HomeScreen extends React.Component {
  static navigationOptions = {
    title: 'Court Timer',
    headerRight: <SettingsMenuItem />
  };

  constructor() {
    super();
    this.state = {
      teams: undefined
    };

    this.onUpdateTeams = this.onUpdateTeams.bind(this);
  }

  componentWillMount () {
    TeamStore.addEventListener('update', this.onUpdateTeams);
    this.onUpdateTeams();
  }

  componentWillUnmount () {
    TeamStore.removeEventListener('update', this.onUpdateTeams)
  }

  onDeleteTeam(team) {
    Alert.alert(
      'Delete team',
      'Are you sure you want to delete "' + team.name + '"?',
      [
        {text: 'Cancel', onPress: () => console.log('Delete cancelled'), style: 'cancel'},
        {text: 'Delete', onPress: () => TeamStore.deleteTeam(team.key)},
      ],
    );
  }

  toggleTeamRow (key) {
    const _teams = this.state.teams.slice(0);
    const _item = _teams.find(item => item.key === key);

    if (_item !== undefined) {
      const _willSelect = (_item.isSelected)?false:true;
      _teams.forEach(team => team.isSelected = false);
      _item.isSelected = _willSelect;
      
      this.setState({ teams: _teams });
    }
  }
  clearSelection () {
    this.setState( oldstate => ({ 
      teams: oldstate.teams.map(item => { item.isSelected = false; return item })
    }) );
  }

  navigateTo (screen, key) {
    // check if there is a highlighted row
    const _item = this.state.teams.find(item => item.isSelected);

    // cancel navigation if a different key is highlighted
    if (_item !== undefined && _item.key !== key) {
      console.debug('prevent navigation while highlighted');
      this.clearSelection();
      return;
    }

    // navigate and clear selection 
    this.clearSelection();
    this.props.navigation.navigate(screen, {teamkey: key});
  }

  async onUpdateTeams() {
    const _teams = await TeamStore.getTeams();
    if (_teams.length == 0) 
      _teams.push (TeamStore.getSampleTeam());

    this.setState({ teams: _teams });
  }


  render() {
    // Show an activity indicator if teams aren't loaded...
    if (this.state.teams === undefined) {
      return (
        <View style={{flex: 1, justifyContent: 'center'}}>
          <ActivityIndicator size='large'/>
        </View>
      );
    }
   
    // Show the team list...
    const addNewTeam = { key: undefined, name: 'Add New Team', iconName: 'md-add' }

    return (
    <View style={{ flex: 1, alignItems: 'center', backgroundColor: '#cfd8dc' }}>
      <View style={{ flex: 1, alignItems: 'flex-start' }}>
      { this.state.teams.map( item => 
        <TeamItem key={item.key} team={item} highlighed={item.isSelected}
        onSelected={() => this.toggleTeamRow(item.key)}
        onPress={() => this.navigateTo('GameScreen', item.key)} 
        onEdit={() => this.navigateTo('EditScreen', item.key)} 
        onDelete={TeamStore.isSampleTeam(item) ? undefined : () => this.onDeleteTeam(item)} />
      )}
      <TeamItem team={addNewTeam} 
        onSelected={() => this.clearSelection()}
        onPress={() => this.navigateTo('EditScreen', addNewTeam.key)} /> 
      </View>
      <Text>Tip: press and hold on a team to edit the roster</Text>
    </View>
    );
  }

}
