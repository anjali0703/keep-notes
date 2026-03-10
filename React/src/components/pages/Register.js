import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import toastr from "toastr";
import "../../App.css";

// Toastr configuration
toastr.options = {
  positionClass: "toast-bottom-right",
  closeButton: true,
  progressBar: true,
  timeOut: "5000",
};

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "", // Added for validation
    mobile: "",
    userTypeId: "",
  });

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  // Fetch Roles from Backend
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get(`${apiUrl}/userTypes`); 
        setRoles(response.data);
      } catch (error) {
        console.error("Error fetching roles:", error);
        toastr.error("Failed to load user roles");
      }
    };
    fetchRoles();
  }, [apiUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Validation for Mobile: Only digits and max 10 chars
    if (name === "mobile") {
      if (/^\d*$/.test(value) && value.length <= 10) {
        setFormData({ ...formData, [name]: value });
      }
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // --- VALIDATIONS ---
    
    // 1. Check if all fields are filled
    if (!formData.email || !formData.password || !formData.mobile || !formData.userTypeId) {
      toastr.warning("Please fill in all required fields");
      return;
    }

    // 2. Email Format Validation
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toastr.warning("Please enter a valid email address");
      return;
    }

    // 3. Password Match Validation
    if (formData.password !== formData.confirmPassword) {
      toastr.warning("Passwords do not match!");
      return;
    }

    // 4. Mobile Length Validation
    if (formData.mobile.length !== 10) {
      toastr.warning("Mobile number must be exactly 10 digits");
      return;
    }

    setLoading(true);
    try {
      // We send everything except confirmPassword to the backend
      const { confirmPassword, ...submitData } = formData;
      const response = await axios.post(`${apiUrl}/users/add`, submitData);

      if (response.data.warning) {
        toastr.warning(response.data.warning);
        return;
      }

      toastr.success("Registration Successful! Redirecting to Login...");
      setTimeout(() => navigate("/login"), 2000); 

    } catch (error) {
      console.error("Registration Error:", error);
      toastr.error(error.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="content-container">
        <div className="login-container">
          <div className="content">
            <div className="logo-container">
              <h3>NOTES</h3>
            </div>
            <h1 style={{ color: '#000000' }}>Create An Account</h1>
            
            <form className="login-form" onSubmit={handleSubmit}>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                className="input-field"
                value={formData.name}
                onChange={handleChange}
                required
              />
              
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                className="input-field"
                value={formData.email}
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="mobile"
                placeholder="Mobile (10 digits)"
                className="input-field"
                value={formData.mobile}
                onChange={handleChange}
                required
              />

              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  className="input-field"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <span 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '15px', top: '12px', cursor: 'pointer', color: '#666' }}
                >
                  <i className={showPassword ? "bi bi-eye-slash" : "bi bi-eye"}></i>
                </span>
              </div>

              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                className="input-field"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />

              <select
                name="userTypeId"
                className="input-field"
                value={formData.userTypeId}
                onChange={handleChange}
                required
                style={{ backgroundColor: 'white' }}
              >
                <option value="">Select Role</option>
                {roles.map((role) => (
                  <option key={role._id} value={role._id}>
                    {role.usertype} {/* Matches your schema key 'usertype' */}
                  </option>
                ))}
              </select>

              <button 
                type="submit" 
                className="login-button" 
                disabled={loading}
              >
                {loading ? "Processing..." : "Register Now"}
              </button>
            </form>

            <div style={{ marginTop: "20px", textAlign: "center" }}>
              <p>Already have an account? <Link to="/login" style={{ color: '#DA6317', fontWeight: 'bold' }}>Sign In</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;