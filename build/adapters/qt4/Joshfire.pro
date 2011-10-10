QT      +=  webkit network

HEADERS = \  
    browser.h \
    joshfire.h \
    bridge.h
SOURCES =   main.cpp \
    browser.cpp \
    bridge.cpp
RESOURCES = \
    app.qrc


DESTDIR    = JOSHFIRE_WIN_DESTDIR

TARGETPATH = $(DESTDIR)
TARGET     = JOSHFIRE_APP_NAME

CONFIG     += qt
CONFIG     += release

win32:INCLUDEPATH += $$quote(C:/Qt/include)
win32:RC_FILE = joshfire_win.rc



# install
sources.files = $$SOURCES $$HEADERS $$RESOURCES *.pro
sources.path += JOSHFIRE_WIN_SRCPATH
target.path  += $$[QT_INSTALL_PLUGINS]/imageformats

INSTALLS     += target sources
