
#include <QtGui>
#include <QtWebKit>

#include "browser.h"
#include "joshfire.h"


Browser::Browser(const QUrl& url)
{
    QNetworkProxyFactory::setUseSystemConfiguration(true);

    webview = new QWebView(this);

    QPainter::RenderHints renderFlags = QPainter::NonCosmeticDefaultPen | QPainter::Antialiasing | QPainter::HighQualityAntialiasing | QPainter::SmoothPixmapTransform;
    webview->setRenderHints(renderFlags);

    webview->settings()->setAttribute(QWebSettings::JavascriptEnabled, true);
    webview->settings()->setAttribute(QWebSettings::LocalContentCanAccessRemoteUrls, true);

    webview->load(url);


    // Init JS bridge
    bridge = new Bridge(this);
    webview->page()->mainFrame()->addToJavaScriptWindowObject("QTBridge", bridge);


    if (Joshfire::appTitle != NULL)
      setWindowTitle(Joshfire::appTitle);
    else
      connect(webview, SIGNAL(loadFinished(bool)), SLOT(loaded(bool)));


    // Menu
    QMenu *menuHelp = menuBar()->addMenu(tr("&Help"));
    menuHelp->addAction(tr("Update"), this, SLOT(voidSlot()));
    menuHelp->addAction(tr("About"), this, SLOT(voidSlot()));

    setCentralWidget(webview);
    setUnifiedTitleAndToolBarOnMac(true);
}

void    Browser::loaded(bool status)
{
  (void)status;
  setWindowTitle(webview->title());
}
