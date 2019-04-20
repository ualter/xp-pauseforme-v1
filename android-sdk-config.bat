@ECHO OFF
cls
ECHO. 
ECHO. Setup local enviroment for Android SDK
ECHO.
ECHO.
ECHO. DO NOT FORGET!
ECHO. Disable the Avast Shield Antivirus when executing the command:
ECHO. $ ionic cordova platform add android)
ECHO.  
set ANDROID_HOME=d:\Developer\Android\sdk
set ANDROID_SDK_ROOT=d:\Developer\Android\sdk

set PATH=%PATH%;%ANDROID_HOME%
set PATH=%PATH%;%ANDROID_HOME%\tools
set PATH=%PATH%;%ANDROID_HOME%\platform-tools

set JAVA_HOME=d:\Developer\jdk8_8u181
set PATH=%PATH%;%JAVA_HOME%\bin
ECHO.
ECHO.
javac -version
ECHO.
ECHO.
android list avd
ECHO.
ECHO.
