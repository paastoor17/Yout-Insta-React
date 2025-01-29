import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/common.css';

const AddVideoScreen = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [isInstagram, setIsInstagram] = useState(false);
  const [lists, setLists] = useState([]);
  const [selectedList, setSelectedList] = useState('');
  const [showNewList, setShowNewList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const auth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    const userId = auth.currentUser?.uid;
    if (userId) {
      const q = query(collection(db, 'lists'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const listsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLists(listsData);
    }
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) {
      alert('Por favor, ingresa un nombre para la lista');
      return;
    }

    try {
      const userId = auth.currentUser?.uid;
      await addDoc(collection(db, 'lists'), {
        userId,
        title: newListName,
        videos: []
      });
      setNewListName('');
      setShowNewList(false);
      fetchLists();
    } catch (error) {
      console.error('Error creando la lista:', error);
      alert('Error al crear la lista');
    }
  };

  const handleAddVideo = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (userId && title && description && url) {
        let thumbnailUrl;
        if (isInstagram) {
          thumbnailUrl = await getInstagramThumbnail(url);
        } else {
          thumbnailUrl = getYouTubeThumbnail(url);
        }

        if (thumbnailUrl) {
          const currentDate = new Date();
          const videoData = {
            userId,
            title,
            description,
            url,
            platform: isInstagram ? 'Instagram' : 'YouTube',
            thumbnail: thumbnailUrl,
            date: currentDate.toISOString(),
          };

          // Añadir video a la colección de videos
          const videoRef = await addDoc(collection(db, 'videos'), videoData);

          // Si se seleccionó una lista, añadir el video a la lista
          if (selectedList) {
            const selectedListDoc = lists.find(list => list.id === selectedList);
            if (selectedListDoc) {
              const updatedVideos = [...(selectedListDoc.videos || []), {
                ...videoData,
                id: videoRef.id
              }];
              
              await addDoc(collection(db, 'lists'), {
                ...selectedListDoc,
                videos: updatedVideos
              });
            }
          }

          alert('¡Video agregado correctamente!');
          navigate('/my-videos');
        } else {
          alert('No se pudo generar la miniatura. Verifica la URL.');
        }
      } else {
        alert('Por favor, completa todos los campos.');
      }
    } catch (error) {
      console.error('Error añadiendo el video:', error);
      alert('No se pudo añadir el video. Inténtalo de nuevo.');
    }
  };

  const getYouTubeThumbnail = (url) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/[^\/]+\/|(?:v|embed)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/);
    return match ? `https://img.youtube.com/vi/${match[1]}/0.jpg` : null;
  };

  const getInstagramThumbnail = async (url) => {
    try {
      const regex = /instagram\.com\/(?:p|reel)\/([^/?]+)/;
      const match = url.match(regex);
      if (match && match[1]) {
        const postId = match[1];
        const response = await fetch(`https://api.instagram.com/oembed/?url=https://instagram.com/p/${postId}/`);
        const data = await response.json();
        if (data && data.thumbnail_url) {
          return data.thumbnail_url;
        }
      }
    } catch (error) {
      console.error('Error al obtener la miniatura de Instagram:', error);
    }
    return 'default_thumbnail.jpg'; // Imagen por defecto si no se obtiene la miniatura
  };

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="form-container" style={{ maxWidth: '600px' }}>
          <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '2rem' }}>
            Añadir Nuevo Video
          </h1>

          <input
            type="text"
            placeholder="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field"
          />
          <textarea
            placeholder="Descripción"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input-field"
            style={{ minHeight: '100px', resize: 'vertical' }}
          />
          <input
            type="url"
            placeholder="URL del video"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="input-field"
          />
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            margin: '1rem 0'
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={isInstagram}
                onChange={() => setIsInstagram(!isInstagram)}
                style={{ width: '20px', height: '20px' }}
              />
              <span>Es video de Instagram</span>
            </label>
            <span style={{
              backgroundColor: isInstagram ? '#E1306C' : '#FF0000',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '0.8rem'
            }}>
              {isInstagram ? "Instagram" : "YouTube"}
            </span>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <select 
              className="input-field"
              value={selectedList}
              onChange={(e) => setSelectedList(e.target.value)}
            >
              <option value="">Seleccionar lista (opcional)</option>
              {lists.map(list => (
                <option key={list.id} value={list.id}>
                  {list.title}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <button 
              className="btn btn-primary" 
              style={{ width: '100%' }}
              onClick={() => setShowNewList(!showNewList)}
            >
              {showNewList ? 'Cancelar nueva lista' : 'Crear nueva lista'}
            </button>
          </div>

          {showNewList && (
            <div style={{ marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder="Nombre de la nueva lista"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                className="input-field"
              />
              <button 
                className="btn btn-primary" 
                style={{ width: '100%', marginTop: '0.5rem' }}
                onClick={handleCreateList}
              >
                Crear lista
              </button>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button 
              onClick={handleAddVideo}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              Añadir Video
            </button>
            <button 
              onClick={() => navigate('/my-videos')}
              className="btn btn-danger"
              style={{ flex: 1 }}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddVideoScreen;
