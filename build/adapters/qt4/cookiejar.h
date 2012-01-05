#ifndef __COOKIEJAR_H__
# define __COOKIEJAR_H__

#include <QtGui>
#include <QtWebKit>

class CookieJar : public QNetworkCookieJar
{
public:
  CookieJar(QObject *parent);
  ~CookieJar();
  QList<QNetworkCookie> cookiesForUrl ( const QUrl & url ) const;
  bool setCookiesFromUrl ( const QList<QNetworkCookie> & cookieList, const QUrl & url );
};

#endif /* !__COOKIEJAR_H__ */
