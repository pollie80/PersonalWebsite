import React from "react";
import "./App.css";
import { NavBar } from "./components/NavBar";
import { Home } from "./pages/home";
import { About } from "./pages/about";
import { BrowserRouter, Route, Routes } from "react-router-dom";

function App() {
	return (
		<BrowserRouter>
			<NavBar />
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/about" element={<About />} />
			</Routes>
		</BrowserRouter>

	);
}

export default App;
