import React from 'react';
import { View, ActivityIndicator, FlatList, StyleSheet, Alert } from 'react-native';
import { Appbar, Avatar, List, FAB, Title, Menu, Divider } from 'react-native-paper';
import PropTypes from 'prop-types';

import TeamStore from '../TeamStore';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

class TeamListScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      teams: [],
      selected: null,
    };

    this.updateTeams = this.updateTeams.bind(this);
  }

  componentDidMount() {
    this.updateTeams();
  }

  componentWillUnmount() {
  }

  async updateTeams() {
    const newteams = await TeamStore.getTeams();
    if (newteams.length === 0) {
      newteams.push(TeamStore.getSampleTeam());
    }

    // push the team list back into the navigation state
    this.setState({ teams: newteams });
  }

  toggleTeamRow(key) {
    const { selected } = this.state;

    this.setState({ selected: (key !== selected) ? key : null });
  }

  clearSelection() {
    this.setState({ selected: null });
  }

  playTeam(id) {
    const { selected } = this.state;
    const { onPlay } = this.props;

    // cancel navigation if a different row was highlighted
    if (selected !== null && selected !== id) {
      this.clearSelection();
      return;
    }

    // navigtion to  the selected item
    this.clearSelection();
    onPlay(id);
  }

  editTeam(id) {
    const { selected } = this.state;
    const { onEdit } = this.props;

    // cancel navigation if a different row was highlighted
    if (selected !== null && selected !== id) {
      this.clearSelection();
      return;
    }

    // navigtion to  the selected item
    this.clearSelection();
    onEdit(id);
  }

  confirmDeleteTeam(key, name) {
    Alert.alert(
      'Delete team',
      `Are you sure you want to delete "${name}"?`,
      [
        { text: 'Cancel',
          style: 'cancel',
          onPress: () => this.clearSelection() },
        { text: 'Delete',
          onPress: () => {
            TeamStore.deleteTeam(key);
            this.updateTeams();
          } },
      ],
    );
  }

  render() {
    const { selected, teams } = this.state;
    const { theme, onNavigate } = this.props;

    // Show an activity indicator if teams aren't loaded...
    if (teams === undefined) {
      return (
        <View style={[styles.container, { justifyContent: 'center' }]}>
          <ActivityIndicator size="large" />
        </View>
      );
    }

    // Show the team list...
    // console.debug( this.props.theme );

    return (
      <React.Fragment>
        <Appbar.Header>
          <Appbar.Content title="Court Timer" subtitle="My teams" />
          <Appbar.Action icon="settings" onPress={() => onNavigate('PREFERENCES', null)} />
        </Appbar.Header>

        <View style={styles.container}>
          <FlatList
            data={teams}
            extraData={selected}
            renderItem={({ item }) => (
              <List.Item
                key={item.key}
                left={props => (
                  <Avatar.Icon {...props} icon="people" color={theme.colors.surface} />
                )}
                right={() => (
                  <Menu
                    visible={(selected === item.key)}
                    onDismiss={() => this.clearSelection()}
                  >
                    <Menu.Item onPress={() => this.playTeam(item.key)} title="PLAY" />
                    <Menu.Item onPress={() => this.editTeam(item.key)} title="EDIT" />
                    <Divider />
                    <Menu.Item
                      onPress={() => this.confirmDeleteTeam(item.key, item.name)}
                      theme={{ colors: { text: theme.colors.error } }}
                      title="DELETE"
                    />
                  </Menu>
                )}
                title={<Title>{item.name}</Title>}
                description={item.description}
                onPress={() => this.playTeam(item.key)}
                onLongPress={() => this.toggleTeamRow(item.key)}
              />
            )}
          />

          <FAB
            icon="add"
            style={styles.fab}
            onPress={() => this.editTeam(null)}
          />
        </View>
      </React.Fragment>
    );
  }
}

TeamListScreen.propTypes = {
  onEdit: PropTypes.func,
  onPlay: PropTypes.func,
};

TeamListScreen.defaultProps = {
  onEdit: (e) => { console.debug(`TeamListScreen onEdit not provided. Key=${e}`); },
  onPlay: (e) => { console.debug(`TeamListScreen onPlay not provided. Key=${e}`); },
};

export default TeamListScreen;
