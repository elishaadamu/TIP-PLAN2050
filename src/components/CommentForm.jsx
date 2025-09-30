import React, { useState } from "react";
import Swal from "sweetalert2";

function CommentForm({ projectId, addComment, onClosePopup }) {
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const newComment = {
      projectId,
      name,
      comment,
      timestamp: new Date().toISOString(),
    };

    try {
      await addComment(newComment);
      setName("");
      setComment("");
      console.log("Comment submitted successfully, calling onClosePopup");
      onClosePopup(); // Close the popup after successful submission
    } catch (error) {
      console.error("Error submitting comment:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        marginTop: "20px",
        padding: "15px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        backgroundColor: "#f9f9f9",
        boxSizing: "border-box",
      }}
    >
      <div style={{ marginBottom: "10px" }}>
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            fontSize: "14px",
            boxSizing: "border-box",
          }}
        />
      </div>
      <div style={{ marginBottom: "10px" }}>
        <textarea
          placeholder="Your comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
          disabled={loading}
          style={{
            width: "100%",
            padding: "5px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            fontSize: "14px",
            resize: "vertical",
            boxSizing: "border-box",
          }}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        style={{
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "14px",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? "Submitting..." : "Submit Comment"}
      </button>
    </form>
  );
}

export default CommentForm;
