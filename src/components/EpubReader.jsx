import { useEffect, useState } from "react";
import EpubViewer from "../lib/react-epub";
import "../lib/react-epub/dist/style.css";
import ShareBox from "./ShareBox";
import "./viewer.css";

export default function EpubReader({
  url,
  highlights = [],
  onNewHighlight,
  onUpdateHighlight,
  onDeleteHighlight,
  chapters = [],
  onChapterSelect,
  activeChapter,
  bookName = "",
  chapterName = "",
  onBackClick,
  themeColor = "#10b981", // Theme color for consistent library API
  viewerWidth = "100%",
  viewerHeight = "100vh",
  headerStyle = {},
  headerBackgroundColor,
  onShareQuote, // Destructure onShareQuote
  toast,
  brandText,
  bookId,
  token,
  showBackButton = true,
  showFullscreen = true,
}) {
  const [shareQuotePos, setShareQuotePos] = useState({ left: 0, top: 0 });
  const [openShareBox, setOpenShareBox] = useState(false);
  const [selectedText, setSelectedText] = useState(null);

  const notify = {
    info: (msg) => {
      if (toast?.info) toast.info(msg);
      else if (toast?.success) toast.success(msg);
      else if (typeof toast === "function") toast(msg);
      else if (toast && typeof toast.error === "function") toast.error(msg);
      else alert(msg);
    },
    success: (msg) => {
      if (toast?.success) toast.success(msg);
      else if (typeof toast === "function") toast(msg);
      else alert(msg);
    },
    error: (msg) => {
      if (toast?.error) toast.error(msg);
      else if (typeof toast === "function") toast(msg);
      else alert(msg);
    },
  };

  const handleShareQuote = (text) => {
    setSelectedText(text);
    const isApp = typeof window !== "undefined" && window.ReactNativeWebView;
    if (!isApp) {
      setOpenShareBox(true);
    }
    if (onShareQuote) onShareQuote(text);
    if (isApp) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: "onShareQuote",
        payload: text
      }));
    }
  };

  const capitalizeText = (str) => {
    if (!str) return "";
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const headerText = `${capitalizeText(bookName)}${chapterName ? ` - ${capitalizeText(chapterName)}` : ""}`;

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

  // Only disable copying - selection is visible but copies are blocked
  useEffect(() => {
    const applyIframeFixes = () => {
      const iframes = document.querySelectorAll("iframe");
      iframes.forEach((iframe) => {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!doc) return;

        if (doc.__scrollFixed) return;
        doc.__scrollFixed = true;

        if (doc.readyState !== "complete") {
          iframe.removeEventListener("load", applyIframeFixes);
          iframe.addEventListener("load", applyIframeFixes, { once: true });
          return;
        }

        // 🎨 Inject beautiful styling directly inside the EPUB iframe to stylize add note/highlight popup!
        const style = doc.createElement("style");
        style.innerHTML = `
          /* Force responsive layout inside the EPUB iframe */
          html, body {
            max-width: 100% !important;
            width: 100% !important;
            overflow-x: hidden !important;
            box-sizing: border-box !important;
            margin: 0 !important;
            padding: 16px 20px !important;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
          }
          
          /* Prevent child elements from overflowing */
          body * {
            max-width: 100% !important;
            box-sizing: border-box !important;
          }
          
          /* Ensure text content wraps properly */
          p, span, div, h1, h2, h3, h4, h5, h6, li, a, section, article {
            word-wrap: break-word !important;
            overflow-wrap: break-word !important;
            white-space: normal !important;
            max-width: 100% !important;
          }
          
          /* Make media and tables responsive */
          img, svg, video, audio, table, pre, code, iframe {
            max-width: 100% !important;
            height: auto !important;
            box-sizing: border-box !important;
          }

          /* Tip/Note Card styles inside the iframe */
          .PtPopup__tip, .react-epub-popup, .Highlight__popup, .Tip__card, .popup, .r_epub_popup_wrapper .popup {
            background: rgba(255, 255, 255, 0.95) !important;
            backdrop-filter: blur(16px) !important;
            -webkit-backdrop-filter: blur(16px) !important;
            border: 1px solid rgba(0, 0, 0, 0.08) !important;
            border-radius: 16px !important;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1) !important;
            padding: 16px !important;
            font-family: system-ui, sans-serif !important;
            width: 300px !important;
            box-sizing: border-box !important;
          }
          
          /* Premium scale-up transition on hover matching PDF highlights */
          .epubjs-hl {
            transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s ease !important;
            display: inline-block !important;
            cursor: pointer !important;
          }
          .epubjs-hl:hover {
            transform: scale(1.05) !important;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25) !important;
          }
          
          /* Styled Textarea inside note card inside iframe */
          .PtPopup__tip textarea, .react-epub-popup textarea, .Highlight__popup textarea, .Tip__card textarea, .popup textarea {
            width: 100% !important;
            border-radius: 10px !important;
            border: 1px solid rgba(0,0,0,0.1) !important;
            padding: 8px !important;
            font-size: 0.85rem !important;
            background: rgba(255,255,255,0.7) !important;
            outline: none !important;
            resize: none !important;
            color: #0f172a !important;
            transition: all 0.2s ease !important;
            margin-bottom: 8px !important;
            box-sizing: border-box !important;
          }
          
          .PtPopup__tip textarea:focus, .react-epub-popup textarea:focus, .Highlight__popup textarea:focus, .Tip__card textarea:focus, .popup textarea:focus {
            border-color: #10b981 !important;
            background: #ffffff !important;
            box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15) !important;
          }
          
          /* Styled submit and buttons inside note card inside iframe */
          .PtPopup__tip input[type="submit"], .react-epub-popup button, .Highlight__popup button, .Tip__card button, .note_popup button, .popup .note_popup button {
            background-color: #0f172a !important;
            color: #ffffff !important;
            border-radius: 8px !important;
            padding: 8px 16px !important;
            font-weight: 700 !important;
            font-size: 0.8rem !important;
            border: none !important;
            cursor: pointer !important;
            transition: all 0.2s ease !important;
          }
          
          .PtPopup__tip input[type="submit"]:hover, .react-epub-popup button:hover, .Highlight__popup button:hover, .Tip__card button:hover, .note_popup button:hover, .popup .note_popup button:hover {
            background-color: #10b981 !important; /* Emerald green hover */
          }
        `;
        doc.head.appendChild(style);

        const block = (e) => {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          return false;
        };

        const handleCopyCut = (e) => {
          const selection =
            iframe.contentWindow?.getSelection() || doc.getSelection();
          const text = selection?.toString() || "";

          console.log(
            `[ReadersFM Copy Action] Intercepted! Length: ${text.length} characters.`,
          );

          if (text.length > 500) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            // Instantly clear clipboard
            if (e.clipboardData) {
              e.clipboardData.setData("text/plain", "");
            }
            if (navigator.clipboard?.writeText) {
              navigator.clipboard.writeText("");
            }
            notify.info("Cannot copy more than 500 characters.");
            return false;
          }
        };

        doc.addEventListener("copy", handleCopyCut, true);
        doc.addEventListener("cut", handleCopyCut, true);
        doc.addEventListener("contextmenu", block, true);
        doc.addEventListener("dragstart", block, true);

        // Disable keyboard shortcuts for large copies
        doc.addEventListener(
          "keydown",
          (e) => {
            const isCopyKey =
              (e.ctrlKey || e.metaKey) &&
              ["c", "x"].includes(e.key.toLowerCase());
            if (isCopyKey) {
              const selection =
                iframe.contentWindow?.getSelection() || doc.getSelection();
              const textLength = selection?.toString()?.length || 0;

              if (textLength > 500) {
                // Enforce 500 characters limit
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                if (navigator.clipboard?.writeText) {
                  navigator.clipboard.writeText("");
                }
                notify.info("Cannot copy more than 500 characters.");
              }
            }

            // Always block Ctrl+A to avoid easily selecting everything
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") {
              e.preventDefault();
              e.stopPropagation();
              e.stopImmediatePropagation();
              notify.info("Select text manually (max 500 characters).");
            }
          },
          true,
        );

        // 🔗 Dynamic Share Quote Trigger interceptor inside the EPUB Iframe
        const handleIframeClick = (e) => {
          // Look for any highlight buttons, especially share quote
          const target = e.target;
          const shareBtn =
            target.closest(".react-epub-share-btn") ||
            target.closest(".share-btn") ||
            (target.tagName === "BUTTON" &&
              target.innerText.toLowerCase().includes("share"));

          if (shareBtn) {
            const selection =
              iframe.contentWindow?.getSelection() || doc.getSelection();
            const text = selection?.toString() || "";
            if (text && onShareQuote) {
              e.preventDefault();
              e.stopPropagation();
              onShareQuote(text);
            }
          }
        };

        doc.removeEventListener("click", handleIframeClick, true);
        doc.addEventListener("click", handleIframeClick, true);

        // Forward mouse wheel scrolling to parent scrollable container with optimized multiplier and native physics
        const handleWheel = (e) => {
          const epubContainer = document.querySelector(".epub-container");
          const epubViewer = document.querySelector(".r_epub_viewer");
          const rootWrapper = document.querySelector(".r_epub_root_wrapper");

          // Normalize scroll delta based on deltaMode (lines/pixels/pages)
          let scrollAmount = e.deltaY;
          if (e.deltaMode === 1) {
            scrollAmount = e.deltaY * 40; // Normalize line scrolling
          } else if (e.deltaMode === 2) {
            scrollAmount = e.deltaY * 800; // Normalize page scrolling
          }

          // Amplify scroll for maximum responsiveness and native performance
          const scrollDelta = scrollAmount * 1.5;

          if (
            epubContainer &&
            epubContainer.scrollHeight > epubContainer.clientHeight
          ) {
            epubContainer.scrollTop += scrollDelta;
          } else if (
            epubViewer &&
            epubViewer.scrollHeight > epubViewer.clientHeight
          ) {
            epubViewer.scrollTop += scrollDelta;
          } else if (
            rootWrapper &&
            rootWrapper.scrollHeight > rootWrapper.clientHeight
          ) {
            rootWrapper.scrollTop += scrollDelta;
          } else {
            window.scrollBy(0, scrollDelta);
          }
        };

        doc.removeEventListener("wheel", handleWheel);
        doc.addEventListener("wheel", handleWheel, { passive: true });
      });
    };

    // Global copy block inside the parent window too
    const handleGlobalCopy = (e) => {
      // Reverted parent level protection logs to keep popup active
    };

    document.addEventListener("copy", handleGlobalCopy, true);

    const observer = new MutationObserver(() => {
      applyIframeFixes();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    applyIframeFixes();
    const interval = setInterval(applyIframeFixes, 1000);

    return () => {
      observer.disconnect();
      document.removeEventListener("copy", handleGlobalCopy, true);
      clearInterval(interval);
    };
  }, [url]);

  const formattedHighlights = highlights.map((h) => ({
    cfi: h.cfi,
    noteTxt: h.noteTxt || "",
    text: h.text || h.txt || "",
    txt: h.txt || h.text || "",
  }));

  const customHeaderStyles = headerStyle
    ? Object.entries(headerStyle)
        .map(
          ([k, v]) =>
            `${k.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${v} !important;`,
        )
        .join(" ")
    : "";
  const headerBgStyle = headerBackgroundColor
    ? `background-color: ${headerBackgroundColor} !important;`
    : "";

  return (
    <div
      style={{
        width: viewerWidth,
        height: viewerHeight,
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
      className="bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors duration-200"
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            /* Reset Next.js parent header margin for full screen mobile reader */
            .main-content {
              margin-top: 0 !important;
            }
            /* Constrain epubjs iframe width to 100% */
            .r_epub_root_wrapper iframe {
              max-width: 100% !important;
              width: 100% !important;
              box-sizing: border-box !important;
            }
            .r_epub_popup_wrapper .popup .note_popup {
              align-items: flex-start !important;
            }
            .r_epub_popup_wrapper .popup .note_popup .btn_wrap {
              justify-content: flex-start !important;
              width: 100% !important;
            }
            ${!showBackButton ? `
            .r_epub_header_left .cpp {
              display: none !important;
            }
            ` : ""}
            ${!showFullscreen ? `
            .r_epub_header_right > div:nth-child(2) {
              display: none !important;
            }
            ` : ""}
            .r_epub_root_wrapper .r_epub_header_wrapper .r_epub_header_container .r_epub_header_right .r_epub_search_wrapper .search_container.active {
              border-color: ${themeColor} !important;
            }
            ${customHeaderStyles || headerBgStyle ? `
            .r_epub_root_wrapper .r_epub_header_wrapper {
              ${headerBgStyle}
              ${customHeaderStyles}
            }
            ` : ""}
          `,
        }}
      />
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          position: "relative",
        }}
      >
        <EpubViewer
          epubSrc={url}
          highlights={formattedHighlights}
          onDeleteHighlight={onDeleteHighlight}
          onNewHightlight={onNewHighlight}
          onUpdateHighlight={onUpdateHighlight}
          chapters={chapters}
          activeChapter={activeChapter}
          onChapterSelect={onChapterSelect}
          header={headerText}
          onBackClick={handleBackClick}
          onShareQuote={handleShareQuote} // Use hander to launch modal
        />
      </div>

      {!(typeof window !== "undefined" && window.ReactNativeWebView) && (
        <ShareBox
          openShareBox={openShareBox && selectedText}
          setOpenShareBox={setOpenShareBox}
          selectedText={selectedText}
          setSelectedText={setSelectedText}
          toast={toast}
          brandText={brandText}
        />
      )}
    </div>
  );
}
