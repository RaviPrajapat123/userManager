import React, { useEffect, useState } from "react";
import axios from "axios";

const TagsTable = () => {
  const [tags, setTags] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:3000/tags")  // API endpoint for tags
      .then((res) => setTags(res.data.tags))
      .catch((err) => console.error("Error fetching tags:", err));
  }, []);

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>All Blog Tags</h2>
      <table style={styles.table}>
        <thead>
          <tr style={styles.headerRow}>
            <th style={styles.headerCell}>S.NO</th>
            <th style={styles.headerCell}>Tag Name</th>
          </tr>
        </thead>
        <tbody>
          {tags.length > 0 ? (
            tags.map((tag, index) => (
              <tr
                key={index}
                style={index % 2 === 0 ? styles.evenRow : styles.oddRow}
              >
                <td style={styles.cell}>{index + 1}</td>
                <td style={styles.cell}>{tag}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="2" style={styles.noData}>
                No tags found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "600px",
    margin: "40px auto",
    padding: "20px",
    backgroundColor: "#f9f9f9",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  heading: {
    textAlign: "center",
    marginBottom: "20px",
    color: "#333",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  headerRow: {
    backgroundColor: "#007bff",
  },
  headerCell: {
    color: "white",
    fontWeight: "bold",
    padding: "12px 15px",
    textAlign: "left",
  },
  evenRow: {
    backgroundColor: "#f1f1f1",
  },
  oddRow: {
    backgroundColor: "white",
  },
  cell: {
    padding: "12px 15px",
    borderBottom: "1px solid #ddd",
  },
  noData: {
    textAlign: "center",
    padding: "15px",
    color: "#777",
  },
};

export default TagsTable;
