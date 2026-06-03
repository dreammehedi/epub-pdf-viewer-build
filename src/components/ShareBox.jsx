import * as htmlToImage from "html-to-image";
import { Download, Facebook, Linkedin, Share2, Twitter, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// Beautiful curated gradient presets
const PRESET_GRADIENTS = [
  { name: "Sunset Glow", color1: "#FF512F", color2: "#DD2476" },
  { name: "Ocean Breeze", color1: "#00c6ff", color2: "#0072ff" },
  { name: "Mystic Purple", color1: "#da22ff", color2: "#9733ee" },
  { name: "Emerald Dream", color1: "#348F50", color2: "#56B4D3" },
  { name: "Midnight City", color1: "#0f2027", color2: "#203a43" },
];

export default function ShareBox({
  openShareBox,
  setOpenShareBox,
  selectedText,
  setSelectedText,
  toast,
  platforms = ["facebook", "twitter", "linkedin", "native"], // Default platforms, editable dynamically
  brandText,
}) {
  const shareQuoteRef = useRef(null);
  const contentRef = useRef(null);
  const [gradient, setGradient] = useState(PRESET_GRADIENTS[0]);
  const [isSharing, setIsSharing] = useState(false);

  const notify = {
    success: (msg) =>
      toast?.success ? toast.success(msg) : console.log("Success:", msg),
    error: (msg) =>
      toast?.error ? toast.error(msg) : console.error("Error:", msg),
  };

  useEffect(() => {
    if (!openShareBox) return;

    const handleClickOutside = (event) => {
      if (
        shareQuoteRef.current &&
        !shareQuoteRef.current.contains(event.target)
      ) {
        setOpenShareBox(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openShareBox]);

  if (!openShareBox) return null;

  // Generate Image Blob helper
  const generateImageBlob = async () => {
    if (!contentRef.current) return null;
    
    // Ensure all web fonts (especially Hind Siliguri for Bengali) are fully loaded by the browser before capturing!
    if (typeof window !== "undefined" && document?.fonts?.ready) {
      await document.fonts.ready;
    }
    
    const dataUrl = await htmlToImage.toPng(contentRef.current, {
      quality: 1.0,
      pixelRatio: 2,
    });
    const res = await fetch(dataUrl);
    return await res.blob();
  };

  // Download high-quality image
  const handleDownload = async () => {
    try {
      const blob = await generateImageBlob();
      if (!blob) return;
      const dataUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `ReadersFM-${Date.now()}.png`;
      link.click();
      URL.revokeObjectURL(dataUrl);
      notify.success("Image generated & downloaded successfully!");
    } catch (err) {
      console.error(err);
      notify.error("Failed to generate image card");
    }
  };

  // Native Web Share API to share dynamically generated IMAGE CARD!
  const handleNativeShare = async () => {
    if (!navigator.share) {
      notify.error(
        "Web Share API is not supported on this browser. Try download instead!",
      );
      return;
    }
    setIsSharing(true);
    try {
      const blob = await generateImageBlob();
      if (!blob) return;

      const file = new File([blob], `ReadersFM-${Date.now()}.png`, {
        type: "image/png",
      });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Readers.fm Quote Card",
          text: `"${selectedText}"`,
        });
        notify.success("Successfully shared!");
      } else {
        // Fallback to text sharing if files share isn't fully supported
        await navigator.share({
          title: "Readers.fm Quote",
          text: `"${selectedText}"`,
          url: window.location.href,
        });
        notify.success("Shared quote as text!");
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error(err);
        notify.error("Failed to share image");
      }
    } finally {
      setIsSharing(false);
    }
  };

  // Open share window
  const openShare = (url) => {
    window.open(url, "_blank", "width=600,height=400");
  };

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap"
      />
      <div
        ref={shareQuoteRef}
      style={{
        position: "fixed",
        zIndex: 99999,
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(255, 255, 255, 0.5)",
        borderRadius: "20px",
        boxShadow:
          "0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 1px 1px rgba(255,255,255,0.7) inset",
        padding: "20px",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "440px",
        maxWidth: "60vw",
        maxHeight: "60vh",
        overflowY: "auto",
        color: "#1e293b",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
      className="share-box-container"
    >
      {/* Header with Close */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: "1.1rem",
            fontWeight: 700,
            letterSpacing: "-0.02em",
          }}
        >
          Share Quote Card
        </h3>
        <button
          onClick={() => setOpenShareBox(false)}
          style={{
            background: "rgba(0,0,0,0.05)",
            border: "none",
            borderRadius: "50%",
            padding: "6px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Content with Gradient Background */}
      <div
        ref={contentRef}
        style={{
          borderRadius: "16px",
          padding: "32px 24px",
          textAlign: "center",
          color: "white",
          minHeight: "180px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
          background: `linear-gradient(135deg, ${gradient.color1}, ${gradient.color2})`,
          overflow: "hidden",
        }}
      >
        {/* Subtle Quotes Mark Background */}
        <span
          style={{
            position: "absolute",
            top: "10px",
            left: "20px",
            fontSize: "5rem",
            opacity: 0.15,
            fontWeight: "serif",
            lineHeight: 1,
          }}
        >
          “
        </span>

        <p
          style={{
            margin: 0,
            fontWeight: 600,
            fontSize: "1.125rem",
            lineHeight: 1.6,
            zIndex: 1,
            textShadow: "0 2px 4px rgba(0,0,0,0.1)",
            fontStyle: "italic",
            fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', 'SolaimanLipi', system-ui, -apple-system, sans-serif",
            fontFeatureSettings: '"liga" 1, "clig" 1',
            fontVariantLigatures: "normal",
          }}
        >
          {selectedText || "No text selected"}
        </p>

        <div
          style={{
            marginTop: "20px",
            fontSize: "0.75rem",
            opacity: 0.8,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            zIndex: 1,
            fontWeight: 700,
          }}
        >
          {brandText || "Shared via Readers.fm"}
        </div>
      </div>

      {/* Preset Gradients Color Selection */}
      <div style={{ marginTop: "16px" }}>
        <span
          style={{
            fontSize: "0.8rem",
            fontWeight: 600,
            color: "#64748b",
            display: "block",
            marginBottom: "8px",
          }}
        >
          Background Presets
        </span>
        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {PRESET_GRADIENTS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => setGradient(p)}
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${p.color1}, ${p.color2})`,
                border:
                  gradient.name === p.name
                    ? "2px solid #0f172a"
                    : "2px solid transparent",
                cursor: "pointer",
                padding: 0,
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                transition: "transform 0.15s ease",
              }}
              title={p.name}
            />
          ))}

          {/* Manual Input Dropdowns */}
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              gap: "6px",
              alignItems: "center",
            }}
          >
            <input
              type="color"
              value={gradient.color1}
              onChange={(e) =>
                setGradient({
                  ...gradient,
                  name: "custom",
                  color1: e.target.value,
                })
              }
              style={{
                width: "24px",
                height: "24px",
                border: "none",
                padding: 0,
                borderRadius: "4px",
                cursor: "pointer",
                background: "none",
              }}
            />
            <input
              type="color"
              value={gradient.color2}
              onChange={(e) =>
                setGradient({
                  ...gradient,
                  name: "custom",
                  color2: e.target.value,
                })
              }
              style={{
                width: "24px",
                height: "24px",
                border: "none",
                padding: 0,
                borderRadius: "4px",
                cursor: "pointer",
                background: "none",
              }}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: "8px",
          marginTop: "20px",
        }}
      >
        {/* Download Card */}
        <button
          onClick={handleDownload}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            fontSize: "0.85rem",
            fontWeight: 700,
            padding: "10px 16px",
            backgroundColor: "#0f172a",
            color: "white",
            borderRadius: "12px",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 6px -1px rgba(15, 23, 42, 0.15)",
          }}
        >
          <Download size={16} /> Download PNG
        </button>

        {/* Dynamic Platforms Container */}
        <div style={{ display: "flex", gap: "8px" }}>
          {platforms.includes("native") && (
            <button
              onClick={handleNativeShare}
              disabled={isSharing}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "40px",
                height: "40px",
                backgroundColor: "#f1f5f9",
                color: "#475569",
                borderRadius: "12px",
                border: "none",
                cursor: "pointer",
              }}
              title="Share dynamically via Web Share"
            >
              <Share2 size={18} />
            </button>
          )}

          {platforms.includes("facebook") && (
            <button
              onClick={() =>
                openShare(
                  `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                    window.location.href,
                  )}&quote=${encodeURIComponent(selectedText || "")}`,
                )
              }
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "40px",
                height: "40px",
                backgroundColor: "#e0f2fe",
                color: "#0369a1",
                borderRadius: "12px",
                border: "none",
                cursor: "pointer",
              }}
              title="Share to Facebook"
            >
              <Facebook size={18} />
            </button>
          )}

          {platforms.includes("twitter") && (
            <button
              onClick={() =>
                openShare(
                  `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    selectedText || "",
                  )}&url=${encodeURIComponent(window.location.href)}`,
                )
              }
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "40px",
                height: "40px",
                backgroundColor: "#eff6ff",
                color: "#1d4ed8",
                borderRadius: "12px",
                border: "none",
                cursor: "pointer",
              }}
              title="Share to Twitter"
            >
              <Twitter size={18} />
            </button>
          )}

          {platforms.includes("linkedin") && (
            <button
              onClick={() =>
                openShare(
                  `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                    window.location.href,
                  )}`,
                )
              }
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "40px",
                height: "40px",
                backgroundColor: "#f0fdf4",
                color: "#15803d",
                borderRadius: "12px",
                border: "none",
                cursor: "pointer",
              }}
              title="Share to LinkedIn"
            >
              <Linkedin size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
