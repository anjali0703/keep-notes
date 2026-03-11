import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Dropdown, Nav } from "react-bootstrap";
import { useAuth } from "../../contexts/AuthContext";
import { MdLightMode, MdDarkMode ,MdSettings, MdRefresh} from "react-icons/md";
import { useTheme } from "../../contexts/ThemeContext";
import { Modal, Button, Form } from "react-bootstrap";
import { 
  MdSearch, 
  MdClose, 
  MdOutlineGridView, 
  MdOutlineViewAgenda 
} from "react-icons/md";
import people5 from "../../assets/img/userimg.jpg";
import "../../App.css";
import { useView } from "../../contexts/viewContext";

const Navbar = () => {
  
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // View mode from context
  const { viewMode, toggleView } = useView();
const { theme, toggleTheme } = useTheme();
const [showSettings, setShowSettings] = useState(false);
const handleOpenSettings = () => setShowSettings(true);
const handleCloseSettings = () => setShowSettings(false);
const [isRefreshing, setIsRefreshing] = useState(false);
const [showMobileSearch, setShowMobileSearch] = useState(false);

const [refreshKey, setRefreshKey] = useState(0);

const handleRefresh = () => {
  console.log(`Refreshing page: ${location.pathname}`); // <-- log current page
  setIsRefreshing(true);

  setTimeout(() => {
    setRefreshKey(prev => prev + 1); // triggers re-render
    setIsRefreshing(false);
    console.log(`Refresh complete on page: ${location.pathname}`);
  }, 1000); // 1 second animation
};
const [moveCheckedBottom, setMoveCheckedBottom] = useState(() => {
  // Get stored value (string) and convert to boolean
  const saved = localStorage.getItem("addToBottom");
  return saved === "true"; // default false if not set
});


  // Get existing search term from URL
  const queryParams = new URLSearchParams(location.search);
  const [searchTerm, setSearchTerm] = useState(queryParams.get("q") || "");

  const user = JSON.parse(localStorage.getItem("user"));
  const UserName = user ? user.name : "";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Search handler
  const handleSearch = (val) => {
    setSearchTerm(val);

    const params = new URLSearchParams(location.search);

    if (val) {
      params.set("q", val);
    } else {
      params.delete("q");
    }

    navigate({ search: params.toString() }, { replace: true });
  };

  const clearSearch = () => {
    setSearchTerm("");

    const params = new URLSearchParams(location.search);
    params.delete("q");

    navigate({ search: params.toString() }, { replace: true });
  };

  const navToggle = () => {
    document.getElementById("body").classList.toggle("ms-aside-left-open");
    document.getElementById("ms-side-nav").classList.toggle("ms-aside-open");
    document.getElementById("overlayleft").classList.toggle("d-block");
  };

  const optionsToggle = () => {
    document.getElementById("ms-nav-options").classList.toggle("ms-slide-down");
  };

  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 768);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth > 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getPageTitle = () => {

    const path = location.pathname;

    if (path === "/") return "Dashboard";

    const name = path.split("/").filter(Boolean).pop();

    return name
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <nav className="navbar ms-navbar">

      <div className="d-flex">

        <div className="ms-aside-toggler ms-toggler pl-0" onClick={navToggle}>
          <span className="ms-toggler-bar" style={{ backgroundColor: "#29748c" }} />
          <span className="ms-toggler-bar" style={{ backgroundColor: "#29748c" }} />
          <span className="ms-toggler-bar" style={{ backgroundColor: "#29748c" }} />
        </div>

        <div className="page-title">
          {getPageTitle()}
        </div>

      </div>

      {/* SEARCH */}
    {/* SEARCH */}
<div className="keep-search-container">

  {/* Desktop Search */}
  {isDesktop && (
    <div className="keep-search-box">
      <button className="search-btn">
        <MdSearch />
      </button>

      <input
        type="text"
        placeholder="Search"
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
      />

      {searchTerm && (
        <button className="clear-btn" onClick={clearSearch}>
          <MdClose />
        </button>
      )}
    </div>
  )}

  {/* Mobile Search Icon */}
  {!isDesktop && !showMobileSearch && (
    <button
      className="keep-view-btn"
      onClick={() => setShowMobileSearch(true)}
    >
      <MdSearch size={26} />
    </button>
  )}

  {/* Mobile Search Bar */}
  {!isDesktop && showMobileSearch && (
    <div className="keep-search-box mobile-search">
      <button className="search-btn">
        <MdSearch />
      </button>

      <input
        autoFocus
        type="text"
        placeholder="Search"
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
      />

      <button
        className="clear-btn"
        onClick={() => {
          clearSearch();
          setShowMobileSearch(false);
        }}
      >
        <MdClose />
      </button>
    </div>
  )}

</div>

  <div className="d-flex">
     <div className="d-flex align-items-center ms-nav-item">
  {/* Theme Toggle */}
  {/* <button onClick={toggleTheme} className="keep-view-btn me-2">
    {theme === "light" ? <MdDarkMode size={26} /> : <MdLightMode size={26} />}
  </button> */}
  {/* Refresh Button */}
<button
  className="keep-view-btn me-2 refresh-btn"
  onClick={handleRefresh}
  disabled={isRefreshing}
>
  <MdRefresh
    size={26}
    className={isRefreshing ? "refresh-animate" : ""}
  />
</button>

  {/* Settings */}
<Dropdown className="">

  <Dropdown.Toggle
    as={Nav.Link}
    className="p-0 toggle-icon-none keep-view-btn"
    
    
  >
    <MdSettings size={26} />
  </Dropdown.Toggle>

  <Dropdown.Menu className="dropdown-menu-right user-dropdown">

    {/* Open Settings Modal */}
    <Dropdown.Item
      className="text-disabled"
      onClick={handleOpenSettings}
    >
      Settings
    </Dropdown.Item>

    {/* Toggle Dark Mode */}
    <Dropdown.Item
      className="text-disabled"
      onClick={toggleTheme}
    >
      {theme === "dark" ? "Disable Dark Mode" : "Enable Dark Mode"}
    </Dropdown.Item>

  </Dropdown.Menu>

</Dropdown>

{/* Settings Modal */}
{showSettings && (
  <div
    className="custom-modal-overlay"
    onClick={handleCloseSettings}
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
    }}
  >
    <div
      className="custom-modal"
      onClick={(e) => e.stopPropagation()}
      style={{
        backgroundColor: "#fff",
        padding: "20px",
        borderRadius: "8px",
        minWidth: "300px",
      }}
    >
      
      <div style={{ margin: "10px 0" }}>
        <label>
          <input
            type="checkbox"
            checked={theme === "dark"}
            onChange={toggleTheme}
          />{" "}
          Enable dark theme
        </label>
      </div>
      <div style={{ margin: "10px 0" }}>
       <label>
 <input
  type="checkbox"
  checked={moveCheckedBottom}
  onChange={(e) => {
    setMoveCheckedBottom(e.target.checked);
    localStorage.setItem("addToBottom", e.target.checked);
  }}
/>{" "}
Add items to bottom
</label>
      </div>
      {/* <div style={{ margin: "10px 0" }}>
        <label>
          <input type="checkbox" /> Move ticked items to bottom
        </label>
      </div>
      <div style={{ margin: "10px 0" }}>
        <label>
          <input type="checkbox" /> Display rich link previews
        </label>
      </div>
      <div style={{ margin: "10px 0" }}>
        <label>
          <input type="checkbox" /> Enable sharing
        </label>
      </div> */}
      <div style={{ textAlign: "right", marginTop: "20px" }}>
        <button
          onClick={handleCloseSettings}
          style={{
            padding: "6px 12px",
            marginRight: "10px",
            borderRadius: "4px",
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleCloseSettings}
          style={{
            padding: "6px 12px",
            borderRadius: "4px",
          }}
        >
          Save
        </button>
      </div>
    </div>
  </div>
)}
      {/* GRID / LIST BUTTON */}

  <button onClick={toggleView} className="keep-view-btn">

    {viewMode === "grid"
      ? <MdOutlineViewAgenda size={26} />
      : <MdOutlineGridView size={26} />
    }

  </button>



      {/* USER MENU */}
      <ul
        className="ms-nav-list ms-inline mb-0"
        id="ms-nav-options"
        style={{
          backgroundColor: isDesktop ? "transparent" : "#29748c"
        }}
      >
        

        <Dropdown className="">

          <Dropdown.Toggle
            as={Nav.Link}
           
            className="p-0 toggle-icon-none"
          >

            <img
              className="keep-view-btn"
              src={people5}
              alt="user"
            />

          </Dropdown.Toggle>

          <Dropdown.Menu className="dropdown-menu-right user-dropdown">

            <Dropdown.Header>

              <h6 className="dropdown-header ms-inline m-0">
                <span className="text-disabled">
                  Welcome, {UserName}
                </span>
              </h6>

            </Dropdown.Header>

            <Dropdown.Divider />

            <Dropdown.Item
              as={Link}
              className="fs-14 px-2 d-flex align-items-center"
              to="/loginpage"
              onClick={handleLogout}
            >
              <span>
                <i className="flaticon-shut-down mr-2" /> Logout
              </span>
            </Dropdown.Item>

          </Dropdown.Menu>

        </Dropdown>

      </ul>
      </div>
      </div>


      <div className="ms-toggler ms-d-block-sm pr-0 ms-nav-toggler" onClick={optionsToggle}>
        <span className="ms-toggler-bar" style={{ backgroundColor: "#29748c" }} />
        <span className="ms-toggler-bar" style={{ backgroundColor: "#29748c" }} />
        <span className="ms-toggler-bar" style={{ backgroundColor: "#29748c" }} />
      </div>
      

    </nav>
    
  );
};

export default Navbar;