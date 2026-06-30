import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import type { Meta } from "./cinemeta";
import { profileFromMeta, trackEvent } from "./discover";
import type { StreamingService } from "./settings";
import { useTogether } from "./together/provider";
import type { SportsGame } from "./sports/espn";
import { getWindowFullscreen, suppressFullscreenExitOnce } from "./fullscreen-state";
export type View = "home" | "settings" | "anime" | "discover" | "addons" | "calendar" | "movies" | "shows" | "kids" | "library" | "live" | "vod" | "downloads";

export type PlayEpisode = {
  season: number;
  episode: number;
  name?: string;
  imdbId?: string;
  imdbSeason?: number;
  imdbEpisode?: number;
  kitsuStreamId?: string;
  videoId?: string;
  still?: string;
  overview?: string;
  rating?: number;
  airDate?: string;
  runtime?: number;
};

export type PlayerSrc = {
  meta: Meta;
  imdbId?: string;
  imdbIdVerified?: boolean;
  episode?: PlayEpisode;
  url: string;
  title: string;
  subtitle?: string;
  notWebReady?: boolean;
  subtitles?: Array<{ url: string; lang?: string; id?: string }>;
  attempt?: number;
  streamRef?: PlayerStreamRef;
  liveProgram?: string;
  isLive?: boolean;
  headers?: Record<string, string>;
};

export type PlayerStreamRef = {
  infoHash?: string | null;
  fileIdx?: number | null;
  addonId?: string | null;
  title?: string | null;
  parsedTitle?: string | null;
  resolution?: string | null;
  quality?: string | null;
  releaseGroup?: string | null;
  source?: string | null;
  size?: number | null;
  bingeGroup?: string | null;
  cachedSlugs?: string[];
};

export type GridSpec = {
  title: string;
  fetcher: (page: number) => Promise<Meta[]>;
  initial?: Meta[];
  kidsHero?: { grad: string; art: string; name: string };
};

export type MetaFilter =
  | { kind: "year"; mediaType: "movie" | "tv"; value: number }
  | { kind: "runtime"; mediaType: "movie" | "tv"; value: number }
  | { kind: "genre"; mediaType: "movie" | "tv"; name: string; id: number }
  | { kind: "studio"; mediaType: "movie" | "tv"; name: string; id: number }
  | { kind: "country"; mediaType: "movie" | "tv"; name: string; iso: string }
  | { kind: "language"; mediaType: "movie" | "tv"; name: string; iso: string }
  | { kind: "network"; mediaType: "movie" | "tv"; name: string; id: number };

export type Frame =
  | { kind: "home" }
  | { kind: "settings" }
  | { kind: "anime" }
  | { kind: "discover" }
  | { kind: "addons" }
  | { kind: "addon-detail"; id: string }
  | { kind: "calendar" }
  | { kind: "queue" }
  | { kind: "movies" }
  | { kind: "shows" }
  | { kind: "kids" }
  | { kind: "library" }
  | { kind: "live" }
  | { kind: "vod" }
  | { kind: "downloads" }
  | { kind: "service"; service: StreamingService }
  | { kind: "meta"; meta: Meta; liveContext?: boolean; episodeHint?: { season: number; episode: number } }
  | { kind: "episode-detail"; seriesId: string; season: number; episode: number; seriesMeta?: Meta }
  | { kind: "person"; id: number }
  | { kind: "collection"; id: number }
  | { kind: "collections" }
  | { kind: "filter"; filter: MetaFilter }
  | { kind: "grid"; grid: GridSpec }
  | { kind: "award"; awardType: import("./providers/wikidata").AwardType }
  | { kind: "anime-award"; sourceId: import("./anime-awards").AwardSourceId }
  | { kind: "picker"; meta: Meta; episode?: PlayEpisode; autoPlay?: boolean; attempt?: number; intent?: "play" | "download"; resume?: boolean }
  | { kind: "player"; src: PlayerSrc }
  | { kind: "match-detail"; game: SportsGame };

export type ScrollSnapshot = {
  anchor?: string;
  delta: number;
  fallback: number;
};

export type SettingsSection =
  | "account"
  | "library"
  | "trakt"
  | "anilist"
  | "simkl"
  | "parental"
  | "relay"
  | "streaming"
  | "language"
  | "player"
  | "advanced";

type ViewValue = {
  view: View;
  setView: (v: View) => void;
  openSettings: (section?: SettingsSection) => void;
  settingsSectionRequest: { section: SettingsSection | null; nonce: number };
  topKind: Frame["kind"];
  topPath: string;
  service: StreamingService | null;
  openService: (s: StreamingService | null) => void;
  meta: Meta | null;
  metaLiveContext: boolean;
  metaEpisodeHint: { season: number; episode: number } | null;
  openMeta: (m: Meta | null, opts?: { liveContext?: boolean; episodeHint?: { season: number; episode: number } }) => void;
  episodeDetail: { seriesId: string; season: number; episode: number; seriesMeta?: Meta } | null;
  openEpisodeDetail: (seriesId: string, season: number, episode: number, seriesMeta?: Meta) => void;
  matchDetailGame: SportsGame | null;
  openMatchDetail: (game: SportsGame) => void;
  promoteMetaToRoot: () => void;
  personId: number | null;
  openPerson: (id: number | null) => void;
  collectionId: number | null;
  openCollection: (id: number) => void;
  openQueue: () => void;
  filter: MetaFilter | null;
  openFilter: (f: MetaFilter) => void;
  grid: GridSpec | null;
  openGrid: (g: GridSpec) => void;
  openCollections: () => void;
  stackKinds: Frame["kind"][];
  awardType: import("./providers/wikidata").AwardType | null;
  openAward: (t: import("./providers/wikidata").AwardType) => void;
  animeAwardSource: import("./anime-awards").AwardSourceId | null;
  openAnimeAward: (s: import("./anime-awards").AwardSourceId) => void;
  homeResetTick: number;
  picker: { meta: Meta; episode?: PlayEpisode; autoPlay?: boolean; attempt?: number; intent?: "play" | "download"; resume?: boolean } | null;
  openPicker: (
    meta: Meta,
    episode?: PlayEpisode,
    opts?: { autoPlay?: boolean; attempt?: number; intent?: "play" | "download"; resume?: boolean },
  ) => void;
  player: PlayerSrc | null;
  openPlayer: (src: PlayerSrc) => void;
  replacePlayerSrc: (src: PlayerSrc) => void;
  pendingLiveSrc: PlayerSrc | null;
  confirmLeavePartyForLive: () => void;
  cancelLeavePartyForLive: () => void;
  addonDetailId: string | null;
  openAddonDetail: (id: string) => void;
  canGoBack: boolean;
  goBack: () => void;
  canGoForward: boolean;
  goForward: () => void;
  exitPlayback: () => void;
  exitPickerToDetail: (m: Meta) => void;
  exitPlayer: () => void;
  rememberScroll: (key: string, snap: ScrollSnapshot) => void;
  recallScroll: (key: string) => ScrollSnapshot | null;
  rememberRowScroll: (key: string, scrollLeft: number) => void;
  recallRowScroll: (key: string) => number | null;
  chromeHidden: boolean;
  setChromeHidden: (b: boolean) => void;
};

const Ctx = createContext<ViewValue | null>(null);

const STACK_MAX = 30;
const SCROLL_MEM_MAX = 200;

function pushFrame(cur: Frame[], next: Frame): Frame[] {
  const out = [...cur, next];
  if (out.length <= STACK_MAX) return out;
  return [out[0], ...out.slice(out.length - STACK_MAX + 1)];
}

type NavState = { history: Frame[]; cursor: number };

/** Push a new frame: truncate any forward history, append, advance cursor. */
function pushNav(s: NavState, frame: Frame): NavState {
  const history = [...s.history.slice(0, s.cursor + 1), frame];
  if (history.length <= STACK_MAX) return { history, cursor: history.length - 1 };
  const trimmed = history.slice(history.length - STACK_MAX);
  return { history: trimmed, cursor: STACK_MAX - 1 };
}

/** Reset to a single root frame (clears all history). */
function resetNav(frame: Frame): NavState {
  return { history: [frame], cursor: 0 };
}

function frameKey(f: Frame): string {
  switch (f.kind) {
    case "home":
      return "home";
    case "settings":
      return "settings";
    case "anime":
      return "anime";
    case "discover":
      return "discover";
    case "addons":
      return "addons";
    case "addon-detail":
      return `addon-detail:${f.id}`;
    case "calendar":
      return "calendar";
    case "queue":
      return "queue";
    case "movies":
      return "movies";
    case "shows":
      return "shows";
    case "kids":
      return "kids";
    case "library":
      return "library";
    case "live":
      return "live";
    case "vod":
      return "vod";
    case "downloads":
      return "downloads";
    case "service":
      return `service:${f.service}`;
    case "meta":
      return `meta:${f.meta.id}`;
    case "episode-detail":
      return `episode-detail:${f.seriesId}:${f.season}:${f.episode}`;
    case "person":
      return `person:${f.id}`;
    case "collection":
      return `collection:${f.id}`;
    case "collections":
      return "collections";
    case "filter":
      return `filter:${f.filter.kind}:${f.filter.mediaType}:${"name" in f.filter ? f.filter.name : f.filter.value}`;
    case "grid":
      return `grid:${f.grid.title}`;
    case "award":
      return `award:${f.awardType}`;
    case "anime-award":
      return `anime-award:${f.sourceId}`;
    case "picker": {
      const a = typeof f.attempt === "number" ? `:a${f.attempt}` : "";
      return f.episode
        ? `picker:${f.meta.id}:${f.episode.season}:${f.episode.episode}${a}`
        : `picker:${f.meta.id}${a}`;
    }
    case "player":
      return `player:${f.src.meta.id}:${f.src.url.slice(-32)}`;
    case "match-detail":
      return `match-detail:${f.game.id}`;
  }
}

function syncFrameKey(f: Frame): string {
  if (f.kind === "player") {
    const id = f.src.meta.id || `local:${f.src.url.slice(-32)}`;
    const ep = f.src.episode;
    return ep ? `player:${id}:${ep.season}:${ep.episode}` : `player:${id}`;
  }
  if (f.kind === "picker") {
    return f.episode
      ? `picker:${f.meta.id}:${f.episode.season}:${f.episode.episode}`
      : `picker:${f.meta.id}`;
  }
  return frameKey(f);
}

function lastOfKind<K extends Frame["kind"]>(
  frames: Frame[],
  kind: K,
): Extract<Frame, { kind: K }> | undefined {
  for (let i = frames.length - 1; i >= 0; i--) {
    const f = frames[i];
    if (f.kind === kind) return f as Extract<Frame, { kind: K }>;
  }
  return undefined;
}

export function ViewProvider({ children }: { children: ReactNode }) {
  const [nav, setNav] = useState<NavState>({ history: [{ kind: "home" }], cursor: 0 });
  const stack = useMemo(() => nav.history.slice(0, nav.cursor + 1), [nav.history, nav.cursor]);
  const [chromeHidden, setChromeHidden] = useState(false);
  const [homeResetTick, setHomeResetTick] = useState(0);
  const scrollMem = useRef<Map<string, ScrollSnapshot>>(new Map());
  const rowScrollMem = useRef<Map<string, number>>(new Map());
  const rememberRowScroll = useCallback((k: string, scrollLeft: number) => {
    rowScrollMem.current.set(k, scrollLeft);
  }, []);
  const recallRowScroll = useCallback((k: string): number | null => {
    const v = rowScrollMem.current.get(k);
    return typeof v === "number" ? v : null;
  }, []);
  const rememberScroll = useCallback((k: string, snap: ScrollSnapshot) => {
    const m = scrollMem.current;
    m.delete(k);
    m.set(k, snap);
    while (m.size > SCROLL_MEM_MAX) {
      const oldest = m.keys().next().value;
      if (oldest === undefined) break;
      m.delete(oldest);
    }
  }, []);
  const recallScroll = useCallback((k: string): ScrollSnapshot | null => {
    const m = scrollMem.current;
    const v = m.get(k);
    if (!v) return null;
    m.delete(k);
    m.set(k, v);
    return v;
  }, []);

  const top = stack[stack.length - 1];

  const view: View = (() => {
    for (let i = stack.length - 1; i >= 0; i--) {
      const f = stack[i];
      if (f.kind === "settings") return "settings";
      if (f.kind === "anime") return "anime";
      if (f.kind === "addons" || f.kind === "addon-detail") return "addons";
      if (f.kind === "discover" || f.kind === "queue") return "discover";
      if (f.kind === "calendar") return "calendar";
      if (f.kind === "movies") return "movies";
      if (f.kind === "shows") return "shows";
      if (f.kind === "kids") return "kids";
      if (f.kind === "library") return "library";
      if (f.kind === "live") return "live";
      if (f.kind === "vod") return "vod";
      if (f.kind === "downloads") return "downloads";
      if (f.kind === "home") return "home";
    }
    return "home";
  })();
  const service = top.kind === "service" ? top.service : null;
  const metaFrame = stack.slice().reverse().find((f) => f.kind === "meta");
  const meta = metaFrame && metaFrame.kind === "meta" ? metaFrame.meta : null;
  const metaLiveContext =
    metaFrame && metaFrame.kind === "meta" ? metaFrame.liveContext === true : false;
  const metaEpisodeHint =
    metaFrame && metaFrame.kind === "meta" ? metaFrame.episodeHint ?? null : null;
  const personFrame = lastOfKind(stack, "person");
  const personId = personFrame ? personFrame.id : null;
  const collectionFrame = lastOfKind(stack, "collection");
  const collectionId = collectionFrame ? collectionFrame.id : null;
  const episodeDetail = useMemo(
    () =>
      top.kind === "episode-detail"
        ? { seriesId: top.seriesId, season: top.season, episode: top.episode, seriesMeta: top.seriesMeta }
        : null,
    [
      top.kind,
      top.kind === "episode-detail" ? top.seriesId : "",
      top.kind === "episode-detail" ? top.season : 0,
      top.kind === "episode-detail" ? top.episode : 0,
      top.kind === "episode-detail" && top.seriesMeta ? top.seriesMeta.id : "",
    ],
  );
  const filterFrame = lastOfKind(stack, "filter");
  const filter = filterFrame ? filterFrame.filter : null;
  const gridFrame = lastOfKind(stack, "grid");
  const grid = gridFrame ? gridFrame.grid : null;
  const awardType = top.kind === "award" ? top.awardType : null;
  const matchDetailGame = top.kind === "match-detail" ? top.game : null;
  const picker =
    top.kind === "picker"
      ? { meta: top.meta, episode: top.episode, autoPlay: top.autoPlay, attempt: top.attempt, intent: top.intent, resume: top.resume }
      : null;
  const player = top.kind === "player" ? top.src : null;
  const canGoBack = nav.cursor > 0;
  const canGoForward = nav.cursor < nav.history.length - 1;

  const pop = useCallback(() => {
    setNav((s) => ({ ...s, cursor: Math.max(0, s.cursor - 1) }));
  }, []);

  const goForward = useCallback(() => {
    setNav((s) => ({ ...s, cursor: Math.min(s.history.length - 1, s.cursor + 1) }));
  }, []);

  const exitPlayback = useCallback(() => {
    setNav((s) => {
      let i = s.cursor;
      while (i > 0 && (s.history[i].kind === "player" || s.history[i].kind === "picker")) i--;
      return { ...s, cursor: i };
    });
  }, []);

  const exitPickerToDetail = useCallback((m: Meta) => {
    setNav((s) => {
      let i = s.cursor;
      while (i > 0 && (s.history[i].kind === "player" || s.history[i].kind === "picker")) i--;
      const top = s.history[i];
      if (top && top.kind === "meta") return { ...s, cursor: i };
      return pushNav({ ...s, cursor: i }, { kind: "meta", meta: m });
    });
  }, []);

  const exitPlayer = useCallback(() => {
    setNav((s) => {
      let i = s.cursor;
      while (i > 0 && s.history[i].kind === "player") i--;
      const history = [...s.history];
      const top = history[i];
      if (top && top.kind === "picker" && top.autoPlay) {
        history[i] = { ...top, autoPlay: false };
      }
      return { ...s, history, cursor: i };
    });
  }, []);

  const [sectionReq, setSectionReq] = useState<{ section: SettingsSection | null; nonce: number }>({
    section: null,
    nonce: 0,
  });

  const setView = useCallback((v: View) => {
    if (typeof window !== "undefined") {
      window.__harborProfiler?.recordNav(`view:${v}`);
    }
    if (v === "home") setHomeResetTick((n) => n + 1);
    if (typeof window !== "undefined" && v !== "settings") {
      window.dispatchEvent(
        new CustomEvent("harbor:reset-row-scrolls", { detail: { prefix: `${v}:` } }),
      );
      const fireScrollTop = () =>
        window.dispatchEvent(new CustomEvent("harbor:scroll-top", { detail: { view: v } }));
      fireScrollTop();
      window.requestAnimationFrame(fireScrollTop);
      window.setTimeout(fireScrollTop, 60);
    }
    setNav((s) => {
      const t = s.history[s.cursor];
      if (v === "home") {
        scrollMem.current.clear();
        rowScrollMem.current.clear();
        return resetNav({ kind: "home" });
      }
      if (v === "anime") {
        scrollMem.current.clear();
        rowScrollMem.current.clear();
        return resetNav({ kind: "anime" });
      }
      if (v === "discover") {
        scrollMem.current.clear();
        rowScrollMem.current.clear();
        return resetNav({ kind: "discover" });
      }
      if (v === "addons") {
        scrollMem.current.clear();
        rowScrollMem.current.clear();
        return resetNav({ kind: "addons" });
      }
      if (v === "calendar") {
        scrollMem.current.clear();
        rowScrollMem.current.clear();
        return resetNav({ kind: "calendar" });
      }
      if (v === "downloads") {
        scrollMem.current.clear();
        rowScrollMem.current.clear();
        return resetNav({ kind: "downloads" });
      }
      if (v === "movies") {
        scrollMem.current.clear();
        rowScrollMem.current.clear();
        return resetNav({ kind: "movies" });
      }
      if (v === "shows") {
        scrollMem.current.clear();
        rowScrollMem.current.clear();
        return resetNav({ kind: "shows" });
      }
      if (v === "kids") {
        scrollMem.current.clear();
        rowScrollMem.current.clear();
        return resetNav({ kind: "kids" });
      }
      if (v === "library") {
        scrollMem.current.clear();
        rowScrollMem.current.clear();
        return resetNav({ kind: "library" });
      }
      if (v === "live") {
        scrollMem.current.clear();
        rowScrollMem.current.clear();
        return resetNav({ kind: "live" });
      }
      if (v === "vod") {
        scrollMem.current.clear();
        rowScrollMem.current.clear();
        return resetNav({ kind: "vod" });
      }
      if (t.kind === "settings") return s;
      return pushNav(s, { kind: "settings" });
    });
  }, []);

  const openSettings = useCallback((section?: SettingsSection) => {
    setSectionReq((r) => ({ section: section ?? null, nonce: r.nonce + 1 }));
    setNav((s) => {
      const t = s.history[s.cursor];
      if (t.kind === "settings") return s;
      return pushNav(s, { kind: "settings" });
    });
  }, []);

  const openService = useCallback((s: StreamingService | null) => {
    if (s === null) {
      setNav(() => {
        scrollMem.current.clear();
        rowScrollMem.current.clear();
        return resetNav({ kind: "home" });
      });
      return;
    }
    setNav((cur) => {
      const t = cur.history[cur.cursor];
      if (t.kind === "service" && t.service === s) return cur;
      return pushNav(cur, { kind: "service", service: s });
    });
  }, []);

  const promoteMetaToRoot = useCallback(() => {
    setNav((s) => {
      if (s.history.length === 0) return s;
      const top = s.history[s.cursor];
      if (top.kind !== "meta") return s;
      const m = top.meta;
      let root: Frame;
      if (m.type === "series" || m.type === "tv") root = { kind: "shows" };
      else if (m.type === "anime") root = { kind: "anime" };
      else root = { kind: "movies" };
      return { history: [root, { kind: "meta", meta: m }], cursor: 1 };
    });
  }, []);

  const openMeta = useCallback(
    (m: Meta | null, opts?: { liveContext?: boolean; episodeHint?: { season: number; episode: number } }) => {
      if (m === null) {
        setNav((s) => ({ ...s, cursor: Math.max(0, s.cursor - 1) }));
        return;
      }
      setNav((cur) => {
        const t = cur.history[cur.cursor];
        if (t.kind === "meta" && t.meta.id === m.id) return cur;
        trackEvent(m.id, "open", profileFromMeta(m));
        return pushNav(cur, {
          kind: "meta",
          meta: m,
          liveContext: opts?.liveContext,
          episodeHint: opts?.episodeHint,
        });
      });
    },
    [],
  );

  const openPerson = useCallback((id: number | null) => {
    if (id === null) {
      setNav((s) => ({ ...s, cursor: Math.max(0, s.cursor - 1) }));
      return;
    }
    setNav((cur) => {
      const t = cur.history[cur.cursor];
      if (t.kind === "person" && t.id === id) return cur;
      return pushNav(cur, { kind: "person", id });
    });
  }, []);

  const openQueue = useCallback(() => {
    setNav((cur) => {
      const t = cur.history[cur.cursor];
      if (t.kind === "queue") return cur;
      return pushNav(cur, { kind: "queue" });
    });
  }, []);

  const openCollection = useCallback((id: number) => {
    setNav((cur) => {
      const t = cur.history[cur.cursor];
      if (t.kind === "collection" && t.id === id) return cur;
      return pushNav(cur, { kind: "collection", id });
    });
  }, []);

  const openMatchDetail = useCallback((game: SportsGame) => {
    setNav((cur) => {
      const t = cur.history[cur.cursor];
      if (t.kind === "match-detail" && t.game.id === game.id) return cur;
      return pushNav(cur, { kind: "match-detail", game });
    });
  }, []);

  const openEpisodeDetail = useCallback(
    (seriesId: string, season: number, episode: number, seriesMeta?: Meta) => {
      setNav((cur) => {
        const t = cur.history[cur.cursor];
        if (
          t.kind === "episode-detail" &&
          t.seriesId === seriesId &&
          t.season === season &&
          t.episode === episode
        ) {
          return cur;
        }
        return pushNav(cur, { kind: "episode-detail", seriesId, season, episode, seriesMeta });
      });
    },
    [],
  );

  const openAward = useCallback((t: import("./providers/wikidata").AwardType) => {
    setNav((cur) => {
      const top = cur.history[cur.cursor];
      if (top.kind === "award" && top.awardType === t) return cur;
      return pushNav(cur, { kind: "award", awardType: t });
    });
  }, []);

  const openAnimeAward = useCallback((s: import("./anime-awards").AwardSourceId) => {
    setNav((cur) => {
      const top = cur.history[cur.cursor];
      if (top.kind === "anime-award" && top.sourceId === s) return cur;
      return pushNav(cur, { kind: "anime-award", sourceId: s });
    });
  }, []);

  const openFilter = useCallback((f: MetaFilter) => {
    setNav((cur) => {
      const t = cur.history[cur.cursor];
      if (
        t.kind === "filter" &&
        t.filter.kind === f.kind &&
        t.filter.mediaType === f.mediaType &&
        ("name" in f && "name" in t.filter ? t.filter.name === f.name : (t.filter as any).value === (f as any).value)
      ) {
        return cur;
      }
      return pushNav(cur, { kind: "filter", filter: f });
    });
  }, []);

  const openGrid = useCallback((g: GridSpec) => {
    setNav((cur) => {
      const t = cur.history[cur.cursor];
      if (t.kind === "grid" && t.grid.title === g.title) return cur;
      return pushNav(cur, { kind: "grid", grid: g });
    });
  }, []);

  const openCollections = useCallback(() => {
    setNav((cur) => {
      const t = cur.history[cur.cursor];
      if (t.kind === "collections") return cur;
      return pushNav(cur, { kind: "collections" });
    });
  }, []);

  const openPicker = useCallback(
    (m: Meta, ep?: PlayEpisode, opts?: { autoPlay?: boolean; attempt?: number; intent?: "play" | "download"; resume?: boolean }) => {
      if (opts?.autoPlay && getWindowFullscreen()) suppressFullscreenExitOnce();
      setNav((cur) => {
        const t = cur.history[cur.cursor];
        if (
          t.kind === "picker" &&
          t.meta.id === m.id &&
          (t.attempt ?? 0) === (opts?.attempt ?? 0) &&
          (t.intent ?? "play") === (opts?.intent ?? "play")
        ) {
          return cur;
        }
        return pushNav(cur, {
          kind: "picker",
          meta: m,
          episode: ep,
          autoPlay: opts?.autoPlay,
          attempt: opts?.attempt,
          intent: opts?.intent,
          resume: opts?.resume,
        });
      });
    },
    [],
  );

  const together = useTogether();
  const togetherRef = useRef(together);
  togetherRef.current = together;
  const [pendingLiveSrc, setPendingLiveSrc] = useState<PlayerSrc | null>(null);
  const pendingLiveSrcRef = useRef<PlayerSrc | null>(null);
  pendingLiveSrcRef.current = pendingLiveSrc;

  const openPlayer = useCallback((src: PlayerSrc) => {
    if (src.meta.id?.startsWith("iptv:") && togetherRef.current.snapshot.state === "joined") {
      setPendingLiveSrc(src);
      return;
    }
    setNav((cur) => pushNav(cur, { kind: "player", src }));
  }, []);

  const confirmLeavePartyForLive = useCallback(() => {
    const src = pendingLiveSrcRef.current;
    setPendingLiveSrc(null);
    if (!src) return;
    togetherRef.current.leaveSession();
    setNav((cur) => pushNav(cur, { kind: "player", src }));
  }, []);

  const cancelLeavePartyForLive = useCallback(() => setPendingLiveSrc(null), []);

  const replacePlayerSrc = useCallback((src: PlayerSrc) => {
    setNav((s) => {
      const top = s.history[s.cursor];
      if (top.kind !== "player") return s;
      const history = [...s.history];
      history[s.cursor] = { kind: "player", src };
      return { ...s, history };
    });
  }, []);

  const openAddonDetail = useCallback((id: string) => {
    setNav((cur) => {
      const top = cur.history[cur.cursor];
      if (top.kind === "addon-detail" && top.id === id) return cur;
      if (top.kind === "addon-detail") {
        const history = [...cur.history];
        history[cur.cursor] = { kind: "addon-detail", id };
        return { ...cur, history };
      }
      return pushNav(cur, { kind: "addon-detail", id });
    });
  }, []);

  const addonDetailId = top.kind === "addon-detail" ? top.id : null;

  const topPath = useMemo(() => syncFrameKey(top), [top]);

  const stackKinds = useMemo(() => stack.map((f) => f.kind), [stack]);

  const value = useMemo(
    () => ({
      view,
      setView,
      openSettings,
      settingsSectionRequest: sectionReq,
      topKind: top.kind,
      topPath,
      service,
      openService,
      meta,
      metaLiveContext,
      metaEpisodeHint,
      openMeta,
      promoteMetaToRoot,
      personId,
      openPerson,
      collectionId,
      openCollection,
      episodeDetail,
      openEpisodeDetail,
      matchDetailGame,
      openMatchDetail,
      openQueue,
      filter,
      openFilter,
      grid,
      openGrid,
      openCollections,
      stackKinds,
      awardType,
      openAward,
      animeAwardSource: top.kind === "anime-award" ? top.sourceId : null,
      openAnimeAward,
      homeResetTick,
      picker,
      openPicker,
      player,
      openPlayer,
      replacePlayerSrc,
      pendingLiveSrc,
      confirmLeavePartyForLive,
      cancelLeavePartyForLive,
      addonDetailId,
      openAddonDetail,
      canGoBack,
      goBack: pop,
      canGoForward,
      goForward,
      exitPlayback,
      exitPickerToDetail,
      exitPlayer,
      rememberScroll,
      recallScroll,
      rememberRowScroll,
      recallRowScroll,
      chromeHidden,
      setChromeHidden,
    }),
    [
      view,
      top.kind,
      topPath,
      service,
      meta,
      metaLiveContext,
      metaEpisodeHint,
      promoteMetaToRoot,
      personId,
      collectionId,
      openCollection,
      episodeDetail,
      openEpisodeDetail,
      matchDetailGame,
      openMatchDetail,
      filter,
      stackKinds,
      awardType,
      homeResetTick,
      picker,
      player,
      canGoBack,
      canGoForward,
      setView,
      openSettings,
      sectionReq,
      openService,
      openMeta,
      openPerson,
      openQueue,
      openFilter,
      grid,
      openGrid,
      openCollections,
      openAward,
      openAnimeAward,
      openPicker,
      openPlayer,
      replacePlayerSrc,
      pendingLiveSrc,
      confirmLeavePartyForLive,
      cancelLeavePartyForLive,
      pop,
      goForward,
      exitPlayback,
      exitPickerToDetail,
      exitPlayer,
      rememberScroll,
      recallScroll,
      chromeHidden,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useView() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useView outside ViewProvider");
  return v;
}

function anchorOffsetIn(scrollEl: HTMLElement, anchor: HTMLElement): number {
  return anchor.getBoundingClientRect().top - scrollEl.getBoundingClientRect().top + scrollEl.scrollTop;
}

function pickAnchor(el: HTMLElement, scrollTop: number): { key: string; delta: number } | null {
  const anchors = el.querySelectorAll<HTMLElement>("[data-scroll-anchor]");
  if (anchors.length === 0) return null;
  let best: { key: string; offset: number } | null = null;
  for (const a of anchors) {
    const k = a.dataset.scrollAnchor;
    if (!k) continue;
    const off = anchorOffsetIn(el, a);
    if (off > scrollTop + 1) continue;
    if (!best || off > best.offset) best = { key: k, offset: off };
  }
  if (!best) {
    const first = anchors[0];
    const k = first.dataset.scrollAnchor;
    if (!k) return null;
    return { key: k, delta: scrollTop - anchorOffsetIn(el, first) };
  }
  return { key: best.key, delta: scrollTop - best.offset };
}

function targetForSnap(el: HTMLElement, snap: ScrollSnapshot): number | null {
  if (snap.anchor) {
    const sel = `[data-scroll-anchor="${CSS.escape(snap.anchor)}"]`;
    const anchorEl = el.querySelector<HTMLElement>(sel);
    if (anchorEl) return Math.max(0, anchorOffsetIn(el, anchorEl) + snap.delta);
  }
  return snap.fallback >= 0 ? snap.fallback : null;
}

export function useScrollMemory(
  key: string,
  ref: RefObject<HTMLElement | null>,
  active: boolean = true,
) {
  const { rememberScroll, recallScroll } = useView();

  useEffect(() => {
    const onReset = (e: Event) => {
      const detail = (e as CustomEvent<{ view?: string }>).detail;
      if (!detail?.view) return;
      if (detail.view !== key) return;
      const el = ref.current;
      if (!el) return;
      el.scrollTo({ top: 0, left: 0, behavior: "auto" });
    };
    window.addEventListener("harbor:scroll-top", onReset);
    return () => window.removeEventListener("harbor:scroll-top", onReset);
  }, [key, ref]);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !active) return;

    let restoring = true;
    let settleId: number | null = null;
    let saveTimer: number | null = null;

    const cancelSettle = () => {
      if (settleId !== null) {
        clearTimeout(settleId);
        settleId = null;
      }
    };

    const tryRestore = () => {
      if (!restoring) return;
      const snap = recallScroll(key);
      if (!snap) {
        restoring = false;
        cancelSettle();
        return;
      }
      if (el.clientHeight === 0) return;
      const target = targetForSnap(el, snap);
      if (target === null) {
        restoring = false;
        cancelSettle();
        return;
      }
      const max = el.scrollHeight - el.clientHeight;
      if (max < target - 4) return;
      el.scrollTop = Math.min(target, max);
      restoring = false;
      cancelSettle();
    };

    settleId = window.setTimeout(() => {
      restoring = false;
      settleId = null;
    }, 30000);

    tryRestore();

    const ro = new ResizeObserver(tryRestore);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);

    const saveNow = () => {
      if (el.clientHeight === 0) return;
      const top = el.scrollTop;
      const found = pickAnchor(el, top);
      rememberScroll(key, {
        anchor: found?.key,
        delta: found?.delta ?? 0,
        fallback: top,
      });
    };

    const cancelSave = () => {
      if (saveTimer !== null) {
        clearTimeout(saveTimer);
        saveTimer = null;
      }
    };

    const onScroll = () => {
      if (restoring) return;
      if (el.clientHeight === 0) return;
      cancelSave();
      saveTimer = window.setTimeout(() => {
        saveTimer = null;
        saveNow();
      }, 200);
    };
    el.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelSave();
      cancelSettle();
      ro.disconnect();
      el.removeEventListener("scroll", onScroll);
      if (!restoring && el.clientHeight > 0 && el.scrollTop > 0) saveNow();
    };
  }, [active, key, ref, rememberScroll, recallScroll]);
}

export { frameKey };
