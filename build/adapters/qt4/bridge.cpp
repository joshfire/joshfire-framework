
#include <QtGui>
#include <QtWebKit>

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

