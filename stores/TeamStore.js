import AsyncStorage from '@react-native-async-storage/async-storage';

//
// TeamStore.js
//
// This class provides an abstraction over AsyncStorage for local storage.
// Team data is stored with keys:   '@CourtTimer:team:[key]'
// Player data is stored in each team
// Game data is stored with keys:   '@CourtTimer:game:[key]'
//

const TEAM_DEFAULTS = {
  iconName: 'md-basketball',
};

const NEW_TEAM = {
  id: undefined,
  name: '',
  description: '',
  iconName: 'md-add',
  players: [],
};

const NEW_PLAYER = {
  id: undefined,
  teamId: undefined,
  number: '',
  name: '',
  gameTime: 0,
  teams: [],
};

const SAMPLE_TEAM = {
  id: 'SAMPLE-TEAM-KEY',
  name: 'Sample Team',
  description: 'Sample team - replace with your own',
  iconName: 'md-basketball',
  players: [
    { id: 1, teamId: 'SAMPLE-TEAM-KEY', number: '6', name: 'Jaimyn', gameTime: 0 },
    { id: 2, teamId: 'SAMPLE-TEAM-KEY', number: '7', name: 'Ayden', gameTime: 0 },
    { id: 3, teamId: 'SAMPLE-TEAM-KEY', number: '9', name: 'Euan', gameTime: 0 },
    { id: 4, teamId: 'SAMPLE-TEAM-KEY', number: '10', name: 'Chris', gameTime: 0 },
    { id: 5, teamId: 'SAMPLE-TEAM-KEY', number: '11', name: 'Sam', gameTime: 0 },
    { id: 6, teamId: 'SAMPLE-TEAM-KEY', number: '13', name: 'Jed', gameTime: 0 },
    { id: 7, teamId: 'SAMPLE-TEAM-KEY', number: '14', name: 'Alex', gameTime: 0 },
  ],
};

const TeamStore = {
  // getTeams: return an array of { key, name, description, iconName }
  readTeams: async () => {
    let rval = [];

    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const teamKeys = allKeys.filter((key) => key.startsWith('@CourtTimer:team:'));
      const allTeams = await AsyncStorage.multiGet(teamKeys);

      rval = allTeams.map(([key, teamstr]) => {
        const teamobj = JSON.parse(teamstr);
        return ({
          id: key, name: teamobj.name, description: teamobj.description, iconName: teamobj.iconName,
        });
      });
    } catch (error) {
      console.error('TeamStore.getTeams() - Error loading data from AsyncStorage: ', error);
      rval = undefined;
    }

    // console.debug('TeamStore.getTeams() => ', JSON.stringify(rval));
    return rval;
  },

  // createTeam: return a blank team structure (not persistent until updated)
  createTeam: () => ({ ...NEW_TEAM }),

  // getSampleTeam: provide some sample team content. Attempting to save this will fail
  getSampleTeam: () => ({ ...SAMPLE_TEAM }),
  isSampleTeam: (team) => (team.id === SAMPLE_TEAM.id),

  // readTeam: return a team structure for the team saved with the specified key
  readTeam: async (key) => {
    if (key === null || key === undefined) {
      return null;
    }

    // is this the sample team?
    if (key === SAMPLE_TEAM.key) {
      return { ...SAMPLE_TEAM };
    }

    // can we load it?
    let team;
    try {
      const jsonstr = await AsyncStorage.getItem(key);
      team = JSON.parse(jsonstr);
      team.id = key; // make sure the result object has the current key
    } catch (error) {
      console.error('TeamStore.getTeam() - Error finding team: ', error);
      team = undefined;
    }

    // console.debug('TeamStore.getTeam() => ', team);
    return team;
  },

  // updateTeam: update an existing team or create a new team based on the provided structure
  updateTeam: async (teamdata) => {
    // console.debug(`updateTeam(${teamdata.name})`);

    if (teamdata === null || teamdata === undefined
      || teamdata.name === undefined || teamdata.name === null || teamdata.name === ''
    ) {
      return teamdata;
    }

    // Set team by overriding defaults with data - to ensure we have necessary content
    const savedata = { ...TEAM_DEFAULTS, ...teamdata };

    try {
      // if there is no key, then generate a random one - don't trust the cache!
      const allKeys = await AsyncStorage.getAllKeys();
      if (teamdata.key === null || teamdata.key === undefined) {
        // TODO: PROPERLY GENERATE A NEW KEY!
        do {
          // eslint-disable-next-line no-bitwise
          const newkey = Math.trunc(Date.now() & 0x7fffffff).toString(16);
          savedata.key = `@CourtTimer:team:${newkey}`;
          console.log(`TeamStore.updateTeam: Generating new key for team ${savedata.name}: ${savedata.key}`);
        } while (allKeys.includes(savedata.key));
      }

      // Ready to save the new/updated team
      await AsyncStorage.setItem(savedata.key, JSON.stringify(savedata));
    } catch (error) {
      console.error('TeamStore.updateTeam() - Error updating team: ', error);
    }

    return savedata;
  },

  deleteTeam: async (teamkey) => {
    // console.debug(`deleteTeam(${teamkey})`);
    try {
      await AsyncStorage.removeItem(teamkey);
    } catch (error) {
      console.error('TeamStore.deleteTeam() - Error: ', error);
      return false;
    }

    return true;
  },

  //
  // PLAYER ACTIONS
  //
  createPlayer: (teamId) => ({ ...NEW_PLAYER, teamId }),

  readPlayers: async (teamId) => {
    try {
      const team = await TeamStore.readTeam(teamId);
      return { ...team.players };
    } catch (error) {
      console.error('TeamStore.readPlayers() - Error: ', error);
    }

    return null;
  },

  readPlayer: async (teamId, playerId) => {
    // console.debug(`TeamStore.readPlayer(${teamId}, ${playerId})`);

    try {
      const team = await TeamStore.readTeam(teamId);
      const player = team.players.find((p) => (p.id == playerId));
      return player;
    } catch (error) {
      console.error('TeamStore.readPlayer() - Error: ', error);
      return null;
    }
  },

  updatePlayer: async (player) => {
    if (player.teamId === null || player.teamId === undefined
      || player.name === undefined || player.name === ''
      || player.number === undefined || player.number === ''
    ) {
      console.error('TeamStore.updatePlayer() - missing required data.');
      return null;
    }

    let team = await TeamStore.readTeam(player.teamId);
    if (team === null) {
      console.error('TeamStore.setPlayer() - invalid team id.');
      return null;
    }

    let playerId = player.id;
    try {
      // if there is no key, then generate a random one
      if (player.id === null || player.id === undefined) {
        playerId = team.players.reduce((v, p) => Math.max(parseInt(p.number, 10), v), 0) + 1;
        console.debug(`TeamStore.setPlayer(): Generating new id for team ${team.name} / player ${player.name}: ${playerId}`);
      }

      const playerIdx = team.players.findIndex((p) => p.id === playerId);
      if (playerIdx < 0) {
        // if the key is unique, then add it tot he players list
        team.players.push({ ...player, id: playerId });
      } else {
        // update the existing player entry
        team.players[playerIdx] = { ...team.players[playerIdx], ...player };
      }

      // Ready to save the new/updated team
      team = await TeamStore.updateTeam(team);
    } catch (error) {
      console.error('TeamStore.updateTeam() - Error updating team: ', error);
      return null;
    }

    return team.players.find((p) => p.id === playerId);
  },

  deletePlayer: async (player) => {
    const team = await TeamStore.readTeam(player.teamId);
    if (!team) return false;

    const playerIdx = team.players.findIndex((t) => player.id === t.id);
    if (playerIdx < 0) return false;

    team.players.splice(playerIdx, 1);
    await TeamStore.updateTeam(team);
    return true;
  },
};

export default TeamStore;
