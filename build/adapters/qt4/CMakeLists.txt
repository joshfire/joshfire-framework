cmake_minimum_required(VERSION 2.8)
 
# Thanks to http://www.cmake.org/Wiki/BundleUtilitiesExample



# General ----------------------------------------------------------------------

PROJECT(Jnuine)

INCLUDE(${CMAKE_CURRENT_BINARY_DIR})




# Qt4 --------------------------------------------------------------------------

FIND_PACKAGE(Qt4 REQUIRED)

INCLUDE(${QT_USE_FILE})
INCLUDE(${QT_INCLUDE_DIR})
INCLUDE_DIRECTORIES(${QT_QTWEBKIT_INCLUDE_DIR})

SET(QT_USE_QTWEBKIT TRUE)
SET(QT_USE_QTMAIN TRUE)




# Ressources -------------------------------------------------------------------
 
SET(SRCS main.cpp browser.cpp bridge.cpp cookiejar.cpp)
SET(HEADERS joshfire.h browser.h bridge.h cookiejar.h)
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
  SET(MACOSX_BUNDLE_ICON_FILE icon.icns) 
  # set where in the bundle to put the icns file
  SET_SOURCE_FILES_PROPERTIES(${CMAKE_CURRENT_SOURCE_DIR}/app/icon.icns PROPERTIES MACOSX_PACKAGE_LOCATION Resources)
  # include the icns file in the target
  SET(SRCS ${SRCS} ${CMAKE_CURRENT_SOURCE_DIR}/app/icon.icns)
ENDIF(APPLE)



IF(APPLE)
  ADD_CUSTOM_TARGET(dmg 
    COMMAND cpack -G DragNDrop ${CMAKE_CURRENT_BINARY_DIR}/CPackConfig.cmake
    #COMMAND ${QT_BINARY_DIR}/macdeployqt ${CMAKE_CURRENT_BINARY_DIR}/Jnuine.app -no-plugins -dmg
    WORKING_DIRECTORY ${CMAKE_RUNTIME_OUTPUT_DIRECTORY}
    DEPENDS ${PROJECT_NAME}
  )
ENDIF(APPLE)



#  CMake's way of creating an executable
ADD_EXECUTABLE(Jnuine MACOSX_BUNDLE #WIN32
  ${SRCS}
  ${HEADERS_MOC}
  ${QRC_FILES}
)


# Tell CMake which libraries we need to link our executable against.
TARGET_LINK_LIBRARIES(Jnuine ${QT_LIBRARIES} ${QT_QTWEBKIT_LIBRARIES} ${QT_QTNETWORK_LIBRARIES})




# Dependencies -----------------------------------------------------------------

# Now the installation stuff below

SET(plugin_dest_dir bin/plugins)
SET(qtconf_dest_dir bin)
SET(APPS "\${CMAKE_INSTALL_PREFIX}/bin/Jnuine")

IF(APPLE)
  SET(plugin_dest_dir Jnuine.app/Contents/PlugIns)
  #SET(plugin_dest_dir Jnuine.app/Contents/MacOS)
  SET(qtconf_dest_dir Jnuine.app/Contents/Resources)
  SET(APPS "\${CMAKE_INSTALL_PREFIX}/Jnuine.app")
ENDIF(APPLE)

IF(WIN32)
  SET(APPS "\${CMAKE_INSTALL_PREFIX}/bin/Jnuine.exe")
ENDIF(WIN32)


# Install the application, on Apple, the bundle is at the root of the
# install tree, and on other platforms it'll go into the bin directory.
INSTALL(TARGETS Jnuine 
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


#SET(CPACK_PACKAGE_FILE_NAME "${CMAKE_CURRENT_BINARY_DIR}/Jnuine")
SET(CPACK_PACKAGE_VERSION_MAJOR "1")
SET(CPACK_PACKAGE_VERSION_MINOR "0")
SET(CPACK_PACKAGE_VERSION_PATCH "0")
IF(APPLE)
  SET(CPACK_PACKAGE_ICON "${CMAKE_SOURCE_DIR}/app/icon.icns")
ENDIF(APPLE)
IF(WIN32)
  SET(CPACK_PACKAGE_ICON "${CMAKE_SOURCE_DIR}/app/icon.ico")
ENDIF(WIN32)


# To Create a package, one can run "cpack -G DragNDrop CPackConfig.cmake" on Mac OS X
# where CPackConfig.cmake is created by including CPack
# And then there's ways to customize this as well
SET(CPACK_BINARY_DRAGNDROP ON)
include(CPack)



