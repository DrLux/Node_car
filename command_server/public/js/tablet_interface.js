	var socket = io();

	var joystick_1	= new VirtualJoystick({
		container	: document.body,
		strokeStyle	: 'cyan',
		limitStickTravel: true,
		stickRadius	: 170,
	});

	// one on the right of the screen
	var joystick_2	= new VirtualJoystick({
		container	: document.body,
		strokeStyle	: 'cyan',
		limitStickTravel: true,
		stickRadius	: 100,
	});

	joystick_2.addEventListener('touchStartValidation', function(event){
		var touch	= event.changedTouches[0];
		if( touch.pageX < window.innerWidth/2 )	return false;
		return true
	});

	joystick_1.addEventListener('touchStartValidation', function(event){
		var touch	= event.changedTouches[0];
		if( touch.pageX >= window.innerWidth/2 )	return false;
		return true
	});


	setInterval(function(){
		if (joystick_1.up()){
			socket.emit("end_camera_x");
			socket.emit("camera_up", -joystick_1.deltaY());
		}
		if (joystick_1.down()){
			socket.emit("end_camera_x");
			socket.emit("camera_down", -joystick_1.deltaY());
		}
		if (joystick_1.left()){
			socket.emit("end_camera_y");
			socket.emit("camera_left", -joystick_1.deltaX());
		}
		if (joystick_1.right()){
			socket.emit("end_camera_y");
			socket.emit("camera_right", -joystick_1.deltaX());
		}

		if (joystick_2.up()){
			socket.emit("run", -joystick_2.deltaY());
		}
		if (joystick_2.down()){
			socket.emit("back", joystick_2.deltaY());
		}
		if (joystick_2.left()){
			socket.emit("turn_l", joystick_2.deltaX());
		}
		if (joystick_2.right()){
			socket.emit("turn_r", joystick_2.deltaX());
		}

	}, 1/30 * 1000);

	joystick_1.addEventListener('touchStart', function(){
		socket.emit("end_camera_x", 1);
		socket.emit("end_camera_y", 1);
	});

	joystick_2.addEventListener('touchStart', function(){
		socket.emit("end_steering", 1);
	});

	joystick_2.addEventListener('touchEnd', function(){
		socket.emit("end_move_forward", 1);
	});
