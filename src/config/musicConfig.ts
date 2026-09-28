import type { MusicPlayerConfig } from "../types/musicConfig";
import musicData from "../data/music.json";
import musicPlayerData from "../data/musicPlayer.json";

// 音乐播放器配置（从 musicPlayer.json 读取，可通过后台管理编辑）
// 本地播放列表从 music.json 读取（已有后台管理）
export const musicPlayerConfig: MusicPlayerConfig = {
	...(musicPlayerData as Omit<MusicPlayerConfig, "local">),
	local: {
		playlist: musicData,
	},
};
