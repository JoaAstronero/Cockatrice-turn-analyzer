import React, { useLayoutEffect, useRef, useState } from "react";

// Tooltip implemented with React state to avoid CSS hover issues inside tables
export default function KeywordHelp({ title, text }) {
  const [show, setShow] = useState(false);
  const wrapperRef = useRef(null);
  const tipRef = useRef(null);
  const [pos, setPos] = useState({ left: 22, top: -6, anchor: "left" });

  useLayoutEffect(() => {
    if (!show) return;
    const wrapper = wrapperRef.current;
    const tip = tipRef.current;
    if (!wrapper || !tip) return;
    const wRect = wrapper.getBoundingClientRect();
    const tRect = tip.getBoundingClientRect();

    const pad = 8;
    // prefer left anchored tooltip (right of the ?). If it would overflow, switch to right-anchored (align right of wrapper)
    const viewportW = window.innerWidth;
    const desiredLeft = 22; // px from wrapper left
    const absLeft = wRect.left + desiredLeft + tRect.width;
    if (absLeft + pad > viewportW) {
      // position to the left of the wrapper (align right)
      const left = Math.max(pad, wRect.width - tRect.width - 6);
      setPos({ left, top: -6, anchor: "right" });
    } else {
      setPos({ left: desiredLeft, top: -6, anchor: "left" });
    }
  }, [show]);

  return (
    <span
      ref={wrapperRef}
      style={{ position: "relative", display: "inline-block", marginLeft: 6 }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <span
        style={{
          borderRadius: 999,
          width: 18,
          height: 18,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--primary)",
          color: "#fff",
          fontSize: 12,
          cursor: "default",
        }}
      >
        ?
      </span>
      {show && (
        <div
          ref={tipRef}
          style={{
            position: "absolute",
            left: pos.left,
            top: pos.top,
            minWidth: 220,
            background: "var(--card-bg)",
            color: "var(--text)",
            padding: 10,
            borderRadius: 6,
            boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
            zIndex: 200,
            maxWidth: 420,
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 6 }}>{title}</div>
          <div style={{ fontSize: 13 }}>{text}</div>
        </div>
      )}
    </span>
  );
}
