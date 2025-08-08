import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import GameLayout from "./components/GameLayout";
import { Toaster } from "./components/ui/sonner";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<GameLayout />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </div>
  );
}

export default App;