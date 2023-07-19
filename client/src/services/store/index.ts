import { defineStore } from "pinia";
// import { State, ChatRecord, UserMessage, TheiaMessage } from "../../interfaces";
// import { getDate, getTime } from "../../helpers";
// import { askTheia } from "../sockets/theia.socket";
import { userSettings, avatarSettings, socialConnections } from "./default";
// import VoiceRec from "../utilities/voiceRec";

const useStore = defineStore("store", {
  state: () => {
    return {
      // login / signup
      login: false,
      inputUsername: "",
      newUser: false,
      usernameAv: false,
      // user mood
      lang: "en",
      mood: "curious",
      voice: "denis",
      // user info
      userProfile: userSettings,
      // messages
      input: "",
      chat: [],
      // ui config
      dark: true,
      sound: false,
      // recorder: new VoiceRec(),
      primaryColor: "purple-500",
      secondaryColor: "yellow-500",
      heart1: "💜",
      heart2: "💛",
      emoji: "",
      showChat: true,
      showMenu: false,
      loading: false,
      // rerenders
      rerenderAvatar: 0,
      rerenderAudio: 0,
      // 3d avatar
      avatarConfig: avatarSettings["listening"],
      avatarMode: "listening",
      // modals
      loginModal: false,
      settingsModal: false,
      userModal: false,
      avatarModal: false,
      connectionModal: false,
      // menus
      connections: socialConnections,
      // real estate
      realEstate: [],
      showEstate: true,
    };
  },
  actions: {
    reAvatar(): void {
      console.log("Rerendering...");
      this.rerenderAvatar++;
    },
    reAudio(): void {
      console.log("Rerendering...");
      this.rerenderAudio++;
    },
    scrollTop(): void {
      window.scrollTo(document.body.scrollHeight, 0);
    },
    switchShowChat(): void {
      this.showChat = !this.showChat;
    },
    switchDark(): void {
      this.dark = !this.dark;
      if (this.dark) this.avatarConfig.background = 0.07;
      else this.avatarConfig.background = 0.95;
      this.reAvatar();
    },
    // switchSound(): void {
    //   this.sound = !this.sound;
    //   this.recorder.init();
    //   if (this.sound) this.recorder.start();
    //   else this.recorder.stop();
    // },

    setPrimaryColor(color: string): void {
      this.primaryColor = color;
    },
    setSecondaryColor(color: string): void {
      this.secondaryColor = color;
    },
    setHeart(heart: string, _i = 1): void {
      if (_i === 1 || _i === 0) this.heart1 = heart;
      else this.heart2 = heart;
    },
    searchUser(): void {
      console.log(this.inputUsername);
      // socket.emit("newUsername", this.username);
    },
    // Connection functions
    connectLichess(): boolean {
      return true;
    },
  },
});

export default useStore;
