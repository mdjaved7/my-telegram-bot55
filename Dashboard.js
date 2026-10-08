
import { useEffect, useState } from "react";
import { api } from "../api";

export default function Dashboard({ token }) {
  const [users, setUsers] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api("/admin/users", token),
      api("/admin/purchases", token)
    ]).then(([u, p]) => {
      setUsers(u);
      setPurchases(p);
    }).catch(e => setError(e.message));
  }, [token]);

  const sales = purchases.reduce(
    (total, p) => total + (p.amount_paid || 0), 0
  );

  return (
    <section>
      <h2>Dashboard</h2>
      {error && <p role="alert">{error}</p>}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
        gap: 16
      }}>
        <Stat title="Registered Users" value={users.length} />
        <Stat title="Purchase Records" value={purchases.length} />
        <Stat title="Recorded Sales" value={`₹${sales}`} />
      </div>

      <h3>Recent Purchases</h3>
      <div style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr><th>User</th><th>Story</th><th>Amount</th>
              <th>Source</th></tr>
          </thead>
          <tbody>
            {purchases.slice(0, 20).map(p => (
              <tr key={p._id}>
                <td>{p.user?.name || p.user?.phone || "Unknown"}</td>
                <td>{p.story?.title || "Unknown story"}</td>
                <td>₹{p.amount_paid}</td>
                <td>{p.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Stat({ title, value }) {
  return (
    <div style={{
      border: "1px solid #ddd", borderRadius: 12, padding: 20
    }}>
      <div>{title}</div>
      <h2>{value}</h2>
    </div>
  );
}
