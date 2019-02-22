// Author: Petter Andersson

const { Map, List, Set } = require('immutable');
const gameJS = require('./game');

const START_COUNTER_VALUE = 0; // 0, 1 is for testing alone
const MAX_AMOUNT_CONCURRENT_GAMES = 8;

const getPlayerIndex = (session, socketId) => session.get('connectedPlayers').get(socketId);
exports.getPlayerIndex = (session, socketId) => getPlayerIndex(session, socketId);

exports.initializeConnectedPlayers = connectedPlayersMap => {
  // connectedPlayersMap = (socketId:s -> ConnectedUser:s)
  let tempMap = Map({});
  const iter = connectedPlayersMap.keys();
  let temp = iter.next();
  let counter = 0;
  while (!temp.done) {
    const id = temp.value;
    tempMap = tempMap.set(id, String(counter));
    counter += 1;
    temp = iter.next();
  }
  return tempMap;
}

// Default: prepBattleState = undefined
exports.makeSession = (connectedPlayersInit, pieces) => {
  return Map({
    connectedPlayers: connectedPlayersInit, // Bind socket.id -> playerid (previous connectedPlayer in socketcontroller)
    counter: START_COUNTER_VALUE,
    pieces: pieces,
    discardedPieces: List([]),
  })
}

exports.createUser = (socketId) => {
  return Map({
    socketId: socketId,
    sessionId: false, // Used for ready and sessionId (true|false|sessionId)
  })
}

exports.findFirstAvailableIndex = (sessions) => {
  const iter = sessions.keys();
  let temp = iter.next();
  let takenIndices = Set([]);
  while (!temp.done) {
    const index = temp.value;
    takenIndices = takenIndices.add(index);
    temp = iter.next();
  }
  for(let i = 0; i < MAX_AMOUNT_CONCURRENT_GAMES; i++){
    if(!takenIndices.includes(i)){
      return i;
    }
  }
  return undefined;
}

exports.updateSessionIds = async (connectedPlayersParam, playerArray, sessionId) => {
  let connectedPlayers = connectedPlayersParam;
  const iter = connectedPlayers.keys();
  let temp = iter.next();
  while (!temp.done) {
    const id = temp.value;
    if(playerArray.includes(id)){
      connectedPlayers = await connectedPlayers.setIn([id, 'sessionId'], sessionId);
    }
    temp = iter.next();
  }
  return connectedPlayers;
}

// Remove Session when all connected sockets are disconnected
exports.sessionPlayerDisconnect = (socketId, session) => {
  const newConnectedPlayers = session.get('connectedPlayers').delete(socketId);
  if(newConnectedPlayers.size === 0){
    return undefined
  }
  return session.set('connectedPlayers', newConnectedPlayers);
}

const getSession = (socketId, connectedPlayers, sessions) => {
  const sessionId = connectedPlayers.get(socketId).get('sessionId');
  return sessions.get(sessionId);
}

exports.getSession = (socketId, connectedPlayers, sessions) => getSession(socketId, connectedPlayers, sessions);

exports.addPiecesToState = (socketId, connectedPlayers, sessions, state) => {
  const session = getSession(socketId, connectedPlayers, sessions);
  return state.set('pieces', session.get('pieces')).set('discardedPieces', session.get('discardedPieces'));
}

exports.updateSessionPieces = (socketId, connectedPlayers, sessions, state) => {
  const sessionId = connectedPlayers.get(socketId).get('sessionId');
  const session = sessions.get(sessionId);
  const newSession = session.set('pieces', state.get('pieces')).set('discardedPieces', state.get('discardedPieces'))
  return sessions.set(sessionId, newSession);
}

exports.getLongestBattleTime = (actionStacks) => {
  let longestTime = -1;
  for(let i = 0; i < actionStacks.size; i++){
    const time = actionStacks.get(actionStacks.size - 1).get('time');
    if(time > longestTime){
      longestTime = time;
    }
  }
  return longestTime;
}