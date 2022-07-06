//arquivo de inicialização
let canvas          = document.querySelector('#canvas');
let context         = canvas.getContext('2d');
let cinematic       = false;
let brightness      = true;
let distortion      = true;
let accelerate      = false;
let inert           = false;
let move            = false;
let remove          = false;
let orbit           = false;
let radial          = false;
let gravity         = true;
let collision       = true;
let projection      = true;
let predict         = false;
let referential     = false;
let gameObject;
let predictor;
let radialHandler;

let settings = document.querySelectorAll('input[tipo=switch]');
settings.forEach(button => button.swapState = () => {
    let name = button.name;
    let state = button.getAttribute('state') == 'true';
    
    button.setAttribute('state', !state);
    button.value = `${name}: ${!state ? 'sim' : 'não'}`;
});

const cameraPos         = document.querySelector('.camerapos');
const pauseButton       = getButton('pausar');
const cinematicButton   = getButton('cinemático');
const brightButton      = getButton('brilho');
const distortionButton  = getButton('distorção');
const accelerateButton  = getButton('acelerar');
const inertButton       = getButton('inerciar');
const moveButton        = getButton('mover');
const removeButton      = getButton('remover');
const orbitButton       = getButton('orbitar');
const radialButton      = getButton('radial');
const orbitRadiusButton = getButton('orbitradius');
const oradiusDisplay    = document.querySelector('.oradiusdisplay');
const orbitNumberButton = getButton('orbitnumber');
const onumberDisplay    = document.querySelector('.numberdisplay');
const gravityButton     = getButton('gravidade');
const collisionButton   = getButton('colisão');
const referentialButton = getButton('referencial');
const projectionButton  = getButton('projeção');
const predictButton     = getButton('previsao');
const prevSlider        = getButton('prevrange');
const prevDisplay       = document.querySelector('.prevdisplay');
const prevPrecision     = getButton('prevprecision');
const precisionDisplay  = document.querySelector('.precisiondisplay');
const colorSelect       = document.querySelector('#cor');
const massInput         = getButton('massa');
const radInput          = getButton('raio');
const clearButton       = getButton('resetar');

collisionButton.addEventListener('click', () => {
    collision = !collision;
    collisionButton.swapState();

    radialHandler.collision = collision;
});
gravityButton.addEventListener('click', () => {
    gravity = !gravity;
    gravityButton.swapState();
});
referentialButton.addEventListener('click', () => {
    referential = !referential;

    if (referential == false) {
        gameObject.clearReferential();
    }

    referentialButton.swapState();
});
massInput.addEventListener('input', () => {
    if (massInput.value == '' || isNaN(massInput.value)) {
        massInput.value = '0';
    }

    radialHandler.m = massInput.value;
});
radInput.addEventListener('input', () => {
    if (isNaN(radInput.value)) {
        radInput.value = '0';
    }

    let value = parseFloat(radInput.value);

    if (value < 0) {
        radInput.value = '';
    }

    if (value < 2) {
        value = 2;
    }

    radialHandler.radius = value;
    gameObject.projection.radius = parseFloat(radInput.value);
});
colorSelect.addEventListener('change', () => {
    gameObject.projection.color = colorSelect.value;

    radialHandler.color = colorSelect.value;
});
projectionButton.addEventListener('click', () => {
    projection = !projection;

    projectionButton.swapState();
});
predictButton.addEventListener('click', () => {
    predict = !predict;

    if (predict) {
        predictor.startPredict(prevSlider.value);
    }

    predictButton.swapState();
});
prevSlider.addEventListener('input', () => {
    prevDisplay.innerHTML = `${prevSlider.value}s`;

    predictor.updateSeconds(prevSlider.value);
});
prevPrecision.addEventListener('input', () => {
    var value = prevPrecision.max - prevPrecision.value + 1;

    precisionDisplay.innerHTML = `precisão: ${prevPrecision.value}`;

    predictor.updateStep(value);
});
orbitNumberButton.addEventListener('input', () => {
    onumberDisplay.innerHTML = `número de planetas: ${orbitNumberButton.value}`;

    radialHandler.n = orbitNumberButton.value;
});
orbitRadiusButton.addEventListener('input', () => {
    oradiusDisplay.innerHTML = `raio da órbita: ${orbitRadiusButton.value}`;

    radialHandler.R = orbitRadiusButton.value;
});

pauseButton.addEventListener('click', () => {gameObject.pause = !gameObject.pause; pauseButton.swapState()});
clearButton.addEventListener('click', () => {gameObject.clear()});
cinematicButton.addEventListener('click', () => {
    if (tx != null) {
        cinematic = !cinematic;

        if (cinematic) {
            cv.style.display = 'unset';
        }else{
            cv.style.display = 'none';
        }

        cinematicButton.swapState();
    }else{
        alert('seu navegador ou dispositivo não tem suporte a este recurso.');
    }
});
brightButton.addEventListener('click', () => {
    brightness = !brightness;
    brightButton.swapState();
});
distortionButton.addEventListener('click', () => {
    distortion = !distortion;

    if (!distortion && tx != null) {
        clearDistortion();
    }

    distortionButton.swapState();
});
moveButton.addEventListener('click', () => {
    move = !move;

    moveButton.swapState();
});
removeButton.addEventListener('click', () => {
    remove = !remove;

    removeButton.swapState();
});
radialButton.addEventListener('click', () => {
    radial = !radial;

    radialButton.swapState();
});
accelerateButton.addEventListener('click', () => {
    accelerate = !accelerate;

    accelerateButton.swapState();
});
inertButton.addEventListener('click', () => {
    inert = !inert;

    inertButton.swapState();
});
orbitButton.addEventListener('click', () => {
    orbit = !orbit;

    orbitButton.swapState();
});

gameObject = new Game(() => {
    return {
        'mass': parseFloat(massInput.value),
        'radius': parseFloat(radInput.value),
        'color': colorSelect.value
    }
});
predictor = new Predictor(7);
radialHandler = new RadialHandler(orbitRadiusButton.value, orbitNumberButton.value, 10, 100, 50, true, 'blue');
////////////////////////////////////////////////////////

document.addEventListener('contextmenu', e => {
    e.preventDefault();
});

window.addEventListener('resize', () => {
    updateCanvasSize();
    update2DContext();
});

document.addEventListener('wheel', e => {
    if (!collidingWithGUI(e.x, e.y)) {
        if (e.deltaY > 0) {
            gameObject.scale *= 1.3;
        }
        if (e.deltaY < 0) {
            gameObject.scale /= 1.3;
        }
    }

    update2DContext();
});

document.addEventListener('mouseup', e => gameObject.handleEvents(
        'mouseup', 
        gameObject.scale * (e.x - window.innerWidth / 2), 
        gameObject.scale * (e.y - window.innerHeight / 2),
        e.button
    )
);

document.addEventListener('mousedown', e => {
        gameObject.handleEvents(
            'mousedown', 
            gameObject.scale * (e.x - window.innerWidth / 2), 
            gameObject.scale * (e.y - window.innerHeight / 2),
            e.button
        );
    }
);

document.addEventListener('mousemove', e => gameObject.handleEvents(
        'mousemove', 
        gameObject.scale * (e.x - window.innerWidth / 2), 
        gameObject.scale * (e.y - window.innerHeight / 2)
    )
);

document.addEventListener('keydown', e => {
    gameObject.handleEvents('keydown', e.key);

    if (e.key == 'q' || e.key == 'e'){
        update2DContext();
    }
});

document.addEventListener('keyup', e => gameObject.handleEvents('keyup', e.key));

updateCanvasSize();
update2DContext();

function gameLoop(){
    context.clearRect(
        -gameObject.scale * canvas.width / 2, 
        -gameObject.scale * canvas.height / 2, 
        gameObject.scale * canvas.width, 
        gameObject.scale * canvas.height
    );

    gameObject.update();
    if (predict) predictor.update();
    if (predict) predictor.draw();
    gameObject.draw();
    if (cinematic && distortion && tx != null) makeDistortion(gameObject.balls);

    requestAnimationFrame(gameLoop);
}

gameLoop();