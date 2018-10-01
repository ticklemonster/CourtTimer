import { AsyncStorage, } from 'react-native';

const TEST_DATA = false;
const LOAD_TEST_DATA = false;

class TeamStore {
  static SAMPLE_TEAM = {
    key: 'SAMPLE-TEAM-KEY',
    name: 'Sample Team',
    iconName: 'md-basketball',
    players: [
      { number: '4', name: 'Ben', gameTime: 0 },
      { number: '6', name: 'Jaimyn', gameTime: 0 },
      { number: '7', name: 'Ayden', gameTime: 0 },
      { number: '9', name: 'Euan', gameTime: 0 },
      { number: '10', name: 'Chris', gameTime: 0 },
      { number: '11', name: 'Sam', gameTime: 0 },
      { number: '13', name: 'Jack', gameTime: 0 },
      { number: '14', name: 'Alex', gameTime: 0 }
    ]
  }

  static NEW_TEAM = {
    key: undefined,
    name: '',
    iconName: 'md-add',
    players: []
  }

  constructor () {
    console.debug('TeamStore: initialised');
    this.listeners = {};

    /** BUILD TEST DATA **/
    if (TEST_DATA) {
      AsyncStorage.clear();

      if (LOAD_TEST_DATA) {
        let testSet = [];
        for( var f = 1000 ; f < 1008; f++ ) {
          testSet.push( ['@CourtTimer:team:' + f.toString(16) + ':' + 'Team Name ' + f.toString(), JSON.stringify(TeamStore.SAMPLE_TEAM)] );
        }
        AsyncStorage.multiSet(testSet);    
      }
      else
      {
        AsyncStorage.multiSet([ 
          ['@CourtTimer:team:Sample-1', JSON.stringify({ key: '@CourtTimer:team:Sample-1', name: 'Sample Team 1', iconName: 'md-basketball', players: [] })], 
          ['@CourtTimer:team:Sample-2', JSON.stringify({ key: '@CourtTimer:team:Sample-2', name: 'Sample Team 2', iconName: 'md-basketball', players: [{ number: '14', name: 'Sam', gameTime: 0 },{ number: '16', name: 'Nic', gameTime: 0 }] })],
          //['@CourtTimer:settings', '{}'],
        ]);  
      }
    }
    /*
    */
  }

  // 
  // Implement a simple template for events
  //
  addEventListener = function(type, callback) {
    if (!(type in this.listeners)) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(callback);
  };
  
  removeEventListener = function(type, callback) {
    if (!(type in this.listeners)) {
      return;
    }
    var stack = this.listeners[type];
    for (var i = 0, l = stack.length; i < l; i++) {
      if (stack[i] === callback){
        stack.splice(i, 1);
        return;
      }
    }
  };
  
  dispatchEvent = function(event) {
    if (!(event.type in this.listeners)) {
      return true;
    }
    var stack = this.listeners[event.type].slice();

    for (var i = 0, l = stack.length; i < l; i++) {
      stack[i].call(this, event);
    }
    return !event.defaultPrevented;
  };


  // 
  // Data operations 
  // This class provides an abstraction over AsyncStorage
  // Team data is stored with keys of the form '@CourtTimer:team:[key]'
  //
  // COMPARISON:
  // Two other approaches were considered:
  // APPROACH 1: Each team is stored as JSON with key '@CourtTimer:team:[key]'
  // APPROACH 2: Each team is stored as JSON with key '@CourtTimer:team:[key]:[name]'
  //  
  // Home Screen needs a set of keys and names.
  // [key] approach is SLOW this way (get all keys, filter, multiGet all data, parse)
  // - 1002 teams took 132ms using @CourtTimer:team:[key]:[name] 
  // [key]:[name] approach is FASTER (get all keys, parse)
  // - 1002 teams took 368ms using @CourtTImer:team:[key] and load
  // But: we're more likely to see < 10 teams, performance impact is negligible (90-100ms vs 80-90ms)
  // 
  // [key]:[name] approach would add complexity when saving a team with a name change
  //  (need to identify existing key, remove old-named item, save new-named item)
  // [key] approach is consistent (key only)
  // But: saves are rare compared to reads
  //

  // getTeams: return an array of { key, name, icon }
  async getTeams () {
    let rval = undefined;

    try {
      /** USING UNIQUE KEY STORAGE APPROACH **/
      const allKeys = await AsyncStorage.getAllKeys();
      const teamKeys = allKeys.filter((key) => key.startsWith('@CourtTimer:team:'));
      const allTeams = await AsyncStorage.multiGet(teamKeys);

      rval = allTeams.map(([key,teamstr]) => {
        const teamobj = JSON.parse(teamstr);
        return ({ key: key, name: teamobj.name, iconName: teamobj.iconName });
      });
    
    } catch (error) {
      console.error('TeamStore.getTeams() - Error loading data from AsyncStorage: ', error);
      rval = undefined;
    }

    //console.debug('getTeams() => ', rval);
    return rval;
  }

  // createTeam: return a blank team structure (not persistent until updated)
  createTeam () {
    return TeamStore.NEW_TEAM;
  }

  // getSampleTeam: provide some sample team content. Attempting to save this will create a new team
  getSampleTeam () {
    return TeamStore.SAMPLE_TEAM;
  }
  isSampleTeam (team) {
    return (team.key === TeamStore.SAMPLE_TEAM.key);
  }
  isSampleTeamKey (key) {
    return (key === TeamStore.SAMPLE_TEAM.key);
  }
  
  // getTeam: return a team structure for the team saved with the specified key
  async getTeam (key) {
    if (key === TeamStore.SAMPLE_TEAM.key) {
      return TeamStore.SAMPLE_TEAM;
    }
    
    let rval = undefined;

    try {
      const jsonstr = await AsyncStorage.getItem(key);
      rval = JSON.parse(jsonstr);
      rval.key = key; // make sure the result object has the current key
    } catch (error) {
      console.error('TeamStore.getTeam() - Error finding team: ', error);
      rval = undefined;
    }
    
    //console.debug('TeamStore.getTeam() => ', rval);
    return rval;
  }


  // updateTeam: update an existing team or create a new team based on the provided structure
  async updateTeam (teamdata) {
    console.debug('updateTeam(' + teamdata.name + ')');

    if (teamdata === null || teamdata === undefined || teamdata.name <= '')
       return teamdata;

    try {
      // Set team defaults
      teamdata.iconName = teamdata.iconName || 'md-basketball';

      // if there is no key, then generate a random one
      const allKeys = await AsyncStorage.getAllKeys();
      if (teamdata.key === null || teamdata.key === undefined) {
        // TODO: PROPERLY GENERATE A NEW KEY!
        do {
          let newkey = Math.trunc(Date.now() & 0x7fffffff).toString(16);
          teamdata.key = `@CourtTimer:team:${newkey}`;
          console.log('TeamStore.updateTeam: Generating new key for team ' + teamdata.name + ':', teamdata.key);
        } while( allKeys.includes(teamdata.key) );
      }

      // Ready to save the new/updated team
      await AsyncStorage.setItem(teamdata.key, JSON.stringify(teamdata));
      this.dispatchEvent({ type: 'update', action: 'update'});

    } catch (error) {
      console.error('TeamStore.updateTeam() - Error updating team: ', error);
    }

    return teamdata;
  }

  async deleteTeam (teamkey) {
    console.debug('deleteTeam(' + teamkey + ')');
    try {
      await AsyncStorage.removeItem(teamkey);
      this.dispatchEvent({ type: 'update', action: 'delete' });
      
      return true;

    } catch (error) {
      console.error('TeamStore.deleteTeam() - Error: ', error);
    }

    return false;
  }
}

const singletonTeamStore = new TeamStore();

export default singletonTeamStore;
