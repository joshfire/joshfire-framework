
#include <QtGui>
#include <QWebSettings>

#include "joshfire.h"
#include "browser.h"

//! Start with -debug to show Web Inspector
int main(int argc, char** argv)
{
    // Smooth rendering.
    QApplication::setGraphicsSystem("raster");

    QApplication app(argc, argv);
    bool showInspector = QCoreApplication::arguments().contains(DEBUG_FLAG);

    QUrl url(Joshfire::appPath);

    Browser *browser = new Browser(url, showInspector);
    browser->show();

    return (app.exec());
}
