const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "isuser", 
    required: true 
  },
  title: { 
    type: String, 
    default: "" 
  },
  content: { 
    type: String, 
    default: "" 
  },
  
  // GOOGLE NOTES FEATURES
  // ---------------------
  // 1. Checklist Support
  isList: { 
    type: Boolean, 
    default: false 
  },
  listItems: [{
    text: String,
    checked: { type: Boolean, default: false },
    id: { type: String } // Useful for frontend keys
  }],

  // 2. Labels/Tags
  labels: [{ 
    type: String 
  }],

  // 3. Reminders
reminder: {
  date: { type: Date, default: null },

  repeat: { 
    type: String, 
    enum: ["none", "daily", "weekly", "monthly"], 
    default: "none" 
  },

  active: { 
    type: Boolean, 
    default: true 
  },
   emailSent: {
    type: Boolean,
    default: false
  }
},
  // 4. Collaboration (Sharing notes)
  collaborators: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "isuser" 
  }],

  // UI & STATE
  images: [String], // Array of base64 strings or URLs
  pinned: { 
    type: Boolean, 
    default: false 
  },
 color: {
  type: String,
  
},
  background: { type: String, default: "" },
  archived: { 
    type: Boolean, 
    default: false 
  },
  trashed: { 
    type: Boolean, 
    default: false 
  },

  // TIMESTAMPS
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, { 
  timestamps: true // Automatically handles createdAt and updatedAt
});

// Indexing for faster search (Google Notes style search)
noteSchema.index({ title: 'text', content: 'text', labels: 'text' });

module.exports = mongoose.model("Note", noteSchema);