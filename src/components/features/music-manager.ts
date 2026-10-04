// @ts-nocheck
// biome-ignore-all lint/suspicious/noExplicitAny: 从 is:inline 脚本原样迁移的播放器胶水代码，类型检查整体关闭，有意保留 any
// 音乐播放器「管理器」单例：播放状态、音频元素、Meting/本地播放列表、歌词解析。
// 由 MusicManager.astro 以普通 <script> 引入，打包为带 hash 的外部文件长期缓存。
// 模块只求值一次，天然就是单例（替代旧的 is:inline + data-swup-ignore-script）。
import { musicPlayerConfig } from "@/config/musicConfig";
import I18nKey from "@/i18n/i18nKey";
import { i18n } from "@/i18n/translation";
import { url } from "@/utils/url-utils";

const config = musicPlayerConfig;

const localPlaylist =
	config.mode === "local" && config.local?.playlist
		? config.local.playlist.map((song: any) => {
				const isFullUrl = (path: string) => /^https?:\/\//.test(path);
				return {
					name: song.name,
					artist: song.artist,
					url: isFullUrl(song.url) ? song.url : url(song.url),
					pic: song.cover
						? isFullUrl(song.cover)
							? song.cover
							: url(song.cover)
						: undefined,
					lrc: song.lrc
						? isFullUrl(song.lrc)
							? song.lrc
							: url(song.lrc)
						: undefined,
				};
			})
		: [];

const managerConfig = {
	mode: config.mode,
	meting: config.meting,
	localPlaylist,
	volume: config.volume ?? 0.7,
	playMode: config.playMode ?? "list",
	showLyrics: config.showLyrics ?? true,
	i18n: {
		noPlaying: i18n(I18nKey.musicNoPlaying),
		lyrics: i18n(I18nKey.musicLyrics),
		volume: i18n(I18nKey.musicVolume),
		playMode: i18n(I18nKey.musicPlayMode),
		prev: i18n(I18nKey.musicPrev),
		next: i18n(I18nKey.musicNext),
		playlist: i18n(I18nKey.musicPlaylist),
		noLyrics: i18n(I18nKey.musicNoLyrics),
		loadingLyrics: i18n(I18nKey.musicLoadingLyrics),
		failedLyrics: i18n(I18nKey.musicFailedLyrics),
		noSongs: i18n(I18nKey.musicNoSongs),
		error: i18n(I18nKey.musicError),
		play: i18n(I18nKey.musicPlay),
		pause: i18n(I18nKey.musicPause),
		progress: i18n(I18nKey.musicProgress),
		noCover: i18n(I18nKey.musicNoCover),
	},
};

(() => {
	// Singleton guard – only create once
	if (window.__fireflyMusic) return;

	const config = managerConfig;

	// ── Helpers ──────────────────────────────────────────────
	function formatTime(seconds: number) {
		if (!seconds || Number.isNaN(seconds)) return "0:00";
		const min = Math.floor(seconds / 60);
		const sec = Math.floor(seconds % 60);
		return `${min}:${sec < 10 ? "0" : ""}${sec}`;
	}

	function parseLRC(lrc: string) {
		if (!lrc) return [];
		const lines = lrc.split("\n");
		const result: any[] = [];
		const timeReg = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/g;
		lines.forEach((line) => {
			const matches = Array.from(line.matchAll(timeReg));
			if (matches.length > 0) {
				const text = line.replace(timeReg, "").trim();
				if (text) {
					matches.forEach((match) => {
						const m = Number.parseInt(match[1], 10);
						const s = Number.parseInt(match[2], 10);
						const ms = Number.parseInt(match[3], 10);
						const time = m * 60 + s + ms / (match[3].length === 3 ? 1000 : 100);
						result.push({ time, text });
					});
				}
			}
		});
		return result.sort((a, b) => a.time - b.time);
	}

	// ── Audio element (persistent, attached to body) ────────
	const audio = document.createElement("audio");
	audio.crossOrigin = "anonymous";
	audio.style.display = "none";
	audio.preload = "none"; // 阻止浏览器预加载和自动恢复播放
	document.body.appendChild(audio);
	audio.pause(); // 确保不自动播放

	// ── State ────────────────────────────────────────────────
	let loadVersion = 0; // incremented on each loadTrack to discard stale play() results
	const state: any = {
		playlist: [],
		currentIndex: 0,
		isPlaying: false,
		playMode: 0, // 0: list, 1: one, 2: random
		volume:
			localStorage.getItem("music-player-volume") !== null
				? Number.parseFloat(
						localStorage.getItem("music-player-volume") as string,
					)
				: config.volume || 0.7,
		isMuted: false,
		lyrics: [],
		currentLrcIndex: -1,
		initialized: false,
		initializing: false,
		error: null,
	};

	// Map config playMode string to number
	if (config.playMode === "random") state.playMode = 2;
	else if (config.playMode === "one") state.playMode = 1;
	else state.playMode = 0;

	// ── Event helpers ────────────────────────────────────────
	function emit(name: string, detail?: any) {
		window.dispatchEvent(new CustomEvent(name, { detail: detail || {} }));
	}

	// ── Meting fetch ─────────────────────────────────────────
	async function fetchMetingData() {
		if (!config.meting) return;
		const m = config.meting;
		const apis = [m.api].concat(m.fallbackApis || []);

		for (let i = 0; i < apis.length; i++) {
			const baseApi = apis[i];
			if (!baseApi) continue;
			try {
				let fetchUrl = baseApi
					.replace(":server", m.server)
					.replace(":type", m.type)
					.replace(":id", m.id)
					.replace(":r", Math.random());
				if (m.auth) fetchUrl += `&auth=${m.auth}`;

				// 8 秒超时：挂死的 API 快速失败，立即尝试下一个
				const controller = new AbortController();
				const timeoutId = setTimeout(() => {
					controller.abort();
				}, 8000);
				let res: Response;
				try {
					res = await fetch(fetchUrl, { signal: controller.signal });
				} finally {
					clearTimeout(timeoutId);
				}
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				const data = await res.json();

				if (Array.isArray(data) && data.length > 0) {
					state.playlist = data.map((item: any) => ({
						name: item.title || item.name || "Unknown",
						artist: item.author || item.artist || "Unknown",
						url: item.url,
						pic: item.pic || item.cover || "",
						lrc: item.lrc,
					}));
					return;
				}
			} catch (e) {
				console.warn(`Meting API failed for ${baseApi}`, e);
			}
		}
		throw new Error("All Meting APIs failed");
	}

	// ── Lyrics ───────────────────────────────────────────────
	function loadLyrics(track: any) {
		state.lyrics = [];
		state.currentLrcIndex = -1;

		if (!track.lrc) {
			emit("fm:lyrics", { lyrics: [], status: "none" });
			return;
		}

		const isLrcUrl =
			/^(https?:)?\/\//.test(track.lrc) ||
			track.lrc.startsWith("/") ||
			/\.(lrc|txt)(\?|#|$)/i.test(track.lrc);

		if (isLrcUrl) {
			emit("fm:lyrics", { lyrics: [], status: "loading" });
			fetch(track.lrc)
				.then((r) => r.text())
				.then((text) => {
					state.lyrics = parseLRC(text);
					emit("fm:lyrics", { lyrics: state.lyrics, status: "loaded" });
				})
				.catch(() => {
					state.lyrics = [];
					emit("fm:lyrics", { lyrics: [], status: "failed" });
				});
		} else {
			state.lyrics = parseLRC(track.lrc);
			emit("fm:lyrics", {
				lyrics: state.lyrics,
				status: state.lyrics.length > 0 ? "loaded" : "none",
			});
		}
	}

	let currentTrackUrls: string[] = [];
	let currentTrackUrlIndex = 0;
	let errorSkipTimeout: any = null;

	function tryPlayCurrentTrackUrl(autoPlay: boolean, ver: number) {
		if (ver !== loadVersion) return;
		const playUrl = currentTrackUrls[currentTrackUrlIndex];
		audio.src = playUrl;

		if (autoPlay) {
			audio
				.play()
				.then(() => {
					if (ver !== loadVersion) return; // stale, discard
					state.isPlaying = true;
					state.error = null;
					emit("fm:play-state", { isPlaying: true });
				})
				.catch((e: any) => {
					if (ver !== loadVersion) return; // stale, discard
					if (e.name === "AbortError") return; // interrupted by new load
					console.warn("Autoplay blocked:", e);
				});
		} else {
			state.isPlaying = false;
			emit("fm:play-state", { isPlaying: false });
		}
	}

	// ── Track loading ────────────────────────────────────────
	function loadTrack(index: number, autoPlay: boolean) {
		if (index < 0 || index >= state.playlist.length) return;
		state.currentIndex = index;
		const track = state.playlist[index];
		const ver = ++loadVersion;

		if (errorSkipTimeout) {
			clearTimeout(errorSkipTimeout);
			errorSkipTimeout = null;
		}

		currentTrackUrls = [track.url];
		currentTrackUrlIndex = 0;

		const matchId = track.url.match(/[?&]id=([^&]+)/);
		const matchServer = track.url.match(/[?&]server=([^&]+)/);
		if (matchId && matchServer && config.meting?.fallbackApis) {
			config.meting.fallbackApis.forEach((fallback: string) => {
				const fallbackUrl = fallback
					.replace(":server", matchServer[1])
					.replace(":type", "url")
					.replace(":id", matchId[1]);
				if (currentTrackUrls.indexOf(fallbackUrl) === -1) {
					currentTrackUrls.push(fallbackUrl);
				}
			});
		}

		loadLyrics(track);

		emit("fm:track", { index, track, autoPlay: !!autoPlay });

		tryPlayCurrentTrackUrl(autoPlay, ver);
	}

	// ── Playback controls ────────────────────────────────────
	function togglePlay() {
		if (audio.paused) {
			audio
				.play()
				.then(() => {
					state.isPlaying = true;
					emit("fm:play-state", { isPlaying: true });
				})
				.catch((e: any) => {
					if (e.name === "AbortError") return;
					console.warn("Playback failed:", e);
				});
		} else {
			audio.pause();
			state.isPlaying = false;
			emit("fm:play-state", { isPlaying: false });
		}
	}

	function playNext(auto?: boolean) {
		if (state.playMode === 1 && auto) {
			audio.currentTime = 0;
			audio.play();
			return;
		}
		let nextIndex: number;
		if (state.playMode === 2) {
			nextIndex = Math.floor(Math.random() * state.playlist.length);
		} else {
			nextIndex = (state.currentIndex + 1) % state.playlist.length;
		}
		loadTrack(nextIndex, true);
	}

	function playPrev() {
		let prevIndex: number;
		if (state.playMode === 2) {
			prevIndex = Math.floor(Math.random() * state.playlist.length);
		} else {
			prevIndex =
				(state.currentIndex - 1 + state.playlist.length) %
				state.playlist.length;
		}
		loadTrack(prevIndex, true);
	}

	function setPlayMode(mode: number) {
		state.playMode = mode;
		emit("fm:mode", { playMode: mode });
	}

	function cyclePlayMode() {
		setPlayMode((state.playMode + 1) % 3);
	}

	function setVolume(rawVal: number) {
		const val = Math.max(0, Math.min(1, rawVal));
		state.volume = val;
		state.isMuted = false;
		audio.volume = val;
		audio.muted = false;
		localStorage.setItem("music-player-volume", val.toString());
		emit("fm:volume", { volume: val, isMuted: false });
	}

	function toggleMute() {
		state.isMuted = !state.isMuted;
		audio.muted = state.isMuted;
		emit("fm:volume", { volume: state.volume, isMuted: state.isMuted });
	}

	function seek(percent: number) {
		if (!audio.duration) return;
		audio.currentTime = Math.max(0, Math.min(1, percent)) * audio.duration;
	}

	function seekToTime(time: number) {
		if (!audio.duration) return;
		audio.currentTime = Math.max(0, Math.min(time, audio.duration));
	}

	function playTrackByIndex(index: number) {
		if (index === state.currentIndex && !audio.paused) {
			togglePlay();
		} else {
			loadTrack(index, true);
		}
	}

	// ── Audio events → broadcast ─────────────────────────────
	audio.addEventListener("timeupdate", () => {
		if (Number.isNaN(audio.duration)) return;
		const ct = audio.currentTime;
		const dur = audio.duration;
		const pct = (ct / dur) * 100;

		emit("fm:time", {
			currentTime: ct,
			duration: dur,
			progress: pct,
			currentTimeStr: formatTime(ct),
			durationStr: formatTime(dur),
		});

		// Lyrics sync
		if (state.lyrics.length > 0) {
			let idx = -1;
			for (let i = 0; i < state.lyrics.length; i++) {
				if (ct >= state.lyrics[i].time) idx = i;
				else break;
			}
			if (idx !== state.currentLrcIndex) {
				state.currentLrcIndex = idx;
				emit("fm:lrc-index", { index: idx });
			}
		}
	});

	audio.addEventListener("ended", () => {
		playNext(true);
	});

	audio.addEventListener("error", () => {
		const ver = loadVersion;
		if (currentTrackUrlIndex < currentTrackUrls.length - 1) {
			currentTrackUrlIndex++;
			console.warn(
				"Playback failed, trying fallback URL: " +
					currentTrackUrls[currentTrackUrlIndex],
			);
			tryPlayCurrentTrackUrl(true, ver);
		} else {
			state.error = "Audio playback error";
			emit("fm:error", { message: "播放失败，即将自动跳过..." });

			if (errorSkipTimeout) clearTimeout(errorSkipTimeout);
			errorSkipTimeout = setTimeout(() => {
				if (ver === loadVersion) {
					playNext(true);
				}
			}, 2000);
		}
	});

	// ── Init (idempotent) ────────────────────────────────────
	async function init() {
		if (state.initialized || state.initializing) return;
		state.initializing = true;

		try {
			if (config.mode === "meting" && config.meting) {
				await fetchMetingData();
			} else if (config.mode === "local") {
				state.playlist = config.localPlaylist || [];
			}

			if (state.playlist.length > 0) {
				// Apply volume
				audio.volume = state.volume;

				let startIndex = 0;
				if (state.playMode === 2) {
					startIndex = Math.floor(Math.random() * state.playlist.length);
				}

				state.initialized = true;

				emit("fm:init", {
					playlist: state.playlist,
					playMode: state.playMode,
					volume: state.volume,
					isMuted: state.isMuted,
				});

				loadTrack(startIndex, false);
			} else {
				state.initialized = true;
				emit("fm:init", {
					playlist: [],
					playMode: state.playMode,
					volume: state.volume,
					isMuted: state.isMuted,
				});
				emit("fm:error", { message: config.i18n.noSongs });
			}
		} catch (e) {
			console.error("Music Manager init error:", e);
			state.initialized = true;
			emit("fm:init", {
				playlist: [],
				playMode: state.playMode,
				volume: state.volume,
				isMuted: state.isMuted,
			});
			emit("fm:error", { message: config.i18n.error });
		} finally {
			state.initializing = false;
		}
	}

	// ── Public API ───────────────────────────────────────────
	window.__fireflyMusic = {
		init,
		getState: () => {
			const track = state.playlist[state.currentIndex] || null;
			return {
				playlist: state.playlist,
				currentIndex: state.currentIndex,
				track,
				isPlaying: state.isPlaying,
				playMode: state.playMode,
				volume: state.volume,
				isMuted: state.isMuted,
				currentTime: audio.currentTime,
				duration: audio.duration || 0,
				progress: audio.duration
					? (audio.currentTime / audio.duration) * 100
					: 0,
				currentTimeStr: formatTime(audio.currentTime),
				durationStr: formatTime(audio.duration),
				lyrics: state.lyrics,
				currentLrcIndex: state.currentLrcIndex,
				initialized: state.initialized,
				error: state.error,
				config,
			};
		},
		togglePlay,
		playNext: () => {
			playNext(false);
		},
		playPrev,
		cyclePlayMode,
		setVolume,
		toggleMute,
		seek,
		seekToTime,
		playTrackByIndex,
		loadTrack,
	};
})();
