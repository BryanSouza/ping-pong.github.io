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

function MyAnimation(update) {
    let startTime = null;
    let animationLength = 500;
    let raf;

    function animate(timestamp) {
        let progress = 0;

        if(startTime === null) {
            startTime = timestamp;
        } else {
            progress = timestamp - startTime;
        }

        if(progress < animationLength) {
            update();
            raf = window.requestAnimationFrame(animate);
        }
    }

    function Init(){
        raf = window.requestAnimationFrame(animate);
    }

    function clearAnimationFrame() {
        if(raf) {
            window.cancelAnimationFrame(raf);
            raf = null;
            startTime = null;
        }
    }

    return {
        Init,
        clearAnimationFrame
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

    draw(x, y) {
        stage.context.clearRect(0, 0, stage.width, stage.height);
        stage.context.beginPath();
        stage.context.rect(x, y, this.width, this.height);
        stage.context.fillStyle = this.color;
        stage.context.fill();
        stage.context.closePath();
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
        this.animation.Init();
    }

    moveLeft() {
        let leftImpulse = new Impulse(Direction.Horizontal, Sense.Left, 55, 7);
        this.#move(leftImpulse);
    }

    moveRight() {
        let rightImpulse = new Impulse(Direction.Horizontal, Sense.Right, 55, 7);
        this.#move(rightImpulse);
    }

    stop() {
        this.animation.clearAnimationFrame();
        this.#physicalObject.finalVelocityX = 0;
    }

    update(_this) {
        let x = _this.#physicalObject.currentPosition.X;
        let y = _this.#physicalObject.currentPosition.Y;
        let finalVelocityX = _this.#physicalObject.finalVelocityX;

        let boundaries = stage.getBoundaries(x, y, _this.width, _this.height, finalVelocityX, null);

        if(boundaries.axisX) {
            _this.#physicalObject.currentPosition.X -= finalVelocityX * 2.0;
        } else {
            _this.#physicalObject.currentPosition.X += finalVelocityX;
        }

        _this.draw(_this.#physicalObject.currentPosition.X, _this.#physicalObject.currentPosition.Y);
    }

    constructor(racket) {
        super(racket.rectangle);
        this.#physicalObject = new PhysicalObject(racket.position, racket.weight);
        this.animation = MyAnimation(() => this.update(this));
        this.draw(this.#physicalObject.currentPosition.X, this.#physicalObject.currentPosition.Y);
    }
}

class Stage extends HTMLCanvasElement {

    getBoundaries(x, y, width, height, velocityX, velocityY) {
        let axisX = false;

        if(x + velocityX < 0 || x + velocityX > stage.width - width) {
            axisX = true;
        } else {
            axisX = false;
        }

        return {
            axisX
        }
    }

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

    window.customElements.define('pingpong-table', Stage, { extends: "canvas"});

    globalThis.stage = document.querySelector("canvas[is='pingpong-table']");
    stage.focus();

    let ingredients = Object.create(ingredientProto);

    ingredients.position.X        = 125;
    ingredients.position.Y        = 135;
    ingredients.weight            = 25;
    ingredients.rectangle.height  = 2;
    ingredients.rectangle.width   = 50;
    ingredients.rectangle.color   = "#FF0000";

    let racket = new Racket(ingredients);

    stage.onkeydown = (event) => {
        switch(event.code) {
            case AllowedKeys.ARROW_LEFT:
                racket.moveLeft();
                break;
            case AllowedKeys.ARROW_RIGHT:
                racket.moveRight();
                break;
            default:
                return;
        }
    }

    stage.onkeyup = (event) => {
        if(event.code == AllowedKeys.ARROW_LEFT || event.code == AllowedKeys.ARROW_RIGHT) {
            racket.stop();
        }
    }

};