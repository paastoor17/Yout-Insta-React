import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import UserScreen from './pages/UserScreen';
import ListScreen from './pages/ListScreen';
import AddVideoScreen from './pages/AddVideoScreen';
import ListDetailScreen from './pages/ListDetailScreen';
import MyVideos from './pages/MyVideos';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<UserScreen />} />
        <Route path="/my-videos" element={<MyVideos />} />
        <Route path="/lists" element={<ListScreen />} />
        <Route path="/add-video" element={<AddVideoScreen />} />
        <Route path="/list-detail" element={<ListDetailScreen />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
