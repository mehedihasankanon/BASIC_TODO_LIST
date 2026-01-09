import React, { Fragment, useState } from "react";

import { fetchWithAuth, API_BASE_URL as URL } from "../utils/api";

import { toast } from "react-toastify";

const EditTodo = ({ todo, onTodoUpdated }) => {
  const [description, setDescription] = useState(todo.description);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const validateForm = () => {
    if (description.trim() === "") {
      toast.error("Todo cannot be empty");
      return false;
    }

    if (description === todo.description) {
      toast.info("No changes made to the todo");
      return false;
    }

    return true;
  };

  const updateDescription = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetchWithAuth(`${URL}/todos/${todo.todo_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description }),
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(data.error || "Failed to update todo");
        return;
      }

      setShowModal(false);
      setDescription(todo.description);

      if (onTodoUpdated) {
        onTodoUpdated();
      }
    } catch (err) {
      console.error(err.message);
      toast.error(
        "An error occurred while updating the todo. Check console for details."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Fragment>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition"
      >
        Edit
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-96 shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Edit Todo</h2>

            <form onSubmit={updateDescription} className="space-y-4">
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Todo Description
                </label>
                <input
                  id="description"
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Update your todo..."
                  disabled={loading}
                />
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setDescription(todo.description);
                  }}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded transition"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 rounded text-white transition ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}
                >
                  {loading ? "Updating..." : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Fragment>
  );
};

export default EditTodo;
