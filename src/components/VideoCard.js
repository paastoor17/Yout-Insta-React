import React from 'react';

const VideoCard = ({ video }) => {
  return (
    <div>
      <h3>{video.title}</h3>
      <p>{video.description}</p>
      <button onClick={() => window.open(video.url, '_blank')}>Ver en YouTube</button>
    </div>
  );
};

export default VideoCard;
