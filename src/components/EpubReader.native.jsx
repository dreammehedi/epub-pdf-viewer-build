import React from "react";
import { StyleSheet, View, Platform } from "react-native";
import { WebView } from "react-native-webview";

export default function EpubReader({
  url,
  themeColor = "#10b981",
  webViewerBaseUrl,
  bookId,
  token,
  chapterId,
  chapterName,
  platform = "app",
  ...props
}) {
  const targetUrl = url || "/Alices-Adventures-in-Wonderland.epub";
  const baseUrl = webViewerBaseUrl || "https://readersfm.com/read-app";
  const targetBookId = encodeURIComponent(bookId || "unknown");

  let queryParams = `?platform=${platform}&token=${encodeURIComponent(token || "")}&type=epub&url=${encodeURIComponent(targetUrl)}&theme=${encodeURIComponent(themeColor)}`;
  
  if (chapterId) {
    queryParams += `&chapter_id=${chapterId}`;
  }
  if (chapterName) {
    queryParams += `&chapter_name=${encodeURIComponent(chapterName)}`;
  }
  
  const finalUri = `${baseUrl}/${targetBookId}${queryParams}`;

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: finalUri }}
        style={styles.webview}
        domStorageEnabled={true}
        javaScriptEnabled={true}
        allowFileAccess={true}
        originWhitelist={["*"]}
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === "onShareQuote" && props.onShareQuote) {
              props.onShareQuote(data.payload);
            } else if (data.type === "onNewHighlight" && props.onNewHighlight) {
              props.onNewHighlight(data.payload, data.updatedList);
            } else if (data.type === "onDeleteHighlight" && props.onDeleteHighlight) {
              props.onDeleteHighlight(data.payload, data.updatedList);
            } else if (data.type === "onUpdateHighlight" && props.onUpdateHighlight) {
              props.onUpdateHighlight(data.payload, data.newComment, data.updatedList);
            }
          } catch (e) {
            console.warn("⚠️ [EpubReader WebView Bridge] Failed to parse message:", e);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  webview: {
    flex: 1,
  },
});
