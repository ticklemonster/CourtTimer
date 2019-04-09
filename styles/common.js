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

export { colours, colourStyles };
