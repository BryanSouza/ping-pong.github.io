const Direction = {
    Vertical:   'VERTICAL',
    Horizontal: 'HORIZONTAL',
}

const Sense = {
    Up:     'UP',
    Down:   'DOWN',
    Left:   'LEFT',
    Right:  'RIGHT'
}

class Vector {
    #direction = Direction.Horizontal;
    #sense = Sense.Up;
    #magnitude;

    setDirectionAndSense(direction, sense) {
        switch(direction) {
            case Direction.Vertical:
                this.#direction = Direction.Vertical;
                if(sense == Sense.Up || sense == Sense.Down) {
                    this.#sense = sense;
                } else {
                    throw Error("Sense not found!🧭");
                }
                break;
            case Direction.Horizontal:
                this.#direction = Direction.Horizontal;
                if(sense == Sense.Left || sense == Sense.Right) {
                    this.#sense = sense;
                } else {
                    throw Error("Sense not found!🧭");
                }
                break;
            default:
                throw Error("Direction not found!🧭");
        }
    }

    getDirection() {
        return this.#direction;
    }

    getSense() {
        return this.#sense;
    }

    setMagnitude(magnitude) {
        this.#magnitude = magnitude;
    }

    getMagnitude() {
        return this.#magnitude;
    }

    constructor(magnitude) {
        this.#magnitude = magnitude;
    }
}

class Impulse extends Vector {
    constructor(direction, sense, force, time) {
        super(force);
        super.setDirectionAndSense(direction, sense);
        this.time = time;
    }
}

class PhysicalObject {
    #gravity = 9.8; //Earth's Gravity
    #frictions_coefficient = 0.2; //Friction's coefficient
    #initialVelocity = 0;

    move(impulse) {
        let normalForce = this.weight * this.#gravity;

        switch(impulse.getDirection()) {
            case Direction.Horizontal:
                let friction = normalForce * this.#frictions_coefficient;
                let resultantForce = impulse.getMagnitude() - friction;
                this.finalVelocityX = ( (resultantForce * impulse.time) / this.weight ) + this.#initialVelocity;

                if(this.finalVelocityX > 0) {
                    if(impulse.getSense() == Sense.Left) {
                        this.finalVelocityX *= -1;
                    }
                } else {
                    throw Error("The force to move the object should be greater than the friction force.");
                }
                break;
            default:
                switch(impulse.getSense()) {
                    case Sense.Up:
                        console.log("up");
                        break;
                    default:
                        console.log("down");
                        break;
                }
        }

    }

    constructor(position, weight) {
        this.currentPosition = Object.assign(position);
        this.weight = weight;
        this.finalVelocityX = 0;
    }
}

function RecAnimation(sync) {
    let objectToAnimate;
    let raf;

    function drawRect() {

        let x = objectToAnimate.physicalObject.currentPosition.X;
        let y = objectToAnimate.physicalObject.currentPosition.Y;
        let finalVelocityX = objectToAnimate.physicalObject.finalVelocityX;

        grandstand.context.clearRect(0, 0, 600, 700);
        grandstand.context.beginPath();
        grandstand.context.rect(x, y, objectToAnimate.width, objectToAnimate.height);
        grandstand.context.fillStyle = objectToAnimate.color;
        grandstand.context.fill();
        grandstand.context.closePath();

        if(x + finalVelocityX < 0 || x + finalVelocityX > grandstand.width - objectToAnimate.width) {
            objectToAnimate.physicalObject.currentPosition.X -= finalVelocityX * 1.45;
        } else {
            objectToAnimate.physicalObject.currentPosition.X += finalVelocityX;
        }

        raf = window.requestAnimationFrame(drawRect);
    }

    function refresh(newObj) {
        objectToAnimate = newObj;
    }

    function clearAnimationFrame() {
        if(raf) {
            console.log(objectToAnimate.physicalObject);
            window.cancelAnimationFrame(raf);
            objectToAnimate.physicalObject.finalVelocityX = 0;
            raf = null;
        }
    }

    return {
        drawRect,
        clearAnimationFrame,
        refresh
    }
}

class Rectangle {
    validify() {
        if(this.width !== 0 && this.height !== 0) {
            if(this.width === this.height) {
                throw Error("Height can't be equal to width!");
            }
        } else {
            throw Error("Neither height or width can't be 0!");
        }
    }

    getWidthAndHeight() {
        return {
            height: this.height,
            width: this.width
        }
    }

    constructor(rectangle) {
        this.height = rectangle.height;
        this.width = rectangle.width;
        this.color = rectangle.color;
        this.validify();
    }
}

class Racket extends Rectangle {
    #physicalObject;

    #move(impulse) {
        this.#physicalObject.move(impulse);
        this.animation.drawRect();
    }

    moveLeft() {
        let leftImpulse = new Impulse(Direction.Horizontal, Sense.Left, 55, 5);
        this.#move(leftImpulse);
    }

    moveRight() {
        let rightImpulse = new Impulse(Direction.Horizontal, Sense.Right, 55, 5);
        this.#move(rightImpulse);
    }

    clearAnimation() {
        this.animation.clearAnimationFrame();
    }

    syncAnimation() {
        let obj = {
            width: this.width,
            height: this.height,
            color: this.color,
            physicalObject: this.#physicalObject
        }
        this.animation.refresh(obj);
    }

    constructor(racket) {
        super(racket.rectangle);
        this.#physicalObject = new PhysicalObject(racket.position, racket.weight);
        this.animation = RecAnimation();
        this.syncAnimation();
        this.animation.drawRect();
    }
}

class Grandstand extends HTMLCanvasElement {
    constructor() {
        super();
        this.context = this.getContext("2d");
    }
}

const ingredientProto = {
    position: {X: null, Y: null},
    rectangle: {
        height: null,
        width: null,
        color: null
    }
};

const AllowedKeys = {
    ARROW_LEFT:   'ArrowLeft',
    ARROW_RIGHT:  'ArrowRight',
    ARROW_UP:     'ArrowUp',
    ARROW_DOWN:   'ArrowDown'
}

window.onload = () => {
    // Initiating Canvas
    window.customElements.define('pingpong-table', Grandstand, { extends: "canvas"});

    globalThis.grandstand = document.querySelector("canvas[is='pingpong-table']");

    let ingredients = Object.create(ingredientProto);

    ingredients.position.X        = 125;
    ingredients.position.Y        = 135;
    ingredients.weight            = 25;
    ingredients.rectangle.height  = 2;
    ingredients.rectangle.width   = 50;
    ingredients.rectangle.color   = "#FF0000";

    let racket = new Racket(ingredients);

    grandstand.onkeydown = (event) => {
        switch(event.code) {
            case AllowedKeys.ARROW_LEFT:
                racket.moveLeft();
                break;
            case AllowedKeys.ARROW_RIGHT:
                racket.moveRight();
                break;
            case AllowedKeys.ARROW_UP:
                console.log(Sense.Up);
                break;
            case AllowedKeys.ARROW_DOWN:
                console.log(Sense.Down);
                break;
            default:
                return;
        }
    }

    grandstand.onkeyup = (event) => {
        if(event.code == AllowedKeys.ARROW_LEFT || event.code == AllowedKeys.ARROW_RIGHT) {
            racket.clearAnimation();
        }
    }
};