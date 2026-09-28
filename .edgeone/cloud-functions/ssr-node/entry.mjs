import { t as __exportAll } from "./chunks/rolldown-runtime_D7D4PA-g.mjs";
import { _ as stripRequestBase, a as collapseDuplicateSlashes, c as hasFileExtension, d as joinPaths, f as prependForwardSlash, g as slash, h as removeTrailingForwardSlash, i as collapseDuplicateLeadingSlashes, l as isInternalPath, n as matchPattern, o as collapseDuplicateTrailingSlashes, p as removeLeadingForwardSlash, r as appendForwardSlash, s as fileExtension, v as trimSlashes } from "./chunks/remote_xHP5_VUx.mjs";
import { A as decryptString, B as originPathnameSymbol, C as markHTMLString, E as renderEndpoint, F as DEFAULT_404_COMPONENT, I as REDIRECT_STATUS_CODES, L as REROUTABLE_STATUS_CODES, M as s, N as ASTRO_ERROR_HEADER, O as clsx$1, P as ASTRO_GENERATOR, R as clientAddressSymbol, S as isAstroComponentFactory, T as escape, V as responseSentSymbol$1, a as isRoute404, b as normalizeCspResourceEntry, c as renderComponent, d as createSlotValueFromString, f as renderSlotToString, i as renderPage, j as generateCspDigest, k as decodeKey, l as renderStreaming, m as renderTemplate, n as createVNode, o as isRoute500, p as isRenderTemplateResult, s as renderJSX, t as AstroJSX, u as chunkToString, x as pushDirective, y as isRenderInstruction, z as fetchStateSymbol } from "./chunks/jsx-runtime_CfvsD_GM.mjs";
import { $ as isAstroError, B as PrerenderClientAddressNotAvailable, D as MiddlewareNotAResponse, E as MiddlewareNoDataOrNextCalled, G as RewriteWithBodyUsed, K as StaticClientAddressNotAvailable, L as NoMatchingStaticPathFound, P as NoManifestAvailable, Q as AstroUserError, T as LocalsReassigned, U as ReservedSlotName, V as PrerenderDynamicEndpointPathCollide, W as ResponseSentError, X as i18nNoLocaleFoundInPath, Z as AstroError, a as ClientAddressNotAvailable, b as InvalidGetStaticPathsEntry, g as GetStaticPathsRequired, h as GetStaticPathsInvalidRouteParam, i as CacheNotEnabled, m as GetStaticPathsExpectedParams, n as ActionsReturnedInvalidDataError, p as ForbiddenRewrite, r as AstroResponseHeadersReassigned, t as ActionNotFoundError, w as LocalsNotAnObject, x as InvalidGetStaticPathsReturn, z as PageNumberParamNotFound } from "./chunks/errors-data_Bs9ls-4A.mjs";
import { n as AstroIntegrationLogger, r as astroToRuntimeLogger, t as createConsoleLogger } from "./chunks/console_B1NufImu.mjs";
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/i18n/path.js
function pathHasLocale(path, locales) {
	const segments = path.split("/").map(normalizeThePath);
	for (const segment of segments) for (const locale of locales) if (typeof locale === "string") {
		if (normalizeTheLocale(segment) === normalizeTheLocale(locale)) return true;
	} else if (segment === locale.path) return true;
	return false;
}
function normalizeTheLocale(locale) {
	return locale.replaceAll("_", "-").toLowerCase();
}
function normalizeThePath(path) {
	return path.endsWith(".html") ? path.slice(0, -5) : path;
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/i18n/domain.js
function computePathnameFromDomain(request, url, i18n, base, trailingSlash, logger, pathnameFromRequest) {
	let pathname = void 0;
	if (i18n && (i18n.strategy === "domains-prefix-always" || i18n.strategy === "domains-prefix-other-locales" || i18n.strategy === "domains-prefix-always-no-redirect")) {
		let host = request.headers.get("X-Forwarded-Host");
		let protocol = request.headers.get("X-Forwarded-Proto");
		if (protocol) protocol = protocol + ":";
		else protocol = url.protocol;
		if (!host) host = request.headers.get("Host");
		if (host && protocol) {
			host = host.split(":")[0];
			try {
				let locale;
				const hostAsUrl = new URL(`${protocol}//${host}`);
				for (const [domainKey, localeValue] of Object.entries(i18n.domainLookupTable)) {
					const domainKeyAsUrl = new URL(domainKey);
					if (hostAsUrl.host === domainKeyAsUrl.host && hostAsUrl.protocol === domainKeyAsUrl.protocol) {
						locale = localeValue;
						break;
					}
				}
				if (locale) {
					const requestPathname = pathnameFromRequest ?? stripRequestBase(url.pathname, base);
					pathname = prependForwardSlash(joinPaths(normalizeTheLocale(locale), requestPathname));
					if (trailingSlash === "always") pathname = appendForwardSlash(pathname);
					else if (trailingSlash === "never") pathname = removeTrailingForwardSlash(pathname);
					else if (url.pathname.endsWith("/")) pathname = appendForwardSlash(pathname);
				}
			} catch (e) {
				logger.error("router", `Astro tried to parse ${protocol}//${host} as an URL, but it threw a parsing error. Check the X-Forwarded-Host and X-Forwarded-Proto headers.`);
				logger.error("router", `Error: ${e}`);
			}
		}
	}
	return pathname;
}
//#endregion
//#region node_modules/.pnpm/cookie@2.0.1/node_modules/cookie/dist/index.js
/**
* RegExp to match cookie-name in RFC 6265 sec 4.1.1
* This refers out to the obsoleted definition of token in RFC 2616 sec 2.2
* which has been replaced by the token definition in RFC 7230 appendix B.
*
* cookie-name       = token
* token             = 1*tchar
* tchar             = "!" / "#" / "$" / "%" / "&" / "'" /
*                     "*" / "+" / "-" / "." / "^" / "_" /
*                     "`" / "|" / "~" / DIGIT / ALPHA
*
* Note: Allowing more characters - https://github.com/jshttp/cookie/issues/191
* Allow same range as cookie value, except `=`, which delimits end of name.
*/
var cookieNameRegExp = /^[\u0021-\u003A\u003C\u003E-\u007E]+$/;
/**
* RegExp to match cookie-value in RFC 6265 sec 4.1.1
*
* cookie-value      = *cookie-octet / ( DQUOTE *cookie-octet DQUOTE )
* cookie-octet      = %x21 / %x23-2B / %x2D-3A / %x3C-5B / %x5D-7E
*                     ; US-ASCII characters excluding CTLs,
*                     ; whitespace DQUOTE, comma, semicolon,
*                     ; and backslash
*
* Allowing more characters: https://github.com/jshttp/cookie/issues/191
* Comma, backslash, and DQUOTE are not part of the parsing algorithm.
*/
var cookieValueRegExp = /^[\u0021-\u003A\u003C-\u007E]*$/;
/**
* RegExp to match domain-value in RFC 6265 sec 4.1.1
*
* domain-value      = <subdomain>
*                     ; defined in [RFC1034], Section 3.5, as
*                     ; enhanced by [RFC1123], Section 2.1
* <subdomain>       = <label> | <subdomain> "." <label>
* <label>           = <let-dig> [ [ <ldh-str> ] <let-dig> ]
*                     Labels must be 63 characters or less.
*                     'let-dig' not 'letter' in the first char, per RFC1123
* <ldh-str>         = <let-dig-hyp> | <let-dig-hyp> <ldh-str>
* <let-dig-hyp>     = <let-dig> | "-"
* <let-dig>         = <letter> | <digit>
* <letter>          = any one of the 52 alphabetic characters A through Z in
*                     upper case and a through z in lower case
* <digit>           = any one of the ten digits 0 through 9
*
* Keep support for leading dot: https://github.com/jshttp/cookie/issues/173
*
* > (Note that a leading %x2E ("."), if present, is ignored even though that
* character is not permitted, but a trailing %x2E ("."), if present, will
* cause the user agent to ignore the attribute.)
*/
var domainValueRegExp = /^([.]?[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i;
/**
* RegExp to match path-value in RFC 6265 sec 4.1.1
*
* path-value        = <any CHAR except CTLs or ";">
* CHAR              = %x01-7F
*                     ; defined in RFC 5234 appendix B.1
*/
var pathValueRegExp = /^[\u0020-\u003A\u003D-\u007E]*$/;
/**
* RegExp to match RFC 6265 cookie-octet values (without % to preserve roundtrip) that need no URL encoding.
*/
var cookieOctetRegExp = /^[!#$&'()*+\-.\/0-9:<=>?@A-Z[\]\^_`a-z{|}~]*$/;
var NullObject = /* @__PURE__ */ (() => {
	const C = function() {};
	C.prototype = Object.create(null);
	return C;
})();
/**
* Parse a `Cookie` header.
*
* Parse the given cookie header string into an object
* The object has the various cookies as keys(names) => values
*/
function parseCookie(str, options) {
	const obj = new NullObject();
	const len = str.length;
	if (len < 2) return obj;
	const dec = options?.decode || decode;
	let index = 0;
	do {
		const eqIdx = eqIndex(str, index, len);
		if (eqIdx === len) break;
		const endIdx = endIndex(str, index, len);
		if (eqIdx > endIdx) {
			index = str.lastIndexOf(";", eqIdx - 1) + 1;
			continue;
		}
		const key = valueSlice(str, index, eqIdx);
		if (obj[key] === void 0) obj[key] = dec(valueSlice(str, eqIdx + 1, endIdx));
		index = endIdx + 1;
	} while (index < len);
	return obj;
}
/**
* Serialize data into a cookie header.
*
* Serialize a name value pair into a cookie string suitable for
* http headers. An optional options object specifies cookie parameters.
*
* stringifySetCookie({ name: 'foo', value: 'bar', httpOnly: true })
*   => "foo=bar; HttpOnly"
*/
function stringifySetCookie(cookie, options) {
	const enc = options?.encode || defaultEncode;
	if (!cookieNameRegExp.test(cookie.name)) throw new TypeError(`argument name is invalid: ${cookie.name}`);
	const value = cookie.value == null ? "" : enc(cookie.value);
	if (!cookieValueRegExp.test(value)) throw new TypeError(`argument val is invalid: ${cookie.value}`);
	let str = cookie.name + "=" + value;
	if (cookie.maxAge !== void 0) {
		if (!Number.isInteger(cookie.maxAge)) throw new TypeError(`option maxAge is invalid: ${cookie.maxAge}`);
		str += "; Max-Age=" + cookie.maxAge;
	}
	if (cookie.domain) {
		if (!domainValueRegExp.test(cookie.domain)) throw new TypeError(`option domain is invalid: ${cookie.domain}`);
		str += "; Domain=" + cookie.domain;
	}
	if (cookie.path) {
		if (!pathValueRegExp.test(cookie.path)) throw new TypeError(`option path is invalid: ${cookie.path}`);
		str += "; Path=" + cookie.path;
	}
	if (cookie.expires) {
		if (!Number.isFinite(cookie.expires.valueOf())) throw new TypeError(`option expires is invalid: ${cookie.expires}`);
		str += "; Expires=" + cookie.expires.toUTCString();
	}
	if (cookie.httpOnly) str += "; HttpOnly";
	if (cookie.secure) str += "; Secure";
	if (cookie.partitioned) str += "; Partitioned";
	if (cookie.priority) switch (typeof cookie.priority === "string" ? cookie.priority.toLowerCase() : void 0) {
		case "low":
			str += "; Priority=Low";
			break;
		case "medium":
			str += "; Priority=Medium";
			break;
		case "high":
			str += "; Priority=High";
			break;
		default: throw new TypeError(`option priority is invalid: ${cookie.priority}`);
	}
	if (cookie.sameSite) switch (typeof cookie.sameSite === "string" ? cookie.sameSite.toLowerCase() : cookie.sameSite) {
		case true:
		case "strict":
			str += "; SameSite=Strict";
			break;
		case "lax":
			str += "; SameSite=Lax";
			break;
		case "none":
			str += "; SameSite=None";
			break;
		default: throw new TypeError(`option sameSite is invalid: ${cookie.sameSite}`);
	}
	return str;
}
/**
* Find the next `;` character, or return `len`.
*/
function endIndex(str, min, len) {
	const index = str.indexOf(";", min);
	return index === -1 ? len : index;
}
/**
* Find the next `=` character, or return `len`.
*/
function eqIndex(str, min, len) {
	const index = str.indexOf("=", min);
	return index === -1 ? len : index;
}
/**
* Slice out a value between startPod to max.
*/
function valueSlice(str, min, max) {
	if (min === max) return "";
	let start = min;
	let end = max;
	do {
		const code = str.charCodeAt(start);
		if (code !== 32 && code !== 9) break;
	} while (++start < end);
	while (end > start) {
		const code = str.charCodeAt(end - 1);
		if (code !== 32 && code !== 9) break;
		end--;
	}
	return str.slice(start, end);
}
/**
* URL-decode string value. Optimized to skip native call when no %.
*/
function decode(str) {
	if (str.indexOf("%") === -1) return str;
	try {
		return decodeURIComponent(str);
	} catch (e) {
		return str;
	}
}
/**
* URL-encode string value. Optimized to skip native call for roundtrip-safe cookie-octet values.
*/
function defaultEncode(str) {
	return cookieOctetRegExp.test(str) ? str : encodeURIComponent(str);
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/cookies/cookies.js
var DELETED_EXPIRATION = /* @__PURE__ */ new Date(0);
var DELETED_VALUE = "deleted";
var responseSentSymbol = /* @__PURE__ */ Symbol.for("astro.responseSent");
var identity = (value) => value;
var AstroCookie = class {
	value;
	constructor(value) {
		this.value = value;
	}
	json() {
		if (this.value === void 0) throw new Error(`Cannot convert undefined to an object.`);
		return JSON.parse(this.value);
	}
	number() {
		return Number(this.value);
	}
	boolean() {
		if (this.value === "false") return false;
		if (this.value === "0") return false;
		return Boolean(this.value);
	}
};
var AstroCookies = class {
	#request;
	#requestValues;
	#outgoing;
	#consumed;
	#logger;
	constructor(request, logger) {
		this.#request = request;
		this.#requestValues = null;
		this.#outgoing = null;
		this.#consumed = false;
		this.#logger = logger;
	}
	/**
	* Astro.cookies.delete(key) is used to delete a cookie. Using this method will result
	* in a Set-Cookie header added to the response.
	* @param key The cookie to delete
	* @param options Options related to this deletion, such as the path of the cookie.
	*/
	delete(key, options) {
		this.#ensureOutgoingMap().set(key, [
			DELETED_VALUE,
			stringifySetCookie({
				...options,
				name: key,
				value: DELETED_VALUE,
				expires: DELETED_EXPIRATION,
				maxAge: void 0
			}),
			false
		]);
	}
	/**
	* Astro.cookies.get(key) is used to get a cookie value. The cookie value is read from the
	* request. If you have set a cookie via Astro.cookies.set(key, value), the value will be taken
	* from that set call, overriding any values already part of the request.
	* @param key The cookie to get.
	* @returns An object containing the cookie value as well as convenience methods for converting its value.
	*/
	get(key, options = void 0) {
		if (this.#outgoing?.has(key)) {
			let [serializedValue, , isSetValue] = this.#outgoing.get(key);
			if (isSetValue) return new AstroCookie(serializedValue);
			else return;
		}
		const decode = options?.decode ?? decodeURIComponent;
		const values = this.#ensureParsed();
		if (key in values) {
			const value = values[key];
			if (value) {
				let decodedValue;
				try {
					decodedValue = decode(value);
				} catch (_error) {
					decodedValue = value;
				}
				return new AstroCookie(decodedValue);
			}
		}
	}
	/**
	* Astro.cookies.has(key) returns a boolean indicating whether this cookie is either
	* part of the initial request or set via Astro.cookies.set(key)
	* @param key The cookie to check for.
	* @param _options This parameter is no longer used.
	* @returns
	*/
	has(key, _options) {
		if (this.#outgoing?.has(key)) {
			let [, , isSetValue] = this.#outgoing.get(key);
			return isSetValue;
		}
		return this.#ensureParsed()[key] !== void 0;
	}
	/**
	* Astro.cookies.set(key, value) is used to set a cookie's value. If provided
	* an object it will be stringified via JSON.stringify(value). Additionally you
	* can provide options customizing how this cookie will be set, such as setting httpOnly
	* in order to prevent the cookie from being read in client-side JavaScript.
	* @param key The name of the cookie to set.
	* @param value A value, either a string or other primitive or an object.
	* @param options Options for the cookie, such as the path and security settings.
	*/
	set(key, value, options) {
		if (this.#consumed) this.#logger.warn("SKIP_FORMAT", "Astro.cookies.set() was called after the cookies had already been sent to the browser.\nThis may have happened if this method was called in an imported component.\nPlease make sure that Astro.cookies.set() is only called in the frontmatter of the main page.");
		let serializedValue;
		if (typeof value === "string") serializedValue = value;
		else {
			let toStringValue = value.toString();
			if (toStringValue === Object.prototype.toString.call(value)) serializedValue = JSON.stringify(value);
			else serializedValue = toStringValue;
		}
		const { encode, ...attributes } = options ?? {};
		this.#ensureOutgoingMap().set(key, [
			serializedValue,
			stringifySetCookie({
				...attributes,
				name: key,
				value: serializedValue
			}, { encode }),
			true
		]);
		if (this.#request[responseSentSymbol]) throw new AstroError({ ...ResponseSentError });
	}
	/**
	* Merges a new AstroCookies instance into the current instance. Any new cookies
	* will be added to the current instance, overwriting any existing cookies with the same name.
	*/
	merge(cookies) {
		const outgoing = cookies.#outgoing;
		if (outgoing) for (const [key, value] of outgoing) this.#ensureOutgoingMap().set(key, value);
	}
	/**
	* Astro.cookies.header() returns an iterator for the cookies that have previously
	* been set by either Astro.cookies.set() or Astro.cookies.delete().
	* This method is primarily used by adapters to set the header on outgoing responses.
	* @returns
	*/
	*headers() {
		if (this.#outgoing == null) return;
		for (const [, value] of this.#outgoing) yield value[1];
	}
	/**
	* Marks the cookies as consumed and returns the header values.
	* After consumption, any subsequent `set()` calls will warn.
	*/
	consume() {
		this.#consumed = true;
		return this.headers();
	}
	/**
	* @deprecated Use the instance method `cookies.consume()` instead.
	* Kept for backward compatibility with adapters.
	*/
	static consume(cookies) {
		return cookies.consume();
	}
	#ensureParsed() {
		if (!this.#requestValues) this.#parse();
		if (!this.#requestValues) this.#requestValues = /* @__PURE__ */ Object.create(null);
		return this.#requestValues;
	}
	#ensureOutgoingMap() {
		if (!this.#outgoing) this.#outgoing = /* @__PURE__ */ new Map();
		return this.#outgoing;
	}
	#parse() {
		const raw = this.#request.headers.get("cookie");
		if (!raw) return;
		this.#requestValues = parseCookie(raw, { decode: identity });
	}
};
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/cookies/response.js
var astroCookiesSymbol = /* @__PURE__ */ Symbol.for("astro.cookies");
function attachCookiesToResponse(response, cookies) {
	Reflect.set(response, astroCookiesSymbol, cookies);
}
function getCookiesFromResponse(response) {
	let cookies = Reflect.get(response, astroCookiesSymbol);
	if (cookies != null) return cookies;
	else return;
}
function* getSetCookiesFromResponse(response) {
	const cookies = getCookiesFromResponse(response);
	if (!cookies) return [];
	for (const headerValue of cookies.consume()) yield headerValue;
	return [];
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/middleware/noop-middleware.js
var NOOP_MIDDLEWARE_FN = async (_ctx, next) => {
	return await next();
};
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/app/manifest.js
function deserializeManifest(serializedManifest, routesList) {
	const routes = [];
	if (serializedManifest.routes) for (const serializedRoute of serializedManifest.routes) routes.push({
		...serializedRoute,
		routeData: deserializeRouteData(serializedRoute.routeData)
	});
	if (routesList) for (const route of routesList?.routes) routes.push({
		file: "",
		links: [],
		scripts: [],
		styles: [],
		routeData: route
	});
	const assets = new Set(serializedManifest.assets);
	const componentMetadata = new Map(serializedManifest.componentMetadata);
	const inlinedScripts = new Map(serializedManifest.inlinedScripts);
	const clientDirectives = new Map(serializedManifest.clientDirectives);
	const key = decodeKey(serializedManifest.key);
	return {
		middleware() {
			return { onRequest: NOOP_MIDDLEWARE_FN };
		},
		...serializedManifest,
		rootDir: new URL(serializedManifest.rootDir),
		srcDir: new URL(serializedManifest.srcDir),
		publicDir: new URL(serializedManifest.publicDir),
		outDir: new URL(serializedManifest.outDir),
		cacheDir: new URL(serializedManifest.cacheDir),
		buildClientDir: new URL(serializedManifest.buildClientDir),
		buildServerDir: new URL(serializedManifest.buildServerDir),
		assets,
		componentMetadata,
		inlinedScripts,
		clientDirectives,
		routes,
		key
	};
}
function deserializeRouteData(rawRouteData) {
	return {
		route: rawRouteData.route,
		type: rawRouteData.type,
		pattern: new RegExp(rawRouteData.pattern),
		params: rawRouteData.params,
		component: rawRouteData.component,
		pathname: rawRouteData.pathname || void 0,
		segments: rawRouteData.segments,
		prerender: rawRouteData.prerender,
		redirect: rawRouteData.redirect,
		redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
		fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
			return deserializeRouteData(fallback);
		}),
		isIndex: rawRouteData.isIndex,
		origin: rawRouteData.origin,
		distURL: rawRouteData.distURL
	};
}
function deserializeRouteInfo(rawRouteInfo) {
	return {
		styles: rawRouteInfo.styles,
		file: rawRouteInfo.file,
		links: rawRouteInfo.links,
		scripts: rawRouteInfo.scripts,
		routeData: deserializeRouteData(rawRouteInfo.routeData)
	};
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0/node_modules/svelte/src/internal/server/context.js
/** @import { SSRContext } from '#server' */
/** @type {SSRContext | null} */
var ssr_context = null;
/** @param {SSRContext | null} v */
function set_ssr_context(v) {
	ssr_context = v;
}
/**
* @param {Function} [fn]
*/
function push(fn) {
	ssr_context = {
		p: ssr_context,
		c: null,
		r: null
	};
}
function pop() {
	ssr_context = ssr_context.p;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0/node_modules/svelte/src/internal/shared/utils.js
var is_array = Array.isArray;
Array.prototype.indexOf;
Array.prototype.includes;
Array.from;
Array.prototype;
var has_own_property = Object.prototype.hasOwnProperty;
var noop = () => {};
/**
* TODO replace with Promise.withResolvers once supported widely enough
* @template [T=void]
*/
function deferred() {
	/** @type {(value: T) => void} */
	var resolve;
	/** @type {(reason: any) => void} */
	var reject;
	return {
		promise: new Promise((res, rej) => {
			resolve = res;
			reject = rej;
		}),
		resolve,
		reject
	};
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0/node_modules/svelte/src/internal/server/errors.js
/**
* The node API `AsyncLocalStorage` is not available, but is required to use async server rendering.
* @returns {never}
*/
function async_local_storage_unavailable() {
	const error = /* @__PURE__ */ new Error(`async_local_storage_unavailable\nThe node API \`AsyncLocalStorage\` is not available, but is required to use async server rendering.\nhttps://svelte.dev/e/async_local_storage_unavailable`);
	error.name = "Svelte error";
	throw error;
}
/**
* Encountered asynchronous work while rendering synchronously.
* @returns {never}
*/
function await_invalid() {
	const error = /* @__PURE__ */ new Error(`await_invalid\nEncountered asynchronous work while rendering synchronously.\nhttps://svelte.dev/e/await_invalid`);
	error.name = "Svelte error";
	throw error;
}
/**
* The `html` property of server render results has been deprecated. Use `body` instead.
* @returns {never}
*/
function html_deprecated() {
	const error = /* @__PURE__ */ new Error(`html_deprecated\nThe \`html\` property of server render results has been deprecated. Use \`body\` instead.\nhttps://svelte.dev/e/html_deprecated`);
	error.name = "Svelte error";
	throw error;
}
/**
* `csp.nonce` was set while `csp.hash` was `true`. These options cannot be used simultaneously.
* @returns {never}
*/
function invalid_csp() {
	const error = /* @__PURE__ */ new Error(`invalid_csp\n\`csp.nonce\` was set while \`csp.hash\` was \`true\`. These options cannot be used simultaneously.\nhttps://svelte.dev/e/invalid_csp`);
	error.name = "Svelte error";
	throw error;
}
/**
* The `idPrefix` option cannot include `--`.
* @returns {never}
*/
function invalid_id_prefix() {
	const error = /* @__PURE__ */ new Error(`invalid_id_prefix\nThe \`idPrefix\` option cannot include \`--\`.\nhttps://svelte.dev/e/invalid_id_prefix`);
	error.name = "Svelte error";
	throw error;
}
/**
* Could not resolve `render` context.
* @returns {never}
*/
function server_context_required() {
	const error = /* @__PURE__ */ new Error(`server_context_required\nCould not resolve \`render\` context.\nhttps://svelte.dev/e/server_context_required`);
	error.name = "Svelte error";
	throw error;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0/node_modules/svelte/src/internal/flags/index.js
/** True if experimental.async=true */
var async_mode_flag = false;
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0/node_modules/svelte/src/internal/server/render-context.js
/** @import { AsyncLocalStorage } from 'node:async_hooks' */
/** @import { RenderContext } from '#server' */
/** @type {Promise<void> | null} */
var current_render = null;
/** @type {RenderContext | null} */
var context = null;
/** @returns {RenderContext} */
function get_render_context() {
	const store = context ?? als?.getStore();
	if (!store) server_context_required();
	return store;
}
/**
* @template T
* @param {() => Promise<T>} fn
* @returns {Promise<T>}
*/
async function with_render_context(fn) {
	context = { hydratable: {
		lookup: /* @__PURE__ */ new Map(),
		comparisons: [],
		unresolved_promises: /* @__PURE__ */ new Map()
	} };
	if (in_webcontainer()) {
		const { promise, resolve } = deferred();
		const previous_render = current_render;
		current_render = promise;
		await previous_render;
		return fn().finally(resolve);
	}
	try {
		if (als === null) async_local_storage_unavailable();
		return als.run(context, fn);
	} finally {
		context = null;
	}
}
/** @type {AsyncLocalStorage<RenderContext | null> | null} */
var als = null;
/** @type {Promise<void> | null} */
var als_import = null;
/**
*
* @returns {Promise<void>}
*/
function init_render_context() {
	als_import ??= import("node:async_hooks").then((hooks) => {
		als = new hooks.AsyncLocalStorage();
	}).then(noop, noop);
	return als_import;
}
function in_webcontainer() {
	return !!globalThis.process?.versions?.webcontainer;
}
//#endregion
//#region node_modules/.pnpm/devalue@5.9.2/node_modules/devalue/src/constants.js
var MAX_ARRAY_LEN = 2 ** 32 - 1;
var MAX_ARRAY_INDEX = MAX_ARRAY_LEN - 1;
//#endregion
//#region node_modules/.pnpm/devalue@5.9.2/node_modules/devalue/src/utils.js
/** @type {Record<string, string>} */
var escaped = {
	"<": "\\u003C",
	"\\": "\\\\",
	"\b": "\\b",
	"\f": "\\f",
	"\n": "\\n",
	"\r": "\\r",
	"	": "\\t",
	"\u2028": "\\u2028",
	"\u2029": "\\u2029"
};
var DevalueError = class extends Error {
	/**
	* @param {string} message
	* @param {string[]} keys
	* @param {any} [value] - The value that failed to be serialized
	* @param {any} [root] - The root value being serialized
	*/
	constructor(message, keys, value, root) {
		super(message);
		this.name = "DevalueError";
		this.path = keys.join("");
		this.value = value;
		this.root = root;
	}
};
/** @param {any} thing */
function is_primitive(thing) {
	return thing === null || typeof thing !== "object" && typeof thing !== "function";
}
var object_proto_names = /* @__PURE__ */ Object.getOwnPropertyNames(Object.prototype).sort().join("\0");
/** @param {any} thing */
function is_plain_object(thing) {
	const proto = Object.getPrototypeOf(thing);
	return proto === Object.prototype || proto === null || Object.getPrototypeOf(proto) === null || Object.getOwnPropertyNames(proto).sort().join("\0") === object_proto_names;
}
/** @param {any} thing */
function get_type(thing) {
	return Object.prototype.toString.call(thing).slice(8, -1);
}
/** @param {string} char */
function get_escaped_char(char) {
	switch (char) {
		case "\"": return "\\\"";
		case "<": return "\\u003C";
		case "\\": return "\\\\";
		case "\n": return "\\n";
		case "\r": return "\\r";
		case "	": return "\\t";
		case "\b": return "\\b";
		case "\f": return "\\f";
		case "\u2028": return "\\u2028";
		case "\u2029": return "\\u2029";
		default: return char < " " ? `\\u${char.charCodeAt(0).toString(16).padStart(4, "0")}` : "";
	}
}
/** @param {string} str */
function stringify_string(str) {
	let result = "";
	let last_pos = 0;
	const len = str.length;
	for (let i = 0; i < len; i += 1) {
		const char = str[i];
		const replacement = get_escaped_char(char);
		if (replacement) {
			result += str.slice(last_pos, i) + replacement;
			last_pos = i + 1;
		}
	}
	return `"${last_pos === 0 ? str : result + str.slice(last_pos)}"`;
}
/** @param {Record<string | symbol, any>} object */
function enumerable_symbols(object) {
	return Object.getOwnPropertySymbols(object).filter((symbol) => Object.getOwnPropertyDescriptor(object, symbol).enumerable);
}
var is_identifier = /^[a-zA-Z_$][a-zA-Z_$0-9]*$/;
/** @param {string} key */
function stringify_key(key) {
	return is_identifier.test(key) ? "." + key : "[" + JSON.stringify(key) + "]";
}
/** @param {number} n */
function is_valid_array_index(n) {
	if (!Number.isInteger(n)) return false;
	if (n < 0) return false;
	if (n > MAX_ARRAY_INDEX) return false;
	return true;
}
/** @param {number} n */
function is_valid_array_len(n) {
	if (!Number.isInteger(n)) return false;
	if (n < 0) return false;
	if (n > MAX_ARRAY_LEN) return false;
	return true;
}
/** @param {string} s */
function is_valid_array_index_string(s) {
	if (s.length === 0) return false;
	if (s.length > 1 && s.charCodeAt(0) === 48) return false;
	for (let i = 0; i < s.length; i++) {
		const c = s.charCodeAt(i);
		if (c < 48 || c > 57) return false;
	}
	return is_valid_array_index(+s);
}
/**
* Returns the length of the leading run of valid array indices in `keys`.
* @param {readonly string[]} keys
*/
function array_index_cut(keys) {
	for (var i = keys.length - 1; i >= 0; i--) if (is_valid_array_index_string(keys[i])) break;
	return i + 1;
}
/**
* Finds the populated indices of an array.
* @param {unknown[]} array
*/
function valid_array_indices(array) {
	const keys = Object.keys(array);
	keys.length = array_index_cut(keys);
	return keys;
}
//#endregion
//#region node_modules/.pnpm/devalue@5.9.2/node_modules/devalue/src/uneval.js
var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$";
var unsafe_chars = /[<\b\f\n\r\t\0\u2028\u2029]/g;
var reserved = /^(?:do|if|in|for|int|let|new|try|var|byte|case|char|else|enum|goto|long|this|void|with|await|break|catch|class|const|final|float|short|super|throw|while|yield|delete|double|export|import|native|return|switch|throws|typeof|boolean|default|extends|finally|package|private|abstract|continue|debugger|function|volatile|interface|protected|transient|implements|instanceof|synchronized)$/;
/**
* Turn a value into the JavaScript that creates an equivalent value
* @param {any} value
* @param {(value: any, uneval: (value: any) => string) => string | void} [replacer]
*/
function uneval(value, replacer) {
	const counts = /* @__PURE__ */ new Map();
	/** @type {string[]} */
	const keys = [];
	const custom = /* @__PURE__ */ new Map();
	/** @param {any} thing */
	function walk(thing) {
		if (!is_primitive(thing)) {
			if (counts.has(thing)) {
				counts.set(thing, counts.get(thing) + 1);
				return;
			}
			counts.set(thing, 1);
			if (replacer) {
				const str = replacer(thing, (value) => uneval(value, replacer));
				if (typeof str === "string") {
					custom.set(thing, str);
					return;
				}
			}
			if (typeof thing === "function") throw new DevalueError(`Cannot stringify a function`, keys, thing, value);
			switch (get_type(thing)) {
				case "Number":
				case "BigInt":
				case "String":
				case "Boolean":
				case "Date":
				case "RegExp":
				case "URL":
				case "URLSearchParams": return;
				case "Array":
					/** @type {any[]} */ thing.forEach((value, i) => {
						keys.push(`[${i}]`);
						walk(value);
						keys.pop();
					});
					break;
				case "Set":
					Array.from(thing).forEach(walk);
					break;
				case "Map":
					for (const [key, value] of thing) {
						keys.push(`.get(${is_primitive(key) ? stringify_primitive$1(key) : "..."})`);
						walk(key);
						walk(value);
						keys.pop();
					}
					break;
				case "Int8Array":
				case "Uint8Array":
				case "Uint8ClampedArray":
				case "Int16Array":
				case "Uint16Array":
				case "Float16Array":
				case "Int32Array":
				case "Uint32Array":
				case "Float32Array":
				case "Float64Array":
				case "BigInt64Array":
				case "BigUint64Array":
				case "DataView":
					walk(thing.buffer);
					return;
				case "ArrayBuffer": return;
				case "Temporal.Duration":
				case "Temporal.Instant":
				case "Temporal.PlainDate":
				case "Temporal.PlainTime":
				case "Temporal.PlainDateTime":
				case "Temporal.PlainMonthDay":
				case "Temporal.PlainYearMonth":
				case "Temporal.ZonedDateTime": return;
				default:
					if (!is_plain_object(thing)) throw new DevalueError(`Cannot stringify arbitrary non-POJOs`, keys, thing, value);
					if (enumerable_symbols(thing).length > 0) throw new DevalueError(`Cannot stringify POJOs with symbolic keys`, keys, thing, value);
					for (const key of Object.keys(thing)) {
						if (key === "__proto__") throw new DevalueError(`Cannot stringify objects with __proto__ keys`, keys, thing, value);
						keys.push(stringify_key(key));
						walk(thing[key]);
						keys.pop();
					}
			}
		} else if (typeof thing === "symbol") throw new DevalueError(`Cannot stringify a Symbol primitive`, keys, thing, value);
	}
	walk(value);
	const names = /* @__PURE__ */ new Map();
	Array.from(counts).filter((entry) => entry[1] > 1).sort((a, b) => b[1] - a[1]).forEach((entry, i) => {
		names.set(entry[0], get_name(i));
	});
	/**
	* @param {any} thing
	* @returns {string}
	*/
	function stringify(thing) {
		if (names.has(thing)) return names.get(thing);
		if (is_primitive(thing)) return stringify_primitive$1(thing);
		if (custom.has(thing)) return custom.get(thing);
		const type = get_type(thing);
		switch (type) {
			case "Number":
			case "String":
			case "Boolean":
			case "BigInt": return `Object(${stringify(thing.valueOf())})`;
			case "RegExp":
				const { source, flags } = thing;
				return flags ? `new RegExp(${stringify_string(source)},"${flags}")` : `new RegExp(${stringify_string(source)})`;
			case "Date": return `new Date(${thing.getTime()})`;
			case "URL": return `new URL(${stringify_string(thing.toString())})`;
			case "URLSearchParams": return `new URLSearchParams(${stringify_string(thing.toString())})`;
			case "Array": {
				let has_holes = false;
				let result = "[";
				for (let i = 0; i < thing.length; i += 1) {
					if (i > 0) result += ",";
					if (Object.hasOwn(thing, i)) result += stringify(thing[i]);
					else if (!has_holes) {
						const populated_keys = valid_array_indices(thing);
						const population = populated_keys.length;
						const d = String(thing.length).length;
						if (thing.length + 2 > 25 + d + population * (d + 2)) {
							const entries = populated_keys.map((k) => `${k}:${stringify(thing[k])}`).join(",");
							return `Object.assign(Array(${thing.length}),{${entries}})`;
						}
						has_holes = true;
					}
				}
				const tail = thing.length === 0 || thing.length - 1 in thing ? "" : ",";
				return result + tail + "]";
			}
			case "Set":
			case "Map": return `new ${type}([${Array.from(thing).map(stringify).join(",")}])`;
			case "Int8Array":
			case "Uint8Array":
			case "Uint8ClampedArray":
			case "Int16Array":
			case "Uint16Array":
			case "Float16Array":
			case "Int32Array":
			case "Uint32Array":
			case "Float32Array":
			case "Float64Array":
			case "BigInt64Array":
			case "BigUint64Array": {
				let str = `new ${type}`;
				if (!names.has(thing.buffer)) str += `([${stringify_typed_array_elements(type, thing.buffer)}])`;
				else str += `(${stringify(thing.buffer)})`;
				if (thing.byteLength !== thing.buffer.byteLength) {
					const start = thing.byteOffset / thing.BYTES_PER_ELEMENT;
					const end = start + thing.length;
					str += `.subarray(${start},${end})`;
				}
				return str;
			}
			case "DataView": {
				let str = `new DataView`;
				if (!names.has(thing.buffer)) str += `(new Uint8Array([${new Uint8Array(thing.buffer)}]).buffer`;
				else str += `(${stringify(thing.buffer)}`;
				if (thing.byteLength !== thing.buffer.byteLength) str += `,${thing.byteOffset},${thing.byteLength}`;
				return str + ")";
			}
			case "ArrayBuffer": return `new Uint8Array([${new Uint8Array(thing).toString()}]).buffer`;
			case "Temporal.Duration":
			case "Temporal.Instant":
			case "Temporal.PlainDate":
			case "Temporal.PlainTime":
			case "Temporal.PlainDateTime":
			case "Temporal.PlainMonthDay":
			case "Temporal.PlainYearMonth":
			case "Temporal.ZonedDateTime": return `${type}.from(${stringify_string(thing.toString())})`;
			default:
				const keys = Object.keys(thing);
				const obj = keys.map((key) => `${safe_key(key)}:${stringify(thing[key])}`).join(",");
				if (Object.getPrototypeOf(thing) === null) return keys.length > 0 ? `{${obj},__proto__:null}` : `{__proto__:null}`;
				return `{${obj}}`;
		}
	}
	const str = stringify(value);
	if (names.size) {
		/** @type {string[]} */
		const params = [];
		/** @type {string[]} */
		const statements = [];
		/** @type {string[]} */
		const values = [];
		/** @type {string[]} */
		const reconstructions = [];
		names.forEach((name, thing) => {
			params.push(name);
			if (custom.has(thing)) {
				values.push(custom.get(thing));
				return;
			}
			if (is_primitive(thing)) {
				values.push(stringify_primitive$1(thing));
				return;
			}
			const type = get_type(thing);
			switch (type) {
				case "Number":
				case "String":
				case "Boolean":
				case "BigInt":
					values.push(`Object(${stringify(thing.valueOf())})`);
					break;
				case "RegExp":
					const { source, flags } = thing;
					const regexp = flags ? `new RegExp(${stringify_string(source)},"${flags}")` : `new RegExp(${stringify_string(source)})`;
					values.push(regexp);
					break;
				case "Date":
					values.push(`new Date(${thing.getTime()})`);
					break;
				case "URL":
					values.push(`new URL(${stringify_string(thing.toString())})`);
					break;
				case "URLSearchParams":
					values.push(`new URLSearchParams(${stringify_string(thing.toString())})`);
					break;
				case "Array":
					values.push(`Array(${thing.length})`);
					/** @type {any[]} */ thing.forEach((v, i) => {
						statements.push(`${name}[${i}]=${stringify(v)}`);
					});
					break;
				case "Set": {
					values.push(`new Set`);
					const adds = Array.from(thing).map((v) => `.add(${stringify(v)})`);
					if (adds.length > 0) statements.push(name + adds.join(""));
					break;
				}
				case "Map": {
					values.push(`new Map`);
					const sets = Array.from(thing).map(([k, v]) => `.set(${stringify(k)}, ${stringify(v)})`);
					if (sets.length > 0) statements.push(name + sets.join(""));
					break;
				}
				case "Int8Array":
				case "Uint8Array":
				case "Uint8ClampedArray":
				case "Int16Array":
				case "Uint16Array":
				case "Float16Array":
				case "Int32Array":
				case "Uint32Array":
				case "Float32Array":
				case "Float64Array":
				case "BigInt64Array":
				case "BigUint64Array": {
					let str = `new ${type}`;
					if (!names.has(thing.buffer)) str += `([${stringify_typed_array_elements(type, thing.buffer)}])`;
					else str += `(${stringify(thing.buffer)})`;
					if (thing.byteLength !== thing.buffer.byteLength) {
						const start = thing.byteOffset / thing.BYTES_PER_ELEMENT;
						const end = start + thing.length;
						str += `.subarray(${start},${end})`;
					}
					values.push(`{}`);
					reconstructions.push(`${name}=${str}`);
					break;
				}
				case "DataView": {
					let str = `new DataView`;
					if (!names.has(thing.buffer)) str += `(new Uint8Array([${new Uint8Array(thing.buffer)}]).buffer`;
					else str += `(${stringify(thing.buffer)}`;
					if (thing.byteLength !== thing.buffer.byteLength) str += `,${thing.byteOffset},${thing.byteLength}`;
					str += ")";
					values.push(`{}`);
					reconstructions.push(`${name}=${str}`);
					break;
				}
				case "ArrayBuffer":
					values.push(`new Uint8Array([${new Uint8Array(thing)}]).buffer`);
					break;
				case "Temporal.Duration":
				case "Temporal.Instant":
				case "Temporal.PlainDate":
				case "Temporal.PlainTime":
				case "Temporal.PlainDateTime":
				case "Temporal.PlainMonthDay":
				case "Temporal.PlainYearMonth":
				case "Temporal.ZonedDateTime":
					values.push(`${type}.from(${stringify_string(thing.toString())})`);
					break;
				default:
					values.push(Object.getPrototypeOf(thing) === null ? "Object.create(null)" : "{}");
					Object.keys(thing).forEach((key) => {
						statements.push(`${name}${safe_prop(key)}=${stringify(thing[key])}`);
					});
			}
		});
		statements.push(`return ${str}`);
		const body = [...reconstructions, ...statements].join(";");
		if (params.length > 65534) return `(function(){var[${params.join(",")}]=arguments[0];${body}}([${values.join(",")}]))`;
		return `(function(${params.join(",")}){${body}}(${values.join(",")}))`;
	} else return str;
}
/**
* Serialize the elements of `buffer`, read as `type`, as a comma-separated list.
* The view is created from `type` rather than from the serialized value's own
* constructor, which may be a subclass like Node's `Buffer` whose `toString`
* decodes the bytes instead of listing them.
* `BigInt64Array`/`BigUint64Array` elements are bigints and must be written
* with an `n` suffix, otherwise the emitted `new BigInt64Array([...])` throws.
* @param {string} type
* @param {ArrayBufferLike} buffer
*/
function stringify_typed_array_elements(type, buffer) {
	const array = new globalThis[type](buffer);
	if (type === "BigInt64Array" || type === "BigUint64Array") return Array.from(array, (element) => `${element}n`).join(",");
	if (array instanceof Float32Array || array instanceof Float64Array || typeof Float16Array !== "undefined" && array instanceof Float16Array) return Array.from(array, (element) => Object.is(element, -0) ? "-0" : `${element}`).join(",");
	return array.toString();
}
/** @param {number} num */
function get_name(num) {
	let name = "";
	do {
		name = chars[num % 54] + name;
		num = ~~(num / 54) - 1;
	} while (num >= 0);
	return reserved.test(name) ? `${name}0` : name;
}
/** @param {string} c */
function escape_unsafe_char(c) {
	return escaped[c] || c;
}
/** @param {string} str */
function escape_unsafe_chars(str) {
	return str.replace(unsafe_chars, escape_unsafe_char);
}
/** @param {string} key */
function safe_key(key) {
	return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? key : escape_unsafe_chars(JSON.stringify(key));
}
/** @param {string} key */
function safe_prop(key) {
	return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? `.${key}` : `[${escape_unsafe_chars(JSON.stringify(key))}]`;
}
/** @param {any} thing */
function stringify_primitive$1(thing) {
	const type = typeof thing;
	if (type === "string") return stringify_string(thing);
	if (thing === void 0) return "void 0";
	if (thing === 0 && 1 / thing < 0) return "-0";
	const str = String(thing);
	if (type === "number") return str.replace(/^(-)?0\./, "$1.");
	if (type === "bigint") return thing + "n";
	return str;
}
//#endregion
//#region node_modules/.pnpm/devalue@5.9.2/node_modules/devalue/src/base64.js
/**	@type {(array_buffer: ArrayBuffer) => string} */
function encode_native(array_buffer) {
	return new Uint8Array(array_buffer).toBase64();
}
/**	@type {(base64: string) => ArrayBuffer} */
function decode_native(base64) {
	return Uint8Array.fromBase64(base64).buffer;
}
/** @type {(array_buffer: ArrayBuffer) => string} */
function encode_buffer(array_buffer) {
	return Buffer.from(array_buffer).toString("base64");
}
/**	@type {(base64: string) => ArrayBuffer} */
function decode_buffer(base64) {
	return Uint8Array.from(Buffer.from(base64, "base64")).buffer;
}
/** @type {(array_buffer: ArrayBuffer) => string} */
function encode_legacy(array_buffer) {
	const array = new Uint8Array(array_buffer);
	let binary = "";
	const chunk_size = 32768;
	for (let i = 0; i < array.length; i += chunk_size) {
		const chunk = array.subarray(i, i + chunk_size);
		binary += String.fromCharCode.apply(null, chunk);
	}
	return btoa(binary);
}
/**	@type {(base64: string) => ArrayBuffer} */
function decode_legacy(base64) {
	const binary_string = atob(base64);
	const len = binary_string.length;
	const array = new Uint8Array(len);
	for (let i = 0; i < len; i++) array[i] = binary_string.charCodeAt(i);
	return array.buffer;
}
var native = typeof Uint8Array.fromBase64 === "function";
var buffer = typeof process === "object" && process.versions?.node !== void 0;
var encode64 = native ? encode_native : buffer ? encode_buffer : encode_legacy;
var decode64 = native ? decode_native : buffer ? decode_buffer : decode_legacy;
//#endregion
//#region node_modules/.pnpm/devalue@5.9.2/node_modules/devalue/src/operations.js
/**
* Merges caller-provided operation overrides over the defaults. Iterating the
* default keys (rather than the override's own keys) means nullish members
* fall back to the default, and inherited members — e.g. from a class
* instance — are picked up.
*
* @template {Record<string, any>} T
* @param {T} defaults
* @param {Partial<T> | undefined} overrides
* @returns {T}
*/
function merge_operations(defaults, overrides) {
	if (!overrides) return defaults;
	const merged = {};
	for (const key of Object.keys(defaults)) merged[key] = overrides[key] ?? defaults[key];
	return merged;
}
/** @type {{ kind: 'not-plain' }} */
var NOT_PLAIN = Object.freeze({ kind: "not-plain" });
/** @type {{ kind: 'symbol-keys' }} */
var SYMBOL_KEYS = Object.freeze({ kind: "symbol-keys" });
var default_stringify_operations = Object.freeze({
	identify: (value) => value,
	typeOf: (value) => value === null ? "null" : typeof value,
	toPrimitive: (value) => value,
	tagOf: (value) => get_type(value),
	isThenable: (value) => typeof value.then === "function",
	toPromise: (thenable) => Promise.resolve(thenable),
	unbox: (boxed) => boxed.valueOf(),
	toISOString: (date) => isNaN(date.getDate()) ? "" : date.toISOString(),
	toStringValue: (value) => value.toString(),
	regExpInfo: (regexp) => ({
		source: regexp.source,
		flags: regexp.flags
	}),
	valuesOf: (set) => set,
	entriesOf: (map) => map,
	viewInfo: (view) => ({
		buffer: view.buffer,
		byteOffset: view.byteOffset,
		byteLength: view.byteLength,
		length: view.length,
		bufferByteLength: view.buffer.byteLength
	}),
	toArrayBuffer: (buffer) => buffer,
	lengthOf: (array) => array.length,
	hasOwn: (value, key) => Object.hasOwn(value, key),
	indicesOf: (array) => valid_array_indices(array),
	shapeOf: (value) => {
		if (!is_plain_object(value)) return NOT_PLAIN;
		if (enumerable_symbols(value).length > 0) return SYMBOL_KEYS;
		return {
			kind: Object.getPrototypeOf(value) === null ? "null-proto" : "plain",
			keys: Object.keys(value)
		};
	},
	get: (value, key) => value[key]
});
var default_parse_operations = Object.freeze({
	fromPrimitive: (primitive) => primitive,
	fromISOString: (iso) => new Date(iso),
	fromStringValue: (tag, text) => {
		if (tag === "URL") return new URL(text);
		if (tag === "URLSearchParams") return new URLSearchParams(text);
		return Temporal[tag.slice(9)].from(text);
	},
	fromArrayBuffer: (buffer) => buffer,
	fromRegExpInfo: (source, flags) => new RegExp(source, flags),
	fromViewInfo: (tag, buffer, byteOffset, length) => {
		const Constructor = globalThis[tag];
		return byteOffset !== void 0 ? new Constructor(buffer, byteOffset, length) : new Constructor(buffer);
	},
	box: (value) => Object(value),
	createArray: (length) => new Array(length),
	createSparseArray: (length) => {
		/** @type {any[]} */
		const array = [];
		array[MAX_ARRAY_INDEX] = void 0;
		delete array[MAX_ARRAY_INDEX];
		array.length = length;
		return array;
	},
	createObject: () => ({}),
	createNullPrototypeObject: () => Object.create(null),
	createSet: () => /* @__PURE__ */ new Set(),
	createMap: () => /* @__PURE__ */ new Map(),
	set: (target, key, value) => {
		target[key] = value;
	},
	addValue: (set, value) => {
		set.add(value);
	},
	addEntry: (map, key, value) => {
		map.set(key, value);
	}
});
//#endregion
//#region node_modules/.pnpm/devalue@5.9.2/node_modules/devalue/src/parse.js
/**
* Revive a value serialized with `devalue.stringify`
* @param {string} serialized
* @param {Record<string, (value: any) => any>} [revivers]
* @param {import('./types.js').ParseOptions} [options]
*/
function parse(serialized, revivers, options) {
	return unflatten(JSON.parse(serialized), revivers, options);
}
/**
* Revive a value flattened with `devalue.stringify`
* @param {number | any[]} parsed
* @param {Record<string, (value: any) => any>} [revivers]
* @param {import('./types.js').ParseOptions} [options]
*/
function unflatten(parsed, revivers, options) {
	/** @type {import('./types.js').ParseOperations} */
	const ops = merge_operations(default_parse_operations, options?.operations);
	if (typeof parsed === "number") return hydrate(parsed, true);
	if (!Array.isArray(parsed) || parsed.length === 0) throw new Error("Invalid input");
	const values = parsed;
	const hydrated = Array(values.length);
	/**
	* A set of values currently being hydrated with custom revivers,
	* used to detect invalid cyclical dependencies
	* @type {Set<number> | null}
	*/
	let hydrating = null;
	/**
	* @param {number} index
	* @returns {any}
	*/
	function hydrate(index, standalone = false) {
		if (index === -1) return ops.fromPrimitive(void 0);
		if (index === -3) return ops.fromPrimitive(NaN);
		if (index === -4) return ops.fromPrimitive(Infinity);
		if (index === -5) return ops.fromPrimitive(-Infinity);
		if (index === -6) return ops.fromPrimitive(-0);
		if (standalone || typeof index !== "number") throw new Error(`Invalid input`);
		if (index in hydrated) return hydrated[index];
		if (index >= values.length) throw new Error(`Invalid input`);
		const value = values[index];
		if (!value || typeof value !== "object") hydrated[index] = ops.fromPrimitive(value);
		else if (Array.isArray(value)) {
			if (typeof value[0] === "string") {
				const type = value[0];
				const reviver = revivers && Object.hasOwn(revivers, type) ? revivers[type] : void 0;
				if (reviver) {
					let i = value[1];
					if (typeof i !== "number") i = values.push(value[1]) - 1;
					if (Object.hasOwn(hydrated, i)) return hydrated[index] = reviver(hydrated[i]);
					hydrating ??= /* @__PURE__ */ new Set();
					if (hydrating.has(i)) throw new Error("Invalid circular reference");
					hydrating.add(i);
					hydrated[index] = reviver(hydrate(i));
					hydrating.delete(i);
					return hydrated[index];
				}
				switch (type) {
					case "Date":
						hydrated[index] = ops.fromISOString(value[1]);
						break;
					case "Set":
						const set = ops.createSet();
						hydrated[index] = set;
						for (let i = 1; i < value.length; i += 1) ops.addValue(set, hydrate(value[i]));
						break;
					case "Map":
						const map = ops.createMap();
						hydrated[index] = map;
						for (let i = 1; i < value.length; i += 2) ops.addEntry(map, hydrate(value[i]), hydrate(value[i + 1]));
						break;
					case "RegExp":
						hydrated[index] = ops.fromRegExpInfo(value[1], value[2]);
						break;
					case "Object": {
						const wrapped_index = value[1];
						if (typeof values[wrapped_index] === "object" && values[wrapped_index][0] !== "BigInt") throw new Error("Invalid input");
						hydrated[index] = ops.box(hydrate(wrapped_index));
						break;
					}
					case "BigInt":
						hydrated[index] = ops.fromPrimitive(BigInt(value[1]));
						break;
					case "null":
						const obj = ops.createNullPrototypeObject();
						hydrated[index] = obj;
						for (let i = 1; i < value.length; i += 2) {
							if (value[i] === "__proto__") throw new Error("Cannot parse an object with a `__proto__` property");
							ops.set(obj, value[i], hydrate(value[i + 1]));
						}
						break;
					case "Int8Array":
					case "Uint8Array":
					case "Uint8ClampedArray":
					case "Int16Array":
					case "Uint16Array":
					case "Float16Array":
					case "Int32Array":
					case "Uint32Array":
					case "Float32Array":
					case "Float64Array":
					case "BigInt64Array":
					case "BigUint64Array":
					case "DataView": {
						if (values[value[1]][0] !== "ArrayBuffer") throw new Error("Invalid data");
						const buffer = hydrate(value[1]);
						hydrated[index] = ops.fromViewInfo(type, buffer, value[2], value[3]);
						break;
					}
					case "ArrayBuffer": {
						const base64 = value[1];
						if (typeof base64 !== "string") throw new Error("Invalid ArrayBuffer encoding");
						hydrated[index] = ops.fromArrayBuffer(decode64(base64));
						break;
					}
					case "URL":
					case "URLSearchParams":
					case "Temporal.Duration":
					case "Temporal.Instant":
					case "Temporal.PlainDate":
					case "Temporal.PlainTime":
					case "Temporal.PlainDateTime":
					case "Temporal.PlainMonthDay":
					case "Temporal.PlainYearMonth":
					case "Temporal.ZonedDateTime":
						hydrated[index] = ops.fromStringValue(type, value[1]);
						break;
					default: throw new Error(`Unknown type ${type}`);
				}
			} else if (value[0] === -7) {
				const len = value[1];
				if (!is_valid_array_len(len)) throw new Error("Invalid input");
				const array = ops.createSparseArray(len);
				hydrated[index] = array;
				for (let i = 2; i < value.length; i += 2) {
					const idx = value[i];
					if (!is_valid_array_index(idx) || idx >= len) throw new Error("Invalid input");
					ops.set(array, idx, hydrate(value[i + 1]));
				}
			} else {
				const array = ops.createArray(value.length);
				hydrated[index] = array;
				for (let i = 0; i < value.length; i += 1) {
					const n = value[i];
					if (n === -2) continue;
					ops.set(array, i, hydrate(n));
				}
			}
		} else {
			const object = ops.createObject();
			hydrated[index] = object;
			for (const key of Object.keys(value)) {
				if (key === "__proto__") throw new Error("Cannot parse an object with a `__proto__` property");
				ops.set(object, key, hydrate(value[key]));
			}
		}
		return hydrated[index];
	}
	return hydrate(0);
}
//#endregion
//#region node_modules/.pnpm/devalue@5.9.2/node_modules/devalue/src/stringify.js
/**
* Turn a value into a JSON string that can be parsed with `devalue.parse`
* @param {any} value
* @param {Record<string, (value: any) => any>} [reducers]
* @param {import('./types.js').StringifyOptions} [options]
*/
function stringify(value, reducers, options) {
	const stringified = run(false, value, reducers, options);
	return typeof stringified === "string" ? stringified : `[${stringified.join(",")}]`;
}
/**
* @param {boolean} async
* @param {any} value
* @param {Record<string, (value: any) => any>} [reducers]
* @param {import('./types.js').StringifyOptions} [options]
*/
function run(async, value, reducers, options) {
	const ops = merge_operations(default_stringify_operations, options?.operations);
	/** @type {any[]} */
	const stringified = [];
	/** @type {Map<any, number>} */
	const indexes = /* @__PURE__ */ new Map();
	/** @type {Array<{ key: string, fn: (value: any) => any }>} */
	const custom = [];
	if (reducers) for (const key of Object.getOwnPropertyNames(reducers)) custom.push({
		key,
		fn: reducers[key]
	});
	/** @type {string[]} */
	const keys = [];
	let p = 0;
	/**
	* @param {any} thing
	* @param {number} [index]
	*/
	function flatten(thing, index) {
		const type = ops.typeOf(thing);
		if (type === "undefined") return -1;
		/** @type {number | undefined} */
		let number;
		if (type === "number") {
			number = ops.toPrimitive(thing);
			if (Number.isNaN(number)) return -3;
			if (number === Infinity) return -4;
			if (number === -Infinity) return -5;
			if (number === 0 && 1 / number < 0) return -6;
		}
		const id = ops.identify(thing);
		if (indexes.has(id)) return indexes.get(id);
		index ??= p++;
		indexes.set(id, index);
		for (const { key, fn } of custom) {
			const value = fn(thing);
			if (value) {
				stringified[index] = `["${key}",${flatten(value)}]`;
				return index;
			}
		}
		if (type === "function") throw new DevalueError(`Cannot stringify a function`, keys, thing, value);
		else if (type === "symbol") throw new DevalueError(`Cannot stringify a Symbol primitive`, keys, thing, value);
		/** @type {string | Promise<any>} */
		let str = "";
		if (type !== "object") str = stringify_primitive(type === "number" ? number : ops.toPrimitive(thing));
		else if (ops.isThenable(thing)) {
			if (!async) throw new DevalueError(`Cannot stringify a Promise or thenable — use stringifyAsync instead`, keys, thing, value);
			str = ops.toPromise(thing).then((value) => {
				const i = flatten(value, index);
				if (i < 0) stringified[index] = i;
			});
		} else {
			const tag = ops.tagOf(thing);
			switch (tag) {
				case "Number":
				case "String":
				case "Boolean":
				case "BigInt":
					str = `["Object",${flatten(ops.unbox(thing))}]`;
					break;
				case "Date":
					str = `["Date","${ops.toISOString(thing)}"]`;
					break;
				case "URL":
					str = `["URL",${stringify_string(ops.toStringValue(thing))}]`;
					break;
				case "URLSearchParams":
					str = `["URLSearchParams",${stringify_string(ops.toStringValue(thing))}]`;
					break;
				case "RegExp":
					const { source, flags } = ops.regExpInfo(thing);
					str = flags ? `["RegExp",${stringify_string(source)},"${flags}"]` : `["RegExp",${stringify_string(source)}]`;
					break;
				case "Array": {
					let mostly_dense = false;
					const length = ops.lengthOf(thing);
					str = "[";
					for (let i = 0; i < length; i += 1) {
						if (i > 0) str += ",";
						if (ops.hasOwn(thing, i)) {
							keys.push(`[${i}]`);
							str += flatten(ops.get(thing, i));
							keys.pop();
						} else if (mostly_dense) str += -2;
						else {
							const populated_keys = ops.indicesOf(thing);
							const population = populated_keys.length;
							const d = String(length).length;
							if ((length - population) * 3 > 4 + d + population * (d + 1)) {
								str = "[-7," + length;
								for (let j = 0; j < populated_keys.length; j++) {
									const key = populated_keys[j];
									keys.push(`[${key}]`);
									str += "," + key + "," + flatten(ops.get(thing, key));
									keys.pop();
								}
								break;
							} else {
								mostly_dense = true;
								str += -2;
							}
						}
					}
					str += "]";
					break;
				}
				case "Set":
					str = "[\"Set\"";
					for (const value of ops.valuesOf(thing)) str += `,${flatten(value)}`;
					str += "]";
					break;
				case "Map":
					str = "[\"Map\"";
					for (const [key, value] of ops.entriesOf(thing)) {
						const key_type = ops.typeOf(key);
						const key_is_primitive = key_type !== "object" && key_type !== "function" && key_type !== "symbol";
						keys.push(`.get(${key_is_primitive ? stringify_primitive(ops.toPrimitive(key)) : "..."})`);
						str += `,${flatten(key)},${flatten(value)}`;
						keys.pop();
					}
					str += "]";
					break;
				case "Int8Array":
				case "Uint8Array":
				case "Uint8ClampedArray":
				case "Int16Array":
				case "Uint16Array":
				case "Float16Array":
				case "Int32Array":
				case "Uint32Array":
				case "Float32Array":
				case "Float64Array":
				case "BigInt64Array":
				case "BigUint64Array": {
					const info = ops.viewInfo(thing);
					str = "[\"" + tag + "\"," + flatten(info.buffer);
					if (info.byteLength !== info.bufferByteLength) str += `,${info.byteOffset},${info.length}`;
					str += "]";
					break;
				}
				case "DataView": {
					const info = ops.viewInfo(thing);
					str = "[\"" + tag + "\"," + flatten(info.buffer);
					if (info.byteLength !== info.bufferByteLength) str += `,${info.byteOffset},${info.byteLength}`;
					str += "]";
					break;
				}
				case "ArrayBuffer":
					str = `["ArrayBuffer","${encode64(ops.toArrayBuffer(thing))}"]`;
					break;
				case "Temporal.Duration":
				case "Temporal.Instant":
				case "Temporal.PlainDate":
				case "Temporal.PlainTime":
				case "Temporal.PlainDateTime":
				case "Temporal.PlainMonthDay":
				case "Temporal.PlainYearMonth":
				case "Temporal.ZonedDateTime":
					str = `["${tag}",${stringify_string(ops.toStringValue(thing))}]`;
					break;
				default: {
					const shape = ops.shapeOf(thing);
					if (shape.kind === "not-plain") throw new DevalueError(`Cannot stringify arbitrary non-POJOs`, keys, thing, value);
					if (shape.kind === "symbol-keys") throw new DevalueError(`Cannot stringify POJOs with symbolic keys`, keys, thing, value);
					if (shape.kind === "null-proto") {
						str = "[\"null\"";
						for (const key of shape.keys) {
							if (key === "__proto__") throw new DevalueError(`Cannot stringify objects with __proto__ keys`, keys, thing, value);
							keys.push(stringify_key(key));
							str += `,${stringify_string(key)},${flatten(ops.get(thing, key))}`;
							keys.pop();
						}
						str += "]";
					} else {
						str = "{";
						let started = false;
						for (const key of shape.keys) {
							if (key === "__proto__") throw new DevalueError(`Cannot stringify objects with __proto__ keys`, keys, thing, value);
							if (started) str += ",";
							started = true;
							keys.push(stringify_key(key));
							str += `${stringify_string(key)}:${flatten(ops.get(thing, key))}`;
							keys.pop();
						}
						str += "}";
					}
				}
			}
		}
		stringified[index] = str;
		return index;
	}
	const index = flatten(value);
	if (index < 0) return `${index}`;
	return stringified;
}
/**
* @param {any} thing
* @returns {string}
*/
function stringify_primitive(thing) {
	const type = typeof thing;
	if (type === "string") return stringify_string(thing);
	if (thing === void 0) return (-1).toString();
	if (thing === 0 && 1 / thing < 0) return (-6).toString();
	if (type === "bigint") return `["BigInt","${thing}"]`;
	return String(thing);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0/node_modules/svelte/src/internal/client/constants.js
var CLEAN = 1024;
var DIRTY = 2048;
var MAYBE_DIRTY = 4096;
/** allow users to ignore aborted signal errors if `reason.name === 'StaleReactionError` */
var STALE_REACTION = new class StaleReactionError extends Error {
	name = "StaleReactionError";
	message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
globalThis.document?.contentType;
/**
* A `hydratable` value with key `%key%` was created, but at least part of it was not used during the render.
* 
* The `hydratable` was initialized in:
* %stack%
* @param {string} key
* @param {string} stack
*/
function unresolved_hydratable(key, stack) {
	console.warn(`https://svelte.dev/e/unresolved_hydratable`);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0/node_modules/svelte/src/internal/server/hydration.js
var BLOCK_OPEN = `<!--[-->`;
var BLOCK_CLOSE = `<!--]-->`;
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0/node_modules/svelte/src/escaping.js
var ATTR_REGEX = /[&"<]/g;
var CONTENT_REGEX = /[&<]/g;
/**
* @template V
* @param {V} value
* @param {boolean} [is_attr]
*/
function escape_html(value, is_attr) {
	const str = String(value ?? "");
	const pattern = is_attr ? ATTR_REGEX : CONTENT_REGEX;
	pattern.lastIndex = 0;
	let escaped = "";
	let last = 0;
	while (pattern.test(str)) {
		const i = pattern.lastIndex - 1;
		const ch = str[i];
		escaped += str.substring(last, i) + (ch === "&" ? "&amp;" : ch === "\"" ? "&quot;" : "&lt;");
		last = i + 1;
	}
	return escaped + str.substring(last);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0/node_modules/svelte/src/internal/shared/attributes.js
/**
* `<div translate={false}>` should be rendered as `<div translate="no">` and _not_
* `<div translate="false">`, which is equivalent to `<div translate="yes">`. There
* may be other odd cases that need to be added to this list in future
* @type {Record<string, Map<any, string>>}
*/
var replacements = { translate: /* @__PURE__ */ new Map([[true, "yes"], [false, "no"]]) };
/**
* @template V
* @param {string} name
* @param {V} value
* @param {boolean} [is_boolean]
* @returns {string}
*/
function attr(name, value, is_boolean = false) {
	if (name === "hidden" && value !== "until-found") is_boolean = true;
	if (value == null || is_boolean && !value && value !== "") return "";
	const normalized = has_own_property.call(replacements, name) && replacements[name].get(value) || value;
	return ` ${name}${is_boolean ? `=""` : `="${escape_html(normalized, true)}"`}`;
}
/**
* Small wrapper around clsx to preserve Svelte's (weird) handling of falsy values.
* TODO Svelte 6 revisit this, and likely turn all falsy values into the empty string (what clsx also does)
* @param  {any} value
*/
function clsx(value) {
	if (typeof value === "object") return clsx$1(value);
	else return value ?? "";
}
var whitespace = [..." 	\n\r\f\xA0\v﻿"];
/**
* @param {any} value
* @param {string | null} [hash]
* @param {Record<string, boolean>} [directives]
* @returns {string | null}
*/
function to_class(value, hash, directives) {
	var classname = value == null ? "" : "" + value;
	if (hash) classname = classname ? classname + " " + hash : hash;
	if (directives) {
		for (var key of Object.keys(directives)) if (directives[key]) classname = classname ? classname + " " + key : key;
		else if (classname.length) {
			var len = key.length;
			var a = 0;
			while ((a = classname.indexOf(key, a)) >= 0) {
				var b = a + len;
				if ((a === 0 || whitespace.includes(classname[a - 1])) && (b === classname.length || whitespace.includes(classname[b]))) classname = (a === 0 ? "" : classname.substring(0, a)) + classname.substring(b + 1);
				else a = b;
			}
		}
	}
	return classname === "" ? null : classname;
}
/**
*
* @param {Record<string,any>} styles
* @param {boolean} important
*/
function append_styles(styles, important = false) {
	var separator = important ? " !important;" : ";";
	var css = "";
	for (var key of Object.keys(styles)) {
		var value = styles[key];
		if (value != null && value !== "") css += " " + key + ": " + value + separator;
	}
	return css;
}
/**
* @param {string} name
* @returns {string}
*/
function to_css_name(name) {
	if (name[0] !== "-" || name[1] !== "-") return name.toLowerCase();
	return name;
}
/**
* @param {any} value
* @param {Record<string, any> | [Record<string, any>, Record<string, any>]} [styles]
* @returns {string | null}
*/
function to_style(value, styles) {
	if (styles) {
		var new_style = "";
		/** @type {Record<string,any> | undefined} */
		var normal_styles;
		/** @type {Record<string,any> | undefined} */
		var important_styles;
		if (Array.isArray(styles)) {
			normal_styles = styles[0];
			important_styles = styles[1];
		} else normal_styles = styles;
		if (value) {
			value = String(value).replaceAll(/\/\*.*?\*\//g, "").trim();
			/** @type {boolean | '"' | "'"} */
			var in_str = false;
			var in_apo = 0;
			var in_comment = false;
			var reserved_names = [];
			if (normal_styles) reserved_names.push(...Object.keys(normal_styles).map(to_css_name));
			if (important_styles) reserved_names.push(...Object.keys(important_styles).map(to_css_name));
			var start_index = 0;
			var name_index = -1;
			const len = value.length;
			for (var i = 0; i < len; i++) {
				var c = value[i];
				if (in_comment) {
					if (c === "/" && value[i - 1] === "*") in_comment = false;
				} else if (in_str) {
					if (in_str === c) in_str = false;
				} else if (c === "/" && value[i + 1] === "*") in_comment = true;
				else if (c === "\"" || c === "'") in_str = c;
				else if (c === "(") in_apo++;
				else if (c === ")") in_apo--;
				if (!in_comment && in_str === false && in_apo === 0) {
					if (c === ":" && name_index === -1) name_index = i;
					else if (c === ";" || i === len - 1) {
						if (name_index !== -1) {
							var name = to_css_name(value.substring(start_index, name_index).trim());
							if (!reserved_names.includes(name)) {
								if (c !== ";") i++;
								var property = value.substring(start_index, i).trim();
								new_style += " " + property + ";";
							}
						}
						start_index = i + 1;
						name_index = -1;
					}
				}
			}
		}
		if (normal_styles) new_style += append_styles(normal_styles);
		if (important_styles) new_style += append_styles(important_styles, true);
		new_style = new_style.trim();
		return new_style === "" ? null : new_style;
	}
	return value == null ? null : String(value);
}
~(DIRTY | MAYBE_DIRTY | CLEAN);
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0/node_modules/svelte/src/utils.js
/**
* Attributes that are boolean, i.e. they are present or not present.
*/
var DOM_BOOLEAN_ATTRIBUTES = [
	"allowfullscreen",
	"async",
	"autofocus",
	"autoplay",
	"checked",
	"controls",
	"default",
	"disabled",
	"formnovalidate",
	"indeterminate",
	"inert",
	"ismap",
	"loop",
	"multiple",
	"muted",
	"nomodule",
	"novalidate",
	"open",
	"playsinline",
	"readonly",
	"required",
	"reversed",
	"seamless",
	"selected",
	"webkitdirectory",
	"defer",
	"disablepictureinpicture",
	"disableremoteplayback"
];
/**
* Returns `true` if `name` is a boolean attribute
* @param {string} name
*/
function is_boolean_attribute(name) {
	return DOM_BOOLEAN_ATTRIBUTES.includes(name);
}
[...DOM_BOOLEAN_ATTRIBUTES];
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0/node_modules/svelte/src/internal/server/index.js
var INVALID_ATTR_NAME_CHAR_REGEX = /[\s'">/=\u{FDD0}-\u{FDEF}\u{FFFE}\u{FFFF}\u{1FFFE}\u{1FFFF}\u{2FFFE}\u{2FFFF}\u{3FFFE}\u{3FFFF}\u{4FFFE}\u{4FFFF}\u{5FFFE}\u{5FFFF}\u{6FFFE}\u{6FFFF}\u{7FFFE}\u{7FFFF}\u{8FFFE}\u{8FFFF}\u{9FFFE}\u{9FFFF}\u{AFFFE}\u{AFFFF}\u{BFFFE}\u{BFFFF}\u{CFFFE}\u{CFFFF}\u{DFFFE}\u{DFFFF}\u{EFFFE}\u{EFFFF}\u{FFFFE}\u{FFFFF}\u{10FFFE}\u{10FFFF}]/u;
/**
* Only available on the server and when compiling with the `server` option.
* Takes a component and returns an object with `body` and `head` properties on it, which you can use to populate the HTML when server-rendering your app.
* @template {Record<string, any>} Props
* @param {Component<Props> | ComponentType<SvelteComponent<Props>>} component
* @param {{ props?: Omit<Props, '$$slots' | '$$events'>; context?: Map<any, any>; idPrefix?: string; csp?: Csp; transformError?: (error: unknown) => unknown }} [options]
* @returns {RenderOutput}
*/
function render$1(component, options = {}) {
	if (options.csp?.hash && options.csp.nonce) invalid_csp();
	return Renderer.render(component, options);
}
/**
* @param {Record<string, unknown>} attrs
* @param {string} [css_hash]
* @param {Record<string, boolean>} [classes]
* @param {Record<string, string>} [styles]
* @param {number} [flags]
* @returns {string}
*/
function attributes(attrs, css_hash, classes, styles, flags = 0) {
	if (styles) attrs.style = to_style(attrs.style, styles);
	if (attrs.class) attrs.class = clsx(attrs.class);
	if (css_hash || classes) attrs.class = to_class(attrs.class, css_hash, classes);
	let attr_str = "";
	let name;
	const is_html = (flags & 1) === 0;
	const lowercase = (flags & 2) === 0;
	const is_input = (flags & 4) !== 0;
	for (name of Object.keys(attrs)) {
		if (typeof attrs[name] === "function") continue;
		if (name[0] === "$" && name[1] === "$") continue;
		if (name === "" || INVALID_ATTR_NAME_CHAR_REGEX.test(name)) continue;
		var value = attrs[name];
		var lower = name.toLowerCase();
		if (lowercase) name = lower;
		if (lower.length > 2 && lower.startsWith("on")) continue;
		if (is_input) {
			if (name === "defaultvalue" || name === "defaultchecked") {
				name = name === "defaultvalue" ? "value" : "checked";
				if (attrs[name]) continue;
			}
		}
		attr_str += attr(name, value, is_html && is_boolean_attribute(name));
	}
	return attr_str;
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0/node_modules/svelte/src/internal/server/crypto.js
var text_encoder;
var crypto;
/** @param {string} module_name */
var obfuscated_import = (module_name) => import(
	/* @vite-ignore */
	module_name
);
/** @param {string} data */
async function sha256(data) {
	text_encoder ??= new TextEncoder();
	crypto ??= globalThis.crypto?.subtle?.digest ? globalThis.crypto : (await obfuscated_import("node:crypto")).webcrypto;
	return base64_encode(await crypto.subtle.digest("SHA-256", text_encoder.encode(data)));
}
/**
* @param {Uint8Array} bytes
* @returns {string}
*/
function base64_encode(bytes) {
	if (globalThis.Buffer) return globalThis.Buffer.from(bytes).toString("base64");
	let binary = "";
	for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
	return btoa(binary);
}
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0/node_modules/svelte/src/internal/server/renderer.js
/** @import { Component } from 'svelte' */
/** @import { HydratableContext, SSRContext } from './types.js' */
/** @import { Csp, RenderOutput, SyncRenderOutput, Sha256Source } from '../../server/public.js' */
/** @import { MaybePromise } from '#shared' */
/** @typedef {'head' | 'body'} RendererType */
/** @typedef {{ [key in RendererType]: string }} AccumulatedContent */
/**
* @typedef {string | Renderer} RendererItem
*/
/**
* Renderers are basically a tree of `string | Renderer`s, where each `Renderer` in the tree represents
* work that may or may not have completed. A renderer can be {@link collect}ed to aggregate the
* content from itself and all of its children, but this will throw if any of the children are
* performing asynchronous work. To asynchronously collect a renderer, just `await` it.
*
* The `string` values within a renderer are always associated with the {@link type} of that renderer. To switch types,
* call {@link child} with a different `type` argument.
*/
var Renderer = class Renderer {
	/**
	* The contents of the renderer.
	* @type {RendererItem[]}
	*/
	#out = [];
	/**
	* Any `onDestroy` callbacks registered during execution of this renderer.
	* @type {(() => void)[] | undefined}
	*/
	#on_destroy = void 0;
	/**
	* Whether this renderer is a component body.
	* @type {boolean}
	*/
	#is_component_body = false;
	/**
	* If set, this renderer is an error boundary. When async collection
	* of the children fails, the failed snippet is rendered instead.
	* @type {{
	* 	failed: (renderer: Renderer, error: unknown, reset: () => void) => void;
	* 	transformError: (error: unknown) => unknown;
	* 	context: SSRContext | null;
	* } | null}
	*/
	#boundary = null;
	/**
	* The type of string content that this renderer is accumulating.
	* @type {RendererType}
	*/
	type;
	/** @type {Renderer | undefined} */
	#parent;
	/**
	* Asynchronous work associated with this renderer
	* @type {Promise<void> | undefined}
	*/
	promise = void 0;
	/**
	* State which is associated with the content tree as a whole.
	* It will be re-exposed, uncopied, on all children.
	* @type {SSRState}
	* @readonly
	*/
	global;
	/**
	* State that is local to the branch it is declared in.
	* It will be shallow-copied to all children.
	*
	* @type {{ select_value: any, multiple: boolean }}
	*/
	local;
	/**
	* @param {SSRState} global
	* @param {Renderer | undefined} [parent]
	*/
	constructor(global, parent) {
		this.#parent = parent;
		this.global = global;
		this.local = parent ? { ...parent.local } : {
			select_value: void 0,
			multiple: false
		};
		this.type = parent ? parent.type : "body";
	}
	/**
	* @param {(renderer: Renderer) => void} fn
	*/
	head(fn) {
		const head = new Renderer(this.global, this);
		head.type = "head";
		this.#out.push(head);
		head.child(fn);
	}
	/**
	* @param {Array<Promise<void>>} blockers
	* @param {(renderer: Renderer) => void} fn
	*/
	async_block(blockers, fn) {
		this.#out.push(BLOCK_OPEN);
		this.async(blockers, fn);
		this.#out.push(BLOCK_CLOSE);
	}
	/**
	* @param {Array<Promise<void>>} blockers
	* @param {(renderer: Renderer) => void} fn
	*/
	async(blockers, fn) {
		let callback = fn;
		if (blockers.length > 0) {
			const context = ssr_context;
			callback = (renderer) => {
				return Promise.all(blockers).then(() => {
					const previous_context = ssr_context;
					try {
						set_ssr_context(context);
						return fn(renderer);
					} finally {
						set_ssr_context(previous_context);
					}
				});
			};
		}
		this.child(callback);
	}
	/**
	* @param {Array<() => void>} thunks
	*/
	run(thunks) {
		const context = ssr_context;
		let promise = Promise.resolve(thunks[0]());
		const promises = [promise];
		for (const fn of thunks.slice(1)) {
			promise = promise.then(() => {
				const previous_context = ssr_context;
				set_ssr_context(context);
				try {
					return fn();
				} finally {
					set_ssr_context(previous_context);
				}
			});
			promises.push(promise);
		}
		promise.catch(noop);
		this.promise = this.global.track(promise);
		return promises;
	}
	/**
	* @param {(renderer: Renderer) => MaybePromise<void>} fn
	*/
	child_block(fn) {
		this.#out.push(BLOCK_OPEN);
		this.child(fn);
		this.#out.push(BLOCK_CLOSE);
	}
	/**
	* Create a child renderer. The child renderer inherits the state from the parent,
	* but has its own content.
	* @param {(renderer: Renderer) => MaybePromise<void>} fn
	*/
	child(fn) {
		const child = new Renderer(this.global, this);
		this.#out.push(child);
		const parent = ssr_context;
		set_ssr_context({
			...ssr_context,
			p: parent,
			c: null,
			r: child
		});
		const result = fn(child);
		set_ssr_context(parent);
		if (result instanceof Promise) {
			result.catch(noop);
			result.finally(() => set_ssr_context(null)).catch(noop);
			if (child.global.mode === "sync") await_invalid();
			child.promise = child.global.track(result);
		}
		return child;
	}
	/**
	* Render children inside an error boundary. If the children throw and the API-level
	* `transformError` transform handles the error (doesn't re-throw), the `failed` snippet is
	* rendered instead. Otherwise the error propagates.
	*
	* @param {{ failed?: (renderer: Renderer, error: unknown, reset: () => void) => void }} props
	* @param {(renderer: Renderer) => MaybePromise<void>} children_fn
	*/
	boundary(props, children_fn) {
		const child = new Renderer(this.global, this);
		this.#out.push(child);
		const parent_context = ssr_context;
		if (props.failed) child.#boundary = {
			failed: props.failed,
			transformError: this.global.transformError,
			context: parent_context
		};
		set_ssr_context({
			...ssr_context,
			p: parent_context,
			c: null,
			r: child
		});
		try {
			const result = children_fn(child);
			set_ssr_context(parent_context);
			if (result instanceof Promise) {
				if (child.global.mode === "sync") await_invalid();
				result.catch(noop);
				child.promise = child.global.track(result);
			}
		} catch (error) {
			set_ssr_context(parent_context);
			const failed_snippet = props.failed;
			if (!failed_snippet) throw error;
			const result = this.global.transformError(error);
			child.#out.length = 0;
			child.#boundary = null;
			if (result instanceof Promise) {
				if (this.global.mode === "sync") await_invalid();
				child.promise = child.global.track(
					/** @type {Promise<unknown>} */
					result.then((transformed) => {
						set_ssr_context(parent_context);
						child.#out.push(Renderer.#serialize_failed_boundary(transformed));
						failed_snippet(child, transformed, noop);
						child.#out.push(BLOCK_CLOSE);
					})
				);
				child.promise.catch(noop);
			} else {
				child.#out.push(Renderer.#serialize_failed_boundary(result));
				failed_snippet(child, result, noop);
				child.#out.push(BLOCK_CLOSE);
			}
		}
	}
	/**
	* Create a component renderer. The component renderer inherits the state from the parent,
	* but has its own content. It is treated as an ordering boundary for ondestroy callbacks.
	* @param {(renderer: Renderer) => MaybePromise<void>} fn
	* @param {Function} [component_fn]
	* @returns {void}
	*/
	component(fn, component_fn) {
		push(component_fn);
		this.child((renderer) => {
			renderer.#is_component_body = true;
			return fn(renderer);
		});
		pop();
	}
	/**
	* @param {Record<string, any>} attrs
	* @param {(renderer: Renderer) => void} fn
	* @param {string | undefined} [css_hash]
	* @param {Record<string, boolean> | undefined} [classes]
	* @param {Record<string, string> | undefined} [styles]
	* @param {number | undefined} [flags]
	* @param {boolean | undefined} [is_rich]
	* @returns {void}
	*/
	select(attrs, fn, css_hash, classes, styles, flags, is_rich) {
		const { value, defaultValue, ...select_attrs } = attrs;
		if (select_attrs.multiple === "") select_attrs.multiple = true;
		this.push(`<select${attributes(select_attrs, css_hash, classes, styles, flags)}>`);
		this.child((renderer) => {
			renderer.local.select_value = value === void 0 ? defaultValue : value;
			renderer.local.multiple = !!select_attrs.multiple;
			fn(renderer);
		});
		this.push(`${is_rich ? "<!>" : ""}</select>`);
	}
	/**
	* @param {Record<string, any>} attrs
	* @param {string | number | boolean | ((renderer: Renderer) => void)} body
	* @param {string | undefined} [css_hash]
	* @param {Record<string, boolean> | undefined} [classes]
	* @param {Record<string, string> | undefined} [styles]
	* @param {number | undefined} [flags]
	* @param {boolean | undefined} [is_rich]
	*/
	option(attrs, body, css_hash, classes, styles, flags, is_rich) {
		this.#out.push(`<option${attributes(attrs, css_hash, classes, styles, flags)}`);
		/**
		* @param {Renderer} renderer
		* @param {any} value
		* @param {{ head?: string, body: any }} content
		*/
		const close = (renderer, value, { head, body }) => {
			if (has_own_property.call(attrs, "value")) value = attrs.value;
			var select_value = this.local.select_value;
			if (this.local.multiple && is_array(select_value) ? select_value.includes(value) : value === select_value) renderer.#out.push(" selected=\"\"");
			renderer.#out.push(`>${body}${is_rich ? "<!>" : ""}</option>`);
			if (head) renderer.head((child) => child.push(head));
		};
		if (typeof body === "function") this.child((renderer) => {
			const r = new Renderer(this.global, this);
			body(r);
			if (this.global.mode === "async") return r.#collect_content_async().then((content) => {
				close(renderer, content.body.replaceAll("<!---->", ""), content);
			});
			else {
				const content = r.#collect_content();
				close(renderer, content.body.replaceAll("<!---->", ""), content);
			}
		});
		else close(this, body, { body: escape_html(body) });
	}
	/**
	* @param {(renderer: Renderer) => void} fn
	*/
	title(fn) {
		const path = this.get_path();
		/** @param {string} head */
		const close = (head) => {
			this.global.set_title(head, path);
		};
		this.child((renderer) => {
			const r = new Renderer(renderer.global, renderer);
			fn(r);
			if (renderer.global.mode === "async") return r.#collect_content_async().then((content) => {
				close(content.head);
			});
			else {
				const content = r.#collect_content();
				close(content.head);
			}
		});
	}
	/**
	* @param {string | (() => Promise<string>)} content
	*/
	push(content) {
		if (typeof content === "function") this.child(async (renderer) => renderer.push(await content()));
		else this.#out.push(content);
	}
	/**
	* @param {() => void} fn
	*/
	on_destroy(fn) {
		(this.#on_destroy ??= []).push(fn);
	}
	/**
	* @returns {number[]}
	*/
	get_path() {
		return this.#parent ? [...this.#parent.get_path(), this.#parent.#out.indexOf(this)] : [];
	}
	/**
	* @deprecated this is needed for legacy component bindings
	*/
	copy() {
		const copy = new Renderer(this.global, this.#parent);
		copy.type = this.type;
		copy.#out = this.#out.map((item) => item instanceof Renderer ? item.copy() : item);
		copy.promise = this.promise;
		return copy;
	}
	/**
	* @param {Renderer} other
	* @deprecated this is needed for legacy component bindings
	*/
	subsume(other) {
		if (this.global.mode !== other.global.mode) throw new Error("invariant: A renderer cannot switch modes. If you're seeing this, there's a compiler bug. File an issue!");
		this.local = other.local;
		this.#out = other.#out.map((item, i) => {
			const current = this.#out[i];
			if (current instanceof Renderer && item instanceof Renderer) {
				current.subsume(item);
				return current;
			}
			return item;
		});
		this.promise = other.promise;
		this.type = other.type;
	}
	get length() {
		return this.#out.length;
	}
	/**
	* Creates the hydration comment that marks the start of a failed boundary.
	* The error is JSON-serialized and embedded inside an HTML comment for the client
	* to parse during hydration. The JSON is escaped to prevent `-->` or `<!--` sequences
	* from breaking out of the comment (XSS). Uses unicode escapes which `JSON.parse()`
	* handles transparently.
	* @param {unknown} error
	* @returns {string}
	*/
	static #serialize_failed_boundary(error) {
		return `<!--[?${JSON.stringify(error).replace(/>/g, "\\u003e").replace(/</g, "\\u003c")}-->`;
	}
	/**
	* Only available on the server and when compiling with the `server` option.
	* Takes a component and returns an object with `body` and `head` properties on it, which you can use to populate the HTML when server-rendering your app.
	* @template {Record<string, any>} Props
	* @param {Component<Props>} component
	* @param {{ props?: Omit<Props, '$$slots' | '$$events'>; context?: Map<any, any>; idPrefix?: string; csp?: Csp }} [options]
	* @returns {RenderOutput}
	*/
	static render(component, options = {}) {
		/** @type {AccumulatedContent | undefined} */
		let sync;
		/** @type {Promise<AccumulatedContent & { hashes: { script: Sha256Source[] } }> | undefined} */
		let async;
		const result = {};
		Object.defineProperties(result, {
			html: { get: () => {
				return (sync ??= Renderer.#render(component, options)).body;
			} },
			head: { get: () => {
				return (sync ??= Renderer.#render(component, options)).head;
			} },
			body: { get: () => {
				return (sync ??= Renderer.#render(component, options)).body;
			} },
			hashes: { value: { script: "" } },
			then: { value: 
			/**
			* this is not type-safe, but honestly it's the best I can do right now, and it's a straightforward function.
			*
			* @template TResult1
			* @template [TResult2=never]
			* @param { (value: SyncRenderOutput) => TResult1 } onfulfilled
			* @param { (reason: unknown) => TResult2 } onrejected
			*/
			(onfulfilled, onrejected) => {
				if (!async_mode_flag) {
					const result = sync ??= Renderer.#render(component, options);
					const user_result = onfulfilled({
						head: result.head,
						body: result.body,
						html: result.body,
						hashes: { script: [] }
					});
					return Promise.resolve(user_result);
				}
				async ??= init_render_context().then(() => with_render_context(() => Renderer.#render_async(component, options)));
				return async.then((result) => {
					Object.defineProperty(result, "html", { get: () => {
						html_deprecated();
					} });
					return onfulfilled(result);
				}, onrejected);
			} }
		});
		return result;
	}
	/**
	* Collect all of the `onDestroy` callbacks registered during rendering. In an async context, this is only safe to call
	* after awaiting `collect_async`.
	*
	* Child renderers are "porous" and don't affect execution order, but component body renderers
	* create ordering boundaries. Within a renderer, callbacks run in order until hitting a component boundary.
	* @returns {Iterable<() => void>}
	*/
	*#collect_on_destroy() {
		for (const component of this.#traverse_components()) yield* component.#collect_ondestroy();
	}
	/**
	* Performs a depth-first search of renderers, yielding the deepest components first, then additional components as we backtrack up the tree.
	* @returns {Iterable<Renderer>}
	*/
	*#traverse_components() {
		for (const child of this.#out) if (typeof child !== "string") yield* child.#traverse_components();
		if (this.#is_component_body) yield this;
	}
	/**
	* @returns {Iterable<() => void>}
	*/
	*#collect_ondestroy() {
		if (this.#on_destroy) for (const fn of this.#on_destroy) yield fn;
		for (const child of this.#out) if (child instanceof Renderer && !child.#is_component_body) yield* child.#collect_ondestroy();
	}
	/**
	* Runs every `onDestroy` callback in this renderer tree. On a failed render,
	* cleanup errors are suppressed so they do not mask the render error.
	* @param {boolean} suppress_errors
	*/
	#run_on_destroy(suppress_errors) {
		let first_error;
		let has_error = false;
		for (const cleanup of this.#collect_on_destroy()) try {
			cleanup();
		} catch (error) {
			if (!suppress_errors && !has_error) {
				first_error = error;
				has_error = true;
			}
		}
		if (has_error) throw first_error;
	}
	/**
	* @param {'sync' | 'async'} mode
	* @param {{ idPrefix?: string; csp?: Csp; transformError?: (error: unknown) => unknown }} options
	* @returns {Renderer}
	*/
	static #create(mode, options) {
		if (options.idPrefix?.includes("--")) invalid_id_prefix();
		return new Renderer(new SSRState(mode, options.idPrefix ? options.idPrefix + "-" : "", options.csp, options.transformError));
	}
	/**
	* Render a component. Throws if any of the children are performing asynchronous work.
	*
	* @template {Record<string, any>} Props
	* @param {Component<Props>} component
	* @param {{ props?: Omit<Props, '$$slots' | '$$events'>; context?: Map<any, any>; idPrefix?: string }} options
	* @returns {AccumulatedContent}
	*/
	static #render(component, options) {
		var previous_context = ssr_context;
		const renderer = Renderer.#create("sync", options);
		/** @type {AccumulatedContent | undefined} */
		let result;
		let render_error;
		let failed = false;
		try {
			try {
				Renderer.#open_render(renderer, component, options);
				result = Renderer.#close_render(renderer.#collect_content(), renderer);
			} catch (error) {
				render_error = error;
				failed = true;
			}
			renderer.#run_on_destroy(failed);
			if (failed) throw render_error;
			return result;
		} finally {
			renderer.global.abort();
			set_ssr_context(previous_context);
		}
	}
	/**
	* Render a component.
	*
	* @template {Record<string, any>} Props
	* @param {Component<Props>} component
	* @param {{ props?: Omit<Props, '$$slots' | '$$events'>; context?: Map<any, any>; idPrefix?: string; csp?: Csp }} options
	* @returns {Promise<AccumulatedContent & { hashes: { script: Sha256Source[] } }>}
	*/
	static async #render_async(component, options) {
		const previous_context = ssr_context;
		const renderer = Renderer.#create("async", options);
		/** @type {(AccumulatedContent & { hashes: { script: Sha256Source[] } }) | undefined} */
		let result;
		let render_error;
		let failed = false;
		try {
			try {
				Renderer.#open_render(renderer, component, options);
				const content = await renderer.#collect_content_async();
				const hydratables = await renderer.#collect_hydratables();
				if (hydratables !== null) content.head = hydratables + content.head;
				result = Renderer.#close_render(content, renderer);
			} catch (error) {
				render_error = error;
				failed = true;
				renderer.global.abort();
				await renderer.global.settle();
			}
			renderer.#run_on_destroy(failed);
			if (failed) throw render_error;
			return result;
		} finally {
			set_ssr_context(previous_context);
			renderer.global.abort();
		}
	}
	/**
	* Collect all of the code from the `out` array and return it as a string, or a promise resolving to a string.
	* @param {AccumulatedContent} content
	* @returns {AccumulatedContent}
	*/
	#collect_content(content = {
		head: "",
		body: ""
	}) {
		for (const item of this.#out) if (typeof item === "string") content[this.type] += item;
		else if (item instanceof Renderer) item.#collect_content(content);
		return content;
	}
	/**
	* Collect all of the code from the `out` array and return it as a string.
	* @param {AccumulatedContent} content
	* @returns {Promise<AccumulatedContent>}
	*/
	async #collect_content_async(content = {
		head: "",
		body: ""
	}) {
		await this.promise;
		for (const item of this.#out) if (typeof item === "string") content[this.type] += item;
		else if (item instanceof Renderer) {
			if (item.#boundary) {
				/** @type {AccumulatedContent} */
				const boundary_content = {
					head: "",
					body: ""
				};
				try {
					await item.#collect_content_async(boundary_content);
					content.head += boundary_content.head;
					content.body += boundary_content.body;
				} catch (error) {
					const { context, failed, transformError } = item.#boundary;
					set_ssr_context(context);
					let promise = transformError(error);
					set_ssr_context(null);
					let transformed = await promise;
					set_ssr_context(context);
					const failed_renderer = new Renderer(item.global, item);
					failed_renderer.type = item.type;
					failed_renderer.#out.push(Renderer.#serialize_failed_boundary(transformed));
					failed(failed_renderer, transformed, noop);
					failed_renderer.#out.push(BLOCK_CLOSE);
					await failed_renderer.#collect_content_async(content);
				}
			} else await item.#collect_content_async(content);
		}
		return content;
	}
	async #collect_hydratables() {
		const ctx = get_render_context().hydratable;
		for (const [_, key] of ctx.unresolved_promises) unresolved_hydratable(key, ctx.lookup.get(key)?.stack ?? "<missing stack trace>");
		for (const comparison of ctx.comparisons) await comparison;
		return await this.#hydratable_block(ctx);
	}
	/**
	* @template {Record<string, any>} Props
	* @param {Renderer} renderer
	* @param {import('svelte').Component<Props>} component
	* @param {{ props?: Omit<Props, '$$slots' | '$$events'>; context?: Map<any, any>; idPrefix?: string; csp?: Csp; transformError?: (error: unknown) => unknown }} options
	* @returns {void}
	*/
	static #open_render(renderer, component, options) {
		var previous_context = ssr_context;
		try {
			set_ssr_context({
				p: null,
				c: options.context ?? null,
				r: renderer
			});
			renderer.push(BLOCK_OPEN);
			component(renderer, options.props ?? {});
			renderer.push(BLOCK_CLOSE);
		} finally {
			set_ssr_context(previous_context);
		}
	}
	/**
	* @param {AccumulatedContent} content
	* @param {Renderer} renderer
	* @returns {AccumulatedContent & { hashes: { script: Sha256Source[] } }}
	*/
	static #close_render(content, renderer) {
		let head = content.head + renderer.global.get_title();
		let body = content.body;
		for (const { hash, code } of renderer.global.css) head += `<style id="${hash}">${code}</style>`;
		return {
			head,
			body,
			hashes: { script: renderer.global.csp.script_hashes }
		};
	}
	/**
	* @param {HydratableContext} ctx
	*/
	async #hydratable_block(ctx) {
		if (ctx.lookup.size === 0) return null;
		let entries = [];
		let has_promises = false;
		for (const [k, v] of ctx.lookup) {
			if (v.promises) {
				has_promises = true;
				for (const p of v.promises) await p;
			}
			entries.push(`[${uneval(k)},${v.serialized}]`);
		}
		let prelude = `const h = (window.__svelte ??= {}).h ??= new Map();`;
		if (has_promises) prelude = `const r = (v) => Promise.resolve(v);
				${prelude}`;
		const body = `
			{
				${prelude}

				for (const [k, v] of [
					${entries.join(",\n					")}
				]) {
					h.set(k, v);
				}
			}
		`;
		let csp_attr = "";
		if (this.global.csp.nonce) csp_attr = ` nonce="${this.global.csp.nonce}"`;
		else if (this.global.csp.hash) {
			const hash = await sha256(body);
			this.global.csp.script_hashes.push(`sha256-${hash}`);
		}
		return `\n\t\t<script${csp_attr}>${body}<\/script>`;
	}
};
var SSRState = class {
	/** @readonly @type {Csp & { script_hashes: Sha256Source[] }} */
	csp;
	/** @readonly @type {'sync' | 'async'} */
	mode;
	/** @readonly @type {() => string} */
	uid;
	/** @readonly @type {Set<{ hash: string; code: string }>} */
	css = /* @__PURE__ */ new Set();
	/** @type {Set<Promise<unknown>>} */
	#pending = /* @__PURE__ */ new Set();
	/** @type {AbortController | null} */
	#controller = null;
	#aborted = false;
	/**
	* `transformError` passed to `render`. Called when an error boundary catches an error.
	* Throws by default if unset in `render`.
	* @type {(error: unknown) => unknown}
	*/
	transformError;
	/** @type {{ path: number[], value: string }} */
	#title = {
		path: [],
		value: ""
	};
	/**
	* @param {'sync' | 'async'} mode
	* @param {string} id_prefix
	* @param {Csp} csp
	* @param {((error: unknown) => unknown) | undefined} [transformError]
	*/
	constructor(mode, id_prefix = "", csp = { hash: false }, transformError) {
		this.mode = mode;
		this.csp = {
			...csp,
			script_hashes: []
		};
		this.transformError = transformError ?? ((error) => {
			throw error;
		});
		let uid = 1;
		this.uid = () => `${id_prefix}s${uid++}`;
	}
	/**
	* @template T
	* @param {Promise<T>} promise
	* @returns {Promise<T>}
	*/
	track(promise) {
		this.#pending.add(promise);
		promise.then(() => this.#pending.delete(promise), () => this.#pending.delete(promise));
		return promise;
	}
	async settle() {
		while (this.#pending.size > 0) await Promise.allSettled([...this.#pending]);
	}
	abort() {
		if (this.#aborted) return;
		this.#aborted = true;
		this.#controller?.abort(STALE_REACTION);
	}
	get_abort_signal() {
		const controller = this.#controller ??= new AbortController();
		if (this.#aborted) controller.abort(STALE_REACTION);
		return controller.signal;
	}
	get_title() {
		return this.#title.value;
	}
	/**
	* Performs a depth-first (lexicographic) comparison using the path. Rejects sets
	* from earlier than or equal to the current value.
	* @param {string} value
	* @param {number[]} path
	*/
	set_title(value, path) {
		const current = this.#title.path;
		let i = 0;
		let l = Math.min(path.length, current.length);
		while (i < l && path[i] === current[i]) i += 1;
		if (path[i] === void 0) return;
		if (current[i] === void 0 || path[i] > current[i]) {
			this.#title.path = path;
			this.#title.value = value;
		}
	}
};
//#endregion
//#region node_modules/.pnpm/svelte@5.57.0/node_modules/svelte/src/internal/server/blocks/snippet.js
/** @import { Snippet } from 'svelte' */
/** @import { Renderer } from '../renderer' */
/** @import { Getters } from '#shared' */
/**
* Create a snippet programmatically
* @template {unknown[]} Params
* @param {(...params: Getters<Params>) => {
*   render: () => string
*   setup?: (element: Element) => void | (() => void)
* }} fn
* @returns {Snippet<Params>}
*/
function createRawSnippet(fn) {
	return (renderer, ...args) => {
		var getters = args.map((value) => () => value);
		renderer.push(fn(...getters).render().trim());
	};
}
//#endregion
//#region node_modules/.pnpm/@astrojs+svelte@9.0.1_@type_e20dc72b32cbc0fbc807c67b9e93409b/node_modules/@astrojs/svelte/dist/context.js
var contexts = /* @__PURE__ */ new WeakMap();
var ID_PREFIX = "s";
function getContext(rendererContextResult) {
	if (contexts.has(rendererContextResult)) return contexts.get(rendererContextResult);
	const ctx = {
		currentIndex: 0,
		get id() {
			return ID_PREFIX + this.currentIndex.toString();
		}
	};
	contexts.set(rendererContextResult, ctx);
	return ctx;
}
function incrementId(rendererContextResult) {
	const ctx = getContext(rendererContextResult);
	const id = ctx.id;
	ctx.currentIndex++;
	return id;
}
//#endregion
//#region node_modules/.pnpm/@astrojs+svelte@9.0.1_@type_e20dc72b32cbc0fbc807c67b9e93409b/node_modules/@astrojs/svelte/dist/server.js
function check$1(Component) {
	if (typeof Component !== "function") return false;
	const componentString = Component.toString();
	return componentString.includes("$$payload") || componentString.includes("$$renderer");
}
function needsHydration(metadata) {
	return metadata?.astroStaticSlot ? !!metadata.hydrate : true;
}
async function renderToStaticMarkup$1(Component, props, slotted, metadata) {
	const tagName = needsHydration(metadata) ? "astro-slot" : "astro-static-slot";
	let children = void 0;
	let $$slots = void 0;
	let idPrefix;
	if (this && this.result) idPrefix = incrementId(this.result);
	const renderProps = {};
	for (const [key, value] of Object.entries(slotted)) {
		$$slots ??= {};
		if (key === "default") {
			$$slots.default = true;
			children = createRawSnippet(() => ({ render: () => `<${tagName}>${value}</${tagName}>` }));
		} else $$slots[key] = createRawSnippet(() => ({ render: () => `<${tagName} name="${key}">${value}</${tagName}>` }));
		const slotName = key === "default" ? "children" : key;
		renderProps[slotName] = createRawSnippet(() => ({ render: () => `<${tagName}${key !== "default" ? ` name="${key}"` : ""}>${value}</${tagName}>` }));
	}
	let html = (await render$1(Component, {
		props: {
			...props,
			children,
			$$slots,
			...renderProps
		},
		idPrefix
	})).body;
	html = html.replace(/\s+class=""/g, "");
	return { html };
}
var server_default$1 = {
	name: "@astrojs/svelte",
	check: check$1,
	renderToStaticMarkup: renderToStaticMarkup$1,
	supportsAstroStaticSlot: true
};
//#endregion
//#region node_modules/.pnpm/@astrojs+mdx@8.0.1_@astrojs_79dde7aecdfaf63ccb019a3f61b73d7c/node_modules/@astrojs/mdx/dist/server.js
var slotName = (str) => str.trim().replace(/[-_]([a-z])/g, (_, w) => w.toUpperCase());
async function check(Component, props, { default: children = null, ...slotted } = {}) {
	if (typeof Component !== "function") return false;
	const slots = {};
	for (const [key, value] of Object.entries(slotted)) {
		const name = slotName(key);
		slots[name] = value;
	}
	try {
		return (await Component({
			...props,
			...slots,
			children
		}))[AstroJSX];
	} catch (e) {
		throwEnhancedErrorIfMdxComponent(e, Component);
	}
	return false;
}
async function renderToStaticMarkup(Component, props = {}, { default: children = null, ...slotted } = {}) {
	const slots = {};
	for (const [key, value] of Object.entries(slotted)) {
		const name = slotName(key);
		slots[name] = value;
	}
	const { result } = this;
	try {
		let html = "";
		const destination = { write(chunk) {
			if (chunk instanceof Response) return;
			html += chunkToString(result, chunk);
		} };
		await renderStreaming(createVNode(Component, {
			...props,
			...slots,
			children
		}), result, destination);
		return { html };
	} catch (e) {
		throwEnhancedErrorIfMdxComponent(e, Component);
		throw e;
	}
}
function throwEnhancedErrorIfMdxComponent(error, Component) {
	if (Component[/* @__PURE__ */ Symbol.for("mdx-component")]) {
		if (AstroUserError.is(error)) return;
		error.title = error.name;
		error.hint = `This issue often occurs when your MDX component encounters runtime errors.`;
		throw error;
	}
}
var server_default = {
	name: "astro:jsx",
	check,
	renderToStaticMarkup
};
//#endregion
//#region \0virtual:astro:renderers
var renderers = [Object.assign({
	"name": "@astrojs/svelte",
	"clientEntrypoint": "@astrojs/svelte/client.js",
	"serverEntrypoint": "@astrojs/svelte/server.js"
}, { ssr: server_default$1 }), Object.assign({
	"name": "astro:jsx",
	"serverEntrypoint": "file:///D:/MY%20blog/Firefly/node_modules/.pnpm/@astrojs+mdx@8.0.1_@astrojs_79dde7aecdfaf63ccb019a3f61b73d7c/node_modules/@astrojs/mdx/dist/server.js"
}, { ssr: server_default })];
[
	{
		"file": "",
		"links": [],
		"scripts": [],
		"styles": [],
		"routeData": {
			"type": "page",
			"component": "_server-islands.astro",
			"params": ["name"],
			"segments": [[{
				"content": "_server-islands",
				"dynamic": false,
				"spread": false
			}], [{
				"content": "name",
				"dynamic": true,
				"spread": false
			}]],
			"pattern": "^\\/_server-islands\\/([^/]+?)\\/$",
			"prerender": false,
			"isIndex": false,
			"fallbackRoutes": [],
			"route": "/_server-islands/[name]",
			"origin": "internal",
			"distURL": [],
			"_meta": { "trailingSlash": "always" }
		}
	},
	{
		"file": "",
		"links": [],
		"scripts": [],
		"styles": [],
		"routeData": {
			"route": "/_image",
			"component": "node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/assets/endpoint/generic.js",
			"params": [],
			"pathname": "/_image",
			"pattern": "^\\/_image\\/$",
			"segments": [[{
				"content": "_image",
				"dynamic": false,
				"spread": false
			}]],
			"type": "endpoint",
			"prerender": false,
			"fallbackRoutes": [],
			"distURL": [],
			"isIndex": false,
			"origin": "internal",
			"_meta": { "trailingSlash": "always" }
		}
	},
	{
		"file": "",
		"links": [],
		"scripts": [],
		"styles": [],
		"routeData": {
			"route": "/api/admin/data/[...name]",
			"isIndex": false,
			"type": "endpoint",
			"pattern": "^\\/api\\/admin\\/data(?:\\/(.*?))?\\/$",
			"segments": [
				[{
					"content": "api",
					"dynamic": false,
					"spread": false
				}],
				[{
					"content": "admin",
					"dynamic": false,
					"spread": false
				}],
				[{
					"content": "data",
					"dynamic": false,
					"spread": false
				}],
				[{
					"content": "...name",
					"dynamic": true,
					"spread": true
				}]
			],
			"params": ["...name"],
			"component": "src/pages/api/admin/data/[...name].ts",
			"prerender": false,
			"fallbackRoutes": [],
			"distURL": [],
			"origin": "project",
			"_meta": { "trailingSlash": "always" }
		}
	},
	{
		"file": "",
		"links": [],
		"scripts": [],
		"styles": [],
		"routeData": {
			"route": "/api/admin/dynamic/[...filename]",
			"isIndex": false,
			"type": "endpoint",
			"pattern": "^\\/api\\/admin\\/dynamic(?:\\/(.*?))?\\/$",
			"segments": [
				[{
					"content": "api",
					"dynamic": false,
					"spread": false
				}],
				[{
					"content": "admin",
					"dynamic": false,
					"spread": false
				}],
				[{
					"content": "dynamic",
					"dynamic": false,
					"spread": false
				}],
				[{
					"content": "...filename",
					"dynamic": true,
					"spread": true
				}]
			],
			"params": ["...filename"],
			"component": "src/pages/api/admin/dynamic/[...filename].ts",
			"prerender": false,
			"fallbackRoutes": [],
			"distURL": [],
			"origin": "project",
			"_meta": { "trailingSlash": "always" }
		}
	},
	{
		"file": "",
		"links": [],
		"scripts": [],
		"styles": [],
		"routeData": {
			"route": "/api/admin/dynamics",
			"isIndex": false,
			"type": "endpoint",
			"pattern": "^\\/api\\/admin\\/dynamics\\/$",
			"segments": [
				[{
					"content": "api",
					"dynamic": false,
					"spread": false
				}],
				[{
					"content": "admin",
					"dynamic": false,
					"spread": false
				}],
				[{
					"content": "dynamics",
					"dynamic": false,
					"spread": false
				}]
			],
			"params": [],
			"component": "src/pages/api/admin/dynamics.ts",
			"pathname": "/api/admin/dynamics",
			"prerender": false,
			"fallbackRoutes": [],
			"distURL": [],
			"origin": "project",
			"_meta": { "trailingSlash": "always" }
		}
	},
	{
		"file": "",
		"links": [],
		"scripts": [],
		"styles": [],
		"routeData": {
			"route": "/api/admin/login",
			"isIndex": false,
			"type": "endpoint",
			"pattern": "^\\/api\\/admin\\/login\\/$",
			"segments": [
				[{
					"content": "api",
					"dynamic": false,
					"spread": false
				}],
				[{
					"content": "admin",
					"dynamic": false,
					"spread": false
				}],
				[{
					"content": "login",
					"dynamic": false,
					"spread": false
				}]
			],
			"params": [],
			"component": "src/pages/api/admin/login.ts",
			"pathname": "/api/admin/login",
			"prerender": false,
			"fallbackRoutes": [],
			"distURL": [],
			"origin": "project",
			"_meta": { "trailingSlash": "always" }
		}
	},
	{
		"file": "",
		"links": [],
		"scripts": [],
		"styles": [],
		"routeData": {
			"route": "/api/admin/post/[...filename]",
			"isIndex": false,
			"type": "endpoint",
			"pattern": "^\\/api\\/admin\\/post(?:\\/(.*?))?\\/$",
			"segments": [
				[{
					"content": "api",
					"dynamic": false,
					"spread": false
				}],
				[{
					"content": "admin",
					"dynamic": false,
					"spread": false
				}],
				[{
					"content": "post",
					"dynamic": false,
					"spread": false
				}],
				[{
					"content": "...filename",
					"dynamic": true,
					"spread": true
				}]
			],
			"params": ["...filename"],
			"component": "src/pages/api/admin/post/[...filename].ts",
			"prerender": false,
			"fallbackRoutes": [],
			"distURL": [],
			"origin": "project",
			"_meta": { "trailingSlash": "always" }
		}
	},
	{
		"file": "",
		"links": [],
		"scripts": [],
		"styles": [],
		"routeData": {
			"route": "/api/admin/posts",
			"isIndex": false,
			"type": "endpoint",
			"pattern": "^\\/api\\/admin\\/posts\\/$",
			"segments": [
				[{
					"content": "api",
					"dynamic": false,
					"spread": false
				}],
				[{
					"content": "admin",
					"dynamic": false,
					"spread": false
				}],
				[{
					"content": "posts",
					"dynamic": false,
					"spread": false
				}]
			],
			"params": [],
			"component": "src/pages/api/admin/posts.ts",
			"pathname": "/api/admin/posts",
			"prerender": false,
			"fallbackRoutes": [],
			"distURL": [],
			"origin": "project",
			"_meta": { "trailingSlash": "always" }
		}
	},
	{
		"file": "",
		"links": [],
		"scripts": [],
		"styles": [],
		"routeData": {
			"route": "/api/admin/project/[...filename]",
			"isIndex": false,
			"type": "endpoint",
			"pattern": "^\\/api\\/admin\\/project(?:\\/(.*?))?\\/$",
			"segments": [
				[{
					"content": "api",
					"dynamic": false,
					"spread": false
				}],
				[{
					"content": "admin",
					"dynamic": false,
					"spread": false
				}],
				[{
					"content": "project",
					"dynamic": false,
					"spread": false
				}],
				[{
					"content": "...filename",
					"dynamic": true,
					"spread": true
				}]
			],
			"params": ["...filename"],
			"component": "src/pages/api/admin/project/[...filename].ts",
			"prerender": false,
			"fallbackRoutes": [],
			"distURL": [],
			"origin": "project",
			"_meta": { "trailingSlash": "always" }
		}
	},
	{
		"file": "",
		"links": [],
		"scripts": [],
		"styles": [],
		"routeData": {
			"route": "/api/admin/projects",
			"isIndex": false,
			"type": "endpoint",
			"pattern": "^\\/api\\/admin\\/projects\\/$",
			"segments": [
				[{
					"content": "api",
					"dynamic": false,
					"spread": false
				}],
				[{
					"content": "admin",
					"dynamic": false,
					"spread": false
				}],
				[{
					"content": "projects",
					"dynamic": false,
					"spread": false
				}]
			],
			"params": [],
			"component": "src/pages/api/admin/projects.ts",
			"pathname": "/api/admin/projects",
			"prerender": false,
			"fallbackRoutes": [],
			"distURL": [],
			"origin": "project",
			"_meta": { "trailingSlash": "always" }
		}
	},
	{
		"file": "",
		"links": [],
		"scripts": [],
		"styles": [],
		"routeData": {
			"route": "/api/admin/spec/[...name]",
			"isIndex": false,
			"type": "endpoint",
			"pattern": "^\\/api\\/admin\\/spec(?:\\/(.*?))?\\/$",
			"segments": [
				[{
					"content": "api",
					"dynamic": false,
					"spread": false
				}],
				[{
					"content": "admin",
					"dynamic": false,
					"spread": false
				}],
				[{
					"content": "spec",
					"dynamic": false,
					"spread": false
				}],
				[{
					"content": "...name",
					"dynamic": true,
					"spread": true
				}]
			],
			"params": ["...name"],
			"component": "src/pages/api/admin/spec/[...name].ts",
			"prerender": false,
			"fallbackRoutes": [],
			"distURL": [],
			"origin": "project",
			"_meta": { "trailingSlash": "always" }
		}
	},
	{
		"file": "",
		"links": [],
		"scripts": [],
		"styles": [],
		"routeData": {
			"route": "/api/admin/stats",
			"isIndex": false,
			"type": "endpoint",
			"pattern": "^\\/api\\/admin\\/stats\\/$",
			"segments": [
				[{
					"content": "api",
					"dynamic": false,
					"spread": false
				}],
				[{
					"content": "admin",
					"dynamic": false,
					"spread": false
				}],
				[{
					"content": "stats",
					"dynamic": false,
					"spread": false
				}]
			],
			"params": [],
			"component": "src/pages/api/admin/stats.ts",
			"pathname": "/api/admin/stats",
			"prerender": false,
			"fallbackRoutes": [],
			"distURL": [],
			"origin": "project",
			"_meta": { "trailingSlash": "always" }
		}
	},
	{
		"file": "",
		"links": [],
		"scripts": [],
		"styles": [],
		"routeData": {
			"route": "/api/auth",
			"isIndex": false,
			"type": "endpoint",
			"pattern": "^\\/api\\/auth\\/$",
			"segments": [[{
				"content": "api",
				"dynamic": false,
				"spread": false
			}], [{
				"content": "auth",
				"dynamic": false,
				"spread": false
			}]],
			"params": [],
			"component": "src/pages/api/auth.ts",
			"pathname": "/api/auth",
			"prerender": false,
			"fallbackRoutes": [],
			"distURL": [],
			"origin": "project",
			"_meta": { "trailingSlash": "always" }
		}
	},
	{
		"file": "",
		"links": [],
		"scripts": [],
		"styles": [],
		"routeData": {
			"route": "/api/callback",
			"isIndex": false,
			"type": "endpoint",
			"pattern": "^\\/api\\/callback\\/$",
			"segments": [[{
				"content": "api",
				"dynamic": false,
				"spread": false
			}], [{
				"content": "callback",
				"dynamic": false,
				"spread": false
			}]],
			"params": [],
			"component": "src/pages/api/callback.ts",
			"pathname": "/api/callback",
			"prerender": false,
			"fallbackRoutes": [],
			"distURL": [],
			"origin": "project",
			"_meta": { "trailingSlash": "always" }
		}
	},
	{
		"file": "",
		"links": [],
		"scripts": [],
		"styles": [],
		"routeData": {
			"route": "/dashboard",
			"isIndex": false,
			"type": "page",
			"pattern": "^\\/dashboard\\/$",
			"segments": [[{
				"content": "dashboard",
				"dynamic": false,
				"spread": false
			}]],
			"params": [],
			"component": "src/pages/dashboard.astro",
			"pathname": "/dashboard",
			"prerender": false,
			"fallbackRoutes": [],
			"distURL": [],
			"origin": "project",
			"_meta": { "trailingSlash": "always" }
		}
	}
].map(deserializeRouteInfo);
//#endregion
//#region \0virtual:astro:pages
var _page0 = () => import("./chunks/generic_vbIowRCh.mjs").then((n) => n.t);
var _page1 = () => import("./chunks/_.._snr9tE9W.mjs");
var _page2 = () => import("./chunks/_.._pvn26Luw.mjs");
var _page3 = () => import("./chunks/dynamics_BUogwTms.mjs");
var _page4 = () => import("./chunks/login_HgBpRJeO.mjs");
var _page5 = () => import("./chunks/_.._BXsIYLE4.mjs");
var _page6 = () => import("./chunks/posts_9wSiHbON.mjs");
var _page7 = () => import("./chunks/_.._BcY03EMu.mjs");
var _page8 = () => import("./chunks/projects_CMx7tPFl.mjs");
var _page9 = () => import("./chunks/_.._IfvErfSk.mjs");
var _page10 = () => import("./chunks/stats_C3MfuBwg.mjs");
var _page11 = () => import("./chunks/auth_CH4lJ6Ha.mjs");
var _page12 = () => import("./chunks/callback_Cu46FiYz.mjs");
var _page13 = () => import("./chunks/dashboard_B1Fks1yS.mjs");
var pageMap = /* @__PURE__ */ new Map([
	["node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/assets/endpoint/generic.js", _page0],
	["src/pages/api/admin/data/[...name].ts", _page1],
	["src/pages/api/admin/dynamic/[...filename].ts", _page2],
	["src/pages/api/admin/dynamics.ts", _page3],
	["src/pages/api/admin/login.ts", _page4],
	["src/pages/api/admin/post/[...filename].ts", _page5],
	["src/pages/api/admin/posts.ts", _page6],
	["src/pages/api/admin/project/[...filename].ts", _page7],
	["src/pages/api/admin/projects.ts", _page8],
	["src/pages/api/admin/spec/[...name].ts", _page9],
	["src/pages/api/admin/stats.ts", _page10],
	["src/pages/api/auth.ts", _page11],
	["src/pages/api/callback.ts", _page12],
	["src/pages/dashboard.astro", _page13]
]);
//#endregion
//#region \0virtual:astro:manifest
var _manifest = deserializeManifest({"rootDir":"file:///D:/MY%20blog/Firefly/","cacheDir":"file:///D:/MY%20blog/Firefly/node_modules/.astro/","outDir":"file:///D:/MY%20blog/Firefly/dist/","srcDir":"file:///D:/MY%20blog/Firefly/src/","publicDir":"file:///D:/MY%20blog/Firefly/public/","buildClientDir":"file:///D:/MY%20blog/Firefly/dist/client/","buildServerDir":"file:///D:/MY%20blog/Firefly/dist/server/","adapterName":"@edgeone/astro","assetsDir":"_astro","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"page","component":"_server-islands.astro","params":["name"],"segments":[[{"content":"_server-islands","dynamic":false,"spread":false}],[{"content":"name","dynamic":true,"spread":false}]],"pattern":"^\\/_server-islands\\/([^/]+?)\\/$","prerender":false,"isIndex":false,"fallbackRoutes":[],"route":"/_server-islands/[name]","origin":"internal","distURL":[],"_meta":{"trailingSlash":"always"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.BpqnxC_1.js"}],"styles":[],"routeData":{"route":"/_image","component":"node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/assets/endpoint/generic.js","params":[],"pathname":"/_image","pattern":"^\\/_image\\/$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"type":"endpoint","prerender":false,"fallbackRoutes":[],"distURL":[],"isIndex":false,"origin":"internal","_meta":{"trailingSlash":"always"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.BpqnxC_1.js"}],"styles":[],"routeData":{"route":"/404","isIndex":false,"type":"page","pattern":"^\\/404\\/$","segments":[[{"content":"404","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/404.astro","pathname":"/404","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"always"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.BpqnxC_1.js"}],"styles":[],"routeData":{"route":"/about","isIndex":false,"type":"page","pattern":"^\\/about\\/$","segments":[[{"content":"about","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/about.astro","pathname":"/about","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"always"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.BpqnxC_1.js"}],"styles":[],"routeData":{"route":"/admin","isIndex":false,"type":"page","pattern":"^\\/admin\\/$","segments":[[{"content":"admin","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/admin.astro","pathname":"/admin","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"always"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.BpqnxC_1.js"}],"styles":[],"routeData":{"route":"/api/admin/data/[...name]","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/admin\\/data(?:\\/(.*?))?\\/$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"admin","dynamic":false,"spread":false}],[{"content":"data","dynamic":false,"spread":false}],[{"content":"...name","dynamic":true,"spread":true}]],"params":["...name"],"component":"src/pages/api/admin/data/[...name].ts","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"always"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.BpqnxC_1.js"}],"styles":[],"routeData":{"route":"/api/admin/dynamic/[...filename]","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/admin\\/dynamic(?:\\/(.*?))?\\/$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"admin","dynamic":false,"spread":false}],[{"content":"dynamic","dynamic":false,"spread":false}],[{"content":"...filename","dynamic":true,"spread":true}]],"params":["...filename"],"component":"src/pages/api/admin/dynamic/[...filename].ts","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"always"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.BpqnxC_1.js"}],"styles":[],"routeData":{"route":"/api/admin/dynamics","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/admin\\/dynamics\\/$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"admin","dynamic":false,"spread":false}],[{"content":"dynamics","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/admin/dynamics.ts","pathname":"/api/admin/dynamics","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"always"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.BpqnxC_1.js"}],"styles":[],"routeData":{"route":"/api/admin/login","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/admin\\/login\\/$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"admin","dynamic":false,"spread":false}],[{"content":"login","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/admin/login.ts","pathname":"/api/admin/login","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"always"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.BpqnxC_1.js"}],"styles":[],"routeData":{"route":"/api/admin/post/[...filename]","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/admin\\/post(?:\\/(.*?))?\\/$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"admin","dynamic":false,"spread":false}],[{"content":"post","dynamic":false,"spread":false}],[{"content":"...filename","dynamic":true,"spread":true}]],"params":["...filename"],"component":"src/pages/api/admin/post/[...filename].ts","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"always"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.BpqnxC_1.js"}],"styles":[],"routeData":{"route":"/api/admin/posts","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/admin\\/posts\\/$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"admin","dynamic":false,"spread":false}],[{"content":"posts","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/admin/posts.ts","pathname":"/api/admin/posts","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"always"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.BpqnxC_1.js"}],"styles":[],"routeData":{"route":"/api/admin/project/[...filename]","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/admin\\/project(?:\\/(.*?))?\\/$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"admin","dynamic":false,"spread":false}],[{"content":"project","dynamic":false,"spread":false}],[{"content":"...filename","dynamic":true,"spread":true}]],"params":["...filename"],"component":"src/pages/api/admin/project/[...filename].ts","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"always"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.BpqnxC_1.js"}],"styles":[],"routeData":{"route":"/api/admin/projects","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/admin\\/projects\\/$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"admin","dynamic":false,"spread":false}],[{"content":"projects","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/admin/projects.ts","pathname":"/api/admin/projects","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"always"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.BpqnxC_1.js"}],"styles":[],"routeData":{"route":"/api/admin/spec/[...name]","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/admin\\/spec(?:\\/(.*?))?\\/$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"admin","dynamic":false,"spread":false}],[{"content":"spec","dynamic":false,"spread":false}],[{"content":"...name","dynamic":true,"spread":true}]],"params":["...name"],"component":"src/pages/api/admin/spec/[...name].ts","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"always"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.BpqnxC_1.js"}],"styles":[],"routeData":{"route":"/api/admin/stats","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/admin\\/stats\\/$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"admin","dynamic":false,"spread":false}],[{"content":"stats","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/admin/stats.ts","pathname":"/api/admin/stats","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"always"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.BpqnxC_1.js"}],"styles":[],"routeData":{"route":"/api/allPostMeta.json","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/allPostMeta\\.json$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"allPostMeta.json","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/allPostMeta.json.ts","pathname":"/api/allPostMeta.json","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"always"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.BpqnxC_1.js"}],"styles":[],"routeData":{"route":"/api/auth","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/auth\\/$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"auth","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/auth.ts","pathname":"/api/auth","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"always"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.BpqnxC_1.js"}],"styles":[],"routeData":{"route":"/api/callback","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/callback\\/$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"callback","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/callback.ts","pathname":"/api/callback","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"always"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.BpqnxC_1.js"}],"styles":[],"routeData":{"route":"/api/dynamic.json","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/dynamic\\.json$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"dynamic.json","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/dynamic.json.ts","pathname":"/api/dynamic.json","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"always"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.BpqnxC_1.js"}],"styles":[],"routeData":{"route":"/archive","isIndex":false,"type":"page","pattern":"^\\/archive\\/$","segments":[[{"content":"archive","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/archive.astro","pathname":"/archive","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"always"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.BpqnxC_1.js"}],"styles":[],"routeData":{"route":"/atom","isIndex":false,"type":"page","pattern":"^\\/atom\\/$","segments":[[{"content":"atom","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/atom.astro","pathname":"/atom","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"always"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.BpqnxC_1.js"}],"styles":[],"routeData":{"route":"/atom.xml","isIndex":false,"type":"endpoint","pattern":"^\\/atom\\.xml$","segments":[[{"content":"atom.xml","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/atom.xml.ts","pathname":"/atom.xml","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"always"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.BpqnxC_1.js"}],"styles":[],"routeData":{"route":"/bangumi","isIndex":false,"type":"page","pattern":"^\\/bangumi\\/$","segments":[[{"content":"bangumi","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/bangumi.astro","pathname":"/bangumi","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"always"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.BpqnxC_1.js"}],"styles":[],"routeData":{"route":"/bilibili","isIndex":false,"type":"page","pattern":"^\\/bilibili\\/$","segments":[[{"content":"bilibili","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/bilibili.astro","pathname":"/bilibili","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"always"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.BpqnxC_1.js"}],"styles":[],"routeData":{"route":"/booknav","isIndex":false,"type":"page","pattern":"^\\/booknav\\/$","segments":[[{"content":"booknav","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/booknav.astro","pathname":"/booknav","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"always"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.BpqnxC_1.js"}],"styles":[],"routeData":{"route":"/categories","isIndex":true,"type":"page","pattern":"^\\/categories\\/$","segments":[[{"content":"categories","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/categories/index.astro","pathname":"/categories","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"always"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.BpqnxC_1.js"}],"styles":[{"type":"external","src":"_astro/dashboard.DHbVaD5Q.css"}],"routeData":{"route":"/dashboard","isIndex":false,"type":"page","pattern":"^\\/dashboard\\/$","segments":[[{"content":"dashboard","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/dashboard.astro","pathname":"/dashboard","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"always"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.BpqnxC_1.js"}],"styles":[],"routeData":{"route":"/dynamic/comments","isIndex":false,"type":"page","pattern":"^\\/dynamic\\/comments\\/$","segments":[[{"content":"dynamic","dynamic":false,"spread":false}],[{"content":"comments","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/dynamic/comments.astro","pathname":"/dynamic/comments","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"always"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.BpqnxC_1.js"}],"styles":[],"routeData":{"route":"/dynamic","isIndex":true,"type":"page","pattern":"^\\/dynamic\\/$","segments":[[{"content":"dynamic","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/dynamic/index.astro","pathname":"/dynamic","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"always"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.BpqnxC_1.js"}],"styles":[],"routeData":{"route":"/friends","isIndex":false,"type":"page","pattern":"^\\/friends\\/$","segments":[[{"content":"friends","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/friends.astro","pathname":"/friends","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"always"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.BpqnxC_1.js"}],"styles":[],"routeData":{"route":"/gallery/[album]","isIndex":false,"type":"page","pattern":"^\\/gallery\\/([^/]+?)\\/$","segments":[[{"content":"gallery","dynamic":false,"spread":false}],[{"content":"album","dynamic":true,"spread":false}]],"params":["album"],"component":"src/pages/gallery/[album].astro","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"always"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.BpqnxC_1.js"}],"styles":[],"routeData":{"route":"/gallery","isIndex":true,"type":"page","pattern":"^\\/gallery\\/$","segments":[[{"content":"gallery","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/gallery/index.astro","pathname":"/gallery","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"always"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.BpqnxC_1.js"}],"styles":[],"routeData":{"route":"/guestbook","isIndex":false,"type":"page","pattern":"^\\/guestbook\\/$","segments":[[{"content":"guestbook","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/guestbook.astro","pathname":"/guestbook","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"always"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.BpqnxC_1.js"}],"styles":[],"routeData":{"route":"/llms.txt","isIndex":false,"type":"endpoint","pattern":"^\\/llms\\.txt$","segments":[[{"content":"llms.txt","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/llms.txt.ts","pathname":"/llms.txt","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"always"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.BpqnxC_1.js"}],"styles":[],"routeData":{"route":"/myanimelist","isIndex":false,"type":"page","pattern":"^\\/myanimelist\\/$","segments":[[{"content":"myanimelist","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/myanimelist.astro","pathname":"/myanimelist","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"always"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.BpqnxC_1.js"}],"styles":[],"routeData":{"route":"/og/[...slug]","isIndex":false,"type":"endpoint","pattern":"^\\/og(?:\\/(.*?))?\\/$","segments":[[{"content":"og","dynamic":false,"spread":false}],[{"content":"...slug","dynamic":true,"spread":true}]],"params":["...slug"],"component":"src/pages/og/[...slug].ts","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"always"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.BpqnxC_1.js"}],"styles":[],"routeData":{"route":"/posts/[...slug]","isIndex":false,"type":"page","pattern":"^\\/posts(?:\\/(.*?))?\\/$","segments":[[{"content":"posts","dynamic":false,"spread":false}],[{"content":"...slug","dynamic":true,"spread":true}]],"params":["...slug"],"component":"src/pages/posts/[...slug].astro","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"always"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.BpqnxC_1.js"}],"styles":[],"routeData":{"route":"/projects/[slug]","isIndex":false,"type":"page","pattern":"^\\/projects\\/([^/]+?)\\/$","segments":[[{"content":"projects","dynamic":false,"spread":false}],[{"content":"slug","dynamic":true,"spread":false}]],"params":["slug"],"component":"src/pages/projects/[slug].astro","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"always"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.BpqnxC_1.js"}],"styles":[],"routeData":{"route":"/projects","isIndex":true,"type":"page","pattern":"^\\/projects\\/$","segments":[[{"content":"projects","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/projects/index.astro","pathname":"/projects","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"always"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.BpqnxC_1.js"}],"styles":[],"routeData":{"route":"/robots.txt","isIndex":false,"type":"endpoint","pattern":"^\\/robots\\.txt$","segments":[[{"content":"robots.txt","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/robots.txt.ts","pathname":"/robots.txt","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"always"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.BpqnxC_1.js"}],"styles":[],"routeData":{"route":"/rss","isIndex":false,"type":"page","pattern":"^\\/rss\\/$","segments":[[{"content":"rss","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/rss.astro","pathname":"/rss","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"always"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.BpqnxC_1.js"}],"styles":[],"routeData":{"route":"/rss.xml","isIndex":false,"type":"endpoint","pattern":"^\\/rss\\.xml$","segments":[[{"content":"rss.xml","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/rss.xml.ts","pathname":"/rss.xml","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"always"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.BpqnxC_1.js"}],"styles":[],"routeData":{"route":"/search","isIndex":false,"type":"page","pattern":"^\\/search\\/$","segments":[[{"content":"search","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/search.astro","pathname":"/search","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"always"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.BpqnxC_1.js"}],"styles":[],"routeData":{"route":"/series","isIndex":true,"type":"page","pattern":"^\\/series\\/$","segments":[[{"content":"series","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/series/index.astro","pathname":"/series","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"always"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.BpqnxC_1.js"}],"styles":[],"routeData":{"route":"/sponsor","isIndex":false,"type":"page","pattern":"^\\/sponsor\\/$","segments":[[{"content":"sponsor","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/sponsor.astro","pathname":"/sponsor","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"always"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.BpqnxC_1.js"}],"styles":[],"routeData":{"route":"/tags","isIndex":true,"type":"page","pattern":"^\\/tags\\/$","segments":[[{"content":"tags","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/tags/index.astro","pathname":"/tags","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"always"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.BpqnxC_1.js"}],"styles":[],"routeData":{"route":"/vndb","isIndex":false,"type":"page","pattern":"^\\/vndb\\/$","segments":[[{"content":"vndb","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/vndb.astro","pathname":"/vndb","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"always"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.BpqnxC_1.js"}],"styles":[],"routeData":{"route":"/[...page]","isIndex":false,"type":"page","pattern":"^(?:\\/(.*?))?\\/$","segments":[[{"content":"...page","dynamic":true,"spread":true}]],"params":["...page"],"component":"src/pages/[...page].astro","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"always"}}}],"serverLike":true,"middlewareMode":"classic","site":"https://firefly.cuteleaf.cn","base":"/","trailingSlash":"always","compressHTML":"jsx","componentMetadata":[["D:/MY blog/Firefly/src/pages/404.astro",{"propagation":"in-tree","containsHead":true}],["D:/MY blog/Firefly/src/pages/atom.xml.ts",{"propagation":"in-tree","containsHead":true}],["D:/MY blog/Firefly/src/pages/rss.xml.ts",{"propagation":"in-tree","containsHead":true}],["D:/MY blog/Firefly/src/pages/[...page].astro",{"propagation":"in-tree","containsHead":true}],["D:/MY blog/Firefly/src/pages/about.astro",{"propagation":"in-tree","containsHead":true}],["D:/MY blog/Firefly/src/pages/archive.astro",{"propagation":"in-tree","containsHead":true}],["D:/MY blog/Firefly/src/pages/atom.astro",{"propagation":"in-tree","containsHead":true}],["D:/MY blog/Firefly/src/pages/bangumi.astro",{"propagation":"in-tree","containsHead":true}],["D:/MY blog/Firefly/src/pages/bilibili.astro",{"propagation":"in-tree","containsHead":true}],["D:/MY blog/Firefly/src/pages/booknav.astro",{"propagation":"in-tree","containsHead":true}],["D:/MY blog/Firefly/src/pages/categories/index.astro",{"propagation":"in-tree","containsHead":true}],["D:/MY blog/Firefly/src/pages/dynamic/index.astro",{"propagation":"in-tree","containsHead":true}],["D:/MY blog/Firefly/src/pages/friends.astro",{"propagation":"in-tree","containsHead":true}],["D:/MY blog/Firefly/src/pages/gallery/[album].astro",{"propagation":"in-tree","containsHead":true}],["D:/MY blog/Firefly/src/pages/gallery/index.astro",{"propagation":"in-tree","containsHead":true}],["D:/MY blog/Firefly/src/pages/guestbook.astro",{"propagation":"in-tree","containsHead":true}],["D:/MY blog/Firefly/src/pages/myanimelist.astro",{"propagation":"in-tree","containsHead":true}],["D:/MY blog/Firefly/src/pages/posts/[...slug].astro",{"propagation":"in-tree","containsHead":true}],["D:/MY blog/Firefly/src/pages/projects/[slug].astro",{"propagation":"in-tree","containsHead":true}],["D:/MY blog/Firefly/src/pages/projects/index.astro",{"propagation":"in-tree","containsHead":true}],["D:/MY blog/Firefly/src/pages/rss.astro",{"propagation":"in-tree","containsHead":true}],["D:/MY blog/Firefly/src/pages/search.astro",{"propagation":"in-tree","containsHead":true}],["D:/MY blog/Firefly/src/pages/series/index.astro",{"propagation":"in-tree","containsHead":true}],["D:/MY blog/Firefly/src/pages/sponsor.astro",{"propagation":"in-tree","containsHead":true}],["D:/MY blog/Firefly/src/pages/tags/index.astro",{"propagation":"in-tree","containsHead":true}],["D:/MY blog/Firefly/src/pages/vndb.astro",{"propagation":"in-tree","containsHead":true}],["D:/MY blog/Firefly/src/pages/dynamic/comments.astro",{"propagation":"none","containsHead":true}],["D:/MY blog/Firefly/src/pages/admin.astro",{"propagation":"none","containsHead":true}],["D:/MY blog/Firefly/src/content/spec/friends.mdx?astroPropagatedAssets",{"propagation":"in-tree","containsHead":false}],["D:\\MY blog\\Firefly\\.astro\\content-modules.mjs",{"propagation":"in-tree","containsHead":false}],["D:/MY blog/Firefly/node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/content/runtime.js",{"propagation":"in-tree","containsHead":false}],["\u0000astro:content",{"propagation":"in-tree","containsHead":false}],["D:/MY blog/Firefly/src/components/layout/PostCard.astro",{"propagation":"in-tree","containsHead":false}],["D:/MY blog/Firefly/src/components/layout/PostPage.astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/[...page]@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:pages",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:manifest",{"propagation":"in-tree","containsHead":false}],["D:/MY blog/Firefly/node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/manifest/ambient.js",{"propagation":"in-tree","containsHead":false}],["D:/MY blog/Firefly/node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/fetch/default-handler.js",{"propagation":"in-tree","containsHead":false}],["D:/MY blog/Firefly/node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/app/base.js",{"propagation":"in-tree","containsHead":false}],["D:/MY blog/Firefly/node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/app/app.js",{"propagation":"in-tree","containsHead":false}],["D:/MY blog/Firefly/node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/app/entrypoints/index.js",{"propagation":"in-tree","containsHead":false}],["D:/MY blog/Firefly/node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/build/app.js",{"propagation":"in-tree","containsHead":false}],["D:/MY blog/Firefly/node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/entrypoints/prerender.js",{"propagation":"in-tree","containsHead":false}],["D:/MY blog/Firefly/node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/middleware/index.js",{"propagation":"in-tree","containsHead":false}],["D:/MY blog/Firefly/node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/middleware/astro-middleware.js",{"propagation":"in-tree","containsHead":false}],["D:/MY blog/Firefly/node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/container/index.js",{"propagation":"in-tree","containsHead":false}],["D:/MY blog/Firefly/src/utils/feed-utils.ts",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/atom.xml@_@ts",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/rss.xml@_@ts",{"propagation":"in-tree","containsHead":false}],["D:/MY blog/Firefly/node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/errors/default-handler.js",{"propagation":"in-tree","containsHead":false}],["D:/MY blog/Firefly/node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/errors/build-handler.js",{"propagation":"in-tree","containsHead":false}],["D:/MY blog/Firefly/node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/errors/handler.js",{"propagation":"in-tree","containsHead":false}],["D:/MY blog/Firefly/node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/errors/dev-handler.js",{"propagation":"in-tree","containsHead":false}],["D:/MY blog/Firefly/node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/pages/handler.js",{"propagation":"in-tree","containsHead":false}],["D:/MY blog/Firefly/node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/rewrites/handler.js",{"propagation":"in-tree","containsHead":false}],["D:/MY blog/Firefly/node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/fetch/fetch-state.js",{"propagation":"in-tree","containsHead":false}],["D:/MY blog/Firefly/node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/actions/runtime/server.js",{"propagation":"in-tree","containsHead":false}],["D:/MY blog/Firefly/node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/actions/handler.js",{"propagation":"in-tree","containsHead":false}],["D:/MY blog/Firefly/node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/routing/handler.js",{"propagation":"in-tree","containsHead":false}],["D:/MY blog/Firefly/node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/actions/utils.js",{"propagation":"in-tree","containsHead":false}],["D:/MY blog/Firefly/node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/i18n/index.js",{"propagation":"in-tree","containsHead":false}],["D:/MY blog/Firefly/node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/i18n/fallback.js",{"propagation":"in-tree","containsHead":false}],["D:/MY blog/Firefly/node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/i18n/handler.js",{"propagation":"in-tree","containsHead":false}],["D:/MY blog/Firefly/node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/i18n/middleware.js",{"propagation":"in-tree","containsHead":false}],["D:/MY blog/Firefly/node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/i18n/utils.js",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/about@_@astro",{"propagation":"in-tree","containsHead":false}],["D:/MY blog/Firefly/src/pages/api/dynamic.json.ts",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/api/dynamic.json@_@ts",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/friends@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/guestbook@_@astro",{"propagation":"in-tree","containsHead":false}],["D:/MY blog/Firefly/src/pages/og/[...slug].ts",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/og/[...slug]@_@ts",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/posts/[...slug]@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/projects/[slug]@_@astro",{"propagation":"in-tree","containsHead":false}],["D:/MY blog/Firefly/src/utils/content-utils.ts",{"propagation":"in-tree","containsHead":false}],["D:/MY blog/Firefly/src/components/controls/ArchivePanel.astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/archive@_@astro",{"propagation":"in-tree","containsHead":false}],["D:/MY blog/Firefly/src/components/layout/CategoryBar.astro",{"propagation":"in-tree","containsHead":false}],["D:/MY blog/Firefly/src/layouts/MainGridLayout.astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/404@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/atom@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/bangumi@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/bilibili@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/booknav@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/categories/index@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/dynamic/index@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/gallery/[album]@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/gallery/index@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/myanimelist@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/projects/index@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/rss@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/search@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/series/index@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/sponsor@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/tags/index@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/vndb@_@astro",{"propagation":"in-tree","containsHead":false}],["D:/MY blog/Firefly/src/components/widget/Categories.astro",{"propagation":"in-tree","containsHead":false}],["D:/MY blog/Firefly/src/components/layout/SideBar.astro",{"propagation":"in-tree","containsHead":false}],["D:/MY blog/Firefly/src/components/layout/SidebarColumn.astro",{"propagation":"in-tree","containsHead":false}],["D:/MY blog/Firefly/src/components/widget/SiteStats.astro",{"propagation":"in-tree","containsHead":false}],["D:/MY blog/Firefly/src/components/widget/Tags.astro",{"propagation":"in-tree","containsHead":false}],["D:/MY blog/Firefly/src/pages/api/allPostMeta.json.ts",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/api/allPostMeta.json@_@ts",{"propagation":"in-tree","containsHead":false}],["D:/MY blog/Firefly/src/pages/llms.txt.ts",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/llms.txt@_@ts",{"propagation":"in-tree","containsHead":false}],["D:/MY blog/Firefly/src/content/posts/mdx-example.mdx?astroPropagatedAssets",{"propagation":"in-tree","containsHead":false}],["D:/MY blog/Firefly/src/pages/dashboard.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(n,t)=>{let i=async()=>{await(await n())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var n=(a,t)=>{let i=async()=>{await(await a())()};if(t.value){let e=matchMedia(t.value);e.matches?i():e.addEventListener(\"change\",i,{once:!0})}};(self.Astro||(self.Astro={})).media=n;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var a=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let l of e)if(l.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=a;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000noop-middleware":"virtual_astro_middleware.mjs","\u0000virtual:astro:server-island-manifest":"chunks/_virtual_astro_server-island-manifest_C1Q2srgE.mjs","\u0000virtual:astro:session-driver":"chunks/_virtual_astro_session-driver_C-PI1Pas.mjs","\u0000virtual:astro:actions/noop-entrypoint":"chunks/noop-entrypoint_Z3zFhrGC.mjs","D:/MY blog/Firefly/node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/assets/services/sharp.js":"chunks/sharp_DEaALMOe.mjs","virtual:astro:legacy-ssr-entry":"entry.mjs","\u0000virtual:astro:page:src/pages/api/admin/post/[...filename]@_@ts":"chunks/_.._BXsIYLE4.mjs","\u0000virtual:astro:page:src/pages/api/admin/project/[...filename]@_@ts":"chunks/_.._BcY03EMu.mjs","\u0000virtual:astro:page:src/pages/api/admin/spec/[...name]@_@ts":"chunks/_.._IfvErfSk.mjs","\u0000virtual:astro:page:src/pages/api/admin/dynamic/[...filename]@_@ts":"chunks/_.._pvn26Luw.mjs","\u0000virtual:astro:page:src/pages/api/admin/data/[...name]@_@ts":"chunks/_.._snr9tE9W.mjs","\u0000virtual:astro:page:src/pages/api/auth@_@ts":"chunks/auth_CH4lJ6Ha.mjs","\u0000virtual:astro:page:src/pages/api/callback@_@ts":"chunks/callback_Cu46FiYz.mjs","\u0000virtual:astro:page:src/pages/dashboard@_@astro":"chunks/dashboard_B1Fks1yS.mjs","\u0000virtual:astro:page:src/pages/api/admin/dynamics@_@ts":"chunks/dynamics_BUogwTms.mjs","\u0000virtual:astro:page:node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/assets/endpoint/generic@_@js":"chunks/generic_vbIowRCh.mjs","\u0000virtual:astro:page:src/pages/api/admin/login@_@ts":"chunks/login_HgBpRJeO.mjs","\u0000virtual:astro:page:src/pages/api/admin/posts@_@ts":"chunks/posts_9wSiHbON.mjs","\u0000virtual:astro:page:src/pages/api/admin/projects@_@ts":"chunks/projects_CMx7tPFl.mjs","\u0000virtual:astro:page:src/pages/api/admin/stats@_@ts":"chunks/stats_C3MfuBwg.mjs","@components/pages/AdvancedSearch.svelte":"_astro/AdvancedSearch.B0oI7xi5.js","@/components/pages/bangumi/BangumiGrid.svelte":"_astro/BangumiGrid.CKqAuIRm.js","@/components/pages/bilibili/BilibiliGrid.svelte":"_astro/BilibiliGrid.n6OngCGE.js","D:/MY blog/Firefly/src/components/layout/CategoryBar.astro?astro&type=script&index=0&lang.ts":"_astro/CategoryBar.astro_astro_type_script_index_0_lang.CE6LZULu.js","D:/MY blog/Firefly/src/components/features/CodeGroupManager.astro?astro&type=script&index=0&lang.ts":"_astro/CodeGroupManager.astro_astro_type_script_index_0_lang.hvy0GRuC.js","D:/MY blog/Firefly/src/components/common/CoverImage.astro?astro&type=script&index=0&lang.ts":"_astro/CoverImage.astro_astro_type_script_index_0_lang.q3EeJWNI.js","@/components/controls/DisplaySettingsIntegrated.svelte":"_astro/DisplaySettingsIntegrated.-8QmVVnH.js","D:/MY blog/Firefly/src/components/layout/DropdownMenu.astro?astro&type=script&index=0&lang.ts":"_astro/DropdownMenu.astro_astro_type_script_index_0_lang.BmHLbx10.js","@/components/pages/dynamic/DynamicFeed.svelte":"_astro/DynamicFeed.nrQxNvL6.js","@/components/widget/DynamicSidebar.svelte":"_astro/DynamicSidebar.Fj0OS4m0.js","D:/MY blog/Firefly/src/components/features/FancyboxManager.astro?astro&type=script&index=0&lang.ts":"_astro/FancyboxManager.astro_astro_type_script_index_0_lang.Dd8ePOot.js","D:/MY blog/Firefly/src/components/controls/FloatingTOC.astro?astro&type=script&index=0&lang.ts":"_astro/FloatingTOC.astro_astro_type_script_index_0_lang.Dy6anFT1.js","D:/MY blog/Firefly/src/components/features/FontSetup.astro?astro&type=script&index=0&lang.ts":"_astro/FontSetup.astro_astro_type_script_index_0_lang.C0z3U8_z.js","D:/MY blog/Firefly/src/components/features/GithubCardManager.astro?astro&type=script&index=0&lang.ts":"_astro/GithubCardManager.astro_astro_type_script_index_0_lang.XvrB7021.js","D:/MY blog/Firefly/src/components/controls/ImmersiveReading.astro?astro&type=script&index=0&lang.ts":"_astro/ImmersiveReading.astro_astro_type_script_index_0_lang.Dnn_Kc7W.js","D:/MY blog/Firefly/src/layouts/Layout.astro?astro&type=script&index=0&lang.ts":"_astro/Layout.astro_astro_type_script_index_0_lang.MGA0Ejo4.js","@/components/controls/LightDarkSwitch.svelte":"_astro/LightDarkSwitch.ByPsSjj0.js","D:/MY blog/Firefly/src/components/features/Live2DWidget.astro?astro&type=script&index=0&lang.ts":"_astro/Live2DWidget.astro_astro_type_script_index_0_lang.CrcD5cDL.js","@/components/pages/mal/MalGrid.svelte":"_astro/MalGrid.CT30nnqF.js","D:/MY blog/Firefly/src/components/layout/NavMenuPanel.astro?astro&type=script&index=0&lang.ts":"_astro/NavMenuPanel.astro_astro_type_script_index_0_lang.BDiefbO5.js","D:/MY blog/Firefly/src/components/layout/Navbar.astro?astro&type=script&index=0&lang.ts":"_astro/Navbar.astro_astro_type_script_index_0_lang.GhQbs6LR.js","@/components/common/PageJump.svelte":"_astro/PageJump.uKnKPT3M.js","D:/MY blog/Firefly/src/components/common/PioMessageBox.astro?astro&type=script&index=0&lang.ts":"_astro/PioMessageBox.astro_astro_type_script_index_0_lang.TQmmDYg5.js","D:/MY blog/Firefly/src/components/layout/PostPage.astro?astro&type=script&index=0&lang.ts":"_astro/PostPage.astro_astro_type_script_index_0_lang.DFO_5lkI.js","D:/MY blog/Firefly/src/components/features/SakuraEffect.astro?astro&type=script&index=0&lang.ts":"_astro/SakuraEffect.astro_astro_type_script_index_0_lang.DAMRM4mU.js","@/components/controls/Search.svelte":"_astro/Search.DySC86B7.js","@/components/misc/SharePoster.svelte":"_astro/SharePoster.hsMczkmD.js","D:/MY blog/Firefly/src/components/widget/SidebarTOC.astro?astro&type=script&index=0&lang.ts":"_astro/SidebarTOC.astro_astro_type_script_index_0_lang.DE_b25Sl.js","D:/MY blog/Firefly/src/components/widget/SiteInfo.astro?astro&type=script&index=0&lang.ts":"_astro/SiteInfo.astro_astro_type_script_index_0_lang.DE0tp96T.js","D:/MY blog/Firefly/src/components/features/TypewriterText.astro?astro&type=script&index=0&lang.ts":"_astro/TypewriterText.astro_astro_type_script_index_0_lang.48s5hllK.js","@/components/pages/vndb/VndbGrid.svelte":"_astro/VndbGrid.BMCx2DBO.js","D:/MY blog/Firefly/src/components/features/WavesEffect.astro?astro&type=script&index=0&lang.ts":"_astro/WavesEffect.astro_astro_type_script_index_0_lang.DwU8s_Lh.js","D:/MY blog/Firefly/src/components/common/WidgetLayout.astro?astro&type=script&index=0&lang.ts":"_astro/WidgetLayout.astro_astro_type_script_index_0_lang._RcciAKu.js","D:/MY blog/Firefly/src/pages/[...page].astro?astro&type=script&index=0&lang.ts":"_astro/_...page_.astro_astro_type_script_index_0_lang.DMKzQkFo.js","D:/MY blog/Firefly/src/pages/posts/[...slug].astro?astro&type=script&index=0&lang.ts":"_astro/_...slug_.astro_astro_type_script_index_0_lang.BvR6r-On.js","D:/MY blog/Firefly/src/pages/atom.astro?astro&type=script&index=0&lang.ts":"_astro/atom.astro_astro_type_script_index_0_lang.L-JxQTNP.js","@astrojs/svelte/client.js":"_astro/client.svelte.DjCF9yp7.js","D:/MY blog/Firefly/src/pages/dynamic/comments.astro?astro&type=script&index=0&lang.ts":"_astro/comments.astro_astro_type_script_index_0_lang.CffrSACG.js","D:/MY blog/Firefly/src/pages/dashboard.astro?astro&type=script&index=0&lang.ts":"_astro/dashboard.astro_astro_type_script_index_0_lang.DFk_SE9a.js","@components/firefly-mdx":"_astro/firefly-mdx.CGRrXxq1.js","astro:scripts/page.js":"_astro/page.BpqnxC_1.js","D:/MY blog/Firefly/src/pages/rss.astro?astro&type=script&index=0&lang.ts":"_astro/rss.astro_astro_type_script_index_0_lang.B8XizQsE.js","D:/MY blog/Firefly/node_modules/.pnpm/@swup+astro@1.8.0_rolldown@1.2.7_supports-color@10.2.2/node_modules/@swup/astro/dist/client/Swup.js":"_astro/Swup.wQpqpZlg.js","D:/MY blog/Firefly/node_modules/.pnpm/@swup+astro@1.8.0_rolldown@1.2.7_supports-color@10.2.2/node_modules/@swup/astro/dist/client/SwupA11yPlugin.js":"_astro/SwupA11yPlugin.st3fEWXw.js","D:/MY blog/Firefly/node_modules/.pnpm/@swup+astro@1.8.0_rolldown@1.2.7_supports-color@10.2.2/node_modules/@swup/astro/dist/client/SwupHeadPlugin.js":"_astro/SwupHeadPlugin.CJV9x5S0.js","D:/MY blog/Firefly/node_modules/.pnpm/@swup+astro@1.8.0_rolldown@1.2.7_supports-color@10.2.2/node_modules/@swup/astro/dist/client/SwupPreloadPlugin.js":"_astro/SwupPreloadPlugin.DLed3hvq.js","D:/MY blog/Firefly/node_modules/.pnpm/@swup+astro@1.8.0_rolldown@1.2.7_supports-color@10.2.2/node_modules/@swup/astro/dist/client/SwupScriptsPlugin.js":"_astro/SwupScriptsPlugin.KOkp8JHL.js","D:/MY blog/Firefly/node_modules/.pnpm/qrcode@1.5.4/node_modules/qrcode/lib/browser.js":"_astro/browser.C-8s42tV.js","D:/MY blog/Firefly/src/styles/fancybox-custom.css?url":"_astro/fancybox-custom.D6Mls718.js","D:/MY blog/Firefly/node_modules/.pnpm/@fancyapps+ui@6.1.14/node_modules/@fancyapps/ui/dist/fancybox/fancybox.css?url":"_astro/fancybox.CHkUVtgl.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[["D:/MY blog/Firefly/src/components/features/CodeGroupManager.astro?astro&type=script&index=0&lang.ts","var g=\".rehype-code-group\",i=\".rcg-tab\",b=\".rcg-block\",l=e=>Array.from(e.querySelectorAll(`:scope > .rcg-tab-container > ${i}`)),h=e=>Array.from(e.querySelectorAll(`:scope > ${b}`));function u(e,t,n=!1){const r=l(e),d=h(e);if(r.length===0)return;const a=Math.max(0,Math.min(t,r.length-1));r.forEach((c,s)=>{const o=s===a;c.classList.toggle(\"active\",o),c.setAttribute(\"aria-selected\",o?\"true\":\"false\")}),d.forEach((c,s)=>{const o=s===a;c.classList.toggle(\"active\",o),o?c.removeAttribute(\"hidden\"):c.setAttribute(\"hidden\",\"true\")}),n&&r[a].focus({preventScroll:!0})}function f(e){if(!(e instanceof Element))return null;const t=e.closest(i),n=t?.closest(g);if(!t||!n)return null;const r=l(n).indexOf(t);return r===-1?null:{group:n,index:r}}document.addEventListener(\"click\",e=>{const t=f(e.target);t&&u(t.group,t.index)});document.addEventListener(\"keydown\",e=>{if(e.altKey||e.ctrlKey||e.metaKey)return;const t=f(e.target);if(!t)return;const n=l(t.group).length;let r;switch(e.key){case\"ArrowRight\":r=(t.index+1)%n;break;case\"ArrowLeft\":r=(t.index-1+n)%n;break;case\"Home\":r=0;break;case\"End\":r=n-1;break;default:return}e.preventDefault(),u(t.group,r,!0)});"],["D:/MY blog/Firefly/src/components/common/CoverImage.astro?astro&type=script&index=0&lang.ts","function l(){document.querySelectorAll(\".cover-image-container\").forEach(t=>{if(t.hasAttribute(\"data-initialized\"))return;t.setAttribute(\"data-initialized\",\"true\");const e=t.querySelector(\"img[data-cover-img]\");if(!e)return;let r=[],a=1;const s=t.getAttribute(\"data-api-urls\");if(s)try{r=JSON.parse(s)}catch{}const i=()=>{t.setAttribute(\"data-loading\",\"false\"),e.style.opacity=\"1\";const o=t.querySelector(\".lqip-placeholder\");o&&o.classList.add(\"loaded\")},n=()=>{t.setAttribute(\"data-loading\",\"false\"),t.setAttribute(\"data-error\",\"true\")},d=()=>{e.dataset.remote===\"true\"&&(a<r.length?(e.addEventListener(\"load\",i,{once:!0}),e.addEventListener(\"error\",d,{once:!0}),e.src=r[a],a++):n())};e.complete?e.naturalWidth>0?i():d():(e.addEventListener(\"load\",i,{once:!0}),e.addEventListener(\"error\",d,{once:!0}))})}window.__coverImageInit||(window.__coverImageInit=!0,l(),document.addEventListener(\"astro:page-load\",l));"],["D:/MY blog/Firefly/src/components/layout/DropdownMenu.astro?astro&type=script&index=0&lang.ts","document.addEventListener(\"DOMContentLoaded\",function(){const c=document.querySelectorAll(\"[data-dropdown]\");c.forEach(e=>{const t=e.querySelector(\"[data-dropdown-trigger]\"),o=e.querySelector(\"[data-dropdown-menu]\"),n=e.querySelectorAll(\".dropdown-item\");!t||!o||(t.addEventListener(\"keydown\",function(r){r.key===\"Enter\"||r.key===\" \"?(r.preventDefault(),d(e,t,o)):r.key===\"ArrowDown\"?(r.preventDefault(),s(e,t,o),n.length>0&&n[0].focus()):r.key===\"Escape\"&&u(e,t,o)}),n.forEach((r,f)=>{r.addEventListener(\"keydown\",function(a){if(a.key===\"ArrowDown\"){a.preventDefault();const i=(f+1)%n.length;n[i].focus()}else if(a.key===\"ArrowUp\"){a.preventDefault();const i=(f-1+n.length)%n.length;n[i].focus()}else a.key===\"Escape\"&&(u(e,t,o),t.focus())})}))}),document.addEventListener(\"click\",function(e){c.forEach(t=>{if(!t.contains(e.target)){const o=t.querySelector(\"[data-dropdown-trigger]\"),n=t.querySelector(\"[data-dropdown-menu]\");o&&n&&u(t,o,n)}})})});function d(c,e,t){e.getAttribute(\"aria-expanded\")===\"true\"?u(c,e,t):s(c,e,t)}function s(c,e,t){e.setAttribute(\"aria-expanded\",\"true\")}function u(c,e,t){e.setAttribute(\"aria-expanded\",\"false\")}"],["D:/MY blog/Firefly/src/components/features/FontSetup.astro?astro&type=script&index=0&lang.ts","document.fonts&&typeof document.fonts.ready<\"u\"&&document.fonts.ready.then(()=>{document.dispatchEvent(new CustomEvent(\"fontsLoaded\"))}).catch(n=>{console.warn(\"Font loading failed:\",n)});"],["D:/MY blog/Firefly/src/components/features/GithubCardManager.astro?astro&type=script&index=0&lang.ts","function u(t){return Intl.NumberFormat(\"en-us\",{notation:\"compact\",maximumFractionDigits:1}).format(t).replaceAll(\" \",\"\")}var m=\"github-card:\",h=864e5,c=new Map,l=new Set;function g(t){return m+t.toLowerCase()}function p(t){try{const e=localStorage.getItem(g(t));if(!e)return null;const r=JSON.parse(e),n=r.data;return!n||typeof r.fetchedAt!=\"number\"||typeof n.stargazers_count!=\"number\"||typeof n.forks!=\"number\"||Date.now()-r.fetchedAt>=h?null:n}catch{return null}}function y(t,e){try{localStorage.setItem(g(t),JSON.stringify({data:e,fetchedAt:Date.now()}))}catch{}}async function w(t){const[e,r]=t.split(\"/\"),n=`https://api.github.com/repos/${encodeURIComponent(e)}/${encodeURIComponent(r)}`,o=await fetch(n,{referrerPolicy:\"no-referrer\",signal:AbortSignal.timeout(5e3)});if(!o.ok)throw new Error(`GitHub API returned ${o.status}`);return await o.json()}function f(t,e){const r=(o,a)=>{const s=t.querySelector(o);s&&(s.textContent=a)};r(\".gc-stars\",u(e.stargazers_count)),r(\".gc-forks\",u(e.forks)),r(\".gc-description\",e.description?.replace(/:[a-zA-Z0-9_]+:/g,\"\")||\"Description not set\"),r(\".gc-language\",e.language??\"Unavailable\"),r(\".gc-license\",e.license?.spdx_id||\"no-license\");const n=t.querySelector(\".gc-avatar\");if(n&&e.owner?.avatar_url){const o=e.owner.avatar_url;n.style.backgroundImage=`url(\"${o}${o.includes(\"?\")?\"&\":\"?\"}s=32\")`,n.style.backgroundColor=\"transparent\"}t.classList.remove(\"fetch-waiting\",\"fetch-error\")}function C(t,e){const r=p(e);if(r){f(t,r);return}const n=e.toLowerCase();if(l.has(n))return;let o=c.get(n);o||(o=w(e).then(a=>(y(e,a),a)).catch(a=>(console.warn(\"[GITHUB-CARD] Failed to load\",e,a),null)).finally(()=>{c.delete(n),l.add(n)}),c.set(n,o)),o.then(a=>{a?f(t,a):t.classList.add(\"fetch-error\")})}function i(){document.querySelectorAll(\".card-github[repo]\").forEach(t=>{const e=t.getAttribute(\"repo\");e&&C(t,e)})}function d(){i(),document.addEventListener(\"swup:content:replace\",()=>{requestAnimationFrame(i)}),document.addEventListener(\"password:decrypted\",()=>{requestAnimationFrame(i)})}document.readyState===\"loading\"?document.addEventListener(\"DOMContentLoaded\",d):d();"],["D:/MY blog/Firefly/src/components/layout/NavMenuPanel.astro?astro&type=script&index=0&lang.ts","document.addEventListener(\"DOMContentLoaded\",()=>{const t=document.querySelectorAll(\"[data-mobile-dropdown]\");t.forEach(e=>{const n=e.querySelector(\"[data-mobile-dropdown-trigger]\"),a=e.querySelector(\"[data-mobile-submenu]\");!n||!a||n.addEventListener(\"click\",o=>{o.preventDefault();const l=e.getAttribute(\"data-expanded\")===\"true\";t.forEach(i=>{i!==e&&r(i,!1)}),r(e,!l)})}),c()});document.addEventListener(\"astro:page-load\",c);document.addEventListener(\"swup:contentReplaced\",c);document.addEventListener(\"click\",t=>{const e=t.target;e instanceof Element&&e.closest(\".mobile-menu-scrim, .mobile-menu-close\")&&document.getElementById(\"nav-menu-panel\")?.classList.add(\"float-panel-closed\")});document.addEventListener(\"click\",t=>{const e=t.target;e instanceof Element&&e.closest(\".mobile-menu-drawer a[href]\")&&document.getElementById(\"nav-menu-panel\")?.classList.add(\"float-panel-closed\")});function c(){const t=location.pathname;document.querySelectorAll(\".mobile-menu-item[data-nav-href]\").forEach(e=>{const n=e.getAttribute(\"data-nav-href\");let a=!1;if(n)try{a=new URL(n,location.href).pathname===t}catch{a=!1}if(e.setAttribute(\"data-active\",a?\"true\":\"false\"),a){const o=e.closest(\"[data-mobile-dropdown]\");o&&r(o,!0)}})}function r(t,e){t.setAttribute(\"data-expanded\",e.toString()),t.querySelector(\"[data-mobile-dropdown-trigger]\")?.setAttribute(\"aria-expanded\",e.toString());const n=t.querySelector(\"[data-mobile-submenu]\");n instanceof HTMLElement&&(n.inert=!e,n.setAttribute(\"aria-hidden\",(!e).toString()))}"],["D:/MY blog/Firefly/src/components/layout/Navbar.astro?astro&type=script&index=0&lang.ts","function g(){let l=document.getElementById(\"display-settings-switch\");l&&(l.onclick=function(){let e=document.getElementById(\"display-setting\");e&&e.classList.toggle(\"float-panel-closed\")});let o=document.getElementById(\"nav-menu-switch\");o&&(o.onclick=function(){let e=document.getElementById(\"nav-menu-panel\");e&&e.classList.toggle(\"float-panel-closed\")});let c=document.getElementById(\"music-player-switch\");c&&(c.onclick=function(){let e=document.getElementById(\"music-nav-panel\");e&&e.classList.toggle(\"float-panel-closed\")});let t=document.getElementById(\"bg-player-toggle\");if(t){let e=function(i){var n=t.querySelector(\".bg-player-icon-play\"),a=t.querySelector(\".bg-player-icon-pause\");n&&a&&(n.classList.toggle(\"hidden\",i),a.classList.toggle(\"hidden\",!i));var s=t.getAttribute(\"data-i18n-play\")??\"\",r=t.getAttribute(\"data-i18n-pause\")??\"\",f=i?r:s;t.setAttribute(\"title\",f),t.setAttribute(\"aria-label\",f)},d=function(){e(document.documentElement.hasAttribute(\"data-bg-video-playing\"))};var w=e,p=d;t.onclick=function(){window.dispatchEvent(new CustomEvent(\"bg-player-toggle\"))},window.addEventListener(\"bg-player-state-change\",function(i){var n=i;e(n.detail&&n.detail.playing)}),window.addEventListener(\"wallpaperModeChange\",function(i){var n=i,a=n.detail&&n.detail.mode;t.style.display=a===\"none\"?\"none\":\"\"}),window.swup&&window.swup.hooks?window.swup.hooks.on(\"content:replace\",d):document.addEventListener(\"swup:enable\",function(){window.swup.hooks.on(\"content:replace\",d)})}let m=document.getElementById(\"scheme-switch\");m&&(m.onclick=function(){let e=document.getElementById(\"theme-mode-panel\");e&&e.classList.toggle(\"float-panel-closed\")}),document.addEventListener(\"click\",function(e){const d=[\"display-setting\",\"music-nav-panel\",\"theme-mode-panel\"],i=[\"display-settings-switch\",\"music-player-switch\",\"scheme-switch\"];d.forEach((n,a)=>{const s=document.getElementById(n),r=document.getElementById(i[a]);s&&r&&!s.classList.contains(\"float-panel-closed\")&&e.target instanceof Node&&!s.contains(e.target)&&!r.contains(e.target)&&s.classList.add(\"float-panel-closed\")})})}g();function u(){const l=document.getElementById(\"navbar\");if(!l||l.getAttribute(\"data-transparent-mode\")!==\"semifull\")return;window.semifullScrollHandler&&(window.removeEventListener(\"scroll\",window.semifullScrollHandler),window.semifullScrollHandler=void 0),l.classList.remove(\"scrolled\");let o=!1;function c(){if(document.documentElement.classList.contains(\"is-page-transitioning\")){document.documentElement.getAttribute(\"data-wallpaper-mode\")!==\"fullscreen\"&&l.classList.remove(\"scrolled\"),o=!1;return}(window.pageYOffset||document.documentElement.scrollTop)>50?l.classList.add(\"scrolled\"):l.classList.remove(\"scrolled\"),o=!1}function t(){o||(requestAnimationFrame(c),o=!0)}window.semifullScrollHandler&&window.removeEventListener(\"scroll\",window.semifullScrollHandler),window.semifullScrollHandler=t,window.addEventListener(\"scroll\",t,{passive:!0}),c()}window.initSemifullScrollDetection=u;document.readyState===\"loading\"?document.addEventListener(\"DOMContentLoaded\",u):u();"],["D:/MY blog/Firefly/src/components/layout/PostPage.astro?astro&type=script&index=0&lang.ts","function a(){const e=document.getElementById(\"post-list-container\");if(!e)return;const t=localStorage.getItem(\"postListLayout\"),o=e.getAttribute(\"data-default-layout\")||\"list\",r=e.getAttribute(\"data-mobile-default-layout\")||o,s=window.innerWidth<780?r:o;let n=t||s;window.innerWidth<380&&(n=\"grid\"),m(n)}function m(e){const t=document.getElementById(\"post-list-container\");if(!t)return;const o=t.classList.contains(\"grid-mode\"),r=t.classList.contains(\"list-mode\"),s=o?\"grid\":r?\"list\":null,n=t.getAttribute(\"data-masonry-enabled\")===\"true\",l=()=>{t.classList.remove(\"list-mode\",\"grid-mode\",\"post-grid-auto\"),e===\"grid\"?(t.classList.add(\"grid-mode\"),t.classList.remove(\"flex\",\"flex-col\"),n?(t.classList.remove(\"post-grid-auto\"),c()):(t.classList.add(\"post-grid-auto\"),f())):(t.classList.add(\"list-mode\"),t.classList.add(\"flex\",\"flex-col\",\"gap-4\",\"md:gap-4\"),t.classList.remove(\"post-grid-auto\"),f())};if(!s){l();return}if(s===e){e===\"grid\"&&n&&c();return}t.classList.add(\"layout-switching\"),setTimeout(()=>{l(),requestAnimationFrame(()=>{t.classList.remove(\"layout-switching\")})},200)}function f(){const e=document.getElementById(\"post-list-container\");e&&(e.style.height=\"\",e.style.position=\"\",e.style.display=\"\",e.querySelectorAll(\".post-card-item\").forEach(t=>{t.style.position=\"\",t.style.top=\"\",t.style.left=\"\",t.style.width=\"\"}))}function c(){const e=document.getElementById(\"post-list-container\");if(!e||e.getAttribute(\"data-masonry-enabled\")!==\"true\"||!e.classList.contains(\"grid-mode\"))return;const t=Array.from(e.querySelectorAll(\".post-card-item\"));if(t.length===0)return;const o=16,r=parseInt(e.getAttribute(\"data-column-width\")||\"280\");e.style.position=\"relative\",e.style.display=\"block\";const s=e.offsetWidth,n=Math.max(1,Math.floor((s+o)/(r+o))),l=(s-(n-1)*o)/n,d=new Array(n).fill(0);t.forEach(i=>{const u=d.indexOf(Math.min(...d));i.style.position=\"absolute\",i.style.width=`${l}px`,i.style.setProperty(\"height\",\"auto\",\"important\");const y=i.offsetHeight,p=d[u],g=u*(l+o);i.style.top=`${p}px`,i.style.left=`${g}px`,d[u]+=y+o}),e.style.height=`${Math.max(...d)}px`}if(!window.__postPageInit){window.__postPageInit=!0,document.addEventListener(\"DOMContentLoaded\",function(){setTimeout(a,50),document.querySelectorAll(\"#post-list-container img\").forEach(t=>{t.complete||t.addEventListener(\"load\",()=>{c()})})}),document.addEventListener(\"visibilitychange\",function(){document.hidden||setTimeout(a,100)}),window.addEventListener(\"layoutChange\",function(t){const o=t.detail.layout;document.getElementById(\"post-list-container\")&&m(o)});let e;window.addEventListener(\"resize\",function(){clearTimeout(e),e=setTimeout(function(){a()},250)}),document.addEventListener(\"astro:page-load\",function(){setTimeout(a,50),document.querySelectorAll(\"#post-list-container img\").forEach(t=>{t.complete||t.addEventListener(\"load\",()=>{c()})})}),document.addEventListener(\"astro:after-swap\",function(){setTimeout(a,50)}),setTimeout(a,0)}"],["D:/MY blog/Firefly/src/components/widget/SiteInfo.astro?astro&type=script&index=0&lang.ts","var c=class extends HTMLElement{constructor(){super();const s=this.querySelector(\".site-info-toggle-btn\"),o=this.querySelector(\".site-info-detail\"),e=this.querySelector(\".site-info-toggle-text\"),n=this.querySelector(\".site-info-toggle-icon\");if(!s||!o||!e)return;const l=this.dataset.expandText||\"展开构建信息\",i=this.dataset.collapseText||\"收起构建信息\";let t=!1;e.textContent=l,s.addEventListener(\"click\",()=>{t=!t,o.classList.toggle(\"collapsed\",!t),e.textContent=t?i:l,n?.classList.toggle(\"rotate-180\",t)})}};customElements.get(\"site-info-collapse\")||customElements.define(\"site-info-collapse\",c);"],["D:/MY blog/Firefly/src/components/features/TypewriterText.astro?astro&type=script&index=0&lang.ts","var r=class{element;texts;currentTextIndex=0;speed;deleteSpeed;pauseTime;currentIndex=0;isDeleting=!1;timeoutId=null;constructor(t){this.element=t;const e=t.dataset.text||\"\";try{const i=JSON.parse(e);this.texts=Array.isArray(i)?i:[e]}catch{this.texts=[e]}this.speed=parseInt(t.dataset.speed||\"100\"),this.deleteSpeed=parseInt(t.dataset.deleteSpeed||\"50\"),this.pauseTime=parseInt(t.dataset.pauseTime||\"2000\"),this.texts.length>1&&!this.isTypewriterEnabled()?this.showRandomText():this.start()}isTypewriterEnabled(){return this.element.dataset.speed!==void 0||this.element.dataset.deleteSpeed!==void 0||this.element.dataset.pauseTime!==void 0}showRandomText(){const t=Math.floor(Math.random()*this.texts.length);this.element.textContent=this.texts[t]}start(){this.texts.length!==0&&this.type()}getCurrentText(){return this.texts[this.currentTextIndex]||\"\"}type(){const t=this.getCurrentText(),e=this.segmentText(t);this.isDeleting?this.currentIndex>0?(this.currentIndex--,this.element.textContent=e.slice(0,this.currentIndex).join(\"\"),this.timeoutId=window.setTimeout(()=>this.type(),this.deleteSpeed)):(this.isDeleting=!1,this.currentTextIndex=(this.currentTextIndex+1)%this.texts.length,this.timeoutId=window.setTimeout(()=>this.type(),this.speed)):this.currentIndex<e.length?(this.currentIndex++,this.element.textContent=e.slice(0,this.currentIndex).join(\"\"),this.timeoutId=window.setTimeout(()=>this.type(),this.speed)):this.texts.length>1&&(this.isDeleting=!0,this.timeoutId=window.setTimeout(()=>this.type(),this.pauseTime))}destroy(){this.timeoutId&&clearTimeout(this.timeoutId)}segmentText(t){const e=new Intl.Segmenter(void 0,{granularity:\"grapheme\"});return Array.from(e.segment(t),i=>i.segment)}};function n(){document.querySelectorAll(\".typewriter\").forEach(t=>{const e=t;e.__typewriterInstance&&e.__typewriterInstance.destroy(),e.textContent=\"\",e.__typewriterInstance=new r(e)})}function s(){n(),setTimeout(n,220)}window.__typewriterTextInit||(window.__typewriterTextInit=!0,document.readyState===\"loading\"?document.addEventListener(\"DOMContentLoaded\",s):s(),document.addEventListener(\"swup:contentReplaced\",s),document.addEventListener(\"swup:content:replace\",s),document.addEventListener(\"swup:page:view\",s),typeof window<\"u\"&&window.swup?.hooks&&(window.swup.hooks.on(\"content:replace\",s),window.swup.hooks.on(\"page:view\",s)));"],["D:/MY blog/Firefly/src/components/common/WidgetLayout.astro?astro&type=script&index=0&lang.ts","var c=class extends HTMLElement{constructor(){if(super(),this.dataset.isCollapsed!==\"true\")return;this.dataset.expanded=\"false\";const n=this.dataset.id,t=this.querySelector(\".expand-btn button\"),o=this.querySelector(`#${n}`);if(!t||!o)return;const a=t.querySelector(\".toggle-text\"),l=t.querySelector(\".toggle-icon-more\"),i=t.querySelector(\".toggle-icon-less\"),r=e=>{const s=e?t.dataset.showLess||\"\":t.dataset.showMore||\"\";t.dataset.expanded=String(e),this.dataset.expanded=String(e),t.title=s,t.setAttribute(\"aria-label\",s),a&&(a.textContent=s),l?.classList.toggle(\"hidden\",e),i?.classList.toggle(\"hidden\",!e)};t.addEventListener(\"click\",()=>{const e=t.dataset.expanded===\"true\";o.classList.toggle(\"collapsed\",e),r(!e)})}};customElements.get(\"widget-layout\")||customElements.define(\"widget-layout\",c);"],["D:/MY blog/Firefly/src/pages/[...page].astro?astro&type=script&index=0&lang.ts","document.addEventListener(\"DOMContentLoaded\",function(){{const e=d();document.body.classList.add(`device-${e}`);let t;window.addEventListener(\"resize\",function(){clearTimeout(t),t=setTimeout(function(){const n=d(),i=document.body.className.match(/device-(mobile|tablet|desktop)/)?.[1];i!==n&&(document.body.classList.remove(`device-${i}`),document.body.classList.add(`device-${n}`))},250)})}});function d(){if(typeof window>\"u\")return\"desktop\";const e=window.innerWidth;return e<768?\"mobile\":e<1024?\"tablet\":\"desktop\"}"],["D:/MY blog/Firefly/src/pages/posts/[...slug].astro?astro&type=script&index=0&lang.ts","var e=document.getElementById(\"outdated-card\"),n=e?.dataset.date;if(e&&n){const o=new Date(n),a=Math.floor((Date.now()-o.getTime())/864e5);if(a>=Number(e.dataset.threshold)&&(e.classList.remove(\"hidden\"),a>=1)){const t=document.getElementById(\"days-ago-text\");t&&t.dataset.template&&(t.textContent=`，${t.dataset.template.replace(\"{days}\",a.toString())}`);const d=document.getElementById(\"outdated-warning\");d&&d.classList.remove(\"hidden\")}}"],["D:/MY blog/Firefly/src/pages/atom.astro?astro&type=script&index=0&lang.ts","function o(){const e=document.getElementById(\"copy-atom-btn\");if(!e)return;const r=e.cloneNode(!0);e.parentNode?.replaceChild(r,e),r.addEventListener(\"click\",async function(a){const t=a.currentTarget,i=t.getAttribute(\"data-url\");if(i)try{await navigator.clipboard.writeText(i);const n=t.textContent;t.textContent=t.getAttribute(\"data-copied-text\")||\"\",t.style.backgroundColor=\"var(--success-color, #10b981)\",setTimeout(()=>{t.textContent=n,t.style.backgroundColor=\"\"},2e3)}catch(n){console.error(\"Copy failed:\",n);const c=t.textContent;t.textContent=t.getAttribute(\"data-failed-text\")||\"\",setTimeout(()=>{t.textContent=c},2e3)}})}document.readyState===\"loading\"?document.addEventListener(\"DOMContentLoaded\",o):setTimeout(o,0);typeof window<\"u\"&&window.swup&&window.swup.hooks.on(\"content:replace\",()=>{setTimeout(o,100)});"],["D:/MY blog/Firefly/src/pages/dynamic/comments.astro?astro&type=script&index=0&lang.ts","window.addEventListener(\"message\",e=>{e.origin!==window.location.origin||e.data?.type!==\"dynamic-comment-theme\"||(document.documentElement.classList.toggle(\"dark\",!!e.data.dark),document.documentElement.dataset.theme=e.data.dark?\"dark\":\"light\")});var t=()=>{window.parent.postMessage({type:\"dynamic-comment-height\",height:document.documentElement.scrollHeight},window.location.origin)};new ResizeObserver(t).observe(document.body);window.addEventListener(\"load\",t);"],["D:/MY blog/Firefly/src/pages/rss.astro?astro&type=script&index=0&lang.ts","function o(){const e=document.getElementById(\"copy-rss-btn\");if(!e)return;const r=e.cloneNode(!0);e.parentNode?.replaceChild(r,e),r.addEventListener(\"click\",async function(c){const t=c.currentTarget,i=t.getAttribute(\"data-url\");if(i)try{await navigator.clipboard.writeText(i);const n=t.textContent;t.textContent=t.getAttribute(\"data-copied-text\")||\"\",t.style.backgroundColor=\"var(--success-color, #10b981)\",setTimeout(()=>{t.textContent=n,t.style.backgroundColor=\"\"},2e3)}catch(n){console.error(\"Copy failed:\",n);const a=t.textContent;t.textContent=t.getAttribute(\"data-failed-text\")||\"\",setTimeout(()=>{t.textContent=a},2e3)}})}document.readyState===\"loading\"?document.addEventListener(\"DOMContentLoaded\",o):setTimeout(o,0);typeof window<\"u\"&&window.swup&&window.swup.hooks.on(\"content:replace\",()=>{setTimeout(o,100)});"]],"assets":["/_astro/dashboard.DHbVaD5Q.css","/_astro/ec.gtzw0.css","/_astro/ec.xb3ii.js","/anime-list.json","/admin/config.yml","/favicon/favicon-dark-128.png","/favicon/favicon-dark-180.png","/favicon/favicon-dark-192.png","/favicon/favicon-dark-32.png","/favicon/favicon-light-128.png","/favicon/favicon-light-180.png","/favicon/favicon-light-192.png","/favicon/favicon-light-32.png","/favicon/firefly-128.png","/favicon/firefly-180.png","/favicon/firefly-192.png","/favicon/firefly-32.png","/_astro/AdvancedSearch.B0oI7xi5.js","/_astro/BangumiGrid.CKqAuIRm.js","/_astro/BilibiliGrid.n6OngCGE.js","/_astro/browser.C-8s42tV.js","/_astro/CategoryBar.astro_astro_type_script_index_0_lang.CE6LZULu.js","/_astro/client.rGNO-PDd.js","/_astro/client.svelte.DjCF9yp7.js","/_astro/ClientPagination.CrNRbJgU.js","/_astro/config.CL4txjB3.js","/_astro/dashboard.astro_astro_type_script_index_0_lang.DFk_SE9a.js","/_astro/disclose-version.DwdwGuwu.js","/_astro/DisplaySettingsIntegrated.-8QmVVnH.js","/_astro/dist.BKvmqey7.js","/_astro/DynamicFeed.nrQxNvL6.js","/_astro/DynamicSidebar.Fj0OS4m0.js","/_astro/failed-covers._FeWJ0rq.js","/_astro/fancybox-custom.D6Mls718.js","/_astro/fancybox-custom.o4NXtsHZ.css","/_astro/fancybox.CHkUVtgl.js","/_astro/fancybox.y3Ble-Pa.css","/_astro/FancyboxManager.astro_astro_type_script_index_0_lang.Dd8ePOot.js","/_astro/firefly-mdx.CGRrXxq1.js","/_astro/floating-panel-utils.DEwhJch2.js","/_astro/FloatingTOC.astro_astro_type_script_index_0_lang.Dy6anFT1.js","/_astro/grid-layout-utils.BzCXtk9R.js","/_astro/GridSkeleton.C2831HVt.js","/_astro/Icon.JpScZAbP.js","/_astro/ImmersiveReading.astro_astro_type_script_index_0_lang.Dnn_Kc7W.js","/_astro/index.modern.DGWg1a9q.js","/_astro/Layout.astro_astro_type_script_index_0_lang.MGA0Ejo4.js","/_astro/legacy.FjeqpZJC.js","/_astro/LightDarkSwitch.ByPsSjj0.js","/_astro/Live2DWidget.astro_astro_type_script_index_0_lang.CrcD5cDL.js","/_astro/MalGrid.CT30nnqF.js","/_astro/memos-adapter.C7zbaZ8Y.js","/_astro/page.BpqnxC_1.js","/_astro/PageJump.uKnKPT3M.js","/_astro/PioMessageBox.astro_astro_type_script_index_0_lang.TQmmDYg5.js","/_astro/preload-helper.BKYioxU4.js","/_astro/rolldown-runtime.CXHxssQy.js","/_astro/sakura.worker-S4lNqkzx.js","/_astro/SakuraEffect.astro_astro_type_script_index_0_lang.DAMRM4mU.js","/_astro/Search.DySC86B7.js","/_astro/setting-utils.xyc7Dz3I.js","/_astro/SharePoster.hsMczkmD.js","/_astro/SidebarTOC.astro_astro_type_script_index_0_lang.DE_b25Sl.js","/_astro/Swup.modern.Ds7DjtjX.js","/_astro/Swup.wQpqpZlg.js","/_astro/SwupA11yPlugin.st3fEWXw.js","/_astro/SwupHeadPlugin.CJV9x5S0.js","/_astro/SwupPreloadPlugin.DLed3hvq.js","/_astro/SwupScriptsPlugin.KOkp8JHL.js","/_astro/TabNav.C_gvoAoW.js","/_astro/toc-utils.Cx3prRFg.js","/_astro/translation.BY1IZ6RH.js","/_astro/url-utils.BLnfAbHg.js","/_astro/VndbGrid.BMCx2DBO.js","/_astro/WavesEffect.astro_astro_type_script_index_0_lang.DwU8s_Lh.js","/pio/README.md","/assets/fonts/GreatVibes-Regular-2.otf","/assets/css/highlight-github-dark.min.css","/assets/css/twikoo-custom.css","/assets/js/highlight.min.js","/assets/js/marked.min.js","/assets/music/使一颗心免于哀伤-哼唱.mp3","/gallery/encrypted-test/urls.txt","/gallery/firefly-2026/1.avif","/gallery/firefly-2026/cover.avif","/gallery/firefly-2026/urls.txt","/pio/static/spine-player.min.css","/pio/static/spine-player.min.js","/assets/images/ad/ad1.webp","/assets/images/effects/sakura.png","/assets/images/sponsor/alipay.png","/assets/images/sponsor/wechat.png","/assets/music/cover/109951169585655912.webp","/pio/models/live2d/snow_miku/model.json","/pio/models/live2d/snow_miku/model.moc","/pio/models/spine/firefly/1310.atlas","/pio/models/spine/firefly/1310.json","/pio/models/spine/firefly/1310.png","/pio/models/spine/firefly/1310.spine","/pio/models/live2d/snow_miku/textures/texture_00.png","/pio/models/spine/firefly/audio/使一颗心免于哀伤-哼唱.wav","/pio/models/live2d/snow_miku/motions/idle/idle.mtn","/pio/models/spine/firefly/images/E眉毛.png","/pio/models/spine/firefly/images/E眼珠.png","/pio/models/spine/firefly/images/E眼白.png","/pio/models/spine/firefly/images/E眼皮.png","/pio/models/spine/firefly/images/E眼角.png","/pio/models/spine/firefly/images/E睫毛.png","/pio/models/spine/firefly/images/E脸1.png","/pio/models/spine/firefly/images/E脸2.png","/pio/models/spine/firefly/images/L大臂.png","/pio/models/spine/firefly/images/L大臂衣袖.png","/pio/models/spine/firefly/images/L大臂衣袖后.png","/pio/models/spine/firefly/images/L正常左小臂.png","/pio/models/spine/firefly/images/L正常左手.png","/pio/models/spine/firefly/images/L正常左袖口.png","/pio/models/spine/firefly/images/M嘴巴.png","/pio/models/spine/firefly/images/M笑口.png","/pio/models/spine/firefly/images/M说话.png","/pio/models/spine/firefly/images/R大臂.png","/pio/models/spine/firefly/images/R大臂衣袖.png","/pio/models/spine/firefly/images/R大臂衣袖后.png","/pio/models/spine/firefly/images/R正常右小臂.png","/pio/models/spine/firefly/images/R正常右手.png","/pio/models/spine/firefly/images/X眼.png","/pio/models/spine/firefly/images/发1.png","/pio/models/spine/firefly/images/发10.png","/pio/models/spine/firefly/images/发11内阴影.png","/pio/models/spine/firefly/images/发2.png","/pio/models/spine/firefly/images/发3.png","/pio/models/spine/firefly/images/发4.png","/pio/models/spine/firefly/images/发5.png","/pio/models/spine/firefly/images/发6.png","/pio/models/spine/firefly/images/发7.png","/pio/models/spine/firefly/images/发8.png","/pio/models/spine/firefly/images/发9.png","/pio/models/spine/firefly/images/发带.png","/pio/models/spine/firefly/images/发影子.png","/pio/models/spine/firefly/images/发饰1.png","/pio/models/spine/firefly/images/发饰2.png","/pio/models/spine/firefly/images/发饰3.png","/pio/models/spine/firefly/images/可爱花朵.png","/pio/models/spine/firefly/images/右大腿.png","/pio/models/spine/firefly/images/右小腿.png","/pio/models/spine/firefly/images/后发1.png","/pio/models/spine/firefly/images/后发2.png","/pio/models/spine/firefly/images/后发3.png","/pio/models/spine/firefly/images/后发4.png","/pio/models/spine/firefly/images/后摆.png","/pio/models/spine/firefly/images/后脑勺.png","/pio/models/spine/firefly/images/左大腿.png","/pio/models/spine/firefly/images/左小腿.png","/pio/models/spine/firefly/images/星星1.png","/pio/models/spine/firefly/images/星星2.png","/pio/models/spine/firefly/images/星星3.png","/pio/models/spine/firefly/images/星星4.png","/pio/models/spine/firefly/images/生气符号1.png","/pio/models/spine/firefly/images/生气符号2.png","/pio/models/spine/firefly/images/胸饰.png","/pio/models/spine/firefly/images/脸红.png","/pio/models/spine/firefly/images/裙边.png","/pio/models/spine/firefly/images/身体.png","/pio/models/spine/firefly/images/问号.png","/pio/models/spine/firefly/images/领子.png","/pio/models/spine/firefly/images/领结.png","/pio/models/spine/firefly/images/鼻子.png","/_astro/d1.v_J1gD3P.avif","/_astro/d5.z7QGp_dj.avif","/_astro/m4.DzLJp29g.avif","/_astro/github.urcbElKG.avif","/_astro/m2.DdvPaSds.avif","/_astro/m3.D3bdkV68.avif","/_astro/m1.DEh_M2ue.avif","/_astro/d4.Brgr35k-.avif","/_astro/d2.G7EObyHu.avif","/_astro/d6.DetxM4Sl.avif","/_astro/masonry.BgzRsBcp.avif","/_astro/both-list.CybtDZTU.avif","/_astro/both-grid.B-BFe9Al.avif","/_astro/firefly-dark.b7MsfgPt.png","/_astro/docusaurus.Cu-On_k2.avif","/_astro/left-grid3.DCIbm9j3.avif","/_astro/firefly-light.DZ-mS7Sc.png","/_astro/cover.bDPQizdp.avif","/_astro/1.BQ4-k1kz.avif","/_astro/m6.Ca2EuEDu.avif","/_astro/left-list.CdJfuugk.avif","/_astro/d3.CGCRs0-H.avif","/_astro/avatar.BcAu2wMi.avif","/_astro/vitepress.D2YnjBWE.avif","/_astro/firefly1.CZCuCN4V.avif","/_astro/m5.UNwLEw9O.avif","/_astro/obsidian.Cwb2iYzd.avif","/_astro/firefly3.CGzFXcxi.avif","/_astro/right-grid2.BDLeNFG9.avif","/_astro/firefly2.dxmXG905.avif","/_astro/Layout.VNGNB4tJ.css","/_astro/MainGridLayout.DbDPyati.css","/_astro/markdown-extend.CV7FOiE_.css","/_astro/mdx-example.CLJa-wWH.css","/_astro/_..B1ALX-2b.css","/_astro/index.DQ7pDkUf.css","/_astro/_..Bs9RgYNK.css","/_astro/KaTeX_AMS-Regular.BQhdFMY1.woff2","/_astro/KaTeX_AMS-Regular.DMm9YOAa.woff","/_astro/KaTeX_AMS-Regular.DRggAlZN.ttf","/_astro/KaTeX_Caligraphic-Bold.Dq_IR9rO.woff2","/_astro/KaTeX_Caligraphic-Bold.BEiXGLvX.woff","/_astro/KaTeX_Caligraphic-Bold.ATXxdsX0.ttf","/_astro/KaTeX_Caligraphic-Regular.Di6jR-x-.woff2","/_astro/KaTeX_Caligraphic-Regular.CTRA-rTL.woff","/_astro/KaTeX_Caligraphic-Regular.wX97UBjC.ttf","/_astro/KaTeX_Fraktur-Bold.CL6g_b3V.woff2","/_astro/KaTeX_Fraktur-Bold.BsDP51OF.woff","/_astro/KaTeX_Fraktur-Bold.BdnERNNW.ttf","/_astro/KaTeX_Fraktur-Regular.CTYiF6lA.woff2","/_astro/KaTeX_Fraktur-Regular.Dxdc4cR9.woff","/_astro/KaTeX_Fraktur-Regular.CB_wures.ttf","/_astro/KaTeX_Main-Bold.Cx986IdX.woff2","/_astro/KaTeX_Main-Bold.Jm3AIy58.woff","/_astro/KaTeX_Main-Bold.waoOVXN0.ttf","/_astro/KaTeX_Main-BoldItalic.DxDJ3AOS.woff2","/_astro/KaTeX_Main-BoldItalic.SpSLRI95.woff","/_astro/KaTeX_Main-BoldItalic.DzxPMmG6.ttf","/_astro/KaTeX_Main-Italic.NWA7e6Wa.woff2","/_astro/KaTeX_Main-Italic.BMLOBm91.woff","/_astro/KaTeX_Main-Italic.3WenGoN9.ttf","/_astro/KaTeX_Main-Regular.B22Nviop.woff2","/_astro/KaTeX_Main-Regular.Dr94JaBh.woff","/_astro/KaTeX_Main-Regular.ypZvNtVU.ttf","/_astro/KaTeX_Math-BoldItalic.CZnvNsCZ.woff2","/_astro/KaTeX_Math-BoldItalic.iY-2wyZ7.woff","/_astro/KaTeX_Math-BoldItalic.B3XSjfu4.ttf","/_astro/KaTeX_Math-Italic.t53AETM-.woff2","/_astro/KaTeX_Math-Italic.DA0__PXp.woff","/_astro/KaTeX_Math-Italic.flOr_0UB.ttf","/_astro/KaTeX_SansSerif-Bold.D1sUS0GD.woff2","/_astro/KaTeX_SansSerif-Bold.DbIhKOiC.woff","/_astro/KaTeX_SansSerif-Bold.CFMepnvq.ttf","/_astro/KaTeX_SansSerif-Italic.C3H0VqGB.woff2","/_astro/KaTeX_SansSerif-Italic.DN2j7dab.woff","/_astro/KaTeX_SansSerif-Italic.YYjJ1zSn.ttf","/_astro/KaTeX_SansSerif-Regular.DDBCnlJ7.woff2","/_astro/KaTeX_SansSerif-Regular.CS6fqUqJ.woff","/_astro/KaTeX_SansSerif-Regular.BNo7hRIc.ttf","/_astro/KaTeX_Script-Regular.D3wIWfF6.woff2","/_astro/KaTeX_Script-Regular.D5yQViql.woff","/_astro/KaTeX_Script-Regular.C5JkGWo-.ttf","/_astro/KaTeX_Size1-Regular.mCD8mA8B.woff2","/_astro/KaTeX_Size1-Regular.C195tn64.woff","/_astro/KaTeX_Size1-Regular.Dbsnue_I.ttf","/_astro/KaTeX_Size2-Regular.Dy4dx90m.woff2","/_astro/KaTeX_Size2-Regular.oD1tc_U0.woff","/_astro/KaTeX_Size2-Regular.B7gKUWhC.ttf","/_astro/KaTeX_Size3-Regular.CTq5MqoE.woff","/_astro/KaTeX_Size3-Regular.DgpXs0kz.ttf","/_astro/KaTeX_Size4-Regular.Dl5lxZxV.woff2","/_astro/KaTeX_Size4-Regular.BF-4gkZK.woff","/_astro/KaTeX_Size4-Regular.DWFBv043.ttf","/_astro/KaTeX_Typewriter-Regular.CO6r4hn1.woff2","/_astro/KaTeX_Typewriter-Regular.C0xS9mPB.woff","/_astro/KaTeX_Typewriter-Regular.D3Ib7_Hf.ttf","/_astro/page.BpqnxC_1.js","/404.html","/about/index.html","/admin/index.html","/api/allPostMeta.json","/api/dynamic.json","/archive/index.html","/atom/index.html","/atom.xml","/bangumi/index.html","/bilibili/index.html","/booknav/index.html","/categories/index.html","/dynamic/comments/index.html","/dynamic/index.html","/friends/index.html","/gallery/index.html","/guestbook/index.html","/llms.txt","/myanimelist/index.html","/projects/index.html","/robots.txt","/rss/index.html","/rss.xml","/search/index.html","/series/index.html","/sponsor/index.html","/tags/index.html","/vndb/index.html"],"buildFormat":"directory","checkOrigin":true,"actionBodySizeLimit":1048576,"serverIslandBodySizeLimit":1048576,"allowedDomains":[],"key":"vqt/MXO6E/lisi+JL/IXp3SaslSOFuHdEfaHmByZxxc=","image":{"layout":"none"},"devToolbar":{"enabled":false,"debugInfoOutput":""},"logLevel":"info","shouldInjectCspMetaTags":false});
var manifestRoutes = _manifest.routes;
var manifest = Object.assign(_manifest, {
	renderers,
	actions: () => import("./chunks/noop-entrypoint_Z3zFhrGC.mjs"),
	middleware: () => import("./virtual_astro_middleware.mjs"),
	sessionDriver: () => import("./chunks/_virtual_astro_session-driver_C-PI1Pas.mjs"),
	serverIslandMappings: () => import("./chunks/_virtual_astro_server-island-manifest_C1Q2srgE.mjs"),
	routes: manifestRoutes,
	pageMap
});
function getAmbientManifest() {
	const manifest$1 = manifest;
	if (!manifest$1) throw new AstroError(NoManifestAvailable);
	return manifest$1;
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/app/render-options.js
var renderOptionsSymbol = /* @__PURE__ */ Symbol.for("astro.renderOptions");
function getRenderOptions(request) {
	return Reflect.get(request, renderOptionsSymbol);
}
function setRenderOptions(request, options) {
	Reflect.set(request, renderOptionsSymbol, options);
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/middleware/defineMiddleware.js
function defineMiddleware(fn) {
	return fn;
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/app/origin-check.js
var FORM_CONTENT_TYPES = [
	"application/x-www-form-urlencoded",
	"multipart/form-data",
	"text/plain"
];
var SAFE_METHODS = [
	"GET",
	"HEAD",
	"OPTIONS"
];
function isForbiddenCrossOriginRequest(request, url, isPrerendered) {
	if (isPrerendered) return false;
	if (SAFE_METHODS.includes(request.method)) return false;
	const isSameOrigin = request.headers.get("origin") === url.origin;
	if (request.headers.has("content-type")) return hasFormLikeHeader(request.headers.get("content-type")) && !isSameOrigin;
	return !isSameOrigin;
}
function createCrossOriginForbiddenResponse(request) {
	return new Response(`Cross-site ${request.method} form submissions are forbidden`, { status: 403 });
}
function createOriginCheckMiddleware() {
	return defineMiddleware((context, next) => {
		const { request, url, isPrerendered } = context;
		if (isForbiddenCrossOriginRequest(request, url, isPrerendered)) return createCrossOriginForbiddenResponse(request);
		return next();
	});
}
function hasFormLikeHeader(contentType) {
	if (contentType) {
		for (const FORM_CONTENT_TYPE of FORM_CONTENT_TYPES) if (contentType.toLowerCase().includes(FORM_CONTENT_TYPE)) return true;
	}
	return false;
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/fetch/features.js
var FetchFeatures = {
	redirects: 1,
	sessions: 2,
	actions: 4,
	middleware: 8,
	i18n: 16,
	cache: 32
};
var ALL_FETCH_FEATURES = FetchFeatures.redirects | FetchFeatures.sessions | FetchFeatures.actions | FetchFeatures.middleware | FetchFeatures.i18n | FetchFeatures.cache;
var usedFeatures = /* @__PURE__ */ new WeakMap();
function markFeatureUsed(manifest, feature) {
	const entry = usedFeatures.get(manifest);
	if (entry) entry.bits |= feature;
	else usedFeatures.set(manifest, { bits: feature });
}
function getUsedFeatures(manifest) {
	return usedFeatures.get(manifest)?.bits ?? 0;
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/build/util.js
function shouldAppendForwardSlash(trailingSlash, buildFormat) {
	switch (trailingSlash) {
		case "always": return true;
		case "never": return false;
		case "ignore": switch (buildFormat) {
			case "directory": return true;
			case "preserve":
			case "file": return false;
		}
	}
}
var ACTION_QUERY_PARAMS = {
	actionName: "_action",
	actionPayload: "_astroActionPayload"
};
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/actions/runtime/client.js
var codeToStatusMap = {
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
	PAYMENT_REQUIRED: 402,
	FORBIDDEN: 403,
	NOT_FOUND: 404,
	METHOD_NOT_ALLOWED: 405,
	NOT_ACCEPTABLE: 406,
	PROXY_AUTHENTICATION_REQUIRED: 407,
	REQUEST_TIMEOUT: 408,
	CONFLICT: 409,
	GONE: 410,
	LENGTH_REQUIRED: 411,
	PRECONDITION_FAILED: 412,
	CONTENT_TOO_LARGE: 413,
	URI_TOO_LONG: 414,
	UNSUPPORTED_MEDIA_TYPE: 415,
	RANGE_NOT_SATISFIABLE: 416,
	EXPECTATION_FAILED: 417,
	MISDIRECTED_REQUEST: 421,
	UNPROCESSABLE_CONTENT: 422,
	LOCKED: 423,
	FAILED_DEPENDENCY: 424,
	TOO_EARLY: 425,
	UPGRADE_REQUIRED: 426,
	PRECONDITION_REQUIRED: 428,
	TOO_MANY_REQUESTS: 429,
	REQUEST_HEADER_FIELDS_TOO_LARGE: 431,
	UNAVAILABLE_FOR_LEGAL_REASONS: 451,
	INTERNAL_SERVER_ERROR: 500,
	NOT_IMPLEMENTED: 501,
	BAD_GATEWAY: 502,
	SERVICE_UNAVAILABLE: 503,
	GATEWAY_TIMEOUT: 504,
	HTTP_VERSION_NOT_SUPPORTED: 505,
	VARIANT_ALSO_NEGOTIATES: 506,
	INSUFFICIENT_STORAGE: 507,
	LOOP_DETECTED: 508,
	NETWORK_AUTHENTICATION_REQUIRED: 511
};
var statusToCodeMap = Object.fromEntries(Object.entries(codeToStatusMap).map(([key, value]) => [value, key]));
var ActionError = class ActionError extends Error {
	type = "AstroActionError";
	code = "INTERNAL_SERVER_ERROR";
	status = 500;
	constructor(params) {
		super(params.message);
		this.code = params.code;
		this.status = ActionError.codeToStatus(params.code);
		if (params.stack) this.stack = params.stack;
	}
	static codeToStatus(code) {
		return codeToStatusMap[code];
	}
	static statusToCode(status) {
		return statusToCodeMap[status] ?? "INTERNAL_SERVER_ERROR";
	}
	static fromJson(body) {
		if (isInputError(body)) return new ActionInputError(body.issues);
		if (isActionError(body)) return new ActionError(body);
		return new ActionError({ code: "INTERNAL_SERVER_ERROR" });
	}
};
function isActionError(error) {
	return typeof error === "object" && error != null && "type" in error && error.type === "AstroActionError";
}
function isInputError(error) {
	return typeof error === "object" && error != null && "type" in error && error.type === "AstroActionInputError" && "issues" in error && Array.isArray(error.issues);
}
var ActionInputError = class extends ActionError {
	type = "AstroActionInputError";
	issues;
	fields;
	constructor(issues) {
		super({
			message: `Failed to validate: ${JSON.stringify(issues, null, 2)}`,
			code: "BAD_REQUEST"
		});
		this.issues = issues;
		this.fields = {};
		for (const issue of issues) if (issue.path.length > 0) {
			const key = issue.path[0].toString();
			this.fields[key] ??= [];
			this.fields[key]?.push(issue.message);
		}
	}
};
function deserializeActionResult(res) {
	if (res.type === "error") {
		let json;
		try {
			json = JSON.parse(res.body);
		} catch {
			return {
				data: void 0,
				error: new ActionError({
					message: res.body,
					code: "INTERNAL_SERVER_ERROR"
				})
			};
		}
		if (Object.assign({
			"ASSETS_PREFIX": void 0,
			"BASE_URL": "/",
			"DEV": false,
			"MODE": "production",
			"PROD": true,
			"SITE": "https://firefly.cuteleaf.cn",
			"SSR": true
		}, {
			CI: "true",
			OS: "Windows_NT",
			Path: "D:\\MY blog\\Firefly\\node_modules\\.bin;D:\\MY blog\\Firefly\\node_modules\\.bin;D:\\MY blog\\node_modules\\.bin;D:\\node_modules\\.bin;C:\\Program Files\\nodejs\\node_modules\\npm\\node_modules\\@npmcli\\run-script\\lib\\node-gyp-bin;d:\\软件\\Trae CN\\resources\\app\\modules\\ai-agent\\bin;\\\\?\\C:\\Users\\38065\\.trae-cn\\plugins\\trae-remote-official\\lark\\1.0.5\\bin;C:\\Program Files\\NVIDIA GPU Computing Toolkit\\CUDA\\v13.2\\bin\\x64;C:\\Program Files\\NVIDIA GPU Computing Toolkit\\CUDA\\v13.2\\bin;C:\\Program Files\\Common Files\\Oracle\\Java\\javapath;C:\\Program Files\\Microsoft\\jdk-17.0.13.11-hotspot\\bin;C:\\Windows\\system32;C:\\Windows;C:\\Windows\\System32\\Wbem;C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\;C:\\Windows\\System32\\OpenSSH\\;C:\\Program Files (x86)\\NVIDIA Corporation\\PhysX\\Common;C:\\Program Files\\NVIDIA Corporation\\NVIDIA app\\NvDLISR;C:\\Program Files\\dotnet\\;D:\\Microsoft VS Code\\bin;C:\\Program Files\\Calibre2\\;C:\\Program Files\\nodejs\\;C:\\Program Files\\Git\\cmd;C:\\Program Files\\HZVPN\\cli;C:\\Program Files\\Sunshine;C:\\Program Files\\Sunshine\\tools;C:\\Program Files\\NVIDIA Corporation\\Nsight Compute 2026.1.0\\;C:\\Users\\38065\\AppData\\Local\\Programs\\Python\\Python313\\Scripts\\;C:\\Users\\38065\\AppData\\Local\\Programs\\Python\\Python313\\;C:\\Users\\38065\\AppData\\Local\\Programs\\Python\\Python312\\Scripts\\;C:\\Users\\38065\\AppData\\Local\\Programs\\Python\\Python312\\;D:\\transalator\\Miniconda3;D:\\transalator\\Miniconda3\\Library\\mingw-w64\\bin;D:\\transalator\\Miniconda3\\Library\\usr\\bin;D:\\transalator\\Miniconda3\\Library\\bin;D:\\transalator\\Miniconda3\\Scripts;D:\\toll\\Scripts\\;D:\\toll\\;C:\\Users\\38065\\AppData\\Local\\Microsoft\\WindowsApps;C:\\Users\\38065\\.dotnet\\tools;C:\\msys64\\ucrt64\\bin;D:\\JetBrains Rider 2025.3.0.3\\bin;D:\\CLion 2025.3\\bin;C:\\Users\\38065\\AppData\\Roaming\\Amazon;C:\\Users\\38065\\AppData\\Roaming\\npm;C:\\Users\\38065\\AppData\\Local\\GitHubDesktop\\bin;C:\\Users\\38065\\AppData\\Local\\Programs\\Microsoft VS Code\\bin;d:\\锟斤拷锟斤拷\\Trae CN\\resources\\app\\bin\\lib;d:\\软件\\Trae CN\\resources\\app\\node_modules\\@vscode\\ripgrep\\bin"
		})?.PROD) return {
			error: ActionError.fromJson(json),
			data: void 0
		};
		else {
			const error = ActionError.fromJson(json);
			error.stack = actionResultErrorStack.get();
			return {
				error,
				data: void 0
			};
		}
	}
	if (res.type === "empty") return {
		data: void 0,
		error: void 0
	};
	return {
		data: parse(res.body, { URL: (href) => new URL(href) }),
		error: void 0
	};
}
var actionResultErrorStack = /* @__PURE__ */ (function actionResultErrorStackFn() {
	let errorStack;
	return {
		set(stack) {
			errorStack = stack;
		},
		get() {
			return errorStack;
		}
	};
})();
function getActionQueryString(name) {
	return `?${new URLSearchParams({ [ACTION_QUERY_PARAMS.actionName]: name }).toString()}`;
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/actions/utils.js
function hasActionPayload(locals) {
	return "_actionPayload" in locals;
}
function createGetActionResult(locals) {
	return (actionFn) => {
		if (!hasActionPayload(locals) || actionFn.toString() !== getActionQueryString(locals._actionPayload.actionName)) return;
		return deserializeActionResult(locals._actionPayload.actionResult);
	};
}
function createCallAction(context) {
	return (baseAction, input) => {
		Reflect.set(context, ACTION_API_CONTEXT_SYMBOL, true);
		return baseAction.bind(context)(input);
	};
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/i18n/error-routes.js
function isLocalizedErrorRoute(route, status, locales) {
	if (!locales) return false;
	const suffix = `/${status}`;
	if (!route.endsWith(suffix)) return false;
	const localeSegment = route.slice(0, -suffix.length);
	if (!localeSegment || localeSegment.includes("/", 1)) return false;
	return pathHasLocale(localeSegment, locales);
}
function getErrorRoutePath(pathname, status, routes, locales, appendTrailingSlash = false) {
	const suffix = appendTrailingSlash ? "/" : "";
	if (locales) {
		const firstSegment = pathname.split("/").find(Boolean);
		if (firstSegment && pathHasLocale(`/${firstSegment}`, locales)) {
			const localized = `/${firstSegment}/${status}`;
			if (routes.some((route) => route.route === localized)) return `${localized}${suffix}`;
		}
	}
	return `/${status}${suffix}`;
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/routing/helpers.js
function routeIsRedirect(route) {
	return route?.type === "redirect";
}
function routeIsFallback(route) {
	return route?.type === "fallback";
}
function getFallbackRoute(route, routeList) {
	const fallbackRoute = routeList.find((r) => {
		if (route.route === "/" && r.routeData.route === "/") return true;
		return r.routeData.fallbackRoutes.find((f) => {
			return f.route === route.route;
		});
	});
	if (!fallbackRoute) throw new Error(`No fallback route found for route ${route.route}`);
	return fallbackRoute.routeData;
}
function getCustom404Route(manifestData) {
	return manifestData.routes.find((r) => isRoute404(r.route));
}
function getCustom500Route(manifestData) {
	return manifestData.routes.find((r) => isRoute500(r.route));
}
function getDefaultStatusCode(manifest, routeData, pathname) {
	if (!routeData.pattern.test(pathname)) {
		for (const fallbackRoute of routeData.fallbackRoutes) if (fallbackRoute.pattern.test(pathname)) return 302;
	}
	const route = removeTrailingForwardSlash(routeData.route);
	const locales = manifest.i18n?.locales;
	if (isRoute404(route) || isLocalizedErrorRoute(route, 404, locales)) return 404;
	if (isRoute500(route) || isLocalizedErrorRoute(route, 500, locales)) return 500;
	return 200;
}
function routeHasHtmlExtension(route) {
	return route.segments.some((segment) => segment.some((part) => !part.dynamic && part.content.includes(".html")));
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/redirects/component.js
var RedirectComponentInstance = { default() {
	return new Response(null, { status: 301 });
} };
var RedirectSinglePageBuiltModule = {
	page: () => Promise.resolve(RedirectComponentInstance),
	onRequest: (_, next) => next()
};
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/assets/utils/getAssetsPrefix.js
function getAssetsPrefix(fileExtension, assetsPrefix) {
	let prefix = "";
	if (!assetsPrefix) prefix = "";
	else if (typeof assetsPrefix === "string") prefix = assetsPrefix;
	else prefix = assetsPrefix[fileExtension.slice(1)] || assetsPrefix.fallback;
	return prefix;
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/render/ssr-element.js
var URL_PARSE_BASE = "https://astro.build";
function splitAssetPath(path) {
	const parsed = new URL(path, URL_PARSE_BASE);
	return {
		pathname: !URL.canParse(path) && !path.startsWith("/") ? parsed.pathname.slice(1) : parsed.pathname,
		suffix: `${parsed.search}${parsed.hash}`
	};
}
function appendQueryParams(path, queryParams) {
	const queryString = queryParams.toString();
	if (!queryString) return path;
	const hashIndex = path.indexOf("#");
	const basePath = hashIndex === -1 ? path : path.slice(0, hashIndex);
	const hash = hashIndex === -1 ? "" : path.slice(hashIndex);
	return `${basePath}${basePath.includes("?") ? "&" : "?"}${queryString}${hash}`;
}
function createAssetLink(href, base, assetsPrefix, queryParams) {
	const { pathname, suffix } = splitAssetPath(href);
	let url = "";
	if (assetsPrefix) {
		const pf = getAssetsPrefix(fileExtension(pathname), assetsPrefix);
		url = joinPaths(pf, slash(pathname)) + suffix;
	} else if (base) url = prependForwardSlash(joinPaths(base, slash(pathname))) + suffix;
	else url = href;
	if (queryParams) url = appendQueryParams(url, queryParams);
	return url;
}
function createStylesheetElement(stylesheet, base, assetsPrefix, queryParams) {
	if (stylesheet.type === "inline") return {
		props: {},
		children: stylesheet.content
	};
	else return {
		props: {
			rel: "stylesheet",
			href: createAssetLink(stylesheet.src, base, assetsPrefix, queryParams)
		},
		children: ""
	};
}
function createStylesheetElementSet(stylesheets, base, assetsPrefix, queryParams) {
	return new Set(stylesheets.map((s) => createStylesheetElement(s, base, assetsPrefix, queryParams)));
}
function createModuleScriptElement(script, base, assetsPrefix, queryParams) {
	if (script.type === "external") return createModuleScriptElementWithSrc(script.value, base, assetsPrefix, queryParams);
	else return {
		props: { type: "module" },
		children: script.value
	};
}
function createModuleScriptElementWithSrc(src, base, assetsPrefix, queryParams) {
	return {
		props: {
			type: "module",
			src: createAssetLink(src, base, assetsPrefix, queryParams)
		},
		children: ""
	};
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/manifest/memo.js
function createManifestMemo(derive) {
	const cache = /* @__PURE__ */ new WeakMap();
	return {
		get(manifest) {
			if (cache.has(manifest)) return cache.get(manifest);
			const value = derive(manifest);
			cache.set(manifest, value);
			return value;
		},
		has(manifest) {
			return cache.has(manifest);
		},
		set(manifest, value) {
			cache.set(manifest, value);
		},
		invalidate(manifest) {
			cache.delete(manifest);
		}
	};
}
function createAsyncManifestMemo(derive) {
	const cache = /* @__PURE__ */ new WeakMap();
	return {
		get(manifest) {
			let promise = cache.get(manifest);
			if (!promise) {
				promise = derive(manifest);
				cache.set(manifest, promise);
				promise.catch(() => {
					if (cache.get(manifest) === promise) cache.delete(manifest);
				});
			}
			return promise;
		},
		invalidate(manifest) {
			cache.delete(manifest);
		}
	};
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/request-body.js
async function readBodyWithLimit(request, limit) {
	const contentLengthHeader = request.headers.get("content-length");
	if (contentLengthHeader) {
		const contentLength = Number.parseInt(contentLengthHeader, 10);
		if (Number.isFinite(contentLength) && contentLength > limit) throw new BodySizeLimitError(limit);
	}
	if (!request.body) return /* @__PURE__ */ new Uint8Array();
	const reader = request.body.getReader();
	const chunks = [];
	let received = 0;
	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		if (value) {
			received += value.byteLength;
			if (received > limit) throw new BodySizeLimitError(limit);
			chunks.push(value);
		}
	}
	const buffer = new Uint8Array(received);
	let offset = 0;
	for (const chunk of chunks) {
		buffer.set(chunk, offset);
		offset += chunk.byteLength;
	}
	return buffer;
}
var BodySizeLimitError = class extends Error {
	limit;
	constructor(limit) {
		super(`Request body exceeds the configured limit of ${limit} bytes`);
		this.name = "BodySizeLimitError";
		this.limit = limit;
	}
};
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/routing/pattern.js
function getPattern(segments, base, addTrailingSlash) {
	const pathname = segments.map((segment) => {
		if (segment.length === 1 && segment[0].spread) return "(?:\\/(.*?))?";
		else return "\\/" + segment.map((part) => {
			if (part.spread) return "(.*?)";
			else if (part.dynamic) return "([^/]+?)";
			else return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		}).join("");
	}).join("");
	const trailing = addTrailingSlash && segments.length ? getTrailingSlashPattern(addTrailingSlash) : "$";
	let initial = "\\/";
	if (addTrailingSlash === "never" && base !== "/" && pathname !== "") initial = "";
	return new RegExp(`^${pathname || initial}${trailing}`);
}
function getTrailingSlashPattern(addTrailingSlash) {
	if (addTrailingSlash === "always") return "\\/$";
	if (addTrailingSlash === "never") return "$";
	return "\\/?$";
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/server-islands/endpoint.js
var SERVER_ISLAND_ROUTE = "/_server-islands/[name]";
var SERVER_ISLAND_COMPONENT = "_server-islands.astro";
function badRequest(reason) {
	return new Response(null, {
		status: 400,
		statusText: "Bad request: " + reason
	});
}
var DEFAULT_BODY_SIZE_LIMIT = 1048576;
async function getRequestData(request, bodySizeLimit = DEFAULT_BODY_SIZE_LIMIT) {
	switch (request.method) {
		case "GET": {
			const params = new URL(request.url).searchParams;
			if (!params.has("s") || !params.has("e") || !params.has("p")) return badRequest("Missing required query parameters.");
			const encryptedSlots = params.get("s");
			return {
				encryptedComponentExport: params.get("e"),
				encryptedProps: params.get("p"),
				encryptedSlots
			};
		}
		case "POST": try {
			const body = await readBodyWithLimit(request, bodySizeLimit);
			const raw = new TextDecoder().decode(body);
			const data = JSON.parse(raw);
			if (Object.hasOwn(data, "slots") && typeof data.slots === "object") return badRequest("Plaintext slots are not allowed. Slots must be encrypted.");
			if (Object.hasOwn(data, "componentExport") && typeof data.componentExport === "string") return badRequest("Plaintext componentExport is not allowed. componentExport must be encrypted.");
			return data;
		} catch (e) {
			if (e instanceof BodySizeLimitError) return new Response(null, {
				status: 413,
				statusText: e.message
			});
			if (e instanceof SyntaxError) return badRequest("Request format is invalid.");
			throw e;
		}
		default: return new Response(null, { status: 405 });
	}
}
function createEndpoint(manifest) {
	const page = async (result) => {
		const params = result.params;
		if (!params.name) return new Response(null, {
			status: 400,
			statusText: "Bad request"
		});
		const componentId = params.name;
		const data = await getRequestData(result.request, manifest.serverIslandBodySizeLimit);
		if (data instanceof Response) return data;
		let imp = (await (await manifest.serverIslandMappings?.())?.serverIslandMap)?.get(componentId);
		if (!imp) return new Response(null, {
			status: 404,
			statusText: "Not found"
		});
		const key = await manifest.key;
		let componentExport;
		try {
			componentExport = await decryptString(key, data.encryptedComponentExport, `export:${componentId}`);
		} catch (_e) {
			return badRequest("Encrypted componentExport value is invalid.");
		}
		const encryptedProps = data.encryptedProps;
		let props = {};
		if (encryptedProps !== "") try {
			const propString = await decryptString(key, encryptedProps, `props:${componentId}`);
			props = JSON.parse(propString);
		} catch (_e) {
			return badRequest("Encrypted props value is invalid.");
		}
		let decryptedSlots = {};
		const encryptedSlots = data.encryptedSlots;
		if (encryptedSlots !== "") try {
			const slotsString = await decryptString(key, encryptedSlots, `slots:${componentId}`);
			decryptedSlots = JSON.parse(slotsString);
		} catch (_e) {
			return badRequest("Encrypted slots value is invalid.");
		}
		let Component = (await imp())[componentExport];
		const slots = {};
		for (const prop in decryptedSlots) slots[prop] = createSlotValueFromString(decryptedSlots[prop]);
		result.response.headers.set("X-Robots-Tag", "noindex");
		if (isAstroComponentFactory(Component)) {
			const ServerIsland = Component;
			Component = function(...args) {
				return ServerIsland.apply(this, args);
			};
			Object.assign(Component, ServerIsland);
			Component.propagation = "self";
		}
		result._metadata.routeHasPropagation = true;
		const renderPropagatedHead = () => markHTMLString(result._metadata.extraHead.join(""));
		return renderTemplate`${renderPropagatedHead}${renderComponent(result, "Component", Component, props, slots)}`;
	};
	page.isAstroComponentFactory = true;
	return {
		default: page,
		partial: true
	};
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/template/4xx.js
function template({ title, pathname, statusCode = 404, tabTitle, body }) {
	return `<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<title>${tabTitle}</title>
		<style>
			:root {
				--gray-10: hsl(258, 7%, 10%);
				--gray-20: hsl(258, 7%, 20%);
				--gray-30: hsl(258, 7%, 30%);
				--gray-40: hsl(258, 7%, 40%);
				--gray-50: hsl(258, 7%, 50%);
				--gray-60: hsl(258, 7%, 60%);
				--gray-70: hsl(258, 7%, 70%);
				--gray-80: hsl(258, 7%, 80%);
				--gray-90: hsl(258, 7%, 90%);
				--black: #13151A;
				--accent-light: #E0CCFA;
			}

			* {
				box-sizing: border-box;
			}

			html {
				background: var(--black);
				color-scheme: dark;
				accent-color: var(--accent-light);
			}

			body {
				background-color: var(--gray-10);
				color: var(--gray-80);
				font-family: ui-monospace, Menlo, Monaco, "Cascadia Mono", "Segoe UI Mono", "Roboto Mono", "Oxygen Mono", "Ubuntu Monospace", "Source Code Pro", "Fira Mono", "Droid Sans Mono", "Courier New", monospace;
				line-height: 1.5;
				margin: 0;
			}

			a {
				color: var(--accent-light);
			}

			.center {
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				height: 100vh;
				width: 100vw;
			}

			h1 {
				margin-bottom: 8px;
				color: white;
				font-family: system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
				font-weight: 700;
				margin-top: 1rem;
				margin-bottom: 0;
			}

			.statusCode {
				color: var(--accent-light);
			}

			.astro-icon {
				height: 124px;
				width: 124px;
			}

			pre, code {
				padding: 2px 8px;
				background: rgba(0,0,0, 0.25);
				border: 1px solid rgba(255,255,255, 0.25);
				border-radius: 4px;
				font-size: 1.2em;
				margin-top: 0;
				max-width: 60em;
			}
		</style>
	</head>
	<body>
		<main class="center">
			<svg class="astro-icon" xmlns="http://www.w3.org/2000/svg" width="64" height="80" viewBox="0 0 64 80" fill="none"> <path d="M20.5253 67.6322C16.9291 64.3531 15.8793 57.4632 17.3776 52.4717C19.9755 55.6188 23.575 56.6157 27.3035 57.1784C33.0594 58.0468 38.7122 57.722 44.0592 55.0977C44.6709 54.7972 45.2362 54.3978 45.9045 53.9931C46.4062 55.4451 46.5368 56.9109 46.3616 58.4028C45.9355 62.0362 44.1228 64.8429 41.2397 66.9705C40.0868 67.8215 38.8669 68.5822 37.6762 69.3846C34.0181 71.8508 33.0285 74.7426 34.403 78.9491C34.4357 79.0516 34.4649 79.1541 34.5388 79.4042C32.6711 78.5705 31.3069 77.3565 30.2674 75.7604C29.1694 74.0757 28.6471 72.2121 28.6196 70.1957C28.6059 69.2144 28.6059 68.2244 28.4736 67.257C28.1506 64.8985 27.0406 63.8425 24.9496 63.7817C22.8036 63.7192 21.106 65.0426 20.6559 67.1268C20.6215 67.2865 20.5717 67.4446 20.5218 67.6304L20.5253 67.6322Z" fill="white"/> <path d="M20.5253 67.6322C16.9291 64.3531 15.8793 57.4632 17.3776 52.4717C19.9755 55.6188 23.575 56.6157 27.3035 57.1784C33.0594 58.0468 38.7122 57.722 44.0592 55.0977C44.6709 54.7972 45.2362 54.3978 45.9045 53.9931C46.4062 55.4451 46.5368 56.9109 46.3616 58.4028C45.9355 62.0362 44.1228 64.8429 41.2397 66.9705C40.0868 67.8215 38.8669 68.5822 37.6762 69.3846C34.0181 71.8508 33.0285 74.7426 34.403 78.9491C34.4357 79.0516 34.4649 79.1541 34.5388 79.4042C32.6711 78.5705 31.3069 77.3565 30.2674 75.7604C29.1694 74.0757 28.6471 72.2121 28.6196 70.1957C28.6059 69.2144 28.6059 68.2244 28.4736 67.257C28.1506 64.8985 27.0406 63.8425 24.9496 63.7817C22.8036 63.7192 21.106 65.0426 20.6559 67.1268C20.6215 67.2865 20.5717 67.4446 20.5218 67.6304L20.5253 67.6322Z" fill="url(#paint0_linear_738_686)"/> <path d="M0 51.6401C0 51.6401 10.6488 46.4654 21.3274 46.4654L29.3786 21.6102C29.6801 20.4082 30.5602 19.5913 31.5538 19.5913C32.5474 19.5913 33.4275 20.4082 33.7289 21.6102L41.7802 46.4654C54.4274 46.4654 63.1076 51.6401 63.1076 51.6401C63.1076 51.6401 45.0197 2.48776 44.9843 2.38914C44.4652 0.935933 43.5888 0 42.4073 0H20.7022C19.5206 0 18.6796 0.935933 18.1251 2.38914C18.086 2.4859 0 51.6401 0 51.6401Z" fill="white"/> <defs> <linearGradient id="paint0_linear_738_686" x1="31.554" y1="75.4423" x2="39.7462" y2="48.376" gradientUnits="userSpaceOnUse"> <stop stop-color="#D83333"/> <stop offset="1" stop-color="#F041FF"/> </linearGradient> </defs> </svg>
			<h1>${statusCode ? `<span class="statusCode">${statusCode}: </span> ` : ""}<span class="statusMessage">${title}</span></h1>
			${body || `
				<pre>Path: ${escape(pathname)}</pre>
			`}
			</main>
	</body>
</html>`;
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/routing/internal/astro-designed-error-pages.js
var DEFAULT_404_ROUTE = {
	component: DEFAULT_404_COMPONENT,
	params: [],
	pattern: /^\/404\/?$/,
	prerender: false,
	pathname: "/404",
	segments: [[{
		content: "404",
		dynamic: false,
		spread: false
	}]],
	type: "page",
	route: "/404",
	fallbackRoutes: [],
	isIndex: false,
	origin: "internal",
	distURL: []
};
async function default404Page({ pathname }) {
	return new Response(template({
		statusCode: 404,
		title: "Not found",
		tabTitle: "404: Not Found",
		pathname
	}), {
		status: 404,
		headers: { "Content-Type": "text/html" }
	});
}
default404Page.isAstroComponentFactory = true;
var default404Instance = { default: default404Page };
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/routing/default.js
function createDefaultRoutes(manifest) {
	const root = new URL(manifest.rootDir);
	return [{
		instance: default404Instance,
		matchesComponent: (filePath) => filePath.href === new URL(DEFAULT_404_COMPONENT, root).href,
		route: DEFAULT_404_ROUTE.route,
		component: DEFAULT_404_COMPONENT
	}, {
		instance: createEndpoint(manifest),
		matchesComponent: (filePath) => filePath.href === new URL(SERVER_ISLAND_COMPONENT, root).href,
		route: SERVER_ISLAND_ROUTE,
		component: SERVER_ISLAND_COMPONENT
	}];
}
var defaultRoutesMemo = createManifestMemo(createDefaultRoutes);
function getDefaultRoutes(manifest) {
	return defaultRoutesMemo.get(manifest);
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/request.js
function createRequest({ url, headers, method = "GET", body = void 0, logger, isPrerendered = false, routePattern, init }) {
	const headersObj = isPrerendered ? void 0 : headers instanceof Headers ? headers : new Headers(Object.entries(headers).filter(([name]) => !name.startsWith(":")));
	if (typeof url === "string") url = new URL(url);
	if (isPrerendered) url.search = "";
	const request = new Request(url, {
		method,
		headers: headersObj,
		body: isPrerendered ? null : body,
		...init
	});
	if (isPrerendered) {
		let _headers = request.headers;
		const { value, writable, ...headersDesc } = Object.getOwnPropertyDescriptor(request, "headers") || {};
		Object.defineProperty(request, "headers", {
			...headersDesc,
			get() {
				logger.warn(null, `\`Astro.request.headers\` was used when rendering the route \`${routePattern}'\`. \`Astro.request.headers\` is not available on prerendered pages. If you need access to request headers, make sure that the page is server-rendered using \`export const prerender = false;\` or by setting \`output\` to \`"server"\` in your Astro config to make all your pages server-rendered by default.`);
				return _headers;
			},
			set(newHeaders) {
				_headers = newHeaders;
			}
		});
	}
	return request;
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/util/pathname.js
var MultiLevelEncodingError = class extends Error {
	constructor() {
		super("URL encoding depth exceeded the maximum number of decode iterations");
		this.name = "MultiLevelEncodingError";
	}
};
var MAX_DECODE_ITERATIONS = 10;
function validateAndDecodePathname(pathname) {
	let decoded;
	try {
		decoded = decodeURI(pathname);
	} catch (_e) {
		throw new Error("Invalid URL encoding");
	}
	let iterations = 0;
	while (decoded !== pathname) {
		if (iterations >= MAX_DECODE_ITERATIONS) throw new MultiLevelEncodingError();
		pathname = decoded;
		try {
			decoded = decodeURI(pathname);
		} catch {
			break;
		}
		iterations++;
	}
	return decoded;
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/routing/rewrite.js
function findRouteToRewrite({ payload, routes, request, trailingSlash, buildFormat, base, outDir }) {
	let newUrl = void 0;
	if (payload instanceof URL) newUrl = payload;
	else if (payload instanceof Request) newUrl = new URL(payload.url);
	else newUrl = new URL(collapseDuplicateSlashes(payload), new URL(request.url).origin);
	const { pathname, resolvedUrlPathname } = normalizeRewritePathname(newUrl.pathname, base, trailingSlash, buildFormat);
	newUrl.pathname = resolvedUrlPathname;
	const decodedPathname = validateAndDecodePathname(pathname);
	if (isRoute404(decodedPathname)) {
		const errorRoute = routes.find((route) => route.route === "/404");
		if (errorRoute) return {
			routeData: errorRoute,
			newUrl,
			pathname: decodedPathname
		};
	}
	if (isRoute500(decodedPathname)) {
		const errorRoute = routes.find((route) => route.route === "/500");
		if (errorRoute) return {
			routeData: errorRoute,
			newUrl,
			pathname: decodedPathname
		};
	}
	let foundRoute;
	for (const route of routes) if (route.pattern.test(decodedPathname)) {
		if (route.params && route.params.length !== 0 && route.distURL && route.distURL.length !== 0) {
			if (!route.distURL.find((url) => url.href.replace(outDir.toString(), "").replace(/(?:\/index\.html|\.html)$/, "") === trimSlashes(pathname))) continue;
		}
		foundRoute = route;
		break;
	}
	if (foundRoute) return {
		routeData: foundRoute,
		newUrl,
		pathname: decodedPathname
	};
	else {
		const custom404 = routes.find((route) => route.route === "/404");
		if (custom404) return {
			routeData: custom404,
			newUrl,
			pathname
		};
		else return {
			routeData: DEFAULT_404_ROUTE,
			newUrl,
			pathname
		};
	}
}
function copyRequest(newUrl, oldRequest, isPrerendered, logger, routePattern) {
	const canHaveBody = oldRequest.method !== "GET" && oldRequest.method !== "HEAD";
	if (canHaveBody && oldRequest.bodyUsed) throw new AstroError(RewriteWithBodyUsed);
	return createRequest({
		url: newUrl,
		method: oldRequest.method,
		body: canHaveBody ? oldRequest.body : void 0,
		isPrerendered,
		logger,
		headers: isPrerendered ? {} : oldRequest.headers,
		routePattern,
		init: {
			referrer: oldRequest.referrer,
			referrerPolicy: oldRequest.referrerPolicy,
			mode: oldRequest.mode,
			credentials: oldRequest.credentials,
			cache: oldRequest.cache,
			redirect: oldRequest.redirect,
			integrity: oldRequest.integrity,
			signal: oldRequest.signal,
			keepalive: oldRequest.keepalive,
			duplex: "half"
		}
	});
}
function setOriginPathname(request, pathname, trailingSlash, buildFormat) {
	if (!pathname) pathname = "/";
	const shouldAppendSlash = shouldAppendForwardSlash(trailingSlash, buildFormat);
	let finalPathname;
	if (pathname === "/") finalPathname = "/";
	else if (shouldAppendSlash) finalPathname = appendForwardSlash(pathname);
	else finalPathname = removeTrailingForwardSlash(pathname);
	Reflect.set(request, originPathnameSymbol, encodeURIComponent(finalPathname));
}
function getOriginPathname(request) {
	const origin = Reflect.get(request, originPathnameSymbol);
	if (origin) return decodeURIComponent(origin);
	return new URL(request.url).pathname;
}
function normalizeRewritePathname(urlPathname, base, trailingSlash, buildFormat) {
	let pathname = collapseDuplicateSlashes(urlPathname);
	const shouldAppendSlash = shouldAppendForwardSlash(trailingSlash, buildFormat);
	if (base !== "/") {
		if (urlPathname === base || urlPathname === removeTrailingForwardSlash(base)) pathname = "/";
		else if (urlPathname.startsWith(base)) {
			pathname = shouldAppendSlash ? appendForwardSlash(urlPathname) : removeTrailingForwardSlash(urlPathname);
			pathname = pathname.slice(base.length);
		}
	}
	if (!pathname.startsWith("/") && shouldAppendSlash && urlPathname.endsWith("/")) pathname = prependForwardSlash(pathname);
	if (buildFormat === "file") pathname = pathname.replace(/\.html$/, "");
	let resolvedUrlPathname;
	if (base !== "/" && (pathname === "" || pathname === "/") && !shouldAppendSlash) resolvedUrlPathname = removeTrailingForwardSlash(base);
	else resolvedUrlPathname = joinPaths(...[base, pathname].filter(Boolean));
	return {
		pathname,
		resolvedUrlPathname
	};
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/environment/production.js
async function getModuleForRoute(manifest, route) {
	for (const defaultRoute of getDefaultRoutes(manifest)) if (route.component === defaultRoute.component) return { page: () => Promise.resolve(defaultRoute.instance) };
	let routeToProcess = route;
	if (routeIsRedirect(route)) {
		if (route.redirectRoute) routeToProcess = route.redirectRoute;
		else return RedirectSinglePageBuiltModule;
	} else if (routeIsFallback(route)) routeToProcess = getFallbackRoute(route, manifest.routes);
	if (manifest.pageMap) {
		const importComponentInstance = manifest.pageMap.get(routeToProcess.component);
		if (!importComponentInstance) throw new Error(`Unexpectedly unable to find a component instance for route ${route.route}`);
		return await importComponentInstance();
	} else if (manifest.pageModule) return manifest.pageModule;
	throw new Error("Astro couldn't find the correct page to render, probably because it wasn't correctly mapped for SSR usage. This is an internal error, please file an issue.");
}
async function getComponentByRoute(manifest, routeData) {
	return (await getModuleForRoute(manifest, routeData)).page();
}
var productionEnvironment = {
	name: "production",
	runtimeMode: "production",
	defaultStreaming: () => true,
	async resolve(manifest, specifier) {
		if (!(specifier in manifest.entryModules)) throw new Error(`Unable to resolve [${specifier}]`);
		const bundlePath = manifest.entryModules[specifier];
		if (bundlePath.startsWith("data:") || bundlePath.length === 0) return bundlePath;
		else return createAssetLink(bundlePath, manifest.base, manifest.assetsPrefix);
	},
	async headElements(manifest, routeData) {
		const { assetsPrefix, base } = manifest;
		const routeInfo = manifest.routes.find((route) => route.routeData.route === routeData.route);
		const links = /* @__PURE__ */ new Set();
		const scripts = /* @__PURE__ */ new Set();
		const styles = createStylesheetElementSet(routeInfo?.styles ?? [], base, assetsPrefix);
		for (const script of routeInfo?.scripts ?? []) if ("stage" in script) {
			if (script.stage === "head-inline") scripts.add({
				props: {},
				children: script.children
			});
		} else scripts.add(createModuleScriptElement(script, base, assetsPrefix));
		return {
			links,
			styles,
			scripts
		};
	},
	componentMetadata() {},
	getComponentByRoute,
	getModuleForRoute,
	async tryRewrite(manifest, payload, request) {
		const { newUrl, pathname, routeData } = findRouteToRewrite({
			payload,
			request,
			routes: manifest.routes.map((r) => r.routeData),
			trailingSlash: manifest.trailingSlash,
			buildFormat: manifest.buildFormat,
			base: manifest.base,
			outDir: manifest.serverLike ? manifest.buildClientDir : manifest.outDir
		});
		return {
			newUrl,
			pathname,
			componentInstance: await getComponentByRoute(manifest, routeData),
			routeData
		};
	},
	getRenderers(manifest) {
		return manifest.renderers;
	},
	errorStrategy: "default",
	injectCspMetaTagsOnErrorPages: false,
	logRequest() {}
};
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/environment/index.js
var environments = /* @__PURE__ */ new WeakMap();
function getEnvironment(manifest) {
	return environments.get(manifest) ?? productionEnvironment;
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/logger/manifest-logger.js
var loggers = /* @__PURE__ */ new WeakMap();
function getLogger(manifest) {
	let logger = loggers.get(manifest);
	if (!logger) {
		logger = createConsoleLogger({ level: manifest.logLevel });
		loggers.set(manifest, logger);
	}
	return logger;
}
var resolvedLogger = createAsyncManifestMemo(async (manifest) => {
	const logger = getLogger(manifest);
	try {
		const destination = (await manifest.logger?.())?.default;
		if (destination) logger.setDestination(destination);
	} catch (error) {
		logger.error("config", "Failed to load the configured logger destination; continuing with the console logger.\n" + (error instanceof Error ? error.stack ?? error.message : String(error)));
	}
	return logger;
});
function getResolvedLogger(manifest) {
	return resolvedLogger.get(manifest);
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/routing/generator.js
function sanitizeParams(params) {
	return Object.fromEntries(Object.entries(params).map(([key, value]) => {
		if (typeof value === "string") return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
		return [key, value];
	}));
}
function getParameter(part, params) {
	if (part.spread) return params[part.content.slice(3)] ?? "";
	if (part.dynamic) {
		if (params[part.content] === void 0) throw new TypeError(`Missing parameter: ${part.content}`);
		return params[part.content];
	}
	return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
	const segmentPath = segment.map((part) => getParameter(part, params)).join("");
	return segmentPath ? collapseDuplicateLeadingSlashes("/" + segmentPath) : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
	return (params) => {
		const sanitizedParams = sanitizeParams(params);
		let trailing = "";
		if (addTrailingSlash === "always" && segments.length) trailing = "/";
		return segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing || "/";
	};
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/routing/internal/validation.js
var VALID_PARAM_TYPES = ["string", "undefined"];
function validateGetStaticPathsParameter([key, value], route) {
	if (!VALID_PARAM_TYPES.includes(typeof value)) throw new AstroError({
		...GetStaticPathsInvalidRouteParam,
		message: GetStaticPathsInvalidRouteParam.message(key, value, typeof value),
		location: { file: route }
	});
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/routing/params.js
function stringifyParams(params, route, trailingSlash) {
	if (route.type === "endpoint" && hasFileExtension(route.route)) trailingSlash = "never";
	const validatedParams = {};
	for (const [key, value] of Object.entries(params)) {
		validateGetStaticPathsParameter([key, value], route.component);
		if (value !== void 0) validatedParams[key] = trimSlashes(value);
	}
	return getRouteGenerator(route.segments, trailingSlash)(validatedParams);
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/routing/validation.js
function validateDynamicRouteModule(mod, { ssr, route }) {
	if ((!ssr || route.prerender) && route.origin !== "internal" && !mod.getStaticPaths) throw new AstroError({
		...GetStaticPathsRequired,
		location: { file: route.component }
	});
}
function validateGetStaticPathsResult(result, route) {
	if (!Array.isArray(result)) throw new AstroError({
		...InvalidGetStaticPathsReturn,
		message: InvalidGetStaticPathsReturn.message(typeof result),
		location: { file: route.component }
	});
	result.forEach((pathObject) => {
		if (typeof pathObject === "object" && Array.isArray(pathObject) || pathObject === null) throw new AstroError({
			...InvalidGetStaticPathsEntry,
			message: InvalidGetStaticPathsEntry.message(Array.isArray(pathObject) ? "array" : typeof pathObject)
		});
		if (pathObject.params === void 0 || pathObject.params === null || pathObject.params && Object.keys(pathObject.params).length === 0) throw new AstroError({
			...GetStaticPathsExpectedParams,
			location: { file: route.component }
		});
	});
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/render/paginate.js
function generatePaginateFunction(routeMatch, base, trailingSlash) {
	return function paginateUtility(data, args = {}) {
		const generate = getRouteGenerator(routeMatch.segments, trailingSlash);
		let { pageSize: _pageSize, params: _params, props: _props, format: _format } = args;
		const pageSize = _pageSize || 10;
		const paramName = "page";
		const additionalParams = _params || {};
		const additionalProps = _props || {};
		const formatUrl = _format || ((url) => url);
		let includesFirstPageNumber;
		if (routeMatch.params.includes(`...${paramName}`)) includesFirstPageNumber = false;
		else if (routeMatch.params.includes(`${paramName}`)) includesFirstPageNumber = true;
		else throw new AstroError({
			...PageNumberParamNotFound,
			message: PageNumberParamNotFound.message(paramName)
		});
		const lastPage = Math.max(1, Math.ceil(data.length / pageSize));
		return [...Array(lastPage).keys()].map((num) => {
			const pageNum = num + 1;
			const start = pageSize === Number.POSITIVE_INFINITY ? 0 : (pageNum - 1) * pageSize;
			const end = Math.min(start + pageSize, data.length);
			const params = {
				...additionalParams,
				[paramName]: includesFirstPageNumber || pageNum > 1 ? String(pageNum) : void 0
			};
			const current = formatUrl(addRouteBase(generate({ ...params }), base));
			const next = pageNum === lastPage ? void 0 : formatUrl(addRouteBase(generate({
				...params,
				page: String(pageNum + 1)
			}), base));
			const prev = pageNum === 1 ? void 0 : formatUrl(addRouteBase(generate({
				...params,
				page: !includesFirstPageNumber && pageNum - 1 === 1 ? void 0 : String(pageNum - 1)
			}), base));
			const first = pageNum === 1 ? void 0 : formatUrl(addRouteBase(generate({
				...params,
				page: includesFirstPageNumber ? "1" : void 0
			}), base));
			const last = pageNum === lastPage ? void 0 : formatUrl(addRouteBase(generate({
				...params,
				page: String(lastPage)
			}), base));
			return {
				params,
				props: {
					...additionalProps,
					page: {
						data: data.slice(start, end),
						start,
						end: end - 1,
						size: pageSize,
						total: data.length,
						currentPage: pageNum,
						lastPage,
						url: {
							current,
							next,
							prev,
							first,
							last
						}
					}
				}
			};
		});
	};
}
function addRouteBase(route, base) {
	let routeWithBase = joinPaths(base, route);
	if (routeWithBase === "") routeWithBase = "/";
	return routeWithBase;
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/render/route-cache.js
async function callGetStaticPaths({ mod, route, routeCache, ssr, base, trailingSlash }) {
	const cached = routeCache.get(route);
	if (!mod) throw new Error("This is an error caused by Astro and not your code. Please file an issue.");
	if (cached?.staticPaths && cached.mod === mod) return cached.staticPaths;
	validateDynamicRouteModule(mod, {
		ssr,
		route
	});
	if (ssr && !route.prerender || route.origin === "internal") {
		const entry = Object.assign([], { keyed: /* @__PURE__ */ new Map() });
		routeCache.set(route, {
			...cached,
			mod,
			staticPaths: entry
		});
		return entry;
	}
	let staticPaths = [];
	if (!mod.getStaticPaths) throw new Error("Unexpected Error.");
	staticPaths = await mod.getStaticPaths({
		paginate: generatePaginateFunction(route, base, trailingSlash),
		routePattern: route.route
	});
	validateGetStaticPathsResult(staticPaths, route);
	const keyedStaticPaths = staticPaths;
	keyedStaticPaths.keyed = /* @__PURE__ */ new Map();
	for (const sp of keyedStaticPaths) {
		const paramsKey = stringifyParams(sp.params, route, trailingSlash);
		keyedStaticPaths.keyed.set(paramsKey, sp);
	}
	routeCache.set(route, {
		...cached,
		mod,
		staticPaths: keyedStaticPaths
	});
	return keyedStaticPaths;
}
var RouteCache = class {
	logger;
	cache = {};
	runtimeMode;
	constructor(logger, runtimeMode = "production") {
		this.logger = logger;
		this.runtimeMode = runtimeMode;
	}
	/** Clear the cache. */
	clearAll() {
		this.cache = {};
	}
	set(route, entry) {
		const key = this.key(route);
		if (this.runtimeMode === "production" && this.cache[key]?.staticPaths) this.logger.warn(null, `Internal Warning: route cache overwritten. (${key})`);
		this.cache[key] = entry;
	}
	get(route) {
		return this.cache[this.key(route)];
	}
	key(route) {
		return `${route.route}_${route.component}`;
	}
};
var routeCaches = createManifestMemo((manifest) => new RouteCache(getLogger(manifest), getEnvironment(manifest).runtimeMode));
function getRouteCache(manifest) {
	return routeCaches.get(manifest);
}
function findPathItemByKey(staticPaths, params, route, logger, trailingSlash) {
	const paramsKey = stringifyParams(params, route, trailingSlash);
	const matchedStaticPath = staticPaths.keyed.get(paramsKey);
	if (matchedStaticPath) return matchedStaticPath;
	logger.debug("router", `findPathItemByKey() - Unexpected cache miss looking for ${paramsKey}`);
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/render/params-and-props.js
async function getProps(opts) {
	const { logger, mod, routeData: route, routeCache, pathname, serverLike, base, trailingSlash } = opts;
	if (!route || route.pathname) return {};
	if (routeIsRedirect(route) || routeIsFallback(route) || route.component === "astro-default-404.astro") return {};
	const staticPaths = await callGetStaticPaths({
		mod,
		route,
		routeCache,
		ssr: serverLike,
		base,
		trailingSlash
	});
	const params = getParams(route, pathname);
	const matchedStaticPath = findPathItemByKey(staticPaths, params, route, logger, trailingSlash);
	if (!matchedStaticPath && route.origin !== "internal" && (serverLike ? route.prerender : true)) throw new AstroError({
		...NoMatchingStaticPathFound,
		message: NoMatchingStaticPathFound.message(pathname),
		hint: NoMatchingStaticPathFound.hint([route.component])
	});
	if (mod) validatePrerenderEndpointCollision(route, mod, params);
	return matchedStaticPath?.props ? { ...matchedStaticPath.props } : {};
}
function getParams(route, pathname) {
	if (!route.params.length) return {};
	const hasHtmlSuffix = pathname.endsWith(".html") && !routeHasHtmlExtension(route);
	const path = hasHtmlSuffix && route.type === "page" ? pathname.slice(0, -5) : pathname;
	const allPatterns = [route, ...route.fallbackRoutes].map((r) => r.pattern);
	let paramsMatch = allPatterns.map((pattern) => pattern.exec(path)).find((x) => x);
	if (!paramsMatch && hasHtmlSuffix && route.type !== "page") {
		const strippedPath = pathname.endsWith("/index.html") ? pathname.slice(0, -11) || "/" : pathname.slice(0, -5);
		paramsMatch = allPatterns.map((pattern) => pattern.exec(strippedPath)).find((x) => x);
	}
	if (!paramsMatch) return {};
	const params = {};
	route.params.forEach((key, i) => {
		if (key.startsWith("...")) params[key.slice(3)] = paramsMatch[i + 1] ? paramsMatch[i + 1] : void 0;
		else params[key] = paramsMatch[i + 1];
	});
	return params;
}
function validatePrerenderEndpointCollision(route, mod, params) {
	if (route.type === "endpoint" && mod.getStaticPaths) {
		const lastSegment = route.segments[route.segments.length - 1];
		const paramValues = Object.values(params);
		const lastParam = paramValues[paramValues.length - 1];
		if (lastSegment.length === 1 && lastSegment[0].dynamic && lastParam === void 0) throw new AstroError({
			...PrerenderDynamicEndpointPathCollide,
			message: PrerenderDynamicEndpointPathCollide.message(route.route),
			hint: PrerenderDynamicEndpointPathCollide.hint(route.component),
			location: { file: route.component }
		});
	}
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/render/slots.js
function getFunctionExpression(slot) {
	if (!slot) return;
	const expressions = slot?.expressions?.filter((e) => isRenderInstruction(e) === false || isRenderTemplateResult(e));
	if (expressions?.length !== 1) return;
	const expression = expressions[0];
	if (isRenderTemplateResult(expression)) return getFunctionExpression(expression);
	return expression;
}
var Slots = class {
	#result;
	#slots;
	#logger;
	constructor(result, slots, logger) {
		this.#result = result;
		this.#slots = slots;
		this.#logger = logger;
		if (slots) for (const key of Object.keys(slots)) {
			if (this[key] !== void 0) throw new AstroError({
				...ReservedSlotName,
				message: ReservedSlotName.message(key)
			});
			Object.defineProperty(this, key, {
				get() {
					return true;
				},
				enumerable: true
			});
		}
	}
	has(name) {
		if (!this.#slots) return false;
		return Boolean(this.#slots[name]);
	}
	async render(name, args = []) {
		if (!this.#slots || !this.has(name)) return;
		const result = this.#result;
		if (!Array.isArray(args)) this.#logger.warn(null, `Expected second parameter to be an array, received a ${typeof args}. If you're trying to pass an array as a single argument and getting unexpected results, make sure you're passing your array as an item of an array. Ex: Astro.slots.render('default', [["Hello", "World"]])`);
		else if (args.length > 0) {
			const slotValue = this.#slots[name];
			const component = typeof slotValue === "function" ? await slotValue(result) : await slotValue;
			const expression = getFunctionExpression(component);
			if (expression) {
				const slot = async () => typeof expression === "function" ? expression(...args) : expression;
				return await renderSlotToString(result, slot).then((res) => {
					return res;
				});
			}
			if (typeof component === "function") return await renderJSX(result, component(...args)).then((res) => res != null ? String(res) : res);
		}
		const content = await renderSlotToString(result, this.#slots[name]);
		return chunkToString(result, content);
	}
};
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/i18n/fallback.js
function computeFallbackRoute(options) {
	const { pathname, responseStatus, fallback, fallbackType, locales, defaultLocale, strategy } = options;
	if (responseStatus !== 404) return { type: "none" };
	if (!fallback || Object.keys(fallback).length === 0) return { type: "none" };
	const segments = pathname.split("/");
	const urlLocale = segments.find((segment) => {
		for (const locale of locales) if (typeof locale === "string") {
			if (locale === segment) return true;
		} else if (locale.path === segment) return true;
		return false;
	});
	if (!urlLocale) return { type: "none" };
	if (!Object.keys(fallback).includes(urlLocale)) return { type: "none" };
	const fallbackLocale = fallback[urlLocale];
	const pathFallbackLocale = getPathByLocale(fallbackLocale, locales);
	const localeIndex = segments.indexOf(urlLocale);
	let newPathname;
	if (pathFallbackLocale === defaultLocale && strategy === "pathname-prefix-other-locales") {
		segments.splice(localeIndex, 1);
		newPathname = segments.join("/") || "/";
	} else {
		segments[localeIndex] = pathFallbackLocale;
		newPathname = segments.join("/");
	}
	return {
		type: fallbackType,
		pathname: newPathname
	};
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/i18n/router.js
var I18nRouter = class {
	#strategy;
	#defaultLocale;
	#locales;
	#base;
	#domains;
	constructor(options) {
		this.#strategy = options.strategy;
		this.#defaultLocale = options.defaultLocale;
		this.#locales = options.locales;
		this.#base = options.base === "/" ? "/" : removeTrailingForwardSlash(options.base || "");
		this.#domains = options.domains;
	}
	/**
	* Evaluate routing strategy for a pathname.
	* Returns decision object (not HTTP Response).
	*/
	match(pathname, context) {
		if (this.shouldSkipProcessing(pathname, context)) return { type: "continue" };
		switch (this.#strategy) {
			case "manual": return { type: "continue" };
			case "pathname-prefix-always": return this.matchPrefixAlways(pathname, context);
			case "domains-prefix-always":
				if (this.localeHasntDomain(context.currentLocale, context.currentDomain)) return { type: "continue" };
				return this.matchPrefixAlways(pathname, context);
			case "pathname-prefix-other-locales": return this.matchPrefixOtherLocales(pathname, context);
			case "domains-prefix-other-locales":
				if (this.localeHasntDomain(context.currentLocale, context.currentDomain)) return { type: "continue" };
				return this.matchPrefixOtherLocales(pathname, context);
			case "pathname-prefix-always-no-redirect": return this.matchPrefixAlwaysNoRedirect(pathname, context);
			case "domains-prefix-always-no-redirect":
				if (this.localeHasntDomain(context.currentLocale, context.currentDomain)) return { type: "continue" };
				return this.matchPrefixAlwaysNoRedirect(pathname, context);
			default: return { type: "continue" };
		}
	}
	/**
	* Check if i18n processing should be skipped for this request
	*/
	shouldSkipProcessing(pathname, context) {
		if (pathname.includes("/404") || pathname.includes("/500")) return true;
		if (pathname.includes("/_server-islands/")) return true;
		if (context.isReroute) return true;
		if (context.routeType && context.routeType !== "page" && context.routeType !== "fallback") return true;
		return false;
	}
	/**
	* Strategy: pathname-prefix-always
	* All locales must have a prefix, including the default locale.
	*/
	matchPrefixAlways(pathname, _context) {
		if (pathname === this.#base + "/" || pathname === this.#base) return {
			type: "redirect",
			location: `${this.#base === "/" ? "" : this.#base}/${this.#defaultLocale}`
		};
		if (!pathHasLocale(pathname, this.#locales)) return { type: "notFound" };
		return { type: "continue" };
	}
	/**
	* Strategy: pathname-prefix-other-locales
	* Default locale has no prefix, other locales must have a prefix.
	*/
	matchPrefixOtherLocales(pathname, _context) {
		let pathnameContainsDefaultLocale = false;
		for (const segment of pathname.split("/")) if (normalizeTheLocale(segment) === normalizeTheLocale(this.#defaultLocale)) {
			pathnameContainsDefaultLocale = true;
			break;
		}
		if (pathnameContainsDefaultLocale) return {
			type: "notFound",
			location: pathname.replace(`/${this.#defaultLocale}`, "")
		};
		return { type: "continue" };
	}
	/**
	* Strategy: pathname-prefix-always-no-redirect
	* Like prefix-always but allows root to serve instead of redirecting
	*/
	matchPrefixAlwaysNoRedirect(pathname, _context) {
		if (pathname === this.#base + "/" || pathname === this.#base) return { type: "continue" };
		if (!pathHasLocale(pathname, this.#locales)) return { type: "notFound" };
		return { type: "continue" };
	}
	/**
	* Check if the current locale doesn't belong to the configured domain.
	* Used for domain-based routing strategies.
	*/
	localeHasntDomain(currentLocale, currentDomain) {
		if (!this.#domains || !currentDomain) return false;
		if (!currentLocale) return false;
		const localesForDomain = this.#domains[currentDomain];
		if (!localesForDomain) return true;
		return !localesForDomain.includes(currentLocale);
	}
};
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/i18n/handler.js
function compileI18n(i18n, base, trailingSlash, format) {
	return {
		config: i18n,
		base,
		trailingSlash,
		format,
		router: new I18nRouter({
			strategy: i18n.strategy,
			defaultLocale: i18n.defaultLocale,
			locales: i18n.locales,
			base,
			domains: i18n.domainLookupTable ? Object.keys(i18n.domainLookupTable).reduce((acc, domain) => {
				const locale = i18n.domainLookupTable[domain];
				if (!acc[domain]) acc[domain] = [];
				acc[domain].push(locale);
				return acc;
			}, {}) : void 0
		})
	};
}
var i18nMemo = createManifestMemo((manifest) => {
	const config = manifest.i18n;
	return config && config.strategy !== "manual" ? compileI18n(config, manifest.base, manifest.trailingSlash, manifest.buildFormat) : null;
});
function getI18n(manifest) {
	return i18nMemo.get(manifest);
}
async function finalizeI18n(compiled, state, response) {
	markFeatureUsed(state.manifest, FetchFeatures.i18n);
	const i18n = compiled.config;
	if (state.skipErrorReroute && typeof i18n.fallback === "undefined") return response;
	if (state.responseRouteType !== "page" && state.responseRouteType !== "fallback") return response;
	const url = state.url;
	const currentLocale = state.computeCurrentLocale();
	const isPrerendered = state.routeData.prerender;
	const routerContext = {
		currentLocale,
		currentDomain: url.hostname,
		routeType: state.responseRouteType,
		isReroute: false
	};
	const routeDecision = compiled.router.match(url.pathname, routerContext);
	switch (routeDecision.type) {
		case "redirect": {
			let location = routeDecision.location;
			if (shouldAppendForwardSlash(compiled.trailingSlash, compiled.format)) location = appendForwardSlash(location);
			return new Response(null, {
				status: routeDecision.status ?? 302,
				headers: { Location: location }
			});
		}
		case "notFound": {
			if (isPrerendered) {
				const prerenderedRes = new Response(response.body, {
					status: 404,
					headers: response.headers
				});
				state.skipErrorReroute = true;
				if (routeDecision.location) prerenderedRes.headers.set("Location", routeDecision.location);
				return prerenderedRes;
			}
			const headers = new Headers();
			if (routeDecision.location) headers.set("Location", routeDecision.location);
			return new Response(null, {
				status: 404,
				headers
			});
		}
	}
	if (i18n.fallback && i18n.fallbackType) {
		const effectiveStatus = state.responseRouteType === "fallback" ? 404 : response.status;
		const fallbackDecision = computeFallbackRoute({
			pathname: url.pathname,
			responseStatus: effectiveStatus,
			currentLocale,
			fallback: i18n.fallback,
			fallbackType: i18n.fallbackType,
			locales: i18n.locales,
			defaultLocale: i18n.defaultLocale,
			strategy: i18n.strategy,
			base: compiled.base
		});
		switch (fallbackDecision.type) {
			case "redirect": return new Response(null, {
				status: 302,
				headers: { Location: fallbackDecision.pathname + url.search }
			});
			case "rewrite": try {
				return await state.rewrite(fallbackDecision.pathname + url.search);
			} catch {
				break;
			}
		}
	}
	return response;
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/i18n/index.js
function getPathByLocale(locale, locales) {
	for (const loopLocale of locales) if (typeof loopLocale === "string") {
		if (loopLocale === locale) return loopLocale;
	} else for (const code of loopLocale.codes) if (code === locale) return loopLocale.path;
	throw new AstroError(i18nNoLocaleFoundInPath);
}
function getAllCodes(locales) {
	const result = [];
	for (const loopLocale of locales) if (typeof loopLocale === "string") result.push(loopLocale);
	else result.push(...loopLocale.codes);
	return result;
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/i18n/utils.js
function parseLocale(header) {
	if (header === "*") return [{
		locale: header,
		qualityValue: void 0
	}];
	const result = [];
	const localeValues = header.split(",").map((str) => str.trim());
	for (const localeValue of localeValues) {
		const split = localeValue.split(";").map((str) => str.trim());
		const localeName = split[0];
		const qualityValue = split[1];
		if (!split) continue;
		if (qualityValue && qualityValue.startsWith("q=")) {
			const qualityValueAsFloat = Number.parseFloat(qualityValue.slice(2));
			if (Number.isNaN(qualityValueAsFloat) || qualityValueAsFloat > 1) result.push({
				locale: localeName,
				qualityValue: void 0
			});
			else result.push({
				locale: localeName,
				qualityValue: qualityValueAsFloat
			});
		} else result.push({
			locale: localeName,
			qualityValue: void 0
		});
	}
	return result;
}
function sortAndFilterLocales(browserLocaleList, locales) {
	const normalizedLocales = getAllCodes(locales).map(normalizeTheLocale);
	return browserLocaleList.filter((browserLocale) => {
		if (browserLocale.locale !== "*") return normalizedLocales.includes(normalizeTheLocale(browserLocale.locale));
		return true;
	}).sort((a, b) => {
		const qa = a.locale === "*" ? a.qualityValue ?? 0 : a.qualityValue ?? 1;
		return (b.locale === "*" ? b.qualityValue ?? 0 : b.qualityValue ?? 1) - qa;
	});
}
function computePreferredLocale(request, locales) {
	const acceptHeader = request.headers.get("Accept-Language");
	let result = void 0;
	if (acceptHeader) {
		const firstResult = sortAndFilterLocales(parseLocale(acceptHeader), locales).at(0);
		if (firstResult && firstResult.locale !== "*") {
			outer: for (const currentLocale of locales) if (typeof currentLocale === "string") {
				if (normalizeTheLocale(currentLocale) === normalizeTheLocale(firstResult.locale)) {
					result = currentLocale;
					break;
				}
			} else for (const currentCode of currentLocale.codes) if (normalizeTheLocale(currentCode) === normalizeTheLocale(firstResult.locale)) {
				result = currentCode;
				break outer;
			}
		}
	}
	return result;
}
function computePreferredLocaleList(request, locales) {
	const acceptHeader = request.headers.get("Accept-Language");
	let result = [];
	if (acceptHeader) {
		const browserLocaleList = sortAndFilterLocales(parseLocale(acceptHeader), locales);
		if (browserLocaleList.length === 1 && browserLocaleList.at(0).locale === "*") return getAllCodes(locales);
		else if (browserLocaleList.length > 0) {
			for (const browserLocale of browserLocaleList) for (const loopLocale of locales) if (typeof loopLocale === "string") {
				if (normalizeTheLocale(loopLocale) === normalizeTheLocale(browserLocale.locale)) result.push(loopLocale);
			} else for (const code of loopLocale.codes) if (code === browserLocale.locale) result.push(code);
		}
	}
	return result;
}
function computeCurrentLocale(pathname, locales, defaultLocale) {
	for (const segment of pathname.split("/").map(normalizeThePath)) for (const locale of locales) if (typeof locale === "string") {
		if (!segment.includes(locale)) continue;
		if (normalizeTheLocale(locale) === normalizeTheLocale(segment)) return locale;
	} else if (locale.path === segment) return locale.codes.at(0);
	else for (const code of locale.codes) if (normalizeTheLocale(code) === normalizeTheLocale(segment)) return code;
	for (const locale of locales) if (typeof locale === "string") {
		if (locale === defaultLocale) return locale;
	} else if (locale.path === defaultLocale) return locale.codes.at(0);
}
function computeCurrentLocaleFromParams(params, locales) {
	const byNormalizedCode = /* @__PURE__ */ new Map();
	const byPath = /* @__PURE__ */ new Map();
	for (const locale of locales) if (typeof locale === "string") byNormalizedCode.set(normalizeTheLocale(locale), locale);
	else {
		byPath.set(locale.path, locale.codes[0]);
		for (const code of locale.codes) byNormalizedCode.set(normalizeTheLocale(code), code);
	}
	for (const value of Object.values(params)) {
		if (!value) continue;
		const pathMatch = byPath.get(value);
		if (pathMatch) return pathMatch;
		const codeMatch = byNormalizedCode.get(normalizeTheLocale(value));
		if (codeMatch) return codeMatch;
	}
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/app/prepare-response.js
function prepareResponse(response, { addCookieHeader }) {
	if (addCookieHeader) for (const setCookieHeaderValue of getSetCookiesFromResponse(response)) response.headers.append("set-cookie", setCookieHeaderValue);
	Reflect.set(response, responseSentSymbol$1, true);
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/pages/handler.js
var EMPTY_SLOTS = Object.freeze({});
async function handlePages(state, ctx) {
	const { logger, streaming } = state;
	state.resetResponseMetadata();
	let response;
	const componentInstance = await state.loadComponentInstance();
	switch (state.routeData.type) {
		case "endpoint":
			response = await renderEndpoint(componentInstance, ctx, state.routeData.prerender, logger, state);
			break;
		case "page": {
			const props = await state.getProps();
			const actionApiContext = state.getActionAPIContext();
			const result = await state.createResult(componentInstance, actionApiContext);
			try {
				response = await renderPage(result, componentInstance?.default, props, state.slots ?? EMPTY_SLOTS, streaming, state.routeData);
			} catch (e) {
				result.cancelled = true;
				throw e;
			}
			state.responseRouteType = "page";
			if (state.routeData.route === "/404" || state.routeData.route === "/500") state.skipErrorReroute = true;
			break;
		}
		case "redirect": return new Response(null, {
			status: 404,
			headers: { [ASTRO_ERROR_HEADER]: "true" }
		});
		case "fallback":
			state.responseRouteType = "fallback";
			return new Response(null, { status: 500 });
	}
	const responseCookies = getCookiesFromResponse(response);
	if (responseCookies) state.cookies.merge(responseCookies);
	state.response = response;
	return response;
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/routing/match.js
function matchRoute$1(pathname, manifest) {
	if (isRoute404(pathname)) {
		const errorRoute = manifest.routes.find((route) => isRoute404(route.route));
		if (errorRoute) return errorRoute;
	}
	if (isRoute500(pathname)) {
		const errorRoute = manifest.routes.find((route) => isRoute500(route.route));
		if (errorRoute) return errorRoute;
	}
	return manifest.routes.find((route) => {
		return route.pattern.test(pathname) || route.fallbackRoutes.some((fallbackRoute) => fallbackRoute.pattern.test(pathname));
	});
}
function isRoute404or500(route) {
	return isRoute404(route.route) || isRoute500(route.route);
}
function isRouteServerIsland(route) {
	return route.component === SERVER_ISLAND_COMPONENT;
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/routing/astro-designed-error-pages.js
function ensure404Route(manifest) {
	if (!manifest.routes.some((route) => route.route === "/404")) manifest.routes.push(DEFAULT_404_ROUTE);
	return manifest;
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/routing/priority.js
function routeComparator(a, b) {
	const commonLength = Math.min(a.segments.length, b.segments.length);
	for (let index = 0; index < commonLength; index++) {
		const aSegment = a.segments[index];
		const bSegment = b.segments[index];
		const aIsStatic = aSegment.every((part) => !part.dynamic && !part.spread);
		const bIsStatic = bSegment.every((part) => !part.dynamic && !part.spread);
		if (aIsStatic && bIsStatic) {
			const aContent = aSegment.map((part) => part.content).join("");
			const bContent = bSegment.map((part) => part.content).join("");
			if (aContent !== bContent) return aContent.localeCompare(bContent);
		}
		if (aIsStatic !== bIsStatic) return aIsStatic ? -1 : 1;
		const aAllDynamic = aSegment.every((part) => part.dynamic);
		if (aAllDynamic !== bSegment.every((part) => part.dynamic)) return aAllDynamic ? 1 : -1;
		const aHasSpread = aSegment.some((part) => part.spread);
		if (aHasSpread !== bSegment.some((part) => part.spread)) return aHasSpread ? 1 : -1;
	}
	const aLength = a.segments.length;
	const bLength = b.segments.length;
	if (aLength !== bLength) {
		const aEndsInRest = a.segments.at(-1)?.some((part) => part.spread);
		const bEndsInRest = b.segments.at(-1)?.some((part) => part.spread);
		if (aEndsInRest !== bEndsInRest && Math.abs(aLength - bLength) === 1) {
			if (aLength > bLength && aEndsInRest) return 1;
			if (bLength > aLength && bEndsInRest) return -1;
		}
		return aLength > bLength ? -1 : 1;
	}
	if (a.type === "endpoint" !== (b.type === "endpoint")) return a.type === "endpoint" ? -1 : 1;
	return a.route.localeCompare(b.route);
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/routing/router.js
var Router = class {
	#routes;
	#base;
	#baseWithoutTrailingSlash;
	#buildFormat;
	#trailingSlash;
	constructor(routes, options) {
		this.#routes = [...routes].sort(routeComparator);
		this.#base = normalizeBase(options.base);
		this.#baseWithoutTrailingSlash = removeTrailingForwardSlash(this.#base);
		this.#buildFormat = options.buildFormat;
		this.#trailingSlash = options.trailingSlash;
	}
	/**
	* Match an input pathname against the route list.
	* If allowWithoutBase is true, a non-base-prefixed path is still considered.
	*/
	match(inputPathname, { allowWithoutBase = false } = {}) {
		const normalized = getRedirectForPathname(inputPathname);
		if (normalized.redirect) return {
			type: "redirect",
			location: normalized.redirect,
			status: 301
		};
		if (this.#base !== "/") {
			const baseWithSlash = `${this.#baseWithoutTrailingSlash}/`;
			if (this.#trailingSlash === "always" && (normalized.pathname === this.#baseWithoutTrailingSlash || normalized.pathname === this.#base)) return {
				type: "redirect",
				location: baseWithSlash,
				status: 301
			};
			if (this.#trailingSlash === "never" && normalized.pathname === baseWithSlash) return {
				type: "redirect",
				location: this.#baseWithoutTrailingSlash,
				status: 301
			};
		}
		const baseResult = stripBase(normalized.pathname, this.#base, this.#baseWithoutTrailingSlash, this.#trailingSlash);
		if (!baseResult) {
			if (!allowWithoutBase) return {
				type: "none",
				reason: "outside-base"
			};
		}
		let pathname = baseResult ?? normalized.pathname;
		if (this.#buildFormat === "file") pathname = normalizeFileFormatPathname(pathname);
		const route = this.#routes.find((candidate) => {
			if (candidate.pattern.test(pathname)) return true;
			return candidate.fallbackRoutes.some((fallbackRoute) => fallbackRoute.pattern.test(pathname));
		});
		if (!route) return {
			type: "none",
			reason: "no-match"
		};
		return {
			type: "match",
			route,
			params: getParams(route, pathname),
			pathname
		};
	}
	/**
	* Returns all routes that match the given pathname, in priority order.
	* Used when the first match (e.g. a prerendered route) cannot serve
	* the request and subsequent matches need to be tried.
	*/
	matchAll(inputPathname, { allowWithoutBase = false } = {}) {
		const normalized = getRedirectForPathname(inputPathname);
		if (normalized.redirect) return [];
		const baseResult = stripBase(normalized.pathname, this.#base, this.#baseWithoutTrailingSlash, this.#trailingSlash);
		if (!baseResult && !allowWithoutBase) return [];
		let pathname = baseResult ?? normalized.pathname;
		if (this.#buildFormat === "file") pathname = normalizeFileFormatPathname(pathname);
		return this.#routes.filter((candidate) => {
			if (candidate.pattern.test(pathname)) return true;
			return candidate.fallbackRoutes.some((fallbackRoute) => fallbackRoute.pattern.test(pathname));
		});
	}
};
function normalizeBase(base) {
	if (!base) return "/";
	if (base === "/") return base;
	return prependForwardSlash(base);
}
function getRedirectForPathname(pathname) {
	let value = prependForwardSlash(pathname);
	if (value.startsWith("//")) return {
		pathname: value,
		redirect: `/${value.replace(/^\/+/, "")}`
	};
	return { pathname: value };
}
function stripBase(pathname, base, baseWithoutTrailingSlash, trailingSlash) {
	if (base === "/") return pathname;
	const baseWithSlash = `${baseWithoutTrailingSlash}/`;
	if (pathname === baseWithoutTrailingSlash || pathname === base) return trailingSlash === "always" ? null : "/";
	if (pathname === baseWithSlash) return trailingSlash === "never" ? null : "/";
	if (pathname.startsWith(baseWithSlash)) return pathname.slice(baseWithoutTrailingSlash.length);
	return null;
}
function normalizeFileFormatPathname(pathname) {
	if (pathname.endsWith("/index.html")) {
		const trimmed = pathname.slice(0, -11);
		return trimmed === "" ? "/" : trimmed;
	}
	if (pathname.endsWith(".html")) {
		const trimmed = pathname.slice(0, -5);
		return trimmed === "" ? "/" : trimmed;
	}
	return pathname;
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/routing/route-table.js
function compileRouteTable(manifest, routes) {
	const routesList = ensure404Route({ routes });
	const router = new Router(routesList.routes, {
		base: manifest.base,
		trailingSlash: manifest.trailingSlash,
		buildFormat: manifest.buildFormat
	});
	return {
		routes: routesList.routes,
		router
	};
}
var routeTables = createManifestMemo((manifest) => compileRouteTable(manifest, (manifest.routes ?? []).map((route) => route.routeData)));
function getRouteTable(manifest) {
	return routeTables.get(manifest);
}
function updateRouteTable(manifest, routes) {
	routeTables.set(manifest, compileRouteTable(manifest, [...routes]));
}
function matchRoute(manifest, pathname) {
	const match = getRouteTable(manifest).router.match(pathname, { allowWithoutBase: true });
	if (match.type !== "match") return void 0;
	return match.route;
}
function matchAllRoutes(manifest, pathname) {
	return getRouteTable(manifest).router.matchAll(pathname, { allowWithoutBase: true });
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/session/provider-disabled.js
function provideSession(state) {
	markFeatureUsed(state.manifest, FetchFeatures.sessions);
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/app/validate-headers.js
function getFirstForwardedValue(multiValueHeader) {
	return multiValueHeader?.toString().split(",").map((e) => e.trim())[0];
}
function sanitizeHost(hostname) {
	if (!hostname) return void 0;
	if (/[/\\]/.test(hostname)) return void 0;
	return hostname;
}
function parseHost(host) {
	const parts = host.split(":");
	if (parts.length > 2) return void 0;
	return {
		hostname: parts[0],
		port: parts[1]
	};
}
function matchesAllowedDomains(hostname, protocol, port, allowedDomains) {
	const urlString = `${protocol}://${port ? `${hostname}:${port}` : hostname}`;
	if (!URL.canParse(urlString)) return false;
	const testUrl = new URL(urlString);
	return allowedDomains.some((pattern) => matchPattern(testUrl, pattern));
}
function validateHost(host, protocol, allowedDomains) {
	if (!host || host.length === 0) return void 0;
	if (!allowedDomains || allowedDomains.length === 0) return void 0;
	const sanitized = sanitizeHost(host);
	if (!sanitized) return void 0;
	const parsed = parseHost(sanitized);
	if (!parsed) return void 0;
	const { hostname, port } = parsed;
	if (matchesAllowedDomains(hostname, protocol, port, allowedDomains)) return sanitized;
}
function validateForwardedHeaders(forwardedProtocol, forwardedHost, forwardedPort, allowedDomains) {
	const result = {};
	if (forwardedProtocol) {
		if (allowedDomains && allowedDomains.length > 0) {
			if (allowedDomains.some((pattern) => pattern.protocol !== void 0)) try {
				const testUrl = new URL(`${forwardedProtocol}://example.com`);
				if (allowedDomains.some((pattern) => matchPattern(testUrl, { protocol: pattern.protocol }))) result.protocol = forwardedProtocol;
			} catch {}
			else if (/^https?$/.test(forwardedProtocol)) result.protocol = forwardedProtocol;
		}
	}
	if (forwardedPort && allowedDomains && allowedDomains.length > 0) {
		if (allowedDomains.some((pattern) => pattern.port !== void 0)) {
			if (allowedDomains.some((pattern) => pattern.port === forwardedPort)) result.port = forwardedPort;
		}
	}
	if (forwardedHost && forwardedHost.length > 0 && allowedDomains && allowedDomains.length > 0) {
		const protoForValidation = result.protocol || "https";
		const sanitized = sanitizeHost(forwardedHost);
		const parsed = sanitized ? parseHost(sanitized) : void 0;
		if (sanitized && parsed) {
			const { hostname, port: portFromHost } = parsed;
			if (matchesAllowedDomains(hostname, protoForValidation, result.port || portFromHost, allowedDomains)) result.host = sanitized;
		}
	}
	return result;
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/output-filename.js
var STATUS_CODE_PAGES = /* @__PURE__ */ new Set(["/404", "/500"]);
function getOutputFilename(buildFormat, name, routeData) {
	if (routeData.type === "endpoint") return name;
	if (name === "/" || name === "") return name === "" ? "index.html" : "/index.html";
	if (buildFormat === "file" || STATUS_CODE_PAGES.has(name)) return `${removeTrailingForwardSlash(name || "index")}.html`;
	if (buildFormat === "preserve" && !routeData.isIndex) return `${removeTrailingForwardSlash(name || "index")}.html`;
	return `${removeTrailingForwardSlash(name)}/index.html`;
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/errors/default-handler.js
async function renderDefaultError(manifest, request, { status, response: originalResponse, skipMiddleware = false, error, pathname, ...resolvedRenderOptions }) {
	const resolvedPathname = pathname ?? new FetchState(manifest, request).pathname;
	const routeTable = getRouteTable(manifest);
	const errorRouteData = matchRoute$1(getErrorRoutePath(resolvedPathname, status, routeTable.routes, manifest.i18n?.locales, manifest.trailingSlash === "always"), routeTable);
	const url = new URL(request.url);
	if (errorRouteData) {
		if (errorRouteData.prerender) {
			const allowedDomains = manifest.allowedDomains;
			const safeOrigin = validateHost(url.host, url.protocol.replace(":", ""), allowedDomains) ? url.origin : `${url.protocol}//localhost`;
			const statusURL = new URL(`${removeTrailingForwardSlash(manifest.base)}${getOutputFilename(manifest.buildFormat, errorRouteData.route, errorRouteData)}`, safeOrigin);
			if (statusURL.toString() !== request.url && resolvedRenderOptions.prerenderedErrorPageFetch) try {
				const newResponse = mergeResponses(await resolvedRenderOptions.prerenderedErrorPageFetch(statusURL.toString()), originalResponse, {
					status,
					removeContentEncodingHeaders: true
				});
				prepareResponse(newResponse, resolvedRenderOptions);
				return newResponse;
			} catch {
				const response2 = mergeResponses(new Response(null, { status }), originalResponse);
				prepareResponse(response2, resolvedRenderOptions);
				return response2;
			}
		}
		const mod = await getEnvironment(manifest).getComponentByRoute(manifest, errorRouteData);
		const errorState = new FetchState(manifest, request);
		errorState.skipMiddleware = skipMiddleware;
		errorState.clientAddress = resolvedRenderOptions.clientAddress;
		errorState.routeData = errorRouteData;
		errorState.pathname = resolvedPathname;
		errorState.status = status;
		errorState.componentInstance = mod;
		errorState.locals = resolvedRenderOptions.locals ?? {};
		errorState.initialProps = { error };
		try {
			await provideSession(errorState);
			const response2 = await handleMiddleware(errorState, handlePages);
			if (rewroteToEmptyErrorResponse(skipMiddleware, errorRouteData, errorState.routeData, response2)) return renderDefaultError(manifest, request, {
				...resolvedRenderOptions,
				status,
				error,
				response: originalResponse,
				skipMiddleware: true,
				pathname: resolvedPathname
			});
			const newResponse = mergeResponses(response2, originalResponse);
			prepareResponse(newResponse, resolvedRenderOptions);
			return newResponse;
		} catch {
			if (skipMiddleware === false) return renderDefaultError(manifest, request, {
				...resolvedRenderOptions,
				status,
				error,
				response: originalResponse,
				skipMiddleware: true,
				pathname: resolvedPathname
			});
		} finally {
			await errorState.finalizeAll();
		}
	}
	const response = mergeResponses(new Response(null, { status }), originalResponse);
	prepareResponse(response, resolvedRenderOptions);
	return response;
}
function mergeResponses(newResponse, originalResponse, override) {
	let newResponseHeaders = newResponse.headers;
	if (override?.removeContentEncodingHeaders) {
		newResponseHeaders = new Headers(newResponseHeaders);
		newResponseHeaders.delete("Content-Encoding");
		newResponseHeaders.delete("Content-Length");
	}
	if (!originalResponse) {
		if (override !== void 0) return new Response(newResponse.body, {
			status: override.status,
			statusText: newResponse.statusText,
			headers: newResponseHeaders
		});
		return newResponse;
	}
	const status = override?.status ? override.status : originalResponse.status === 200 ? newResponse.status : originalResponse.status;
	try {
		originalResponse.headers.delete("Content-type");
		originalResponse.headers.delete("Content-Length");
		originalResponse.headers.delete("Transfer-Encoding");
	} catch {}
	const newHeaders = new Headers();
	const seen = /* @__PURE__ */ new Set();
	for (const [name, value] of originalResponse.headers) {
		newHeaders.append(name, value);
		seen.add(name.toLowerCase());
	}
	for (const [name, value] of newResponseHeaders) {
		const lower = name.toLowerCase();
		if (!seen.has(lower) || lower === "set-cookie") newHeaders.append(name, value);
	}
	const mergedResponse = new Response(newResponse.body, {
		status,
		statusText: status === 200 ? newResponse.statusText : originalResponse.statusText,
		headers: newHeaders
	});
	const originalCookies = getCookiesFromResponse(originalResponse);
	const newCookies = getCookiesFromResponse(newResponse);
	if (originalCookies) {
		if (newCookies) originalCookies.merge(newCookies);
		attachCookiesToResponse(mergedResponse, originalCookies);
	} else if (newCookies) attachCookiesToResponse(mergedResponse, newCookies);
	return mergedResponse;
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/errors/build-handler.js
async function renderBuildError(manifest, request, options) {
	if (options.status === 500) {
		if (options.response) return options.response;
		throw options.error;
	}
	return renderDefaultError(manifest, request, {
		...options,
		prerenderedErrorPageFetch: void 0
	});
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/errors/dev-handler.js
async function renderDevError(manifest, request, { skipMiddleware = false, error, status, response: _response, pathname, ...resolvedRenderOptions }, { shouldInjectCspMetaTags }) {
	if (isAstroError(error) && [MiddlewareNoDataOrNextCalled.name, MiddlewareNotAResponse.name].includes(error.name)) throw error;
	const resolvedPathname = pathname ?? new FetchState(manifest, request).pathname;
	const renderRoute = async (routeData) => {
		try {
			const preloadedComponent = await getEnvironment(manifest).getComponentByRoute(manifest, routeData);
			const errorState = new FetchState(manifest, request);
			errorState.skipMiddleware = skipMiddleware;
			errorState.clientAddress = resolvedRenderOptions.clientAddress;
			errorState.shouldInjectCspMetaTags = shouldInjectCspMetaTags ? !!manifest.csp : false;
			errorState.routeData = routeData;
			errorState.pathname = resolvedPathname;
			errorState.status = status;
			errorState.componentInstance = preloadedComponent;
			errorState.locals = resolvedRenderOptions.locals ?? {};
			errorState.initialProps = { error };
			const response = await handleMiddleware(errorState, handlePages);
			if (rewroteToEmptyErrorResponse(skipMiddleware, routeData, errorState.routeData, response)) return renderDevError(manifest, request, {
				...resolvedRenderOptions,
				status,
				error,
				skipMiddleware: true,
				pathname: resolvedPathname
			}, { shouldInjectCspMetaTags });
			if (error) getLogger(manifest).error("router", error.stack || error.message);
			return response;
		} catch (_err) {
			if (skipMiddleware === false) return renderDevError(manifest, request, {
				...resolvedRenderOptions,
				status: 500,
				skipMiddleware: true,
				error: _err,
				pathname: resolvedPathname
			}, { shouldInjectCspMetaTags });
			throw _err;
		}
	};
	if (status === 404) {
		const custom404 = getCustom404Route(getRouteTable(manifest));
		if (custom404) return renderRoute(custom404);
	}
	const custom500 = getCustom500Route(getRouteTable(manifest));
	if (!custom500) throw error;
	else return renderRoute(custom500);
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/errors/handler.js
function renderErrorPage(manifest, request, options) {
	const env = getEnvironment(manifest);
	switch (env.errorStrategy) {
		case "dev": return renderDevError(manifest, request, options, { shouldInjectCspMetaTags: env.injectCspMetaTagsOnErrorPages });
		case "build": return renderBuildError(manifest, request, options);
		case "default": return renderDefaultError(manifest, request, options);
	}
}
function renderErrorFromState(state, request, options) {
	if (state.renderError) return state.renderError(request, options);
	return renderErrorPage(state.manifest, request, options);
}
function rewroteToEmptyErrorResponse(skipMiddleware, errorRouteData, renderedRouteData, response) {
	return skipMiddleware === false && renderedRouteData !== errorRouteData && response.body === null && REROUTABLE_STATUS_CODES.includes(response.status);
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/middleware/callMiddleware.js
async function callMiddleware(onRequest, apiContext, responseFunction) {
	let nextCalled = false;
	let responseFunctionPromise = void 0;
	const next = async (payload) => {
		nextCalled = true;
		responseFunctionPromise = responseFunction(apiContext, payload);
		return responseFunctionPromise;
	};
	const middlewarePromise = onRequest(apiContext, next);
	return await Promise.resolve(middlewarePromise).then(async (value) => {
		if (nextCalled) {
			if (typeof value !== "undefined") {
				if (value instanceof Response === false) throw new AstroError(MiddlewareNotAResponse);
				return value;
			} else if (responseFunctionPromise) return responseFunctionPromise;
			else throw new AstroError(MiddlewareNotAResponse);
		} else if (typeof value === "undefined") throw new AstroError(MiddlewareNoDataOrNextCalled);
		else if (value instanceof Response === false) throw new AstroError(MiddlewareNotAResponse);
		else return value;
	});
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/middleware/sequence.js
function sequence(...handlers) {
	const filtered = handlers.filter((h) => !!h);
	const length = filtered.length;
	if (!length) return defineMiddleware((_context, next) => {
		return next();
	});
	return defineMiddleware((context, next) => {
		let carriedPayload = void 0;
		return applyHandle(0, context);
		function applyHandle(i, handleContext) {
			const handle = filtered[i];
			return handle(handleContext, async (payload) => {
				if (i < length - 1) {
					if (payload) {
						const oldPathname = handleContext.url.pathname;
						const state = Reflect.get(handleContext, fetchStateSymbol);
						if (!state) throw new Error("FetchState not found on APIContext. `next(payload)` rewrites require a context created through Astro's request pipeline.");
						const manifest = state.manifest;
						const { routeData, pathname } = await getEnvironment(manifest).tryRewrite(manifest, payload, handleContext.request);
						let newRequest;
						if (payload instanceof Request) newRequest = payload;
						else {
							const request = handleContext.request.method === "GET" || handleContext.request.method === "HEAD" ? handleContext.request : handleContext.request.clone();
							newRequest = copyRequest(payload instanceof URL ? payload : new URL(payload, handleContext.url.origin), request, false, state.logger, routeData.route);
						}
						if (manifest.serverLike === true && handleContext.isPrerendered === false && routeData.prerender === true) throw new AstroError({
							...ForbiddenRewrite,
							message: ForbiddenRewrite.message(handleContext.url.pathname, pathname, routeData.component),
							hint: ForbiddenRewrite.hint(routeData.component)
						});
						carriedPayload = payload;
						handleContext.request = newRequest;
						handleContext.url = new URL(newRequest.url);
						handleContext.params = getParams(routeData, pathname);
						handleContext.routePattern = routeData.route;
						setOriginPathname(handleContext.request, oldPathname, manifest.trailingSlash, manifest.buildFormat);
					}
					return applyHandle(i + 1, handleContext);
				} else return next(payload ?? carriedPayload);
			});
		}
	});
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/middleware/load.js
var resolvedMiddleware = /* @__PURE__ */ new WeakMap();
var middlewareMemo = createAsyncManifestMemo(async (manifest) => {
	let handler;
	if (manifest.middleware) {
		const internalMiddlewares = [(await manifest.middleware()).onRequest ?? NOOP_MIDDLEWARE_FN];
		if (manifest.checkOrigin) internalMiddlewares.unshift(createOriginCheckMiddleware());
		handler = sequence(...internalMiddlewares);
	} else handler = NOOP_MIDDLEWARE_FN;
	resolvedMiddleware.set(manifest, handler);
	return handler;
});
function getMiddleware(manifest) {
	return middlewareMemo.get(manifest);
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/cache/runtime/noop.js
var EMPTY_OPTIONS = Object.freeze({ tags: [] });
var NoopAstroCache = class {
	enabled = false;
	set() {}
	get tags() {
		return [];
	}
	get options() {
		return EMPTY_OPTIONS;
	}
	async invalidate() {}
};
var hasWarned = false;
var DisabledAstroCache = class {
	enabled = false;
	#logger;
	constructor(logger) {
		this.#logger = logger;
	}
	#warn() {
		if (!hasWarned) {
			hasWarned = true;
			this.#logger?.warn("cache", "`cache.set()` was called but caching is not enabled. Configure a cache provider in your Astro config under `cache` to enable caching.");
		}
	}
	set() {
		this.#warn();
	}
	get tags() {
		return [];
	}
	get options() {
		return EMPTY_OPTIONS;
	}
	async invalidate() {
		throw new AstroError(CacheNotEnabled);
	}
};
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/middleware/astro-middleware.js
async function handleMiddleware(state, renderRouteCallback) {
	markFeatureUsed(state.manifest, FetchFeatures.middleware);
	await state.getProps();
	const apiContext = state.getAPIContext();
	state.counter++;
	if (state.counter === 4) return new Response("Loop Detected", {
		status: 508,
		statusText: "Astro detected a loop where you tried to call the rewriting logic more than four times."
	});
	const next = async (ctx, payload) => {
		if (payload) {
			state.logger.debug("router", "Called rewriting to:", payload);
			applyRewriteToState(state, payload, await getEnvironment(state.manifest).tryRewrite(state.manifest, payload, state.request));
		}
		return renderRouteCallback(state, ctx);
	};
	let response;
	if (state.skipMiddleware) response = await next(apiContext);
	else response = await callMiddleware(sequence(await getMiddleware(state.manifest)), apiContext, next);
	attachCookiesToResponse(response, state.cookies);
	state.response = response;
	return response;
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/util/normalized-url.js
function createNormalizedUrl(requestUrl) {
	return normalizeUrl(new URL(requestUrl));
}
function setPathname(url, pathname) {
	if (url.pathname !== pathname) url.pathname = pathname;
}
function normalizeUrl(url) {
	try {
		setPathname(url, validateAndDecodePathname(url.pathname));
	} catch {
		try {
			setPathname(url, decodeURI(url.pathname));
		} catch {}
	}
	setPathname(url, collapseDuplicateSlashes(url.pathname));
	return url;
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/rewrites/handler.js
function applyRewriteToState(state, payload, { routeData, componentInstance, newUrl, pathname }, { mergeCookies = false } = {}) {
	const oldPathname = state.pathname;
	const isI18nFallback = routeData.fallbackRoutes && routeData.fallbackRoutes.length > 0;
	if (state.manifest.serverLike && !state.routeData.prerender && routeData.prerender && !isI18nFallback) throw new AstroError({
		...ForbiddenRewrite,
		message: ForbiddenRewrite.message(state.pathname, pathname, routeData.component),
		hint: ForbiddenRewrite.hint(routeData.component)
	});
	state.routeData = routeData;
	state.componentInstance = componentInstance;
	if (payload instanceof Request) state.request = payload;
	else state.request = copyRequest(newUrl, state.request, routeData.prerender, state.logger, state.routeData.route);
	state.url = createNormalizedUrl(state.request.url);
	if (mergeCookies) {
		const newCookies = new AstroCookies(state.request, state.logger);
		if (state.cookies) newCookies.merge(state.cookies);
		state.cookies = newCookies;
	}
	state.params = getParams(routeData, pathname);
	state.pathname = pathname;
	state.isRewriting = true;
	state.status = 200;
	setOriginPathname(state.request, oldPathname, state.manifest.trailingSlash, state.manifest.buildFormat);
	state.invalidateContexts();
}
async function executeRewrite(state, payload) {
	state.logger.debug("router", "Calling rewrite: ", payload);
	applyRewriteToState(state, payload, await getEnvironment(state.manifest).tryRewrite(state.manifest, payload, state.request), { mergeCookies: true });
	return handleMiddleware(state, handlePages);
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/manifest/derived.js
var sites = createManifestMemo((manifest) => manifest.site ? new URL(manifest.site) : void 0);
function getSite(manifest) {
	return sites.get(manifest);
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/server-islands/mappings.js
async function getServerIslands(manifest) {
	if (manifest.serverIslandMappings) return manifest.serverIslandMappings();
	return {
		serverIslandMap: /* @__PURE__ */ new Map(),
		serverIslandNameMap: /* @__PURE__ */ new Map()
	};
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/fetch/fetch-state.js
function getFetchStateFromAPIContext(context) {
	const state = context[fetchStateSymbol];
	if (!state) throw new Error("FetchState not found on APIContext. This is an internal error — the context was not created through Astro's request pipeline.");
	return state;
}
var FetchState = class {
	/** The manifest — the single ambient source of static, build-time data. */
	manifest;
	/** The manifest's identity-stable logger, captured once at construction. */
	logger;
	/**
	* Whether page renders stream. From the facade hooks on the fast path,
	* else the environment's default.
	*/
	streaming;
	/**
	* Internal facade hook: late-bound `app.renderError` dispatch. Undefined on
	* bare and custom-handler paths — those fall through to the environment's
	* error strategy (`renderErrorPage`).
	*/
	renderError;
	/**
	* Internal facade hook: late-bound `app.logThisRequest` dispatch. Undefined
	* on bare and custom-handler paths — those fall through to the
	* environment's `logRequest` behavior.
	*/
	logRequest;
	/**
	* The request to render. Mutated during rewrites so subsequent renders
	* see the rewritten URL.
	*/
	request;
	routeData;
	/**
	* The pathname to use for routing and rendering. Starts out as the raw,
	* base-stripped, decoded pathname from the request. May be further
	* normalized by `handleRequest` after routeData is known (in dev, when
	* the matched route has no `.html` extension, `.html` / `/index.html`
	* suffixes are stripped).
	*/
	pathname;
	/** Resolved render options (addCookieHeader, clientAddress, locals, etc.). */
	renderOptions;
	/** When the request started, used to log duration. */
	timeStart;
	/**
	* The route's loaded component module. Set before middleware runs; may
	* be swapped during in-flight rewrites from inside the middleware chain.
	*/
	componentInstance;
	/**
	* Slot overrides supplied by the container API. `undefined` for HTTP
	* requests — `PagesHandler` coalesces to `{}` on read so we don't
	* allocate an empty object per request.
	*/
	slots;
	/**
	* The `Response` produced by handlers, if any. Set after page
	* rendering or middleware completes.
	*/
	response;
	/**
	* Default HTTP status for the rendered response. Callers override
	* before rendering runs (e.g. `handleRequest` sets this from
	* `BaseApp.getDefaultStatusCode`; error handlers set `404` / `500`).
	*/
	status = 200;
	/** Whether user middleware should be skipped for this request. */
	skipMiddleware = false;
	/**
	* Set to `true` when the request path was encoded too many times to fully
	* decode (see {@link validateAndDecodePathname}). These requests are
	* rejected with a `400` before middleware or routing run.
	*/
	invalidEncoding = false;
	/** A flag that tells the render content if the rewriting was triggered. */
	isRewriting = false;
	/** A safety net in case of loops (rewrite counter). */
	counter = 0;
	/** Cookies for this request. Created lazily on first access. */
	cookies;
	/** Route params derived from routeData + pathname. Computed lazily. */
	#params;
	get params() {
		if (!this.#params && this.routeData) this.#params = getParams(this.routeData, this.pathname);
		return this.#params;
	}
	set params(value) {
		this.#params = value;
	}
	/** Normalized URL for this request. */
	url;
	/** Client address for this request. */
	clientAddress;
	/** Whether this is a partial render (container API). */
	partial;
	/** Internal metadata about the current response route type. */
	responseRouteType;
	/** Internal flag to prevent rerouting this response to an error page. */
	skipErrorReroute = false;
	/** Whether to inject CSP meta tags. */
	shouldInjectCspMetaTags;
	/** Request-scoped locals object, shared with user middleware. */
	locals = {};
	/**
	* Memoized `props` (see `getProps`). `null` means "not yet computed"
	* — using `null` (rather than `undefined`) keeps the hidden class
	* stable and distinct from a valid-but-empty result.
	*/
	props = null;
	/** Memoized `ActionAPIContext` (see `getActionAPIContext`). */
	actionApiContext = null;
	/** Memoized `APIContext` (see `getAPIContext`). */
	apiContext = null;
	/** Registered context providers keyed by name. Lazy-initialized on first provide(). */
	#providers;
	/** Cached values from resolved providers. Lazy-initialized on first resolve(). */
	#providersResolvedValues;
	/** Cached promise for lazy component instance loading. */
	#componentInstancePromise;
	/** SSR result for the current page render. */
	result;
	/** Initial props (from container/error handler). */
	initialProps = {};
	/** Memoized Astro page partial. */
	#astroPagePartial;
	/**
	* Locale-prefixed pathname derived from the Host header for domain-based
	* i18n routing (e.g. `/en/boats/1/foo`), or `undefined` when the request
	* isn't served from a locale-mapped domain. When set, `this.pathname` is
	* derived from it so locale/param resolution match the route pattern.
	*/
	#domainPathname;
	/** Memoized current locale. */
	#currentLocale;
	/** Memoized preferred locale. */
	#preferredLocale;
	/** Memoized preferred locale list. */
	#preferredLocaleList;
	constructor(manifest, request, options, hooks) {
		this.manifest = manifest;
		this.logger = getLogger(manifest);
		this.streaming = hooks?.streaming ?? getEnvironment(manifest).defaultStreaming(manifest);
		this.renderError = hooks?.renderError;
		this.logRequest = hooks?.logRequest;
		this.request = request;
		options ??= getRenderOptions(request);
		this.routeData = options?.routeData;
		const self = this;
		this.renderOptions = {
			...options ?? {
				addCookieHeader: false,
				clientAddress: void 0,
				prerenderedErrorPageFetch: fetch,
				routeData: void 0,
				waitUntil: void 0
			},
			get locals() {
				return self.locals;
			}
		};
		this.componentInstance = void 0;
		this.slots = void 0;
		const url = new URL(request.url);
		const publicPathname = this.#normalizePathname(url.pathname);
		const pathname = this.#computePathname(publicPathname);
		setPathname(url, publicPathname);
		setPathname(url, collapseDuplicateSlashes(url.pathname));
		const domainPathname = computePathnameFromDomain(request, url, manifest.i18n, manifest.base, manifest.trailingSlash, this.logger, pathname);
		if (domainPathname) {
			this.#domainPathname = domainPathname;
			this.pathname = domainPathname;
		} else this.pathname = pathname;
		this.timeStart = performance.now();
		this.clientAddress = options?.clientAddress;
		this.locals = options?.locals ?? {};
		this.url = url;
		this.cookies = new AstroCookies(request, this.logger);
		if (manifest.allowedDomains && manifest.allowedDomains.length > 0 && !this.routeData?.prerender) this.#applyForwardedHeaders();
		if (!Reflect.get(this.request, originPathnameSymbol)) setOriginPathname(this.request, this.pathname, manifest.trailingSlash, manifest.buildFormat);
		this.#resolveRouteData();
	}
	/**
	* Triggers a rewrite. Delegates to the rewrites handler module.
	*/
	rewrite(payload) {
		return executeRewrite(this, payload);
	}
	/**
	* Creates the SSR result for the current page render.
	*/
	async createResult(mod, ctx) {
		const manifest = this.manifest;
		const env = getEnvironment(manifest);
		const { clientDirectives, inlinedScripts, compressHTML } = manifest;
		const renderers = env.getRenderers(manifest);
		const resolve = (specifier) => env.resolve(manifest, specifier);
		const routeData = this.routeData;
		const { links, scripts, styles } = await env.headElements(manifest, routeData);
		const extraStyleHashes = [];
		const extraScriptHashes = [];
		const shouldInjectCspMetaTags = this.shouldInjectCspMetaTags ?? manifest.shouldInjectCspMetaTags;
		const cspAlgorithm = manifest.csp?.algorithm ?? "SHA-256";
		if (shouldInjectCspMetaTags) {
			for (const style of styles) extraStyleHashes.push(await generateCspDigest(style.children, cspAlgorithm));
			for (const script of scripts) extraScriptHashes.push(await generateCspDigest(script.children, cspAlgorithm));
		}
		const componentMetadata = await env.componentMetadata(manifest, routeData) ?? manifest.componentMetadata;
		const headers = new Headers({ "Content-Type": "text/html" });
		const partial = typeof this.partial === "boolean" ? this.partial : Boolean(mod.partial);
		const actionResult = hasActionPayload(this.locals) ? deserializeActionResult(this.locals._actionPayload.actionResult) : void 0;
		const status = this.status;
		const response = {
			status: actionResult?.error ? actionResult?.error.status : status,
			statusText: actionResult?.error ? actionResult?.error.type : "OK",
			get headers() {
				return headers;
			},
			set headers(_) {
				throw new AstroError(AstroResponseHeadersReassigned);
			}
		};
		const state = this;
		const result = {
			base: manifest.base,
			userAssetsBase: manifest.userAssetsBase,
			cancelled: false,
			clientDirectives,
			inlinedScripts,
			componentMetadata,
			compressHTML,
			cookies: this.cookies,
			createAstro: (props, slots) => state.createAstro(result, props, slots, ctx),
			links,
			params: this.params,
			partial,
			pathname: this.pathname,
			renderers,
			resolve,
			response,
			request: this.request,
			scripts,
			styles,
			actionResult,
			async getServerIslandNameMap() {
				return (await getServerIslands(manifest)).serverIslandNameMap ?? /* @__PURE__ */ new Map();
			},
			key: manifest.key,
			trailingSlash: manifest.trailingSlash,
			_metadata: {
				hasHydrationScript: false,
				rendererSpecificHydrationScripts: /* @__PURE__ */ new Set(),
				hasRenderedHead: false,
				renderedScripts: /* @__PURE__ */ new Set(),
				hasDirectives: /* @__PURE__ */ new Set(),
				hasRenderedServerIslandRuntime: false,
				headInTree: false,
				extraHead: [],
				extraStyleHashes,
				extraScriptHashes,
				propagators: /* @__PURE__ */ new Set(),
				routeHasPropagation: false,
				pendingSlotEvaluations: [],
				templateDepth: 0
			},
			cspDestination: manifest.csp?.cspDestination ?? (routeData.prerender ? "meta" : "header"),
			shouldInjectCspMetaTags,
			cspAlgorithm,
			directives: manifest.csp?.directives ? [...manifest.csp.directives] : [],
			scriptHashes: manifest.csp?.scriptHashes ? [...manifest.csp.scriptHashes] : [],
			scriptResources: manifest.csp?.scriptResources ? [...manifest.csp.scriptResources] : [],
			styleHashes: manifest.csp?.styleHashes ? [...manifest.csp.styleHashes] : [],
			styleResources: manifest.csp?.styleResources ? [...manifest.csp.styleResources] : [],
			isStrictDynamic: manifest.csp?.isStrictDynamic ?? false,
			scriptDirective: {
				resources: manifest.csp?.scriptDirective ? [...manifest.csp.scriptDirective.resources] : [],
				hashes: manifest.csp?.scriptDirective ? [...manifest.csp.scriptDirective.hashes] : [],
				strictDynamic: manifest.csp?.scriptDirective?.strictDynamic ?? false
			},
			styleDirective: {
				resources: manifest.csp?.styleDirective ? [...manifest.csp.styleDirective.resources] : [],
				hashes: manifest.csp?.styleDirective ? [...manifest.csp.styleDirective.hashes] : []
			},
			speculationRulesContent: manifest.csp?.speculationRulesContent,
			internalFetchHeaders: manifest.internalFetchHeaders
		};
		this.result = result;
		return result;
	}
	/**
	* Creates the Astro global object for a component render.
	*/
	createAstro(result, props, slotValues, apiContext) {
		let astroPagePartial;
		if (this.isRewriting) this.#astroPagePartial = this.createAstroPagePartial(result, apiContext);
		this.#astroPagePartial ??= this.createAstroPagePartial(result, apiContext);
		astroPagePartial = this.#astroPagePartial;
		const astroComponentPartial = {
			props,
			self: null
		};
		const Astro = Object.assign(Object.create(astroPagePartial), astroComponentPartial);
		let _slots;
		Object.defineProperty(Astro, "slots", { get: () => {
			if (!_slots) _slots = new Slots(result, slotValues, this.logger);
			return _slots;
		} });
		return Astro;
	}
	/**
	* Creates the Astro page-level partial (prototype for Astro global).
	*/
	createAstroPagePartial(result, apiContext) {
		const state = this;
		const { cookies, locals, params, logger, url } = this;
		const { response } = result;
		const redirect = (path, status = 302) => {
			if (state.request[responseSentSymbol$1]) throw new AstroError({ ...ResponseSentError });
			return new Response(null, {
				status,
				headers: { Location: path }
			});
		};
		const rewrite = async (reroutePayload) => {
			return await state.rewrite(reroutePayload);
		};
		const callAction = createCallAction(apiContext);
		const partial = {
			generator: ASTRO_GENERATOR,
			routePattern: this.routeData.route,
			isPrerendered: this.routeData.prerender,
			cookies,
			get clientAddress() {
				return state.getClientAddress();
			},
			get currentLocale() {
				return state.computeCurrentLocale();
			},
			params,
			get preferredLocale() {
				return state.computePreferredLocale();
			},
			get preferredLocaleList() {
				return state.computePreferredLocaleList();
			},
			locals,
			redirect,
			rewrite,
			request: this.request,
			response,
			site: getSite(this.manifest),
			getActionResult: createGetActionResult(locals),
			get callAction() {
				return callAction;
			},
			url,
			get originPathname() {
				return getOriginPathname(state.request);
			},
			get csp() {
				return state.getCsp();
			},
			get logger() {
				return astroToRuntimeLogger(logger);
			}
		};
		this.defineProviderGetters(partial);
		return partial;
	}
	getClientAddress() {
		const { clientAddress } = this;
		const routeData = this.routeData;
		if (routeData.prerender) throw new AstroError({
			...PrerenderClientAddressNotAvailable,
			message: PrerenderClientAddressNotAvailable.message(routeData.component)
		});
		if (clientAddress) return clientAddress;
		if (this.manifest.adapterName) throw new AstroError({
			...ClientAddressNotAvailable,
			message: ClientAddressNotAvailable.message(this.manifest.adapterName)
		});
		throw new AstroError(StaticClientAddressNotAvailable);
	}
	getCookies() {
		return this.cookies;
	}
	getCsp() {
		const state = this;
		if (!this.manifest.csp) {
			if (getEnvironment(this.manifest).runtimeMode === "production") this.logger.warn("csp", `context.csp was used when rendering the route ${s.green(state.routeData.route)}, but CSP was not configured. For more information, see https://docs.astro.build/en/reference/configuration-reference/#securitycsp`);
			return;
		}
		const warnedFallback = /* @__PURE__ */ new Set();
		const warnFallback = (family, kind) => {
			if (kind === "default" || !state.result) return;
			const defaultResources = (family === "script" ? state.result.scriptDirective : state.result.styleDirective).resources.map(normalizeCspResourceEntry).filter((entry) => entry.kind === "default").map((entry) => entry.resource);
			if (defaultResources.length === 0) return;
			const key = `${family}:${kind}`;
			if (warnedFallback.has(key)) return;
			warnedFallback.add(key);
			const general = `${family}-src`;
			const specific = `${general}-${kind === "element" ? "elem" : "attr"}`;
			state.logger.warn("csp", `A resource was added to \`${specific}\`, but \`${general}\` also defines custom resources (${defaultResources.join(" ")}). Because \`${specific}\` overrides \`${general}\` for its scope (browsers do not fall back), those resources will not apply there. Add them to \`${specific}\` as well if needed.`);
		};
		return {
			insertDirective(payload) {
				if (state.result) state.result.directives = pushDirective(state.result.directives, payload);
			},
			insertScriptResource(payload) {
				if (!state.result) return;
				warnFallback("script", normalizeCspResourceEntry(payload).kind);
				state.result.scriptDirective.resources.push(payload);
			},
			insertStyleResource(payload) {
				if (!state.result) return;
				warnFallback("style", normalizeCspResourceEntry(payload).kind);
				state.result.styleDirective.resources.push(payload);
			},
			insertStyleHash(payload) {
				state.result?.styleDirective.hashes.push(payload);
			},
			insertScriptHash(payload) {
				state.result?.scriptDirective.hashes.push(payload);
			}
		};
	}
	computeCurrentLocale() {
		const { url, manifest: { i18n }, routeData } = this;
		if (!i18n || !routeData) return;
		const { defaultLocale, locales, strategy } = i18n;
		const fallbackTo = strategy === "pathname-prefix-other-locales" || strategy === "domains-prefix-other-locales" ? defaultLocale : void 0;
		if (this.#currentLocale) return this.#currentLocale;
		let computedLocale;
		if (isRouteServerIsland(routeData)) {
			let referer = this.request.headers.get("referer");
			if (referer) {
				if (URL.canParse(referer)) referer = new URL(referer).pathname;
				computedLocale = computeCurrentLocale(referer, locales, defaultLocale);
			}
		} else {
			let pathname = routeData.pathname;
			if (this.#domainPathname) pathname = this.pathname;
			else if (url && !routeData.pattern.test(url.pathname)) {
				for (const fallbackRoute of routeData.fallbackRoutes) if (fallbackRoute.pattern.test(url.pathname)) {
					pathname = fallbackRoute.pathname;
					break;
				}
			}
			pathname = pathname && !isRoute404or500(routeData) ? pathname : url.pathname ?? this.pathname;
			computedLocale = computeCurrentLocale(pathname, locales, defaultLocale);
			if (routeData.params.length > 0) {
				const localeFromParams = computeCurrentLocaleFromParams(this.params, locales);
				if (localeFromParams) computedLocale = localeFromParams;
			}
		}
		this.#currentLocale = computedLocale ?? fallbackTo;
		return this.#currentLocale;
	}
	computePreferredLocale() {
		const { manifest: { i18n }, request } = this;
		if (!i18n) return;
		return this.#preferredLocale ??= computePreferredLocale(request, i18n.locales);
	}
	computePreferredLocaleList() {
		const { manifest: { i18n }, request } = this;
		if (!i18n) return;
		return this.#preferredLocaleList ??= computePreferredLocaleList(request, i18n.locales);
	}
	/**
	* Lazily loads the route's component module. Returns the cached
	* instance if already loaded. The promise is cached so concurrent
	* callers share the same load.
	*/
	async loadComponentInstance() {
		if (this.componentInstance) return this.componentInstance;
		if (this.#componentInstancePromise) return this.#componentInstancePromise;
		this.#componentInstancePromise = getEnvironment(this.manifest).getComponentByRoute(this.manifest, this.routeData).then((mod) => {
			this.componentInstance = mod;
			return mod;
		});
		return this.#componentInstancePromise;
	}
	/**
	* Registers a context provider under the given key. Handlers call
	* this to contribute values to the request context (e.g. sessions).
	* The `create` factory is called lazily on the first `resolve(key)`.
	*/
	provide(key, provider) {
		(this.#providers ??= /* @__PURE__ */ new Map()).set(key, provider);
	}
	/**
	* Lazily resolves a provider registered under `key`. Calls
	* `provider.create()` on first access and caches the result.
	* Returns `undefined` if no provider was registered for the key.
	*/
	resolve(key) {
		if (this.#providersResolvedValues?.has(key)) return this.#providersResolvedValues.get(key);
		const provider = this.#providers?.get(key);
		if (!provider) return void 0;
		const value = provider.create();
		(this.#providersResolvedValues ??= /* @__PURE__ */ new Map()).set(key, value);
		return value;
	}
	/**
	* Runs all registered `finalize` callbacks. Should be called after
	* the response is produced, typically in a `finally` block.
	*
	* Returns synchronously (no promise allocation) when nothing needs
	* finalizing — important for the hot path where sessions are not used.
	*/
	finalizeAll() {
		if (!this.#providersResolvedValues || this.#providersResolvedValues.size === 0) return;
		let chain;
		for (const [key, provider] of this.#providers) if (provider.finalize && this.#providersResolvedValues.has(key)) {
			const result = provider.finalize(this.#providersResolvedValues.get(key));
			if (result) chain = chain ? chain.then(() => result) : result;
		}
		return chain;
	}
	/**
	* Adds lazy getters to `target` for each registered provider key.
	* Used by context creation (APIContext, Astro global) so that
	* provider values like `session` and `cache` appear as properties
	* without hard-coding the keys.
	*
	* Always defines a `session` getter (returning `undefined` when no
	* provider is registered) so `ctx.session` / `Astro.session` is a
	* present property regardless of whether the sessions handler was
	* included in the pipeline.
	*/
	defineProviderGetters(target) {
		const state = this;
		if (this.#providers) for (const key of this.#providers.keys()) Object.defineProperty(target, key, {
			get: () => state.resolve(key),
			enumerable: true,
			configurable: true
		});
		if (!this.#providers?.has("session")) {
			let warned = false;
			Object.defineProperty(target, "session", {
				get() {
					if (!warned) {
						warned = true;
						state.logger.warn("session", "`Astro.session` was accessed but no session storage is configured. Either configure the storage manually or use an adapter that provides session storage. For more information, see https://docs.astro.build/en/guides/sessions/");
					}
				},
				enumerable: true,
				configurable: true
			});
		}
	}
	/**
	* Resolves the route to use for this request and stores it on
	* `this.routeData`. If the adapter (or the dev server) provided a
	* `routeData` via render options it's already set and this is a
	* no-op. Otherwise we use the app's synchronous route matcher and
	* fall back to a `404.astro` route so middleware can still run.
	*
	* Called eagerly from the constructor so individual handlers
	* (actions, pages, middleware, etc.) always see a resolved route
	* without the caller needing an extra setup step.
	*
	* Once routeData is known, finalizes `this.pathname`: in dev, if the
	* matched route has no `.html` extension, strip `.html` / `/index.html`
	* suffixes so the rendering pipeline sees the canonical pathname.
	*/
	/**
	* Strip `.html` / `/index.html` suffixes from the pathname so the
	* rendering pipeline sees the canonical route path. Only applies to
	* page routes where `.html` is framework-injected. Endpoint routes
	* preserve `.html` because any such suffix is user-provided (e.g.
	* from `getStaticPaths` params). Skipped when the matched route
	* itself has an `.html` extension in its definition.
	*/
	#stripHtmlExtension() {
		if (this.routeData && this.routeData.type === "page" && !routeHasHtmlExtension(this.routeData)) {
			const original = this.pathname;
			this.pathname = this.pathname.replace(/\/index\.html$/, "/").replace(/\.html$/, "");
			if (this.manifest.trailingSlash === "always" && this.pathname !== "" && !this.pathname.endsWith("/")) this.pathname += "/";
			if (this.pathname !== original && this.routeData.pattern.test(original) && !this.routeData.pattern.test(this.pathname)) this.pathname = original;
		}
	}
	#resolveRouteData() {
		if (this.routeData) {
			this.#stripHtmlExtension();
			return;
		}
		const matched = matchRoute(this.manifest, this.pathname);
		if (matched && matched.prerender && this.manifest.serverLike) {
			if (matched.params.length > 0) {
				const allMatches = matchAllRoutes(this.manifest, this.pathname);
				this.routeData = allMatches.find((r) => !r.prerender);
			} else this.routeData = void 0;
		} else this.routeData = matched;
		this.logger.debug("router", "Astro matched the following route for " + this.request.url);
		this.logger.debug("router", "RouteData:\n" + this.routeData);
		if (!this.routeData) {
			const custom404 = getCustom404Route(getRouteTable(this.manifest));
			if (custom404 && !custom404.prerender) this.routeData = custom404;
		}
		if (!this.routeData) {
			this.logger.debug("router", "Astro hasn't found routes that match " + this.request.url);
			this.logger.debug("router", "Here's the available routes:\n", getRouteTable(this.manifest));
			return;
		}
		this.#stripHtmlExtension();
	}
	/**
	* Strips the manifest's base from a normalized request pathname and prepends
	* a forward slash.
	*
	* Mirrors `BaseApp.removeBase`: the router matches against this stripped path
	* while middleware reads the un-stripped `context.url.pathname`, so both must
	* strip the base identically.
	*/
	#computePathname(normalizedPathname) {
		return prependForwardSlash(stripRequestBase(normalizedPathname, this.manifest.base));
	}
	/**
	* Decodes and normalizes the public request pathname before deriving the
	* separate pathname used for route matching.
	*/
	#normalizePathname(pathname) {
		try {
			pathname = validateAndDecodePathname(pathname);
		} catch (e) {
			if (e instanceof MultiLevelEncodingError) this.invalidEncoding = true;
			else this.logger.error(null, e.toString());
		}
		return collapseDuplicateSlashes(pathname);
	}
	/**
	* Reads X-Forwarded-Proto, X-Forwarded-Host, and X-Forwarded-Port
	* from the request headers, validates them against the manifest's
	* `allowedDomains`, and updates `this.url` accordingly. Also resolves
	* `clientAddress` from X-Forwarded-For when the host is trusted.
	*
	* Only called when `allowedDomains` is configured — without it,
	* forwarded headers are never trusted.
	*/
	#applyForwardedHeaders() {
		const headers = this.request.headers;
		const allowedDomains = this.manifest.allowedDomains;
		const validated = validateForwardedHeaders(getFirstForwardedValue(headers.get("x-forwarded-proto") ?? void 0), getFirstForwardedValue(headers.get("x-forwarded-host") ?? void 0), getFirstForwardedValue(headers.get("x-forwarded-port") ?? void 0), allowedDomains);
		if (!validated.protocol && !validated.host && !validated.port) return;
		if (validated.protocol) this.url.protocol = validated.protocol + ":";
		if (validated.host) {
			const colonIdx = validated.host.indexOf(":");
			if (colonIdx !== -1) {
				this.url.hostname = validated.host.slice(0, colonIdx);
				this.url.port = validated.host.slice(colonIdx + 1);
			} else {
				this.url.hostname = validated.host;
				this.url.port = "";
			}
		}
		if (validated.port) this.url.port = validated.port;
		if (validated.host !== void 0 && !this.clientAddress) {
			const forwardedFor = getFirstForwardedValue(this.request.headers.get("x-forwarded-for") ?? void 0);
			if (forwardedFor) this.clientAddress = forwardedFor;
		}
		this.request = new Request(this.url, this.request);
	}
	/**
	* Returns the resolved `props` for this render, computing them lazily
	* from the route + component module on first access. If the
	* `initialProps` already carries user-supplied props (e.g. the
	* container API) those are used verbatim.
	*/
	async getProps() {
		if (this.props !== null) return this.props;
		if (Object.keys(this.initialProps).length > 0) {
			this.props = this.initialProps;
			return this.props;
		}
		const mod = await this.loadComponentInstance();
		this.props = await getProps({
			mod,
			routeData: this.routeData,
			routeCache: getRouteCache(this.manifest),
			pathname: this.pathname,
			logger: this.logger,
			serverLike: this.manifest.serverLike,
			base: this.manifest.base,
			trailingSlash: this.manifest.trailingSlash
		});
		return this.props;
	}
	/**
	* Returns the `ActionAPIContext` for this render, creating it lazily.
	* Used by middleware, actions, and page dispatch.
	*/
	getActionAPIContext() {
		if (this.actionApiContext !== null) return this.actionApiContext;
		const state = this;
		const ctx = {
			get cookies() {
				return state.cookies;
			},
			routePattern: this.routeData.route,
			isPrerendered: this.routeData.prerender,
			get clientAddress() {
				return state.getClientAddress();
			},
			get currentLocale() {
				return state.computeCurrentLocale();
			},
			generator: ASTRO_GENERATOR,
			get locals() {
				return state.locals;
			},
			set locals(_) {
				throw new AstroError(LocalsReassigned);
			},
			params: this.params,
			get preferredLocale() {
				return state.computePreferredLocale();
			},
			get preferredLocaleList() {
				return state.computePreferredLocaleList();
			},
			request: this.request,
			site: getSite(this.manifest),
			url: this.url,
			get originPathname() {
				return getOriginPathname(state.request);
			},
			get csp() {
				return state.getCsp();
			},
			get logger() {
				return astroToRuntimeLogger(state.logger);
			}
		};
		this.defineProviderGetters(ctx);
		this.actionApiContext = ctx;
		return this.actionApiContext;
	}
	/**
	* Returns the `APIContext` for this render, creating it lazily from
	* the memoized props + action context.
	*
	* Callers must ensure `getProps()` has resolved at least once before
	* calling this.
	*/
	getAPIContext() {
		if (this.apiContext !== null) return this.apiContext;
		const actionApiContext = this.getActionAPIContext();
		const state = this;
		const redirect = (path, status = 302) => new Response(null, {
			status,
			headers: { Location: path }
		});
		const rewrite = async (reroutePayload) => {
			return await state.rewrite(reroutePayload);
		};
		actionApiContext[fetchStateSymbol] = this;
		this.apiContext = Object.assign(actionApiContext, {
			props: this.props,
			redirect,
			rewrite,
			getActionResult: createGetActionResult(actionApiContext.locals),
			callAction: createCallAction(actionApiContext)
		});
		return this.apiContext;
	}
	/**
	* Invalidates the cached `APIContext` so the next `getAPIContext()`
	* call re-derives it from the (possibly mutated) state. Used
	* after an in-flight rewrite swaps the route / request / params.
	*/
	invalidateContexts() {
		this.props = null;
		this.actionApiContext = null;
		this.apiContext = null;
	}
	resetResponseMetadata() {
		this.responseRouteType = void 0;
		this.skipErrorReroute = false;
	}
};
//#endregion
//#region node_modules/.pnpm/@astrojs+internal-helpers@0.11.0/node_modules/@astrojs/internal-helpers/dist/object.js
var FORBIDDEN_PATH_KEYS = /* @__PURE__ */ new Set([
	"__proto__",
	"constructor",
	"prototype"
]);
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/actions/noop-actions.js
var NOOP_ACTIONS_MOD = { server: {} };
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/actions/load.js
var actionsMemo = createAsyncManifestMemo(async (manifest) => manifest.actions ? await manifest.actions() : NOOP_ACTIONS_MOD);
function getActions(manifest) {
	return actionsMemo.get(manifest);
}
async function getAction(manifest, path) {
	const pathKeys = path.split(".").map((key) => decodeURIComponent(key));
	let { server } = await getActions(manifest);
	if (!server || !(typeof server === "object")) throw new TypeError(`Expected \`server\` export in actions file to be an object. Received ${typeof server}.`);
	for (const key of pathKeys) {
		if (typeof server === "function") throw new AstroError({
			...ActionNotFoundError,
			message: ActionNotFoundError.message(pathKeys.join("."))
		});
		if (FORBIDDEN_PATH_KEYS.has(key)) throw new AstroError({
			...ActionNotFoundError,
			message: ActionNotFoundError.message(pathKeys.join("."))
		});
		if (!Object.hasOwn(server, key)) throw new AstroError({
			...ActionNotFoundError,
			message: ActionNotFoundError.message(pathKeys.join("."))
		});
		server = server[key];
	}
	if (typeof server !== "function") throw new TypeError(`Expected handler for action ${pathKeys.join(".")} to be a function. Received ${typeof server}.`);
	return server;
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/actions/runtime/server.js
function getActionContext(context) {
	const callerInfo = getCallerInfo(context);
	const actionResultAlreadySet = Boolean(context.locals._actionPayload);
	let action = void 0;
	if (callerInfo && context.request.method === "POST" && !actionResultAlreadySet) action = {
		calledFrom: callerInfo.from,
		name: callerInfo.name,
		handler: async () => {
			const { manifest } = getFetchStateFromAPIContext(context);
			const callerInfoName = shouldAppendForwardSlash(manifest.trailingSlash, manifest.buildFormat) ? removeTrailingForwardSlash(callerInfo.name) : callerInfo.name;
			let baseAction;
			try {
				baseAction = await getAction(manifest, callerInfoName);
			} catch (error) {
				if (error instanceof Error && "name" in error && typeof error.name === "string" && error.name === ActionNotFoundError.name) return {
					data: void 0,
					error: new ActionError({ code: "NOT_FOUND" })
				};
				throw error;
			}
			const bodySizeLimit = manifest.actionBodySizeLimit;
			let input;
			try {
				input = await parseRequestBody(context.request, bodySizeLimit);
			} catch (e) {
				if (e instanceof ActionError) return {
					data: void 0,
					error: e
				};
				if (e instanceof TypeError) return {
					data: void 0,
					error: new ActionError({ code: "UNSUPPORTED_MEDIA_TYPE" })
				};
				throw e;
			}
			const omitKeys = [
				"props",
				"getActionResult",
				"callAction",
				"redirect"
			];
			const actionAPIContext = Object.create(Object.getPrototypeOf(context), Object.fromEntries(Object.entries(Object.getOwnPropertyDescriptors(context)).filter(([key]) => !omitKeys.includes(key))));
			Reflect.set(actionAPIContext, ACTION_API_CONTEXT_SYMBOL, true);
			return baseAction.bind(actionAPIContext)(input);
		}
	};
	function setActionResult(actionName, actionResult) {
		context.locals._actionPayload = {
			actionResult,
			actionName
		};
	}
	return {
		action,
		setActionResult,
		serializeActionResult,
		deserializeActionResult
	};
}
function getCallerInfo(ctx) {
	if (ctx.routePattern === "/_actions/[...path]") return {
		from: "rpc",
		name: ctx.url.pathname.replace(/^.*\/_actions\//, "")
	};
	const queryParam = ctx.url.searchParams.get(ACTION_QUERY_PARAMS.actionName);
	if (queryParam) return {
		from: "form",
		name: queryParam
	};
}
async function parseRequestBody(request, bodySizeLimit) {
	const contentType = request.headers.get("content-type");
	const contentLengthHeader = request.headers.get("content-length");
	const contentLength = contentLengthHeader ? Number.parseInt(contentLengthHeader, 10) : void 0;
	const hasContentLength = typeof contentLength === "number" && Number.isFinite(contentLength);
	if (!contentType) return void 0;
	if (hasContentLength && contentLength > bodySizeLimit) throw new ActionError({
		code: "CONTENT_TOO_LARGE",
		message: `Request body exceeds ${bodySizeLimit} bytes`
	});
	try {
		if (hasContentType(contentType, formContentTypes)) {
			if (!hasContentLength) {
				const body = await readBodyWithLimit(request.clone(), bodySizeLimit);
				return await new Request(request.url, {
					method: request.method,
					headers: request.headers,
					body: toArrayBuffer(body)
				}).formData();
			}
			return await request.clone().formData();
		}
		if (hasContentType(contentType, ["application/json"])) {
			if (contentLength === 0) return void 0;
			if (!hasContentLength) {
				const body = await readBodyWithLimit(request.clone(), bodySizeLimit);
				if (body.byteLength === 0) return void 0;
				return JSON.parse(new TextDecoder().decode(body));
			}
			return await request.clone().json();
		}
	} catch (e) {
		if (e instanceof BodySizeLimitError) throw new ActionError({
			code: "CONTENT_TOO_LARGE",
			message: `Request body exceeds ${bodySizeLimit} bytes`
		});
		throw e;
	}
	throw new TypeError("Unsupported content type");
}
var ACTION_API_CONTEXT_SYMBOL = /* @__PURE__ */ Symbol.for("astro.actionAPIContext");
var formContentTypes = ["application/x-www-form-urlencoded", "multipart/form-data"];
function hasContentType(contentType, expected) {
	const type = contentType.split(";")[0].toLowerCase();
	return expected.some((t) => type === t);
}
function serializeActionResult(res) {
	if (res.error) {
		if (Object.assign({
			"ASSETS_PREFIX": void 0,
			"BASE_URL": "/",
			"DEV": false,
			"MODE": "production",
			"PROD": true,
			"SITE": "https://firefly.cuteleaf.cn",
			"SSR": true
		}, { OS: "Windows_NT" })?.DEV) actionResultErrorStack.set(res.error.stack);
		let body2;
		if (res.error instanceof ActionInputError) body2 = {
			type: res.error.type,
			issues: res.error.issues,
			fields: res.error.fields
		};
		else body2 = {
			...res.error,
			message: res.error.message
		};
		return {
			type: "error",
			status: res.error.status,
			contentType: "application/json",
			body: JSON.stringify(body2)
		};
	}
	if (res.data === void 0) return {
		type: "empty",
		status: 204
	};
	let body;
	try {
		body = stringify(res.data, { URL: (value) => value instanceof URL && value.href });
	} catch (e) {
		let hint = ActionsReturnedInvalidDataError.hint;
		if (res.data instanceof Response) hint = REDIRECT_STATUS_CODES.includes(res.data.status) ? "If you need to redirect when the action succeeds, trigger a redirect where the action is called. See the Actions guide for server and client redirect examples: https://docs.astro.build/en/guides/actions." : "If you need to return a Response object, try using a server endpoint instead. See https://docs.astro.build/en/guides/endpoints/#server-endpoints-api-routes";
		throw new AstroError({
			...ActionsReturnedInvalidDataError,
			message: ActionsReturnedInvalidDataError.message(String(e)),
			hint
		});
	}
	return {
		type: "data",
		status: 200,
		contentType: "application/json+devalue",
		body
	};
}
function toArrayBuffer(buffer) {
	const copy = new Uint8Array(buffer.byteLength);
	copy.set(buffer);
	return copy.buffer;
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/actions/handler.js
function handleAction(apiContext, state) {
	markFeatureUsed(state.manifest, FetchFeatures.actions);
	if (apiContext.isPrerendered) return;
	const { action, setActionResult } = getActionContext(apiContext);
	if (!action) return;
	if (state.manifest.checkOrigin && isForbiddenCrossOriginRequest(apiContext.request, apiContext.url, apiContext.isPrerendered)) return Promise.resolve(createCrossOriginForbiddenResponse(apiContext.request));
	return executeAction(action, setActionResult);
}
async function executeAction(action, setActionResult) {
	const serialized = serializeActionResult(await action.handler());
	if (action.calledFrom === "rpc") {
		if (serialized.type === "empty") return new Response(null, { status: serialized.status });
		return new Response(serialized.body, {
			status: serialized.status,
			headers: { "Content-Type": serialized.contentType }
		});
	}
	setActionResult(action.name, serialized);
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/routing/3xx.js
function redirectTemplate({ status, absoluteLocation, relativeLocation, from }) {
	const delay = status === 302 ? 2 : 0;
	const rel = escape(String(relativeLocation));
	return `<!doctype html>
<title>Redirecting to: ${rel}</title>
<meta http-equiv="refresh" content="${delay};url=${rel}">
<meta name="robots" content="noindex">
<link rel="canonical" href="${escape(String(absoluteLocation))}">
<body>
	<a href="${rel}">Redirecting ${from ? `from <code>${escape(from)}</code> ` : ""}to <code>${rel}</code></a>
</body>`;
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/routing/trailing-slash-handler.js
function handleTrailingSlash(state) {
	const url = new URL(state.request.url);
	const redirect = redirectTrailingSlash(state.manifest.trailingSlash, url.pathname);
	if (redirect === url.pathname) return;
	const addCookieHeader = state.renderOptions.addCookieHeader;
	const status = state.request.method === "GET" ? 301 : 308;
	const response = new Response(redirectTemplate({
		status,
		relativeLocation: url.pathname,
		absoluteLocation: redirect,
		from: state.request.url
	}), {
		status,
		headers: { location: redirect + url.search }
	});
	prepareResponse(response, { addCookieHeader });
	return response;
}
function redirectTrailingSlash(trailingSlash, pathname) {
	if (pathname === "/" || isInternalPath(pathname)) return pathname;
	const path = collapseDuplicateTrailingSlashes(pathname, trailingSlash !== "never");
	if (path !== pathname) return path;
	if (trailingSlash === "ignore") return pathname;
	if (trailingSlash === "always" && !hasFileExtension(pathname)) return appendForwardSlash(pathname);
	if (trailingSlash === "never") return removeTrailingForwardSlash(pathname);
	return pathname;
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/cache/provider.js
var cacheProviderMemo = createAsyncManifestMemo(async (manifest) => {
	if (manifest.cacheProvider) {
		const factory = (await manifest.cacheProvider())?.default || null;
		return factory ? factory(manifest.cacheConfig?.options) : null;
	}
	return null;
});
function getCacheProvider(manifest) {
	return cacheProviderMemo.get(manifest);
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/cache/runtime/utils.js
function defaultSetHeaders(options) {
	const headers = new Headers();
	const directives = [];
	if (options.maxAge !== void 0) directives.push(`max-age=${options.maxAge}`);
	if (options.swr !== void 0) directives.push(`stale-while-revalidate=${options.swr}`);
	if (directives.length > 0) headers.set("CDN-Cache-Control", directives.join(", "));
	if (options.tags && options.tags.length > 0) headers.set("Cache-Tag", options.tags.join(", "));
	if (options.lastModified) headers.set("Last-Modified", options.lastModified.toUTCString());
	if (options.etag) headers.set("ETag", options.etag);
	return headers;
}
function isLiveDataEntry(value) {
	return value != null && typeof value === "object" && "id" in value && "data" in value && "cacheHint" in value;
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/cache/runtime/cache.js
var APPLY_HEADERS = /* @__PURE__ */ Symbol.for("astro:cache:apply");
var IS_ACTIVE = /* @__PURE__ */ Symbol.for("astro:cache:active");
var AstroCache = class {
	#options = {};
	#tags = /* @__PURE__ */ new Set();
	#disabled = false;
	#provider;
	enabled = true;
	constructor(provider) {
		this.#provider = provider;
	}
	set(input) {
		if (input === false) {
			this.#disabled = true;
			this.#tags.clear();
			this.#options = {};
			return;
		}
		this.#disabled = false;
		let options;
		if (isLiveDataEntry(input)) {
			if (!input.cacheHint) return;
			options = input.cacheHint;
		} else options = input;
		if ("maxAge" in options && options.maxAge !== void 0) this.#options.maxAge = options.maxAge;
		if ("swr" in options && options.swr !== void 0) this.#options.swr = options.swr;
		if ("etag" in options && options.etag !== void 0) this.#options.etag = options.etag;
		if (options.lastModified !== void 0) {
			if (!this.#options.lastModified || options.lastModified > this.#options.lastModified) this.#options.lastModified = options.lastModified;
		}
		if (options.tags) for (const tag of options.tags) this.#tags.add(tag);
	}
	get tags() {
		return [...this.#tags];
	}
	/**
	* Get the current cache options (read-only snapshot).
	* Includes all accumulated options: maxAge, swr, tags, etag, lastModified.
	*/
	get options() {
		return {
			...this.#options,
			tags: this.tags
		};
	}
	async invalidate(input) {
		if (!this.#provider) throw new AstroError(CacheNotEnabled);
		let options;
		if (isLiveDataEntry(input)) options = { tags: input.cacheHint?.tags ?? [] };
		else options = input;
		return this.#provider.invalidate(options);
	}
	/** @internal */
	[APPLY_HEADERS](response, request) {
		if (this.#disabled) return;
		const finalOptions = {
			...this.#options,
			tags: this.tags
		};
		if (finalOptions.maxAge === void 0 && !finalOptions.tags?.length) return;
		const headers = this.#provider?.setHeaders?.(finalOptions, request) ?? defaultSetHeaders(finalOptions);
		for (const [key, value] of headers) response.headers.set(key, value);
		if (!response.headers.has("Cache-Control") && !response.headers.has("Expires") && (response.headers.has("Last-Modified") || response.headers.has("ETag"))) response.headers.set("Cache-Control", "no-cache");
	}
	/** @internal */
	get [IS_ACTIVE]() {
		return !this.#disabled && (this.#options.maxAge !== void 0 || this.#tags.size > 0);
	}
};
function applyCacheHeaders(cache, response, request) {
	if (APPLY_HEADERS in cache) cache[APPLY_HEADERS](response, request);
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/routing/parts.js
var ROUTE_DYNAMIC_SPLIT = /\[(.+?\(.+?\)|.+?)\]/;
var ROUTE_SPREAD = /^\.{3}.+$/;
function getParts(part, file) {
	const result = [];
	part.split(ROUTE_DYNAMIC_SPLIT).map((str, i) => {
		if (!str) return;
		const dynamic = i % 2 === 1;
		const [, content] = dynamic ? /([^(]+)$/.exec(str) || [null, null] : [null, str];
		if (!content || dynamic && !/^(?:\.\.\.)?[\w$]+$/.test(content)) throw new Error(`Invalid route ${file} \u2014 parameter name must match /^[a-zA-Z0-9_$]+$/`);
		result.push({
			content,
			dynamic,
			spread: dynamic && ROUTE_SPREAD.test(content)
		});
	});
	return result;
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/cache/runtime/route-matching.js
function compileCacheRoutes(routes, base, trailingSlash) {
	const compiled = Object.entries(routes).map(([path, options]) => {
		const segments = removeLeadingForwardSlash(path).split("/").filter(Boolean).map((s) => getParts(s, path));
		return {
			pattern: getPattern(segments, base, trailingSlash),
			options,
			segments,
			route: path
		};
	});
	compiled.sort((a, b) => routeComparator({
		segments: a.segments,
		route: a.route,
		type: "page"
	}, {
		segments: b.segments,
		route: b.route,
		type: "page"
	}));
	return compiled;
}
function matchCacheRoute(pathname, compiledRoutes) {
	for (const route of compiledRoutes) if (route.pattern.test(pathname)) return route.options;
	return null;
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/cache/handler.js
var CACHE_KEY = "cache";
function provideCache(state) {
	const manifest = state.manifest;
	if (!manifest.cacheConfig) {
		state.provide(CACHE_KEY, { create: () => new DisabledAstroCache(state.logger) });
		return;
	}
	if (getEnvironment(manifest).runtimeMode === "development") {
		state.provide(CACHE_KEY, { create: () => new NoopAstroCache() });
		return;
	}
	return provideCacheAsync(state, manifest);
}
async function provideCacheAsync(state, manifest) {
	const cacheProvider = await getCacheProvider(manifest);
	state.provide(CACHE_KEY, { create() {
		const cache = new AstroCache(cacheProvider);
		if (manifest.cacheConfig?.routes) {
			const matched = matchCacheRoute(state.pathname, getCompiledCacheRoutes(manifest));
			if (matched) cache.set(matched);
		}
		return cache;
	} });
}
async function handleCache(state, next) {
	markFeatureUsed(state.manifest, FetchFeatures.cache);
	if (!state.manifest.cacheProvider) return next();
	const cache = state.resolve(CACHE_KEY);
	const cacheProvider = await getCacheProvider(state.manifest);
	if (cacheProvider?.onRequest) {
		const response2 = await cacheProvider.onRequest({
			request: state.request,
			url: new URL(state.request.url),
			waitUntil: state.renderOptions.waitUntil,
			logger: {
				info(msg) {
					state.logger.info("cache", msg);
				},
				warn(msg) {
					state.logger.warn("cache", msg);
				},
				error(msg) {
					state.logger.error("cache", msg);
				}
			}
		}, async () => {
			const res = await next();
			applyCacheHeaders(cache, res, state.request);
			return res;
		});
		response2.headers.delete("CDN-Cache-Control");
		response2.headers.delete("Cache-Tag");
		return response2;
	}
	const response = await next();
	applyCacheHeaders(cache, response, state.request);
	return response;
}
var compiledCacheRoutesMemo = createManifestMemo((manifest) => manifest.cacheConfig?.routes ? compileCacheRoutes(manifest.cacheConfig.routes, manifest.base, manifest.trailingSlash) : []);
function getCompiledCacheRoutes(manifest) {
	return compiledCacheRoutesMemo.get(manifest);
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/redirects/render.js
function isExternalURL(url) {
	return url.startsWith("http://") || url.startsWith("https://") || url.startsWith("//");
}
function redirectIsExternal(redirect) {
	if (typeof redirect === "string") return isExternalURL(redirect);
	else return isExternalURL(redirect.destination);
}
function computeRedirectStatus(method, redirect, redirectRoute) {
	return redirectRoute && typeof redirect === "object" ? redirect.status : method === "GET" ? 301 : 308;
}
function resolveRedirectTarget(params, redirect, redirectRoute, trailingSlash) {
	if (typeof redirectRoute !== "undefined") return getRouteGenerator(redirectRoute.segments, trailingSlash)(params) || redirectRoute?.pathname || "/";
	else if (typeof redirect === "string") {
		if (redirectIsExternal(redirect)) return redirect;
		else {
			let target = redirect;
			for (const param of Object.keys(params)) {
				const paramValue = params[param];
				target = target.replace(`[${param}]`, paramValue).replace(`[...${param}]`, paramValue);
			}
			return target;
		}
	} else if (typeof redirect === "undefined") return "/";
	return redirect.destination;
}
async function renderRedirect(state) {
	markFeatureUsed(state.manifest, FetchFeatures.redirects);
	const { redirect, redirectRoute } = state.routeData;
	const status = computeRedirectStatus(state.request.method, redirect, redirectRoute);
	const headers = { location: encodeURI(resolveRedirectTarget(state.params, redirect, redirectRoute, state.manifest.trailingSlash)) };
	if (redirect && redirectIsExternal(redirect)) {
		if (typeof redirect === "string") return Response.redirect(redirect, status);
		else return Response.redirect(redirect.destination, status);
	}
	return new Response(null, {
		status,
		headers
	});
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/routing/handler.js
function logRequestFromState(state, payload) {
	if (state.logRequest) state.logRequest(payload);
	else getEnvironment(state.manifest).logRequest(state.manifest, payload);
}
function actionsAndPages(state, ctx) {
	if (!state.skipMiddleware) {
		const actionResult = handleAction(ctx, state);
		if (actionResult) return actionResult.then((response) => response ?? handlePages(state, ctx));
	}
	return handlePages(state, ctx);
}
async function handleRequest(state) {
	await getResolvedLogger(state.manifest);
	markFeatureUsed(state.manifest, ALL_FETCH_FEATURES);
	if (state.invalidEncoding) return new Response(null, {
		status: 400,
		statusText: "Bad Request"
	});
	const trailingSlashRedirect = handleTrailingSlash(state);
	if (trailingSlashRedirect) return trailingSlashRedirect;
	if (!state.routeData) return renderErrorFromState(state, state.request, {
		...state.renderOptions,
		status: 404,
		pathname: state.pathname
	});
	return render(state);
}
async function render(state) {
	const routeData = state.routeData;
	const pathname = state.pathname;
	const request = state.request;
	const { addCookieHeader } = state.renderOptions;
	state.status = getDefaultStatusCode(state.manifest, routeData, pathname);
	let response;
	let finalizeError;
	try {
		const sessionP = state.manifest.sessionConfig ? provideSession(state) : void 0;
		const cacheP = provideCache(state);
		if (sessionP || cacheP) await Promise.all([sessionP, cacheP]);
		markFeatureUsed(state.manifest, FetchFeatures.sessions);
		if (routeData.type === "redirect") {
			const redirectResponse = await renderRedirect(state);
			logRequestFromState(state, {
				pathname,
				method: request.method,
				statusCode: redirectResponse.status,
				isRewrite: false,
				timeStart: state.timeStart
			});
			prepareResponse(redirectResponse, { addCookieHeader });
			state.logger.flush();
			return redirectResponse;
		}
		const i18n = getI18n(state.manifest);
		if (!state.manifest.cacheProvider) {
			markFeatureUsed(state.manifest, FetchFeatures.cache);
			response = await handleMiddleware(state, actionsAndPages);
			if (i18n) response = await finalizeI18n(i18n, state, response);
		} else {
			const runPipeline = async () => {
				let res = await handleMiddleware(state, actionsAndPages);
				if (i18n) res = await finalizeI18n(i18n, state, res);
				return res;
			};
			response = await handleCache(state, runPipeline);
		}
		logRequestFromState(state, {
			pathname,
			method: request.method,
			statusCode: response.status,
			isRewrite: state.isRewriting,
			timeStart: state.timeStart
		});
	} catch (err) {
		state.logger.error(null, err.stack || err.message || String(err));
		return renderErrorFromState(state, request, {
			...state.renderOptions,
			status: 500,
			error: err,
			pathname: state.pathname
		});
	} finally {
		try {
			const finalize = state.finalizeAll();
			if (finalize) await finalize;
		} catch (err) {
			finalizeError = err;
			state.logger.error(null, err.stack || err.message || String(err));
		}
	}
	if (finalizeError) return renderErrorFromState(state, request, {
		...state.renderOptions,
		status: 500,
		error: finalizeError,
		pathname: state.pathname
	});
	if (REROUTABLE_STATUS_CODES.includes(response.status) && response.body === null && !state.skipErrorReroute) return renderErrorFromState(state, request, {
		...state.renderOptions,
		response,
		status: response.status,
		error: response.status === 500 ? null : void 0,
		pathname: state.pathname
	});
	prepareResponse(response, { addCookieHeader });
	state.logger.flush();
	return response;
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/fetch/default-handler.js
var DefaultFetchHandler = class {
	#manifest;
	/**
	* `BaseApp` passes itself so states resolve that app's manifest ahead of
	* the ambient one; generated builds construct the handler with no
	* arguments and use the ambient manifest.
	*/
	constructor(app) {
		this.#manifest = app?.manifest;
	}
	fetch = (request) => {
		const options = getRenderOptions(request);
		return handleRequest(new FetchState(this.#manifest ?? getAmbientManifest(), request, options));
	};
};
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/routing/match-request.js
function safeDecodePathname(manifest, pathname) {
	try {
		return validateAndDecodePathname(pathname);
	} catch (e) {
		new AstroIntegrationLogger(getLogger(manifest).options, manifest.adapterName).debug(e.toString());
		try {
			return decodeURI(pathname);
		} catch {
			return pathname;
		}
	}
}
function matchRequest(manifest, request, allowPrerenderedRoutes = false) {
	const url = new URL(request.url);
	if (manifest.assets.has(url.pathname)) return void 0;
	let pathname = computePathnameFromDomain(request, url, manifest.i18n, manifest.base, manifest.trailingSlash, getLogger(manifest));
	if (!pathname) pathname = prependForwardSlash(stripRequestBase(url.pathname, manifest.base));
	pathname = safeDecodePathname(manifest, pathname);
	const routeData = matchRoute(manifest, pathname);
	if (!routeData) return void 0;
	if (allowPrerenderedRoutes) return routeData;
	if (routeData.prerender) {
		if (routeData.params.length > 0) return matchAllRoutes(manifest, pathname).find((r) => !r.prerender);
		return;
	}
	return routeData;
}
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/app/base.js
var BaseApp = class BaseApp {
	manifest;
	#adapterLogger;
	baseWithoutTrailingSlash;
	/**
	* The streaming flag passed to the constructor, surfaced through the
	* protected `resolveStreaming()` hook and fed into the internal
	* `FetchState` facade hooks on the fast path.
	*/
	#streaming;
	/**
	* The handler that turns incoming `Request` objects into `Response`s.
	* Defaults to a `DefaultFetchHandler` pinned to this app and can be
	* overridden via `setFetchHandler` — typically by the bundled
	* entrypoint after importing `virtual:astro:fetchable`.
	*/
	#fetchHandler;
	#errorHandler;
	/**
	* Whether a custom fetch handler (from `src/fetch.ts`) has been set
	* via `setFetchHandler`. When false, the `DefaultFetchHandler` is
	* in use and all features are implicitly active.
	*/
	#hasCustomFetchHandler = false;
	/**
	* Whether the missing-feature check has already run. We only want
	* to warn once — after the first request in dev, or at build end.
	*/
	#featureCheckDone = false;
	get logger() {
		return getLogger(this.manifest);
	}
	/**
	* Route data derived from the manifest, used for route matching. Reads and
	* writes go through the single per-manifest route table, so HMR updates are
	* visible to every consumer at once.
	*/
	get manifestData() {
		return getRouteTable(this.manifest);
	}
	set manifestData(routesList) {
		updateRouteTable(this.manifest, routesList.routes);
	}
	get adapterLogger() {
		const currentOptions = this.logger.options;
		if (!this.#adapterLogger || this.#adapterLogger.options !== currentOptions) this.#adapterLogger = new AstroIntegrationLogger(currentOptions, this.manifest.adapterName);
		return this.#adapterLogger;
	}
	constructor(manifest, streaming = true) {
		this.manifest = manifest;
		this.baseWithoutTrailingSlash = removeTrailingForwardSlash(manifest.base);
		this.#streaming = streaming;
		getRouteTable(manifest);
		getLogger(manifest);
		this.#fetchHandler = new DefaultFetchHandler(this);
		this.#errorHandler = this.createErrorHandler();
	}
	/**
	* Resolves the user-configured logger destination from the manifest and
	* returns the logger. Lazy and only resolves once; safe to call before
	* the first render (adapters use this to log startup messages through
	* the configured destination).
	*/
	getLogger() {
		return getResolvedLogger(this.manifest);
	}
	/**
	* The streaming flag fed into the internal `FetchState` facade hooks on
	* the fast path. Returns the constructor flag by
	* default; `BuildApp` overrides this to return `undefined` so streaming
	* falls through to the environment default (`manifest.serverLike`).
	*/
	resolveStreaming() {
		return this.#streaming;
	}
	/**
	* Override the fetch handler used to dispatch requests. Entrypoints
	* call this with the default export of `virtual:astro:fetchable` to
	* plug in a user-authored handler from `src/fetch.ts`.
	*/
	setFetchHandler(handler) {
		this.#fetchHandler = handler;
		this.#hasCustomFetchHandler = !(handler instanceof DefaultFetchHandler);
	}
	/**
	* Returns the error handler used by this app. The default is a thin
	* bridge over the functional error API — strategy selection (production
	* default / dev / build) is environment-driven inside `renderErrorPage`.
	* External subclasses can override this to customize error rendering.
	*/
	createErrorHandler() {
		return { renderError: (request, options) => renderErrorPage(this.manifest, request, options) };
	}
	/**
	* Resets the cached adapter logger so it picks up a new logger instance.
	* Used by BuildApp when the logger is replaced via setOptions().
	*/
	resetAdapterLogger() {
		this.#adapterLogger = void 0;
	}
	getAllowedDomains() {
		return this.manifest.allowedDomains;
	}
	matchesAllowedDomains(forwardedHost, protocol) {
		return BaseApp.validateForwardedHost(forwardedHost, this.manifest.allowedDomains, protocol);
	}
	static validateForwardedHost(forwardedHost, allowedDomains, protocol) {
		if (!allowedDomains || allowedDomains.length === 0) return false;
		try {
			const testUrl = new URL(`${protocol || "https"}://${forwardedHost}`);
			return allowedDomains.some((pattern) => {
				return matchPattern(testUrl, pattern);
			});
		} catch {
			return false;
		}
	}
	set setManifestData(newManifestData) {
		updateRouteTable(this.manifest, newManifestData.routes);
	}
	removeBase(pathname) {
		return stripRequestBase(pathname, this.manifest.base);
	}
	/**
	* Fully decodes a pathname, falling back to a single decode and then the raw pathname
	* when validation fails. Adapter matching runs before `render()`, so it must not throw
	* for request input that render-time validation handles.
	*/
	safeDecodePathname(pathname) {
		try {
			return validateAndDecodePathname(pathname);
		} catch (e) {
			this.adapterLogger.debug(e.toString());
			try {
				return decodeURI(pathname);
			} catch {
				return pathname;
			}
		}
	}
	/**
	* Extracts the base-stripped, decoded pathname from a request.
	* Used by adapters to compute the pathname for dev-mode route matching.
	*/
	getPathnameFromRequest(request) {
		const url = new URL(request.url);
		const pathname = prependForwardSlash(this.removeBase(url.pathname));
		return this.safeDecodePathname(pathname);
	}
	/**
	* Given a `Request`, it returns the `RouteData` that matches its `pathname`. By default, prerendered
	* routes aren't returned, even if they are matched.
	*
	* When `allowPrerenderedRoutes` is `true`, the function returns matched prerendered routes too.
	* @param request
	* @param allowPrerenderedRoutes
	*/
	match(request, allowPrerenderedRoutes = false) {
		return matchRequest(this.manifest, request, allowPrerenderedRoutes);
	}
	/**
	* A matching route function to use in the development server.
	* Contrary to the `.match` function, this function resolves props and params, returning the correct
	* route based on the priority, segments. It also returns the correct, resolved pathname.
	* @param pathname
	*/
	devMatch(pathname) {}
	computePathnameFromDomain(request) {
		return computePathnameFromDomain(request, new URL(request.url), this.manifest.i18n, this.manifest.base, this.manifest.trailingSlash, this.logger);
	}
	async render(request, { addCookieHeader = false, clientAddress = Reflect.get(request, clientAddressSymbol), locals, prerenderedErrorPageFetch = fetch, routeData, waitUntil } = {}) {
		await getResolvedLogger(this.manifest);
		if (routeData) {
			this.logger.debug("router", "The adapter " + this.manifest.adapterName + " provided a custom RouteData for ", request.url);
			this.logger.debug("router", "RouteData");
			this.logger.debug("router", routeData);
		}
		if (locals) {
			if (typeof locals !== "object") {
				const error = new AstroError(LocalsNotAnObject);
				this.logger.error(null, error.stack);
				return this.renderError(request, {
					addCookieHeader,
					clientAddress,
					prerenderedErrorPageFetch,
					locals: void 0,
					routeData,
					waitUntil,
					status: 500,
					error
				});
			}
		}
		if (!routeData) {
			const domainPathname = this.computePathnameFromDomain(request);
			if (domainPathname) routeData = matchRoute(this.manifest, this.safeDecodePathname(domainPathname));
		}
		const resolvedOptions = {
			addCookieHeader,
			clientAddress,
			prerenderedErrorPageFetch,
			locals,
			routeData,
			waitUntil
		};
		let response;
		if (this.#fetchHandler instanceof DefaultFetchHandler) response = await handleRequest(new FetchState(this.manifest, request, resolvedOptions, {
			streaming: this.resolveStreaming(),
			renderError: (req, opts) => this.renderError(req, opts),
			logRequest: (payload) => this.logThisRequest(payload)
		}));
		else {
			setRenderOptions(request, resolvedOptions);
			response = await this.#fetchHandler.fetch(request);
		}
		this.#warnMissingFeatures();
		if (response.headers.get("X-Astro-Error")) {
			response.headers.delete(ASTRO_ERROR_HEADER);
			return this.renderError(request, {
				addCookieHeader,
				clientAddress,
				prerenderedErrorPageFetch,
				locals,
				routeData,
				waitUntil,
				response,
				status: response.status,
				error: response.status === 500 ? null : void 0
			});
		}
		return response;
	}
	setCookieHeaders(response) {
		return getSetCookiesFromResponse(response);
	}
	/**
	* Reads all the cookies written by `Astro.cookie.set()` onto the passed response.
	* For example,
	* ```ts
	* for (const cookie_ of App.getSetCookieFromResponse(response)) {
	*     const cookie: string = cookie_
	* }
	* ```
	* @param response The response to read cookies from.
	* @returns An iterator that yields key-value pairs as equal-sign-separated strings.
	*/
	static getSetCookieFromResponse = getSetCookiesFromResponse;
	/**
	* If it is a known error code, try sending the according page (e.g. 404.astro / 500.astro).
	* This also handles pre-rendered /404 or /500 routes.
	*
	* Delegates to the app's configured `ErrorHandler`. To customize behavior
	* for a specific environment, override `createErrorHandler()` rather than
	* this method.
	*/
	async renderError(request, options) {
		return this.#errorHandler.renderError(request, options);
	}
	/**
	* One-shot check: after the first request with a custom `src/fetch.ts`,
	* compare `usedFeatures` against the manifest and warn about any
	* configured features the user's pipeline doesn't call.
	*/
	#warnMissingFeatures() {
		if (this.#featureCheckDone || !this.#hasCustomFetchHandler) return;
		this.#featureCheckDone = true;
		const manifest = this.manifest;
		const missing = [];
		const used = getUsedFeatures(this.manifest);
		if (manifest.routes.some((r) => r.routeData.type === "redirect") && !(used & FetchFeatures.redirects)) missing.push("redirects");
		if (manifest.sessionConfig && !(used & FetchFeatures.sessions)) missing.push("sessions");
		if (manifest.actions && !(used & FetchFeatures.actions)) missing.push("actions");
		if (manifest.middleware && !(used & FetchFeatures.middleware)) missing.push("middleware");
		if (manifest.i18n && manifest.i18n.strategy !== "manual" && !(used & FetchFeatures.i18n)) missing.push("i18n");
		if (manifest.cacheConfig && !(used & FetchFeatures.cache)) missing.push("cache");
		for (const feature of missing) this.logger.warn("router", `Your project uses ${feature}, but your custom src/fetch.ts does not call the ${feature}() handler. This feature will not work unless your fetch handler calls it.`);
	}
	getDefaultStatusCode(routeData, pathname) {
		return getDefaultStatusCode(this.manifest, routeData, pathname);
	}
	getManifest() {
		return this.manifest;
	}
	logThisRequest({ pathname, method, statusCode, isRewrite, timeStart }) {
		const timeEnd = performance.now();
		this.logRequest({
			pathname,
			method,
			statusCode,
			isRewrite,
			reqTime: timeEnd - timeStart
		});
	}
};
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/core/app/app.js
var App = class extends BaseApp {
	isDev() {
		return false;
	}
	logRequest(_options) {}
};
//#endregion
//#region node_modules/.pnpm/@edgeone+astro@1.1.5_astro@_13086ec3ccb9da62e586ce7b1d62a122/node_modules/@edgeone/astro/dist/server.js
function createExports(manifest) {
	const app = new App(manifest);
	const handler = async (request) => {
		const routeData = app.match(request);
		if (!routeData) {
			const url = new URL(request.url);
			const notFoundUrl = new URL("/404", url.origin);
			const notFoundRequest = new Request(notFoundUrl.toString(), {
				method: request.method,
				headers: request.headers
			});
			const notFoundRouteData = app.match(notFoundRequest);
			if (notFoundRouteData) return app.render(notFoundRequest, {
				routeData: notFoundRouteData,
				addCookieHeader: true
			});
			return new Response("Not found", { status: 404 });
		}
		return app.render(request, {
			routeData,
			addCookieHeader: true
		});
	};
	return { default: handler };
}
//#endregion
//#region \0virtual:astro:adapter-entrypoint
var _virtual_astro_adapter_entrypoint_exports = /* @__PURE__ */ __exportAll({
	createExports: () => createExports,
	default: () => _virtual_astro_adapter_entrypoint_default
});
var _virtual_astro_adapter_entrypoint_default = void 0;
//#endregion
//#region node_modules/.pnpm/astro@7.3.2_@astrojs+markdo_615e735e8b2abd7d5ef05ba59d6d98cd/node_modules/astro/dist/entrypoints/legacy.js
var _exports = createExports?.(manifest, void 0) || _virtual_astro_adapter_entrypoint_exports;
var _start = "start";
if (Object.prototype.hasOwnProperty.call(_virtual_astro_adapter_entrypoint_exports, _start)) _virtual_astro_adapter_entrypoint_exports[_start](manifest, void 0);
//#endregion
//#region \0virtual:astro:legacy-ssr-entry
var _virtual_astro_legacy_ssr_entry_default = _exports.default;
//#endregion
export { _virtual_astro_legacy_ssr_entry_default as default };
