# Node_car: A Remote Controlled Raspberry Car With Node.js #

This project consists of a robot built with Raspberry Pi 3 that can be controlled remotely. The first server (written in Node.js) listens commands from client while another server (written in python but not present in this repository) transmits the images captured by the robot's camera. The connection is established via Wi-Fi, so you can control it from your pc (keyboard), your tablet (touchscreen) or even from your smartphone (touchscreen plus accelerometer).

### Documentation ###
All the documentation are available  on the [dedicated page](https://drlux.github.io/node_car.html) .

### Instructions ###
The node_car.js library is completely autonomous and can also be used for different projects, it is just sufficient to set parameters correctly.

Each component needs a parameters such as:
channel on pca9685/gpio, default/initial value, parameter range (depending on the servo used).

### Removed source code of the Streaming Server ###
The source code of the streaming server is removed. If you are interested you can check [ here ](https://github.com/BigNerd95/picamera/tree/master/docs/examples)
