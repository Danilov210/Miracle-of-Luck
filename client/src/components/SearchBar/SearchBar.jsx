import React from "react";
import { HiLocationMarker } from "react-icons/hi";
import "./SearchBar.css";

const SearchBar = () => {
  return (
    <div className="flexCenter search-bar">
      <HiLocationMarker color="var(--blue)" size={20} />
      <input type="text" />
      <button className="button button-blue">Search</button>
    </div>
  );
};

export default SearchBar;
