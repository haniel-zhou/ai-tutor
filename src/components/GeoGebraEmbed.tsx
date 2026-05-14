'use client';

import { useState } from 'react';

interface GeoGebraEmbedProps {
  url?: string;
  activityId?: string;
  title?: string;
}

export default function GeoGebraEmbed({ url, activityId, title = 'GeoGebra' }: GeoGebraEmbedProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // GeoGebra Classic app URL format
  const defaultUrl = activityId
    ? `https://www.geogebra.org/classic/${activityId}`
    : 'https://www.geogebra.org/classic';

  const embedUrl = url || defaultUrl;

  return (
    <div className="border rounded-xl overflow-hidden bg-white">
      <div className="bg-gray-100 px-4 py-2 flex items-center justify-between">
        <span className="font-medium text-gray-700">{title}</span>
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="px-3 py-1 text-sm bg-white border rounded hover:bg-gray-50 transition"
        >
          {isFullscreen ? '退出全屏' : '全屏'}
        </button>
      </div>
      <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'h-[500px]'}`}>
        <iframe
          src={embedUrl}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={title}
        />
      </div>
      <div className="bg-gray-50 px-4 py-2 text-sm text-gray-500">
        使用 GeoGebra 探索这个概念。拖动点或滑块来观察变化。
      </div>
    </div>
  );
}