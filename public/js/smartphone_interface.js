      var socket = io();
      
      document.getElementById("forward").addEventListener("touchstart", function(){
        moving = true;
        socket.emit("run");
      });

       document.getElementById("forward").addEventListener("touchend", function(){
        moving = false;
        socket.emit("end_move_forward");

      });

      document.getElementById("backward").addEventListener("touchstart", function(){
        moving = true;
        socket.emit("back");
      });

      document.getElementById("backward").addEventListener("touchend", function(){
        moving = false;
        socket.emit("end_move_backward");
      });

      var steer = 0;
      var cam_y = 0;
      var socket = io();
      var init_cam_y = -40;
      var old_cam_y = -40;
      var old_steer = 0;
      var moving = true;


      function handleOrientation(event) { 
          steer = Math.round(event.beta);
          if (!moving){
            cam_y = Math.round(event.gamma) - init_cam_y;          
          }
      }   

      function normalize_cam(x){
        sign_x = Math.sign(x); 

        if (sign_x == 1){
          if (x > 130){
            x = -60;
          } else {
              if (x > 30){
                x = 240;
              } else {
                x = Math.pow(x,2) * 0.235 - 0.520 * x -3.3;  
              }  
          }
          
        } else {
          if (x < -20){
            x = 60;
          } else {
            x = x * -3;
          }
        }
          
        x = Math.floor(x/10) * 10 * sign_x; //ripristino il segno
        return x;
      } 

      function normalize_steer(x){
        sign_x = Math.sign(x); //incremento positivo o negativo

          x = Math.abs(x); //lavoro solo su valori negativi
          
          if ( x >= 0 && x <= 10 ){ //da 0° a 10° molto sensibile (lineare)
            x = x * 3;
          } else {
            if (x > 10 && x <= 30){ //da 11° a 30° crescita parabolica
            x = Math.pow(x,2) * -0.23 + 12.83 * x -75;
              } else {
                x = 100; //limito il range impostano il max a 30°
            }  
          }          
          
          x = Math.round(x) * sign_x; //solo inter. di 10° e ripristino il segno  
          return x;
      } 

      setInterval(function(){  

          var delta_cam = Math.abs(cam_y) - Math.abs(old_cam_y);
          var delta_steer = Math.abs(steer) - Math.abs(old_steer);

          if(Math.abs(delta_steer) < 4){
            steer = old_steer;
          } else {
            old_steer = steer;
          }
          
          if (Math.abs(delta_cam) < 2){  
            cam_y = old_cam_y; //annulla tutto
          } else {
            old_cam_y = cam_y;
          }
                   
          if (cam_y > 5)
            socket.emit("camera_up", normalize_cam(cam_y));
          if (cam_y < -5)
            socket.emit("camera_down", normalize_cam(cam_y) );

          if (steer < 0)
            socket.emit("turn_l", normalize_steer(steer));
          else
            socket.emit("turn_r", normalize_steer(steer));
          
        }, 1/30 * 500); 

     window.addEventListener('deviceorientation', handleOrientation);
  