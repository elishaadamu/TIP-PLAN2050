import React, { useState } from "react";
import CommentForm from "./CommentForm";

function ProjectPopup({ project, addComment, comments, onClosePopup }) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div
      className="project-popup"
      style={{
        maxWidth: "500px",
        background: "white",
        borderRadius: "8px",
      }}
    >
      <h3>{project.Description || "Unnamed Project"}</h3>
      <div className="project-details">
        <p>
          <strong>UPC:</strong> {project.UPC}
        </p>
        <p>
          <strong>Scope:</strong> {project.Scope}
        </p>
        <p>
          <strong>Type:</strong> {project.Type}
        </p>
        <p>
          <strong>County:</strong> {project.County}
        </p>
        <h4>Comments:</h4>
        {comments.length > 0 ? (
          comments.map((c) => <p key={c._id}>- {c.text}</p>)
        ) : (
          <p>No comments yet.</p>
        )}
      </div>

      <div className="popup-buttons">
        <button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Close" : "Add Comment"}
        </button>
      </div>

      {showForm && (
        <div className="comment-form-container">
          <CommentForm
            projectId={project.UPC}
            addComment={addComment}
            onClosePopup={() => {
              onClosePopup(); // Call the original onClosePopup from parent
              setShowForm(false); // Also hide the comment form section
            }}
          />
        </div>
      )}
    </div>
  );
}

export default ProjectPopup;
