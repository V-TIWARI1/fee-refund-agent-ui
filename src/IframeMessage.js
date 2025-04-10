import React, { useEffect, useRef, useState } from "react";

const IframeMessage = ({ html, onClick, index, isActive, handleSendWithInput }) => {

  const iframeRef = useRef(null);
  const [height, setHeight] = useState(30); // Default minimal height

  useEffect(() => {
    const handleEvent = (event) => {
      if (event.data?.type === "resize" && event.data.index === index) {
        setHeight(Math.max(30, event.data.height));
      }
      if (event.data?.type === "proceed") {
        console.log(event.data.data)
        handleSendWithInput(event.data.data)
      }
    };

    window.addEventListener("message", handleEvent);
    return () => window.removeEventListener("message", handleEvent);
  }, [index]);

  const srcDoc = `
    <html>
      <head>
      <style>
        html, body {
          margin: 0;
          padding: 0;
          overflow-y: auto;
          overflow-x: hidden;
          max-height: 500px;
          box-sizing: border-box;
          width: 80%;
        }

        * {
          box-sizing: border-box;
          max-width: 100%;
        }

        ::-webkit-scrollbar {
          display: auto;
        }
      </style>

      </head>
      <body>
        ${html}
        <script>
          function postSize() {
            const height = document.documentElement.scrollHeight;
            window.parent.postMessage({ type: 'resize', height: height, index: ${index} }, '*');
          }
          window.onload = postSize;
          window.onresize = postSize;
        </script>
      </body>
    </html>
  `;

  return (
    <div style={{ position: "relative", width: "100%", overflow: "hidden" }}>
    {/* Iframe itself */}
    <iframe
      ref={iframeRef}
      srcDoc={srcDoc}
      style={{
        width: "100%",
        height: `${height}px`,
        border: "none",
        borderRadius: "8px",
        overflow: "hidden",
        display: "block",
        pointerEvents: isActive ? "auto" : "none", // disable interaction if not active
        opacity: isActive ? 1 : 0.6, // visually dim old ones
      }}
      sandbox="allow-scripts allow-same-origin"
      title={`iframe-${index}`}
    />
  
    {/* Overlay only for inactive ones */}
    {!isActive && (
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: `${height}px`,
          zIndex: 5,
          cursor: "not-allowed",
        }}
      />
    )}
  
    {/* Expand button only shown if active */}
    {isActive && (
      <button
        onClick={onClick}
        style={{
          position: "absolute",
          top: "8px",
          left: "8px",
          width: "28px",
          height: "28px",
          zIndex: 10,
          backgroundColor: "#ffffffcc",
          border: "1px solid #ccc",
          borderRadius: "4px",
          fontWeight: "bold",
          fontSize: "16px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 1px 4px rgba(0, 0, 0, 0.2)",
        }}
        title="Expand"
      >
        &#x2750;
      </button>
    )}
  </div>
  
  );
};

export default IframeMessage;
