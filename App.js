
import { useState } from "react";
import AddStory from "./pages/AddStory";
import AddEpisode from "./pages/AddEpisode";
import DiscountManager from "./pages/DiscountManager";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [token, setToken] = useState(
    () => sessionStorage.getItem("adminToken") || ""
  );
  const [page, setPage] = useState("dashboard");

  function saveToken(value) {
    sessionStorage.setItem("adminToken", value);
    setToken(value);
  }

  if (!token) {
    return <Login onLogin={saveToken} />;
  }

  const pages = {
    dashboard: <Dashboard token={token} />,
    stories: <AddStory token={token} />,
    episodes: <AddEpisode token={token} />,
    discounts: <DiscountManager token={token} />
  };

  return (
    <div style={{ fontFamily: "Arial", maxWidth: 1100, margin: "auto",
      padding: 24 }}>
      <h1>All Story FM Admin</h1>
      <nav style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {Object.keys(pages).map(key => (
          <button key={key} onClick={() => setPage(key)}>
            {key[0].toUpperCase() + key.slice(1)}
          </button>
        ))}
        <button onClick={() => {
          sessionStorage.removeItem("adminToken");
          setToken("");
        }}>Logout</button>
      </nav>
      <hr />
      {pages[page]}
    </div>
  );
}

function Login({ onLogin }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/admin-login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: value })
        }
      );

      if (!response.ok) throw new Error("Admin login is not configured");
      const data = await response.json();
      onLogin(data.token);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form onSubmit={submit}>
      <h2>Admin Login</h2>
      <input
        type="email"
        required
        placeholder="Admin email"
        value={value}
        onChange={e => setValue(e.target.value)}
      />
      <button type="submit">Continue</button>
      <p>{error}</p>
    </form>
  );
}
