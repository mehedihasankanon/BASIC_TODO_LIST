import React, { useState } from "react";

import { fetchWithAuth, API_BASE_URL as URL } from "../utils/api";

import { toast } from "react-toastify";

const InputTodo = ({ onTodoAdded }) => {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (description.trim() === "") {
      toast.error("Todo cannot be empty");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetchWithAuth(`${URL}/todos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Failed to add todo. Please try again.");
        return;
      }

      toast.success("Todo added successfully!");

      if (onTodoAdded) {
        onTodoAdded();
      }

      setDescription("");
    } catch (err) {
      console.error(err.message);
      toast.error("Failed to add todo. Please check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Add New Todo</h2>

      <form className="flex gap-2" onSubmit={handleSubmit}>
        <input
          type="text"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter a new todo..."
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className={`px-6 py-2 rounded-lg font-medium text-white transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600 active:bg-blue-700"
          }`}
        >
          {loading ? "Adding..." : "Add"}
        </button>
      </form>
    </div>
  );
};

export default InputTodo;
