  import React, { useState, useEffect, useRef, useReducer } from "react";
  import { useParams, useLocation } from "react-router-dom"; // Added useLocation
  // <--- Added for filtering
  import axios from "axios";
  

  import { 
    MdPushPin, MdOutlinePalette, MdOutlineImage, MdOutlineArchive, 
    MdOutlineMoreVert, MdClose, MdOutlineDelete, MdOutlineLabel, 
    MdContentCopy, MdUndo, MdRedo, MdList, MdCheckBoxOutlineBlank, MdArrowBack,MdRepeat,MdCheck,
    MdCheckBox, MdOutlineNotificationsActive, MdAdd, MdSearch,MdOutlineFormatColorReset,MdOutlineImageNotSupported
  } from "react-icons/md";
  import { FaRegCheckSquare } from "react-icons/fa";
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
  import bg10 from "../../../assets/bg/b10";
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
        if (JSON.stringify(present) === JSON.stringify(action.payload)) return state;
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
  if (!reminderObj || !reminderObj.date) {
    toastr.error("Please select a valid reminder");
    return;
  }
  onSave({
    date: reminderObj.date,
    repeat: reminderObj.repeat || "none",
    active: true,
  });
  onClose();
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
        onSave={(iso) => saveReminder(iso)}
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
    setShowCalendar(false);
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
  onClick={() => setShowTimeMenu(true)}
>
<input
  type="text"
  defaultValue={getTimeValue(selectedDate)}
  onChange={(e) => {
    const value = e.target.value;

    if (!/^[0-9:]*$/.test(value)) return;

    const [h, m] = value.split(":");

    if (h?.length === 2 && m?.length === 2) {

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
        padding: "2px 8px",
        marginTop:10,
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


const Content = () => {
      const { viewMode } = useView();  
      const { theme } = useTheme();
    if (viewMode === "grid") {
    console.log("Grid View Active");
  } else {
    console.log("List View Active");
  }
    const { labelName } = useParams(); // <--- Detects /label/:labelName from URL
    const [notes, setNotes] = useState([]);
   const addToBottom = JSON.parse(localStorage.getItem("addToBottom")) || false;

const sortNotes = (notesArray) => {
  if (!addToBottom) return notesArray;

  return [...notesArray].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );
};
    const [selectedNotes, setSelectedNotes] = useState([]);
const isSelectionMode = selectedNotes.length > 0;

const [showColorMenu, setShowColorMenu] = useState(false);
const [showReminderMenu, setShowReminderMenu] = useState(false);
const [bulkActionType, setBulkActionType] = useState(null);

    
    const [availableLabels, setAvailableLabels] = useState([]);
    const [labelSearch, setLabelSearch] = useState("");
    const [expanded, setExpanded] = useState(false);
    const [editingNote, setEditingNote] = useState(null);
    const [activeMenu, setActiveMenu] = useState({ id: null, type: null });
    const [cardUploadId, setCardUploadId] = useState(null);
    const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const isReminderPage = location.pathname.includes("reminder");
  const searchQuery = queryParams.get("q") || "";

    const [noteState, dispatch] = useReducer(historyReducer, {
      past: [],
      present: { 
  title: "", 
  content: "", 
  images: [], 
 color: theme === "dark" ? "#202124" : "#ffffff",
  reminder:null,
  background: "", 
  pinned: false, 
  labels: [], 
  isList: false, 
  listItems: [] 
  },
      future: []
    });

    const { 
      title = "", content = "", images = [],  color: noteColor = theme === "dark" ? "#202124" : "#ffffff", background = "",reminder = null,
      pinned = false, labels = [], isList = false, listItems = [] 
    } = noteState?.present || {};

    const userId = JSON.parse(localStorage.getItem("user"))?.id;
    const createNoteRef = useRef(null);
    const fileInputRef = useRef(null);
    const editFileInputRef = useRef(null);
    const cardFileInputRef = useRef(null);

    useEffect(() => { 
      fetchNotes(); 
      fetchLabels();
    }, [userId]);
// useEffect(() => {

//   const checkReminders = async () => {

//     const now = new Date();

//     for (const note of notes) {

//       if (!note.reminder || !note.reminder.active) continue;

//       const reminderTime = new Date(note.reminder.date);
//       const emailTime = new Date(reminderTime.getTime() - 10 * 60 * 1000);

//       // send email 10 minutes before
//       if (now >= emailTime && !note.reminder.emailSent) {

//         try {
//           await axios.post("http://localhost:5000/api/reminder/email", {
//             noteId: note._id
//           });

//           console.log("Reminder email triggered");

//         } catch (err) {
//           console.error("Email send failed", err);
//         }

//       }

//       // show notification at exact reminder time
//       if (now >= reminderTime && note.reminder.active) {

//         if (Notification.permission === "granted") {
//           new Notification("Reminder", {
//             body: note.title || "You have a reminder",
//           });
//         }

//         toastr.info(
//           note.title || "Reminder",
//           "Reminder Notification",
//           { closeButton: true }
//         );

//         await axios.put(`http://localhost:5000/api/notes/edit/${note._id}`, {
//           reminder: {
//             ...note.reminder,
//             active: false
//           }
//         });

//       }

//     }

//   };

//   const interval = setInterval(checkReminders, 60000);

//   return () => clearInterval(interval);

// }, [notes]);

    const toggleSelectNote = (noteId) => {
  setSelectedNotes(prev =>
    prev.includes(noteId)
      ? prev.filter(id => id !== noteId)
      : [...prev, noteId]
  );
};

useEffect(() => {
  if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission();
  }
}, []);


const bulkArchive = async () => {
  try {
    // ✅ Update UI instantly
    setNotes(prev =>
      prev.map(note =>
        selectedNotes.includes(note._id)
          ? { ...note, archived: true }
          : note
      )
    );

    await Promise.all(
      selectedNotes.map(id =>
        axios.put(`http://localhost:5000/api/notes/edit/${id}`, { archived: true })
      )
    );

    setSelectedNotes([]);
    toastr.success("Notes archived");
  } catch (error) {
    console.error("Bulk archive error:", error);
    toastr.error("Archive failed");
    fetchNotes();
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

    await Promise.all(
      selectedNotes.map(id =>
        axios.put(`http://localhost:5000/api/notes/edit/${id}`, { trashed: true })
      )
    );

    setSelectedNotes([]);
    toastr.success("Notes deleted");
  } catch (error) {
    console.error("Bulk delete error:", error);
    toastr.error("Delete failed");
    fetchNotes();
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
          color: color ,
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
    fetchNotes();
  }
};
const bulkAddReminder = async (reminderObj) => {
  if (!reminderObj || !reminderObj.date) return;

  try {
    // Update UI instantly
    setNotes((prev) =>
      prev.map((note) =>
        selectedNotes.includes(note._id)
          ? { ...note, reminder: reminderObj }
          : note
      )
    );

    // Backend update
    await Promise.all(
      selectedNotes.map((id) =>
        axios.put(`http://localhost:5000/api/notes/edit/${id}`, {
          reminder: reminderObj,
        })
      )
    );

    setSelectedNotes([]);
    setActiveMenu({ id: null, type: null });
    toastr.success("Reminders updated");
  } catch (err) {
    console.error(err);
    toastr.error("Failed to update reminders");
    fetchNotes();
  }
};
const bulkUpdateLabels = async (label) => {
  if (!label) return; // nothing to update

  try {
    // Remove duplicate note IDs
    const uniqueSelected = [...new Set(selectedNotes)];

    // Update UI instantly
    setNotes(prev =>
      prev.map(note => {
        if (uniqueSelected.includes(note._id)) {
          // ensure labels is an array and unique
          const newLabels = Array.isArray(note.labels) ? [...note.labels] : [];
          if (!newLabels.includes(label)) newLabels.push(label);
          return { ...note, labels: newLabels };
        }
        return note;
      })
    );

    // Update backend
    await Promise.all(
      uniqueSelected.map(id => {
        const note = notes.find(n => n._id === id);
        const newLabels = Array.isArray(note?.labels) ? [...note.labels] : [];
        if (!newLabels.includes(label)) newLabels.push(label);
        return axios.put(`http://localhost:5000/api/notes/edit/${id}`, { labels: newLabels });
      })
    );

    toastr.success("Labels updated");
    // ✅ keep selectedNotes so multi-choice is possible
  } catch (err) {
    console.error("Bulk label error:", err);
    toastr.error("Failed to update labels");
    fetchNotes(); // revert changes
  }
};
const bulkTogglePin = async () => {
  try {
    // Update UI instantly
    setNotes(prev =>
      prev.map(note =>
        selectedNotes.includes(note._id)
          ? { ...note, pinned: !note.pinned } // toggle pinned
          : note
      )
    );

    // Update backend
    await Promise.all(
      selectedNotes.map(id =>
        axios.put(`http://localhost:5000/api/notes/edit/${id}`, {
          pinned: notes.find(n => n._id === id)?.pinned ? false : true
        })
      )
    );

    setSelectedNotes([]);
    toastr.success("Pinned status updated");
  } catch (err) {
    console.error(err);
    toastr.error("Failed to update pinned status");
    fetchNotes();
  }
};
// BULK COPY FUNCTION
const bulkCopy = () => {
  if (selectedNotes.length === 0) return;

  // Filter selected notes
  const notesToCopy = notes.filter(note => selectedNotes.includes(note._id));

  // Remove _id, createdAt, updatedAt from each note
  const copiedNotes = notesToCopy.map(({ _id, createdAt, updatedAt, ...copyData }) => copyData);

  // Add copies using your existing addNote function
  copiedNotes.forEach(copyData => addNote(copyData));

  toastr.success(`${copiedNotes.length} notes copied!`);
  setSelectedNotes([]); // reset selection
  setActiveMenu({ id: null, type: null });
};
    const fetchNotes = async () => {
      if (!userId) return;
      try {
        const res = await axios.get(`http://localhost:5000/api/notes/${userId}`);
       const addToBottom = JSON.parse(localStorage.getItem("addToBottom")) || false;

let notesData = res.data;

if (addToBottom) {
  notesData = [...notesData].reverse();
}

setNotes(notesData ||[]);
      } catch (err) { console.error("Fetch error", err); }
    };

    const fetchLabels = async () => {
      if (!userId) return;
      try {
        const res = await axios.get(`http://localhost:5000/api/label/${userId}`);
        setAvailableLabels(res.data || []);
      } catch (err) { console.error("Label fetch error", err); }
    };

    // --- FILTER LOGIC ---
    // If labelName exists in URL, filter notes that include that label.
    // Otherwise, show all non-archived/non-trashed notes.
  // --- UPDATED FILTER LOGIC (SEARCH + LABELS) ---
  // --- UPDATED FILTER LOGIC (SEARCH + LABELS + ARCHIVE HANDLING) ---
  const filteredNotes = notes.filter(note => {
    // 1. Always hide Trashed notes
    if (note.trashed) return false;

    // 2. Archive Logic: 
    // If we are NOT in a specific label view, hide archived notes.
    // If we ARE in a label view, show them (we will separate them visually later).
    if (!labelName && note.archived) return false;

    // 3. Filter by Label
    const matchesLabel = labelName 
      ? note.labels && note.labels.includes(labelName) 
      : true;

    // 4. Filter by Search Query
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = searchQuery === "" 
      ? true 
      : (note.title?.toLowerCase().includes(searchLower) || 
        note.content?.toLowerCase().includes(searchLower) ||
        note.listItems?.some(item => item.text.toLowerCase().includes(searchLower)));

    return matchesLabel && matchesSearch;
  });

const sortedNotes = sortNotes(filteredNotes);

    const updateDraft = (payload) => dispatch({ type: "SET_STATE", payload });

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
        toastr.success(`Label "${res.data.name}" created`);
      } catch (err) { toastr.error("Label creation failed"); console.log("user",userId);}
    };

    const deleteLabelGlobal = async (labelName) => {
      try {
        await axios.delete(`http://localhost:5000/api/label/${userId}/${labelName}`);
        setAvailableLabels(prev => prev.filter(l => l.name !== labelName));
        setNotes(prev => prev.map(n => ({ ...n, labels: (n.labels || []).filter(l => l !== labelName) })));
        if (editingNote) setEditingNote(prev => ({ ...prev, labels: (prev.labels || []).filter(l => l !== labelName) }));
      } catch (err) { toastr.error("Delete failed"); }
    };

    const handleLabelToggle = (label, isEditMode = false) => {
      if (isEditMode) {
        const currentLabels = editingNote.labels || [];
        const newLabels = currentLabels.includes(label) ? currentLabels.filter(l => l !== label) : [...currentLabels, label];
        setEditingNote({ ...editingNote, labels: newLabels });
      } else {
        const newLabels = labels.includes(label) ? labels.filter(l => l !== label) : [...labels, label];
        updateDraft({ labels: newLabels });
      }
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

    const now = new Date();

const reminderNotes = notes.filter(note => {
  if (note.trashed) return false;
  if (!note.reminder?.date) return false;
  return true;
});

const upcomingReminders = sortNotes(
  reminderNotes.filter(note => {
    const date = new Date(note.reminder.date);
    return date >= now && note.reminder.active !== false;
  })
);

const repeatingReminders = sortNotes(
  reminderNotes.filter(note => {
    return note.reminder.repeat && note.reminder.repeat !== "none";
  })
);

const pastReminders = sortNotes(
  reminderNotes.filter(note => {
    const date = new Date(note.reminder.date);
    return date < now && note.reminder.active !== false;
  })
);

const completedReminders = sortNotes(
  reminderNotes.filter(note => {
    return note.reminder.active === false;
  })
);
    
    const compressAndValidate = (file, existingImages = []) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
          const img = new Image();
          img.src = event.target.result;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 800; 
            let width = img.width;
            let height = img.height;
            if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
            canvas.width = width; canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
            if (existingImages.includes(compressedBase64)) {
              toastr.warning("This image is already attached.");
              return reject("Duplicate");
            }
            resolve(compressedBase64);
          };
        };
      });
    };

    const handleImageUpload = async (e, target = 'create') => {
      const files = Array.from(e.target.files);
      for (const file of files) {
        try {
          let currentImages = [];
          if (target === 'create') currentImages = images;
          else if (target === 'edit') currentImages = editingNote?.images || [];
          else if (target === 'card') {
            const note = notes.find(n => n._id === cardUploadId);
            currentImages = note?.images || [];
          }
          const compressed = await compressAndValidate(file, currentImages);
          if (target === 'create') {
            updateDraft({ images: [...images, compressed] });
            setExpanded(true);
          } else if (target === 'edit') {
            setEditingNote(prev => ({ ...prev, images: [...(prev.images || []), compressed] }));
          } else if (target === 'card') {
            updateNote(cardUploadId, { images: [...currentImages, compressed] });
          }
        } catch (err) { console.log("Upload skipped:", err); }
      }
      e.target.value = null;
    };

    const toggleListMode = () => updateDraft(getToggledListState(noteState.present));

    const addNote = async (overrideData = null) => {
      const payload = overrideData || { ...noteState.present, userId };
      
      // Auto-apply active label filter to new notes
      if (!overrideData && labelName && !payload.labels.includes(labelName)) {
        payload.labels.push(labelName);
      }

      const isEmpty = !payload.title?.trim() && !payload.content?.trim() && (!payload.images || payload.images.length === 0) && (!payload.listItems || payload.listItems.every(item => !item.text.trim()));
      if (isEmpty && !overrideData) { setExpanded(false); dispatch({ type: "RESET", payload: { title: "", content: "", images: [], color: theme === "dark" ? "#202124" : "#ffffff",background: "", pinned: false, labels: [],reminder: null, isList: false, listItems: [] } }); return; }
      try {
        const res = await axios.post(`http://localhost:5000/api/notes`, payload);
      setNotes(prev =>
  addToBottom
    ? [...prev, res.data]   // add to bottom
    : [res.data, ...prev]   // add to top
);
        if (!overrideData) {
          dispatch({ type: "RESET", payload: { title: "", content: "", images: [],  color: theme === "dark" ? "#202124" : "#ffffff",background: "", pinned: false, labels: [],reminder :null, isList: false, listItems: [] } });
          setExpanded(false);
        }
        toastr.success(overrideData ? "Note copied" : "Note saved");
      } catch (err) { toastr.error("Action failed."); }
    };

    const updateNote = async (id, updates) => {
      try {
        const res = await axios.put(`http://localhost:5000/api/notes/edit/${id}`, updates);
        setNotes(notes.map(n => n._id === id ? res.data : n));
      } catch (err) { toastr.error("Update failed"); }
    };

    const handleMakeCopy = (note) => {
      const { _id, createdAt, updatedAt, ...copyData } = note;
      addNote(copyData);
      setActiveMenu({ id: null, type: null });
    };

    useEffect(() => {
      const handleClick = (e) => {
        if (expanded && createNoteRef.current && !createNoteRef.current.contains(e.target)) addNote();
        if (!e.target.closest('.menu-trigger')) { setActiveMenu({ id: null, type: null }); setLabelSearch(""); }
      };
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }, [expanded, noteState.present]);

    const LabelPopover = ({ currentSelection, onToggle, isModal = false }) => {
      const filtered = availableLabels.filter(l => l.name.toLowerCase().includes(labelSearch.toLowerCase()));
      const showCreate = labelSearch.trim().length > 0 && !availableLabels.some(l => l.name.toLowerCase() === labelSearch.toLowerCase().trim());
      return (
        <div className={`label-popover shadow ${isModal ? 'modal-pop' : ''}`} onClick={e => e.stopPropagation()}>
          <div className="label-search-container p-2">
            <input autoFocus placeholder="Enter label name " className="label-search-input" value={labelSearch} onChange={(e) => setLabelSearch(e.target.value)} />
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

    return (
      <div className="keep-wrapper">
        <input type="file" accept="image/*" multiple hidden ref={fileInputRef} onChange={(e) => handleImageUpload(e, 'create')} />
        <input type="file" accept="image/*" multiple hidden ref={editFileInputRef} onChange={(e) => handleImageUpload(e, 'edit')} />
        <input type="file" accept="image/*" multiple hidden ref={cardFileInputRef} onChange={(e) => handleImageUpload(e, 'card')} />

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
    background: "#fff",
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
    <MdOutlineArchive size={22} style={{ cursor: "pointer",color: theme === "dark"?"#d9d9d9":"blue"  }} onClick={bulkArchive} />

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
              setActiveMenu({ id: null, type: null });
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
  className={`color-circle default ${
    noteColor === null && !background ? "active" : ""
  }`}
  onClick={() => bulkChangeColor(null, "")}
>
  <MdOutlineFormatColorReset size={18} />
</div>

          {/* COLOR ROW */}
          {COLORS.map((c) => (
            <div
              key={c}
              className={`color-circle ${noteColor === c ? "active" : ""}`}
              style={{ backgroundColor: c }}
              onClick={() => bulkChangeColor(c, "")}
            />
          ))}

          <div
            className={`bg-circle default ${!background ? "active" : ""}`}
            onClick={() => bulkChangeColor(null, "")}
          >
            <MdOutlineImageNotSupported size={18} />
          </div>

          {/* BACKGROUND ROW */}
          {BACKGROUNDS.map((bg) => (
            <div
              key={bg}
              className={`bg-circle ${background === bg ? "active" : ""}`}
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
          {/* Only show "Take a note" input if we are on the main Notes page or a specific label page */}
          <div className="note-input-container shadow" ref={createNoteRef} style={{
  backgroundColor: expanded ? noteColor :undefined,
  backgroundImage: background ? `url(${background})` : "none",
  backgroundSize: "cover",
    backgroundPosition: "center"
  }}>
            {!expanded ? (
              <div className="note-input-closed" onClick={() => setExpanded(true)}>
                <span className="placeholder">Take a note...</span>
                <div className="input-icons">
                  <div className="icon-btn" onClick={(e) => { e.stopPropagation(); setExpanded(true); updateDraft({ isList: true, listItems: [{text: "", checked: false}] }); }}>
                    <FaRegCheckSquare />
                  </div>
                  <div className="icon-btn" onClick={(e) => { e.stopPropagation(); fileInputRef.current.click(); }}>
                    <MdOutlineImage />
                  </div>
                </div>
              </div>
            ) : (
              <div className="note-input-open">
                {images.length > 0 && (
                  <div className="input-image-grid">
                    {images.map((img, i) => (
                      <div key={i} className="input-img-wrapper">
                        <img src={img} alt="" /><MdClose className="remove-img-btn" onClick={() => updateDraft({ images: images.filter((_, idx) => idx !== i) })} />
                      </div>
                    ))}
                  </div>
                )}
                <div className="d-flex justify-content-between px-3 pt-2">
                  <input className="title-input" placeholder="Title" value={title} onChange={e => updateDraft({ title: e.target.value })} />
                  <MdPushPin className={pinned ? 'pin active' : 'pin'} onClick={() => updateDraft({ pinned: !pinned })} />
                </div>
                {isList ? (
                  <div className="px-3 py-2">
                    {listItems.map((item, idx) => (
                      <div key={idx} className="d-flex align-items-center mb-1">
                        <MdCheckBoxOutlineBlank className="text-muted" />
                        <input className="list-item-input" value={item.text} autoFocus={idx === listItems.length - 1} 
                          onChange={e => { const newItems = [...listItems]; newItems[idx].text = e.target.value; updateDraft({ listItems: newItems }); }} 
                          onKeyDown={e => e.key === 'Enter' && updateDraft({ listItems: [...listItems, { text: "", checked: false }] })}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <textarea autoFocus className="content-input px-3" placeholder="Take a note..." value={content} onChange={e => updateDraft({ content: e.target.value })} />
                )}
                <div className="px-3 d-flex flex-wrap gap-1 mb-2">
                  
          {reminder?.date && (
            
  <div className="reminder-chip">
    ⏰ {new Date(reminder.date).toLocaleString()}
    <MdClose
      className="ms-2"
      onClick={() => updateDraft({ reminder: null })}
    />
  </div>
)}
                  {labels.map(l => <span key={l} className="label-badge">{l} <MdClose onClick={() => handleLabelToggle(l)} /></span>)}
                  {labelName && !labels.includes(labelName) && <span className="label-badge secondary">{labelName} (auto)</span>}
                </div>
                <div className="toolbar d-flex justify-content-between p-2">
                  <div className="toolbar-icons d-flex align-items-center">
                        <div className="menu-trigger">
    <MdOutlineNotificationsActive
      onClick={() => setActiveMenu({ id: "modal", type: "reminder" })}
    />
    {activeMenu.id === "modal" && activeMenu.type === "reminder" && (
    <ReminderPopover
    currentReminder={noteState.present.reminder}
    onSave={(date) => {
      updateDraft({ reminder: date });
      setActiveMenu({ id: null, type: null });
    }}
    onClose={() => setActiveMenu({ id: null, type: null })}
  />
    )}
  </div>
<div className="menu-trigger">
                    <MdUndo className={noteState.past.length === 0 ? "disabled" : ""} onClick={() => dispatch({ type: "UNDO" })} /></div>  <div className="menu-trigger">
                    <MdRedo className={noteState.future.length === 0 ? "disabled" : ""} onClick={() => dispatch({ type: "REDO" })} /></div>  <div className="menu-trigger">
                    <MdList onClick={toggleListMode} className={isList ? "text-primary" : ""} /></div>
                    <div className="menu-trigger">
                      <MdOutlineLabel onClick={() => setActiveMenu({ id: 'create', type: 'label' })} />
                      {activeMenu.id === 'create' && activeMenu.type === 'label' && <LabelPopover currentSelection={labels} onToggle={(l) => handleLabelToggle(l)} />}
                    </div>
                  <div className="menu-trigger">
    <MdOutlinePalette
      onClick={() => setActiveMenu({ id: "create", type: "palette" })}
    />

    {activeMenu.id === "create" && activeMenu.type === "palette" && (
<div className="palette-popover shadow">

  {/* DEFAULT */}
  <div
    className={`color-circle default ${
      noteColor === (theme === "dark" ? "#202124" : "#ffffff") && !background
        ? "active"
        : ""
    }`}
    onClick={() =>
      updateDraft({
        color: theme === "dark" ? "#202124" : "#ffffff",
        background: "",
      })
    }
  >
    <MdOutlineFormatColorReset size={18} />
  </div>

  {/* COLOR ROW */}
  {COLORS.map((c) => (
    <div
      key={c}
      className={`color-circle ${noteColor === c ? "active" : ""}`}
      style={{ backgroundColor: c }}
      onClick={() => updateDraft({ color: c, background: "" })}
    />
  ))}

  {/* DEFAULT BACKGROUND */}
  <div
    className={`bg-circle default ${
      !background &&
      noteColor === (theme === "dark" ? "#202124" : "#ffffff")
        ? "active"
        : ""
    }`}
    onClick={() =>
      updateDraft({
        background: "",
        color: theme === "dark" ? "#202124" : "#ffffff",
      })
    }
  >
    <MdOutlineImageNotSupported size={18} />
  </div>

  {/* BACKGROUND ROW */}
  {BACKGROUNDS.map((bg) => (
    <div
      key={bg}
      className={`bg-circle ${background === bg ? "active" : ""}`}
      style={{ backgroundImage: `url(${bg})` }}
      onClick={() => updateDraft({ background: bg })}
    />
  ))}

</div>
    )}
  </div>
                    
<div className="menu-trigger">
                    <MdOutlineImage onClick={() => fileInputRef.current.click()} /></div>  
                  </div>
                  <button className="btn-close-note" onClick={() => addNote()}>Close</button>
                </div>
              </div>
            )}
          </div>
  <div className={`notes-scroll-area ${viewMode}`}>
     {isReminderPage ? (
    <div className="notes-container mt-5">

      {/* UPCOMING */}
      {upcomingReminders.length > 0 && (
        <div className="note-section">
          <h6 className="section-label">UPCOMING</h6>
          <div className={`notes-${viewMode}`}>
            {upcomingReminders.map(note => (
              <NoteCard
                key={note._id}
                note={note}
                onUpdate={updateNote}
                onCopy={handleMakeCopy}
                onClick={() => setEditingNote(note)}
                activeMenu={activeMenu}
                setActiveMenu={setActiveMenu}
                triggerImageUpload={() => {
                 
                  cardFileInputRef.current.click();
                }}
                getToggledListState={getToggledListState}
                LabelPopover={LabelPopover}
                  isSelected={selectedNotes.includes(note._id)}
  toggleSelect={toggleSelectNote}
  isSelectionMode={isSelectionMode}
              />
            ))}
          </div>
        </div>
      )}

      {/* REPEATING */}
      {repeatingReminders.length > 0 && (
        <div className="note-section mt-4">
          <h6 className="section-label">REPEATING</h6>
          <div className={`notes-${viewMode}`}>
            {repeatingReminders.map(note => (
              <NoteCard
  key={note._id}
  {...{
    note,
    onUpdate: updateNote,
    onCopy: handleMakeCopy,
    onClick: () => setEditingNote(note),
    activeMenu,
    setActiveMenu,
    triggerImageUpload: () => {
      setCardUploadId(note._id);
      cardFileInputRef.current.click();
    },
    getToggledListState,
    LabelPopover,
    
    // --- Multi-select props ---
    isSelected: selectedNotes.includes(note._id), // highlight if selected
    toggleSelect: toggleSelectNote,              // function to select/deselect
    isSelectionMode: selectedNotes.length > 0,   // true if any note is selected
  }}
/>
            ))}
          </div>
        </div>
      )}

      {/* PAST */}
      {pastReminders.length > 0 && (
        <div className="note-section mt-4">
          <h6 className="section-label">MISSED</h6>
          <div className={`notes-${viewMode}`}>
            {pastReminders.map(note => (
              <NoteCard key={note._id} {...{
                note, onUpdate: updateNote, onCopy: handleMakeCopy,
                onClick: () => setEditingNote(note),
                activeMenu, setActiveMenu,
                triggerImageUpload: () => {
                  setCardUploadId(note._id);
                  cardFileInputRef.current.click();
                },
                getToggledListState,
                LabelPopover,
                  isSelected: selectedNotes.includes(note._id), // highlight if selected
    toggleSelect: toggleSelectNote,              // function to select/deselect
    isSelectionMode: selectedNotes.length > 0,  
              }} />
            ))}
          </div>
        </div>
      )}

      {/* COMPLETED */}
      {completedReminders.length > 0 && (
        <div className="note-section mt-4">
          <h6 className="section-label">COMPLETED</h6>
          <div className={`notes-${viewMode}`}>
            {completedReminders.map(note => (
              <NoteCard key={note._id} {...{
                note, onUpdate: updateNote, onCopy: handleMakeCopy,
                onClick: () => setEditingNote(note),
                activeMenu, setActiveMenu,
                triggerImageUpload: () => {
                  setCardUploadId(note._id);
                  cardFileInputRef.current.click();
                },
                getToggledListState,
                LabelPopover,
                  isSelected: selectedNotes.includes(note._id), // highlight if selected
    toggleSelect: toggleSelectNote,              // function to select/deselect
    isSelectionMode: selectedNotes.length > 0,  
              }} />
            ))}
          </div>
        </div>
      )}

    </div>
  ) : (
      <div className="notes-container mt-5">
    {/* 1. EMPTY SEARCH STATE */}
    {filteredNotes.length === 0 && searchQuery && (
      <div className=" d-flex No results found for  g-4">
        <MdSearch className="empty-icon" />
        <p>No results found for "<strong>{searchQuery}</strong>"</p>
      </div>
    )}

    {/* 2. PINNED SECTION (Active notes only) */}
   {sortedNotes.filter(n => n.pinned && !n.archived).length > 0 && (
      <div className="note-section">
        <h6 className="section-label">PINNED</h6>
        <div className={`notes-${viewMode}`}>
          {sortedNotes
  .filter(n => n.pinned && !n.archived)
            .map(note => (
              <NoteCard key={note._id} note={note} onUpdate={updateNote} onCopy={handleMakeCopy} onClick={() => setEditingNote(note)} activeMenu={activeMenu} setActiveMenu={setActiveMenu} triggerImageUpload={() => { setCardUploadId(note._id); cardFileInputRef.current.click(); }} getToggledListState={getToggledListState} LabelPopover={LabelPopover} isSelected={selectedNotes.includes(note._id)} toggleSelect={toggleSelectNote} isSelectionMode={isSelectionMode} />
            ))}
        </div>
      </div>
    )}

    {/* 3. OTHERS SECTION (Active notes only) */}
    {sortedNotes.filter(n => !n.pinned && !n.archived).length> 0 && (
      <div className="note-section mt-4">
        <h6 className="section-label">
          {searchQuery ? "SEARCH RESULTS" : (labelName ? "NOTES" : "OTHERS")}
        </h6>
        <div className={`notes-${viewMode}`}>
          {sortedNotes
  .filter(n => !n.pinned && !n.archived)
            .map(note => (
              <NoteCard key={note._id} note={note} onUpdate={updateNote} onCopy={handleMakeCopy} onClick={() => setEditingNote(note)} activeMenu={activeMenu} setActiveMenu={setActiveMenu} triggerImageUpload={() => { setCardUploadId(note._id); cardFileInputRef.current.click(); }} getToggledListState={getToggledListState} LabelPopover={LabelPopover}   isSelected={selectedNotes.includes(note._id)}
  toggleSelect={toggleSelectNote}
  isSelectionMode={isSelectionMode}/>
            ))}
        </div>
      </div>
    )}

    {/* 4. ARCHIVED SECTION (Only shows when inside a Label view) */}
    {labelName && sortedNotes.filter(n => n.archived).length > 0 && (
      <div className="note-section mt-5">
        <h6 className="section-label">ARCHIVED</h6>
      <div className={`notes-${viewMode}`}>
          {sortedNotes
  .filter(n => n.archived)
            .map(note => (
              <NoteCard key={note._id} note={note} onUpdate={updateNote} onCopy={handleMakeCopy} onClick={() => setEditingNote(note)} activeMenu={activeMenu} setActiveMenu={setActiveMenu} triggerImageUpload={() => { setCardUploadId(note._id); cardFileInputRef.current.click(); }} getToggledListState={getToggledListState} LabelPopover={LabelPopover}   isSelected={selectedNotes.includes(note._id)}
  toggleSelect={toggleSelectNote}
  isSelectionMode={isSelectionMode}/>
            ))}
        </div>
      </div>
    )}
  </div>
  )}
  </div>
        </main>

        {editingNote && (
          <div className="modal-overlay" onClick={() => { updateNote(editingNote._id, editingNote); setEditingNote(null); }}>
            <div className="edit-modal shadow"style={{
  backgroundColor: editingNote.color,
  backgroundImage: editingNote.background ? `url(${editingNote.background})` : "none",
  backgroundSize: "cover",
    backgroundPosition: "center"
  }} onClick={e => e.stopPropagation()}>
              <div className="modal-image-grid">
                  {editingNote.images?.map((img, i) => (
                    <div key={i} className="input-img-wrapper">
                      <img src={img} alt="" />
                      <MdClose className="remove-img-btn" onClick={() => setEditingNote({...editingNote, images: editingNote.images.filter((_, idx) => idx !== i)})} />
                    </div>
                  ))}
              </div>
              <div className="d-flex justify-content-between px-3 pt-3">
                <input className="title-input w-100" value={editingNote.title} onChange={e => setEditingNote({...editingNote, title: e.target.value})} />
                <MdPushPin className={editingNote.pinned ? 'pin active' : 'pin'} onClick={() => setEditingNote({...editingNote, pinned: !editingNote.pinned})} />
              </div>
              {editingNote.isList ? (
                <div className="px-3 py-2">
                  {(editingNote.listItems || []).map((item, idx) => (
                    <div key={idx} className="d-flex align-items-center mb-1">
                      <input type="checkbox" className="me-2" checked={item.checked} onChange={() => { const newItems = [...editingNote.listItems]; newItems[idx].checked = !newItems[idx].checked; setEditingNote({...editingNote, listItems: newItems}); }} />
                      <input className="list-item-input" value={item.text} onChange={e => { const newItems = [...editingNote.listItems]; newItems[idx].text = e.target.value; setEditingNote({...editingNote, listItems: newItems}); }} />
                    </div>
                  ))}
                </div>
              ) : (
                <textarea className="content-input px-3 w-100" style={{minHeight: '90px'}} value={editingNote.content} onChange={e => setEditingNote({...editingNote, content: e.target.value})} />
              )}

  <div className="px-3 d-flex flex-wrap gap-1 mb-2">
{editingNote.reminder?.date && (
  <ReminderChip
    reminder={editingNote.reminder}
    onRemove={() =>
      setEditingNote({ ...editingNote, reminder: null })
    }
    onToggleComplete={(rem) =>
      setEditingNote({
        ...editingNote,
        reminder: { ...rem, active: !rem.active }
      })
    }
    onEdit={() =>
      setActiveMenu({ id: "modal", type: "reminder" })
    }
  />
)}
                  {(editingNote.labels || []).map(l => <span key={l} className="label-badge">{l} <MdClose onClick={() => handleLabelToggle(l, true)} /></span>)}
              </div>
              <div className="toolbar d-flex justify-content-between p-2">
                <div className="toolbar-icons d-flex align-items-center">
                <div className="menu-trigger">
    <MdOutlineNotificationsActive
      onClick={() => setActiveMenu({ id: "modal", type: "reminder" })}
    />

    {activeMenu.id === "modal" && activeMenu.type === "reminder" && (
      <ReminderPopover
        currentReminder={editingNote.reminder}
        onSave={(date) => {
          setEditingNote({ ...editingNote, reminder: date });
          setActiveMenu({ id: null, type: null });
        }}
        onClose={() => setActiveMenu({ id: null, type: null })}
      />
    )}
  </div>
   <div className="menu-trigger">
                  <MdOutlineImage onClick={() => editFileInputRef.current.click()} /></div>  
  <div className="menu-trigger">
  <MdOutlinePalette
    onClick={() => setActiveMenu({ id: "modal", type: "palette" })}
  />

  {activeMenu.id === "modal" && activeMenu.type === "palette" && (
  <div className="palette-popover shadow">
<div
  className={`color-circle default ${
    editingNote.color === null && !editingNote.background ? "active" : ""
  }`}
  onClick={() =>
    setEditingNote({ ...editingNote, color: null, background: "" })
  }
>
  <MdOutlineFormatColorReset size={18} />
</div>

  {COLORS.map((c) => (
  <div
    key={c}
    className={`color-circle ${editingNote.color === c ? "active" : ""}`}
    style={{ backgroundColor: c }}
    onClick={() =>
      setEditingNote({ ...editingNote, color: c, background: "" })
    }
  />
  ))}
  <div
  className={`bg-circle default ${
  !editingNote.background ? "active" : ""
  }`}
  onClick={() =>
  setEditingNote({ ...editingNote, background: "" })
  }
  >
  <MdOutlineImageNotSupported size={18} />
  </div>

  {BACKGROUNDS.map((bg) => (
  <div
    key={bg}
    className={`bg-circle ${
      editingNote.background === bg ? "active" : ""
    }`}
    style={{ backgroundImage: `url(${bg})` }}
    onClick={() =>
      setEditingNote({ ...editingNote, background: bg })
    }
  />
  ))}

  </div>
  )}
  </div>
                  <MdOutlineArchive onClick={() => { updateNote(editingNote._id, { archived: true }); setEditingNote(null); }} />
                  <div className="menu-trigger">
                    <MdOutlineMoreVert onClick={() => setActiveMenu({ id: 'modal', type: 'more' })} />
                    {activeMenu.id === 'modal' && activeMenu.type === 'more' && (
                      <div className="more-menu1-popover shadow modal-pop">
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
                        <div className="menu-item p-2" onClick={() => { updateNote(editingNote._id, { trashed: true }); setEditingNote(null); }}><MdOutlineDelete /> Delete note</div>
                        <div className="menu-item p-2" onClick={() => handleMakeCopy(editingNote)}><MdContentCopy /> Make a copy</div>
                        <div className="menu-item p-2" onClick={() => setActiveMenu({ id: 'modal', type: 'label' })}><MdOutlineLabel /> Add Label</div>
                      </div>
                    )}
                    {activeMenu.id === 'modal' && activeMenu.type === 'label' && <LabelPopover isModal={true} currentSelection={editingNote.labels || []} onToggle={(l) => handleLabelToggle(l, true)} />}
                  </div>
                </div>
                <button className="btn-close-note" onClick={() => { updateNote(editingNote._id, editingNote); setEditingNote(null); }}>Close</button>
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
  isSelected,
  toggleSelect,
  isSelectionMode
}) => {
    const [hover, setHover] = useState(false);
     const { theme } = useTheme();
    const removeReminder = (id) => {
  onUpdate(id, { reminder: null }); // Updates the note in backend and frontend
};

    return (
      <div className="note-card"   style={{
         backgroundColor:note.color ,
      backgroundImage: note.background ? `url(${note.background})` : "none",
      backgroundSize: "cover",
        backgroundPosition: "center",
         border: isSelected
  ? (theme === "dark" ? "2px solid white" : "2px solid black")
  : (theme === "dark" ? "1px solid #444" : "1px solid rgb(215,213,213)"),
    }}onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}onClick={() => {
  if (isSelectionMode) {
    toggleSelect(note._id);
  } else {
    onClick();
  }
}}>
  <div
  className={`select-checkbox ${isSelected ? "selected" : ""}`}
  onClick={(e) => {
    e.stopPropagation();
    toggleSelect(note._id);
  }}
>
  {isSelected ? (
    <MdCheck size={16} className="selected-icon" />
  ) : (
    <MdCheck size={16} className="selected-icon" />
  )}
</div>
        <MdPushPin className={`pin-btn ${note.pinned ? 'active visible' : ''} ${hover ? 'visible' : ''}`} onClick={(e) => { e.stopPropagation(); onUpdate(note._id, { pinned: !note.pinned }); }} />
        {note.images?.length > 0 && (
          <div className="card-image-grid">
            {note.images.slice(0, 4).map((img, idx) => <img key={idx} src={img} className="card-grid-img" alt="" />)}
          </div>
        )}
        <div className="p-3">
          <div className="fw-bold">{note.title}</div>
          {note.isList ? (
            <div className="card-content-text mt-1">
              {(note.listItems || []).slice(0, 8).map((item, idx) => (
                <div key={idx} className="d-flex align-items-center mb-1">
                  {item.checked ? <MdCheckBox className="text-muted" size={14} /> : <MdCheckBoxOutlineBlank className="text-muted" size={14} />}
                  <span className={`ms-2 ${item.checked ? 'text-decoration-line-through text-muted' : ''}`} style={{fontSize: '0.85rem'}}>{item.text}</span>
                </div>
              ))}
            </div>
          ) : <div className="card-content-text  mt-1">{note.content}</div>}
            {/* reminder-chip */}
{note.reminder?.date && (
  <ReminderChip
    reminder={note.reminder}
    onRemove={() => removeReminder(note._id)}
    onToggleComplete={(rem) =>
      onUpdate(note._id, {
        reminder: { ...rem, active: !rem.active }
      })
    }
    onEdit={() =>
      setActiveMenu({ id: note._id, type: "reminder" })
    }
  />
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
          <div className={`card-toolbar d-flex justify-content-around mt-3 ${hover || activeMenu.id === note._id ? 'opacity-100' : 'opacity-0'}`} onClick={e => e.stopPropagation()}>
          <div className="menu-trigger">
    <MdOutlineNotificationsActive
      onClick={() => setActiveMenu({ id: note._id, type: "reminder" })}
    />

    {activeMenu.id === note._id && activeMenu.type === "reminder" && (
      <ReminderPopover
        currentReminder={note.reminder}
        onSave={(date) => {
          onUpdate(note._id, { reminder: date });
          setActiveMenu({ id: null, type: null });
        }}
        onClose={() => setActiveMenu({ id: null, type: null })}
      />
    )}
  </div>

      <div className="menu-trigger">
    <MdOutlinePalette 
      onClick={() => setActiveMenu({ id: note._id, type: "palette" })}
    />

    {activeMenu.id === note._id && activeMenu.type === "palette" && (
      <div className="palette-popover shadow card-pop">

        {/* DEFAULT COLOR */}
 <div
  className={`color-circle default ${
    note.color === null && !note.background ? "active" : ""
  }`}
  onClick={() =>
    onUpdate(note._id, { color: null, background: "" })
  }
>
  <MdOutlineFormatColorReset size={18} />
</div>

        {/* COLORS */}
        {COLORS.map((c) => (
          <div
            key={c}
            className={`color-circle ${
              note.color === c ? "active" : ""
            }`}
            style={{ backgroundColor: c }}
            onClick={() =>
              onUpdate(note._id, { color: c })
            }
          />
        ))}

        {/* REMOVE BACKGROUND */}
        <div
          className={`bg-circle default ${
            !note.background ? "active" : ""
          }`}
          onClick={() =>
            onUpdate(note._id, { background: "" })
          }
        >
        <MdOutlineImageNotSupported size={18} />
        </div>

        {/* BACKGROUNDS */}
        {BACKGROUNDS.map((bg) => (
          <div
            key={bg}
            className={`bg-circle ${
              note.background === bg ? "active" : ""
            }`}
            style={{ backgroundImage: `url(${bg})` }}
            onClick={() =>
              onUpdate(note._id, { background: bg })
            }
          />
        ))}

      </div>
    )}
  </div>
    <div className="menu-trigger">
            <MdOutlineImage onClick={triggerImageUpload} /></div>
              <div className="menu-trigger">
            <MdOutlineArchive onClick={() => onUpdate(note._id, { archived: true })} /></div>
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
                  <div className="menu-item p-2" onClick={() => onUpdate(note._id, { trashed: true })}><MdOutlineDelete /> Delete</div>
                  <div className="menu-item p-2" onClick={() => onCopy(note)}><MdContentCopy /> Copy</div>
                  <div className="menu-item p-2" onClick={() => setActiveMenu({ id: note._id, type: 'label' })}><MdOutlineLabel /> Labels</div>
                </div>
              )}
              {activeMenu.id === note._id && activeMenu.type === 'label' && (
                <LabelPopover currentSelection={note.labels || []} onToggle={(l) => {
                  const newLabels = (note.labels || []).includes(l) ? note.labels.filter(label => label !== l) : [...(note.labels || []), l];
                  onUpdate(note._id, { labels: newLabels });
                }} />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  export default Content;