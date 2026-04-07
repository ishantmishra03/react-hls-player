# @im03/react-hls-player

A lightweight, TypeScript-first React component for playing HLS (HTTP Live Streaming) video streams. Built on top of [hls.js](https://github.com/video-dev/hls.js) with full support for React 18 and 19.

---

## Features

- Native HLS playback via hls.js with automatic fallback for browsers that support HLS natively (Safari)
- Written in TypeScript with full type exports
- Configurable hls.js options via `hlsConfig` prop
- Built-in `preset` system for tuning buffer behavior (`performance`, `balanced`, `quality`)
- Automatic error recovery with exponential backoff retry for network errors
- Imperative handle ref (`ReactHlsPlayerRef`) for programmatic control: play, pause, seek, volume, quality level
- Supports `playerRef` for direct access to the underlying `<video>` element
- Callback props for player lifecycle events: `onReady`, `onPlay`, `onPause`, `onEnded`, `onError`, `onLevelsLoaded`
- Compatible with React 18 and 19
- Zero wrapper overhead — renders a plain `<video>` element

---

## Installation

```bash
npm install @im03/react-hls-player hls.js
```

```bash
yarn add @im03/react-hls-player hls.js
```

```bash
pnpm add @im03/react-hls-player hls.js
```

> **Peer dependencies**: This package requires `react` and `react-dom` (v18 or v19) and `hls.js` to be installed in your project.

---

## Basic Usage

```tsx
import { ReactHlsPlayer } from "@im03/react-hls-player";

export default function App() {
  return (
    <ReactHlsPlayer
      src="http://content.jwplatform.com/manifests/vM7nH0Kl.m3u8"
      autoPlay={false}
      muted={false}
    />
  );
}
```

---

## Props

| Prop              | Type                                          | Default      | Description                                                                                   |
| ----------------- | --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------- |
| `src`             | `string`                                      | **Required** | The URL of the HLS stream (`.m3u8` manifest).                                                 |
| `playerRef`       | `RefObject<HTMLVideoElement>`                 | —            | Ref to the underlying `<video>` element. Use this for programmatic control.                   |
| `hlsConfig`       | `HlsConfig`                                   | `{}`         | Partial hls.js configuration object. See [HlsConfig](#hlsconfig) for available options.       |
| `preset`          | `"performance" \| "balanced" \| "quality"`   | `"balanced"` | Buffer preset. See [Presets](#presets) for details.                                           |
| `autoPlay`        | `boolean`                                     | `false`      | Whether to start playback automatically. May be blocked by browsers without user interaction. |
| `muted`           | `boolean`                                     | `true`       | Whether the video is muted. Set to `false` to enable audio.                                   |
| `poster`          | `string`                                      | `undefined`  | URL of a poster image shown before the video plays.                                           |
| `className`       | `string`                                      | `""`         | Additional CSS class name(s). The element always includes `react-hls-player` as a base class. |
| `onReady`         | `() => void`                                  | —            | Called when the manifest is parsed and the player is ready.                                   |
| `onPlay`          | `() => void`                                  | —            | Called when playback starts.                                                                  |
| `onPause`         | `() => void`                                  | —            | Called when playback is paused.                                                               |
| `onEnded`         | `() => void`                                  | —            | Called when the video ends.                                                                   |
| `onError`         | `(error: unknown) => void`                    | —            | Called on any hls.js error (fatal or not).                                                    |
| `onLevelsLoaded`  | `(levels: string[]) => void`                  | —            | Called with a list of human-readable resolution labels (e.g. `["360p", "720p", "1080p"]`) when the manifest is parsed. |
| `...props`        | `React.VideoHTMLAttributes<HTMLVideoElement>` | —            | Any valid HTML `<video>` attribute is forwarded to the underlying element.                    |

---

## Presets

The `preset` prop provides opinionated buffer configuration shortcuts. You can still override any value via `hlsConfig`.

| Preset        | Description                                                                 |
| ------------- | --------------------------------------------------------------------------- |
| `performance` | Small buffer (`maxBufferLength: 10`, `maxMaxBufferLength: 20`). Best for low-memory or mobile environments. |
| `balanced`    | hls.js defaults. Suitable for most use cases.                               |
| `quality`     | Large buffer (`maxBufferLength: 60`, `maxMaxBufferLength: 120`). Best for VOD where smooth, uninterrupted playback is preferred. |

```tsx
<ReactHlsPlayer
  src="https://example.com/stream.m3u8"
  preset="quality"
  muted={true}
/>
```

---

## Imperative Handle (ReactHlsPlayerRef)

Pass a `ref` directly to `<ReactHlsPlayer>` to get access to imperative controls. This is separate from `playerRef` (which gives access to the raw `<video>` element).

```ts
interface ReactHlsPlayerRef {
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;   // 0.0 – 1.0
  setQuality: (level: number) => void;   // hls.js level index; -1 for auto
}
```

```tsx
import { useRef } from "react";
import { ReactHlsPlayer, ReactHlsPlayerRef } from "@im03/react-hls-player";

export default function Player() {
  const controlRef = useRef<ReactHlsPlayerRef>(null);

  return (
    <>
      <ReactHlsPlayer
        ref={controlRef}
        src="https://example.com/stream.m3u8"
        muted={true}
      />
      <button onClick={() => controlRef.current?.play()}>Play</button>
      <button onClick={() => controlRef.current?.pause()}>Pause</button>
      <button onClick={() => controlRef.current?.seek(30)}>Skip to 0:30</button>
      <button onClick={() => controlRef.current?.setVolume(0.5)}>50% Volume</button>
      <button onClick={() => controlRef.current?.setQuality(0)}>Lowest Quality</button>
    </>
  );
}
```

---

## HlsConfig

The `hlsConfig` prop accepts a partial configuration object for hls.js. All fields are optional.

```ts
type HlsConfig = Partial<{
  autoStartLoad: boolean;
  startPosition: number;
  debug: boolean;
  enableWorker: boolean;
  lowLatencyMode: boolean;
  maxBufferLength: number;
  maxMaxBufferLength: number;
  maxBufferSize: number;
  capLevelToPlayerSize: boolean;
  abrEwmaFastLive: number;
  abrEwmaSlowLive: number;
  abrEwmaFastVoD: number;
  abrEwmaSlowVoD: number;
  enableCEA708Captions: boolean;
  enableWebVTT: boolean;
}>;
```

For the full list of hls.js configuration options, refer to the [hls.js API documentation](https://github.com/video-dev/hls.js/blob/master/docs/API.md#fine-tuning).

---

## Examples

### Autoplay with sound

Note that most browsers block autoplay with audio unless the user has interacted with the page. If autoplay is blocked, a warning is logged to the console instead of throwing an error.

```tsx
<ReactHlsPlayer
  src="https://example.com/stream.m3u8"
  autoPlay={true}
  muted={false}
/>
```

### With a poster image

```tsx
<ReactHlsPlayer
  src="http://content.jwplatform.com/manifests/vM7nH0Kl.m3u8"
  poster="https://upload.wikimedia.org/wikipedia/commons/7/7c/Aspect_ratio_16_9_example.jpg"
  muted={true}
/>
```

### Quality switcher using `onLevelsLoaded`

`onLevelsLoaded` receives a list of resolution labels derived from the manifest, such as `["360p", "720p", "1080p"]`. Use this alongside `setQuality` on the imperative ref to build a quality selector.

```tsx
import { useRef, useState } from "react";
import { ReactHlsPlayer, ReactHlsPlayerRef } from "@im03/react-hls-player";

export default function Player() {
  const controlRef = useRef<ReactHlsPlayerRef>(null);
  const [levels, setLevels] = useState<string[]>([]);

  return (
    <>
      <ReactHlsPlayer
        ref={controlRef}
        src="https://example.com/stream.m3u8"
        muted={true}
        onLevelsLoaded={setLevels}
      />
      <select onChange={(e) => controlRef.current?.setQuality(Number(e.target.value))}>
        <option value={-1}>Auto</option>
        {levels.map((label, i) => (
          <option key={i} value={i}>{label}</option>
        ))}
      </select>
    </>
  );
}
```

### Lifecycle callbacks

```tsx
<ReactHlsPlayer
  src="https://example.com/stream.m3u8"
  muted={true}
  onReady={() => console.log("Player ready")}
  onPlay={() => console.log("Playing")}
  onPause={() => console.log("Paused")}
  onEnded={() => console.log("Ended")}
  onError={(err) => console.error("HLS error", err)}
  onLevelsLoaded={(levels) => console.log("Available qualities:", levels)}
/>
```

### Controlling the player via `playerRef`

Pass a ref via `playerRef` to access the native `HTMLVideoElement` directly.

```tsx
import { useRef } from "react";
import { ReactHlsPlayer } from "@im03/react-hls-player";

export default function Player() {
  const playerRef = useRef<HTMLVideoElement>(null);

  return (
    <>
      <ReactHlsPlayer
        src="https://example.com/stream.m3u8"
        playerRef={playerRef}
        muted={true}
      />
      <button onClick={() => playerRef.current?.play()}>Play</button>
      <button onClick={() => playerRef.current?.pause()}>Pause</button>
    </>
  );
}
```

### Custom hls.js configuration

```tsx
<ReactHlsPlayer
  src="https://example.com/stream.m3u8"
  hlsConfig={{
    lowLatencyMode: true,
    maxBufferLength: 30,
    capLevelToPlayerSize: true,
    debug: false,
  }}
  muted={true}
/>
```

### Low-latency live stream

```tsx
<ReactHlsPlayer
  src="https://example.com/live.m3u8"
  autoPlay={true}
  muted={true}
  preset="performance"
  hlsConfig={{
    lowLatencyMode: true,
    enableWorker: true,
    abrEwmaFastLive: 3,
    abrEwmaSlowLive: 9,
  }}
/>
```

### Forwarding native video attributes

Any standard HTML `<video>` attribute not listed in the props table is forwarded directly to the video element.

```tsx
<ReactHlsPlayer
  src="https://example.com/stream.m3u8"
  muted={true}
  width={1280}
  height={720}
  style={{ borderRadius: "8px" }}
  aria-label="Live stream player"
/>
```

---

## Browser Support

| Browser        | HLS Support                 |
| -------------- | --------------------------- |
| Chrome         | via hls.js                  |
| Firefox        | via hls.js                  |
| Safari         | Native (hls.js is bypassed) |
| Edge           | via hls.js                  |
| Mobile Safari  | Native (hls.js is bypassed) |
| Android Chrome | via hls.js                  |

When a browser supports HLS natively (e.g., Safari), the component sets the `src` attribute directly on the `<video>` element and skips hls.js entirely.

---

## Error Handling

The component handles hls.js errors automatically:

- **Network errors** — retries up to 3 times using `hls.startLoad()`, with an increasing delay between each attempt (1s, 2s, 3s).
- **Media errors** — calls `hls.recoverMediaError()` to attempt recovery.
- **Fatal unrecoverable errors** — destroys and reinitializes the player from scratch.

All errors are also surfaced via the `onError` callback if provided.

---

## Styling

The rendered `<video>` element always has the class `react-hls-player`. You can target it in your stylesheet:

```css
.react-hls-player {
  width: 100%;
  height: auto;
  display: block;
}
```

You can also pass additional classes via the `className` prop.

---

## TypeScript

All types are exported from the package entry point.

```ts
import type {
  ReactHlsPlayerProps,
  ReactHlsPlayerRef,
  HlsConfig,
  PlayerPreset,
} from "@im03/react-hls-player";
```

---

## License

MIT — [Ishant Mishra](https://github.com/ishantmishra03)