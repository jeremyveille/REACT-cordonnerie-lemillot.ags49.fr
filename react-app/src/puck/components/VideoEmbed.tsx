import React from 'react';

export interface VideoEmbedProps {
  id?: string;
  url: string;
  title?: string;
  aspectRatio?: '16/9' | '4/3';
  autoplay?: boolean;
}

export const VideoEmbed: React.FC<VideoEmbedProps> = ({
  url,
  title = 'Vidéo Cordonnerie Le Millot',
  aspectRatio = '16/9',
  autoplay = false,
}) => {
  // Convert URL to embed URL if standard YouTube or Vimeo URL
  let embedUrl = url;
  let isDirectVideo = false;

  if (url) {
    if (url.includes('youtube.com/watch')) {
      const videoId = new URL(url).searchParams.get('v');
      embedUrl = `https://www.youtube.com/embed/${videoId}${autoplay ? '?autoplay=1' : ''}`;
    } else if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}${autoplay ? '?autoplay=1' : ''}`;
    } else if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      embedUrl = `https://player.vimeo.com/video/${videoId}${autoplay ? '?autoplay=1' : ''}`;
    } else if (url.endsWith('.mp4') || url.endsWith('.webm')) {
      isDirectVideo = true;
    }
  }

  return (
    <div className="puck-video-embed" style={{ margin: '2rem 0', width: '100%' }}>
      <div
        className="video-responsive-frame"
        style={{
          width: '100%',
          aspectRatio: aspectRatio === '4/3' ? '4 / 3' : '16 / 9',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: 'var(--cordo-shadow)',
          border: '2px solid var(--cordo-chocolate)',
          backgroundColor: '#000',
        }}
      >
        {isDirectVideo ? (
          <video
            src={url}
            controls
            autoPlay={autoplay}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          >
            Votre navigateur ne supporte pas la lecture de vidéos HTML5.
          </video>
        ) : (
          <iframe
            src={embedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{
              width: '100%',
              height: '100%',
              border: 0,
              display: 'block',
            }}
          />
        )}
      </div>
      {title && (
        <p
          style={{
            textAlign: 'center',
            fontSize: '0.9rem',
            color: 'var(--cordo-muted)',
            marginTop: '0.75rem',
            fontStyle: 'italic',
          }}
        >
          {title}
        </p>
      )}
    </div>
  );
};

export default VideoEmbed;
