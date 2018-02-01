window.addEventListener("load", function(){ //Al caricamento della pagina
		var socket = io();
		
			document.onkeydown = function () {
				console.log("premuto: "+event.keyCode );
		    	switch(event.keyCode) {
		            case 87: //W
		          		socket.emit("run");
		            break;
		            case 65: //A
						socket.emit("turn_l");
		            break;
		            case 68: //D
		            	socket.emit("turn_r");
		            break;
		            case 83: //S
		              socket.emit("back");
		            break;
		            case 32: //SPACE
		              socket.emit("home");
		            break;
		            case 37: //LEFT_ARROW
		              socket.emit("camera_left");
		            break;
		            case 38: //UP_ARROW
		              socket.emit("camera_up");
		            break;
		            case 39: //RIGHT_ARROW
		              socket.emit("camera_right");
		            break;
		            case 40: //DOWN_ARROW
		              socket.emit("camera_down");
		            break;
		            default:
		              //socket.emit("stop");
		        }
		    };

		    document.onkeyup = function(){
		    	switch(event.keyCode) {
		    		case 65: //A
		    		case 68: //D
		    			socket.emit("end_steering");
		    		break;
		        	case 87: //W
		          		socket.emit("end_move_forward");
		      		break;
		        	case 83: //S
		          		socket.emit("end_move_backward");
		        	break;
		        	case 38: //UP_ARROW
		        	case 40: //DOWN_ARROW
		          		socket.emit("end_camera_y");
		        	break;
		        	case 39: //RIGHT_ARROW
		        	case 37: //LEFT_ARROW
		            	socket.emit("end_camera_x");
		        	break;
		      	}
	    	};
		});