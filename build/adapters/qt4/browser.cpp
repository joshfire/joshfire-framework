
#include <QtGui>
#include <QtWebKit>

#include "browser.h"
#include "joshfire.h"
#include "cookiejar.h"

Browser::Browser(const QUrl& url, bool showInspector)
  : inspectorDialog(0)
{
    QNetworkProxyFactory::setUseSystemConfiguration(true);

    webview = new QWebView(this);

    webview->page()->networkAccessManager()->setCookieJar(new CookieJar(this));

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
    /*
    QMenu *menuHelp = menuBar()->addMenu(tr("&Help"));
    menuHelp->addAction(tr("Update"), this, SLOT(voidSlot()));
    menuHelp->addAction(tr("About"), this, SLOT(voidSlot()));
    */

    setCentralWidget(webview);
    setUnifiedTitleAndToolBarOnMac(true);

    if (showInspector)
    {
      webview->settings()->setAttribute(QWebSettings::DeveloperExtrasEnabled, true);

      this->inspectorDialog = new QDialog(this);
      QHBoxLayout* layout = new QHBoxLayout(this->inspectorDialog);
      QWebInspector* inspector = new QWebInspector(this->inspectorDialog);
      layout->addWidget(inspector);

      inspector->setPage(webview->page());

      this->inspectorDialog->show();
      this->inspectorDialog->raise();
      this->inspectorDialog->activateWindow();
    }
}

Browser::~Browser()
{
  delete this->inspectorDialog;
}

void    Browser::loaded(bool status)
{
  (void)status;
  setWindowTitle(webview->title());
}

QNetworkCookieJar* Browser::getNetworkCookieJar()
{
  QWebPage* page;
  QNetworkAccessManager* networkAccessManager;

  if (((page = webview->page()) != 0)
      && ((networkAccessManager = page->networkAccessManager()) != 0))
    return networkAccessManager->cookieJar();
  return 0;
}
