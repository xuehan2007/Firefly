import { computed, ref } from "vue";

/**
 * 相册管理模块（从 dashboard.astro 拆分）
 *
 * 将相册相关的响应式状态、计算属性与操作函数抽离为独立 composable，
 * 模板字符串通过 buildGalleryTemplate() 单独导出。
 *
 * 依赖通过 ctx 注入，避免与 dashboard.astro 内其它模块形成循环引用。
 */

export interface GalleryCtx {
	page: { value: string };
	api: (url: string, options?: RequestInit) => Promise<any>;
	showToast: (message: string, type?: string) => void;
	token: { value: string };
	logout: () => void;
	gifFirstFrame: (buf: ArrayBuffer, maxW?: number) => Promise<string | null>;
	isGifFile: (file: File) => boolean;
	compressGif: (file: File, opts: any) => Promise<{ file: File; originalSize: number; size: number }>;
	GIF_UPLOAD_LIMIT: number;
}

// 后台预览统一走 raw.githubusercontent（跟 master 分支实时同步，不必等重新部署）
const GALLERY_RAW_BASE = "https://raw.githubusercontent.com/xuehan2007/Firefly/master/public/gallery/";

export function useGallery(ctx: GalleryCtx) {
	const galleryList = ref<any[]>([]);
	const gallerySha = ref("");
	const gallerySaving = ref(false);
	const galleryAlbum = ref(""); // 已进入的相册 id，空表示相册列表视图
	const galleryPhotos = ref<any[]>([]); // 当前相册的照片
	const galleryPhotosLoading = ref(false);
	const galleryPhotoQuery = ref(""); // 照片网格：文件名搜索
	const galleryPhotoSort = ref("name"); // 照片网格排序：name | size | newest
	const gallerySummary = ref<Record<string, any>>({}); // 相册 id -> { count, cover, coverRawUrl }
	const gallerySelected = ref<string[]>([]); // 多选的照片文件名
	const galleryUploading = ref(false);
	const galleryUploadStatus = ref("");
	const galleryEditingIdx = ref(-1); // 正在编辑元数据的相册下标
	const galleryPreview = ref<{ url: string; name: string } | null>(null); // 大图预览浮层
	// GIF 静态首帧缩略图缓存：仓库路径 -> dataURL（跨相册复用）
	const galleryThumbCache: Record<string, string> = {};

	function galleryFmtSize(bytes: number) {
		return bytes >= 1048576 ? (bytes / 1048576).toFixed(1) + "MB" : Math.round(bytes / 1024) + "KB";
	}
	function galleryRawUrl(albumId: string, fileOrPath: string) {
		if (/^https?:\/\//i.test(fileOrPath)) return fileOrPath;
		return GALLERY_RAW_BASE + albumId + "/" + String(fileOrPath).split("/").pop();
	}
	const galleryAlbumObj = computed(function () {
		const id = galleryAlbum.value;
		if (!id) return null;
		for (let i = 0; i < galleryList.value.length; i++) {
			if (galleryList.value[i].id === id) return galleryList.value[i];
		}
		return null;
	});
	const galleryAlbumName = computed(function () {
		const o = galleryAlbumObj.value;
		return o ? o.name || o.id : galleryAlbum.value;
	});
	// 当前相册封面在 gallery.json cover 里对应的文件名（用于打「封面」角标）
	const galleryAlbumCover = computed(function () {
		const o = galleryAlbumObj.value;
		if (!o || !o.cover) return "";
		const m = /\/([^/]+)$/.exec(o.cover);
		return m ? m[1] : o.cover;
	});
	// 照片网格的展示列表：先按文件名过滤，再按所选规则排序
	const galleryPhotosView = computed(function () {
		const q = galleryPhotoQuery.value.trim().toLowerCase();
		let list = galleryPhotos.value.filter(function (p) {
			return !q || String(p.name).toLowerCase().indexOf(q) > -1;
		});
		const sort = galleryPhotoSort.value;
		list = list.slice().sort(function (a, b) {
			if (sort === "size") return (b.size || 0) - (a.size || 0);
			// 文件名以时间戳开头，倒序即最新在前
			if (sort === "newest") return String(b.name).localeCompare(String(a.name));
			return String(a.name).localeCompare(String(b.name));
		});
		return list;
	});
	const galleryAllSelected = computed(function () {
		const view = galleryPhotosView.value;
		return view.length > 0 && view.every(function (p) { return gallerySelected.value.indexOf(p.name) > -1; });
	});
	function galleryCountOf(alb: any) {
		const s = gallerySummary.value[alb.id];
		return s ? s.count : 0;
	}
	function galleryCoverOf(alb: any) {
		if (alb.cover) return galleryRawUrl(alb.id, alb.cover);
		const s = gallerySummary.value[alb.id];
		return s && s.coverRawUrl ? s.coverRawUrl : "";
	}
	function loadGallery() {
		ctx.page.value = "gallery";
		galleryAlbum.value = "";
		galleryPhotos.value = [];
		gallerySelected.value = [];
		galleryEditingIdx.value = -1;
		galleryPreview.value = null;
		ctx.api("/api/admin/data/gallery").then(function (d) {
			gallerySha.value = d.sha;
			galleryList.value = d.data || [];
		}).catch(function (e) { ctx.showToast(e.message, "error"); });
		refreshGallerySummary();
	}
	function refreshGallerySummary() {
		return ctx.api("/api/admin/gallery").then(function (d) {
			gallerySummary.value = d.albums || {};
		}).catch(function (e) { ctx.showToast(e.message, "error"); });
	}
	function addGallery() {
		galleryList.value.push({ id: "", name: "", description: "", location: "", date: "", tags: [] });
		galleryEditingIdx.value = galleryList.value.length - 1;
	}
	function removeGallery(i: number) {
		const alb = Object.assign({}, galleryList.value[i] || {});
		const id = alb.id || "";
		const count = id ? galleryCountOf(alb) : 0;
		const label = alb.name || id || "这个相册";
		const msg = count > 0
			? "确定删除相册「" + label + "」？\n\n⚠️ 该相册下的 " + count + " 张照片文件会一并从 GitHub 仓库删除，无法恢复。\n相册条目也会同时移除并立即保存。"
			: "确定删除相册「" + label + "」？\n照片文件不会被删除，只是不再出现在相册列表里。";
		if (!confirm(msg)) return;

		galleryList.value.splice(i, 1);
		if (galleryEditingIdx.value === i) galleryEditingIdx.value = -1;
		else if (galleryEditingIdx.value > i) galleryEditingIdx.value--;

		let chain = Promise.resolve();
		if (id && count > 0) {
			ctx.showToast("正在删除照片文件…", "info");
			chain = ctx.api("/api/admin/gallery", { method: "DELETE", body: JSON.stringify({ album: id, all: true }) })
				.then(function () { return refreshGallerySummary(); });
		}
		chain
			.then(function () {
				if (galleryAlbum.value === id) { galleryAlbum.value = ""; galleryPhotos.value = []; gallerySelected.value = []; }
				return persistGalleryMeta(true, count > 0 ? "已删除相册及 " + count + " 张照片" : "已删除相册");
			})
			.then(function () { refreshGallerySummary(); })
			.catch(function (e) { ctx.showToast(e.message, "error"); });
	}
	function toggleGalleryEdit(i: number) {
		galleryEditingIdx.value = galleryEditingIdx.value === i ? -1 : i;
	}
	function galleryToData() {
		return galleryList.value.map(function (alb) {
			const o = Object.assign({}, alb);
			if (typeof o.tags === "string") o.tags = o.tags.split(",").map(function (t: string) { return t.trim(); }).filter(Boolean);
			if (!o.tags) o.tags = [];
			return o;
		});
	}
	// 保存相册元数据；successMsg 为空且 silent=true 时不弹提示
	function persistGalleryMeta(silent: boolean, successMsg?: string) {
		return ctx.api("/api/admin/data/gallery", {
			method: "PUT",
			body: JSON.stringify({ data: galleryToData(), sha: gallerySha.value }),
		}).then(function () {
			// 提交后仓库 sha 变了，重新拉一次，否则后续保存会因 sha 过期失败
			return ctx.api("/api/admin/data/gallery").then(function (d) {
				gallerySha.value = d.sha;
				galleryList.value = d.data || [];
			});
		}).then(function () {
			if (successMsg) ctx.showToast(successMsg, "success");
			else if (!silent) ctx.showToast("保存成功！", "success");
		});
	}
	function saveGallery() {
		gallerySaving.value = true;
		persistGalleryMeta(false)
			.catch(function (e) { ctx.showToast(e.message, "error"); })
			.finally(function () { gallerySaving.value = false; });
	}
	function openGalleryAlbum(alb: any) {
		if (!alb.id) {
			ctx.showToast("这个相册还没设置 ID，点卡片右上角 ✎ 先填写 ID", "error");
			return;
		}
		galleryAlbum.value = alb.id;
		galleryEditingIdx.value = -1;
		gallerySelected.value = [];
		galleryPreview.value = null;
		galleryPhotoQuery.value = "";
		refreshGalleryAlbumPhotos();
	}
	function closeGalleryAlbum() {
		galleryAlbum.value = "";
		galleryPhotos.value = [];
		gallerySelected.value = [];
		galleryPreview.value = null;
		refreshGallerySummary();
	}
	function refreshGalleryAlbumPhotos() {
		if (!galleryAlbum.value) return Promise.resolve();
		galleryPhotosLoading.value = true;
		return ctx.api("/api/admin/gallery?album=" + galleryAlbum.value)
			.then(function (d) { setGalleryPhotos(d.photos || []); })
			.catch(function (e) { ctx.showToast(e.message, "error"); })
			.finally(function () { galleryPhotosLoading.value = false; });
	}
	// 非动图直接显示原图；动图先占位，随后补上静态首帧
	function setGalleryPhotos(photos: any[]) {
		galleryPhotos.value = photos.map(function (p) {
			p._thumb = p.isGif ? "" : p.rawUrl;
			return p;
		});
		loadGalleryThumbs();
	}
	// 生成动图静态首帧缩略图（并发 3，结果缓存到内存，切相册不重复解码）
	function loadGalleryThumbs() {
		const queue = galleryPhotos.value.filter(function (p) { return p.isGif; });
		let idx = 0;
		function next() {
			if (idx >= queue.length) return;
			const p = queue[idx++];
			const cached = galleryThumbCache[p.path];
			if (cached) { p._thumb = cached; next(); return; }
			fetch(p.rawUrl)
				.then(function (r) { return r.ok ? r.arrayBuffer() : null; })
				.then(function (buf) { return buf ? ctx.gifFirstFrame(buf, 480) : null; })
				.then(function (url) {
					if (url) { galleryThumbCache[p.path] = url; p._thumb = url; }
				})
				.catch(function () { /* 取不到首帧就保持占位，不影响其它照片 */ })
				.then(next);
		}
		for (let i = 0; i < 3; i++) next();
	}
	function toggleGalleryPhotoSelect(name: string) {
		const i = gallerySelected.value.indexOf(name);
		if (i > -1) gallerySelected.value.splice(i, 1);
		else gallerySelected.value.push(name);
	}
	function toggleSelectAllGalleryPhotos() {
		// 只针对当前筛选/排序可见的照片，避免选中被搜索条件藏起来的图
		if (galleryAllSelected.value) gallerySelected.value = [];
		else gallerySelected.value = galleryPhotosView.value.map(function (p) { return p.name; });
	}
	function openGalleryPreview(p: any) {
		galleryPreview.value = { url: p.rawUrl, name: p.name };
	}
	function setGalleryCover(p: any) {
		const o = galleryAlbumObj.value;
		if (!o) return;
		if (galleryAlbumCover.value === p.name) { ctx.showToast("这张已经是封面了", "info"); return; }
		o.cover = "/gallery/" + galleryAlbum.value + "/" + p.name;
		persistGalleryMeta(true, "已设为封面").catch(function (e) { ctx.showToast(e.message, "error"); });
	}
	function deleteGalleryPhoto(p: any) {
		if (!confirm("确定删除这张照片？\n" + p.name + "\n文件会从 GitHub 仓库移除，重新部署后前台生效。")) return;
		ctx.api("/api/admin/gallery", { method: "DELETE", body: JSON.stringify({ album: galleryAlbum.value, name: p.name }) })
			.then(function () {
				ctx.showToast("已删除，等重新部署后前台生效", "success");
				const o = galleryAlbumObj.value;
				if (o && galleryAlbumCover.value === p.name) {
					o.cover = "";
					return persistGalleryMeta(true);
				}
			})
			.then(function () { return refreshGalleryAlbumPhotos(); })
			.then(function () { return refreshGallerySummary(); })
			.catch(function (e) { ctx.showToast(e.message, "error"); });
	}
	function deleteSelectedGalleryPhotos() {
		const names = gallerySelected.value.slice();
		if (!names.length) return;
		if (!confirm("确定删除选中的 " + names.length + " 张照片？\n所有文件会合并成一次提交从 GitHub 仓库移除，重新部署后前台生效。")) return;
		galleryUploading.value = true;
		galleryUploadStatus.value = "🗑 批量删除 " + names.length + " 张…";
		// 后端用 Git Data API 把多张图片合并到一次提交，不再逐张删
		let deletedCount = 0;
		ctx.api("/api/admin/gallery", { method: "DELETE", body: JSON.stringify({ album: galleryAlbum.value, names: names }) })
			.then(function (d) {
				deletedCount = (d && typeof d.deleted === "number") ? d.deleted : names.length;
				gallerySelected.value = [];
				const o = galleryAlbumObj.value;
				const coverName = galleryAlbumCover.value;
				if (o && coverName && names.indexOf(coverName) > -1) {
					o.cover = "";
					return persistGalleryMeta(true);
				}
			})
			.then(function () { return refreshGalleryAlbumPhotos(); })
			.then(function () { return refreshGallerySummary(); })
			.then(function () { ctx.showToast("已删除 " + deletedCount + " 张（一次提交），等重新部署后前台生效", "success"); })
			.catch(function (e) { ctx.showToast(e.message, "error"); })
			.finally(function () { galleryUploading.value = false; galleryUploadStatus.value = ""; });
	}
	// multipart 上传：不能复用 api()，它写死了 JSON Content-Type
	function apiUpload(url: string, formData: FormData) {
		return fetch(url, {
			method: "POST",
			headers: { "Authorization": "Bearer " + ctx.token.value },
			body: formData,
		}).then(function (res) {
			return res.json().catch(function () { return {}; }).then(function (data) {
				if (res.status === 401) { ctx.logout(); ctx.showToast("登录已过期，请重新登录", "error"); }
				if (!res.ok) throw new Error(data.error || "上传失败 (" + res.status + ")");
				return data;
			});
		});
	}
	// 超过服务器请求体上限时：动图走 gifenc 重编码，其它图片降分辨率转 webp
	function prepareGalleryUpload(file: File) {
		if (ctx.isGifFile(file)) {
			return ctx.compressGif(file, {
				maxBytes: ctx.GIF_UPLOAD_LIMIT,
				onProgress: function (r: number) {
					galleryUploadStatus.value = "⚙️ 压缩动图 " + Math.round(r * 100) + "%：" + file.name;
				},
			}).then(function (r) {
				return { file: r.file, originalSize: r.originalSize, size: r.size };
			});
		}
		if (file.size <= ctx.GIF_UPLOAD_LIMIT) {
			return Promise.resolve({ file: file, originalSize: file.size, size: file.size });
		}
		return shrinkRasterImage(file).then(function (out) {
			return { file: out, originalSize: file.size, size: out.size };
		});
	}
	function shrinkRasterImage(file: File) {
		return new Promise<File>(function (resolve, reject) {
			const objUrl = URL.createObjectURL(file);
			const img = new Image();
			img.onload = function () {
				URL.revokeObjectURL(objUrl);
				let w = img.naturalWidth, h = img.naturalHeight;
				if (!w || !h) { reject(new Error("图片读取失败：" + file.name)); return; }
				const maxDim = 2560;
				if (Math.max(w, h) > maxDim) {
					const s = maxDim / Math.max(w, h);
					w = Math.max(1, Math.round(w * s));
					h = Math.max(1, Math.round(h * s));
				}
				const canvas = document.createElement("canvas");
				canvas.width = w; canvas.height = h;
				canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
				canvas.toBlob(function (blob) {
					if (!blob) { reject(new Error("图片压缩失败：" + file.name)); return; }
					// webp 保留透明通道，体积也比原图小很多
					resolve(new File([blob], String(file.name).replace(/\.[a-z0-9]+$/i, "") + ".webp", { type: "image/webp" }));
				}, "image/webp", 0.88);
			};
			img.onerror = function () {
				URL.revokeObjectURL(objUrl);
				reject(new Error("无法解析图片：" + file.name));
			};
			img.src = objUrl;
		});
	}
	function uploadGalleryPhotos(event: Event) {
		const files = Array.prototype.slice.call((event.target as HTMLInputElement).files || []);
		(event.target as HTMLInputElement).value = ""; // 允许再次选择同一批文件
		const album = galleryAlbum.value;
		if (!files.length || galleryUploading.value || !album) return;
		galleryUploading.value = true;
		let ok = 0, failed = 0;
		let chain = Promise.resolve();
		// 串行上传：每张都是独立一次 GitHub 提交，并行容易触发分支冲突
		files.forEach(function (f: File, i: number) {
			chain = chain.then(function () {
				galleryUploadStatus.value = "⏳ 准备 " + (i + 1) + "/" + files.length + "：" + f.name;
				return prepareGalleryUpload(f).then(function (out) {
					galleryUploadStatus.value = "⏳ 上传 " + (i + 1) + "/" + files.length + "：" + f.name +
						"（" + galleryFmtSize(out.originalSize) + " → " + galleryFmtSize(out.size) + "）";
					const fd = new FormData();
					fd.append("album", album);
					fd.append("file", out.file, out.file.name);
					return apiUpload("/api/admin/gallery", fd).then(function () { ok++; });
				});
			}).catch(function (e) {
				failed++;
				ctx.showToast((f.name || "文件") + "：" + e.message, "error");
			});
		});
		chain
			.then(function () {
				ctx.showToast("上传完成 " + ok + " 张" + (failed ? "，失败 " + failed + " 张" : "") +
					"，等重新部署后前台显示", "success");
				return refreshGalleryAlbumPhotos();
			})
			.then(function () { return refreshGallerySummary(); })
			.catch(function (e) { ctx.showToast(e.message, "error"); })
			.finally(function () { galleryUploading.value = false; galleryUploadStatus.value = ""; });
	}

	return {
		galleryList, gallerySha, gallerySaving, galleryAlbum, galleryPhotos, galleryPhotosLoading,
		galleryPhotoQuery, galleryPhotoSort, gallerySummary, gallerySelected, galleryUploading,
		galleryUploadStatus, galleryEditingIdx, galleryPreview,
		galleryAlbumObj, galleryAlbumName, galleryAlbumCover, galleryPhotosView, galleryAllSelected,
		galleryFmtSize, galleryRawUrl, galleryCountOf, galleryCoverOf,
		loadGallery, refreshGallerySummary, addGallery, removeGallery, toggleGalleryEdit,
		galleryToData, persistGalleryMeta, saveGallery, openGalleryAlbum, closeGalleryAlbum,
		refreshGalleryAlbumPhotos, setGalleryPhotos, loadGalleryThumbs,
		toggleGalleryPhotoSelect, toggleSelectAllGalleryPhotos, openGalleryPreview,
		setGalleryCover, deleteGalleryPhoto, deleteSelectedGalleryPhotos, uploadGalleryPhotos,
	};
}

/**
 * 相册管理页面的 Vue 模板字符串（从 dashboard.astro 的大模板中拆出）
 */
export function buildGalleryTemplate(): string {
	return (
		'<div v-if="page===\'gallery\'">' +
		/* ===== 相册列表：QQ 相册式卡片网格 ===== */
		'<div v-if="!galleryAlbum">' +
			'<div class="editor-toolbar">' +
				'<button class="btn" @click="addGallery">+ 添加相册</button>' +
				'<button class="btn btn-primary" @click="saveGallery" :disabled="gallerySaving">{{ gallerySaving ? "保存中..." : "保存相册" }}</button>' +
				'<button class="btn" @click="refreshGallerySummary">↻ 刷新张数</button>' +
			'</div>' +
			'<div class="mica-card" style="padding:16px;margin-bottom:16px">' +
				'<p style="color:var(--text-secondary);font-size:13px">点卡片进入相册管理照片。照片存放在仓库 public/gallery/相册ID/ 下，手机端和电脑端都能批量上传图片与动图；GIF 超过 4.2MB 会自动压缩重编码，不用手动处理。后台网格显示静态首帧，点开才播放动图。</p>' +
				'<p style="color:var(--text-muted);font-size:12px;margin-top:8px">⚠️ 照片提交到 GitHub 后要等网站重新部署，前台才会显示；后台这里用的是仓库即时预览。</p>' +
			'</div>' +
			'<div class="gal-album-grid">' +
				'<div v-for="(alb, i) in galleryList" :key="i" class="gal-album-card" @click="openGalleryAlbum(alb)">' +
					'<div class="gal-album-cover">' +
						'<img v-if="galleryCoverOf(alb)" :src="galleryCoverOf(alb)" loading="lazy" alt="" />' +
						'<span v-else class="gal-album-empty">{{ (alb.name || alb.id || \'?\').charAt(0) }}</span>' +
						'<span class="gal-album-count">{{ galleryCountOf(alb) }} 张</span>' +
						'<span class="gal-album-edit" @click.stop="toggleGalleryEdit(i)" title="编辑相册信息">✎</span>' +
					'</div>' +
					'<div class="gal-album-meta">' +
						'<div class="gal-album-name">{{ alb.name || \'未命名相册\' }}</div>' +
						'<div class="gal-album-id">{{ alb.id || \'未设置 ID（读不到照片）\' }}</div>' +
					'</div>' +
				'</div>' +
			'</div>' +
			'<div v-if="galleryList.length===0" style="text-align:center;color:var(--text-secondary);padding:40px">暂无相册，点上方「添加相册」开始</div>' +
			'<div v-if="galleryEditingIdx > -1 && galleryList[galleryEditingIdx]" class="mica-card" style="padding:20px;margin-top:18px">' +
				'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">' +
					'<span style="font-weight:600">编辑相册信息</span>' +
					'<button class="btn btn-sm" @click="galleryEditingIdx = -1">收起</button>' +
				'</div>' +
				'<div class="gallery-grid-4">' +
					'<input v-model="galleryList[galleryEditingIdx].id" placeholder="相册 ID（英文/数字）" />' +
					'<input v-model="galleryList[galleryEditingIdx].name" placeholder="相册名称" />' +
					'<input v-model="galleryList[galleryEditingIdx].location" placeholder="地点" />' +
					'<input v-model="galleryList[galleryEditingIdx].date" type="date" />' +
				'</div>' +
				'<div class="gallery-grid-3">' +
					'<input v-model="galleryList[galleryEditingIdx].description" placeholder="描述" />' +
					'<input v-model="galleryList[galleryEditingIdx].tags" placeholder="标签（逗号分隔）" />' +
					'<input v-model="galleryList[galleryEditingIdx].password" placeholder="密码（可选）" />' +
				'</div>' +
				'<button class="btn btn-sm btn-danger" @click="removeGallery(galleryEditingIdx)">删除该相册</button>' +
			'</div>' +
		'</div>' +

		/* ===== 单个相册：照片网格 ===== */
		'<div v-else>' +
			'<div class="editor-toolbar">' +
				'<button class="btn" @click="closeGalleryAlbum">← 相册列表</button>' +
				'<label class="btn btn-primary" :style="{opacity: galleryUploading ? 0.6 : 1, pointerEvents: galleryUploading ? \'none\' : \'auto\'}">📷 上传照片<input type="file" accept="image/*,.gif" multiple style="display:none" @change="uploadGalleryPhotos($event)" /></label>' +
				'<button class="btn" v-if="galleryPhotos.length" @click="toggleSelectAllGalleryPhotos">{{ galleryAllSelected ? \'取消全选\' : \'全选\' }}</button>' +
				'<button class="btn btn-danger" v-if="gallerySelected.length" @click="deleteSelectedGalleryPhotos">删除选中 {{ gallerySelected.length }} 张</button>' +
				'<input v-if="galleryPhotos.length" v-model="galleryPhotoQuery" placeholder="🔍 搜索文件名..." style="flex:1;min-width:120px;padding:8px 12px;border-radius:8px;border:1px solid var(--mica-border-dark);background:var(--input-bg);color:#fff;font-size:13px" />' +
				'<select v-if="galleryPhotos.length" v-model="galleryPhotoSort" style="padding:8px;border-radius:8px;border:1px solid var(--mica-border-dark);background:var(--input-bg);color:#fff;font-size:13px"><option value="name">按名称</option><option value="size">按大小</option><option value="newest">按最新</option></select>' +
			'</div>' +
			'<div class="mica-card" style="padding:16px;margin-bottom:16px">' +
				'<div style="font-weight:600;margin-bottom:6px">{{ galleryAlbumName }}</div>' +
				'<div style="color:var(--text-muted);font-size:12px">public/gallery/{{ galleryAlbum }}/ · 共 {{ galleryPhotos.length }} 张<template v-if="galleryPhotoQuery">（匹配 {{ galleryPhotosView.length }} 张）</template></div>' +
				'<div v-if="galleryUploadStatus" style="color:var(--accent);font-size:13px;margin-top:8px">{{ galleryUploadStatus }}</div>' +
			'</div>' +
			'<div v-if="galleryPhotosLoading" style="text-align:center;color:var(--text-secondary);padding:36px">载入照片中…</div>' +
			'<div v-else-if="galleryPhotos.length===0" style="text-align:center;color:var(--text-secondary);padding:36px">这个相册还没有照片，点上方「上传照片」添加</div>' +
			'<div v-else-if="galleryPhotosView.length===0" style="text-align:center;color:var(--text-secondary);padding:36px">没有匹配「{{ galleryPhotoQuery }}」的照片</div>' +
			'<div v-else class="gal-photo-grid">' +
				'<div v-for="(p, i) in galleryPhotosView" :key="p.name" class="gal-photo" :class="{selected: gallerySelected.indexOf(p.name) > -1}" @click="openGalleryPreview(p)">' +
					'<img v-if="p._thumb" :src="p._thumb" loading="lazy" alt="" @load="$event.target.classList.add(\'loaded\')" />' +
					'<span v-else class="gal-photo-load">…</span>' +
					'<span v-if="p.isGif" class="gal-gif-badge">GIF</span>' +
					'<span v-if="galleryAlbumCover === p.name" class="gal-cover-tag">封面</span>' +
					'<span class="gal-check" :class="{on: gallerySelected.indexOf(p.name) > -1}" @click.stop="toggleGalleryPhotoSelect(p.name)">{{ gallerySelected.indexOf(p.name) > -1 ? \'✓\' : \'\' }}</span>' +
					'<div class="gal-photo-actions">' +
						'<button class="gal-act" @click.stop="setGalleryCover(p)">设为封面</button>' +
						'<button class="gal-act gal-act-danger" @click.stop="deleteGalleryPhoto(p)">删除</button>' +
					'</div>' +
				'</div>' +
			'</div>' +
		'</div>' +

		/* ===== 大图预览浮层（动图在这里播放）===== */
		'<div v-if="galleryPreview" class="gal-preview" @click="galleryPreview = null">' +
			'<img :src="galleryPreview.url" alt="" @click.stop />' +
			'<div class="gal-preview-bar" @click.stop>' +
				'<span class="gal-preview-name">{{ galleryPreview.name }}</span>' +
				'<button class="btn btn-sm" @click="galleryPreview = null">关闭</button>' +
			'</div>' +
		'</div>' +
		'</div>'
	);
}
