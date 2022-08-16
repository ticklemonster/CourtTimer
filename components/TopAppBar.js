import React from 'react';
import { Appbar } from 'react-native-paper';
import PropTypes from 'prop-types';

function TopAppBar({ navigation, route, options }) {
  const headerStyle = navigation.canGoBack() ? null : { textAlign: 'center' };
  const headerText = options.title || route.name;
  const { showSettings, onSave, onUndo } = options;

  // console.debug('TopAppNar: ', navigation, route, options, back );
  return (
    <Appbar.Header>
      { navigation.canGoBack() && <Appbar.BackAction onPress={navigation.goBack} />}
      <Appbar.Content titleStyle={headerStyle} title={headerText} />
      { onUndo && <Appbar.Action icon="undo" onPress={onUndo} />}
      { onSave && <Appbar.Action icon="content-save" onPress={onSave} />}
      { showSettings && <Appbar.Action icon="cog-outline" onPress={() => navigation.navigate('Preferences')} />}
    </Appbar.Header>
  );
}

TopAppBar.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    canGoBack: PropTypes.func.isRequired,
    goBack: PropTypes.func,
  }).isRequired,
  route: PropTypes.shape({
    key: PropTypes.string.isRequired,
    name: PropTypes.string,
  }).isRequired,
  options: PropTypes.shape({
    title: PropTypes.string,
    onSave: PropTypes.func,
    onUndo: PropTypes.func,
    showSettings: PropTypes.bool,
  }),
  back: PropTypes.shape({
    title: PropTypes.string.isRequired,
  }),
};

TopAppBar.defaultProps = {
  options: { title: null, showSettings: false },
  back: null,
};

export default TopAppBar;
