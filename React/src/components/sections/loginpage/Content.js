import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Form, InputGroup, Button } from "react-bootstrap";
import { useAuth } from "../../../contexts/AuthContext";
import "../../../App.css";
import { Link } from "react-router-dom";
// import { useSelector } from "react-redux";

import facebook from "../../../assets/img/facebook-round-color-icon.png";
import googleIcon from "../../../assets/img/google-color-icon.png";
// import hmm2 from "../../../assets/img/hmm2.jpg";
import toastr from "toastr";

toastr.options = {
  closeButton: true,
  debug: false,
  newestOnTop: false,
  progressBar: false,
  positionClass: "toast-bottom-right",
  preventDuplicates: false,
  onclick: null,
  showDuration: "300",
  hideDuration: "1000",
  timeOut: "5000",
  extendedTimeOut: "1000",
  showEasing: "swing",
  hideEasing: "linear",
  showMethod: "fadeIn",
  hideMethod: "fadeOut",
};

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [validated, setValidated] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const apiUrl = process.env.REACT_APP_API_URL;
  const AdminUser = process.env.REACT_APP_ADMIN_USERTYPE;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    if (!email || !password) {
      toastr.error("Email and Password required");
      return;
    }

    const credentials = { email, password };

    try {
      const response = await axios.post(
        `${apiUrl}/auth/login`,
        credentials
      );

      if (response.status === 200) {
        const user = response.data.user;

        if (user.userTypeId == AdminUser) {
          login();
          localStorage.setItem("user", JSON.stringify(response.data.user));
          navigate("/Notes");
        } else {
          toastr.error("Invalid Credential");
        }
      }
    } catch (error) {
      if (error.response) {
        setErrorMessage(error.response.data.message);
        toastr.error("Invalid Credential");
      } else {
        setErrorMessage("An error occurred. Please try again.");
      }
    }

    setValidated(true);
  };

  return (
    <div className="app">
      <div className="content-container">
        <div className="login-container">
          <div className="content">
            <div className="logo-container">
              <h3>NOTES</h3>
            </div>
            <h1 style={{ color: '#000000' }}>Login To Your Account</h1>
            <form className="login-form">
              <input
                type="email"
                name="email"
                placeholder="Email"
                required
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                required
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="button" onClick={handleSubmit} className="login-button">
                Login
              </button>
              <p style={{ marginTop: "15px", textAlign: "center" }}>
  Don’t have an account?{" "}
  <Link to="/register" style={{ color: "#007bff", textDecoration: "none" }}>
    Register Here
  </Link>
</p>
            </form>
            {/* <div className="login-options" style={{ marginTop: "25px" }}>
              <ul>
                <li>
                  <Link to="/KitchenOrder" className="role-link">Login as Kitchen Staff</Link>
                </li>
                <li>
                  <Link to="/WaitstaffOrder" className="role-link">Login as Wait Staff</Link>
                </li>
                <li>
                  <Link to="/Dashboard" className="role-link">Login as Admin</Link>
                </li>
              </ul>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
