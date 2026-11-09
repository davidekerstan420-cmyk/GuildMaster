export const tabIcons = {
  quest: {
    active: require('./quest-icon.png'),
    idle: require('./questpressed-icon.png'),
  },
  habit: {
    active: require('./habit-icon.png'),
    idle: require('./habitpressed-icon.png'),
  },
  bazaar: {
    active: require('./bazaar-icon.png'),
    idle: require('./bazaarpressed-icon.png'),
  },
  guildcard: {
    active: require('./guildcard-icon.png'),
    idle: require('./guildcardpressed-icon.png'),
  },
} as const;

export const backIcon = {
  idle: require('./backarrow-icon.png'),
  pressed: require('./backarrowpressed-icon.png'),
};