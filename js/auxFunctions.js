//estas funções levam em conta que as variáveis de escopo global definidas no
//arquivo 'main.js' já foram definidas

function updateCanvasSize(){
    canvas.setAttribute('width', window.innerWidth);
    canvas.setAttribute('height', window.innerHeight);
}

function update2DContext(){
    context.resetTransform();
    context.translate(canvas.width / 2, canvas.height / 2);
    context.scale(1 / gameObject.scale, 1 / gameObject.scale);
}

function unlagger(){
    canvas.height = 0;

    setTimeout(function(){
        canvas.height = window.innerHeight;
        update2DContext();
    }, 100);
}

function getButton (name) {
    return document.querySelector(`input[name=${name}]`);
}

function drawLine(x0, y0, x1, y1, color) {
    context.beginPath();
    context.strokeStyle = color;
    context.lineWidth = 2 * gameObject.scale;
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.stroke();
    context.closePath();
}

function drawEllipse(x, y, radius, color){
    context.beginPath();
    context.strokeStyle = color;
    context.lineWidth = 2 * gameObject.scale;
    context.ellipse(x, y, radius, radius, 0, 0, 2*Math.PI, false);
    context.stroke();
    context.closePath();
}

var vertices = [
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0]
];
function drawArrow (x, y, magnitude, angle, color) {
    vertices[0][0] = x;
    vertices[0][1] = y;
    vertices[1][0] = magnitude;
    vertices[1][1] = 0;
    vertices[2][0] = magnitude - 20;
    vertices[2][1] = 20;
    vertices[3][0] = magnitude - 20;
    vertices[3][1] = -20;
    
    for (var i = 1; i < vertices.length; i++) {
        rotateAxesPerformatic(vertices[i][0], vertices[i][1], angle, vertices[i]);
        vertices[i][0] += x;
        vertices[i][1] += y;
    }

    context.beginPath();
    context.strokeStyle = color;
    context.lineWidth = 3 * gameObject.scale;
    context.moveTo(vertices[0][0], vertices[0][1]);
    context.lineTo(vertices[1][0], vertices[1][1]);
    context.moveTo(vertices[1][0], vertices[1][1]);
    context.lineTo(vertices[2][0], vertices[2][1]);
    context.moveTo(vertices[1][0], vertices[1][1]);
    context.lineTo(vertices[3][0], vertices[3][1]);
    context.stroke();
    context.closePath();
}

function drawBall (x, y, ball) {
    context.beginPath();
    context.ellipse(x, y, ball.radius, ball.radius, 0, 0, 2*Math.PI, false);
    context.fillStyle = ball.color;
    if (cinematic && brightness) {
        context.shadowBlur = 10;
        context.shadowColor = ball.color;
    }else{
        context.shadowBlur = 0;
    }
    context.fill();
    context.closePath();

    //console.log('teste');
}

var bp = null;
function getBallInPos (x, y, balls) {
    for (let i = 0; i < balls.length; i++) {
        bp = balls[i];

        if (bp.pos[0] - bp.radius <= x && x <= bp.pos[0] + bp.radius &&
            bp.pos[1] - bp.radius <= y && y <= bp.pos[1] + bp.radius) return bp;
    }

    return null;
}

function getPosInScreen (x, y) {
    return [
        (x - gameObject.camera.pos[0]) / gameObject.scale + window.innerWidth / 2,
        (y - gameObject.camera.pos[1]) / gameObject.scale + window.innerHeight / 2
    ];
}

function getPosXInScreen (x) {
    return (x - gameObject.camera.pos[0]) / gameObject.scale + window.innerWidth / 2;
}

function getPosYInScreen (y) {
    return (y - gameObject.camera.pos[1]) / gameObject.scale + window.innerHeight / 2;
}

function getDistance (x0, y0, x1, y1) {
    return Math.sqrt((x1 - x0)*(x1 - x0) + (y1 - y0)*(y1 - y0));
}

function getDistanceOfBalls (ball1, ball2) {
    return getDistance(ball1.pos[0], ball1.pos[1], ball2.pos[0], ball2.pos[1]);
}

function getFuturePos (ball) {
    return [
        ball.pos[0] + ball.vel[0],
        ball.pos[1] + ball.vel[1]
    ];
}

function getFuturePosPerformatic (ball, array) {
    array[0] = ball.pos[0] + ball.vel[0];
    array[1] = ball.pos[1] + ball.vel[1];
}

function sigmoid(z) {
    return 1 / (1 + Math.exp(-z));
}

function rotateAxes (x, y, angle) {
    return [
        x * Math.cos(angle) + y * Math.sin(angle),
        -x * Math.sin(angle) + y * Math.cos(angle)
    ]
}

function rotateAxesPerformatic (x, y, angle, array) {
    array[0] = x * Math.cos(angle) + y * Math.sin(angle);
    array[1] = -x * Math.sin(angle) + y * Math.cos(angle);
}

function getGravityForce (pos1, mass1, pos2, mass2) {
    return (mass1*mass2)/Math.pow(getDistance(pos1[0], pos1[1], pos2[0], pos2[1]), 2);
}

function getGravityForcePerformatic (mass1, mass2, distance) {
    return 10 * (mass1*mass2)/(distance*distance);
}

function getOrbitalVelocity (ballToOrbit, ballOrbiting) {
    let distance = getDistance(
        ballToOrbit.pos[0], ballToOrbit.pos[1],
        ballOrbiting.pos[0], ballOrbiting.pos[1]
    );
    
    let angle = Math.atan2(
        ballToOrbit.pos[1] - ballOrbiting.pos[1],
        ballToOrbit.pos[0] - ballOrbiting.pos[0]
    );

    let gravityAccel = getGravityForcePerformatic(ballToOrbit.mass, ballOrbiting.mass, distance)/ballOrbiting.mass;
    let orbitSpeed = Math.sqrt(gravityAccel*distance);
    let velocity = rotateAxes(orbitSpeed, 0, Math.PI / 2 - angle);
    velocity[0] += ballToOrbit.vel[0];
    velocity[1] += ballToOrbit.vel[1];
    return velocity;
}

function getNearestBall (balls, x, y) {
    let nearBall = balls[0];
    let nearDistance = getDistance(x, y, balls[0].pos[0], balls[0].pos[1]);

    for (let i = 1; i < balls.length; i++) {
        let b = balls[i];
        let bDistance = getDistance(x, y, b.pos[0], b.pos[1]);
        
        if (bDistance < nearDistance) {
            nearBall = b;
            nearDistance = bDistance;
        }
    }

    return nearBall;
}

function applyOrbitalVelocityToNearest (balls, ball) {
    let nearBall = getNearestBall(balls, ball.pos[0], ball.pos[1]);
    let orbitalVelocity = getOrbitalVelocity(nearBall, ball);
    ball.vel[0] = orbitalVelocity[0];
    ball.vel[1] = orbitalVelocity[1];
}

function applyOrbitalVelocityToBall (ballToOrbit, ballOrbiting) {
    let orbitalVelocity = getOrbitalVelocity(ballToOrbit, ballOrbiting);
    ballOrbiting.vel[0] = orbitalVelocity[0];
    ballOrbiting.vel[1] = orbitalVelocity[1];
}

function applyAcceleration(ball) {
    var mouseX = gameObject.eventFunction.prevMousePos[0];
    var mouseY = gameObject.eventFunction.prevMousePos[1];

    var dx = (ball.pos[0] - gameObject.camera.pos[0]) - mouseX;
    var dy = (ball.pos[1] - gameObject.camera.pos[1]) - mouseY;

    ball.vel[0] -= dx / 5000;
    ball.vel[1] -= dy / 5000;
}

function updateBall(ball){
    ball.pos[0] += ball.vel[0];
    ball.pos[1] += ball.vel[1];
}

var gravityForce;
var angle;
var components = [0, 0];
var bg;
var distance;
function applyGravity (balls, ball) {
    for (var i = 0; i < balls.length; i++) {
        bg = balls[i];
        distance = getDistance(ball.pos[0], ball.pos[1], bg.pos[0], bg.pos[1]);

        if (bg != ball && distance > ball.radius + bg.radius && bg.gravity && ball.gravity) {
            gravityForce = getGravityForcePerformatic(ball.mass, bg.mass, distance) / (ball.mass);
            angle = Math.atan2(bg.pos[1] - ball.pos[1], bg.pos[0] - ball.pos[0]);
            rotateAxesPerformatic(gravityForce, 0, -angle, components);

            ball.vel[0] += components[0];
            ball.vel[1] += components[1];
        }
    }
}

function getCollisionSpeeds (v1, mass1, v2, mass2) {
    return [
        ((mass1 - mass2)/(mass1 + mass2))*v1 + (2*mass2/(mass1 + mass2))*v2,
        ((mass2 - mass1)/(mass2 + mass1))*v2 + (2*mass1/(mass2 + mass1))*v1
    ]
}

function getFuturePos (ball) {
    return [
        ball.pos[0] + ball.vel[0],
        ball.pos[1] + ball.vel[1]
    ];
}

var coll;
var angle;
var vel0 = [0, 0];
var vel1 = [0, 0];
var prePos0 = [0, 0];
var prePos1 = [0, 0];
var b;
var speeds;
function applyCollisions (balls, ball) {
    for (var i = 0; i < balls.length; i++) {
        b = balls[i];
        getFuturePosPerformatic(ball, prePos0);
        getFuturePosPerformatic(b, prePos1);

        if (ball != b && getDistance(prePos0[0], prePos0[1], prePos1[0], prePos1[1]) <= ball.radius + b.radius && b.collision && ball.collision) {
            angle = Math.atan2(b.pos[1] - ball.pos[1], b.pos[0] - ball.pos[0]);
            
            rotateAxesPerformatic(ball.vel[0], ball.vel[1], angle, vel0);
            rotateAxesPerformatic(b.vel[0], b.vel[1], angle, vel1);
            speeds = getCollisionSpeeds(vel0[0], ball.mass, vel1[0], b.mass);

            vel0[0] = speeds[0];
            vel1[0] = speeds[1];

            rotateAxesPerformatic(vel0[0], vel0[1], -angle, vel0);
            rotateAxesPerformatic(vel1[0], vel1[1], -angle, vel1);

            ball.vel[0] = vel0[0];
            ball.vel[1] = vel0[1];
            b.vel[0] = vel1[0];
            b.vel[1] = vel1[1];

            ball.pos[0] += vel0[0] / 10;
            ball.pos[1] += vel0[1] / 10;
            b.pos[0] += vel1[0] / 10;
            b.pos[1] += vel1[1] / 10;
        }
    }
}

var settingsGUI = document.querySelector('.settings');
function collidingWithGUI (x, y) {
    const GUIstyle = getComputedStyle(settingsGUI);
    const left = parseInt(GUIstyle.left);
    const right = 32 + left + parseInt(GUIstyle.width);
    const top = parseInt(GUIstyle.top);
    const bottom = top + parseInt(GUIstyle.height);

    return (x >= left && x <= right && y <= bottom && y >= top);
}