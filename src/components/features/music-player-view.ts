// @ts-nocheck
// biome-ignore-all lint/suspicious/noExplicitAny: 从 is:inline 脚本原样迁移的 DOM 绑定代码，类型检查整体关闭，有意保留 any
// 音乐播放器「视图层」：为页面上所有 .music-player-widget（导航栏 + 侧栏）
// 绑定 UI。逻辑全部在本模块（外部 hash 文件，长期缓存）；软导航后通过
// astro:page-load 事件重新扫描新 widget —— 与旧版「is:inline 脚本被
// @swup/scripts-plugin 每次导航重跑」的初始化时机等价。
import { musicPlayerConfig } from "@/config/musicConfig";
import I18nKey from "@/i18n/i18nKey";
import { i18n } from "@/i18n/translation";
import "./music-manager";

const config = musicPlayerConfig;

const cfg = {
	showLyrics: config.showLyrics ?? true,
	i18n: {
		noPlaying: i18n(I18nKey.musicNoPlaying),
		lyrics: i18n(I18nKey.musicLyrics),
		noLyrics: i18n(I18nKey.musicNoLyrics),
		loadingLyrics: i18n(I18nKey.musicLoadingLyrics),
		failedLyrics: i18n(I18nKey.musicFailedLyrics),
		noSongs: i18n(I18nKey.musicNoSongs),
		error: i18n(I18nKey.musicError),
		play: i18n(I18nKey.musicPlay),
		pause: i18n(I18nKey.musicPause),
		noCover: i18n(I18nKey.musicNoCover),
		music: i18n(I18nKey.music),
	},
};

(() => {
	const mgr = window.__fireflyMusic;
	if (!mgr) return;

	let initScheduled = false;
	function scheduleInit() {
		if (initScheduled) return;
		initScheduled = true;

		let fired = false;
		function go() {
			if (fired) return;
			fired = true;
			document.removeEventListener("pointerdown", go, true);
			document.removeEventListener("keydown", go, true);
			mgr.init();
		}
		document.addEventListener("pointerdown", go, true);
		document.addEventListener("keydown", go, true);

		function afterLoad() {
			if (window.requestIdleCallback)
				window.requestIdleCallback(go, { timeout: 2000 });
			else setTimeout(go, 800);
		}
		if (document.readyState === "complete") afterLoad();
		else window.addEventListener("load", afterLoad, { once: true });
	}

	function initWidget(widget: HTMLElement) {
		// ── UI element refs ──────────────────────────────────────
		const ui: any = {
			widget,
			loading: widget.querySelector(".music-loading"),
			cover: widget.querySelector(".music-cover"),
			title: widget.querySelector(".music-title"),
			artist: widget.querySelector(".music-artist"),
			progressBar: widget.querySelector(".progress-bar"),
			progressThumb: widget.querySelector(".progress-thumb"),
			progressContainer: widget.querySelector(".progress-container"),
			currentTime: widget.querySelector(".current-time"),
			totalTime: widget.querySelector(".total-time"),
			btnPlay: widget.querySelector(".btn-play"),
			iconPlay: widget.querySelector(".icon-play"),
			iconPause: widget.querySelector(".icon-pause"),
			btnPrev: widget.querySelector(".btn-prev"),
			btnNext: widget.querySelector(".btn-next"),
			btnRepeat: widget.querySelector(".btn-repeat"),
			iconRepeat: widget.querySelector(".icon-repeat"),
			iconRepeatOne: widget.querySelector(".icon-repeat-one"),
			iconShuffle: widget.querySelector(".icon-shuffle"),
			btnMute: widget.querySelector(".btn-mute"),
			iconVolHigh: widget.querySelector(".icon-vol-high"),
			iconVolMute: widget.querySelector(".icon-vol-mute"),
			volContainer: widget.querySelector(".vol-container"),
			volBar: widget.querySelector(".vol-bar"),
			btnLrc: widget.querySelector(".btn-lrc-toggle"),
			iconLrcOn: widget.querySelector(".icon-lrc-on"),
			iconLrcOff: widget.querySelector(".icon-lrc-off"),
			lrcDrawer: widget.querySelector(".lrc-drawer"),
			lrcContainer: widget.querySelector(".lrc-container"),
			btnDrawer: widget.querySelector(".btn-drawer-toggle"),
			playlistDrawer: widget.querySelector(".playlist-drawer"),
			playlistContainer: widget.querySelector(".playlist-container"),
			itemTemplate: document.getElementById("playlist-item-template"),
		};

		// Verify critical elements
		const _critical = [
			ui.btnPlay,
			ui.btnRepeat,
			ui.btnMute,
			ui.volContainer,
			ui.btnDrawer,
			ui.btnLrc,
			ui.lrcDrawer,
			ui.lrcContainer,
			ui.progressContainer,
			ui.btnNext,
			ui.btnPrev,
			ui.loading,
			ui.cover,
			ui.title,
			ui.artist,
			ui.playlistContainer,
			ui.itemTemplate,
		];
		if (_critical.some((el) => !el)) return;

		// ── Local state (drawers, user scrolling, virtual scroll) ──
		const ITEM_H = 42;
		const OVERSCAN = 8;
		const local: any = {
			isUserScrolling: false,
			scrollTimeout: null,
			currentLrcIndex: -1,
			vs: {
				playlist: [],
				currentIndex: -1,
				renderedStart: -1,
				renderedEnd: -1,
				renderedEls: {},
				scrollRaf: 0,
				drawerOpen: false,
			},
		};

		// ── UI update functions ──────────────────────────────────
		function setLoading(bool: boolean) {
			if (bool) {
				ui.loading.classList.remove("opacity-0", "pointer-events-none");
			} else {
				ui.loading.classList.add("opacity-0", "pointer-events-none");
			}
		}

		function updatePlayStateUI(isPlaying: boolean) {
			if (isPlaying) {
				ui.btnPlay.classList.add(
					"bg-(--primary)",
					"text-white",
					"hover:brightness-110",
				);
				ui.btnPlay.classList.remove(
					"bg-(--btn-regular-bg)",
					"hover:bg-(--btn-regular-bg-hover)",
					"active:bg-(--btn-regular-bg-active)",
					"text-(--primary)",
				);
				ui.iconPlay.classList.add("hidden");
				ui.iconPause.classList.remove("hidden");
				ui.cover.style.animationPlayState = "running";
				ui.btnPlay.setAttribute("aria-label", cfg.i18n.pause);
				ui.btnPlay.title = cfg.i18n.pause;
			} else {
				ui.btnPlay.classList.remove(
					"bg-(--primary)",
					"text-white",
					"hover:brightness-110",
				);
				ui.btnPlay.classList.add(
					"bg-(--btn-regular-bg)",
					"hover:bg-(--btn-regular-bg-hover)",
					"active:bg-(--btn-regular-bg-active)",
					"text-(--primary)",
				);
				ui.iconPlay.classList.remove("hidden");
				ui.iconPause.classList.add("hidden");
				ui.cover.style.animationPlayState = "paused";
				ui.btnPlay.setAttribute("aria-label", cfg.i18n.play);
				ui.btnPlay.title = cfg.i18n.play;
			}
			// Toggle eq-bars / play icon in playlist
			const activeItems = ui.playlistContainer.querySelectorAll(
				'.playlist-item[aria-current="true"]',
			);
			activeItems.forEach((item: HTMLElement) => {
				const eqBars = item.querySelector(".eq-bars");
				const playIcon = item.querySelector(".eq-play-icon");
				if (isPlaying) {
					eqBars.classList.remove("hidden");
					eqBars.classList.add("flex");
					playIcon.classList.add("hidden");
				} else {
					eqBars.classList.add("hidden");
					eqBars.classList.remove("flex");
					playIcon.classList.remove("hidden");
				}
			});
		}

		function updateModeUI(playMode: number) {
			const primaryColor = "text-(--primary)";
			if (playMode === 0) {
				ui.btnRepeat.className =
					"p-2 active:scale-95 transition-colors text-neutral-300 dark:text-neutral-600 hover:text-(--primary)";
				ui.iconRepeat.classList.remove("hidden");
				ui.iconRepeatOne.classList.add("hidden");
				ui.iconShuffle.classList.add("hidden");
			} else if (playMode === 1) {
				ui.btnRepeat.className = `p-2 active:scale-95 transition-colors ${primaryColor}`;
				ui.iconRepeat.classList.add("hidden");
				ui.iconRepeatOne.classList.remove("hidden");
				ui.iconShuffle.classList.add("hidden");
			} else {
				ui.btnRepeat.className = `p-2 active:scale-95 transition-colors ${primaryColor}`;
				ui.btnRepeat.classList.add("hidden");
				ui.iconRepeatOne.classList.add("hidden");
				ui.iconShuffle.classList.remove("hidden");
			}
		}

		function updateVolumeUI(volume: number, isMuted: boolean) {
			const pct = isMuted ? 0 : volume * 100;
			ui.volBar.style.width = `${pct}%`;
			ui.volContainer.setAttribute("aria-valuenow", Math.round(pct).toString());
			if (isMuted || volume === 0) {
				ui.iconVolHigh.classList.add("hidden");
				ui.iconVolMute.classList.remove("hidden");
			} else {
				ui.iconVolHigh.classList.remove("hidden");
				ui.iconVolMute.classList.add("hidden");
			}
		}

		function updateTrackUI(track: any) {
			if (!track) return;
			ui.title.innerText = track.name;
			ui.title.title = track.name;
			ui.artist.innerText = track.artist;
			ui.artist.title = track.artist;

			if (track.pic) {
				ui.cover.classList.add("opacity-0");
				ui.cover.src = track.pic;
				ui.cover.alt = `${track.name} - ${track.artist}`;
			} else {
				ui.cover.src = "";
				ui.cover.classList.add("opacity-0");
				ui.cover.alt = cfg.i18n.noCover;
			}

			// Reset cover rotation
			ui.cover.classList.remove("animate-spin-slow");
			void ui.cover.offsetWidth;
			ui.cover.classList.add("animate-spin-slow");
			ui.cover.style.animationPlayState = "paused";

			// Reset progress
			ui.progressBar.style.width = "0%";
			ui.progressThumb.style.left = "0%";
			ui.progressContainer.setAttribute("aria-valuenow", "0");
			ui.currentTime.innerText = "0:00";
			ui.totalTime.innerText = "0:00";
		}

		// ── Virtual scroll helpers (absolute-position based) ──────
		const PRIMARY_COLOR =
			getComputedStyle(document.documentElement)
				.getPropertyValue("--primary")
				.trim() || "#6366f1";

		function vsApplyActiveStyle(el: HTMLElement, isActive: boolean) {
			const overlay = el.querySelector(".item-active-overlay");
			const title = el.querySelector(".item-title");
			const eqBars = el.querySelector(".eq-bars");
			const playIcon = el.querySelector(".eq-play-icon");
			const isPlaying = mgr.getState().isPlaying;
			if (isActive) {
				el.classList.add("bg-neutral-100", "dark:bg-white/10");
				el.setAttribute("aria-current", "true");
				overlay.classList.remove("hidden");
				overlay.classList.add("flex");
				title.style.color = PRIMARY_COLOR;
				if (isPlaying) {
					eqBars.classList.remove("hidden");
					eqBars.classList.add("flex");
					playIcon.classList.add("hidden");
				} else {
					eqBars.classList.add("hidden");
					eqBars.classList.remove("flex");
					playIcon.classList.remove("hidden");
				}
			} else {
				el.classList.remove("bg-neutral-100", "dark:bg-white/10");
				el.removeAttribute("aria-current");
				overlay.classList.add("hidden");
				overlay.classList.remove("flex");
				title.style.color = "";
			}
		}

		function vsCreateItemEl(idx: number) {
			const vs = local.vs;
			const track = vs.playlist[idx];
			const clone = ui.itemTemplate.content.cloneNode(true);
			const itemEl = clone.querySelector(".playlist-item");
			const img = clone.querySelector(".item-cover");
			const title = clone.querySelector(".item-title");
			const artist = clone.querySelector(".item-artist");

			img.src = track.pic || "";
			img.alt = `${track.name} - ${track.artist}`;
			title.innerText = track.name;
			artist.innerText = track.artist;

			itemEl.dataset.index = idx;
			itemEl.setAttribute("role", "option");
			itemEl.setAttribute("aria-label", `${track.name} - ${track.artist}`);
			itemEl.onclick = () => {
				mgr.playTrackByIndex(idx);
			};

			// Absolute positioning for virtual scroll
			itemEl.style.position = "absolute";
			itemEl.style.left = "0";
			itemEl.style.right = "0";
			itemEl.style.top = `${idx * ITEM_H}px`;
			itemEl.style.height = `${ITEM_H}px`;

			if (idx === vs.currentIndex) {
				vsApplyActiveStyle(itemEl, true);
			}
			return clone;
		}

		function vsCommitRange() {
			const vs = local.vs;
			if (vs.playlist.length === 0 || !vs.drawerOpen) return;

			const container = ui.playlistContainer;
			const scrollTop = container.scrollTop;
			const viewHeight = container.clientHeight;
			const start = Math.max(0, Math.floor(scrollTop / ITEM_H) - OVERSCAN);
			const end = Math.min(
				vs.playlist.length,
				Math.ceil((scrollTop + viewHeight) / ITEM_H) + OVERSCAN,
			);

			if (start === vs.renderedStart && end === vs.renderedEnd) return;

			if (vs.renderedStart === -1) {
				// First render: batch via fragment
				const frag = document.createDocumentFragment();
				for (let i = start; i < end; i++) {
					frag.appendChild(vsCreateItemEl(i));
				}
				container.appendChild(frag);
			} else {
				// Incremental: remove out-of-range, add new items
				const oldEls = vs.renderedEls;
				for (let ri = vs.renderedStart; ri < vs.renderedEnd; ri++) {
					if (ri < start || ri >= end) {
						if (oldEls[ri]) {
							oldEls[ri].remove();
							delete oldEls[ri];
						}
					}
				}
				for (let ai = start; ai < end; ai++) {
					if (!oldEls[ai]) {
						const newEl = vsCreateItemEl(ai);
						let inserted = false;
						for (let ni = ai + 1; ni < end; ni++) {
							if (oldEls[ni]) {
								container.insertBefore(newEl, oldEls[ni]);
								inserted = true;
								break;
							}
						}
						if (!inserted) container.appendChild(newEl);
						oldEls[ai] = newEl;
					}
				}
			}

			// Rebuild reference map
			vs.renderedEls = {};
			const children = container.children;
			for (let ci = 0; ci < children.length; ci++) {
				const idx = Number.parseInt(children[ci].dataset.index, 10);
				if (!Number.isNaN(idx)) vs.renderedEls[idx] = children[ci];
			}

			vs.renderedStart = start;
			vs.renderedEnd = end;
		}

		function vsRequestUpdate() {
			const vs = local.vs;
			if (vs.scrollRaf) return;
			vs.scrollRaf = requestAnimationFrame(() => {
				vs.scrollRaf = 0;
				vsCommitRange();
			});
		}

		function vsSetContainerHeight() {
			ui.playlistContainer.style.height = `${local.vs.playlist.length * ITEM_H}px`;
		}

		function renderPlaylist(playlist: any[], currentIndex: number) {
			const vs = local.vs;
			vs.playlist = playlist;
			vs.currentIndex = currentIndex;
			vs.renderedStart = -1;
			vs.renderedEnd = -1;
			vs.renderedEls = {};
			vs.drawerOpen = ui.playlistDrawer.style.gridTemplateRows === "1fr";
			ui.playlistContainer.innerHTML = "";
			if (vs.drawerOpen) {
				vsSetContainerHeight();
				vsCommitRange();
			}
		}

		function updatePlaylistActiveUI(currentIndex: number) {
			const vs = local.vs;
			const oldIndex = vs.currentIndex;
			vs.currentIndex = currentIndex;

			if (vs.renderedEls[oldIndex]) {
				vsApplyActiveStyle(vs.renderedEls[oldIndex], false);
			}

			if (currentIndex >= 0 && currentIndex < vs.playlist.length) {
				if (currentIndex < vs.renderedStart || currentIndex >= vs.renderedEnd) {
					ui.playlistContainer.scrollTop = currentIndex * ITEM_H;
					vsCommitRange();
				}
				if (vs.renderedEls[currentIndex]) {
					vsApplyActiveStyle(vs.renderedEls[currentIndex], true);
				}
			}
		}

		function renderLyricsUI(lyrics: any[], status: string) {
			local.currentLrcIndex = -1;
			ui.lrcContainer.innerHTML = "";
			if (status === "loading") {
				ui.lrcContainer.innerHTML =
					'<div class="text-neutral-400 text-sm py-10">' +
					cfg.i18n.loadingLyrics +
					"</div>";
				return;
			}
			if (status === "failed") {
				ui.lrcContainer.innerHTML =
					'<div class="text-neutral-400 text-sm py-10">' +
					cfg.i18n.failedLyrics +
					"</div>";
				return;
			}
			if (!lyrics || lyrics.length === 0) {
				ui.lrcContainer.innerHTML =
					'<div class="text-neutral-400 text-sm py-10" role="option">' +
					cfg.i18n.noLyrics +
					"</div>";
				return;
			}
			lyrics.forEach((line, index) => {
				const lineEl = document.createElement("div");
				lineEl.className =
					"lrc-line transition-all duration-300 text-sm text-neutral-400 py-1 cursor-pointer hover:text-(--primary)";
				lineEl.innerText = line.text;
				lineEl.dataset.index = index;
				lineEl.setAttribute("role", "option");
				lineEl.setAttribute("aria-label", line.text);
				lineEl.onclick = () => {
					mgr.seekToTime(line.time);
				};
				ui.lrcContainer.appendChild(lineEl);
			});
		}

		function updateLrcHighlight(index: number) {
			if (index === local.currentLrcIndex) return;
			local.currentLrcIndex = index;

			const lines = ui.lrcContainer.querySelectorAll(".lrc-line");
			lines.forEach((line: HTMLElement, i: number) => {
				if (i === index) {
					line.classList.add("text-(--primary)", "font-bold", "text-base");
					line.classList.remove("text-neutral-400", "text-sm");
				} else {
					line.classList.remove("text-(--primary)", "font-bold", "text-base");
					line.classList.add("text-neutral-400", "text-sm");
				}
			});

			// Auto-scroll unless user is scrolling
			if (index !== -1 && !local.isUserScrolling) {
				const line = ui.lrcContainer.querySelector(
					`.lrc-line[data-index="${index}"]`,
				);
				if (line) {
					const containerHeight = ui.lrcContainer.clientHeight;
					const lineOffset = line.offsetTop;
					const lineHeight = line.offsetHeight;
					const targetScroll =
						lineOffset - containerHeight / 2 + lineHeight / 2;
					ui.lrcContainer.scrollTo({ top: targetScroll, behavior: "smooth" });
				}
			}
		}

		// ── Full sync from manager state (for late-mount) ────────
		function syncAll() {
			const s = mgr.getState();
			if (!s.initialized) return;

			// Loading off
			setLoading(false);

			if (s.playlist.length === 0) {
				ui.title.innerText = s.error || cfg.i18n.noSongs;
				return;
			}

			renderPlaylist(s.playlist, s.currentIndex);
			if (s.track) updateTrackUI(s.track);
			updatePlayStateUI(s.isPlaying);
			updateModeUI(s.playMode);
			updateVolumeUI(s.volume, s.isMuted);

			// Progress
			if (s.duration > 0) {
				ui.progressBar.style.width = `${s.progress}%`;
				ui.progressThumb.style.left = `${s.progress}%`;
				ui.progressContainer.setAttribute(
					"aria-valuenow",
					Math.round(s.progress).toString(),
				);
				ui.currentTime.innerText = s.currentTimeStr;
				ui.totalTime.innerText = s.durationStr;
			}

			// Lyrics
			renderLyricsUI(s.lyrics, s.lyrics.length > 0 ? "loaded" : "none");
			if (s.currentLrcIndex >= 0) updateLrcHighlight(s.currentLrcIndex);

			// Cover image: if already set, show it
			if (
				s.track?.pic &&
				ui.cover.src &&
				ui.cover.complete &&
				ui.cover.naturalWidth > 0
			) {
				ui.cover.classList.remove("opacity-0");
			}
			// Update cover animation state to match play state
			ui.cover.style.animationPlayState = s.isPlaying ? "running" : "paused";
		}

		// ── Event listeners (fm:* from manager) ──────────────────
		const handlers: Record<string, EventListener> = {};

		function on(name: string, fn: EventListener) {
			handlers[name] = fn;
			window.addEventListener(name, fn);
		}

		on("fm:init", (e: any) => {
			const d = e.detail;
			setLoading(false);
			if (d.playlist.length > 0) {
				renderPlaylist(d.playlist, 0);
				updateModeUI(d.playMode);
				updateVolumeUI(d.volume, d.isMuted);
			} else {
				ui.title.innerText = cfg.i18n.noSongs;
			}
		});

		on("fm:track", (e: any) => {
			const d = e.detail;
			updateTrackUI(d.track);
			updatePlaylistActiveUI(d.index);
		});

		on("fm:play-state", (e: any) => {
			updatePlayStateUI(e.detail.isPlaying);
		});

		on("fm:time", (e: any) => {
			const d = e.detail;
			ui.progressBar.style.width = `${d.progress}%`;
			ui.progressThumb.style.left = `${d.progress}%`;
			ui.progressContainer.setAttribute(
				"aria-valuenow",
				Math.round(d.progress).toString(),
			);
			ui.currentTime.innerText = d.currentTimeStr;
			ui.totalTime.innerText = d.durationStr;
		});

		on("fm:volume", (e: any) => {
			updateVolumeUI(e.detail.volume, e.detail.isMuted);
		});

		on("fm:mode", (e: any) => {
			updateModeUI(e.detail.playMode);
		});

		on("fm:lyrics", (e: any) => {
			renderLyricsUI(e.detail.lyrics, e.detail.status);
		});

		on("fm:lrc-index", (e: any) => {
			updateLrcHighlight(e.detail.index);
		});

		on("fm:error", (e: any) => {
			ui.title.innerText = e.detail.message || cfg.i18n.error;
		});

		// ── Button click delegates ───────────────────────────────
		ui.btnPlay.addEventListener("click", () => {
			mgr.togglePlay();
		});
		ui.btnNext.addEventListener("click", () => {
			mgr.playNext();
		});
		ui.btnPrev.addEventListener("click", () => {
			mgr.playPrev();
		});
		ui.btnRepeat.addEventListener("click", () => {
			mgr.cyclePlayMode();
		});
		ui.btnMute.addEventListener("click", () => {
			mgr.toggleMute();
		});

		ui.volContainer.addEventListener("click", (e: MouseEvent) => {
			const rect = ui.volContainer.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const val = Math.max(0, Math.min(1, x / rect.width));
			mgr.setVolume(val);
		});

		ui.progressContainer.addEventListener("click", (e: MouseEvent) => {
			const rect = ui.progressContainer.getBoundingClientRect();
			const clickX = e.clientX - rect.left;
			const percent = Math.min(Math.max(clickX / rect.width, 0), 1);
			mgr.seek(percent);
		});

		// ── Drawer logic (local state) ───────────────────────────
		ui.btnLrc.addEventListener("click", () => {
			const isOpen = ui.lrcDrawer.style.gridTemplateRows === "1fr";
			if (isOpen) {
				ui.lrcDrawer.style.gridTemplateRows = "0fr";
				ui.lrcDrawer.classList.remove("opacity-100");
				ui.lrcDrawer.classList.add("opacity-0");
				ui.btnLrc.classList.remove("text-(--primary)");
				ui.btnLrc.classList.add("text-neutral-400");
				ui.iconLrcOn.classList.add("hidden");
				ui.iconLrcOff.classList.remove("hidden");
			} else {
				// Close playlist if open
				ui.playlistDrawer.style.gridTemplateRows = "0fr";
				ui.playlistDrawer.classList.remove("opacity-100");
				ui.playlistDrawer.classList.add("opacity-0");
				ui.btnDrawer.classList.remove("text-(--primary)");
				ui.btnDrawer.classList.add("text-neutral-400");

				ui.lrcDrawer.style.gridTemplateRows = "1fr";
				ui.lrcDrawer.classList.add("opacity-100");
				ui.lrcDrawer.classList.remove("opacity-0");
				ui.btnLrc.classList.add("text-(--primary)");
				ui.btnLrc.classList.remove("text-neutral-400");
				ui.iconLrcOn.classList.remove("hidden");
				ui.iconLrcOff.classList.add("hidden");
			}
		});

		ui.btnDrawer.addEventListener("click", () => {
			const isOpen = ui.playlistDrawer.style.gridTemplateRows === "1fr";
			if (isOpen) {
				ui.playlistDrawer.style.gridTemplateRows = "0fr";
				ui.playlistDrawer.classList.remove("opacity-100");
				ui.playlistDrawer.classList.add("opacity-0");
				ui.btnDrawer.classList.add("text-neutral-400");
				ui.btnDrawer.classList.remove("text-(--primary)");
				local.vs.drawerOpen = false;
			} else {
				// Close lyrics if open
				ui.lrcDrawer.style.gridTemplateRows = "0fr";
				ui.lrcDrawer.classList.remove("opacity-100");
				ui.lrcDrawer.classList.add("opacity-0");
				ui.btnLrc.classList.remove("text-(--primary)");
				ui.btnLrc.classList.add("text-neutral-400");
				ui.iconLrcOn.classList.add("hidden");
				ui.iconLrcOff.classList.remove("hidden");

				ui.playlistDrawer.style.gridTemplateRows = "1fr";
				ui.playlistDrawer.classList.add("opacity-100");
				ui.playlistDrawer.classList.remove("opacity-0");
				ui.btnDrawer.classList.remove("text-neutral-400");
				ui.btnDrawer.classList.add("text-(--primary)");
				local.vs.drawerOpen = true;

				// Render playlist after drawer transition settles
				if (local.vs.playlist.length > 0) {
					requestAnimationFrame(() => {
						vsSetContainerHeight();
						vsCommitRange();
					});
				}
			}
		});

		// ── Playlist virtual scroll listener ──────────────────────
		ui.playlistContainer.addEventListener("scroll", () => {
			vsRequestUpdate();
		});

		// ── Lyrics user scroll detection ─────────────────────────
		function resetScrollTimeout() {
			clearTimeout(local.scrollTimeout);
			local.scrollTimeout = setTimeout(() => {
				local.isUserScrolling = false;
				// Snap back to current lyric
				const s = mgr.getState();
				if (s.currentLrcIndex >= 0) {
					const line = ui.lrcContainer.querySelector(
						`.lrc-line[data-index="${s.currentLrcIndex}"]`,
					);
					if (line) {
						const containerHeight = ui.lrcContainer.clientHeight;
						const lineOffset = line.offsetTop;
						const lineHeight = line.offsetHeight;
						const targetScroll =
							lineOffset - containerHeight / 2 + lineHeight / 2;
						ui.lrcContainer.scrollTo({ top: targetScroll, behavior: "auto" });
					}
				}
			}, 3000);
		}

		ui.lrcContainer.addEventListener("wheel", () => {
			local.isUserScrolling = true;
			resetScrollTimeout();
		});
		ui.lrcContainer.addEventListener("touchstart", () => {
			local.isUserScrolling = true;
			resetScrollTimeout();
		});

		// ── Cover image events ───────────────────────────────────
		ui.cover.addEventListener("load", () => {
			ui.cover.classList.remove("opacity-0");
		});
		ui.cover.addEventListener("error", () => {
			ui.cover.classList.add("opacity-0");
		});

		// ── Cleanup on DOM removal ───────────────────────────────
		const observer = new MutationObserver((mutations) => {
			for (let i = 0; i < mutations.length; i++) {
				const removed = mutations[i].removedNodes;
				for (let j = 0; j < removed.length; j++) {
					if (removed[j] === widget || removed[j].contains?.(widget)) {
						// Widget removed from DOM – clean up event listeners
						Object.keys(handlers).forEach((name) => {
							window.removeEventListener(name, handlers[name]);
						});
						observer.disconnect();
						clearTimeout(local.scrollTimeout);
						return;
					}
				}
			}
		});
		if (widget.parentNode) {
			observer.observe(widget.parentNode, { childList: true });
		}

		// ── Init: either sync existing state or trigger init ─────
		const currentState = mgr.getState();
		if (currentState.initialized) {
			// Manager already initialized (late mount) – sync all UI
			syncAll();
		} else {
			// First widget to mount – show loading and trigger init
			setLoading(true);
			scheduleInit();
		}
	}

	// 每个 widget 只初始化一次。导航栏那份 widget 在 swup 容器之外、DOM 不会被
	// 替换；侧栏 widget 会被整体替换，新 DOM 上没有这个标记，因此 astro:page-load
	// 触发的重新扫描仍会正常初始化它（旧实例由内部的 MutationObserver 清理）。
	function initAll() {
		const widgets = document.querySelectorAll(".music-player-widget");
		for (let i = 0; i < widgets.length; i++) {
			const w = widgets[i] as HTMLElement;
			if (w.dataset.musicInit === "1") continue;
			w.dataset.musicInit = "1";
			initWidget(w);
		}
	}

	initAll();
	document.addEventListener("astro:page-load", initAll);
})();
