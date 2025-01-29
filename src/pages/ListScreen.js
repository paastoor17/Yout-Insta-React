import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/common.css';

const ListsScreen = () => {
  const [lists, setLists] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    const userId = auth.currentUser?.uid;
    if (userId) {
      const q = query(collection(db, 'lists'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const userLists = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLists(userLists);
    }
  };

  const handleDeleteList = async (listId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta lista?')) {
      try {
        const listRef = doc(db, 'lists', listId);
        await deleteDoc(listRef);
        setLists(prevLists => prevLists.filter(list => list.id !== listId));
      } catch (error) {
        alert('No se pudo eliminar la lista. Por favor, inténtalo de nuevo.');
      }
    }
  };

  const handleViewList = (list) => {
    navigate('/list-detail', { state: { list } });
  };

  return (
    <div>
      <Navbar />
      <div className="container">
        <h1 style={{ 
          textAlign: 'center', 
          color: '#333',
          marginBottom: '2rem',
          fontSize: '2.5rem',
          fontWeight: '600'
        }}>
          Mis Listas de Videos
        </h1>

        <div className="video-grid">
          {lists.map(list => (
            <div key={list.id} className="card" style={{
              transition: 'transform 0.2s',
              cursor: 'pointer',
              overflow: 'hidden'
            }}>
              {/* Miniatura de la lista (si tiene videos) */}
              {list.videos && list.videos[0] && (
                <img 
                  src={list.videos[0].thumbnail} 
                  alt="Lista Thumbnail" 
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover',
                    borderRadius: '10px',
                    marginBottom: '1rem'
                  }}
                />
              )}

              <h3 style={{ 
                fontSize: '1.2rem',
                fontWeight: '600',
                marginBottom: '0.5rem',
                color: '#333'
              }}>
                {list.title}
              </h3>

              <p style={{ 
                color: '#666',
                fontSize: '0.9rem',
                marginBottom: '1rem'
              }}>
                {list.videos ? `${list.videos.length} videos` : 'No hay videos'}
              </p>

              <div style={{ 
                display: 'flex',
                gap: '1rem',
                marginTop: 'auto'
              }}>
                <button 
                  onClick={() => handleViewList(list)}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  Ver Lista
                </button>
                <button 
                  onClick={() => handleDeleteList(list.id)}
                  className="btn btn-danger"
                  style={{ flex: 1 }}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>

        {lists.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            color: '#666'
          }}>
            <p>No tienes listas creadas.</p>
            <p>Puedes crear una lista al añadir un nuevo video.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListsScreen;
