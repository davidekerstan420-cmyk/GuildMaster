export const tabIcons = {
  quest: {
    idle: require('./quest-icon.png'),
    active: require('./questpressed-icon.png'),
  },
  habit: {
    idle: require('./habit-icon.png'),
    active: require('./habitpressed-icon.png'),
  },
  bazaar: {
    idle: require('./bazaar-icon.png'),
    active: require('./bazaarpressed-icon.png'),
  },
  guildcard: {
    idle: require('./guildcard-icon.png'),
    active: require('./guildcardpressed-icon.png'),
  },
} as const;

export const backIcon = {
  idle: require('./backarrow-icon.png'),
  pressed: require('./backarrowpressed-icon.png'),
};

export const cardIcons = {
  edit: require('./edit.png'),
  swords: require('./swords.png'),
  coins: require('./coins.png'),
};

export const bazaarArt = {
  merchant: require('./merch.png'),
  card: require('./bazaaritem-icon.png'),
  keeper: [
    require('./bazaarkeeper1.png'),
    require('./bazaarkeeper2.png'),
    require('./bazaarkeeper3.png'),
    require('./bazaarkeeper4.png'),
    require('./bazaarkeeper5.png'),
  ],
};

export const socialIcons = {
  facebook: {
    idle: require('./fb-icon.png'),
    pressed: require('./fbpressed-icon.png'),
  },
  google: {
    idle: require('./google-icon.png'),
    pressed: require('./googlepressed-icon.png'),
  },
};

export const buttonArt = {
  primary: require('./login_register-button.png'),
};

export const brandArt = {
  logo: require('./Guildmaster-logo.png'),
  textbox: require('./textbox_1.png'),
};

export const homeIcons = {
  settings: require('./settings-icon.png'),
  achievement: require('./achievement-icon.png'),
  notice: require('./notice-icon.png'),
  noticeUnread: require('./notice_unread-icon.png'),
  level: require('./level-icon.png'),
  xp: require('./xp-icon.png'),
  hp: require('./hp-icon.png'),
};

export const settingsArt = {
  button: require('./settingcontent-button.png'),
  buttonPressed: require('./settingcontent_pressed-button.png'),
  help: require('./helandsupport-icon.png'),
  about: require('./about-icon.png'),
};

export const noticeArt = {
  frame: require('./noticeboard_bg.png'),
  paper: require('./noticeboard_paper.png'),
  check: require('./check-icon.png'),
  delete: require('./delete-icon.png'),
};

export const badgeIcons = {
  swords: require('./swords.png'),
  fire: require('./fire-icon.png'),
  book: require('./book-icon.png'),
} as const;

export type BadgeIconKey = keyof typeof badgeIcons;

export const receptionistArt = {
  act1: require('./receptionist_act1.png'), // arm out, welcoming
  act2: require('./receptionist_act2.png'), // hand on hip
  bubble: require('./messagebubble.png'),
};

export const questArt = {
  scroll: require('./scrolls.png'),
  check: require('./questcheck-icon.png'),
  filter: require('./filter-icon.png'),
};

export const habitIcons = {
  sun: require('./morningsun-icon.png'),
  shield: require('./shield-icon.png'),
  book: require('./book-icon.png'),
} as const;

export type HabitIconKey = keyof typeof habitIcons;

export const itemArt: Record<string, any> = {
  face_smiley: require('./items/smiley-face.png'),
  face_bored: require('./items/bored-face.png'),
  face_blank: require('./items/blankstare-face.png'),
  face_melted: require('./items/melted-face.png'),
  face_smug: require('./items/pixelatedsmug-face.png'),
  face_thumbsup: require('./items/memethumbsup-face.png'),
  potion_level: require('./items/levelpotion.png'),
};
