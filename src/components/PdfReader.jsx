import {
  ArrowLeft,
  Columns2,
  Maximize2,
  Menu,
  MoveHorizontal,
  MoveVertical,
  Smartphone,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { PdfAnnotator } from "../lib/react-pdf-highlighter";
import ShareBox from "./ShareBox";
import "./viewer.css";

// Dark Mode Detection Hook
function useDarkMode() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkDark = () => {
      const isDarkClass =
        document.documentElement.classList.contains("dark") ||
        document.body.classList.contains("dark");
      setIsDark(isDarkClass);
    };

    checkDark();

    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return isDark;
}

// Reusable Custom Dropdown
function CustomDropdown({
  trigger,
  children,
  align = "left",
  isDark,
  headerBg,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="custom-dropdown-container" ref={dropdownRef}>
      <button
        type="button"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "8px",
          borderRadius: "6px",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          color: isDark ? "#f3f4f6" : "#1f2937",
        }}
        className="custom-dropdown-trigger-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        {trigger}
      </button>
      {isOpen && (
        <div
          className="custom-dropdown-menu"
          style={{
            right: align === "right" ? 0 : "auto",
            left: align === "left" ? 0 : "auto",
            backgroundColor: headerBg || (isDark ? "#1e1e1e" : "#ffffff"),
            border: isDark ? "1px solid #374151" : "1px solid #e5e7eb",
            boxShadow: "0 10px 15px -3px rgba(0,0,0,0.3)",
            position: "absolute",
            top: "100%",
            zIndex: 1000,
            minWidth: "200px",
            padding: "8px 0",
            borderRadius: "8px",
            maxHeight: "300px",
            overflowY: "auto",
          }}
        >
          {children(setIsOpen)}
        </div>
      )}
    </div>
  );
}

function ChapterDropdown({
  chapters,
  activeChapter,
  onChapterSelect,
  isDark,
  themeColor,
  headerBg,
}) {
  return (
    <CustomDropdown
      isDark={isDark}
      headerBg={headerBg}
      trigger={
        <Menu
          className="h-5 w-5"
          style={{ color: isDark ? "#ffffff" : "#000000" }}
        />
      }
    >
      {(setIsOpen) => (
        <>
          <div
            style={{
              padding: "8px 16px",
              fontWeight: "bold",
              color: isDark ? "#9ca3af" : "#4b5563",
              fontSize: "0.85em",
              textTransform: "uppercase",
            }}
          >
            Chapters
          </div>
          <div
            style={{
              height: "1px",
              margin: "6px 0",
              backgroundColor: isDark ? "#374151" : "#e5e7eb",
            }}
          />
          {chapters?.map((chapter) => (
            <button
              key={chapter.id}
              onClick={() => {
                onChapterSelect(chapter);
                setIsOpen(false);
              }}
              style={{
                display: "block",
                width: "100%",
                padding: "10px 16px",
                textAlign: "left",
                background: chapter.id == activeChapter ? themeColor : "none",
                border: "none",
                color:
                  chapter.id == activeChapter
                    ? "#ffffff"
                    : isDark
                      ? "#e5e7eb"
                      : "#1f2937",
                cursor: "pointer",
                fontSize: "0.95rem",
              }}
              className="custom-dropdown-btn-item"
            >
              {chapter.name}
            </button>
          ))}
        </>
      )}
    </CustomDropdown>
  );
}

function SettingsPanel({
  settingState,
  bookId,
  chapterId,
  isChapter,
  chapters,
  onBackClick,
  onChapterSelect,
  isDark,
  themeColor,
  headerBackgroundColor,
  // Custom Control Props
  showZoom = true,
  showLayoutControls = true,
  showFullscreen = true,
  showBackButton = true,
  // Custom Icon Props
  zoomInIcon,
  zoomOutIcon,
  singlePageIcon,
  dualPageIcon,
  verticalScrollIcon,
  horizontalScrollIcon,
  fullscreenIcon,
}) {
  const [setting, setSetting] = settingState;

  const handlePageMode = (pageMode) => {
    const pageModeNum = getPageMode(pageMode);
    if (window?.PdfViewer?.viewer) {
      window.PdfViewer.viewer.spreadMode = pageModeNum;
      setSetting((s) => ({ ...s, pageMode }));
    }
  };

  const handleScrollMode = (scrollMode) => {
    const scrollModeNum = getScrollMode(scrollMode);
    if (window?.PdfViewer?.viewer) {
      window.PdfViewer.viewer.scrollMode = scrollModeNum;
      setSetting((s) => ({ ...s, scrollMode }));
    }
  };

  const increaseZoom = () => {
    let currentScale = window?.PdfViewer.viewer?.currentScale || 1.25;
    setSetting((s) => ({
      ...s,
      zoom:
        typeof s.zoom === "string"
          ? currentScale + 0.25
          : Math.min(s.zoom + 0.25, 6),
    }));
  };

  const decreaseZoom = () => {
    let currentScale = window?.PdfViewer.viewer?.currentScale || 1.25;
    setSetting((s) => ({
      ...s,
      zoom:
        typeof s.zoom === "string"
          ? currentScale - 0.25
          : Math.max(s.zoom - 0.25, 0.25),
    }));
  };

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        window.history.back();
      }
    }
  };

  const buttonStyle = (isActive) => ({
    border: "none",
    borderRadius: "4px",
    padding: "6px",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: isActive ? themeColor : "transparent",
    color: isActive ? "#ffffff" : isDark ? "#e5e7eb" : "#374151",
    transition: "all 0.2s",
  });

  const iconColor = isDark ? "#ffffff" : "#111827";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        justifyContent: "center",
        width: "100%",
        gap: "16px",
        color: isDark ? "#ffffff" : "#111827",
      }}
    >
      <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
        {showBackButton && (
          <div
            style={{
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
            }}
            onClick={handleBackClick}
          >
            <ArrowLeft style={{ color: iconColor }} />
          </div>
        )}
        {isChapter && (
          <ChapterDropdown
            chapters={chapters}
            activeChapter={chapterId}
            onChapterSelect={onChapterSelect}
            isDark={isDark}
            themeColor={themeColor}
            headerBg={headerBackgroundColor}
          />
        )}
      </div>

      {/* Zoom Controls */}
      {showZoom && (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={decreaseZoom}
            disabled={setting.zoom <= 0.25}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            {zoomOutIcon || (
              <ZoomOut className="h-5 w-5" style={{ color: iconColor }} />
            )}
          </button>
          <button
            onClick={increaseZoom}
            disabled={setting.zoom >= 6}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            {zoomInIcon || (
              <ZoomIn className="h-5 w-5" style={{ color: iconColor }} />
            )}
          </button>
        </div>
      )}

      {/* Layout Controls */}
      {showLayoutControls && (
        <>
          {/* Page Mode Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              onClick={() => handlePageMode("single")}
              style={buttonStyle(setting.pageMode === "single")}
            >
              {singlePageIcon || (
                <Smartphone
                  className="h-5 w-5"
                  style={{
                    color:
                      setting.pageMode === "single" ? "#ffffff" : iconColor,
                  }}
                />
              )}
            </button>
            <button
              onClick={() => handlePageMode("dual")}
              style={buttonStyle(setting.pageMode === "dual")}
            >
              {dualPageIcon || (
                <Columns2
                  className="h-5 w-5"
                  style={{
                    color: setting.pageMode === "dual" ? "#ffffff" : iconColor,
                  }}
                />
              )}
            </button>
          </div>

          {/* Scroll Mode Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              onClick={() => handleScrollMode("vertical")}
              style={buttonStyle(setting.scrollMode === "vertical")}
            >
              {verticalScrollIcon || (
                <MoveVertical
                  className="h-5 w-5"
                  style={{
                    color:
                      setting.scrollMode === "vertical" ? "#ffffff" : iconColor,
                  }}
                />
              )}
            </button>
            <button
              onClick={() => handleScrollMode("horizontal")}
              style={buttonStyle(setting.scrollMode === "horizontal")}
            >
              {horizontalScrollIcon || (
                <MoveHorizontal
                  className="h-5 w-5"
                  style={{
                    color:
                      setting.scrollMode === "horizontal"
                        ? "#ffffff"
                        : iconColor,
                  }}
                />
              )}
            </button>
          </div>
        </>
      )}

      {showFullscreen && (
        <button
          onClick={() =>
            document.fullscreenElement
              ? document.exitFullscreen()
              : document.documentElement.requestFullscreen()
          }
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          {fullscreenIcon || (
            <Maximize2 className="h-5 w-5" style={{ color: iconColor }} />
          )}
        </button>
      )}
    </div>
  );
}

const getPageMode = (key) => {
  switch (key) {
    case "single":
      return 0;
    case "dual":
      return 1;
    default:
      return 0;
  }
};

const getScrollMode = (key) => {
  switch (key) {
    case "vertical":
      return 0;
    case "horizontal":
      return 1;
    default:
      return 0;
  }
};

export default function PdfReader({
  refetch,
  initialUrl,
  highlights = [],
  setHighlights,
  bookId,
  chapterId,
  bookName = "",
  chapters = [],
  chapterName = "",
  onBackClick,
  onHighlightsChange,
  toast,
  token,
  platform,

  // Custom Control & Callback Props
  showZoom = true,
  showLayoutControls = true,
  showFullscreen = true,
  showBackButton = true,
  zoomInIcon,
  zoomOutIcon,
  singlePageIcon,
  dualPageIcon,
  verticalScrollIcon,
  horizontalScrollIcon,
  fullscreenIcon,

  onNewHighlight,
  onDeleteHighlight,
  onUpdateHighlight,
  onShareQuote,
  brandText,

  // Dynamic Theme Customization Colors & Sizes
  themeColor = "#10b981",
  viewerBackgroundColor,
  headerBackgroundColor,
  viewerWidth = "100%",
  viewerHeight = "100vh",
  headerStyle = {}, // Custom style object passed to the top header wrapper
}) {
  const [shareQuotePos, setShareQuotePos] = useState({ left: 0, top: 0 });
  const [openShareBox, setOpenShareBox] = useState(false);
  const [selectedText, setSelectedText] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [setting, setSetting] = useState({
    scrollMode: "vertical",
    pageMode: "single",
    zoom: "auto",
  });

  const isDark = useDarkMode();

  const notify = {
    info: (msg) => (toast?.info ? toast.info(msg) : console.log("Info:", msg)),
    success: (msg) =>
      toast?.success ? toast.success(msg) : console.log("Success:", msg),
    error: (msg) =>
      toast?.error ? toast.error(msg) : console.error("Error:", msg),
  };

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        window.history.back();
      }
    }
  };

  const handleNewHighlight = (highlight) => {
    const text = highlight?.content?.text || "";
    if (text.length > 1000) {
      notify.info("Cannot highlight more than 1000 characters.");
      return;
    }

    const newH = [...highlights, highlight];
    if (setHighlights) setHighlights(newH);
    if (onHighlightsChange) onHighlightsChange(newH);
    if (onNewHighlight) onNewHighlight(highlight, newH);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      const selection = window.getSelection();
      const textLength = selection?.toString()?.length || 0;

      // Block Ctrl+A
      if ((e.ctrlKey || e.metaKey) && e.key === "a") {
        e.preventDefault();
        notify.info("Select text manually (max 500 characters).");
      }

      // Block Ctrl+C if selection > 500
      if ((e.ctrlKey || e.metaKey) && e.key === "c" && textLength > 500) {
        e.preventDefault();
        notify.info("Cannot copy more than 500 characters.");
      }
    };

    const handleCopy = (e) => {
      const copiedText = window.getSelection()?.toString() || "";

      if (copiedText.length <= 500) {
        // Block raw copy
        e.preventDefault();

        // Generate random replacement text
        const randomText = Math.random().toString(36).substring(2, 12);
        e.clipboardData.setData("text/plain", randomText);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("copy", handleCopy);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("copy", handleCopy);
    };
  }, []);

  const deleteHighlight = (id) => {
    const filter = highlights.filter((v) => v.id !== id);
    if (setHighlights) setHighlights(filter);
    if (onHighlightsChange) onHighlightsChange(filter);
    if (onDeleteHighlight) onDeleteHighlight(id, filter);
  };

  const updateHighlight = (highlightId, comment) => {
    const newHighlights = highlights.map((v) => {
      if (v.id === highlightId) {
        v.comment = comment;
      }
      return v;
    });

    if (setHighlights) setHighlights(newHighlights);
    if (onHighlightsChange) onHighlightsChange(newHighlights);
    if (onUpdateHighlight)
      onUpdateHighlight(highlightId, comment, newHighlights);
  };

  const handleChapterSelect = useCallback(
    (chapter) => {
      if (chapter.id !== chapterId && refetch) {
        refetch(chapter.id);
      }
    },
    [chapterId, refetch],
  );

  const isChapter = chapters && chapters.length > 0;

  // Compute container background style dynamically
  const containerStyle = {
    width: "100%",
    height: "100%",
    margin: "0 auto",
    transition: "all 0.2s",
    backgroundColor: viewerBackgroundColor || (isDark ? "#090502" : "#f5f5f4"),
    paddingTop: 0,
    display: "flex",
    justifyContent: "center",
    position: "relative",
  };

  return (
    <div
      className="view-audio-book-container"
      style={{
        width: viewerWidth,
        height: viewerHeight,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          position: "relative",
          zIndex: 99999,
          borderBottom: isDark ? "1px solid #374151" : "1px solid #e5e7eb",
          backgroundColor:
            headerBackgroundColor || (isDark ? "#1c1917" : "#ffffff"),
          color: isDark ? "#ffffff" : "#111827",
          transition: "all 0.2s",
          ...headerStyle,
        }}
        className="v_header-wrapper"
      >
        <div
          style={{
            maxWidth: "1050px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "between",
            padding: "16px 16px 8px 16px",
            alignItems: "center",
          }}
        >
          <SettingsPanel
            isChapter={isChapter}
            chapters={chapters}
            bookId={bookId}
            chapterId={chapterId}
            settingState={[setting, setSetting]}
            onBackClick={handleBackClick}
            onChapterSelect={handleChapterSelect}
            isDark={isDark}
            themeColor={themeColor}
            headerBackgroundColor={headerBackgroundColor}
            // Custom Control Props Passed Down
            showZoom={showZoom}
            showLayoutControls={showLayoutControls}
            showFullscreen={showFullscreen}
            showBackButton={showBackButton}
            zoomInIcon={zoomInIcon}
            zoomOutIcon={zoomOutIcon}
            singlePageIcon={singlePageIcon}
            dualPageIcon={dualPageIcon}
            verticalScrollIcon={verticalScrollIcon}
            horizontalScrollIcon={horizontalScrollIcon}
            fullscreenIcon={fullscreenIcon}
          />
        </div>
        <div
          style={{
            maxWidth: "1050px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "center",
            padding: "0 16px 8px 16px",
          }}
        >
          <div
            style={{
              fontWeight: "bold",
              textAlign: "center",
              color: isDark ? "#e5e5eb" : "#374151",
            }}
          >
            {bookName && (
              <>
                {bookName}
                {isChapter && chapterName && ` - ${chapterName}`}
              </>
            )}
          </div>
        </div>
      </div>

      <div
        onContextMenu={(e) => e.preventDefault()}
        onCopy={(e) => e.preventDefault()}
        onCut={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        className=""
        style={containerStyle}
      >
        <PdfAnnotator
          onNewHightlight={handleNewHighlight}
          pdfSrc={initialUrl}
          highlights={highlights}
          onDeleteHighlight={deleteHighlight}
          onUpdateHighlight={updateHighlight}
          isDualPageArrow={setting.scrollMode === "horizontal"}
          pdfScaleValue={
            typeof setting.zoom === "string"
              ? setting.zoom
              : setting.zoom.toString()
          }
          onLoadSuccess={() => setIsLoading(false)}
          onLoadError={(err) => {
            setError(`Failed to load PDF: ${err.message || err}`);
            setIsLoading(false);
          }}
          onSourceError={(err) => {
            setError(`Failed to fetch PDF: ${err.message || err}`);
            setIsLoading(false);
          }}
          onShareQuote={(e) => {
            const isApp = typeof window !== "undefined" && window.ReactNativeWebView;
            if (!isApp) {
              setOpenShareBox(true);
            }
            setSelectedText(e);
            if (onShareQuote) onShareQuote(e);
            if (isApp) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: "onShareQuote",
                payload: e
              }));
            }
          }}
        />
      </div>

      {!(typeof window !== "undefined" && window.ReactNativeWebView) && (
        <ShareBox
          openShareBox={openShareBox && selectedText}
          setOpenShareBox={setOpenShareBox}
          shareQuotePos={shareQuotePos}
          setShareQuotePos={setShareQuotePos}
          selectedText={selectedText}
          setSelectedText={setSelectedText}
          toast={toast}
          brandText={brandText}
        />
      )}

      {error && (
        <div className="custom-modal-overlay">
          <div
            className="custom-modal-content"
            style={{
              backgroundColor: isDark ? "#1e1e1e" : "#ffffff",
              border: isDark ? "1px solid #374151" : "1px solid #e5e7eb",
            }}
          >
            <div
              className="custom-modal-title"
              style={{ color: isDark ? "#ffffff" : "#111827" }}
            >
              Error Loading Book
            </div>
            <div
              className="custom-modal-description"
              style={{ color: isDark ? "#d1d5db" : "#4b5563" }}
            >
              {error}
            </div>
            <div className="custom-modal-footer">
              <button
                type="button"
                className="custom-modal-btn bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => setError(null)}
                style={{ backgroundColor: themeColor }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
