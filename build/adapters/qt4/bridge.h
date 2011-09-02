#ifndef   BRIDGE_H
#  define BRIDGE_H

#  include <QtGui>
#  include <QWebView>

class Browser;

class Bridge : public QObject
{
    Q_OBJECT

public:
    Bridge(Browser* b);

public slots:
  void sizeFullScreen();
  void sizeNormal();

private:
    Browser*	browser;
};

#endif // BRIDGE_H
