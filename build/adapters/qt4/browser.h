#ifndef   BROWSER_H
#  define BROWSER_H

#  include <QtGui>
#  include <QWebView>
#  include <QDialog>

#  include "bridge.h"

#   define DEBUG_FLAG ("--debug-js")

class Browser : public QMainWindow
{
    Q_OBJECT

public:
    Browser(const QUrl& url, bool showInspector);
    virtual ~Browser();

public:
    QNetworkCookieJar* getNetworkCookieJar();
    QWebFrame* getMainFrame();

protected slots:
    void loaded(bool status);
    void voidSlot() {}

private:
    QWebView*	webview;
    Bridge*   bridge;

    QDialog* inspectorDialog;
};

#endif // BROWSER_H
