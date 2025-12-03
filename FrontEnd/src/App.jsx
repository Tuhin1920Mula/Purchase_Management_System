import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// import your form
import IndentFormPage from "./pages/IndentFormPage";
const App = () => {
  return (
      <BrowserRouter>
        <Routes>
          {/*Login Form */}
          <Route path="/" element={<IndentFormPage />} />
        </Routes>
      </BrowserRouter>    
  );
};

export default App;
