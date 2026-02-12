import { useState, useRef } from "react";
import { registerUser } from "../api/api.js";
import { Link, useNavigate } from "react-router-dom";
import "./register.css";


// Registration page component, consisting of a form to create a new user account
export default function RegisterPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef(null);
  const [image, setImage] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle form submission
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setOk("");

    // validating username, name, password and confirm password fields
    if (!username.trim()) {
      setError("Username is required");
      return;
    }
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    if (!password) {
      setError("Password is required");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setOk("");

    // Attempt to register the user
    setLoading(true);
    try {
      // Call the registerUser API function
      await registerUser({
        username: username.trim(),
        name: name.trim(),
        image: image.trim(),
        password
      });
      setOk("User registered successfully! You can now log in.");
      navigate("/login", { state: { justRegistered: true, username: username.trim() } });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) {
      setImage("");
      setImagePreview("");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file");
      e.target.value = "";
      setImage("");
      setImagePreview("");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      setImage(dataUrl);
      setImagePreview(dataUrl);
      setError("");
    };
    reader.onerror = () => {
      setError("Failed to read image file");
      setImage("");
      setImagePreview("");
    };
    reader.readAsDataURL(file);
  }
  function handleClearImage() {
    setImage("");
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }



  // Render the registration form
  return (
    <div className="gd-auth-bg">
      <div className="gd-auth-card">
        <div className="gd-auth-brand">
          <div className="gd-auth-logo" />
          <h2 className="gd-auth-title">Drive</h2>
        </div>
        <p className="gd-auth-subtitle">Create your account to continue</p>

        {error && <div className="alert alert-danger">{error}</div>}
        {ok && <div className="alert alert-success">{ok}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input className="form-control gd-input" value={username}
              onChange={(e) => setUsername(e.target.value)} />
          </div>

          <div className="mb-3">
            <label className="form-label">Name</label>
            <input className="form-control gd-input" value={name}
              onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="mb-3">
            <label className="form-label">Profile image</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="form-control gd-input"
              onChange={handleImageChange}
            />
            {imagePreview && (
              <div className="gd-image-preview">
                <img src={imagePreview} alt="Selected profile" />
                <button
                  className="btn btn-outline-secondary gd-btn gd-btn-small"
                  type="button"
                  onClick={handleClearImage}
                >
                  Remove
                </button>
              </div>
            )}

          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input type="password" className="form-control gd-input" value={password}
              onChange={(e) => setPassword(e.target.value)} />
          </div>

          <div className="mb-3">
            <label className="form-label">Confirm password</label>
            <input type="password" className="form-control gd-input" value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>

          <button className="btn btn-primary w-100 gd-btn" type="submit" disabled={loading}>
            {loading ? "Registering..." : "Create account"}
          </button>
        </form>

        <div className="gd-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
