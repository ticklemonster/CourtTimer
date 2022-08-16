import { StyleSheet } from 'react-native';

const colours = {
  primary: '#bdbdbd',
  primaryLight: '#efefef',
  primaryDark: '#8d8d8d',

  /* PURPLE STYLE */
  // secondary: '#9c27b0',
  // secondaryLight: '#d05ce3',
  // secondaryDark: '#6a0080',

  /* BLUE STYLE */
  secondary: '#1976d2',
  secondaryLight: '#63a4ff',
  secondaryDark: '#004ba0',

  danger: '#d50000',
};

const colourStyles = StyleSheet.create({
  primary: { color: 'black', backgroundColor: colours.primary },
  primaryLight: { color: 'black', backgroundColor: colours.primaryLight },
  primaryDark: { color: 'black', backgroundColor: colours.primaryDark },
  secondary: { color: 'white', backgroundColor: colours.secondary },
  secondaryLight: { color: 'black', backgroundColor: colours.secondaryLight },
  secondaryDark: { color: 'white', backgroundColor: colours.secondaryDark },
});

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
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
  centered: {
    margin: 'auto',
  },

  bottomDeleteBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    marginHorizontal: 16,
    paddingVertical: 8,
    paddingHorizontal: 'auto',
    borderTopColor: colours.primary,
    borderTopWidth: 1,
    // backgroundColor: colours.primaryLight,
    // color: colours.danger,
  },

  snackSave: {
    position: 'relative',
    top: '-3em',
    backgroundColor: colours.secondary,
  },

  playerListRow: {
    backgroundColor: colours.primaryLight,
    borderBottomColor: colours.primaryDark,
    borderBottomWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  playerListBack: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 1,
    paddingHorizontal: 0,
  },
  playerBackDangerButton: {
    justifyContent: 'center',
    alignContent: 'flex-end',
    flex: 1,
    flexWrap: 'wrap',
    backgroundColor: colours.danger,
    color: 'white',
  },
  playerBackSafeButton: {
    justifyContent: 'center',
    alignContent: 'flex-start',
    flexWrap: 'wrap',
    backgroundColor: 'green',
    color: 'white',
  },

  // playerListHeader: {
  //   marginHorizontal: 0,
  //   paddingHorizontal: 0,
  //   borderBottomColor: colours.primaryLight,
  //   borderBottomWidth: 1,
  // },
  // playerListFooter: {
  //   borderTopColor: colours.primaryLight,
  //   borderTopWidth: 1,
  //   justifyContent: 'right',
  // },

  titleViewStyle: {
    backgroundColor: '#0069c0',
    paddingHorizontal: 5,
  },
  titleTextStyle: {
    fontSize: 18,
    fontWeight: 'bold',
    alignSelf: 'center',
    color: 'white',
    marginTop: 5,
  },
  warningMessageViewStyle: {
    backgroundColor: 'orange',
    marginVertical: 10,
    padding: 8,
  },
  warningMessageTextStyle: {
    fontSize: 18,
    color: 'black',
  },
});

export { colours, colourStyles, styles };
