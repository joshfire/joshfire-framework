
#include <QtGui>
#include <QtWebKit>
#include <QDesktopServices>

#include "bridge.h"
#include "browser.h"


Bridge::Bridge(Browser* b) : QObject(), browser(b)
{
}

void    Bridge::sizeFullScreen()
{
  browser->showFullScreen();
}

void    Bridge::sizeNormal()
{
  browser->showNormal();
}

void    Bridge::resize(int width, int height)
{
  browser->resize(width, height);
}


void    Bridge::openURL(QString const& url)
{
  QDesktopServices::openUrl(QUrl(url));
}
