
import { useState } from "react";
import { api } from "../api";

const initial = {
  title: "",
  category: "Romance",
  description: "",
  banner_url: "",
  original_price: 299,
  published: false
};

export default function AddStory({ token }) {
  const [form, setForm] = useState(initial);
  const [message, setMessage] = useState("");

  function update(e) {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === "checkbox" ? checked :
        name === "original_price" ? Number(value) : value
    }));
  }

  async function submit(e) {
    e.preventDefault();
    setMessage("");
    try {
      await api("/admin/stories", token, {
        method: "POST",
        body: JSON.stringify(form)
      });
      setMessage("Story created successfully");
      setForm(initial);
    } catch (err) {
      setMessage(err.message);
    }
  }

  return (
    <section>
      <h2>Create Story</h2>
      <form onSubmit={submit}>
        <p>
          <label>Title<br />
            <input name="title" value={form.title}
              onChange={update} required />
          </label>
        </p>
        <p>
          <label>Category<br />
            <select name="category" value={form.category}
              onChange={update}>
              {["Romance", "Horror", "Thriller", "Fantasy",
                "Drama", "Mystery"].map(c =>
                <option key={c}>{c}</option>
              )}
            </select>
          </label>
        </p>
        <p>
          <label>Description<br />
            <textarea name="description" value={form.description}
              onChange={update} />
          </label>
        </p>
        <p>
          <label>Banner image URL<br />
            <input name="banner_url" type="url"
              value={form.banner_url} onChange={update} required />
          </label>
        </p>
        <p>
          <label>Original price (₹)<br />
            <input name="original_price" type="number" min="1"
              value={form.original_price} onChange={update} required />
          </label>
        </p>
        <label>
          <input name="published" type="checkbox"
            checked={form.published} onChange={update} />
          Publish story
        </label>
        <p><button type="submit">Save Story</button></p>
      </form>
      <p role="status">{message}</p>
    </section>
  );
}
