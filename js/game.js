//arquivo que define o objeto de esferas e a classe de Jogo que lida com
//todos os eventos e funções relacionadas a interação com os objetos do jogo

//é levado em consideração que as funções do arquivo 'auxFunctions.js' e 'main.js'
//já foram definidos

class Game {
    camera = new Camera();
    projection = new Projection();
    scale = 1;
    balls = [];
    pause = false;
    ballToOrbit = null;
    referentialSelected = false;

    statsFunction = function(){}

    constructor(statsFunction){
        if (statsFunction == null || typeof(Function) != typeof(statsFunction)) {
            throw new Error('argumentos do construtor inválidos !');
        }else{
            this.statsFunction = statsFunction;
        }
    }

    eventFunction = {
        prevMousePos: [0, 0],
        rightPressed: false,

        'mousedown': (x, y, button) => {
            if (button == 2) this.eventFunction.rightPressed = true;
            
            if (button == 0 && (move || accelerate)) {
                this.ballHandled = getBallInPos(x + this.camera.pos[0], y + this.camera.pos[1], this.balls);
            }
        },

        'mousemove': (x, y) => {
            if (this.eventFunction.rightPressed && !this.referentialSelected){
                this.camera.addHorizontalIncrement(this.eventFunction.prevMousePos[0] - x);
                this.camera.addVerticalIncrement(this.eventFunction.prevMousePos[1] - y);

                cameraPos.innerHTML = `[${parseInt(this.camera.pos[0])}, ${parseInt(this.camera.pos[1])}]`;
            }

            if (projection) {
                this.projection.setPosX(x);
                this.projection.setPosY(y);
            }

            if (this.ballHandled != null && !referential && move) {
                this.ballHandled.pos[0] = x + this.camera.pos[0];
                this.ballHandled.pos[1] = y + this.camera.pos[1];

                predictor.restart();
            }

            this.eventFunction.prevMousePos[0] = x;
            this.eventFunction.prevMousePos[1] = y;
        },

        'mouseup': (x, y, button) => {
            let ballCreated = null;
            let screenX = x / gameObject.scale + window.innerWidth / 2;
            let screenY = y / gameObject.scale + window.innerHeight / 2;

            if (button == 0 && 
                screenX != 0 && screenY != 0 && 
                !collidingWithGUI(screenX, screenY) &&
                !move

            ) ballCreated = this.createBall(x, y);

            ballCreated = this.checkOrbit(x, y, ballCreated, this.ballToOrbit);

            if (button == 0 && referential) {
                let ballClicked = getBallInPos(x + this.camera.pos[0], y + this.camera.pos[1], this.balls);
                
                if (ballClicked != null) {
                    this.camera.pos = ballClicked.pos;
                    this.referentialSelected = true;

                    cameraPos.innerHTML = `[${parseInt(this.camera.pos[0])}, ${parseInt(this.camera.pos[1])}]`;
                }
            }

            if (ballCreated != null && !remove && !accelerate && !inert && !radial) {
                this.balls.push(ballCreated);
                predictor.restart();
            }

            if (radial && button == 0 && 
                screenX != 0 && screenY != 0 && 
                !collidingWithGUI(screenX, screenY) &&
                !move) {
                var ballList = radialHandler.getRadialBallsList();

                ballList.forEach(ball => {
                    ball.pos[0] += (this.camera.pos[0] + x);
                    ball.pos[1] += (this.camera.pos[1] + y);

                    this.balls.push(ball);
                });
            }

            if (remove) {
                let ballClicked = getBallInPos(x + this.camera.pos[0], y + this.camera.pos[1], this.balls);
                if (ballClicked != null) {
                    this.balls.splice(this.balls.indexOf(ballClicked), 1);
                    predictor.restart();
                }
            }

            if (inert) {
                let ballClicked = getBallInPos(x + this.camera.pos[0], y + this.camera.pos[1], this.balls);
                if (ballClicked != null) ballClicked.vel = [0, 0];
            }

            if (button == 2) this.eventFunction.rightPressed = false;
            
            this.ballHandled = null;
        },

        'keydown': key => {
            if (key == 'q') this.scale /= 1.3;
            if (key == 'e') this.scale *= 1.3;

            if (key == 'a' && !this.referentialSelected) this.camera.moveToLeft();
            if (key == 'd' && !this.referentialSelected) this.camera.moveToRight();
            if (key == 'w' && !this.referentialSelected) this.camera.moveToUp();
            if (key == 's' && !this.referentialSelected) this.camera.moveToDown();
            if (key == 'r') this.clear();
        },

        'keyup': key => {
            if (key == 'a' || key == 'd') this.camera.clearHorizontalMovement();
            if (key == 'w' || key == 's') this.camera.clearVerticalMovement();
            if (key == 'p') {this.pause = !this.pause; pauseButton.swapState();}
        }
    }

    handleEvents = function(eventName, ...args){
        this.eventFunction[eventName](...args);
    }

    collided = [];
    updateBalls() {
        if (!this.pause) {
            //this.collided.length = 0;
            for (var i = 0; i < this.balls.length; i++) {
                applyGravity(this.balls, this.balls[i]);
                applyCollisions(this.balls, this.balls[i]);
            }
        }

        for (var i = 0; i < this.balls.length; i++) {
            if (!move && accelerate && this.balls[i] == this.ballHandled) {
                applyAcceleration(this.balls[i]);
                predictor.restart();
            }
        }

        if (!this.pause){
            for (var i = 0; i < this.balls.length; i++) {
                if (!(move && this.balls[i] == this.ballHandled)) {
                    updateBall(this.balls[i]);
                }
            }
        }
    }

    update () {
        this.updateBalls();

        this.camera.update(this.scale);
    }

    draw () {
        for (var i = 0; i < this.balls.length; i++) {
            drawBall(
                this.balls[i].pos[0] - this.camera.pos[0],
                this.balls[i].pos[1] - this.camera.pos[1],
                this.balls[i],
            );
        }

        if (projection) this.projection.draw(this.camera.pos, this.balls, this.scale, this.ballToOrbit);
    }

    clear () {
        this.balls.length = 0;
        predictor.restart();
    }

    clearReferential () {
        this.camera.pos = [this.camera.pos[0], this.camera.pos[1]];
        this.referentialSelected = false;

        cameraPos.innerHTML = `[${parseInt(this.camera.pos[0])}, ${parseInt(this.camera.pos[1])}]`;
    }

    checkOrbit (x, y, createdBall) {
        if (orbit) {
            if (this.ballToOrbit != null && createdBall != null) {
                applyOrbitalVelocityToBall(this.ballToOrbit, createdBall);
            }

            let ballOrbit = this.ballToOrbit;
            this.ballToOrbit = getBallInPos(x + this.camera.pos[0], y + this.camera.pos[1], this.balls);

            if (createdBall != null && ballOrbit != null) {
                return createdBall;
            }

            return null;
        }else{
            return createdBall;
        }
    }

    createBall (x, y) {
        if (!(referential && getBallInPos(x, y, this.balls) != null)){

            let stats = this.statsFunction();

            let ball = new Ball(
                x + this.camera.pos[0],
                y + this.camera.pos[1],
                stats['mass'],
                stats['radius'],
                stats['color'],
                gravity,
                collision
            );

            return ball;
        }

        return null;
    }
}

class Predictor {

    constructor(step=4){
        this.ballsNow = [];
        this.ballsTimeline = [];
        this.step = step;
        this.tick = 0;
        this.seconds = 0;
    }

    cloneBalls(ballsList){
        this.ballsTimeline.length = 0;
        this.ballsNow.length = 0;
        
        ballsList.forEach(ball => {
            var newBall = new Ball(
                ball.pos[0], ball.pos[1],
                ball.mass, ball.radius, ball.color,
                ball.gravity, ball.collision
            );

            newBall.vel[0] = ball.vel[0];
            newBall.vel[1] = ball.vel[1];

            this.ballsNow.push(newBall);
        });
    }

    getInstant(){
        var instant = [];
        
        for (var i = 0; i < this.ballsNow.length; i++){
            var ball = this.ballsNow[i];
            
            instant.push({
                x: ball.pos[0], 
                y: ball.pos[1],
                color: ball.color,
            });
        }

        return instant;
    }

    restart(){
        if (predict) this.startPredict(this.seconds);
    }

    updateStep(step){
        this.step = step;

        if (predict) this.startPredict(this.seconds);
    }

    updateSeconds(seconds){
        this.seconds = seconds;

        if (predict) this.startPredict(this.seconds);
    }

    updateTimeline(){
        var instant = this.getInstant();

        if (this.tick % this.step == 0) {
            this.ballsTimeline.splice(0, 0, instant);
            this.ballsTimeline.length -= 1;
        }

        this.tick++;
    }

    startPredict(seconds){
        this.seconds = seconds;
        this.cloneBalls(gameObject.balls);

        for (var i = 0; i < seconds*60; i++){
            if (i % this.step == 0) {
                var instant = this.getInstant();
                this.ballsTimeline.splice(0, 0, instant);
            }

            this.updateBallsNow();
        }
    }

    updateBallsNow(){
        //this.collided.length = 0;
        for (var i = 0; i < this.ballsNow.length; i++) {
            applyGravity(this.ballsNow, this.ballsNow[i]);
            applyCollisions(this.ballsNow, this.ballsNow[i]);
        }

        for (var i = 0; i < this.ballsNow.length; i++) {
            updateBall(this.ballsNow[i]);
        }
    }

    update(){
        if (!gameObject.pause) {
            this.updateBallsNow();
            this.updateTimeline();
        }
    }

    draw(){
        for (var i = 0; i < this.ballsNow.length; i++) {
            for (var j = 0; j < this.ballsTimeline.length - 1; j++) {
                this.x0 = this.ballsTimeline[j][i].x     - gameObject.camera.pos[0];
                this.y0 = this.ballsTimeline[j][i].y     - gameObject.camera.pos[1];
                this.x1 = this.ballsTimeline[j+1][i].x   - gameObject.camera.pos[0];
                this.y1 = this.ballsTimeline[j+1][i].y   - gameObject.camera.pos[1];

                drawLine(this.x0, this.y0, this.x1, this.y1, this.ballsNow[i].color);
            }
        }
    }

}

class Ball {
    
    constructor(x, y, mass, radius, color, gravity = true, collision = true){
        this.pos = [x, y];
        this.vel = [0, 0];
        this.mass = mass;
        this.radius = radius;
        this.color = color;
        this.gravity = gravity;
        this.collision = collision;
    }

}

class Camera {

    constructor(pos = [0, 0], vel = [0, 0]){
        this.pos = pos;
        this.vel = vel;
        this.speed = 5;
    }

    moveToLeft(){
        this.vel[0] = -this.speed;
    }

    moveToRight(){
        this.vel[0] = this.speed;
    }

    moveToUp(){
        this.vel[1] = -this.speed;
    }

    moveToDown(){
        this.vel[1] = this.speed;
    }

    clearHorizontalMovement(){
        this.vel[0] = 0;
    }

    clearVerticalMovement(){
        this.vel[1] = 0;
    }

    addHorizontalIncrement(dx){
        this.pos[0] += dx;
    }

    addVerticalIncrement(dy){
        this.pos[1] += dy;
    }

    update(scale){
        this.pos[0] += scale * this.vel[0];
        this.pos[1] += scale * this.vel[1];
    }

}

class Projection {

    constructor(pos = [0, 0], radius = 50, color = 'blue'){
        this.pos = pos;
        this.radius = radius;
        this.color = color;
        this.nearBall = null;
        this.overBall = null;
        this.ballAccelerating = null;
        this.nearScreenX = 0;
        this.nearScreenY = 0;
        this.orbitRadius = 0;
        this.velAngle = 0;
        this.arrowMagnitude = 0;
    }

    setPosX(x){
        this.pos[0] = x;
    }

    setPosY(y){
        this.pos[1] = y;
    }

    setRadius(radius){
        this.radius = radius;
    }

    setColor(color){
        this.color = color;
    }

    draw(cameraPos, balls, scale, ballToOrbit){
        context.shadowBlur = 0;
        
        context.beginPath();
        context.ellipse(this.pos[0], this.pos[1], scale * 2, scale * 2, 0, 0, 2*Math.PI, false);
        context.fillStyle = this.color;
        context.fill();
        context.closePath();

        if (balls.length > 0) {
            if (ballToOrbit == null) {
                this.nearBall = getNearestBall(balls, this.pos[0] + cameraPos[0], this.pos[1] + cameraPos[1]);
            }else{
                this.nearBall = ballToOrbit;
            }
            this.nearScreenX = this.nearBall.pos[0] - cameraPos[0];
            this.nearScreenY = this.nearBall.pos[1] - cameraPos[1];

            context.lineCap = 'round';
            context.strokeStyle = this.color;
            context.lineWidth = 3 * scale;

            if (remove) {
                this.overBall = getBallInPos(this.pos[0] + cameraPos[0], this.pos[1] + cameraPos[1], balls);

                if (this.overBall != null) {
                    context.beginPath();
                    context.strokeStyle = 'red';
                    context.lineWidth = 3 * scale;
                    context.ellipse(this.overBall.pos[0] - cameraPos[0], this.overBall.pos[1] - cameraPos[1], this.overBall.radius + 10, this.overBall.radius + 10, 0, 0, 2*Math.PI, false);
                    context.closePath();
                    context.stroke();
                }
            
            }else if (inert) {
                this.overBall = getBallInPos(this.pos[0] + cameraPos[0], this.pos[1] + cameraPos[1], balls);

                if (this.overBall != null) {
                    context.beginPath();
                    context.strokeStyle = 'gray';
                    context.lineWidth = 3 * scale;
                    context.ellipse(this.overBall.pos[0] - cameraPos[0], this.overBall.pos[1] - cameraPos[1], this.overBall.radius + 10, this.overBall.radius + 10, 0, 0, 2*Math.PI, false);
                    context.closePath();
                    context.stroke();
                }

            }else if (move) {
                this.overBall = getBallInPos(this.pos[0] + cameraPos[0], this.pos[1] + cameraPos[1], balls);

                if (this.overBall != null) {
                    context.beginPath();
                    context.strokeStyle = 'yellow';
                    context.lineWidth = 3 * scale;
                    context.ellipse(this.overBall.pos[0] - cameraPos[0], this.overBall.pos[1] - cameraPos[1], this.overBall.radius + 10, this.overBall.radius + 10, 0, 0, 2*Math.PI, false);
                    context.closePath();
                    context.stroke();
                }

            }else if (accelerate) {
                this.ballAccelerating = gameObject.ballHandled;

                if (this.ballAccelerating != null){
                    this.velAngle = Math.PI - Math.atan2(this.ballAccelerating.pos[1] - gameObject.camera.pos[1] - this.pos[1], this.ballAccelerating.pos[0] - gameObject.camera.pos[0] - this.pos[0]);
                    this.arrowMagnitude = getDistance(this.pos[0], this.pos[1], this.ballAccelerating.pos[0] - gameObject.camera.pos[0], this.ballAccelerating.pos[1] - gameObject.camera.pos[1]);

                    drawArrow(this.ballAccelerating.pos[0] - gameObject.camera.pos[0], this.ballAccelerating.pos[1] - gameObject.camera.pos[1], this.arrowMagnitude, this.velAngle, this.color);
                }

            }else if (!orbit && !referential) {
                context.beginPath();
                context.moveTo(this.pos[0], this.pos[1]);
                context.lineTo(this.nearScreenX, this.nearScreenY);
                context.moveTo(this.nearScreenX, this.nearScreenY);
                context.lineTo(this.pos[0], this.nearScreenY);
                context.moveTo(this.pos[0], this.nearScreenY);
                context.lineTo(this.pos[0], this.pos[1]);
                context.stroke();
                context.closePath();
           
            }else if (referential) {
                this.overBall = getBallInPos(this.pos[0] + cameraPos[0], this.pos[1] + cameraPos[1], balls);

                if (this.overBall != null) {
                    context.beginPath();
                    context.strokeStyle = 'yellow';
                    context.lineWidth = 3 * scale;
                    context.ellipse(this.overBall.pos[0] - cameraPos[0], this.overBall.pos[1] - cameraPos[1], this.overBall.radius + 10, this.overBall.radius + 10, 0, 0, 2*Math.PI, false);
                    context.closePath();
                    context.stroke();
                }

            }else if (ballToOrbit == null){
                this.overBall = getBallInPos(this.pos[0] + cameraPos[0], this.pos[1] + cameraPos[1], balls);

                if (this.overBall != null) {
                    context.beginPath();
                    context.strokeStyle = 'blue';
                    context.lineWidth = 3 * scale;
                    context.ellipse(this.overBall.pos[0] - cameraPos[0], this.overBall.pos[1] - cameraPos[1], this.overBall.radius + 10, this.overBall.radius + 10, 0, 0, 2*Math.PI, false);
                    context.closePath();
                    context.stroke();
                }
            }else{
                this.orbitRadius = getDistance(this.pos[0], this.pos[1], this.nearScreenX, this.nearScreenY);
                this.velAngle = Math.PI / 2 - Math.atan2(this.nearScreenY - this.pos[1], this.nearScreenX - this.pos[0]);
                this.arrowMagnitude = 3000 * Math.sqrt(1 / this.orbitRadius);

                context.beginPath();
                context.moveTo(this.pos[0], this.pos[1]);
                context.lineTo(this.nearScreenX, this.nearScreenY);
                context.stroke();
                context.closePath();

                context.beginPath();
                context.ellipse(
                    this.nearScreenX, this.nearScreenY, 
                    this.orbitRadius, this.orbitRadius,
                    0,
                    0, 2*Math.PI,
                    false
                );
                context.stroke();
                context.closePath();

                drawArrow(this.pos[0], this.pos[1], this.arrowMagnitude, this.velAngle, this.color);
            }
        }

        if (radial) radialHandler.draw(this.pos[0], this.pos[1]);

        context.beginPath();
        context.ellipse(this.pos[0], this.pos[1], this.radius, this.radius, 0, 0, 2*Math.PI, false);
        context.strokeStyle = this.color;
        context.lineWidth = 3 * scale;
        context.stroke();
        context.closePath();
    }
}

class RadialHandler {

    constructor(R, n, G, m, radius, collision, color){
        this.updateValues(R, n, G, m, radius, collision, color);
    }

    updateValues(R, n, G, m, radius, collision, color){
        this.R = R;
        this.n = n;
        this.G = G;
        this.m = m;
        this.radius = radius;
        this.collision = collision;
        this.color = color;
    }

    calculateSigma(){
        var tempVector = [0, 0];

        for (var i = 1; i < this.n; i++) {
            var division = Math.pow(1 - Math.cos(2*Math.PI*i/this.n), 3/2);
            
            var vec = [
                Math.cos(2*Math.PI*i/this.n) - 1,
                Math.sin(2*Math.PI*i/this.n)
            ]

            vec[0] /= division;
            vec[1] /= division;

            tempVector = this.sumVectors(tempVector, vec);
        }

        return tempVector;
    }

    getRadialBallVelocity(sigma, i) {
        let constant = Math.sqrt((this.G * this.m)/(this.R * Math.sqrt(8))) 
        * Math.sqrt(this.vectorMagnitude(sigma));

        return [
            constant * -Math.sin((2*Math.PI/this.n) * i),
            constant * Math.cos((2*Math.PI/this.n) * i)
        ];
    }

    setRadialBallsVelocity(balls){
        var sigma = this.calculateSigma();

        balls.forEach((ball, index) => {
            let vel = this.getRadialBallVelocity(sigma, index + 1);

            ball[0] = vel[0];
            ball[1] = vel[1];
        });
    }

    getRadialBallsList(){
        var balls = [];
        var sigma = this.calculateSigma();

        for (var i = 1; i <= this.n; i++) {
            let position = this.getRadialBallsPosition(i);
            let vel = this.getRadialBallVelocity(sigma, i);
            let ball = new Ball(position[0], position[1], this.m, this.radius, this.color, true, this.collision);
            ball.vel[0] = vel[0];
            ball.vel[1] = vel[1];

            balls.push(ball);
        }

        return balls;
    }

    sumVectors(vec1, vec2){
        return [vec1[0] + vec2[0], vec1[1] + vec2[1]];
    }

    vectorMagnitude(vec){
        return getDistance(0, 0, vec[0], vec[1]);
    }

    getRadialBallsPosition(i){
        return [
            this.R * Math.cos((2*Math.PI/this.n) * i),
            this.R * Math.sin((2*Math.PI/this.n) * i)
        ]
    }

    draw(x, y){
        for (var i = 1; i <= this.n; i++) {
            var pos = this.getRadialBallsPosition(i);

            drawEllipse(x + pos[0], y + pos[1], this.radius, this.color);
        }
    }

}