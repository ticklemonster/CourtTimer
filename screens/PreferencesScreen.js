import React from 'react';
import { View, StyleSheet, BackHandler } from 'react-native';
import { Appbar, List, Switch } from 'react-native-paper';
import PropTypes from 'prop-types';


const DEFAULT_PREFS = {
  showMembersAsList: true,
  balancePlayers: false,
};

class PreferencesScreen extends React.Component {
  constructor(props) {
    super(props);

    const { prefs } = props;

    this.state = { ...DEFAULT_PREFS, ...prefs };
    this.onHardwareBackPress = this.onHardwareBackPress.bind(this);
  }

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.onHardwareBackPress);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.onHardwareBackPress);
  }

  onHardwareBackPress() {
    this.onBackPressed();
    return true;
  }

  onBackPressed() {
    const { onBack } = this.props;
    onBack(this.state);
  }

  render() {
    const { theme } = this.props;
    const { showMembersAsList, balancePlayers } = this.state;

    // Set up some styling
    const styles = StyleSheet.create({
      container: {
        flex: 1,
        padding: 10,
        backgroundColor: theme.colors.background,
      },
    });

    // Show the team list...
    // console.debug( this.props.theme.palette );

    return (
      <React.Fragment>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => this.onBackPressed()} />
          <Appbar.Content title="Court Timer" subtitle="Preferences" />
        </Appbar.Header>

        <View style={styles.container}>
          <List.Item
            title="Show Team Members as list"
            description="Team members can be displayed in a list or as chips"
            right={ () => (
              <Switch
                value={showMembersAsList}
                onValueChange={(v) => { this.setState({ showMembersAsList: v }); }}
              />
            )}
          />

          <List.Item
            title="Auto-select subs"
            description="Choose a substitue player automatically based on the time spent on-court"
            right={ () => (
              <Switch
                value={balancePlayers}
                onValueChange={(v) => { this.setState({ balancePlayers: v }); }}
              />
            )}
          />

        </View>
      </React.Fragment>
    );
  }

}

PreferencesScreen.propTypes = {
  prefs: PropTypes.shape({
    teamMembersAsList: PropTypes.bool,
  }),
  theme: PropTypes.instanceOf(Object),
  onBack: PropTypes.func,
};

PreferencesScreen.defaultProps = {
  prefs: {},
  theme: {},
  onBack: () => console.debug('PreferencesScreen onSave not provided.'),
};

export default PreferencesScreen;
