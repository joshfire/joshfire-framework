#include <iostream>

#include "cookiejar.h"
#include "joshfire.h"

CookieJar::CookieJar(QObject *parent)
  :QNetworkCookieJar(parent)
{
}

CookieJar::~CookieJar()
{
}

bool CookieJar::setCookiesFromUrl(const QList<QNetworkCookie> & cookieList,
				  const QUrl & url)
{
  QSettings settings("Joshfire", Joshfire::appTitle);

  settings.beginGroup(url.host());
    
  for (QList<QNetworkCookie>::const_iterator i = cookieList.begin();
       i != cookieList.end(); i++)
    {
      settings.setValue((*i).name(), QString((*i).value()));
    }
    
  settings.sync();
    
  return true;
}

QList<QNetworkCookie> CookieJar::cookiesForUrl(const QUrl & url) const
{
  QSettings settings("Joshfire", Joshfire::appTitle);
  QList<QNetworkCookie> cookieList;

  settings.beginGroup(url.host());

  QStringList keys = settings.childKeys();
    
  for (QStringList::iterator i = keys.begin(); i != keys.end(); i++)
    {
      cookieList.push_back(QNetworkCookie((*i).toLocal8Bit(),
					  settings.value(*i).toByteArray()));
    }
    
  return cookieList;
}
