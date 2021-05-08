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
    getForce() {
        return super.getMagnitude();
    }

    constructor(direction, sense, force, time) {
        super(force);
        super.setDirectionAndSense(direction, sense);
        this.time = time;
    }
}

class PhysicalObject {
    static #gravity = 9.8; //Earth's Gravity
    static #frictions_coefficient = 0.2; //Friction's coefficient

    static move(impulse) {
        let normalForce = this.weight * this.#gravity;
        switch(impulse.getDirection()) {
            case Direction.Horizontal:
                let friction = normalForce * this.#frictions_coefficient;
                let resultantForce = impulse.getForce() - friction;
                if(resultantForce > 0) {
                    switch(impulse.getSense()) {
                        case Sense.Left:
                            console.log("left");
                            break;
                        default:
                            console.log("right");
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

    draw(callback){
        return callback(this.#width, this.#height, this.#color);
    }

    constructor(rectangle) {
        this.#height = rectangle.height;
        this.#width = rectangle.width;
        this.#color = rectangle.color;
        this.validify();
    }
}

class Paddle extends Rectangle {
    #physicalObject;

    static #move(impulse) {
        this.#physicalObject.move(impulse);
    }

    build() {
        this.draw((width, height, color) => {
            console.log('width: ', width);
            console.log('height: ', height);
            console.log('color: ', color);
        });
    }

    constructor(paddle) {
        super(paddle.rectangle);
        this.#physicalObject = new PhysicalObject(paddle.position, paddle.weight);
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

window.onload = () => {
    let ingredients = Object.create(ingredientProto);

    ingredients.position.X = 0;
    ingredients.position.Y = 0;
    ingredients.weight = 50;
    ingredients.rectangle.height = 10;
    ingredients.rectangle.width = 20;
    ingredients.rectangle.color = "white";

    let paddle = new Paddle(ingredients);
    console.log(paddle);
};