import React from "react";
import { Link } from "react-router-dom";
// import "./NavBar.css";

export function NavBar() {
	return (
		<nav>
			<ul>
				<li>
					<Link to="/">Home</Link>
				</li>
				<li>
					<Link to="/about">About</Link>
				</li>
			</ul>
		</nav>
	);
}
