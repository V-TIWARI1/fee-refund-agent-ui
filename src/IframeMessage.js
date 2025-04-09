import React, { useEffect, useRef, useState } from "react";

const IframeMessage = ({ html, onClick, index, handleSendWithInput }) => {
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
    <div  style={{
    position: "relative",
    width: "100%",
    overflow: "hidden",
  }}>

  <iframe
  ref={iframeRef}
  srcDoc={srcDoc}
  style={{
    width: "100%",
    height: `${height}px`,
    border: "none",
    borderRadius: "8px",
    overflow: "hidden", // Always "hidden" on iframe; content scrolls inside iframe
    display: "block", // Prevents inline iframe weird spacing
  }}
  sandbox="allow-scripts allow-same-origin"
  title={`iframe-${index}`}
/>


  <div
    onClick={onClick}
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      width: "25%", // Leave space for scrollbar
      bottom: 0,
      zIndex: 10,
      cursor: "pointer",
    }}
  />
</div>

  );
};

export default IframeMessage;
