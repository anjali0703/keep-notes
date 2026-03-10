import React, { useState, useEffect, useRef, useReducer } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { 
  MdPushPin,
  MdOutlinePalette,
  MdOutlineImage,
  MdOutlineArchive,
  MdOutlineMoreVert,
  MdClose,
  MdOutlineDelete,
  MdOutlineLabel,
  MdContentCopy,
  MdUndo,
  MdRedo,
  MdList,
  MdCheckBoxOutlineBlank,
  MdCheckBox,
  MdOutlineNotificationsActive,
  MdUnarchive,
  MdSearch,
  MdAdd,
  MdOutlineFormatColorReset,
  MdOutlineImageNotSupported,
  MdRepeat,
  MdCheck,
  
} from "react-icons/md";
import toastr from "toastr";
import "./Notes.css";
import { useView } from "../../../contexts/viewContext";
import bg1 from "../../../assets/bg/b1.png";
import bg2 from "../../../assets/bg/b2.png";
import bg3 from "../../../assets/bg/b4.jpg";
import bg4 from "../../../assets/bg/p3.png";
import bg5 from "../../../assets/bg/b5";
import bg6 from "../../../assets/bg/b6.png";
import bg7 from "../../../assets/bg/b7.webp";
import bg8 from "../../../assets/bg/b8";
import bg9 from "../../../assets/bg/b9";
import bg10 from "../../../assets/bg/b11";
import { useTheme } from "../../../contexts/ThemeContext";



const COLORS = [
  "#f28b82", "#fbbc04", "#fff475", "#ccff90", 
  "#a7ffeb", "#cbf0f8", "#aecbfa", "#d7aefb", "#fdcfe8", "#e6c9a8", "#e8eaed"
];
const BACKGROUNDS = [
  bg1, bg2, bg3, bg4, bg5,
  bg6, bg7, bg8, bg9, bg10
];

const historyReducer = (state, action) => {
  const { past, present, future } = state;
  switch (action.type) {
    case "SET_STATE":
      return {
        past: [...past, present].slice(-20),
        present: { ...present, ...action.payload },
        future: []
      };
    case "UNDO":
      if (past.length === 0) return state;
      return {
        past: past.slice(0, past.length - 1),
        present: past[past.length - 1],
        future: [present, ...future]
      };
    case "REDO":
      if (future.length === 0) return state;
      return {
        past: [...past, present],
        present: future[0],
        future: future.slice(1)
      };
    case "RESET":
      return { past: [], present: action.payload, future: [] };
    default: return state;
  }
};
   const ReminderPopover = ({ currentReminder, onSave, onClose }) => {
    const [showPicker, setShowPicker] = useState(false);
  
    const saveReminder = (reminderObj) => {
    onSave(reminderObj);
   
  };
  
    const laterToday = () => {
    const d = new Date();
    d.setHours(18, 0, 0, 0);
    saveReminder({
      date: d.toISOString(),
      repeat: "none",
      active: true
    });
  };
  
   const tomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(8, 0, 0, 0);
    saveReminder({
      date: d.toISOString(),
      repeat: "none",
      active: true
    });
  };
    const nextMonday = () => {
    const d = new Date();
    const day = d.getDay();
    const daysUntilMonday = ((8 - day) % 7) || 7;
    d.setDate(d.getDate() + daysUntilMonday);
    d.setHours(8, 0, 0, 0);
    saveReminder({
      date: d.toISOString(),
      repeat: "none",
      active: true
    });
  };
  
    if (showPicker) {
      return (
        <DateTimePicker
          currentReminder={currentReminder}
          onSave={(reminderObj) => saveReminder(reminderObj)}
          onBack={() => setShowPicker(false)}
        />
      );
    }
  
    return (
      <div className="reminder-popover shadow" onClick={e => e.stopPropagation()}>
        <div className="reminder-title">Remind me</div>
        <div className="reminder-item" onClick={laterToday}>
          <span>Later today</span><span className="text-muted">18:00</span>
        </div>
        <div className="reminder-item" onClick={tomorrow}>
          <span>Tomorrow</span><span className="text-muted">08:00</span>
        </div>
        <div className="reminder-item" onClick={nextMonday}>
          <span>Next week</span><span className="text-muted">Mon, 08:00</span>
        </div>
        <div className="reminder-item select-date" onClick={() => setShowPicker(true)}>
          ⏰ Pick date & time
        </div>
      </div>
    );
  };
  const DateTimePicker = ({ currentReminder, onSave, onBack }) => {
    const now = new Date();
    const initial = currentReminder?.date
      ? new Date(currentReminder.date)
      : now;
  
    const [selectedDate, setSelectedDate] = useState(initial);
    const [repeat, setRepeat] = useState(
      currentReminder?.repeat || "none"
    );
  
    const [showTimeMenu, setShowTimeMenu] = useState(false);
    const [showRepeatMenu, setShowRepeatMenu] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const [error, setError] = useState("");
  
    const hiddenDateRef = useRef(null);
  
    // ---------- FORMAT ----------
    const formatDisplayDate = (date) =>
      date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
  
    const getTimeValue = (date) =>
      `${String(date.getHours()).padStart(2, "0")}:${String(
        date.getMinutes()
      ).padStart(2, "0")}`;
  
    // ---------- DATE ----------
    const handleDateChange = (e) => {
      const newDate = new Date(e.target.value);
      newDate.setHours(
        selectedDate.getHours(),
        selectedDate.getMinutes()
      );
      setSelectedDate(newDate);
      setShowCalendar(true);
    };
  
    // ---------- TIME ----------
    const handleTimeChange = (e) => {
      const [h, m] = e.target.value.split(":");
      const updated = new Date(selectedDate);
      updated.setHours(parseInt(h), parseInt(m));
      setSelectedDate(updated);
    };
  
    const setTimePreset = (hour, minute) => {
      const updated = new Date(selectedDate);
      updated.setHours(hour, minute, 0, 0);
      setSelectedDate(updated);
      setShowTimeMenu(false);
    };
  
    // ---------- SAVE ----------
    const handleSave = () => {
      if (selectedDate < new Date()) {
        setError("Cannot set reminder in the past");
        return;
      }
  
      setError("");
  
      onSave({
        date: selectedDate.toISOString(),
        repeat,
        active: true,
      });
    };
  
    return (
      <div className="gkeep-datetime">
        {/* HEADER */}
        <div className="gkeep-header">
          <span className="back-btn" onClick={onBack}>←</span>
          <span className="title">Select date and time</span>
        </div>
  
        {/* DATE ROW (Styled like Keep) */}
        <div
          className={`gkeep-row ${showCalendar ? "active-time" : ""}`}
          onClick={() => {
            setShowCalendar(!showCalendar);
            hiddenDateRef.current?.showPicker();
          }}
        >
          <span>{formatDisplayDate(selectedDate)}</span>
          <span>▾</span>
  
          {/* Hidden native date input */}
          <input
            ref={hiddenDateRef}
            type="date"
            className="hidden-input"
            value={selectedDate.toISOString().split("T")[0]}
            onChange={handleDateChange}
          />
        </div>
  
        {/* TIME ROW (Always Editable) */}
       <div
    className={`gkeep-row ${showTimeMenu ? "active-time" : ""}`}
    onClick={() => setShowTimeMenu(!showTimeMenu)}
  >
    <input
      type="text"
      value={getTimeValue(selectedDate)}
      onChange={(e) => {
        const value = e.target.value;
  
        // allow only numbers and colon
        if (!/^[0-9:]*$/.test(value)) return;
  
        // auto add colon
        let formatted = value;
        if (value.length === 2 && !value.includes(":")) {
          formatted = value + ":";
        }
  
        if (formatted.length <= 5) {
          const [h, m] = formatted.split(":");
  
          if (
            h !== undefined &&
            m !== undefined &&
            h.length === 2 &&
            m.length === 2
          ) {
            const hour = parseInt(h);
            const minute = parseInt(m);
  
            if (
              hour >= 0 &&
              hour <= 23 &&
              minute >= 0 &&
              minute <= 59
            ) {
              const updated = new Date(selectedDate);
              updated.setHours(hour, minute);
              setSelectedDate(updated);
            }
          }
        }
      }}
      placeholder="HH:MM"
      onClick={(e) => e.stopPropagation()}
      style={{
        border: "none",
        background: "transparent",
        fontSize: "15px",
        outline: "none",
        width: "60px",
      }}
    />
    <span>▾</span>
  </div>
  
        {showTimeMenu && (
          <div className="time-menu">
            <div onClick={() => setTimePreset(8, 0)}>
              Morning <span>08:00</span>
            </div>
            <div onClick={() => setTimePreset(13, 0)}>
              Afternoon <span>13:00</span>
            </div>
            <div onClick={() => setTimePreset(18, 0)}>
              Evening <span>18:00</span>
            </div>
            <div onClick={() => setTimePreset(20, 0)}>
              Night <span>20:00</span>
            </div>
          </div>
        )}
  
        {/* REPEAT ROW */}
        <div
          className="gkeep-row"
          onClick={() => setShowRepeatMenu(!showRepeatMenu)}
        >
          <span>
            {repeat === "none"
              ? "Does not repeat"
              : `Repeats ${repeat}`}
          </span>
          <span>▾</span>
        </div>
  
        {showRepeatMenu && (
          <div className="time-menu">
            {[
              "none",
              "daily",
              "weekly",
              "monthly",
              "yearly",
              
            ].map((r) => (
              <div
                key={r}
                className={repeat === r ? "active-option" : ""}
                onClick={() => {
                  setRepeat(r);
                  setShowRepeatMenu(false);
                }}
              >
                {r === "none"
                  ? "Does not repeat"
                  : r.charAt(0).toUpperCase() + r.slice(1)}
              </div>
            ))}
          </div>
        )}
  
        {error && (
          <div style={{ color: "red", padding: "8px 16px" }}>
            {error}
          </div>
        )}
  
        {/* SAVE */}
        <div className="gkeep-footer">
          <button onClick={handleSave}>Save</button>
        </div>
      </div>
    );
  };
  const ReminderChip = ({ reminder, onRemove, onToggleComplete ,onEdit }) => {
    if (!reminder?.date) return null;
  
    const now = new Date();
  const date = reminder?.date ? new Date(reminder.date) : null;
  if (!date || isNaN(date.getTime())) return null;
  
    const isPast = date.getTime() < now.getTime();
    const isCompleted = reminder.active === false || isPast;
  
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    let displayText = "";
  
    if (date.toDateString() === now.toDateString()) {
      displayText = "Today " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (date.toDateString() === tomorrow.toDateString()) {
      displayText = "Tomorrow " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else {
      displayText = date.toLocaleString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    }
  
    return (
      <div
        className={`reminder-chip d-flex align-items-center`}
          onClick={(e) => {
      e.stopPropagation();
      onEdit && onEdit();
    }}
   
        style={{
          borderRadius: "16px",
          backgroundColor: isCompleted ? "#f1f3f4" : "#e8f0fe",
          color: isCompleted ? "#5f6368" : "#202124",
          marginTop:10,
          padding: "2px 8px",
          fontSize: "0.85rem",
          gap: "4px",
          display: "inline-flex",
          alignItems: "center",
          maxWidth: "100%",
          cursor:"pointer",
        
        }}
      >
        <span style={{ opacity: isCompleted ? 0.5 : 1 }}></span>
  
        <span style={{ textDecoration: isCompleted ? "line-through" : "none", marginLeft: "4px" }}>
          {displayText}
        </span>
  
       {reminder?.repeat && reminder.repeat !== "none" && (
    <MdRepeat
      className="keep-repeat-icon"
      style={{
        marginLeft: "6px",
        fontSize: "16px",
        color:"gray",
        opacity: isCompleted ? 0.4 : 0.7
      }}
    />
  )}
  
     {isCompleted && (
    <span
      onClick={(e) => {
        e.stopPropagation();
        onToggleComplete(reminder);
      }}
      style={{
        position: "absolute",
        left: "0",
        top: "50%",
        transform: "translateY(-50%)",
        cursor: "pointer",
        borderRadius: "50%",
        width: "18px",
        height: "18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#a2a2a2",
        color: "#fff",
        fontSize: "12px",
        marginLeft:"-1px",
      }}
    >
      ✓
    </span>
  )}
  
        {/* Remove Button (hidden by default, shows on hover) */}
       <MdClose
    size={16}
    className="reminder-remove"
    onClick={(e) => {
      e.stopPropagation();
      onRemove();
    }}
  />
      </div>
    );
  };
const Archive = () => {
   const { viewMode } = useView();  
   const { theme } = useTheme();
  const [notes, setNotes] = useState([]);
  const addToBottom = JSON.parse(localStorage.getItem("addToBottom")) || false;
  const [availableLabels, setAvailableLabels] = useState([]);
  const [labelSearch, setLabelSearch] = useState(""); // Sync search state
  const [loading, setLoading] = useState(false);
  const [activeMenu, setActiveMenu] = useState({ id: null, type: null });
  const [cardUploadId, setCardUploadId] = useState(null);

  const location = useLocation();
  const searchQuery = new URLSearchParams(location.search).get("q") || "";

  const [editState, dispatch] = useReducer(historyReducer, { past: [], present: null, future: [] });
  const editingNote = editState.present;

  const userId = JSON.parse(localStorage.getItem("user"))?.id;
  const editFileInputRef = useRef(null);
  const cardFileInputRef = useRef(null);
  const [selectedNotes, setSelectedNotes] = useState([]);

const toggleSelectNote = (noteId) => {
  setSelectedNotes(prev =>
    prev.includes(noteId)
      ? prev.filter(id => id !== noteId)
      : [...prev, noteId]
  );
};

const isSelectionMode = selectedNotes.length > 0;

  useEffect(() => { 
    fetchArchivedNotes(); 
    fetchLabels(); 
  }, [userId]);
  
  const bulkUnarchive = async () => {
  try {

    // update UI
    setNotes(prev =>
      prev.filter(note => !selectedNotes.includes(note._id))
    );

    await Promise.all(
      selectedNotes.map(id =>
        axios.put(`http://localhost:5000/api/notes/edit/${id}`, {
          archived: false
        })
      )
    );

    setSelectedNotes([]);
    toastr.success("Notes unarchived");

  } catch (err) {
    toastr.error("Unarchive failed");
    fetchArchivedNotes();
  }
};
const bulkTogglePin = async () => {
  try {

    const notesToUpdate = notes.filter(n =>
      selectedNotes.includes(n._id)
    );

    const updates = notesToUpdate.map(note => ({
      id: note._id,
      pinned: !note.pinned,
      archived: note.pinned ? note.archived : false
    }));

    // ✅ Instant UI update
    setNotes(prev =>
      prev.filter(note => !selectedNotes.includes(note._id)) // remove from archive UI
    );

    await Promise.all(
      updates.map(u =>
        axios.put(`http://localhost:5000/api/notes/edit/${u.id}`, {
          pinned: u.pinned,
          archived: u.archived
        })
      )
    );

    setSelectedNotes([]);

    toastr.success("Notes moved to pinned");

  } catch (err) {
    toastr.error("Pin failed");
    fetchArchivedNotes();
  }
};
const bulkCopy = async () => {
  try {

    const notesToCopy = notes.filter(n =>
      selectedNotes.includes(n._id)
    );

    const responses = await Promise.all(
      notesToCopy.map(note => {
        const { _id, createdAt, updatedAt, ...copy } = note;

        return axios.post(`http://localhost:5000/api/notes`, {
          ...copy,
          userId
        });
      })
    );

    // ✅ Get new notes returned from backend
    const newNotes = responses.map(res => res.data);

    // ✅ Add immediately to UI
    setNotes(prev => [...newNotes, ...prev]);
    setSelectedNotes([]);

    toastr.success(`${newNotes.length} notes copied`);

  } catch (err) {
    toastr.error("Copy failed");
  }
};
const bulkAddReminder = async (reminder) => {
  try {

    const formattedReminder = {
      date: reminder.date,
      repeat: reminder.repeat || "none",
      active: true
    };

    // UI update instantly
    setNotes(prev =>
      prev.map(note =>
        selectedNotes.includes(note._id)
          ? { ...note, reminder: formattedReminder }
          : note
      )
    );

    await Promise.all(
      selectedNotes.map(id =>
        axios.put(`http://localhost:5000/api/notes/edit/${id}`, {
          reminder: formattedReminder
        })
      )
    );
     setSelectedNotes([]);
    setActiveMenu({ id: null, type: null });

    toastr.success("Reminder added");

  } catch (err) {
    toastr.error("Reminder failed");
    fetchArchivedNotes();
  }
};
const bulkChangeColor = async (color = null, bg = null) => {
  try {
    // ✅ Update UI instantly
    setNotes(prev =>
      prev.map(note =>
        selectedNotes.includes(note._id)
          ? {
              ...note,
              color: color ,
              background: bg || ""
            }
          : note
      )
    );

    // ✅ Update backend
    await Promise.all(
      selectedNotes.map(id =>
        axios.put(`http://localhost:5000/api/notes/edit/${id}`, {
          color: color,
          background: bg || ""
        })
      )
    );

    setSelectedNotes([]);
    setActiveMenu({ id: null, type: null });
    toastr.success("Colors updated");
  } catch (error) {
    console.error("Bulk color error:", error);
    toastr.error("Color update failed");
    // Revert on error
   fetchArchivedNotes();
  }
};
const bulkUpdateLabels = async (label) => {
  try {

    const notesToUpdate = notes.filter(n =>
      selectedNotes.includes(n._id)
    );

    const updatedNotes = notesToUpdate.map(note => {
      const labels = note.labels || [];

      const newLabels = labels.includes(label)
        ? labels.filter(l => l !== label)
        : [...labels, label];

      return { id: note._id, labels: newLabels };
    });

    setNotes(prev =>
      prev.map(note => {
        const update = updatedNotes.find(u => u.id === note._id);
        return update ? { ...note, labels: update.labels } : note;
      })
    );

    await Promise.all(
      updatedNotes.map(u =>
        axios.put(`http://localhost:5000/api/notes/edit/${u.id}`, {
          labels: u.labels
        })
      )
    );
    

    toastr.success("Labels updated");

  } catch (err) {
    toastr.error("Label update failed");
    fetchArchivedNotes();
  }
};
const bulkDelete = async () => {
  try {

    // ✅ Update UI instantly
    setNotes(prev =>
      prev.map(note =>
        selectedNotes.includes(note._id)
          ? { ...note, trashed: true }
          : note
      )
    );

    // ✅ Backend update
    await Promise.all(
      selectedNotes.map(id =>
        axios.put(`http://localhost:5000/api/notes/edit/${id}`, {
          trashed: true
        })
      )
    );

    setSelectedNotes([]);
    toastr.success("Notes deleted");

  } catch (error) {
    console.error("Bulk delete error:", error);
    toastr.error("Delete failed");
    fetchArchivedNotes(); // reload archive notes
  }
};

  const fetchArchivedNotes = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/notes/${userId}`);
      const archived = res.data.filter(n => n.archived && !n.trashed);
      setNotes(archived || []);
    } catch (err) { toastr.error("Failed to load archive"); }
    finally { setLoading(false); }
  };

  const fetchLabels = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/label/${userId}`);
      setAvailableLabels(res.data || []);
    } catch (err) { console.error("Label fetch error", err); }
  };

  // --- LABEL LOGIC (PORTED FROM CONTENT) ---
  const handleAddNewLabel = async (name) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    const exists = availableLabels.some(l => l.name.toLowerCase() === trimmedName.toLowerCase());
    if (exists) {
        handleLabelToggle(availableLabels.find(l => l.name.toLowerCase() === trimmedName.toLowerCase()).name, !!editingNote);
        setLabelSearch("");
        return;
    }
    try {
      const res = await axios.post(`http://localhost:5000/api/label`, { name: trimmedName, userId });
      setAvailableLabels(prev => [...prev, res.data]);
      handleLabelToggle(res.data.name, !!editingNote);
      setLabelSearch("");
    } catch (err) { toastr.error("Label creation failed"); }
  };

  const handleLabelToggle = (label, isEditMode = false, noteId = null) => {
    if (isEditMode) {
      const currentLabels = editingNote.labels || [];
      const newLabels = currentLabels.includes(label) ? currentLabels.filter(l => l !== label) : [...currentLabels, label];
      dispatch({ type: "SET_STATE", payload: { labels: newLabels } });
    } else if (noteId) {
      const note = notes.find(n => n._id === noteId);
      const currentLabels = note.labels || [];
      const newLabels = currentLabels.includes(label) ? currentLabels.filter(l => l !== label) : [...currentLabels, label];
      updateNote(noteId, { labels: newLabels });
    }
  };

  const deleteLabelGlobal = async (labelName) => {
    try {
      await axios.delete(`http://localhost:5000/api/label/${userId}/${labelName}`);
      setAvailableLabels(prev => prev.filter(l => l.name !== labelName));
      setNotes(prev => prev.map(n => ({ ...n, labels: (n.labels || []).filter(l => l !== labelName) })));
    } catch (err) { toastr.error("Delete failed"); }
  };

  // --- FILTER LOGIC ---
  const filteredNotes = notes.filter(note => {
    const searchLower = searchQuery.toLowerCase();
    return searchQuery === "" 
      ? true 
      : (note.title?.toLowerCase().includes(searchLower) || 
         note.content?.toLowerCase().includes(searchLower));
  });
  
const updateNote = async (id, updates) => {
    try {
      // LOGIC: If a note is being pinned, it must be unarchived
      let finalUpdates = { ...updates };
      if (updates.pinned === true) {
        finalUpdates.archived = false;
        toastr.success("Note unarchived and pinned");
      }

      const res = await axios.put(`http://localhost:5000/api/notes/edit/${id}`, finalUpdates);
      
      // If the note is now unarchived or trashed, remove it from the Archive view
      if (finalUpdates.archived === false || finalUpdates.trashed === true) {
        setNotes(prev => prev.filter(n => n._id !== id));
      } else {
        setNotes(prev => prev.map(n => n._id === id ? res.data : n));
      }
    } catch (err) { 
      toastr.error("Update failed"); 
    }
  };


  const handleMakeCopy = async (note) => {
    try {
      const { _id, createdAt, updatedAt, ...copyData } = note;
      const res = await axios.post(`http://localhost:5000/api/notes`, { ...copyData, userId });
      if (res.data.archived) setNotes(prev =>
  addToBottom
    ? [...prev, res.data]   // add to bottom
    : [res.data, ...prev]   // add to top
);
      toastr.success("Note copied");
    } catch (err) { toastr.error("Copy failed"); }
  };

  const getToggledListState = (item) => {
    if (!item.isList) {
      const items = (item.content || "").split('\n').filter(t => t.trim()).map(t => ({ text: t, checked: false }));
      return { isList: true, listItems: items.length > 0 ? items : [{ text: "", checked: false }], content: "" };
    } else {
      const text = (item.listItems || []).map(i => i.text).join('\n');
      return { isList: false, listItems: [], content: text };
    }
  };

  const handleImageUpload = async (e, id) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const compressed = reader.result;
      const targetNote = id === 'modal' ? editingNote : notes.find(n => n._id === id);
      const updatedImages = [...(targetNote.images || []), compressed];
      if (id === 'modal') {
        dispatch({ type: "SET_STATE", payload: { images: updatedImages } });
      } else {
        updateNote(id, { images: updatedImages });
      }
    };
  };
  useEffect(() => {
  const handleKeyDown = (e) => {
    // Ctrl+A (Windows) or Cmd+A (Mac)
    if ((e.ctrlKey || e.metaKey) && e.key === "a") {
      e.preventDefault(); // prevent browser text select
      // select all filtered notes
      setSelectedNotes(filteredNotes.map(note => note._id));
    }

    // Optional: Ctrl+D to deselect all
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") {
      e.preventDefault();
      setSelectedNotes([]);
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [filteredNotes]);

  useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest('.menu-trigger')) {
        setActiveMenu({ id: null, type: null });
        setLabelSearch("");
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // --- REUSABLE LABEL POPOVER ---
  const LabelPopover = ({ currentSelection, onToggle, isModal = false }) => {
    const filtered = availableLabels.filter(l => l.name.toLowerCase().includes(labelSearch.toLowerCase()));
    const showCreate = labelSearch.trim().length > 0 && !availableLabels.some(l => l.name.toLowerCase() === labelSearch.toLowerCase().trim());
    
    return (
      <div className={`label-popover shadow ${isModal ? 'modal-pop' : 'card-pop'}`} onClick={e => e.stopPropagation()}>
        <div className="label-search-container p-2">
          <input autoFocus placeholder="Enter label name" className="label-search-input" value={labelSearch} onChange={(e) => setLabelSearch(e.target.value)} />
          {/* <MdSearch className="search-icon" /> */}
        </div>
        <div className="label-list-scroll">
          {filtered.map(l => (
            <div key={l._id} className="label-item d-flex align-items-center px-2 py-1">
              <input type="checkbox" checked={currentSelection.includes(l.name)} onChange={() => onToggle(l.name)} className="me-2" />
              <span className="flex-grow-1" onClick={() => onToggle(l.name)}>{l.name}</span>
              <MdOutlineDelete className="delete-label-icon" onClick={(e) => { e.stopPropagation(); deleteLabelGlobal(l.name); }} />
            </div>
          ))}
          {showCreate && (
            <div className="label-item create-btn px-2 py-2" onClick={() => handleAddNewLabel(labelSearch)}>
              <MdAdd className="me-2" /> Create "<strong>{labelSearch}</strong>"
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) return <div className="loading-msg">Loading Archive...</div>;

  return (
    <div className="keep-wrapper">
      <input type="file" hidden ref={editFileInputRef} onChange={(e) => handleImageUpload(e, 'modal')} />
      <input type="file" hidden ref={cardFileInputRef} onChange={(e) => handleImageUpload(e, cardUploadId)} />
        <main className="content-area">
{isSelectionMode && (
 <div
  className="selection-bar"
  style={{
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    height: "60px",
    background: theme === "dark" ? "#fff":"rgb(32, 33, 36)",
    borderBottom: theme === "dark" ? "1px solid #181818":"1px solid #e0e0e0",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 24px",
    zIndex: 2000,
  }}
>
  {/* LEFT SIDE */}
  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
    <MdClose
      size={22}
      style={{ cursor: "pointer" }}
      onClick={() => {
        setSelectedNotes([]);
        setActiveMenu({ id: null, type: null });
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

  {/* RIGHT SIDE */}
  <div style={{ display: "flex", alignItems: "center", gap: "24px", position: "relative" }}>
    {/* Archive */}
    <MdUnarchive size={22} style={{ cursor: "pointer",color: theme === "dark"?"#d9d9d9":"blue" }} onClick={ bulkUnarchive} />

    {/* Copy */}
    {/* <MdContentCopy size={22} style={{ cursor: "pointer" }} onClick={bulkCopy} /> */}

    {/* Pin */}
    <MdPushPin
      className=""
       size={22} 
      style={{ cursor: "pointer", color: theme === "dark"?"#d9d9d9":"blue" }}
      title="Toggle pin for selected notes"
      onClick={bulkTogglePin}
    />

    {/* Reminder */}
   <div className="menu-trigger" style={{ position: "relative" }}>
  <MdOutlineNotificationsActive
        size={22}
        style={{ cursor: "pointer",color: theme === "dark"?"#d9d9d9":"blue"  }}
        onClick={() =>
          setActiveMenu((prev) =>
            prev.id === "bulk" && prev.type === "reminder"
              ? { id: null, type: null }
              : { id: "bulk", type: "reminder" }
          )
        }
      />
      {activeMenu.id === "bulk" && activeMenu.type === "reminder" && (
  <div
  onClick={(e) => e.stopPropagation()}
  style={{
    position: "absolute",
    top: "0px",
    right: "270px",
    background: "#fff",
    boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
    borderRadius: "8px",
    zIndex: 3000,
  }}
>
          <ReminderPopover
            currentReminder={null} // bulk mode
            onSave={(reminderObj) => {
              if (!reminderObj || !reminderObj.date) {
                toastr.error("Please select a valid reminder");
                return;
              }
              bulkAddReminder({
                date: reminderObj.date,
                repeat: reminderObj.repeat || "none",
                active: true,
              });
             
            }}
            onClose={() => setActiveMenu({ id: null, type: null })}
          />
        </div>
      )}
    </div>

    {/* Color Picker */}
    <div className="menu-trigger">
      <MdOutlinePalette
        size={22} 
        style={{color: theme === "dark"?"#d9d9d9":"blue" }}
        onClick={() => setActiveMenu({ id: "create", type: "palette" })}
      />
      {activeMenu.id === "create" && activeMenu.type === "palette" && (
        <div
  className="palette-popover shadow"
  style={{ position: "absolute", top: "35px", right: "20px" }}
>

  {/* DEFAULT */}
<div
  className="color-circle default"
  onClick={() => bulkChangeColor(null, "")}
>
  <MdOutlineFormatColorReset size={18} />
</div>

  {/* COLORS */}
  {COLORS.map((c) => (
    <div
      key={c}
      className="color-circle"
      style={{ backgroundColor: c }}
      onClick={() => bulkChangeColor(c, "")}
    />
  ))}

  {/* REMOVE BACKGROUND */}
  <div
    className="bg-circle default"
    onClick={() => bulkChangeColor(null, "")}
  >
    <MdOutlineImageNotSupported size={18} />
  </div>

  {/* BACKGROUNDS */}
  {BACKGROUNDS.map((bg) => (
    <div
      key={bg}
      className="bg-circle"
      style={{ backgroundImage: `url(${bg})` }}
      onClick={() => bulkChangeColor(null, bg)}
    />
  ))}

</div>
      )}
    </div>

    {/* MORE MENU (Delete + Labels) */}
    <div className="menu-trigger">
      <MdOutlineMoreVert
        size={22}
        style={{color: theme === "dark"?"#d9d9d9":"blue" }}
        onClick={() =>
          setActiveMenu((prev) =>
            prev.id === "bulk" && prev.type === "more"
              ? { id: null, type: null }
              : { id: "bulk", type: "more" }
          )
        }
      />

      {activeMenu.id === "bulk" && activeMenu.type === "more" && (
        <div  style={{position:"relative"}}>
          <div className=" shadow card-pop" style={{ position: "absolute", top: "20px", right: "10px" , width:"160px" }}>
          <div className="menu-item p-2" onClick={bulkDelete}>
            <MdOutlineDelete className="me-3" /> Delete
          </div>
          <div className="menu-item p-2" onClick={bulkCopy}  >
            <MdContentCopy className="me-3" /> Make copies
          </div>
         
          <div className="menu-item p-2" onClick={() => setActiveMenu({ id: "bulk", type: "label" })}>
            <MdOutlineLabel className="me-3" /> Edit Labels
          </div>
        </div>
        </div>
      )}

      {/* Label Popover inside more menu */}
      {activeMenu.id === "bulk" && activeMenu.type === "label" && (
        <div  style={{position:"relative",right:"210px",top:35}} >
        <LabelPopover 
       
          currentSelection={[]} // bulk, start empty
          onToggle={(label) => {
            bulkUpdateLabels(label);
          }}
        />
        </div>
      )}
    </div>
  </div>
</div>
)}
        <h5 className="section-label-main px-4 mt-4">Archive</h5>
        
        <div className="notes-container mt-3">
            {notes.length === 0 ? (
                <div className="empty-state text-center mt-5">
                    <MdOutlineArchive className="empty-icon text-muted" size={120} style={{opacity: 0.2}} />
                    <p className="text-muted fs-4">Your archived notes appear here</p>
                </div>
            )  :filteredNotes.length === 0 && searchQuery ? ( 
                <div className="empty-state text-center mt-5">
                    <MdSearch className="empty-icon text-muted" size={120} style={{opacity: 0.2}} />
                    <p className="text-muted fs-4">No archived notes match your search</p>
                </div>
            ) : (
                <div className={`notes-${viewMode} p-4`}>
                  
                  
                   {filteredNotes.map(note => (
                    <NoteCard 
                    
                    
                        key={note._id} 
                        note={note} 
                        // NoteCard uses this onUpdate for the pin button
                        onUpdate={updateNote} 
                        onCopy={handleMakeCopy}
                        onClick={() => dispatch({ type: "RESET", payload: note })}
                        activeMenu={activeMenu}
                        setActiveMenu={setActiveMenu}
                        triggerImageUpload={() => { setCardUploadId(note._id); cardFileInputRef.current.click(); }}
                        getToggledListState={getToggledListState}
                        LabelPopover={LabelPopover}
                        handleLabelToggle={handleLabelToggle}
                         isSelected={selectedNotes.includes(note._id)}
  toggleSelect={toggleSelectNote}
  isSelectionMode={selectedNotes.length > 0}
                    />
                    
                ))}
                </div>
            )}
        </div>
      </main>

      {/* EDIT MODAL SECTION */}
      {editingNote && (
        <div className="modal-overlay" onClick={() => { updateNote(editingNote._id, editingNote); dispatch({ type: "RESET", payload: null }); }}>
          <div className="edit-modal shadow"   style={{
    backgroundColor: editingNote.color,
    backgroundImage: editingNote.background ? `url(${editingNote.background})` : "none",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat"
  }} onClick={e => e.stopPropagation()}>
            <div className="modal-image-grid">
              {editingNote.images?.map((img, i) => (
                <div key={i} className="input-img-wrapper">
                  <img src={img} alt="" />
                  <MdClose className="remove-img-btn" onClick={() => dispatch({ type: "SET_STATE", payload: { images: editingNote.images.filter((_, idx) => idx !== i) }})} />
                </div>
              ))}
            </div>
            
            <div className="d-flex justify-content-between px-3 pt-3">
              <input className="title-input w-100" value={editingNote.title} onChange={e => dispatch({ type: "SET_STATE", payload: { title: e.target.value }})} />
          <MdPushPin 
                className={editingNote.pinned ? 'pin active' : 'pin'} 
                onClick={() => {
                   const isPinned = !editingNote.pinned;
                   if (isPinned) {
                     // If pinning inside the modal, we save immediately and close 
                     // because the note is moving out of Archive
                     updateNote(editingNote._id, { ...editingNote, pinned: true, archived: false });
                     dispatch({ type: "RESET", payload: null });
                   } else {
                     dispatch({ type: "SET_STATE", payload: { pinned: false }});
                   }
                }} 
              />
            </div>

            {editingNote.isList ? (
              <div className="px-3 py-2">
                {editingNote.listItems?.map((item, idx) => (
                  <div key={idx} className="d-flex align-items-center mb-1">
                    <input type="checkbox" checked={item.checked} onChange={() => {
                      const newItems = [...editingNote.listItems];
                      newItems[idx].checked = !newItems[idx].checked;
                      dispatch({ type: "SET_STATE", payload: { listItems: newItems }});
                    }} />
                    <input className="list-item-input ms-2" value={item.text} onChange={e => {
                      const newItems = [...editingNote.listItems];
                      newItems[idx].text = e.target.value;
                      dispatch({ type: "SET_STATE", payload: { listItems: newItems }});
                    }} />
                  </div>
                ))}
              </div>
            ) : (
              <textarea className="content-input px-3 w-100" style={{ minHeight: '150px' }} value={editingNote.content} onChange={e => dispatch({ type: "SET_STATE", payload: { content: e.target.value }})} />
            )}

       <div className="px-3 d-flex flex-wrap gap-1 mb-2">
  {editingNote.labels?.map(l => (
    <span key={l} className="label-badge">
      {l}

      <MdClose
        className="label-remove"
        onClick={() => handleLabelToggle(l, true)}
      />
    </span>
  ))}
</div>

            <div className="toolbar d-flex justify-content-between p-2">
              <div className="toolbar-icons d-flex align-items-center">
          <div className="menu-trigger">
  <MdOutlineNotificationsActive
    onClick={() =>
      setActiveMenu({ id: "modal", type: "reminder" })
    }
  />

  {activeMenu.id === "modal" &&
    activeMenu.type === "reminder" && (
 <ReminderPopover
  currentReminder={editingNote.reminder}
  onSave={(reminderObj) => {

    if (!reminderObj?.date) {
      toastr.error("Invalid reminder date");
      return;
    }

    dispatch({
      type: "SET_STATE",
      payload: {
        reminder: {
          date: reminderObj.date,
          repeat: reminderObj.repeat || "none",
          active: true
        }
      }
    });

  }}
  onClose={() => setActiveMenu({ id: null, type: null })}
/>
    )}
</div>
  <div className="menu-trigger">
                <MdUndo className={editState.past.length === 0 ? "disabled" : ""} onClick={() => dispatch({ type: "UNDO" })} /></div>  <div className="menu-trigger">
                <MdRedo className={editState.future.length === 0 ? "disabled" : ""} onClick={() => dispatch({ type: "REDO" })} /></div>  <div className="menu-trigger">
                <MdOutlineImage onClick={() => editFileInputRef.current.click()} /></div>  
                <div className="menu-trigger">
                  <MdOutlinePalette onClick={() => setActiveMenu({ id: 'modal', type: 'palette' })} />
                  {activeMenu.id === 'modal' && activeMenu.type === 'palette' && (
                   <div className="palette-popover shadow modal-pop">

  {/* NO COLOR */}
 <div
  className="color-circle default"
  onClick={() =>
    dispatch({
      type: "SET_STATE",
      payload: { color: null, background: "" }
    })
  }
>
    <MdOutlineFormatColorReset size={18} />
  </div>

  {/* COLORS */}
  {COLORS.map(c => (
    <div
      key={c}
      className={`color-circle ${editingNote.color === c ? "active" : ""}`}
      style={{ backgroundColor: c }}
      onClick={() => dispatch({
        type: "SET_STATE",
        payload: { color: c, background: "" }
      })}
    />
  ))}

  {/* NO IMAGE */}
  <div
    className="bg-circle default"
    onClick={() => dispatch({
      type: "SET_STATE",
      payload: { background: "" }
    })}
  >
    <MdOutlineImageNotSupported size={18} />
  </div>

  {/* BACKGROUND IMAGES */}
  {BACKGROUNDS.map(bg => (
    <div
      key={bg}
      className={`bg-circle ${editingNote.background === bg ? "active" : ""}`}
      style={{ backgroundImage: `url(${bg})` }}
      onClick={() => dispatch({
        type: "SET_STATE",
        payload: { background: bg }
      })}
    />
  ))}

</div>
                  )}
                </div>
                <MdUnarchive onClick={() => { updateNote(editingNote._id, { ...editingNote, archived: false }); dispatch({ type: "RESET", payload: null }); }} title="Unarchive" />
                
                <div className="menu-trigger">
                  <MdOutlineMoreVert onClick={() => setActiveMenu({ id: 'modal', type: 'more' })} />
                  {activeMenu.id === 'modal' && activeMenu.type === 'more' && (
                    <div className="more-menu-popover shadow modal-pop">
                     <div 
  className="menu-item p-2" 
  onClick={() => {
    // Assuming you want to toggle the list mode for the current note
    dispatch({ type: "SET_STATE", payload: getToggledListState(editingNote) });
  }}
>
  {editingNote.isList ? (
    <>
      <MdCheckBox className="me-2" style={{ fontSize: '18px' }} />
      Hide checkboxes
    </>
  ) : (
    <>
      <MdCheckBoxOutlineBlank className="me-2" style={{ fontSize: '18px' }} />
      Show checkboxes
    </>
  )}
</div>
                      <div className="menu-item p-2" onClick={() => { updateNote(editingNote._id, { trashed: true }); dispatch({ type: "RESET", payload: null }); }}>
                        <MdOutlineDelete /> Delete
                      </div>
                         <div className="menu-item p-2" onClick={() => handleMakeCopy(editingNote)}><MdContentCopy /> Make a copy
                </div>
                      <div className="menu-item p-2" onClick={() => setActiveMenu({ id: 'modal', type: 'label' })}>
                        
                        <MdOutlineLabel /> Labels
                      </div>
                    </div>
                  )}
                  {activeMenu.id === 'modal' && activeMenu.type === 'label' && (
                    <LabelPopover isModal={true} currentSelection={editingNote.labels || []} onToggle={(l) => handleLabelToggle(l, true)} />
                  )}
                </div>
              </div>
              <button className="btn-close-note" onClick={() => { updateNote(editingNote._id, editingNote); dispatch({ type: "RESET", payload: null }); }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const NoteCard = ({ 
  note, 
  onUpdate, 
  onCopy, 
  onClick, 
  activeMenu, 
  setActiveMenu, 
  triggerImageUpload, 
  getToggledListState, 
  LabelPopover, 
  handleLabelToggle,
  isSelected,
  toggleSelect,
  isSelectionMode
}) => {
  const [hover, setHover] = useState(false);
   const { theme } = useTheme();

  return (
    
    <div className="note-card" style={{
    backgroundColor: note.color || undefined,
    backgroundImage: note.background ? `url(${note.background})` : "none",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    border: isSelected
  ? (theme === "dark" ? "2px solid white" : "2px solid black")
  : (theme === "dark" ? "1px solid #444" : "1px solid rgb(215,213,213)"),
     
  }} onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
     {/* CHECKBOX */}
  <div
  className={`select-checkbox ${isSelected ? "selected" : ""}`}
  onClick={(e) => {
    e.stopPropagation();
    toggleSelect(note._id);
  }}
  >
    {isSelected ? <MdCheck size={22} className="selected-icon"  /> : <MdCheck size={22} className="selected-icon"  />}
  </div>

      <MdPushPin className={`pin-btn ${note.pinned ? 'active visible' : ''} ${hover ? 'visible' : ''}`} onClick={(e) => { e.stopPropagation(); onUpdate(note._id, { pinned: !note.pinned }); }} />
      
      {note.images?.length > 0 && (
        <div className="card-image-grid">
           {note.images.slice(0, 4).map((img, idx) => (
             <img key={idx} src={img} className="card-grid-img" alt="" />
           ))}
        </div>
      )}

      <div className="p-3">
        {note.reminder?.date && (
  <ReminderChip
    reminder={note.reminder}
    onRemove={() => onUpdate(note._id, { reminder: null })}
    onToggleComplete={(rem) =>
      onUpdate(note._id, {
        reminder: { ...rem, active: !rem.active }
      })
    }
  />
)}
        <div className="fw-bold">{note.title}</div>
        {note.isList ? (
          <div className="card-content-text  mt-1">
            {note.listItems?.slice(0, 6).map((item, i) => (
              <div key={i} className="d-flex align-items-center mb-1">
                {item.checked ? <MdCheckBox size={14} className="text-muted" /> : <MdCheckBoxOutlineBlank size={14} className="text-muted" />}
                <span className={`ms-2 ${item.checked ? 'text-decoration-line-through text-muted' : ''}`}>{item.text}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="card-content-text s mt-1 text-truncate-custom">{note.content}</div>
        )}

      <div className="d-flex flex-wrap gap-1 mt-2">
{note.labels?.map(l => (
  <span key={l} className="label-badge-static">
    {l}

    <MdClose
      className="label-remove"
      onClick={(e) => {
        e.stopPropagation();

        const newLabels = note.labels.filter(label => label !== l);

        onUpdate(note._id, { labels: newLabels });
      }}
    />
  </span>
))}
</div>
        <div className={`card-toolbar d-flex justify-content-between mt-3 ${hover || activeMenu.id === note._id ? 'opacity-100' : 'opacity-0'}`} onClick={e => e.stopPropagation()}>
         <div className="menu-trigger">
  <MdOutlineNotificationsActive
    onClick={() =>
      setActiveMenu({ id: note._id, type: "reminder" })
    }
  />

  {activeMenu.id === note._id &&
    activeMenu.type === "reminder" && (
     <ReminderPopover
  currentReminder={note.reminder}
  onSave={(newReminder) =>
    onUpdate(note._id, { reminder: newReminder })
  }
  onClose={() => setActiveMenu({ id: null, type: null })}
/>
    )}
</div>
          <div className="menu-trigger">
            <MdOutlinePalette onClick={() => setActiveMenu({ id: note._id, type: 'palette' })} />
            {activeMenu.id === note._id && activeMenu.type === 'palette' && (
             <div className="palette-popover shadow card-pop">

  {/* NO COLOR */}
<div
  className="color-circle default"
  onClick={() => onUpdate(note._id, { color: null, background: "" })}
>
  <MdOutlineFormatColorReset size={18} />
</div>
  {/* COLORS */}
{COLORS.map(c => (
  <div
    key={c}
    className={`color-circle ${note.color === c ? "active" : ""}`}
    style={{ backgroundColor: c }}
    onClick={() => onUpdate(note._id, { color: c })}
  />
))}
  {/* NO IMAGE */}
  <div
    className="bg-circle default"
    onClick={() => onUpdate(note._id, { background: "" })}
  >
    <MdOutlineImageNotSupported size={18} />
  </div>

  {/* BACKGROUND IMAGES */}
{BACKGROUNDS.map((bg) => (
  <div
    key={bg}
    className={`bg-circle ${note.background === bg ? "active" : ""}`}
    style={{ backgroundImage: `url(${bg})` }}
    onClick={() => onUpdate(note._id, { background: bg })}
  />
))}

</div>
            )}
          </div>
         <div className="menu-trigger">  <MdOutlineImage onClick={triggerImageUpload} /></div> 
           <div className="menu-trigger"><MdUnarchive onClick={() => onUpdate(note._id, { archived: false })} title="Unarchive" /></div> 
          
          <div className="menu-trigger">
            <MdOutlineMoreVert onClick={() => setActiveMenu({ id: note._id, type: 'more' })} />
            {activeMenu.id === note._id && activeMenu.type === 'more' && (
              <div className="more-menu-popover shadow card-pop">
             <div 
                  className="menu-item p-2" 
                  onClick={() => onUpdate(note._id, getToggledListState(note))}
                >
                  {note.isList ? (
                    <>
                      <MdCheckBox className="me-2" />
                      Hide checkboxes
                    </>
                  ) : (
                    <>
                      <MdCheckBoxOutlineBlank className="me-2" />
                      Show checkboxes
                    </>
                  )}
                </div>
                <div className="menu-item p-2" onClick={() => onUpdate(note._id, { trashed: true })}>
                  <MdOutlineDelete /> Delete
                </div>
                <div className="menu-item p-2" onClick={() => onCopy(note)}>
                  <MdContentCopy /> Make a copy
                </div>
                <div className="menu-item p-2" onClick={() => setActiveMenu({ id: note._id, type: 'label' })}>
                  <MdOutlineLabel /> Labels
                </div>
              </div>
            )}
            {activeMenu.id === note._id && activeMenu.type === 'label' && (
               <LabelPopover 
                currentSelection={note.labels || []} 
                onToggle={(l) => handleLabelToggle(l, false, note._id)} 
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Archive;