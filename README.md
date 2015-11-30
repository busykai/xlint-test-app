# XLint Test Application#

This is the test application for collecting compatibility data which are used in [XLint](https://github.com/wuchengwei/brackets-xlint) to detect compatibility issues.  
It includes the code for both the client side (*code in directory "app"*) and the server side (*code in directory "server"*). The client side code is a [Cordova](https://cordova.apache.org/) application written in [Intel XDK](http://xdk.intel.com). It runs on target mobile devices, collects the compatibility data and send the data to the server side, which is written in [Node.js](https://nodejs.org).