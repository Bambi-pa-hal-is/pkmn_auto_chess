// Author: Petter Andersson

import { getBackgroundAudio, getSoundEffect } from './audio.js';

const getNewSoundEffects = (soundEffects, newSoundEffect) => {
  let newSoundEffects = soundEffects;
  // console.log('@getNewSoundEffects', soundEffects, soundEffects.length)
  for(let i = 0; i < soundEffects.length; i++){
    if(soundEffects[i] !== newSoundEffect){
      // console.log('@NewSoundEffect', i, newSoundEffect)
      newSoundEffects[i] = newSoundEffect;
      break;
    }
  }
  return newSoundEffects;
}

const reducer = (
  state = {
    gameIsLive: false,
    connected: false,
    index: -1,
    ready: false,
    playersReady: -1,
    connectedPlayers: -1,
    allReady: false,
    message: 'default',
    messageMode: '',
    help: true,
    chatHelpMode: 'chat',
    chatMessages: [],
    senderMessages: [],
    storedState: {},
    players: {},
    myHand: {},
    myBoard: {},
    myShop: {},
    lock: false,
    level: -1,
    exp: -1,
    expToReach: -1,
    gold: -1,
    streak: 0,
    onGoingBattle: false,
    enemyIndex: -1,
    startBattle: false,
    actionStack: {},
    battleStartBoard: {},
    winner: false,
    dmgBoard: {},
    selectedUnit: -1,
    mouseOverId: -1,
    stats: {},
    statsMap: {},
    typeStatsString: '',
    typeBonusString: '',
    round: 1,
    musicEnabled: false,
    soundEnabled: false,
    timerDuration: 15,
    chatSoundEnabled: true,
    selectedSound: '',
    soundEffects: ['', '', '', '', '','', '', '', '', ''],
    music: getBackgroundAudio('mainMenu'),
    volume: 0.05,
    startTimer: false,
    isDead: true,
    selectedShopUnit: '',
    isSelectModeShop: false,
    boardBuffs: {},
    deadPlayers: [],
    pokemonSprites: {},
    alternateAnimation: true,
    loaded: false,
    visiting: -1,
    actionStacks: {},
    battleStartBoards: {},
    winners: {},
    dmgBoards: {},
    showDmgBoard: false,
  },
  action
) => {
  let tempSoundEffects;
  switch (action.type) { // Listens to events dispatched from from socket.js
    case 'LOAD_SPRITES_JSON': 
      console.log('Loaded sprites!');
      state = {...state, pokemonSprites: action.pokemonSprites, loaded: true}
      console.log('SPRITES:', state.pokemonSprites)
      break;
    case 'NEW_STATE':
      // Update state with incoming data from server
      console.log('@NewState Players: ', action.newState.players);
      state = { ...state,  
        storedState: action.newState,
        message: 'Received State', 
        messageMode: '',
        players: action.newState.players,
        round: action.newState.round,
      };
      if(action.newState.players[state.index]){
        state = {...state,
          myHand: action.newState.players[state.index].hand,
          myBoard: action.newState.players[state.index].board,
          myShop: action.newState.players[state.index].shop,
          boardBuffs: action.newState.players[state.index].boardBuffs,
          level: action.newState.players[state.index].level,
          exp: action.newState.players[state.index].exp,
          expToReach: action.newState.players[state.index].expToReach,
          gold: action.newState.players[state.index].gold,
          streak: action.newState.players[state.index].streak,
          // lock: action.newState.players[state.index].lock,
        };
      }
      console.log('New State', action.newState)
      // console.log(state);
      break;
    case 'UPDATE_PLAYER':
      // console.log('updating player', action.index, action.player);
      state = { ...state,
        message: 'Updated player', 
        messageMode: '',
      }
      if(action.index === state.index && !state.isDead){
        // TODO: Model upgrades on myBoard here
        state = {...state,
          myHand: action.player.hand,
          myBoard: action.player.board,
          myShop: action.player.shop,
          boardBuffs: action.player.boardBuffs,
          level: action.player.level,
          exp: action.player.exp,
          expToReach: action.player.expToReach,
          gold: action.player.gold,
          streak: action.player.streak,
        };
      }
      const players = state.players;
      players[action.index] = action.player
      state = {...state, players: {...players}}
      state.storedState.players[action.index] = action.player;
      // console.log('@Updated player', state.storedState)
      break;
    case 'LOCK_TOGGLED':
      console.log('Toggled Lock')
      state = {...state, lock: action.lock}
      state.storedState.players[state.index]['locked'] = action.lock;
      break;
    case 'NEW_PLAYER':
      console.log('Received player index', action.index);
      state = { ...state, 
        index: action.index, 
        visiting: action.index,
        gameIsLive: true,
        ready: false,
        playersReady: -1,
        connectedPlayers: -1,
        allReady: false,
        message: 'default',
        messageMode: '',
        help: true,
        chatHelpMode: 'chat',
        chatMessages: [],
        senderMessages: [],
        storedState: {},
        lock: false,
        onGoingBattle: false,
        enemyIndex: -1,
        startBattle: false,
        actionStack: {},
        battleStartBoard: {},
        winner: false,
        dmgBoard: {},
        selectedUnit: -1,
        soundEffects: ['', '', '', '', '','', '', '', '', ''],
        music: getBackgroundAudio('idle'),
        startTimer: true,
        isDead: false,
        boardBuffs: {},
        deadPlayers: [],
      }
      break;
    case 'SET_CONNECTED':
      state = {...state, connected: action.connected};
      break;
    case 'TOGGLE_READY':
      state = { ...state, ready: !state.ready}
      break;
    case 'READY':
      state = { ...state, playersReady: action.playersReady, connectedPlayers: action.connectedPlayers}
      break;
    case 'ALL_READY':
      // console.log('AllReady', action.playersReady, action.connectedPlayers, action.value)
      state = { ...state, 
        playersReady: action.playersReady, 
        connectedPlayers: action.connectedPlayers, 
        allReady: action.value, 
        gameIsLive: false,
        music: getBackgroundAudio('mainMenu'),
      }
      break;
    case 'UPDATE_MESSAGE':
      state = {...state, message: action.message, messageMode: action.messageMode}
      break;
    case 'TOGGLE_HELP':
      state = {...state, help: !state.help}
      break;
    case 'SET_HELP_MODE':
      state = {...state, chatHelpMode: action.chatHelpMode, showDmgBoard: false}    
      break;
    case 'SET_TYPE_BONUSES':
      state = {...state, typeStatsString: action.typeDescs, typeBonusString: action.typeBonuses}
      break;
    case 'BATTLE_TIME':
      const actionStack = action.actionStacks[state.index];
      const battleStartBoard = action.battleStartBoards[state.index];
      const winner = action.winners[state.index];
      const dmgBoard = action.dmgBoards[state.index];
      console.log('New dmg board in reducer', dmgBoard);
      // console.log('@battle_time', state.soundEffects)
      tempSoundEffects = getNewSoundEffects(state.soundEffects, getSoundEffect('horn'));
      state = {
        ...state,
        music: (action.enemy ? getBackgroundAudio('pvpbattle') : getBackgroundAudio('battle')),
        soundEffects: [...tempSoundEffects],
        onGoingBattle: true,
        enemyIndex: action.enemy,
        startBattle: true,
        actionStacks: action.actionStacks,
        battleStartBoard: action.battleStartBoards,
        winners: action.winners,
        dmgBoards: action.dmgBoards,
      }
      if(!state.isDead) {
        state = {
          ...state,
          actionStack,
          battleStartBoard,
          winner,
          dmgBoard,
        }        
      } else if(state.visiting !== state.index && action.battleStartBoards[state.visiting]) {
        const actionStackVisit = action.actionStacks[state.visiting];
        const battleStartBoardVisit = action.battleStartBoards[state.visiting];
        const winnerVisit = action.winners[state.visiting];
        const dmgBoardVisit = action.dmgBoards[state.visiting];
        state = {
          ...state,
          actionStack: actionStackVisit,
          battleStartBoard: battleStartBoardVisit,
          winner: winnerVisit,
          dmgBoard: dmgBoardVisit,
        }
      }
      console.log('@battleTime actionStack', state.actionStack);
      // console.log('@battleTime battleStartBoard', state.battleStartBoard)
      // TODO: BattleStartBoard contain unneccessary amount of information
      break;
    case 'CHANGE_STARTBATTLE':
      // console.log('FIND ME: Changing StartBattle', action.value);
      state = {...state, startBattle: action.value}
      break;
    case 'UPDATE_BATTLEBOARD':
        // console.log('@reducer.updateBattleBoard: MOVE NUMBER: ', action.moveNumber,'Updating state battleBoard', action.board);
        state = {...state, battleStartBoard: action.board, message: 'Move ' + action.moveNumber, messageMode: ''}
        // console.log('state', state);
        break;
    case 'SET_STATS':
      console.log('Updating stats', action.name); // action.stats)
      const statsMap = state.statsMap;
      statsMap[action.name] = action.stats;
      state = {...state, name: action.name, stats: action.stats, statsMap: statsMap}
      break;
    case 'SELECT_UNIT':
      if(action.selectedUnit === ''){
        const selectedUnit = state.selectedUnit;
        selectedUnit['displaySell'] = false;
        // selectedUnit['pos'] = '';
        state = {...state, selectedUnit: {...selectedUnit}}
      } else {
        state = {...state, selectedUnit: action.selectedUnit, isSelectModeShop: false}
      }
      break;
    case 'SELECT_SHOP_INFO':
      state = {...state, selectedShopUnit: action.name, isSelectModeShop: true}
      break;
    case 'SET_MOUSEOVER_ID':
      state = {...state, mouseOverId: action.mouseOverId}
      break;
    case 'END_BATTLE':  
      console.log('Battle ended', state.startTimer)
      state = {...state, onGoingBattle: false, round: state.round + 1, music: getBackgroundAudio('idle'), startTimer: true, showDmgBoard: true}
      break;
    case 'TOGGLE_SHOW_DMGBOARD': {
      state = {...state, showDmgBoard: !state.showDmgBoard}
      break;
    }
    case 'DISABLE_START_TIMER':
      state = {...state, startTimer: false}
      // console.log('Disabled start timer')
      break;
    case 'TOGGLE_MUSIC':
      state = {...state, musicEnabled: !state.musicEnabled}
      break;
    case 'TOGGLE_SOUND':
      state = {...state, soundEnabled: !state.soundEnabled}
      break;
    case 'TOGGLE_CHAT_SOUND':
      // console.log(state.chatSoundEnabled)
      state = {...state, chatSoundEnabled: !state.chatSoundEnabled}
      break;
    case 'CHANGE_VOLUME':
      // console.log('@reducer.ChangeVolume', action.newVolume)
      state = {...state, volume: action.newVolume}; //, music: state.music}
      break;
    case 'NEW_UNIT_SOUND':
      // console.log('reducer.NewUnitSound', action.newAudio);
      state = {...state, selectedSound: action.newAudio}
      break;
    case 'NEW_SOUND_EFFECT':
      tempSoundEffects = getNewSoundEffects(state.soundEffects, action.newSoundEffect);
      state = {...state, soundEffects: [...tempSoundEffects]};
      break;
    case 'END_GAME': {
      console.log('GAME ENDED! Player ' + action.winningPlayer.index + ' won!');
      let newMusic = state.music;
      if(state.index === action.winningPlayer.index){
        newMusic = getBackgroundAudio('wonGame')
      }
      console.log('Remaining keys in players ...', Object.keys(state.players));
      Object.keys(state.players).forEach((key) => {
        if(key !== action.winningPlayer.index) {
          console.log('Deleting key ...', key, state.players)
          delete state.players[key];
        }
      });
      state = {...state, message: 'Player ' + action.winningPlayer.index + ' won the game', messageMode: 'big', gameEnded: action.winningPlayer, music: newMusic}
      break;
    }
    case 'DEAD_PLAYER': {
      if(action.pid === state.index) {
        state = {...state, message: 'You Lost! You finished ' + state.position + '!', messageMode: 'big', isDead: true}
      }
      console.log('Before: Removing player ' + action.pid, state.players);
      const players = state.players;
      delete players[action.pid];
      console.log('Removing player ' + action.pid, players, state.players);
      const deadPlayer = {index: action.pid, hp: 0, pos: state.position};
      const deadPlayers = state.deadPlayers;
      deadPlayers.push(deadPlayer);
      state = {...state, deadPlayers, players}
      console.log('reducer.Dead_player', state.deadPlayers, deadPlayers);
      break;
    }
    case 'NEW_CHAT_MESSAGE':
      // console.log('@NEW_CHAT_MESSAGE', action.chatType);
      const { senderMessages, chatMessages } = state;
      state = {...state, senderMessages: senderMessages.concat(action.senderMessage), chatMessages: chatMessages.concat(action.newMessage)};
      let soundEffect;
      switch(action.chatType){
        case 'pieceUpgrade':
          soundEffect = getSoundEffect('lvlup');
          break;
        case 'playerEliminated':
        case 'disconnect':
          soundEffect = getSoundEffect('disconnect');
          break;
        case 'chat':
        default:
          soundEffect = getSoundEffect('pling');
      }
      tempSoundEffects = getNewSoundEffects(state.soundEffects, soundEffect);
      state = {...state, soundEffects: [...tempSoundEffects]};
      break;
    case 'TOGGLE_ALTERNATE_ANIMATION': {
      state = {...state, alternateAnimation: !state.alternateAnimation}
      break;
    }
    case 'SPEC_PLAYER': {
      const index = action.playerIndex;
      state = {...state,
        visiting: index,
        myHand: state.players[index].hand,
        myBoard: state.players[index].board,
        /*
          Requires redo logic of battle / how actionStacks are stored to jump between battles
          battleStartBoard: state.battleStartBoards[index],
          actionMove: state.actionMoves[index],
          winners: state.winner[index],
        */
      }
      break;
    }
    default:
      break;
  }

  return state;
};

export default reducer;