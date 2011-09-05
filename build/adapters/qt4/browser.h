#ifndef   BROWSER_H
#  define BROWSER_H

#  include <QtGui>
#  include <QWebView>

#  include "bridge.h"


class Browser : public QMainWindow
{
    Q_OBJECT

public:
    Browser(const QUrl& url);

protected slots:
    void loaded(bool status);
    void voidSlot() {}

private:
    QWebView*	webview;
    Bridge*   bridge;
};

#endif // BROWSER_H
