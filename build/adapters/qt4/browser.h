#ifndef   BROWSER_H
#  define BROWSER_H

#  include <QtGui>
#  include <QWebView>

//class QWebView;

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
};

#endif // BROWSER_H
