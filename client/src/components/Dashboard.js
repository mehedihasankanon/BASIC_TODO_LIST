import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { removeTokens } from "../utils/JWTHandler";
import InputTodo from "./InputTodo";
import ListTodo from "./ListTodo";

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    removeTokens();
    navigate("/login");
  };

  const [refreshKey, setRefreshKey] = useState(0);

  // TODO: implement todo added handler
  const handleTodoAdded = () => {
    // Tell ListTodo to refetch

    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">PERN Todo List</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto py-8 px-4">
        <InputTodo onTodoAdded={handleTodoAdded} />
        {/** whenever the refresh key changes, the listtodo executes */}
        <ListTodo refreshKey={refreshKey} />
        {/**
         *
         * alternate method: Lifting State Up
         *
         * put todos in dashboard.
         *
         * const [todos, setTodos] = useState([]);
         *
         * const handleTodoAdded = (newTodo) => {
         *  setTodos([...todos, newTodo]);
         * };
         *
         * then <ListTodo todos = {todos} />
         *
         */}
      </main>
    </div>
  );
}
