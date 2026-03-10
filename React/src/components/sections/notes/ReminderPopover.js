import React, { useState, useRef, useEffect } from "react";
import { MdOutlineAlarm, MdOutlineClose } from "react-icons/md";

export default function ReminderPopover({ onSave, onClose }) {

  const popRef = useRef();

  const repeatOptions = [
    "Doesn't repeat",
    "Daily",
    "Weekly",
    "Monthly",
    "Yearly",
    "Customise"
  ];

  const [date, setDate] = useState(
    new Date().toISOString().slice(0,10)
  );

  const [time, setTime] = useState("16:30");

  const [repeat, setRepeat] = useState("Doesn't repeat");

  const [showRepeat, setShowRepeat] = useState(false);


  useEffect(()=>{

    function handleClickOutside(e){
      if(popRef.current && !popRef.current.contains(e.target)){
        onClose();
      }
    }

    document.addEventListener("mousedown",handleClickOutside);

    return ()=>document.removeEventListener("mousedown",handleClickOutside);

  },[onClose]);


  const saveReminder = ()=>{

    onSave({
      date,
      time,
      repeat
    });

  };

  return (

    <div className="reminder-popover" ref={popRef}>

      <div className="reminder-header">
        <MdOutlineAlarm size={20}/>
        <span>Select date and time</span>
      </div>

      {/* DATE */}
      <div className="reminder-row">

        <label>Date</label>

        <input
          type="date"
          value={date}
          onChange={(e)=>setDate(e.target.value)}
        />

      </div>


      {/* TIME */}
      <div className="reminder-row">

        <label>Time</label>

        <input
          type="time"
          value={time}
          onChange={(e)=>setTime(e.target.value)}
        />

      </div>


      {/* REPEAT */}
      <div className="repeat-container">

        <div
          className="repeat-selected"
          onClick={()=>setShowRepeat(!showRepeat)}
        >
          {repeat}
          <span className="arrow">▾</span>
        </div>


        {showRepeat && (

          <div className="repeat-dropdown">

            {repeatOptions.map((r)=>(
              <div
                key={r}
                className="repeat-option"
                onClick={()=>{
                  setRepeat(r);
                  setShowRepeat(false);
                }}
              >
                {r}
              </div>
            ))}

          </div>

        )}

      </div>


      {/* ACTION BUTTONS */}
      <div className="reminder-actions">

        <button
          className="cancel-btn"
          onClick={onClose}
        >
          Cancel
        </button>

        <button
          className="save-btn"
          onClick={saveReminder}
        >
          Save
        </button>

      </div>


      <MdOutlineClose
        className="reminder-close"
        onClick={onClose}
      />

    </div>
  );

}