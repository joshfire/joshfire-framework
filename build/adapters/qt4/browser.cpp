
#include <QtGui>
#include <QtWebKit>

#include "browser.h"
#include "joshfire.h"

Browser::Browser(const QUrl& url, bool showInspector)
  : inspectorDialog(0)
{
    QNetworkProxyFactory::setUseSystemConfiguration(true);

    webview = new QWebView(this);

    QPainter::RenderHints renderFlags = QPainter::NonCosmeticDefaultPen | QPainter::Antialiasing | QPainter::HighQualityAntialiasing | QPainter::SmoothPixmapTransform;
    webview->setRenderHints(renderFlags);

    webview->settings()->setAttribute(QWebSettings::JavascriptEnabled, true);
    webview->settings()->setAttribute(QWebSettings::LocalContentCanAccessRemoteUrls, true);

    this->_restoreCookies();

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

void  Browser::storeCookies(QUrl url)
{
  QSettings settings("Joshfire", Joshfire::appTitle);
  QNetworkCookieJar* cookieJar = this->getNetworkCookieJar();

  if (url.isEmpty())
    url = webview->url();

  if (cookieJar)
  {
    /** TODO:
      *  This call returns nothing, we need to understand why and to fix it.
      *  Another solution would be to re-implement QNetworkCookieJar
      *    (see here http://stackoverflow.com/questions/5406436/qt-webkit-and-permanent-cookies)
      */
    QList<QNetworkCookie> cookies = cookieJar->cookiesForUrl(url);
    QList<QVariant> rawCookies;

    foreach(QNetworkCookie cookie, cookies)
    {
      if (cookie.isSessionCookie())
      {
        rawCookies.append(cookie.toRawForm(QNetworkCookie::Full));
      }
    }

    // Future upgrade: allow to save cookies for multiple urls
    settings.setValue("joshfire_cookies_url", url);
    settings.setValue("joshfire_cookies_raw", rawCookies);
  }
}

void Browser::_restoreCookies()
{
  QSettings settings("Joshfire", Joshfire::appTitle);
  QNetworkCookieJar* cookieJar = this->getNetworkCookieJar();

  if (cookieJar)
  {
    QVariant qvarCookiesRaw = settings.value("joshfire_cookies_raw");
    QVariant qvarCookiesUrl = settings.value("joshfire_cookies_url");

    if ((qvarCookiesUrl.isValid()) && (qvarCookiesRaw.isValid()))
    {
      QList<QVariant> rawCookies = qvarCookiesRaw.value< QList<QVariant> >();
      QUrl urlCookies = qvarCookiesUrl.value< QUrl >();

      QList<QNetworkCookie> cookiesList;

      foreach (QVariant rawCookie, rawCookies)
      {
        cookiesList.append(QNetworkCookie::parseCookies(rawCookie.toByteArray()));
      }

      cookieJar->setCookiesFromUrl(cookiesList, urlCookies);
    }
  }
}
