import React, { Fragment, useEffect, useState } from "react";

import { fetchWithAuth, API_BASE_URL as URL } from "../utils/api";

import EditTodo from "./EditTodo";

const ListTodo = ({ refreshKey }) => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const deleteTodo = async (id) => {
    try {
      const response = await fetchWithAuth(`${URL}/todos/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        setError("Failed to delete todo");
        return;
      }

      setTodos(todos.filter((todo) => todo.todo_id !== id));
    } catch (error) {
      console.error(error.message);
    }
  };

  const getTodos = async () => {
    setError("");
    setLoading(true);
    try {
      const response = await fetchWithAuth(`${URL}/todos`);

      if (!response.ok) {
        setError("Failed to fetch todos");
        return;
      }

      const jsonData = await response.json();

      setTodos(jsonData);
    } catch (err) {
      console.error(err.message);
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
              <th className="border border-gray-300 px-4 py-3">Description</th>
              <th className="border border-gray-300 px-4 py-3">Edit</th>
              <th className="border border-gray-300 px-4 py-3">Delete</th>
            </tr>
          </thead>
          <tbody>
            {todos.map((todo) => (
              <tr key={todo.todo_id} className="hover:bg-gray-50 border-b border-gray-300">
                <td className="px-4 py-3 border-r border-gray-300">{todo.description}</td>
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
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
    </Fragment>
  );
};

export default ListTodo;
