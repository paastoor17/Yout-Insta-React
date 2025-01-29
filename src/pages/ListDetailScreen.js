// src/pages/ListDetailPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig'; // Asegúrate de tener la configuración de Firebase
import { collection, query, where, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { FaPlay, FaTrash } from 'react-icons/fa';
import { Modal } from 'react-bootstrap'; // Opcional, si quieres usar un modal
import 'bootstrap/dist/css/bootstrap.min.css'; // Para el modal si lo usas

const ListDetailPage = () => {
  const [videos, setVideos] = useState([]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState('');
  const auth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (userId) {
      const q = query(collection(db, 'videos'), where('userId', '==', userId));

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const videoList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setVideos(videoList);
      });

      return () => unsubscribe();
    }
  }, [auth.currentUser?.uid]);

  const handlePlayVideo = (url) => {
    setSelectedUrl(url);
    setIsFullScreen(true);
  };

  const handleCloseFullScreen = () => {
    setIsFullScreen(false);
    setSelectedUrl('');
  };

  const handleDeleteVideo = (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este video?")) {
      try {
        deleteDoc(doc(db, 'videos', id));
      } catch (error) {
        console.error('Error eliminando el video: ', error.message);
      }
    }
  };

  return (
    <div className="container mt-4">
      {isFullScreen ? (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000' }}>
          <button
            onClick={handleCloseFullScreen}
            style={{ position: 'absolute', top: 20, right: 20, zIndex: 10, backgroundColor: 'rgba(255, 255, 255, 0.3)', borderRadius: '50%' }}
            className="btn btn-light"
          >
            X
          </button>
          <iframe
            title="Video Fullscreen"
            src={selectedUrl}
            style={{ width: '100%', height: '100%' }}
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
          ></iframe>
        </div>
      ) : (
        <div>
          {videos.map((video) => (
            <div key={video.id} className="video-item mb-4 p-3 bg-white rounded shadow">
              <img src={video.thumbnail} alt={video.title} className="img-fluid mb-3 rounded" style={{ height: 200 }} />
              <h5>{video.title}</h5>
              <p>{video.description}</p>
              <div className="d-flex justify-content-between">
                <button className="btn btn-primary" onClick={() => handlePlayVideo(video.url)}>
                  <FaPlay /> Play
                </button>
                <button className="btn btn-danger" onClick={() => handleDeleteVideo(video.id)}>
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Botón para regresar */}
      <button className="btn btn-secondary mt-4" onClick={() => navigate(-1)}>
        Go Back
      </button>
    </div>
  );
};

export default ListDetailPage;
