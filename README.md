# @im03/react-hls-player

A lightweight, TypeScript-first React component for playing HLS (HTTP Live Streaming) video streams. Built on top of [hls.js](https://github.com/video-dev/hls.js) with full support for React 18 and 19.

---

## Features

- Native HLS playback via hls.js with automatic fallback for browsers that support HLS natively (Safari)
- Written in TypeScript with full type exports
- Configurable hls.js options via `hlsConfig` prop
- Automatic error recovery for network and media errors
- Supports `playerRef` for direct access to the underlying `<video>` element
- Compatible with React 18 and 19
- Zero wrapper overhead — renders a plain `<video>` element

---

## Installation

```bash
npm install @im03/react-hls-player
```

```bash
yarn add @im03/react-hls-player
```

```bash
pnpm add @im03/react-hls-player
```

> **Peer dependencies**: This package requires `react` and `react-dom` (v18 or v19) to be installed in your project.

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

| Prop        | Type                                          | Default             | Description                                                                                   |
| ----------- | --------------------------------------------- | ------------------- | --------------------------------------------------------------------------------------------- |
| `src`       | `string`                                      | **Required**        | The URL of the HLS stream (`.m3u8` manifest).                                                 |
| `playerRef` | `RefObject<HTMLVideoElement>`                 | `React.createRef()` | Ref to the underlying `<video>` element. Use this for programmatic control.                   |
| `hlsConfig` | `HlsConfig`                                   | `{}`                | Partial hls.js configuration object. See [HlsConfig](#hlsconfig) for available options.       |
| `autoPlay`  | `boolean`                                     | `false`             | Whether to start playback automatically. May be blocked by browsers without user interaction. |
| `muted`     | `boolean`                                     | `true`              | Whether the video is muted. Set to `false` to enable audio.                                   |
| `poster`    | `string`                                      | `undefined`         | URL of a poster image shown before the video plays.                                           |
| `className` | `string`                                      | `""`                | Additional CSS class name(s). The element always includes `react-hls-player` as a base class. |
| `...props`  | `React.VideoHTMLAttributes<HTMLVideoElement>` | —                   | Any valid HTML `<video>` attribute is forwarded to the underlying element.                    |

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

### Controlling the player programmatically

Pass a ref via `playerRef` to access the native `HTMLVideoElement` and call methods like `.play()`, `.pause()`, or read properties like `.currentTime`.

```tsx
import { useRef } from "react";
import { ReactHlsPlayer } from "@im03/react-hls-player";

export default function Player() {
  const playerRef = useRef<HTMLVideoElement>(null);

  const handlePause = () => {
    playerRef.current?.pause();
  };

  const handlePlay = () => {
    playerRef.current?.play();
  };

  return (
    <>
      <ReactHlsPlayer
        src="https://example.com/stream.m3u8"
        playerRef={playerRef}
        muted={true}
      />
      <button onClick={handlePlay}>Play</button>
      <button onClick={handlePause}>Pause</button>
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

- **Network errors** — calls `hls.startLoad()` to retry the stream.
- **Media errors** — calls `hls.recoverMediaError()` to attempt recovery.
- **Fatal unrecoverable errors** — reinitializes the player from scratch.

All errors are logged to the console via `console.error`.

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

You can also pass additional classes via the `className`.

---

## TypeScript

All types are exported from the package entry point.

```ts
import type { ReactHlsPlayerProps, HlsConfig } from "@im03/react-hls-player";
```

---

## License

MIT — [Ishant Mishra](https://github.com/ishantmishra03)
