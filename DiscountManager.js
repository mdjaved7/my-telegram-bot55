import { useState } from "react";
import { api } from "../api";

export default function DiscountManager({ token }) {
  const [storyId, setStoryId] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [price, setPrice] = useState(99);
  const [banner, setBanner] = useState("Festive Offer!");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [message, setMessage] = useState("");

  async function submit(e) {
    e.preventDefault();
    try {
      await api(`/admin/stories/${storyId}/discount`, token, {
        method: "PATCH",
        body: JSON.stringify({
          is_discount_active: enabled,
          discount_price: Number(price),
          sale_banner_message: banner,
          discount_starts_at: start || null,
          discount_ends_at: end || null
        })
      });
      setMessage(enabled ? "Discount saved" : "Discount disabled");
    } catch (err) {
      setMessage(err.message);
    }
  }

  return (
    <section>
      <h2>Festival / Event Discount</h2>
      <form onSubmit={submit}>
        <p>
          <label>Story ID<br />
            <input value={storyId} onChange={e =>
              setStoryId(e.target.value)} required />
          </label>
        </p>
        <label>
          <input type="checkbox" checked={enabled}
            onChange={e => setEnabled(e.target.checked)} />
          Enable discount
        </label>
        <p>
          <label>Discount price (₹)<br />
            <input type="number" min="1" value={price}
              onChange={e => setPrice(e.target.value)} required />
          </label>
        </p>
        <p>
          <label>Sale banner message<br />
            <input value={banner} onChange={e =>
              setBanner(e.target.value)} />
          </label>
        </p>
        <p>
          <label>Start time<br />
            <input type="datetime-local" value={start}
              onChange={e => setStart(e.target.value)} />
          </label>
        </p>
        <p>
          <label>End time<br />
            <input type="datetime-local" value={end}
              onChange={e => setEnd(e.target.value)} />
          </label>
        </p>
        <button type="submit">Save Discount</button>
      </form>
      <p role="status">{message}</p>
    </section>
  );
}
