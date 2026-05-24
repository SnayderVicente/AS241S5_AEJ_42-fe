import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_CHAT = 'http://localhost:8080/api/chat';
const API_TRANSLATE = 'http://localhost:8080/api/translate';

function App() {
  const [chatResults, setChatResults] = useState([]);
  const [translateResults, setTranslateResults] = useState([]);
  const [chatMessage, setChatMessage] = useState('');
  const [translateText, setTranslateText] = useState('');
  const [translateTarget, setTranslateTarget] = useState('en');
  const [editId, setEditId] = useState(null);
  const [editMessage, setEditMessage] = useState('');
  const [activeTab, setActiveTab] = useState('chat');

  useEffect(() => {
    fetchChat();
    fetchTranslate();
  }, []);

  // READ
  const fetchChat = async () => {
    const res = await axios.get(API_CHAT);
    setChatResults(res.data);
  };

  const fetchTranslate = async () => {
    const res = await axios.get(API_TRANSLATE);
    setTranslateResults(res.data);
  };

  // CREATE - Chat
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    await axios.post(API_CHAT, { message: chatMessage });
    setChatMessage('');
    fetchChat();
  };

  // CREATE - Translate
  const handleTranslateSubmit = async (e) => {
    e.preventDefault();
    await axios.post(API_TRANSLATE, { text: translateText, target: translateTarget });
    setTranslateText('');
    fetchTranslate();
  };

  // UPDATE
  const handleUpdate = async (id, type) => {
    if (type === 'chat') {
      await axios.put(`${API_CHAT}/${id}`, { message: editMessage });
      fetchChat();
    } else {
      await axios.put(`${API_TRANSLATE}/${id}`, { text: editMessage, target: translateTarget });
      fetchTranslate();
    }
    setEditId(null);
    setEditMessage('');
  };

  // DELETE
  const handleDelete = async (id, type) => {
    if (type === 'chat') {
      await axios.delete(`${API_CHAT}/${id}`);
      fetchChat();
    } else {
      await axios.delete(`${API_TRANSLATE}/${id}`);
      fetchTranslate();
    }
  };

  const styles = {
    container: { fontFamily: 'Arial', maxWidth: '900px', margin: '0 auto', padding: '20px' },
    header: { background: '#2c3e50', color: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' },
    tabs: { display: 'flex', gap: '10px', marginBottom: '20px' },
    tab: (active) => ({ padding: '10px 20px', background: active ? '#2c3e50' : '#ecf0f1', color: active ? 'white' : '#2c3e50', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }),
    form: { background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px' },
    input: { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ddd', boxSizing: 'border-box' },
    button: (color) => ({ padding: '10px 20px', background: color, color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginRight: '5px' }),
    card: { background: 'white', border: '1px solid #ddd', borderRadius: '8px', padding: '15px', marginBottom: '10px' },
    response: { background: '#f0f4f8', padding: '10px', borderRadius: '5px', fontSize: '14px', marginTop: '10px', wordBreak: 'break-word' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>AEJ42 — APIs IA Dashboard</h1>
        <p>Snayder Vicente — Spring WebFlux + MongoDB</p>
      </div>

      <div style={styles.tabs}>
        <button style={styles.tab(activeTab === 'chat')} onClick={() => setActiveTab('chat')}>💬 ChatGPT</button>
        <button style={styles.tab(activeTab === 'translate')} onClick={() => setActiveTab('translate')}>🌐 Traductor</button>
      </div>

      {activeTab === 'chat' && (
        <div>
          <div style={styles.form}>
            <h3>➕ Nueva consulta a ChatGPT</h3>
            <form onSubmit={handleChatSubmit}>
              <input style={styles.input} value={chatMessage} onChange={e => setChatMessage(e.target.value)} placeholder="Escribe tu mensaje..." required />
              <button style={styles.button('#27ae60')} type="submit">Enviar a ChatGPT</button>
            </form>
          </div>

          <h3>📋 Consultas registradas ({chatResults.length})</h3>
          {chatResults.map(item => (
            <div key={item.id} style={styles.card}>
              <strong>📤 Request:</strong> {item.request}
              <div style={styles.response}><strong>📥 Response:</strong> {item.response?.substring(0, 200)}...</div>
              <small style={{ color: '#999' }}>🕐 {item.timestamp}</small>
              <div style={{ marginTop: '10px' }}>
                {editId === item.id ? (
                  <>
                    <input style={{ ...styles.input, marginBottom: '5px' }} value={editMessage} onChange={e => setEditMessage(e.target.value)} placeholder="Nuevo mensaje..." />
                    <button style={styles.button('#f39c12')} onClick={() => handleUpdate(item.id, 'chat')}>Guardar</button>
                    <button style={styles.button('#95a5a6')} onClick={() => setEditId(null)}>Cancelar</button>
                  </>
                ) : (
                  <>
                    <button style={styles.button('#f39c12')} onClick={() => { setEditId(item.id); setEditMessage(item.request); }}>✏️ Editar</button>
                    <button style={styles.button('#e74c3c')} onClick={() => handleDelete(item.id, 'chat')}>🗑️ Eliminar</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'translate' && (
        <div>
          <div style={styles.form}>
            <h3>➕ Nueva traducción</h3>
            <form onSubmit={handleTranslateSubmit}>
              <input style={styles.input} value={translateText} onChange={e => setTranslateText(e.target.value)} placeholder="Texto a traducir..." required />
              <select style={styles.input} value={translateTarget} onChange={e => setTranslateTarget(e.target.value)}>
                <option value="en">Inglés</option>
                <option value="fr">Francés</option>
                <option value="pt">Portugués</option>
                <option value="de">Alemán</option>
              </select>
              <button style={styles.button('#27ae60')} type="submit">Traducir</button>
            </form>
          </div>

          <h3>📋 Traducciones registradas ({translateResults.length})</h3>
          {translateResults.map(item => (
            <div key={item.id} style={styles.card}>
              <strong>📤 Request:</strong> {item.request}
              <div style={styles.response}><strong>📥 Response:</strong> {item.response}</div>
              <small style={{ color: '#999' }}>🕐 {item.timestamp}</small>
              <div style={{ marginTop: '10px' }}>
                {editId === item.id ? (
                  <>
                    <input style={{ ...styles.input, marginBottom: '5px' }} value={editMessage} onChange={e => setEditMessage(e.target.value)} placeholder="Nuevo texto..." />
                    <button style={styles.button('#f39c12')} onClick={() => handleUpdate(item.id, 'translate')}>Guardar</button>
                    <button style={styles.button('#95a5a6')} onClick={() => setEditId(null)}>Cancelar</button>
                  </>
                ) : (
                  <>
                    <button style={styles.button('#f39c12')} onClick={() => { setEditId(item.id); setEditMessage(item.request); }}>✏️ Editar</button>
                    <button style={styles.button('#e74c3c')} onClick={() => handleDelete(item.id, 'translate')}>🗑️ Eliminar</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;