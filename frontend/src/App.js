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
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'rgb(30 41 59)',
              color: 'white',
              border: '1px solid rgb(139 92 246 / 0.2)'
            }
          }}
        />
      </BrowserRouter>
    </div>
  );
}

export default App;