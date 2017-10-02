import React from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';

export default class App extends React.Component {
  render() {
    return (  
      <View style={styles.pagecontainer}>
        <FlatList atyle={styles.container}
          data={[{title: 'Player 1', key:'player1'},{title: 'Player 2', key:'player2'}]}
          renderItem={({item}) => <Text style={styles.oncourt}>{item.title}</Text>}
        />   
        <View style={styles.container}>
          <Text>Open up App.js to start working on your app!</Text>
          <Text>Changes you make will automatically reload.</Text>
          <Text>Shake your phone to open the developer menu.</Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  pagecontainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
  },
  container: {
    flex: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    alignContent: 'stretch',
    width: '100%',
  },
  oncourt: {
    flex: 1,
    color: '#4c4',
    margin: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
