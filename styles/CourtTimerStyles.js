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
    paddingBottom: '3rem', // enough room for a bottom bar
  },
  containerFull: {
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

  dividerSm: { marginVertical: 4 },
  dividerMd: { marginVertical: 8 },
  dividerLg: { marginVertical: 16 },

  horizontalContainer: { marginVertical: 6, display: 'flex', flexDirection: 'row' },
  spacedButtonBar: { justifyContent: 'space-around' },

  editTeamName: { width: '100%', fontSize: 24 },
  editTeamDetail: { width: '100%', fontSize: 18 },
  bottomDeleteBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingVertical: 8,
    paddingHorizontal: 'auto',
    borderTopColor: colours.primary,
    borderTopWidth: 1,
    backgroundColor: colours.primaryLight,
  },

  snackSave: {
    position: 'relative',
    top: '-3em', // above the bottom app bar
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
    margin: 1,
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
  playerListEmpty: { padding: '1em', fontStyle: 'italic', fontSize: 20, color: colours.primaryDark },
  playerListItem: { fontSize: 20, marginLeft: 8 },
  playerListButton: { alignSelf: 'center' },

  playerNumberInput: { flex: 2 },
  playerNameInput: { flex: 10 },

  gameClock: { fontSize: '2em', color: colours.secondary, textAlign: 'center', marginVertical: 8 },
  gameLayout: { flex: 1, flexDirection: 'row', alignItems: 'stretch', margin: 5, justifyContent: 'space-around' },
  gameBlock: { flex: 1, margin: 4 },
  gameCardContainer: { flexDirection: 'row', flexWrap: 'wrap', alignContent: 'flex-start' },
  gameCard: { flexBasis: 180, flexGrow: 0, margin: 3, borderRadius: 6, borderColor: colours.primary, borderWidth: 2 },
  gameCardSelected: { flexBasis: 180, flexGrow: 0, margin: 3, borderRadius: 6, borderColor: 'purple', borderWidth: 2 },
  gameCardTitle: {},
  gameCardBody: { fontSize: '1.1rem', color: colours.primaryDark },
});

export { colours, colourStyles, styles };

// STYLES from GameScreen
// const styles = StyleSheet.create({
//   pageView: {
//     // ...colourStyles.primary,
//     flex: 1,
//     alignContent: 'center',
//     flexDirection: 'column',
//   },
//   playerListStyle: {
//     flex: 1, margin: 5,
//   },
//   titleViewStyle: {
//     // ...colourStyles.secondaryDark,
//     flex: 0, paddingHorizontal: 5, borderRadius: 8,
//   },
//   titleTextStyle: {
//     // ...colourStyles.secondaryDark,
//     fontSize: 18, fontWeight: 'bold', alignSelf: 'center',
//   },
//   playerCardStyle: {
//     // ...colourStyles.primaryLight,
//     flex: 0,
//     borderRadius: 8,
//     margin: 1,
//     flexDirection: 'column',
//     alignItems: 'center',
//     height: '20%',
//     elevation: 4,
//   },
//   playerCardSelectedStyle: {
//     // ...colourStyles.secondaryLight,
//     elevation: 1,
//   },
//   playerNumberStyle: {
//     flex: 1, fontSize: 18, fontWeight: 'bold',
//   },
//   playerNameStyle: {
//     flex: 2, fontSize: 24, fontWeight: 'bold', textAlignVertical: 'center',
//   },
//   playerTimeStyle: {
//     flex: 1, fontSize: 18, textAlignVertical: 'top', paddingTop: 0,
//   },
//   footerBar: {
//     // borderTopWidth: 1,
//     // borderTopColor: 'red',
//     justifyContent: 'center',
//   },
//   footerAction: {
//     marginHorizontal: 20,
//   },
// })
