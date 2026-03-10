import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  MdOutlineDeleteForever, 
  MdOutlineRestoreFromTrash, 
  MdCheckBox, MdClose,
  MdCheckBoxOutlineBlank ,MdCheck
} from "react-icons/md";
import toastr from "toastr";
import "../notes/Notes.css"; // Ensure this contains the CSS we finalized
import { useTheme } from "../../../contexts/ThemeContext";
import { useView } from "../../../contexts/viewContext";
const Bin = () => {
   const { viewMode } = useView();  
  const [notes, setNotes] = useState([]);
  const addToBottom = JSON.parse(localStorage.getItem("addToBottom")) || false;
  const [loading, setLoading] = useState(false);
  const userId = JSON.parse(localStorage.getItem("user"))?.id;
  const [selectedNotes, setSelectedNotes] = useState([]);
  const toggleSelectNote = (noteId) => {
  setSelectedNotes(prev =>
    prev.includes(noteId)
      ? prev.filter(id => id !== noteId)
      : [...prev, noteId]
  );
};
const bulkRestore = async () => {
  try {

    await Promise.all(
      selectedNotes.map(id =>
        axios.put(`http://localhost:5000/api/notes/edit/${id}`, {
          trashed: false
        })
      )
    );

    setNotes(prev => prev.filter(n => !selectedNotes.includes(n._id)));

    setSelectedNotes([]);

    toastr.success("Notes restored");

  } catch {
    toastr.error("Restore failed");
  }
};


const bulkDeleteForever = async () => {

  if (!window.confirm("Delete selected notes forever?")) return;

  try {

    await Promise.all(
      selectedNotes.map(id =>
        axios.delete(`http://localhost:5000/api/notes/delete/${id}`)
      )
    );

    setNotes(prev => prev.filter(n => !selectedNotes.includes(n._id)));

    setSelectedNotes([]);

    toastr.info("Notes deleted forever");

  } catch {
    toastr.error("Delete failed");
  }

};

  const fetchTrashedNotes = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/notes/${userId}`);
      // Filter for notes that are trashed
      const trashed = res.data.filter(n => n.trashed === true);
      setNotes(trashed || []);
    } catch (err) {
      console.error(err);
      toastr.error("Failed to load trash");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchTrashedNotes(); }, [userId]);
  useEffect(() => {
  const handleKeyDown = (e) => {
    // Ctrl+A (Windows) or Cmd+A (Mac)
    if ((e.ctrlKey || e.metaKey) && e.key === "a") {
      e.preventDefault(); // prevent browser text select
      setSelectedNotes(notes.map(note => note._id));
    }

    // Optional: Ctrl+D to deselect all
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") {
      e.preventDefault();
      setSelectedNotes([]);
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [notes]);

  const restoreNote = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/notes/edit/${id}`, { trashed: false });
      setNotes(prev => prev.filter(n => n._id !== id));
      toastr.success("Note restored");
    } catch (err) { toastr.error("Restore failed"); }
  };

  const deleteForever = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/notes/delete/${id}`);
      setNotes(prev => prev.filter(n => n._id !== id));
      toastr.info("Note deleted forever");
    } catch (err) { toastr.error("Action failed"); }
  };
  const { theme } = useTheme();

  const emptyBin = async () => {
    
    if (window.confirm("Empty trash? All notes in the trash will be permanently deleted.")) {
      try {
        // Optimally, you'd have a backend endpoint like /api/notes/emptyTrash/:userId
        for (let note of notes) {
          await axios.delete(`http://localhost:5000/api/notes/delete/${note._id}`);
        }
        setNotes([]);
        toastr.success("Trash emptied");
      } catch (err) { toastr.error("Could not empty trash"); }
    }
  };

  if (loading) return <div className="content-area">Loading...</div>;

  return (
    <div className="keep-wrapper">
      <main className="content-area">
          <div className={`notes-scroll-area `}>
        {/* BIN HEADER */}
        <div className="section-container d-flex flex-column align-items-center w-100">
          <p className="font-italic mb-3" style={{ color: '#5f6368' }}>
            Notes in the Trash are deleted after 7 days.
          </p>
          {notes.length > 0 && (
            <button className="btn-close-note text-primary" onClick={emptyBin} style={{ color: '#1a73e8' }}>
              Empty Trash
            </button>
          )}
        </div>
        {selectedNotes.length > 0 && (

  <div
  className="selection-bar"
  style={{
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    height: "60px",
    background: "#fff",
    borderBottom: theme === "dark" ? "1px solid #181818":"1px solid #e0e0e0",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 24px",
    zIndex: 2000,
  }}
>
  <div style={{ display: "flex", alignItems: "", gap: "16px" }}>
    <MdClose
      size={22}
      style={{ cursor: "pointer" }}
      onClick={() => {
        setSelectedNotes([]);
       
      }}
    />
    <span
  style={{
    fontSize: "18px",
    fontWeight: 200,
    color: theme === "dark" ? "#b0b0b0" : "black", // grey in dark mode
  }}
>
  {selectedNotes.length} selected
</span>
  </div>
   <div style={{ display: "flex", alignItems: "center", gap: "13px" }}>

    <MdOutlineRestoreFromTrash
    className="restore"
      size={22}
      title="Restore selected"
       style={{ cursor: "pointer", color: theme === "dark"?"#d9d9d9":"blue" }}
      onClick={bulkRestore}
    />

    <MdOutlineDeleteForever
    className="delete foreever"
     style={{ cursor: "pointer", color: theme === "dark"?"#d9d9d9":"blue" }}
      size={22}
      title="Delete forever"
      onClick={bulkDeleteForever}
    />

  </div></div>

)}

        {notes.length === 0 ? (
          <div style={{ marginTop: '100px', textAlign: 'center', opacity: 0.5 }}>
            <MdOutlineDeleteForever size={120} />
            <p style={{ fontSize: '22px' }}>Trash is empty</p>
          </div>
        ) : (
       <div className={`notes-${viewMode} `}>
           {notes.map(note => {
  const isSelected = selectedNotes.includes(note._id);

  return (
              
             <div
  key={note._id}
  className="note-card"
  style={{ backgroundColor: note.color , border: isSelected
  ? (theme === "dark" ? "2px solid white" : "2px solid black")
  : (theme === "dark" ? "1px solid #444" : "1px solid rgb(215,213,213)")}}
  onClick={() => toggleSelectNote(note._id)}
>
 <div
  className={`select-checkbox ${isSelected ? "selected" : ""}`}
  onClick={(e) => {
    e.stopPropagation();
    toggleSelectNote(note._id);
  }}
>
  {isSelected ? (
    <MdCheck size={16} classNamNe="selected-icon" />
  ) : (
    <MdCheck size={16} className="selected-icon" />
  )}
</div>
                {note.images?.length > 0 && (
                  <img 
                    src={note.images[0]} 
                    className="card-img-top" 
                    style={{ filter: 'grayscale(100%)', opacity: 0.7 }} 
                    alt="" 
                  />
                )}
                <div className="p-3">
                  <div className="fw-bold mb-1">{note.title}</div>
                  
                  <div className="card-content-text small">
                    {note.isList ? (
                      note.listItems?.slice(0, 5).map((item, i) => (
                        <div key={i} className="d-flex align-items-center mb-1">
                          {item.checked ? 
                            <MdCheckBox size={16} className="text-muted" /> : 
                            <MdCheckBoxOutlineBlank size={16} className="text-muted" />
                          }
                          <span className={`ms-2 ${item.checked ? 'text-decoration-line-through text-muted' : ''}`}>
                            {item.text}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-truncate-custom">{note.content}</div>
                    )}
                  </div>

                  {/* Labels Display */}
                  <div className="d-flex flex-wrap gap-1 mt-2">
                    {note.labels?.map(l => (
                      <span key={l} className="label-badge-static">{l}</span>
                    ))}
                  </div>

                  {/* BIN ACTIONS */}
                  <div className="card-toolbar visible mt-3" style={{ opacity: 1 }}>
                   
                      <MdOutlineDeleteForever 
                        title="Delete forever" 
                        onClick={() => deleteForever(note._id)} 
                      />
                      <MdOutlineRestoreFromTrash 
                        title="Restore" 
                        onClick={() => restoreNote(note._id)} 
                      />
                
                  </div>
                </div>
              </div>
           );
})}
          </div>
        )}
        </div>
      </main>
    </div>
  );
};

export default Bin;