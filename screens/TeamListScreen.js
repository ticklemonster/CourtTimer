import React, { useState, useEffect } from 'react';
import { FlatList, View } from 'react-native';
import { ActivityIndicator, Avatar, List, FAB, Title, IconButton, Banner, Surface } from 'react-native-paper';
import PropTypes from 'prop-types';

import TeamStore from '../stores/TeamStore';
import { styles } from '../styles/CourtTimerStyles';

function TeamListScreen({ navigation }) {
  const [teams, setTeams] = useState(undefined);

  async function loadTeams() {
    const newteams = (await TeamStore.readTeams());
    newteams.sort((a, b) => (a.name < b.name ? -1 : 1));
    setTeams(newteams);
  }

  useEffect(() => {
    navigation.addListener('focus', loadTeams);
    return () => navigation.removeListener('focus');
  }, [navigation]);

  const teamsEmptyComponent = () => (
    <Banner
      visible
      actions={[
        {
          label: 'Add one now',
          onPress: () => navigation.navigate('Edit.Team', { id: null }),
        },
      ]}
    >
      There are no saved teams.
    </Banner>
  );
  const teamItemLeft = () => (<Avatar.Icon icon="account-multiple-outline" size={48} />);
  const teamItemRight = (id) => (<IconButton icon="chevron-right" onPress={() => navigation.navigate('Edit.Team', { id })} />);

  const renderTeamItem = ({ item }) => (
    <List.Item
      key={item.id}
      left={teamItemLeft}
      title={<Title>{item.name}</Title>}
      description={item.description}
      right={() => teamItemRight(item.id)}
      onPress={() => navigation.navigate('Game', { id: item.id })}
    />
  );

  if (teams === undefined) {
    return <ActivityIndicator size="large" style={styles.centered} />;
  }

  return (
    <View style={styles.page}>
      <Surface style={styles.container}>
        {/* <Headline>Manage Teams</Headline>
        <Divider /> */}
        <FlatList
          data={teams}
          renderItem={renderTeamItem}
          ListEmptyComponent={teamsEmptyComponent}
        />
      </Surface>
      <FAB
        icon="plus"
        label="new team"
        style={styles.fab}
        onPress={() => navigation.navigate('Edit.Team', { key: null })}
      />
    </View>

  );
}

TeamListScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    popToTop: PropTypes.func.isRequired,
    addListener: PropTypes.func,
    removeListener: PropTypes.func,
  }).isRequired,
};

export default TeamListScreen;
