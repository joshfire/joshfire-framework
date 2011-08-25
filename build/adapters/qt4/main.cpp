
#include <QtGui>
#include <QWebSettings>

#include "joshfire.h"
#include "browser.h"

int main(int argc, char** argv)
{
    // Smooth rendering.
    QApplication::setGraphicsSystem("raster");

    QApplication app(argc, argv);

    QUrl url(Joshfire::appPath);

    Browser *browser = new Browser(url);
    browser->show();

    return (app.exec());
}
