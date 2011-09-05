cmake_minimum_required(VERSION 2.8)
 
# Thanks to http://www.cmake.org/Wiki/BundleUtilitiesExample



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
 

# this will run moc on the headers
QT4_WRAP_CPP(HEADERS_MOC ${HEADERS})

# this command will generate rules that will run rcc on all files from RESOURCES
# in result QRC_FILES variable will contain paths to files produced by rcc
QT4_ADD_RESOURCES(QRC_FILES ${RESOURCES})

 


# Export -----------------------------------------------------------------------

# This sets the windows build that will need the special winmain@16 call. Qt provides
#  this for us in the qtmain.lib file. Using this cmake code will ensure we have it
#  linked into our build. Not needed on Unix/OS X/Linux which is why we have the 
#  IF(WIN32) conditional.

IF (WIN32)
  SET (QT_USE_QTMAIN TRUE)
ENDIF (WIN32)


# For Apple set the icns file containing icons
IF(APPLE)
  # set how it shows up in the Info.plist file
  SET(MACOSX_BUNDLE_ICON_FILE JOSHFIRE_APP_ICON_MAC_NAME) 
  # set where in the bundle to put the icns file
  SET_SOURCE_FILES_PROPERTIES(${CMAKE_CURRENT_SOURCE_DIR}/JOSHFIRE_APP_ICON_MAC_PATH/JOSHFIRE_APP_ICON_MAC_NAME PROPERTIES MACOSX_PACKAGE_LOCATION Resources)
  # include the icns file in the target
  SET(SRCS ${SRCS} ${CMAKE_CURRENT_SOURCE_DIR}/JOSHFIRE_APP_ICON_MAC_PATH/JOSHFIRE_APP_ICON_MAC_NAME)
ENDIF(APPLE)



IF(APPLE)
  ADD_CUSTOM_TARGET(dmg 
    COMMAND cpack -G DragNDrop ${CMAKE_CURRENT_BINARY_DIR}/CPackConfig.cmake
    #COMMAND ${QT_BINARY_DIR}/macdeployqt ${CMAKE_CURRENT_BINARY_DIR}/JOSHFIRE_APP_NAME.app -no-plugins -dmg
    WORKING_DIRECTORY ${CMAKE_RUNTIME_OUTPUT_DIRECTORY}
    DEPENDS ${PROJECT_NAME}
  )
ENDIF(APPLE)



#  CMake's way of creating an executable
ADD_EXECUTABLE(JOSHFIRE_APP_NAME MACOSX_BUNDLE #WIN32
  ${SRCS}
  ${HEADERS_MOC}
  ${QRC_FILES}
)


# Tell CMake which libraries we need to link our executable against.
TARGET_LINK_LIBRARIES(JOSHFIRE_APP_NAME ${QT_LIBRARIES} ${QT_QTWEBKIT_LIBRARIES} ${QT_QTNETWORK_LIBRARIES})




# Dependencies -----------------------------------------------------------------

# Now the installation stuff below

SET(plugin_dest_dir bin/plugins)
SET(qtconf_dest_dir bin)
SET(APPS "\${CMAKE_INSTALL_PREFIX}/bin/JOSHFIRE_APP_NAME")

IF(APPLE)
  SET(plugin_dest_dir JOSHFIRE_APP_NAME.app/Contents/PlugIns)
  #SET(plugin_dest_dir JOSHFIRE_APP_NAME.app/Contents/MacOS)
  SET(qtconf_dest_dir JOSHFIRE_APP_NAME.app/Contents/Resources)
  SET(APPS "\${CMAKE_INSTALL_PREFIX}/JOSHFIRE_APP_NAME.app")
ENDIF(APPLE)

IF(WIN32)
  SET(APPS "\${CMAKE_INSTALL_PREFIX}/bin/JOSHFIRE_APP_NAME.exe")
ENDIF(WIN32)


# Install the application, on Apple, the bundle is at the root of the
# install tree, and on other platforms it'll go into the bin directory.
INSTALL(TARGETS JOSHFIRE_APP_NAME 
  BUNDLE DESTINATION . COMPONENT Runtime
  RUNTIME DESTINATION bin COMPONENT Runtime
)


# Install needed Qt plugins by copying directories from the qt installation
# One can cull what gets copied by using 'REGEX "..." EXCLUDE'
INSTALL(DIRECTORY "${QT_PLUGINS_DIR}/imageformats" DESTINATION ${plugin_dest_dir} COMPONENT Runtime)


# install a qt.conf file
# this inserts some cmake code into the install script to write the file
INSTALL(CODE "
  file(WRITE \"\${CMAKE_INSTALL_PREFIX}/${qtconf_dest_dir}/qt.conf\" \"\")
  " COMPONENT Runtime)


# Use BundleUtilities to get all other dependencies for the application to work.
# It takes a bundle or executable along with possible plugins and inspects it
# for dependencies.  If they are not system dependencies, they are copied.

# directories to look for dependencies
SET(DIRS ${QT_LIBRARY_DIRS})


# Now the work of copying dependencies into the bundle/package
# The quotes are escaped and variables to use at install time have their $ escaped
# An alternative is the do a configure_file() on a script and use install(SCRIPT  ...).
# Note that the image plugins depend on QtSvg and QtXml, and it got those copied
# over.

INSTALL(CODE "
  file(GLOB_RECURSE QTPLUGINS
    \"\${CMAKE_INSTALL_PREFIX}/${plugin_dest_dir}/*${CMAKE_SHARED_LIBRARY_SUFFIX}\")
  include(BundleUtilities)
  fixup_bundle(\"${APPS}\" \"\${QTPLUGINS}\" \"${DIRS}\")
  " COMPONENT Runtime)


#SET(CPACK_PACKAGE_FILE_NAME "${CMAKE_CURRENT_BINARY_DIR}/JOSHFIRE_APP_NAME")
SET(CPACK_PACKAGE_VERSION_MAJOR "JOSHFIRE_VERSION_MAJOR")
SET(CPACK_PACKAGE_VERSION_MINOR "JOSHFIRE_VERSION_MINOR")
SET(CPACK_PACKAGE_VERSION_PATCH "JOSHFIRE_VERSION_PATCH")
IF(APPLE)
  SET(CPACK_PACKAGE_ICON "${CMAKE_SOURCE_DIR}/JOSHFIRE_APP_ICON_MAC_PATH/JOSHFIRE_APP_ICON_MAC_NAME")
ENDIF(APPLE)
IF(WIN32)
  SET(CPACK_PACKAGE_ICON "${CMAKE_SOURCE_DIR}/JOSHFIRE_APP_ICON_WIN_PATH/JOSHFIRE_APP_ICON_WIN_NAME")
ENDIF(WIN32)


# To Create a package, one can run "cpack -G DragNDrop CPackConfig.cmake" on Mac OS X
# where CPackConfig.cmake is created by including CPack
# And then there's ways to customize this as well
SET(CPACK_BINARY_DRAGNDROP ON)
include(CPack)



