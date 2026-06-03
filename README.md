# epub-pdf-viewer

A premium, secure, and highly customizable React library for rendering EPUB and PDF files. Built with strong copy protection, interactive highlights and note annotations, and a beautiful built-in gradient quote exporter (`ShareBox`).

---

## 🚀 Key Features

- **🛡️ Multi-layered Copy Protection**:
  - Blocks right-click context menu.
  - Blocks drag-and-drop text selections.
  - Blocks cut (`Ctrl+X` / `Cmd+X`) and copy shortcuts.
  - Forces a maximum selection length (e.g. 500 characters).
  - Spoofs clipboard contents (replaces copied text with randomized strings to prevent unauthorized copy-pasting).
- **✏️ Annotations & Highlights**:
  - Interactive text selections to highlight text or add custom notes.
  - Full callback sync handlers (`onNewHighlight`, `onUpdateHighlight`, `onDeleteHighlight`) to persist annotations in your database.
- **🎨 Premium ShareBox Exporter**:
  - Allows users to select text, select a premium gradient background, and export it as an optimized PNG card to share.
- **📐 Seamless Responsive Sizing**:
  - Full control over width (`viewerWidth`) and height (`viewerHeight`) with intelligent `min-height` flex container defaults to prevent clipped frames.
- **✨ Branding & Styling Customization**:
  - Adjust primary colors (`themeColor`), layout canvas (`viewerBackgroundColor`), and headers (`headerBackgroundColor`).
  - Pass custom CSS properties directly to the header via the `headerStyle` object (e.g., custom paddings, custom borders).

---

## 📦 Compatibility & Supported Versions

- **React**: `^18.2.0` or `^19.0.0`
- **Next.js**: Supports dynamic rendering (`{ ssr: false }`) under Next.js 13, 14, and 15.
- **Vite / Create React App**: Fully supported out-of-the-box.
- **Browsers**: Modern Chrome, Safari, Firefox, and Edge.

---

## 💿 Installation

Install the package via npm or yarn:

```bash
npm install epub-pdf-viewer
```

Or if you are linking locally or installing directly from a workspace:

```json
"dependencies": {
  "epub-pdf-viewer": "file:../epub-pdf-viewer"
}
```

Import the stylesheet globally in your entry point file (e.g., `app/layout.js` or `src/main.jsx`):

```javascript
import "epub-pdf-viewer/dist/style.css";
```

---

## 💻 Usage & Examples

### 1. Next.js Dynamic Import Safeguard (Recommended)

Since EPUB and PDF renderers rely on client-side APIs (`window`, `document`, and browser canvas), you should load them dynamically in Next.js to prevent Server-Side Rendering (SSR) pre-render crashes:

```javascript
"use client";

import dynamic from "next/dynamic";

const PdfReader = dynamic(
  () => import("epub-pdf-viewer").then((mod) => mod.PdfReader),
  { ssr: false },
);

const EpubReader = dynamic(
  () => import("epub-pdf-viewer").then((mod) => mod.EpubReader),
  { ssr: false },
);
```

---

### 2. PDF Reader (`PdfReader`) Example

```jsx
import React, { useState } from "react";
import { PdfReader } from "epub-pdf-viewer";

export default function BookViewer() {
  const [highlights, setHighlights] = useState([]);

  return (
    <div style={{ height: "100vh" }}>
      <PdfReader
        initialUrl="/assets/sample-book.pdf"
        highlights={highlights}
        setHighlights={setHighlights}
        bookId="pdf-book-101"
        bookName="Introduction to Web Design"
        // Sizing & Theme Props
        viewerWidth="100%"
        viewerHeight="100vh"
        themeColor="#10b981" // Primary green accent color
        viewerBackgroundColor="#121212" // PDF canvas wrapper background
        headerBackgroundColor="#1c1917" // Header bar background
        headerStyle={{
          padding: "24px 16px",
          borderBottom: "3px solid #10b981",
        }}
        // Controls visibility
        showZoom={true}
        showLayoutControls={true}
        showFullscreen={true}
        // Persistent Sync Callbacks
        onNewHighlight={(newHighlight, updatedList) => {
          console.log("New highlight created:", newHighlight);
        }}
        onDeleteHighlight={(highlightId, updatedList) => {
          console.log("Highlight deleted:", highlightId);
        }}
        onUpdateHighlight={(highlightId, newComment, updatedList) => {
          console.log("Note updated:", newComment);
        }}
        onShareQuote={(text) => {
          console.log("User clicked share quote:", text);
        }}
      />
    </div>
  );
}
```

#### ⚙️ `PdfReader` Props

| Prop                    | Type       | Default     | Description                                                        |
| :---------------------- | :--------- | :---------- | :----------------------------------------------------------------- |
| `initialUrl`            | `string`   | _Required_  | Path or URL to the target PDF document.                            |
| `bookId`                | `string`   | `""`        | Unique identifier for tracking annotations in databases.           |
| `bookName`              | `string`   | `""`        | Text displayed in the header title area.                           |
| `highlights`            | `array`    | `[]`        | List of existing highlight highlights/notes.                       |
| `setHighlights`         | `function` | `undefined` | Callback hook to update state.                                     |
| `viewerWidth`           | `string`   | `"100%"`    | Custom horizontal container width.                                 |
| `viewerHeight`          | `string`   | `"100vh"`   | Custom vertical height (uses `min-height` safety).                 |
| `themeColor`            | `string`   | `"#10b981"` | Primary hex color for active layouts and buttons.                  |
| `viewerBackgroundColor` | `string`   | `"#090502"` | Inner canvas background theme.                                     |
| `headerBackgroundColor` | `string`   | `"#1c1917"` | Custom header wrapper background.                                  |
| `headerStyle`           | `object`   | `{}`        | Inline CSS styling object passed directly to the top header.       |
| `showZoom`              | `boolean`  | `true`      | Toggle display of Zoom In / Zoom Out.                              |
| `showLayoutControls`    | `boolean`  | `true`      | Toggle Page Spread (Single/Dual) and Scroll (Vertical/Horizontal). |
| `showFullscreen`        | `boolean`  | `true`      | Toggle Fullscreen controls.                                        |
| `onNewHighlight`        | `function` | `undefined` | Triggers when a new text highlight is selected.                    |
| `onDeleteHighlight`     | `function` | `undefined` | Triggers when an annotation is deleted.                            |
| `onUpdateHighlight`     | `function` | `undefined` | Triggers when a note comment is updated.                           |
| `onShareQuote`          | `function` | `undefined` | Triggers when the user requests a social share.                    |

---

### 3. EPUB Reader (`EpubReader`) Example

```jsx
import React, { useState } from "react";
import { EpubReader } from "epub-pdf-viewer";

export default function EpubBookViewer() {
  const [epubHighlights, setEpubHighlights] = useState([]);

  return (
    <div style={{ height: "100vh" }}>
      <EpubReader
        url="/assets/sample-book.epub"
        highlights={epubHighlights}
        bookName="Moby Dick"
        // Sizing & Theme Customizations
        viewerWidth="100%"
        viewerHeight="100vh"
        themeColor="#2563eb"
        headerBackgroundColor="#f8fafc"
        headerStyle={{
          padding: "20px 16px",
        }}
        // Annotation callbacks
        onNewHighlight={(highlight) => {
          setEpubHighlights([...epubHighlights, highlight]);
        }}
        onDeleteHighlight={(cfi) => {
          setEpubHighlights(epubHighlights.filter((h) => h.cfi !== cfi));
        }}
        onUpdateHighlight={(cfi, newNote) => {
          setEpubHighlights(
            epubHighlights.map((h) =>
              h.cfi === cfi ? { ...h, noteTxt: newNote } : h,
            ),
          );
        }}
      />
    </div>
  );
}
```

#### ⚙️ `EpubReader` Props

| Prop                    | Type       | Default     | Description                                                             |
| :---------------------- | :--------- | :---------- | :---------------------------------------------------------------------- |
| `url`                   | `string`   | _Required_  | Path or URL to the target EPUB file.                                    |
| `bookName`              | `string`   | `""`        | The title of the book shown in the header.                              |
| `highlights`            | `array`    | `[]`        | Highlight data structure array containing `cfi`, `noteTxt`, and `text`. |
| `viewerWidth`           | `string`   | `"100%"`    | Responsive horizontal width.                                            |
| `viewerHeight`          | `string`   | `"100vh"`   | Responsive vertical container `min-height`.                             |
| `themeColor`            | `string`   | `"#10b981"` | hex primary color configuration.                                        |
| `headerBackgroundColor` | `string`   | `undefined` | Custom theme header background.                                         |
| `headerStyle`           | `object`   | `{}`        | Style object applied directly to the top EPUB header bar.               |
| `onNewHighlight`        | `function` | `undefined` | Sync callback triggered on selection of a new highlight block.          |
| `onDeleteHighlight`     | `function` | `undefined` | Triggered when a highlight is deleted.                                  |
| `onUpdateHighlight`     | `function` | `undefined` | Triggered when a note comment is modified.                              |

---

---

## 📱 Universal Multi-Platform Support (Web & React Native)

`epub-pdf-viewer` is designed from the ground up to support both **standard React DOM Web apps (e.g. Next.js, Vite)** and **React Native / Expo mobile apps (iOS & Android)** with 100% shared features, designs, and copy-protection rules. 

### How It Works Under the Hood

The package splits platform-specific implementation seamlessly:

1. **Web Environment (React DOM)**:
   - When loaded in a Web environment (Next.js, Vite, etc.), it executes pure, rich React DOM components (`PdfReader.jsx`, `EpubReader.jsx`, `AudioReader.jsx`).
   - Uses underlying DOM modules like canvas-rendering, selection ranges, and browser media controls.

2. **Native Mobile Environment (Expo / React Native)**:
   - When imported in an iOS or Android app, Metro bundler resolves targeted **`.native.jsx`** component overrides (`PdfReader.native.jsx`, `EpubReader.native.jsx`, `AudioReader.native.jsx`).
   - These components automatically spin up a secure, borderless, full-viewport WebView shell wrapping `react-native-webview`.
   - The shell connects dynamically to your hosted Web Viewer (e.g. Next.js on port `3000` or production URL) passing layout configurations (`type`, `url`, `themeColor`) as clean, encoded URL query parameters.
   - This keeps your application extremely lightweight (zero massive Native libraries like PDF.js or epub-engines loaded inside the JS thread) while delivering 100% feature consistency across platforms!

---

## ⚙️ Expo & Metro Configuration

If you are using `epub-pdf-viewer` inside an Expo / React Native project, you need to enable Metro to resolve symlinks and package exports. 

Configure your project's **`metro.config.js`** file as follows:

```javascript
const { getSentryExpoConfig } = require("@sentry/react-native/metro");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getSentryExpoConfig(__dirname);

// 1. Add the package directory to watch folders (if local / monorepo)
config.watchFolders = [
  path.resolve(__dirname, "../epub-pdf-viewer"),
];

// 2. Enable modern symlink & package exports resolution in Metro
config.resolver.unstable_enableSymlinks = true;
config.resolver.unstable_enablePackageExports = true;

// 3. Prioritize project root node_modules for shared peer dependencies
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, "node_modules"),
  path.resolve(__dirname, "../epub-pdf-viewer/node_modules"),
];

module.exports = withNativeWind(config, { input: "./app/global.css" });
```

---

## 🛠️ Build Pipeline (For Contributors)

To re-bundle and compile the package files using Vite and Rollup, run:

```bash
# Install package dependencies
npm install

# Rebuild ESM, UMD, and style bundles in dist/
npm run build
```

---

## 📄 License

This library is licensed under the **ISC License**.

Developed with ❤️ for **ReadersFM**.
