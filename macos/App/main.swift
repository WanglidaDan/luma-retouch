import AppKit
import WebKit

@MainActor
final class AppDelegate: NSObject, NSApplicationDelegate, WKNavigationDelegate, WKUIDelegate,
  WKDownloadDelegate
{
  private var window: NSWindow?
  private var webView: WKWebView?
  private var schemeHandler: BundleSchemeHandler?

  func applicationDidFinishLaunching(_ notification: Notification) {
    let resources = Bundle.main.resourceURL!.appendingPathComponent("web", isDirectory: true)
    let handler = BundleSchemeHandler(root: resources)
    let configuration = WKWebViewConfiguration()
    configuration.setURLSchemeHandler(handler, forURLScheme: "luma")

    let view = WKWebView(frame: .zero, configuration: configuration)
    view.navigationDelegate = self
    view.uiDelegate = self
    view.setValue(false, forKey: "drawsBackground")
    view.allowsBackForwardNavigationGestures = false
    view.load(URLRequest(url: URL(string: "luma://app/")!))
    webView = view
    schemeHandler = handler

    let window = NSWindow(
      contentRect: NSRect(x: 0, y: 0, width: 1440, height: 920),
      styleMask: [.titled, .closable, .miniaturizable, .resizable, .fullSizeContentView],
      backing: .buffered,
      defer: false
    )
    window.title = "Luma Retouch"
    window.titleVisibility = .hidden
    window.titlebarAppearsTransparent = true
    window.isMovableByWindowBackground = false
    window.minSize = NSSize(width: 940, height: 680)
    window.center()
    window.contentView = view
    window.makeKeyAndOrderFront(nil)
    self.window = window
    NSApp.activate(ignoringOtherApps: true)
    buildMenu()
  }

  func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
    true
  }

  func webView(
    _ webView: WKWebView,
    decidePolicyFor navigationAction: WKNavigationAction,
    decisionHandler: @escaping (WKNavigationActionPolicy) -> Void
  ) {
    if navigationAction.shouldPerformDownload {
      decisionHandler(.download)
      return
    }
    guard let url = navigationAction.request.url else {
      decisionHandler(.cancel)
      return
    }
    if url.scheme != "luma" && url.scheme != "about" {
      NSWorkspace.shared.open(url)
      decisionHandler(.cancel)
      return
    }
    decisionHandler(.allow)
  }

  func webView(
    _ webView: WKWebView,
    navigationAction: WKNavigationAction,
    didBecome download: WKDownload
  ) {
    download.delegate = self
  }

  func download(
    _ download: WKDownload,
    decideDestinationUsing response: URLResponse,
    suggestedFilename: String,
    completionHandler: @escaping (URL?) -> Void
  ) {
    let panel = NSSavePanel()
    panel.nameFieldStringValue = suggestedFilename
    panel.canCreateDirectories = true
    panel.isExtensionHidden = false
    panel.begin { response in
      completionHandler(response == .OK ? panel.url : nil)
    }
  }

  func downloadDidFinish(_ download: WKDownload) {}

  func download(_ download: WKDownload, didFailWithError error: any Error, resumeData: Data?) {
    showError("The export could not be saved. \(error.localizedDescription)")
  }

  func webView(
    _ webView: WKWebView,
    runOpenPanelWith parameters: WKOpenPanelParameters,
    initiatedByFrame frame: WKFrameInfo,
    completionHandler: @escaping ([URL]?) -> Void
  ) {
    let panel = NSOpenPanel()
    panel.canChooseFiles = true
    panel.canChooseDirectories = false
    panel.allowsMultipleSelection = parameters.allowsMultipleSelection
    panel.allowedContentTypes = [.image]
    panel.begin { response in
      completionHandler(response == .OK ? panel.urls : nil)
    }
  }

  private func buildMenu() {
    let mainMenu = NSMenu()
    let appMenuItem = NSMenuItem()
    let appMenu = NSMenu()
    appMenu.addItem(withTitle: "About Luma Retouch", action: #selector(NSApplication.orderFrontStandardAboutPanel(_:)), keyEquivalent: "")
    appMenu.addItem(.separator())
    appMenu.addItem(withTitle: "Quit Luma Retouch", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")
    appMenuItem.submenu = appMenu
    mainMenu.addItem(appMenuItem)

    let fileMenuItem = NSMenuItem()
    let fileMenu = NSMenu(title: "File")
    let openItem = NSMenuItem(title: "Import Photo…", action: #selector(openPhoto), keyEquivalent: "o")
    openItem.target = self
    fileMenu.addItem(openItem)
    fileMenuItem.submenu = fileMenu
    mainMenu.addItem(fileMenuItem)
    NSApp.mainMenu = mainMenu
  }

  @objc private func openPhoto() {
    webView?.evaluateJavaScript(
      "document.querySelector('[data-testid=\\\"open-file-input\\\"]')?.click()"
    )
  }

  private func showError(_ message: String) {
    let alert = NSAlert()
    alert.messageText = "Luma Retouch"
    alert.informativeText = message
    alert.alertStyle = .warning
    alert.addButton(withTitle: "OK")
    alert.beginSheetModal(for: window!)
  }
}

private final class BundleSchemeHandler: NSObject, WKURLSchemeHandler {
  private let root: URL

  init(root: URL) {
    self.root = root.standardizedFileURL
  }

  func webView(_ webView: WKWebView, start urlSchemeTask: WKURLSchemeTask) {
    guard let requestURL = urlSchemeTask.request.url else {
      urlSchemeTask.didFailWithError(URLError(.badURL))
      return
    }

    var relativePath = requestURL.path
    if relativePath == "/" || relativePath.isEmpty {
      relativePath = "/index.html"
    }
    if relativePath.hasPrefix("/luma-retouch/") {
      relativePath.removeFirst("/luma-retouch".count)
    }
    let fileURL = root.appendingPathComponent(relativePath.trimmingCharacters(in: CharacterSet(charactersIn: "/")))
      .standardizedFileURL
    guard fileURL.path.hasPrefix(root.path + "/") else {
      urlSchemeTask.didFailWithError(URLError(.noPermissionsToReadFile))
      return
    }

    do {
      let data = try Data(contentsOf: fileURL, options: .mappedIfSafe)
      let response = URLResponse(
        url: requestURL,
        mimeType: Self.mimeType(for: fileURL.pathExtension),
        expectedContentLength: data.count,
        textEncodingName: Self.isText(fileURL.pathExtension) ? "utf-8" : nil
      )
      urlSchemeTask.didReceive(response)
      urlSchemeTask.didReceive(data)
      urlSchemeTask.didFinish()
    } catch {
      urlSchemeTask.didFailWithError(error)
    }
  }

  func webView(_ webView: WKWebView, stop urlSchemeTask: WKURLSchemeTask) {}

  private static func isText(_ ext: String) -> Bool {
    ["html", "js", "css", "json", "webmanifest", "svg", "txt"].contains(ext.lowercased())
  }

  private static func mimeType(for ext: String) -> String {
    switch ext.lowercased() {
    case "html": "text/html"
    case "js", "mjs": "text/javascript"
    case "css": "text/css"
    case "json", "webmanifest": "application/json"
    case "svg": "image/svg+xml"
    case "png": "image/png"
    case "jpg", "jpeg": "image/jpeg"
    case "webp": "image/webp"
    case "avif": "image/avif"
    case "wasm": "application/wasm"
    case "woff": "font/woff"
    case "woff2": "font/woff2"
    case "ttf": "font/ttf"
    default: "application/octet-stream"
    }
  }
}

MainActor.assumeIsolated {
  let application = NSApplication.shared
  application.setActivationPolicy(.regular)
  let delegate = AppDelegate()
  application.delegate = delegate
  application.run()
}
