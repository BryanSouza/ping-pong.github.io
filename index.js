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
    #raf;

    move(impulse, context) {
        let normalForce = this.weight * this.#gravity;
        let finalVelocity;

        switch(impulse.getDirection()) {
            case Direction.Horizontal:
                let friction = normalForce * this.#frictions_coefficient;
                let resultantForce = impulse.getMagnitude() - friction;
                if(resultantForce > 0) {

                    finalVelocity = ( (impulse.getMagnitude() * impulse.time) / this.weight ) + this.#initialVelocity;

                    let object = context.getWidthAndHeight();
                    switch(impulse.getSense()) {
                        case Sense.Left:
                            if( !(this.currentPosition.X - finalVelocity < 5) ) {
                                this.currentPosition.X -= finalVelocity;
                                this.#raf = window.requestAnimationFrame(()=> { context.drawRect(grandstand.context, this.currentPosition) });
                            }
                            break;
                        default:
                            if( !(this.currentPosition.X + finalVelocity > grandstand.width - object.width) ) {
                                this.currentPosition.X += finalVelocity;
                                this.#raf = window.requestAnimationFrame(()=> { context.drawRect(grandstand.context, this.currentPosition) });
                            }
                            break;
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

    clearAnimationFrame() {
        if(this.#raf) {
            console.log('canceling animation frame: ', this.#raf);
            window.cancelAnimationFrame(this.#raf);
            this.#raf = null;
        }
    }

    constructor(position, weight) {
        this.currentPosition = Object.assign(position);
        this.weight = weight;
    }
}

class Rectangle {
    #width;
    #height;
    #color;

    validify() {
        if(this.#width !== 0 && this.#height !== 0) {
            if(this.#width === this.#height) {
                throw Error("Height can't be equal to width!");
            }
        } else {
            throw Error("Neither height or width can't be 0!");
        }
    }

    getWidthAndHeight() {
        return {
            height: this.#height,
            width: this.#width
        }
    }

    drawRect(context, position) {
        context.clearRect(0, 0, 600, 700);
        context.beginPath();
        context.rect(position.X, position.Y, this.#width, this.#height);
        context.fillStyle = this.#color;
        context.fill();
        context.closePath();
    }

    constructor(rectangle) {
        this.#height = rectangle.height;
        this.#width = rectangle.width;
        this.#color = rectangle.color;
        this.validify();
    }
}

class Racket extends Rectangle {
    #physicalObject;

    #move(impulse) {
        this.#physicalObject.move(impulse, this);
    }

    moveLeft() {
        let leftImpulse = new Impulse(Direction.Horizontal, Sense.Left, 50, 5);
        this.#move(leftImpulse);
    }

    moveRight() {
        let rightImpulse = new Impulse(Direction.Horizontal, Sense.Right, 50, 5);
        this.#move(rightImpulse);
    }

    clearAnimation() {
        this.#physicalObject.clearAnimationFrame();
    }

    constructor(racket) {
        super(racket.rectangle);
        this.#physicalObject = new PhysicalObject(racket.position, racket.weight);
        this.drawRect(grandstand.context, this.#physicalObject.currentPosition)
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
                setTimeout(() => {
                    racket.moveLeft();
                }, 10);
                racket.clearAnimation();
                break;
            case AllowedKeys.ARROW_RIGHT:
                setTimeout(() => {
                    racket.moveRight();
                }, 10);
                racket.clearAnimation();
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
};