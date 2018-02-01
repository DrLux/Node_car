var node_car = require('./node_car.js');
var sleep = require('sleep');
var http = require('http').createServer(handler); //require http server, and create server with function handler()
var fs = require('fs'); //require filesystem module
var io = require('socket.io')(http) //require socket.io module and pass the http object (server)
var url = require("url");
var mime = require("mime-types");
var path = require("path");


// deal with any signals and cleanup
process.on('SIGINT', function(code) {
    console.log("\nArresto in corso ...");
    process.exit(0);
});

process.on('SIGHUP', function(code) {
    console.log("\nArresto in corso per SIGHUP...");
    process.exit(0);
});

/*
process.on('exit', function(code) {
    console.log("exit...");
    process.exit(0);
});
*/

http.listen(8085);

function handler (req, res) {
  var dir = "/public";
  var uri = url.parse(req.url).pathname;
  if (uri == "/")
    uri = "index.html";
  var filename = path.join(dir,uri);
  fs.readFile(__dirname + filename,
    function(err, data) {
      if (err) {
        res.writeHead(404, {'Content-Type': 'text/html'}); //mostro errore
        return res.end("404 Not Found");
      }
    res.setHeader('content-type', mime.lookup(filename));
    res.writeHead(200); //write HTML
    res.end(data);

  });
}

io.sockets.on('connection', function (socket) {
  var TIMER_SEMIAUTO = 5000;
  var MAX_SPEED = 4000;
  var MIN_SPEED = 2000;

  var id_timer_semiauto;

  var turning_wheels = false;
  var turning_cam_y = false;
  var turning_cam_x = false;
  var motor_on = false;

  var speed = MIN_SPEED;

  function enable_semi_auto(){
    node_car.camera.set_semi_auto(true);
  }

  function disable_semi_auto(){
    node_car.camera.set_semi_auto(false);
    if (id_timer_semiauto){ //se c'è già un timer attivo lo resetto
      clearTimeout(id_timer_semiauto);
    }
    id_timer_semiauto = setTimeout(enable_semi_auto, 5000);
  }


  function steering(dir,count){
    if(turning_wheels){
      steer = node_car.steering_wheels.get_actual_steer();
      speed = (node_car.motor_r.get_speed()) / 300;
      node_car.steering_wheels.steer(steer + (speed * dir));
      if (!node_car.steering_wheels.get_limit())//è inutile continuare a sterzare se sono arrivato al massimo dei gradi
        setTimeout( steering, 40, dir, count+dir);//itero un nuovo ciclo dopo 5secondi
      console.log('Actual steer value: '+steer);
    }
  };

  socket.on('turn_l', function(delta) {
    if (delta){
      var steer = node_car.steering_wheels.get_default_steer() + delta;
      node_car.steering_wheels.steer(steer);
      console.log('Actual steer value: '+steer);
    } else {
      if (turning_wheels == false){
        turning_wheels = true;
        steering(-1);
      }
    }
  });

  socket.on('turn_r', function(delta) {
    if (delta){
      var steer = node_car.steering_wheels.get_default_steer() + delta;
      node_car.steering_wheels.steer(steer);
      console.log('Actual steer value: '+steer);
    } else {
      if (turning_wheels == false){
        turning_wheels = true;
        steering(1);
      }
    }
  });

  socket.on('end_steering',function(reset){
    if (reset){
      node_car.steering_wheels.reset();
    }
    turning_wheels = false;
  });


  function turning_camera_vertical(dir){
    if(turning_cam_y == false) return; //smette di ciclare
    cam_y_axis = node_car.camera.get_actual_y_axis();
    node_car.camera.turn_y_axis(cam_y_axis + (10 * dir));
    if (!node_car.camera.get_limit_y())//è inutile continuare a sterzare se sono arrivato al massimo dei gradi
      setTimeout( turning_camera_vertical, 40, dir);//itero un nuovo ciclo dopo 5secondi
    console.log('Actual Cam_y_axis value: '+ cam_y_axis);
  }

  socket.on('camera_up', function(delta) {
    if (delta){
      node_car.camera.turn_y_axis(node_car.camera.get_default_y_axis()+delta);
    } else {
      if (turning_cam_y == false){
        turning_cam_y = true;
        turning_camera_vertical(+1);
      }
    }
  });

  socket.on('camera_down', function(delta) {
    if (delta){
      node_car.camera.turn_y_axis(node_car.camera.get_default_y_axis()+delta);
    } else {
      if (turning_cam_y == false){
        turning_cam_y = true;
        turning_camera_vertical(-1);
      }
    }
  });

  socket.on('end_camera_y',function(reset){
    if (reset){
      node_car.camera.reset_y_axis();
    } else {
      turning_cam_y = false;
    }
  });


  function turning_camera_horizontal(dir){
    disable_semi_auto();
    if(turning_cam_x == false) return; //smette di ciclare
    cam_x_axis = node_car.camera.get_actual_x_axis();
    node_car.camera.turn_x_axis(cam_x_axis + (10 * dir));
    if (!node_car.camera.get_limit_x())//è inutile continuare a sterzare se sono arrivato al massimo dei gradi
      setTimeout( turning_camera_horizontal, 40, dir);//itero un nuovo ciclo dopo 5secondi
    console.log('Actual Cam_y_axis value: '+ cam_x_axis);
  }

  socket.on('camera_right', function(delta) {
    if (delta){
      node_car.camera.turn_x_axis(node_car.camera.get_default_x_axis()+delta);
    } else {
      if (turning_cam_x == false){
        turning_cam_x = true;
        turning_camera_horizontal(-1);
      }
    }
  });

  socket.on('camera_left', function(delta) {
    if (delta){
      node_car.camera.turn_x_axis(node_car.camera.get_default_x_axis()+delta);
    } else {
      if (turning_cam_x == false){
        turning_cam_x = true;
        turning_camera_horizontal(+1);
      }
    }
  });

  socket.on('end_camera_x',function(reset){
    if (reset){
      node_car.camera.reset_x_axis();
    } else {
      turning_cam_x = false;
    }
  });

  function running(dir, count){
    if(motor_on == false) return; //smette di ciclare
      speed = (Math.log(count)*600)+2010;
    if (dir == 1){
      node_car.motor_r.move_forward(speed);
      node_car.motor_l.move_forward(speed);
    } else {
      node_car.motor_r.move_backward(speed);
      node_car.motor_l.move_backward(speed);
    }
    if (!node_car.motor_r.get_limit())
      setTimeout( running, 10, dir, count+1);
    console.log('Actual speed value: '+ speed);
  }

  socket.on('run', function(speed) {
    if (speed){
      node_car.motor_r.move_forward(2000 + (speed * 20));
      node_car.motor_l.move_forward(2000 + (speed * 20));
    } else {
      if (motor_on == false){
        motor_on = true;
        running(1, 1);
      }
    }
  });

  socket.on('back', function(speed) {
    if (speed){
      node_car.motor_r.move_backward(2000 + (speed * 20));
      node_car.motor_l.move_backward(2000 + (speed * 20));
    } else {
      if (motor_on == false){
        motor_on = true;
        running(-1, 1);
      }
    }
  });

  function stopping(dir){
    if (!motor_on){ //se mi sto muovendo non devo fermarmi
      speed = node_car.motor_r.get_speed();
      if (speed <= 2200) { //se sono arrivato al valore minimo mi fermo
        node_car.motor_r.stop();
        node_car.motor_l.stop();
      } else {
        if (dir == 1){
          node_car.motor_r.move_forward(speed - 400);
          node_car.motor_l.move_forward(speed - 400);
        } else {
          node_car.motor_r.move_backward(speed - 400);
          node_car.motor_l.move_backward(speed - 400);
        }
        setTimeout( stopping, 15, dir);
        console.log('Actual speed value: '+ speed);
      }
    }
  }

  socket.on('end_move_forward', function(reset) {
    if (reset){
      node_car.motor_r.stop();
      node_car.motor_l.stop();
    }
    motor_on = false;
    stopping(1);
  });

  socket.on('end_move_backward', function() {
    motor_on = false;
    stopping(-1);
  });

  socket.on('home', function() {
    node_car.motor_r.stop();
    node_car.motor_l.stop();
    node_car.steering_wheels.reset();
    node_car.camera.reset_x_axis();
    node_car.camera.reset_y_axis();
  });

});
