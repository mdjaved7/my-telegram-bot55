import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminDashboard() {
  const [stories, setStories] = useState([]);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    const res = await axios.get('/api/stories');
    setStories(res.data);
  };

  const toggleDiscount = async (storyId, currentStatus) => {
    await axios.put(`/api/admin/story/${storyId}/discount`, {
      is_discount_active: !currentStatus
    });
    fetchStories(); // Refresh list
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Festival / Event Discount Manager</h1>
      <table className="min-w-full bg-white shadow-md rounded">
        <thead>
          <tr>
            <th className="p-4 border-b">Story Title</th>
            <th className="p-4 border-b">Base Price (₹)</th>
            <th className="p-4 border-b">Discount Price (₹)</th>
            <th className="p-4 border-b">Sale Status</th>
            <th className="p-4 border-b">Action</th>
          </tr>
        </thead>
        <tbody>
          {stories.map(story => (
            <tr key={story._id} className="text-center">
              <td className="p-4 border-b">{story.title}</td>
              <td className="p-4 border-b">{story.original_price}</td>
              <td className="p-4 border-b text-green-600">{story.discount_price}</td>
              <td className="p-4 border-b">
                {story.is_discount_active ? (
                  <span className="bg-green-200 text-green-800 px-2 py-1 rounded">Active</span>
                ) : (
                  <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded">Inactive</span>
                )}
              </td>
              <td className="p-4 border-b">
                <button 
                  onClick={() => toggleDiscount(story._id, story.is_discount_active)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Toggle Discount
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
