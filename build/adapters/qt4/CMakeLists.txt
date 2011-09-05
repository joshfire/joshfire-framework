cmake_minimum_required(VERSION 2.8)
 

# General ----------------------------------------------------------------------

PROJECT(JOSHFIRE_APP_NAME)

INCLUDE(${CMAKE_CURRENT_BINARY_DIR})




# Qt4 --------------------------------------------------------------------------

FIND_PACKAGE(Qt4 REQUIRED)

INCLUDE(${QT_USE_FILE})
INCLUDE(${QT_INCLUDE_DIR})
INCLUDE_DIRECTORIES(${QT_QTWEBKIT_INCLUDE_DIR})

SET(QT_USE_QTWEBKIT TRUE)
SET(QT_USE_QTMAIN TRUE)




# Ressources -------------------------------------------------------------------
 
SET(SRCS main.cpp browser.cpp bridge.cpp)
SET(HEADERS joshfire.h browser.h bridge.h)
SET(RESOURCES app.qrc)
 
QT4_WRAP_CPP(HEADERS_MOC ${HEADERS})
QT4_ADD_RESOURCES(QRC_FILES ${RESOURCES})

 


# Export -----------------------------------------------------------------------

if(APPLE)

  ADD_CUSTOM_TARGET(dmg 
    COMMAND ${QT_BINARY_DIR}/macdeployqt ${CMAKE_CURRENT_BINARY_DIR}/JOSHFIRE_APP_NAME.app -no-plugins -dmg
    WORKING_DIRECTORY ${CMAKE_RUNTIME_OUTPUT_DIRECTORY}
    DEPENDS ${PROJECT_NAME}
  )

ADD_EXECUTABLE(JOSHFIRE_APP_NAME MACOSX_BUNDLE ${SRCS} ${HEADERS_MOC} ${QRC_FILES})
  #SET_TARGET_PROPERTIES(JOSHFIRE_APP_NAME PROPERTIES CPACK_BUNDLE_STARTUP_COMMAND JOSHFIRE_APP_NAME)
  #SET_TARGET_PROPERTIES(JOSHFIRE_APP_NAME PROPERTIES CPACK_BUNDLE_ICON "${CMAKE_CURRENT_SOURCE_DIR}/cmakesrc/MadX.icns")

else(APPLE)

  ADD_EXECUTABLE(JOSHFIRE_APP_NAME ${SRCS} ${HEADERS_MOC} ${QRC_FILES})

endif(APPLE)




# Dependencies -----------------------------------------------------------------

TARGET_LINK_LIBRARIES(JOSHFIRE_APP_NAME ${QT_LIBRARIES} ${QT_QTWEBKIT_LIBRARIES} ${QT_QTNETWORK_LIBRARIES})


