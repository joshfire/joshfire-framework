QT      +=  webkit network
HEADERS = \  
    browser.h \
    joshfire.h
SOURCES =   main.cpp \
    browser.cpp
RESOURCES = \
    app.qrc

# install
sources.files = $$SOURCES $$HEADERS $$RESOURCES *.pro
INSTALLS += target sources

symbian {
    TARGET.UID3 = 0xA000CF6C
    include($$PWD/../../symbianpkgrules.pri)
    TARGET.CAPABILITY = NetworkServices
}
maemo5: include($$PWD/../../maemo5pkgrules.pri)
