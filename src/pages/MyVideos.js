import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/common.css';

const MyVideos = () => {
  const [videos, setVideos] = useState([]);
  const [selectedUrl, setSelectedUrl] = useState('');
  const auth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthAndFetchVideos = async () => {
      const user = auth.currentUser;
      if (!user) {
        // Si no hay usuario autenticado, redirigir al login
        navigate('/');
        return;
      }
      fetchVideos(user.uid);
    };

    checkAuthAndFetchVideos();
  }, [navigate]);

  const fetchVideos = async (userId) => {
    try {
      // Crear una consulta que filtre por userId
      const videosQuery = query(
        collection(db, 'videos'),
        where('userId', '==', userId)
      );

      const querySnapshot = await getDocs(videosQuery);
      const videoList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setVideos(videoList);
    } catch (error) {
      console.error('Error al obtener los videos:', error);
      alert('Error al cargar los videos. Por favor, intenta de nuevo.');
    }
  };

  const getEmbedUrl = (url) => {
    try {
      if (!url) return '';
      
      // Manejar URLs de YouTube
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        let videoId = '';
        
        if (url.includes('youtube.com/watch')) {
          const urlParams = new URLSearchParams(new URL(url).search);
          videoId = urlParams.get('v');
        } else if (url.includes('youtu.be')) {
          videoId = url.split('youtu.be/')[1].split('?')[0];
        }
        
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      }
      
      // Manejar URLs de Instagram
      if (url.includes('instagram.com')) {
        if (url.includes('/p/') || url.includes('/reel/')) {
          // Convertir la URL a formato embed
          const postId = url.split('/p/')[1]?.split('/')[0] || url.split('/reel/')[1]?.split('/')[0];
          return `https://www.instagram.com/p/${postId}/embed`;
        }
      }
      
      return url;
    } catch (error) {
      console.error('Error al procesar la URL:', error);
      return url;
    }
  };

  const handlePlayVideo = (url) => {
    setSelectedUrl(url);
  };

  const handleCloseVideo = () => {
    setSelectedUrl('');
  };

  const VideoPlayer = ({ url, onClose }) => {
    const embedUrl = getEmbedUrl(url);
    
    return (
      <div className="video-player" style={{
        background: '#000',
        padding: '2rem',
        borderRadius: '15px',
        position: 'relative',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
      }}>
        <button 
          onClick={onClose}
          className="btn btn-danger"
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            zIndex: 10,
            padding: '0.5rem 1rem',
            borderRadius: '50px'
          }}
        >
          Cerrar
        </button>
        <iframe
          title="video-player"
          width="100%"
          height="600px"
          src={embedUrl}
          frameBorder="0"
          allowFullScreen
          style={{ borderRadius: '10px' }}
        />
      </div>
    );
  };

  return (
    <div>
      <Navbar />
      <div className="container">
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ 
            textAlign: 'center', 
            color: '#333',
            marginBottom: '2rem',
            fontSize: '2.5rem',
            fontWeight: '600',
            borderBottom: '3px solid #4CAF50',
            paddingBottom: '1rem'
          }}>
            Mi Biblioteca de Videos
          </h1>

          {selectedUrl ? (
            <VideoPlayer url={selectedUrl} onClose={handleCloseVideo} />
          ) : (
            <div className="video-grid">
              {videos.map((item) => (
                <div 
                  key={item.id} 
                  className="card" 
                  style={{
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    position: 'relative',
                    border: 'none',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 6px 20px rgba(0,0,0,0.15)'
                    }
                  }}
                  onClick={() => handlePlayVideo(item.url)}
                >
                  <div style={{
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: '10px',
                    marginBottom: '1rem'
                  }}>
                    <img 
                      src={item.thumbnail} 
                      alt="Video Thumbnail" 
                      style={{
                        width: '100%',
                        height: '200px',
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.05)'
                        }
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      borderRadius: '50%',
                      width: '50px',
                      height: '50px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                      '&:hover': {
                        opacity: 1
                      }
                    }}>
                      <span style={{ color: 'white', fontSize: '24px' }}>▶</span>
                    </div>
                  </div>

                  <h3 style={{ 
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                    color: '#333',
                    lineHeight: '1.4'
                  }}>
                    {item.title}
                  </h3>

                  <p style={{ 
                    color: '#666',
                    fontSize: '0.9rem',
                    marginBottom: '1rem',
                    height: '40px',
                    overflow: 'hidden',
                    lineHeight: '1.4'
                  }}>
                    {item.description}
                  </p>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 'auto'
                  }}>
                    <span style={{ 
                      backgroundColor: item.platform === 'Instagram' ? '#E1306C' : '#FF0000',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: '500'
                    }}>
                      {item.platform}
                    </span>
                    <span style={{ 
                      color: '#666', 
                      fontSize: '0.8rem',
                      fontStyle: 'italic'
                    }}>
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {videos.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: '#666',
              backgroundColor: '#f9f9f9',
              borderRadius: '10px',
              marginTop: '2rem'
            }}>
              <h3>No hay videos en tu biblioteca</h3>
              <p>¡Comienza añadiendo algunos videos!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyVideos; 