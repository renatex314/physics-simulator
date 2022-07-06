var img = document.querySelector('img');
var cv = null;
var tx = null;

try {
    cv = fx.canvas();
    tx = cv.texture(img);
} catch (ignored) {}

if (tx != null) {
    window.addEventListener('load', function () {
        tx.loadContentsOf(img);
        cv.draw(tx);
        cv.update();
        cv.style.display = 'none';
        cv.style.position = 'fixed';
        cv.style.left = '0';
        cv.style.top = '0';
        img.parentNode.insertBefore(cv, img.nextSibling);
        //img.parentNode.removeChild(backCanvas);
    });
}

function makeDistortion(balls) {
    cv.draw(tx);
    for (var i = 0; i < balls.length; i++) {
        var pos = getPosInScreen(balls[i].pos[0], balls[i].pos[1]);
        cv.bulgePinch(pos[0], pos[1], (1/gameObject.scale) * balls[i].radius*2, -1);
    }
    cv.update();
}

function clearDistortion() {
    cv.draw(tx);
    cv.update();
}