import {Navigation, ScreenVisibilityListener} from 'react-native-navigation';

import HomeScreen from './HomeScreen';
//import GameScreen from './GameScreen';
//import EditTeamScreen from './EditTeamScreen';

export function registerScreens() {
  Navigation.registerComponent('courttimer.Home', () => HomeScreen);
//  Navigation.registerComponent('courttimer.Game', () => GameScreen);
//  Navigation.registerComponent('courttimer.EditTeam', () => EditTeamScreen);
}

// export function registerScreenVisibilityListener() {
//   new ScreenVisibilityListener({
//     willAppear: ({screen}) => console.log(`Displaying screen ${screen}`),
//     didAppear: ({screen, startTime, endTime, commandType}) => console.log('screenVisibility', `Screen ${screen} displayed in ${endTime - startTime} millis [${commandType}]`),
//     willDisappear: ({screen}) => console.log(`Screen will disappear ${screen}`),
//     didDisappear: ({screen}) => console.log(`Screen disappeared ${screen}`)
//   }).register();
// }