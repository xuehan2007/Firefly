// @ts-nocheck
// biome-ignore-all lint/suspicious/noExplicitAny: 从 is:inline 脚本原样迁移的 DOM 渲染代码，类型检查整体关闭，有意保留 any
// 侧边栏日历小组件。逻辑全部在本模块（外部 hash 文件，长期缓存）；
// 软导航后侧栏 DOM 会被 swup 替换，通过 astro:page-load 事件重新渲染新 DOM。
// （旧版用 is:inline 脚本 + define:vars，每次导航都要随 HTML 重发 12KB 代码。）
import { siteConfig } from "@/config/siteConfig";
import I18nKey from "@/i18n/i18nKey";
import { i18n } from "@/i18n/translation";
import { url } from "@/utils/url-utils";

const monthNames = [
	i18n(I18nKey.calendarJanuary),
	i18n(I18nKey.calendarFebruary),
	i18n(I18nKey.calendarMarch),
	i18n(I18nKey.calendarApril),
	i18n(I18nKey.calendarMay),
	i18n(I18nKey.calendarJune),
	i18n(I18nKey.calendarJuly),
	i18n(I18nKey.calendarAugust),
	i18n(I18nKey.calendarSeptember),
	i18n(I18nKey.calendarOctober),
	i18n(I18nKey.calendarNovember),
	i18n(I18nKey.calendarDecember),
];

const yearText = i18n(I18nKey.year);
const heatmapWeekTemplate = i18n(I18nKey.calendarHeatmapWeek);
const currentLang = siteConfig.lang || "en";
const calendarDataUrl = url("/api/allPostMeta.json");
const postUrlPrefix = url("/posts/");

// State variables
let displayYear = new Date().getFullYear();
let displayMonth = new Date().getMonth();
let currentView = "day"; // 'day' | 'month' | 'year'
let postDateMap: Record<string, any[]> = {};
let allPostsData: any[] = [];
let availableYears: number[] = [];

async function fetchData() {
	try {
		// 使用缓存避免 swup 导航时重复请求
		if (window.__allPostMetaCache) {
			allPostsData = window.__allPostMetaCache;
		} else {
			const response = await fetch(calendarDataUrl);
			allPostsData = await response.json();
			window.__allPostMetaCache = allPostsData;
		}

		// Reconstruct postDateMap and availableYears
		postDateMap = {};
		const yearsSet = new Set<number>();
		allPostsData.forEach((post) => {
			const date = new Date(post.published);
			const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
			if (!postDateMap[dateKey]) {
				postDateMap[dateKey] = [];
			}
			postDateMap[dateKey].push({
				id: post.id,
				title: post.title,
				published: post.published,
			});
			yearsSet.add(date.getFullYear());
		});

		availableYears = Array.from(yearsSet).sort((a, b) => b - a);

		renderCalendar();
	} catch (error) {
		console.error("Failed to fetch calendar data", error);
	}
}

function renderHeatmap() {
	const container = document.getElementById("heatmap-container");
	const monthsEl = document.getElementById("heatmap-months");
	const gridEl = document.getElementById("heatmap-grid");
	if (!container || !monthsEl || !gridEl) return;

	// Show heatmap only in day view
	container.style.display = currentView === "day" ? "block" : "none";
	if (currentView !== "day") return;

	// Render month labels (numbers 1-12)
	monthsEl.innerHTML = Array.from(
		{ length: 12 },
		(_, i) =>
			`<span class="text-[10px] text-neutral-400 dark:text-neutral-500 text-center">${i + 1}</span>`,
	).join("");

	// Build weekly post counts: heatmapData[month][week] = count
	const heatmapData = Array.from({ length: 12 }, () => [0, 0, 0, 0]);
	allPostsData.forEach((post) => {
		const date = new Date(post.published);
		if (date.getFullYear() !== displayYear) return;
		const month = date.getMonth();
		const day = date.getDate();
		const week = Math.min(Math.floor((day - 1) / 7), 3); // 0-3
		heatmapData[month][week]++;
	});

	// Find max for scaling
	// Render grid cells: 12 columns × 4 rows, row-major order
	// Use discrete opacity levels so low counts are still clearly visible
	const opacityLevels = [0, 0.45, 0.65, 0.85, 1];
	let cellsHtml = "";
	for (let week = 0; week < 4; week++) {
		for (let month = 0; month < 12; month++) {
			const count = heatmapData[month][week];
			const level = Math.min(count, 4);
			const bgStyle =
				count === 0
					? "background-color: var(--btn-plain-bg-hover)"
					: `background-color: var(--primary); opacity: ${opacityLevels[level]}`;
			// Generate tooltip text using i18n template
			const tooltip = heatmapWeekTemplate
				.replace("{month}", String(month + 1))
				.replace("{week}", String(week + 1))
				.replace("{count}", String(count));
			cellsHtml += `<div class="heatmap-cell rounded-sm" style="${bgStyle}" data-tooltip="${tooltip}" data-month="${month}"></div>`;
		}
	}
	gridEl.innerHTML = cellsHtml;

	// Click on cell to navigate to that month
	gridEl.querySelectorAll(".heatmap-cell[data-month]").forEach((cell) => {
		cell.addEventListener("click", () => {
			const m = Number.parseInt(
				(cell as HTMLElement).getAttribute("data-month") as string,
				10,
			);
			displayMonth = m;
			currentView = "day";
			renderCalendar();
		});
	});

	// 热力图提示框 (fixed 定位，不被父容器裁剪)
	let tooltipEl = document.getElementById(
		"heatmap-tooltip",
	) as HTMLElement | null;
	if (!tooltipEl) {
		tooltipEl = document.createElement("div");
		tooltipEl.id = "heatmap-tooltip";
		Object.assign(tooltipEl.style, {
			position: "fixed",
			padding: "4px 8px",
			borderRadius: "6px",
			fontSize: "0.75rem",
			lineHeight: "1.2",
			background: "rgba(0,0,0,0.8)",
			color: "#fff",
			boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
			pointerEvents: "none",
			opacity: "0",
			transition: "opacity 0.15s ease",
			zIndex: "9999",
			whiteSpace: "nowrap",
		});
		document.body.appendChild(tooltipEl);
	}
	const tooltip = tooltipEl;
	gridEl.querySelectorAll(".heatmap-cell[data-tooltip]").forEach((cell) => {
		cell.addEventListener("mouseenter", () => {
			tooltip.textContent = (cell as HTMLElement).getAttribute("data-tooltip");
			tooltip.style.opacity = "1";
			const rect = (cell as HTMLElement).getBoundingClientRect();
			tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
			tooltip.style.top = `${rect.top - tooltip.offsetHeight - 6}px`;
		});
		cell.addEventListener("mouseleave", () => {
			tooltip.style.opacity = "0";
		});
	});
}

// 客户端动态渲染日历
function renderCalendar() {
	const container = document.getElementById("calendar-view-container");
	const monthContainer = document.getElementById("month-view-container");
	const yearContainer = document.getElementById("year-view-container");
	const postsContainer = document.getElementById("calendar-posts");

	// Update visibility
	if (container)
		container.style.display = currentView === "day" ? "block" : "none";
	if (monthContainer)
		monthContainer.style.display = currentView === "month" ? "grid" : "none";
	if (yearContainer)
		yearContainer.style.display = currentView === "year" ? "grid" : "none";
	if (postsContainer)
		postsContainer.style.display = currentView === "day" ? "block" : "none";

	updateHeader();

	if (currentView === "day") {
		renderDayView();
	} else if (currentView === "month") {
		renderMonthView();
	} else if (currentView === "year") {
		renderYearView();
	}

	renderHeatmap();
}

function updateHeader() {
	const navDisplay = document.getElementById("current-month-display");
	const resetBtn = document.getElementById(
		"reset-month-btn",
	) as HTMLElement | null;
	const prevBtn = document.getElementById(
		"prev-month-btn",
	) as HTMLElement | null;
	const nextBtn = document.getElementById(
		"next-month-btn",
	) as HTMLElement | null;

	if (navDisplay) {
		if (currentView === "day") {
			if (currentLang.startsWith("zh") || currentLang.startsWith("ja")) {
				navDisplay.textContent = `${displayYear}${yearText}${monthNames[displayMonth]}`;
			} else {
				navDisplay.textContent = `${monthNames[displayMonth]} ${displayYear}`;
			}
		} else if (currentView === "month") {
			navDisplay.textContent = `${displayYear}${yearText}`;
		} else if (currentView === "year") {
			navDisplay.textContent = yearText;
		}
	}

	if (resetBtn) {
		const now = new Date();
		const isCurrent =
			displayYear === now.getFullYear() && displayMonth === now.getMonth();
		resetBtn.style.display =
			currentView === "day" && isCurrent ? "none" : "flex";
	}

	// Hide prev/next buttons in year view as we show all years
	if (prevBtn)
		prevBtn.style.visibility = currentView === "year" ? "hidden" : "visible";
	if (nextBtn)
		nextBtn.style.visibility = currentView === "year" ? "hidden" : "visible";
}

function renderDayView() {
	const now = new Date();
	const currentYear = displayYear;
	const currentMonth = displayMonth;
	const currentDate = now.getDate();
	const isCurrentMonth =
		currentYear === now.getFullYear() && currentMonth === now.getMonth();

	// 获取月份的第一天是星期几
	const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

	// 获取当月天数
	const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

	// 生成日历格子
	const calendarGrid = document.getElementById("calendar-grid");
	if (!calendarGrid) return;

	const calendarDays: any[] = [];

	// 添加空白格子（月初空白）
	for (let i = 0; i < firstDayOfMonth; i++) {
		calendarDays.push({ day: null, hasPost: false, count: 0, dateKey: "" });
	}

	// 添加每一天
	for (let day = 1; day <= daysInMonth; day++) {
		const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
		const posts = postDateMap[dateKey] || [];
		const count = posts.length;
		calendarDays.push({
			day,
			hasPost: count > 0,
			count,
			dateKey,
		});
	}

	// 渲染日历格子
	calendarGrid.innerHTML = calendarDays
		.map(({ day, hasPost, count, dateKey }) => {
			const isToday = day === currentDate && isCurrentMonth;
			const classes = [
				"calendar-day aspect-square flex items-center justify-center rounded-sm text-sm relative cursor-pointer",
			];

			if (!day) {
				classes.push("text-neutral-400 dark:text-neutral-600");
			} else if (!hasPost) {
				classes.push("text-neutral-700 dark:text-neutral-300");
			} else {
				classes.push("text-neutral-900 dark:text-neutral-100 font-bold");
			}

			if (isToday) {
				classes.push("ring-2 ring-(--primary)");
			}

			return `
        <div
          class="${classes.join(" ")}"
          data-date="${dateKey}"
          data-has-post="${hasPost}"
        >
          ${day || ""}
          ${hasPost ? '<span class="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-(--primary)"></span>' : ""}
          ${hasPost && count > 1 ? `<span class="absolute top-0 right-0 text-[10px] text-(--primary) font-bold">${count}</span>` : ""}
        </div>
      `;
		})
		.join("");

	// 获取当月所有文章
	const currentMonthPosts = allPostsData.filter((post) => {
		const date = new Date(post.published);
		return (
			date.getFullYear() === currentYear && date.getMonth() === currentMonth
		);
	});

	// 显示当月文章列表
	showMonthlyPosts(currentMonthPosts);

	// 添加点击事件监听
	setupClickHandlers(currentMonthPosts);
}

function renderMonthView() {
	const container = document.getElementById("month-view-container");
	if (!container) return;

	// Calculate which months have posts for the currently displayed year
	const monthsWithPosts = new Set<number>();
	allPostsData.forEach((post) => {
		const date = new Date(post.published);
		if (date.getFullYear() === displayYear) {
			monthsWithPosts.add(date.getMonth());
		}
	});

	container.innerHTML = monthNames
		.map((name, index) => {
			const isCurrent = index === displayMonth;
			const hasPost = monthsWithPosts.has(index);
			const classes = [
				"p-2 text-center text-sm rounded-sm cursor-pointer hover:bg-(--btn-plain-bg-hover) transition-colors relative",
			];
			if (isCurrent) {
				classes.push("text-(--primary) font-bold bg-(--btn-plain-bg-hover)");
			} else {
				classes.push("text-neutral-700 dark:text-neutral-300");
			}

			const dotHtml = hasPost
				? '<span class="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-(--primary)"></span>'
				: "";

			return `<div class="${classes.join(" ")}" data-month="${index}">${name}${dotHtml}</div>`;
		})
		.join("");

	container.querySelectorAll("[data-month]").forEach((el) => {
		el.addEventListener("click", () => {
			displayMonth = Number.parseInt(
				(el as HTMLElement).getAttribute("data-month") as string,
				10,
			);
			currentView = "day";
			renderCalendar();
		});
	});
}

function renderYearView() {
	const container = document.getElementById("year-view-container");
	if (!container) return;

	container.innerHTML = availableYears
		.map((year) => {
			const isCurrent = year === displayYear;
			const classes = [
				"p-2 text-center text-sm rounded-sm cursor-pointer hover:bg-(--btn-plain-bg-hover) transition-colors relative",
			];
			if (isCurrent) {
				classes.push("text-(--primary) font-bold bg-(--btn-plain-bg-hover)");
			} else {
				classes.push("text-neutral-700 dark:text-neutral-300");
			}
			return `<div class="${classes.join(" ")}" data-year="${year}">${year}<span class="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-(--primary)"></span></div>`;
		})
		.join("");

	container.querySelectorAll("[data-year]").forEach((el) => {
		el.addEventListener("click", () => {
			displayYear = Number.parseInt(
				(el as HTMLElement).getAttribute("data-year") as string,
				10,
			);
			currentView = "month";
			renderCalendar();
		});
	});
}

// 显示当月所有文章
function showMonthlyPosts(currentMonthPosts: any[]) {
	const postsWrapper = document.getElementById("calendar-posts");
	const postsList = document.getElementById("calendar-posts-list");
	const divider = document.getElementById(
		"calendar-posts-divider",
	) as HTMLElement | null;

	if (postsWrapper) {
		postsWrapper.style.display =
			currentMonthPosts.length > 0 ? "block" : "none";
	}

	if (postsList) {
		postsList.innerHTML = currentMonthPosts
			.map((post) => {
				const date = new Date(post.published);
				const dateStr = `${date.getMonth() + 1}-${date.getDate()}`;
				return `
        <a href="${postUrlPrefix}${post.id}/" class="flex justify-between items-center text-sm text-neutral-700 dark:text-neutral-300 hover:text-(--primary) dark:hover:text-(--primary) transition-colors px-2 py-1 rounded-sm hover:bg-(--btn-plain-bg-hover)">
          <span class="truncate">${post.title}</span>
          <span class="text-xs text-neutral-500 dark:text-neutral-400 ml-2 whitespace-nowrap">${dateStr}</span>
        </a>
      `;
			})
			.join("");

		// 显示/隐藏分割线
		if (divider) {
			divider.style.display = currentMonthPosts.length > 0 ? "block" : "none";
		}
	}
}

// 设置日历格子点击事件
function setupClickHandlers(currentMonthPosts: any[]) {
	const postsWrapper = document.getElementById("calendar-posts");
	const calendarDays = document.querySelectorAll(".calendar-day[data-date]");
	const postsList = document.getElementById("calendar-posts-list");
	const divider = document.getElementById(
		"calendar-posts-divider",
	) as HTMLElement | null;

	let currentSelectedDay: Element | null = null;

	calendarDays.forEach((dayElement) => {
		dayElement.addEventListener("click", () => {
			const dateKey = dayElement.getAttribute("data-date");
			const hasPost = dayElement.getAttribute("data-has-post") === "true";

			if (!hasPost || !dateKey) return;

			// 切换选中状态
			if (currentSelectedDay === dayElement) {
				// 取消选中，恢复显示当月所有文章
				dayElement.classList.remove("calendar-day-selected");
				currentSelectedDay = null;
				showMonthlyPosts(currentMonthPosts);
				return;
			}

			// 移除之前选中的样式
			if (currentSelectedDay) {
				currentSelectedDay.classList.remove("calendar-day-selected");
			}

			// 添加选中样式
			dayElement.classList.add("calendar-day-selected");
			currentSelectedDay = dayElement;

			// 获取该日期的文章
			const posts = postDateMap[dateKey] || [];

			if (posts.length > 0 && postsList) {
				if (postsWrapper) {
					postsWrapper.style.display = "block";
				}

				// 渲染文章列表
				postsList.innerHTML = posts
					.map((post) => {
						const date = new Date(post.published);
						const dateStr = `${date.getMonth() + 1}-${date.getDate()}`;
						return `
            <a href="${postUrlPrefix}${post.id}/" class="flex justify-between items-center text-sm text-neutral-700 dark:text-neutral-300 hover:text-(--primary) dark:hover:text-(--primary) transition-colors px-2 py-1 rounded-sm hover:bg-(--btn-plain-bg-hover)">
              <span class="truncate">${post.title}</span>
              <span class="text-xs text-neutral-500 dark:text-neutral-400 ml-2 whitespace-nowrap">${dateStr}</span>
            </a>
          `;
					})
					.join("");

				// 显示分割线
				if (divider) {
					divider.style.display = "block";
				}
			}
		});
	});
}

function changeMonth(delta: number) {
	if (currentView === "day") {
		displayMonth += delta;
		if (displayMonth > 11) {
			displayMonth = 0;
			displayYear++;
		} else if (displayMonth < 0) {
			displayMonth = 11;
			displayYear--;
		}
	} else if (currentView === "month") {
		displayYear += delta;
	}
	renderCalendar();
}

function resetToToday() {
	const now = new Date();
	displayYear = now.getFullYear();
	displayMonth = now.getMonth();
	currentView = "day";
	renderCalendar();
}

function initCalendar() {
	// Reset to current date on init
	const now = new Date();
	displayYear = now.getFullYear();
	displayMonth = now.getMonth();
	currentView = "day";

	fetchData();

	// Bind events
	const prevBtn = document.getElementById("prev-month-btn");
	const nextBtn = document.getElementById("next-month-btn");
	const resetBtn = document.getElementById("reset-month-btn");
	const navDisplay = document.getElementById("current-month-display");

	if (prevBtn) prevBtn.onclick = () => changeMonth(-1);
	if (nextBtn) nextBtn.onclick = () => changeMonth(1);
	if (resetBtn) resetBtn.onclick = () => resetToToday();

	if (navDisplay) {
		navDisplay.onclick = () => {
			if (currentView === "day") {
				currentView = "month";
			} else if (currentView === "month") {
				currentView = "year";
			}
			renderCalendar();
		};
	}
}

// 首次加载立即渲染；之后每次 swup 软导航（侧栏 DOM 被替换）后重新渲染。
initCalendar();
document.addEventListener("astro:page-load", initCalendar);
