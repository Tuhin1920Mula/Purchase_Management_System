import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import IndentFormPage from "./pages/IndentFormPage";
import LoginPage from "./pages/LoginPage";
const App = () => {
  return (
      <BrowserRouter>
        <Routes>
          {/*Login Form */}
          {/* <Route path="/" element={<IndentFormPage />} /> */}
          <Route path="/" element={<LoginPage />} />
        </Routes>
      </BrowserRouter>    
  );
};

export default App;
