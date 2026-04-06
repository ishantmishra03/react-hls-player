import React from "react";
import { ReactHlsPlayer } from "@im03/react-hls-player";

const App: React.FC = () => {
  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="w-full max-w-2xl">
        <h1 className="text-xl mb-4 text-center">HLS Player Example</h1>
        <ReactHlsPlayer
          src="http://content.jwplatform.com/manifests/vM7nH0Kl.m3u8"
          autoPlay={false}
          controls
          width="100%"
          height={360}
          className="rounded-lg"
          poster="https://upload.wikimedia.org/wikipedia/commons/7/7c/Aspect_ratio_16_9_example.jpg"
        />
      </div>
    </div>
  );
};

export default App;
