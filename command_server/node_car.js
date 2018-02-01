var makePwm = require('adafruit-pca9685');
var Gpio = require('pigpio').Gpio;


pwm = makePwm({
                "freq": 50, //frequenza del device
                "correctionFactor": 1.118, //per sintonizzare la frequenza
                "address": 0x40, //indirizzo del bus i2c
                "device": '/dev/i2c-1',
                "debug": true
        	});

function Motor(ch_pca,ch_gpio_1,ch_gpio_2,rev,init_speed){
	this.channel_pca9685 = ch_pca; //canale utilizzato per settare la velocita del motore (ENA)
	var channel_gpio_1 = ch_gpio_1; //polo positivo del motore (EN1)
	var channel_gpio_2 = ch_gpio_2; //polo negativo del motore (EN2)
	this.speed = init_speed; //setSpeed(speed) --> mappa speed(1...1000) to 1..4095
	this.reverse = rev;
	this.default_speed = init_speed;
	this.max_speed = 4000;
	this.min_speed = 2000;

  this.motor_for = new Gpio(channel_gpio_1, {mode: Gpio.OUTPUT});
	this.motor_back = new Gpio(channel_gpio_2, {mode: Gpio.OUTPUT});

	function check_speed(speed, min,max){
		if (speed <= min)
			speed = min;
		if (speed >= max)
			speed = max;
		return speed;
	}

	this.move_forward = function move_forward(new_speed){
		this.speed = check_speed(new_speed, this.min_speed, this.max_speed);
		//pwm.setPwm(this.channel_pca9685, 0, this.speed);
		this.motor_for.digitalWrite(1 - this.reverse);
		this.motor_back.digitalWrite(0 + this.reverse);
	}

	this.move_backward = function move_backward(new_speed){
		this.speed = check_speed(new_speed, this.min_speed, this.max_speed);
		//pwm.setPwm(this.channel_pca9685, 0, this.speed);
		this.motor_for.digitalWrite(0 + this.reverse);
		this.motor_back.digitalWrite(1 - this.reverse);
	}

	this.stop = function stop(){
		this.motor_for.digitalWrite(0);
		this.motor_back.digitalWrite(0);
	}

	//Speed
	this.get_speed = function get_speed(){
		return this.speed;
	}

	this.set_speed = function set_speed(speed){
		this.speed = speed;
	}

	this.get_default = function get_default(){
		return this.default_speed;
	}

	this.reset = function reset(){
		this.speed = this.default_speed;
	}

	this.get_limit = function get_limit(){
		return ((this.speed <= this.min_speed) || (this.speed >= this.max_speed));
	}
};

exports.motor_l = new Motor(5,17,18,0,2000);
exports.motor_r = new Motor(4,27,22,1,2000);

//Classe per lo sterzo
function Steering_Wheels(ch_pca,init_steer,camera){
	this.channel_pca9685 = ch_pca;
	this.cam = camera;
	this.steer_value =  init_steer;
	this.semi_auto = true;
	this.default_steer = init_steer;
	this.observers = [];
	this.min_grade = 220;
	this.max_grade = 410;

	function check_grade(steer, min,max){
		//litmit sterzo: 220 - 410
		//limiti ampiezza movimento ruote: 210 - 330
		if (steer <= min)
			steer = min;
		if (steer >= max)
			steer = max;
		return steer;
	}

	this.get_limit = function get_limit(){
		return ((this.steer_value <= this.min_grade) || (this.steer_value >= this.max_grade));
	}

	this.add_obs = function add_obs(obs){
		this.observers.push(obs);
	}

	this.notify = function notify(){
		center_wheels = this.steer_value - this.default_steer;
		for ( i = 0; i < this.observers.length; i++){
			this.observers[i].update(center_wheels);
		}
	}

	this.steer = function steer(new_steer){
		this.steer_value = check_grade(new_steer,this.min_grade,this.max_grade);
		//pwm.setPwm(this.channel_pca9685, 0, this.steer_value);
		this.notify();
	}

	this.get_actual_steer = function get_actual_steer(){
		return this.steer_value;
	}

	this.get_default_steer = function get_default_steer(){
		return this.default_steer;
	}

	this.reset = function reset(){
		this.steer(this.default_steer);
	}

	this.get_min = function get_min(){
		return this.min_grade;
	}

	this.get_max = function get_max(){
		return this.max_grade;
	}
};

this.steering_wheels = new Steering_Wheels(8,317,this.camera);
exports.steering_wheels;

function Camera(ch_pca_x,ch_pca_y,steer_x,steer_y){
	this.channel_pca9685_x_axis = ch_pca_x;
	this.channel_pca9685_y_axis = ch_pca_y
	this.steer_x_axis = steer_x;
	this.steer_y_axis = steer_y;
	this.default_steer_x = steer_x;
	this.default_steer_y = steer_y;
	this.semi_auto = true;
	this.min_y_grade = 180;
	this.max_y_grade = 480;
	this.min_x_grade = 200;
	this.max_x_grade = 520;

	function check_grade(grade, min, max){
		if (grade < min)
			grade = min;
		if (grade > max)
			grade = max;
		return grade;
	}

	this.get_limit_y = function get_limit(){
		return ((this.steer_y_axis <= this.min_y_grade) || (this.steer_y_axis >= this.max_y_grade));
	}

	this.get_limit_x = function get_limit(){
		return ((this.steer_x_axis <= this.min_x_grade) || (this.steer_x_axis >= this.max_x_grade));
	}

	this.update = function update(center_wheels){
		if (this.semi_auto)
			this.turn_x_axis(this.default_steer_x - center_wheels);
	}

	this.get_semi_auto = function get_semi_auto(){
		return this.semi_auto;
	}

	this.set_semi_auto = function set_semi_auto(boolean){
		this.semi_auto = boolean;
	}

	this.turn_x_axis = function turn_x_axis(steer_x){
		this.steer_x_axis = check_grade(steer_x, this.min_x_grade, this.max_x_grade);
		//pwm.setPwm(this.channel_pca9685_x_axis, 0, this.steer_x_axis);
	}

	this.turn_y_axis = function turn_y_axis(steer_y){
		this.steer_y_axis = check_grade(steer_y, this.min_y_grade, this.max_y_grade);
		//pwm.setPwm(this.channel_pca9685_y_axis, 0, this.steer_y_axis);
	}

	this.get_default_x_axis = function get_default_x_axis(){
		return this.default_steer_x;
	}

	this.get_default_y_axis = function get_default_y_axis(){
		return this.default_steer_y;
	}

	this.reset_x_axis = function reset_x_axis(){
		this.turn_x_axis(this.default_steer_x);
	}

	this.reset_y_axis = function reset_y_axis(){
		this.turn_y_axis(this.default_steer_y);
	}

	this.reset = function set_default(){
		this.reset_x_axis();
		this.reset_y_axis();
	}

	this.get_actual_x_axis = function get_actual_x_axis(){
		return this.steer_x_axis;
	}

	this.get_actual_y_axis = function get_actual_y_axis(){
		return this.steer_y_axis;
	}

	this.get_min_x = function get_min_x(){
		return this.min_x_grade;
	}

	this.get_max_x = function get_max_x(){
		return this.max_x_grade;
	}

	this.get_min_y = function get_min_y(){
		return this.min_y_grade;
	}

	this.get_max_y = function get_max_y(){
		return this.max_y_grade;
	}
};

this.camera = new Camera(12,15,390,220);
this.steering_wheels.add_obs(this.camera);
exports.camera;
