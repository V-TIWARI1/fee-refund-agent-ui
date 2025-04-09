// FullscreenModal.js
import React from "react";

const FullscreenModal = ({ html, onClose }) => {
  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0,
      width: "100%", height: "100%",
      backgroundColor: "rgba(0,0,0,0.7)",
      zIndex: 1000,
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    }}>
      <div style={{ width: "80%", height: "80%", backgroundColor: "white", position: "relative" }}>
        <button onClick={onClose} style={{
          position: "absolute",
          top: 10, right: 10,
          zIndex: 1001
        }}>Close</button>
        <iframe
          srcDoc={html}
          style={{
            width: "100%",
            height: "100%",
            border: "none",
          }}
          sandbox="allow-scripts allow-same-origin"
          title="fullscreen-iframe"
        />
      </div>
    </div>
  );
};

export default FullscreenModal;
