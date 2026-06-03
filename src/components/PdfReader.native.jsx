import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

export default function PdfReader({
  initialUrl,
  url,
  themeColor = "#10b981",
  webViewerBaseUrl,
  // Custom props may include UI toggles and chapter list
  showBackButton = true,
  showFullscreen = true,
  chapters = [],
  bookId,
  token,
  chapterId,
  chapterName,
  platform = "app",
  ...props
}) {
  const targetUrl = initialUrl || url || "/file-sample_150kB.pdf";
  const baseUrl = webViewerBaseUrl || "https://readersfm.com/read-app";
  const targetBookId = encodeURIComponent(bookId || "unknown");

  const encodedChapters = encodeURIComponent(JSON.stringify(chapters));
  let queryParams = `?platform=${platform}&token=${encodeURIComponent(token || "")}&type=pdf&url=${encodeURIComponent(targetUrl)}&theme=${encodeURIComponent(themeColor)}&showBackButton=${showBackButton}&showFullscreen=${showFullscreen}&chapters=${encodedChapters}`;
  
  if (chapterId) {
    queryParams += `&chapter_id=${chapterId}`;
  }
  if (chapterName) {
    queryParams += `&chapter_name=${encodeURIComponent(chapterName)}`;
  }
  
  const finalUri = `${baseUrl}/${targetBookId}${queryParams}`;

  console.log("🔍 [PdfReader Native] targetUrl:", targetUrl);
  console.log("🔍 [PdfReader Native] resolved Web Viewer URI:", finalUri);

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
            console.warn("⚠️ [PdfReader WebView Bridge] Failed to parse message:", e);
          }
        }}
        onLoadStart={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.log(
            "🔄 [PdfReader Native WebView] Load Start:",
            nativeEvent.url,
          );
        }}
        onLoadEnd={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.log(
            "✅ [PdfReader Native WebView] Load End:",
            nativeEvent.url,
          );
        }}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn("❌ [PdfReader Native WebView] Error:", nativeEvent);
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn(
            "❌ [PdfReader Native WebView] HTTP Error:",
            nativeEvent.statusCode,
            nativeEvent.description,
          );
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
