import React, { Fragment, useEffect, useState } from "react";

import { fetchWithAuth, API_BASE_URL as URL } from "../utils/api";

import { toast } from "react-toastify";

import EditTodo from "./EditTodo";

const ListTodo = ({ refreshKey }) => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);

  const deleteTodo = async (id) => {
    setLoading(true);
    const scrollY = window.scrollY; // Store current scroll position
    try {
      const response = await fetchWithAuth(`${URL}/todos/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Failed to delete todo. Please try again.");
        return;
      }

      toast.success("Todo deleted successfully!");

      setTodos(todos.filter((todo) => todo.todo_id !== id));
    } catch (error) {
      console.error(error.message);
      toast.error("Failed to delete todo. Please check console for details.");
    } finally {
      setLoading(false);
    }

    requestAnimationFrame(() => {
      window.scrollTo(0, scrollY);
    });
  };

  const getTodos = async () => {
    setLoading(true);
    try {
      const response = await fetchWithAuth(`${URL}/todos`);

      const jsonData = await response.json();

      if (!response.ok) {
        toast.error(
          jsonData.message || "Failed to fetch todos. Please try again."
        );
        return;
      }

      setTodos(jsonData);
    } catch (err) {
      console.error(err.message);
      toast.error("Failed to fetch todos. Please check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const toggleComplete = async (id, isCompleted) => {
    setLoading(true);
    const scrollY = window.scrollY; // Store current scroll position
    
    try {
      const response = await fetchWithAuth(`${URL}/todos/${id}/complete`, {
        method: "PATCH",
        body: JSON.stringify({ is_completed: isCompleted }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Failed to update todo. Please try again.");
        return;
      }

      toast.success("Todo updated successfully!");

      const updatedTodos = todos.map((todo) =>
        todo.todo_id === id ? { ...todo, is_completed: isCompleted } : todo
      );

      updatedTodos.sort((a, b) => {
        if (a.is_completed !== b.is_completed) {
          return a.is_completed - b.is_completed;
        }
        return new Date(b.created_at) - new Date(a.created_at);
      });

      setTodos(updatedTodos);
      
      // Restore scroll position after state update
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollY);
      });
    } catch (error) {
      console.error(error.message);
      toast.error("Failed to update todo. Please check console for details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTodos();
  }, [refreshKey]);

  return (
    <Fragment>
      {loading && <p className="text-center">Loading todos...</p>}
      {!loading && todos.length === 0 && (
        <p className="text-center">No todos yet!</p>
      )}
      {!loading && todos.length > 0 && (
        <table className="w-full border-collapse mt-5 text-center bg-white shadow rounded-lg overflow-hidden">
          <thead className="bg-gray-200">
            <tr>
              <th className="border border-gray-300 px-4 py-3"> </th>
              <th className="border border-gray-300 px-4 py-3">Description</th>
              <th className="border border-gray-300 px-4 py-3">Edit</th>
              <th className="border border-gray-300 px-4 py-3">Delete</th>
            </tr>
          </thead>
          <tbody>
            {todos.map((todo) => (
              <tr
                key={todo.todo_id}
                className={`hover:bg-gray-50 border-b border-gray-300 transition ${
                  todo.is_completed ? "bg-gray-100" : ""
                }`}
              >
                <td className="px-4 py-3 border-r border-gray-300 text-center">
                  <input
                    type="checkbox"
                    checked={todo.is_completed}
                    onChange={(e) =>
                      toggleComplete(todo.todo_id, e.target.checked)
                    }
                    className="w-5 h-5 cursor-pointer accent-green-500"
                  />
                </td>
                <td
                  className={`px-4 py-3 border-r border-gray-300 text-left ${
                    todo.is_completed
                      ? "line-through text-gray-400"
                      : "text-gray-800"
                  }`}
                >
                  {todo.description}
                </td>
                <td className="px-4 py-3 border-r border-gray-300">
                  <EditTodo todo={todo} onTodoUpdated={() => getTodos()} />
                </td>
                <td className="px-4 py-3">
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition"
                    onClick={() => deleteTodo(todo.todo_id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Fragment>
  );
};

export default ListTodo;
