QT      +=  webkit network

HEADERS = \  
    browser.h \
    joshfire.h \
    bridge.h \
    cookiejar.h
SOURCES =   main.cpp \
    browser.cpp \
    bridge.cpp \
    cookiejar.cpp
RESOURCES = \
    app.qrc


DESTDIR    = ../windows

TARGETPATH = $(DESTDIR)
TARGET     = Jnuine

CONFIG     += qt
CONFIG     += release

win32:INCLUDEPATH += $$quote(C:/Qt/include)
win32:RC_FILE = joshfire_win.rc



# install
sources.files = $$SOURCES $$HEADERS $$RESOURCES *.pro
sources.path += C:/Users/Joshfire/Documents/app C:/Qt/include
target.path  += $$[QT_INSTALL_PLUGINS]/imageformats

INSTALLS     += target sources
