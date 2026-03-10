import React, { Component, Fragment } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom"; 
import Scrollbar from "react-perfect-scrollbar";
import axios from "axios";

import { 
  MdLightbulbOutline, 
  MdOutlineArchive, 
  MdOutlineDeleteOutline, 
  MdOutlinePersonOutline,
  MdOutlineNotificationsNone,
  MdLabelOutline,
  MdEdit,
  MdCheck,
  MdAdd,
  MdDeleteForever
} from "react-icons/md";
import { Modal } from "react-bootstrap";
import toastr from "toastr";
import "../../App.css";


class Sidenav extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showLabelModal: false,
      labels: [], 
      newLabelName: "",
      editingLabelIndex: null,
      tempLabelValue: ""
    };
    this.pollTimer = null;
  }

  componentDidMount() {
    this.fetchLabels();
    this.pollTimer = setInterval(() => this.fetchLabels(), 3000);
  }

  componentWillUnmount() {
    if (this.pollTimer) clearInterval(this.pollTimer);
  }
fetchLabels = async () => {
  // NEW: Don't fetch if the user is currently editing a label or the modal is open
  if (this.state.editingLabelIndex !== null || !this.state.showLabelModal === false) {
    // Actually, it's safer to only skip if editingLabelIndex is not null
  }
  
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || !user.id || this.state.editingLabelIndex !== null) return; 

  try {
    const res = await axios.get(`http://localhost:5000/api/label/${user.id}`);
    if (JSON.stringify(res.data) !== JSON.stringify(this.state.labels)) {
      this.setState({ labels: res.data });
    }
  } catch (err) {
    console.error("Error fetching labels:", err);
  }
};
getPageTitle = () => {
  const path = this.props.router.location.pathname;

  if (path.startsWith("/Archive")) return "Archive";
  if (path.startsWith("/Bin")) return "Bin";
  if (path.startsWith("/user")) return "User";
if (path.startsWith("/reminder")) return "Reminders";
  if (path.startsWith("/label/")) {
    const labelName = path.split("/")[2];
    if (!labelName) return "Label";
    
    // Capitalize first letter
    return labelName.charAt(0).toUpperCase() + labelName.slice(1);
  }

  return "Notes"; // default
};

  navToggle = () => {
    document.getElementById("body").classList.toggle("ms-aside-left-open");
    document.getElementById("ms-side-nav").classList.toggle("ms-aside-open");
    document.getElementById("overlayleft").classList.toggle("d-block");
  };

  isActive = (path) => this.props.router.location.pathname === path ? "active" : "";

  handleAddLabel = async () => {
    const { newLabelName, labels } = this.state;
    const user = JSON.parse(localStorage.getItem("user"));
    if (!newLabelName.trim()) return;

    try {
      const res = await axios.post(`http://localhost:5000/api/label`, { 
        name: newLabelName.trim(), 
        userId: user.id 
      });
      this.setState({
        labels: [...labels, res.data],
        newLabelName: ""
      });
      toastr.success("Label created");
    } catch (err) {
      toastr.error("Failed to create label");
    }
  };

  handleDeleteLabel = async (labelName) => {
    const user = JSON.parse(localStorage.getItem("user"));
    try {
      await axios.delete(`http://localhost:5000/api/label/${user.id}/${labelName}`);
      this.setState({
        labels: this.state.labels.filter(l => l.name !== labelName)
      });
      toastr.info("Label deleted");
    } catch (err) {
      toastr.error("Delete failed");
    }
  };

handleRenameLabel = async (index) => {
  const { tempLabelValue, labels } = this.state;
  const oldLabel = labels[index];
  const user = JSON.parse(localStorage.getItem("user"));

  // Stop if name is empty or hasn't actually changed
  if (!tempLabelValue.trim() || tempLabelValue === oldLabel.name) {
    this.setState({ editingLabelIndex: null });
    return;
  }

  try {
    // UPDATED: Send userId and oldName so the backend knows what to find
    const res = await axios.put(`http://localhost:5000/api/label/rename`, {
      userId: user.id,
      oldName: oldLabel.name, // The identifier
      newName: tempLabelValue.trim() // The new value
    });

    const newLabels = [...labels];
    newLabels[index] = res.data; // Use the updated label object from response

    this.setState({ 
      labels: newLabels, 
      editingLabelIndex: null,
      tempLabelValue: "" 
    });
    
    toastr.success("Label updated");
  } catch (err) {
    console.error("Rename error", err);
    toastr.error("Rename failed");
    this.setState({ editingLabelIndex: null });
  }
};

  render() {
    const { labels, showLabelModal, newLabelName, editingLabelIndex, tempLabelValue } = this.state;

    return (
      <Fragment>
        <div className="ms-aside-overlay ms-overlay-left ms-toggler" id="overlayleft" onClick={this.navToggle} />
        
        <Scrollbar id="ms-side-nav" className="side-nav fixed ms-aside-scrollable ms-aside-left keep-sidebar-style">
 
          <ul className="ms-main-aside">
            <li className={`menu-item ${this.isActive("/Notes")}`}>
              <Link to="/Notes"><MdLightbulbOutline className="nav-icon" /><span>Notes</span></Link>
            </li>
            <li className={`menu-item ${this.isActive("/reminder")}`}>
  <Link to="/reminder">
    <MdOutlineNotificationsNone className="nav-icon" />
    <span>Reminders</span>
  </Link>
</li>
            {/* <li className={`menu-item ${this.isActive("/user")}`}>
              <Link to="/user"><MdOutlinePersonOutline className="nav-icon" /><span>User</span></Link>
            </li> */}

            {/* <div className="sidebar-divider"></div>
            <li className="sidebar-label">LABELS</li> */}
            
            {/* Render Dynamic Labels - Fixed for long text */}
            {labels.map((label) => (
              <li key={label._id || label.name} className={`menu-item ${this.isActive(`/label/${label.name}`)}`}>
                <Link to={`/label/${label.name}`} title={label.name} className="d-flex align-items-center">
                  <MdLabelOutline className="nav-icon flex-shrink-0" />
                  <span className="text-truncate" style={{ display: 'block', width: '100%' }}>
                    {label.name}
                  </span>
                </Link>
              </li>
            ))}

            <li className="menu-item" onClick={() => this.setState({ showLabelModal: true })}>
              <Link to="#">
                <MdEdit className="nav-icon" />
                <span>Edit labels</span>
              </Link>
            </li>

            {/* <div className="sidebar-divider"></div> */}
            
            <li className={`menu-item ${this.isActive("/Archive")}`}>
              <Link to="/Archive"><MdOutlineArchive className="nav-icon" /><span>Archive</span></Link>
            </li>
            <li className={`menu-item ${this.isActive("/Bin")}`}>
              <Link to="/Bin"><MdOutlineDeleteOutline className="nav-icon" /><span>Bin</span></Link>
            </li>
          </ul>
        </Scrollbar>

        {/* EDIT LABELS MODAL */}
        <Modal show={showLabelModal} onHide={() => this.setState({ showLabelModal: false })} centered size="sm" className="keep-label-modal">
          <Modal.Header>
            <Modal.Title className="fs-16">Edit labels</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="label-input-row mb-3 d-flex align-items-center">
              <MdAdd className="label-action-icon" onClick={this.handleAddLabel} />
              <input 
                type="text" 
                placeholder="Create new label" 
                className="label-edit-input flex-grow-1 mx-2"
                value={newLabelName}
                onChange={(e) => this.setState({ newLabelName: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && this.handleAddLabel()}
              />
              <MdCheck className="label-action-icon text-success" onClick={this.handleAddLabel} />
            </div>

            <div className="labels-list-scroll" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {labels.map((label, index) => (
                <div key={label._id || index} className="label-input-row py-1 d-flex align-items-center">
                  <MdDeleteForever className="label-action-icon text-danger flex-shrink-0" onClick={() => this.handleDeleteLabel(label.name)} />
                 {editingLabelIndex === index ? (
  <div className="d-flex align-items-center flex-grow-1 mx-2">
    <input 
      autoFocus
      className="label-edit-input border-bottom w-100"
      value={tempLabelValue}
      onChange={(e) => this.setState({ tempLabelValue: e.target.value })}
      onKeyDown={(e) => {
        if (e.key === 'Enter') this.handleRenameLabel(index);
        if (e.key === 'Escape') this.setState({ editingLabelIndex: null });
      }}
    />
    <MdCheck 
      className="label-action-icon text-success ms-1" 
      style={{ cursor: 'pointer' }}
      onClick={() => this.handleRenameLabel(index)} 
    />
  </div>
) : (
  <span 
    className="label-text-span flex-grow-1 mx-2 text-truncate" 
    onClick={() => this.setState({ editingLabelIndex: index, tempLabelValue: label.name })}
  >
    {label.name}
  </span>
)}
                  <MdEdit className="label-action-icon flex-shrink-0" onClick={() => this.setState({ editingLabelIndex: index, tempLabelValue: label.name })} />
                </div>
              ))}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <button className="btn-close-label" onClick={() => this.setState({ showLabelModal: false })}>Done</button>
          </Modal.Footer>
        </Modal>
      </Fragment>
    );
  }
}

function withRouter(Component) {
  function ComponentWithRouterProp(props) {
    let location = useLocation();
    let navigate = useNavigate();
    let params = useParams();
    return <Component {...props} router={{ location, navigate, params }} />;
  }
  return ComponentWithRouterProp;
}

export default withRouter(Sidenav);