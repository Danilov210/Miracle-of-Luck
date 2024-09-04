import "./SearchBar.css";
import React from "react";

const SearchBar = ({ filter, setFilter }) => {
  return (
    <div className="flexCenter ">
      <input
        type="text"
        placeholder="Search lotteries..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="search-bar"
      />
    </div>
  );
};

export default SearchBar;
