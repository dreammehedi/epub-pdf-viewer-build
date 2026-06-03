import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

export default function AudioReader({
  url,
  themeColor = "#10b981",
  webViewerBaseUrl,
  bookId,
  token,
  bookName,
  platform = "app",
  ...props
}) {
  const baseUrl = webViewerBaseUrl || "https://readersfm.com/read-app";
  const targetBookId = encodeURIComponent(bookId || "unknown");

  const targetUrl = url || props.tracks?.[0]?.url || "";
  const resolvedBookName = bookName || props.tracks?.[0]?.title || "";

  let queryParams = `?platform=${platform}&token=${encodeURIComponent(token || "")}&type=audio&url=${encodeURIComponent(targetUrl)}&theme=${encodeURIComponent(themeColor)}`;
  if (resolvedBookName) {
    queryParams += `&book_name=${encodeURIComponent(resolvedBookName)}`;
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
