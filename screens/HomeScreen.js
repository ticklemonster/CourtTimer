import React from 'react';
import { View, ActivityIndicator, Text, Alert, TouchableNativeFeedback } from 'react-native';
import PropTypes from 'prop-types';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Ionicons } from '@expo/vector-icons';
import TeamItem from '../components/TeamItem';
import TeamStore from '../TeamStore';

const SettingsMenuItem = () => (
  <TouchableNativeFeedback onPress={() => console.log('TODO: Implement settings screen')}>
    <Ionicons name="md-settings" size={24} style={{ marginHorizontal: 8 }} />
  </TouchableNativeFeedback>
);

const ConfirmDeleteTeam = (team) => {
  Alert.alert(
    'Delete team',
    `Are you sure you want to delete "${team.name}"?`,
    [
      { text: 'Cancel', /* onPress: () => console.log('Delete cancelled'), */ style: 'cancel' },
      { text: 'Delete', onPress: () => TeamStore.deleteTeam(team.key) },
    ],
  );
};

class HomeScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selected: null,
    };

    this.updateTeams = this.updateTeams.bind(this);
  }

  componentDidMount() {
    TeamStore.addEventListener('update', this.updateTeams);
    this.updateTeams();
  }

  componentWillUnmount() {
    TeamStore.removeEventListener('update', this.updateTeams);
  }

  async updateTeams() {
    const { navigation } = this.props;

    const newteams = await TeamStore.getTeams();
    if (newteams.length === 0) {
      newteams.push(TeamStore.getSampleTeam());
    }

    // push the team list back into the navigation state
    navigation.setParams({ teams: newteams });
  }

  toggleTeamRow(key) {
    const { selected } = this.state;

    this.setState({ selected: (key !== selected) ? key : null });
  }

  clearSelection() {
    this.setState({ selected: null });
  }

  navigateTo(screen, key) {
    const { selected } = this.state;
    const { navigation } = this.props;

    // cancel navigation if a different row was highlighted
    if (selected !== null && selected !== key) {
      this.clearSelection();
      return;
    }

    // navigtion to  the selected item
    this.clearSelection();
    navigation.navigate(screen, { key });
  }

  render() {
    const { navigation } = this.props;
    const { selected } = this.state;

    const teams = navigation.getParam('teams');
    const addNewTeamItem = { key: undefined, name: 'Add New Team', iconName: 'md-add' };

    // Show an activity indicator if teams aren't loaded...
    if (teams === undefined) {
      return (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator size="large" />
        </View>
      );
    }

    // Show the team list...
    return (
      <View style={{ flex: 1, alignItems: 'center', backgroundColor: '#cfd8dc' }}>
        <View style={{ flex: 1, alignItems: 'flex-start' }}>
          { teams.map(item => (
            <TeamItem
              key={item.key}
              team={item}
              highlighted={item.key === selected}
              onSelect={() => this.toggleTeamRow(item.key)}
              onPress={() => this.navigateTo('GameScreen', item.key)}
              onEdit={() => this.navigateTo('EditScreen', item.key)}
              onDelete={() => ConfirmDeleteTeam(item)}
            />
          )) }
          <TeamItem
            team={addNewTeamItem}
            onSelect={() => this.clearSelection()}
            onPress={() => this.navigateTo('EditScreen', undefined)}
          />
        </View>
        <Text>Tip: press and hold on a team to edit the roster</Text>
      </View>
    );
  }
}

HomeScreen.navigationOptions = {
  title: 'Court Timer',
  headerRight: <SettingsMenuItem />,
};

HomeScreen.propTypes = {
  navigation: PropTypes.instanceOf(Object).isRequired, // a dumb workaround!
};

HomeScreen.defaultProps = {

};

export default HomeScreen;
