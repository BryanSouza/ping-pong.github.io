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

const Cast = {
    Ball: 'Circle',
    Racket: 'Rectangle'
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
        this.lastImpulse = impulse;
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
                let velocityY = (impulse.getMagnitude() * impulse.time) / this.weight;
                if(impulse.getSense() == Sense.Up) {
                    this.finalVelocityY = velocityY * -1;
                } else {
                    this.finalVelocityY = velocityY;
                }
        }
        this.impulseStack.push(this.lastImpulse);
    }

    setVelocity(x, y) {
        this.finalVelocityX = x;
        this.finalVelocityY = y;
    }

    constructor(position, weight) {
        this.currentPosition = Object.assign(position);
        this.weight = weight;
        this.finalVelocityX = 0;
        this.finalVelocityY = 0;
        this.lastImpulse = null;
        this.impulseStack = [];
    }
}

function MyAnimation(update) {
    let raf = null;
    let fpsInterval, startTime, now, then, elapsed;

    function animate() {

        now = Date.now();

        if(then === undefined) {
            elapsed = now - startTime;
        } else {
            // calculate elapsed time using a new starting point
            elapsed = now - then; 
        }

        if(elapsed > fpsInterval) {
            // set a new starting point at this precise moment
            then = now - (elapsed % fpsInterval);
            update();
        }
        
        raf = window.requestAnimationFrame(animate);
    }

    function Init(fps) {
        fpsInterval = 1000 / fps;
        startTime = Date.now();

        raf = window.requestAnimationFrame(animate);
    }

    function clearAnimationFrame() {
        if(raf) {
            window.cancelAnimationFrame(raf);
            raf = null;
        }
    }

    return {
        Init,
        clearAnimationFrame,
    }
}

class Circle {

    validify() {
        if(this.radius < 0) {
            throw Error("The radius should be greater than 0.");
        }
    }
    
    draw(x, y) {
        stage.context.beginPath();
        stage.context.arc(x, y, this.radius, this.startAngle, this.endAngle);
        stage.context.fillStyle = this.color;
        stage.context.fill();
        stage.context.strokeStyle = "#453dd9";
        stage.context.stroke();
        stage.context.closePath();
    }

    constructor(circle) {
        this.radius = circle.radius;
        this.color = circle.color;
        this.startAngle = 0;
        this.endAngle = Math.PI * 2; // 360 degrees in radians
        this.validify();
    }

}

class Ball extends Circle {
    #physicalObject;

    update() {
        let x = this.#physicalObject.currentPosition.X;
        let y = this.#physicalObject.currentPosition.Y;
        let finalVelocityX = this.#physicalObject.finalVelocityX;
        let finalVelocityY = this.#physicalObject.finalVelocityY;
        
        let boundaries = stage.getBoundaries(x, y, null, null, finalVelocityX, finalVelocityY, this.radius, Cast.Ball);

        if(boundaries.axisX || boundaries.axisY) {
            this.reset(boundaries.axisX);
        }

        this.#physicalObject.currentPosition.X += finalVelocityX;
        this.#physicalObject.currentPosition.Y += finalVelocityY;
        
        this.draw(this.#physicalObject.currentPosition.X, this.#physicalObject.currentPosition.Y);
    }

    moveUp(impulse, racketImpulse) {
        this.#physicalObject.impulseStack = [];
        this.#physicalObject.move(impulse);
        if(racketImpulse) {
            let sense = racketImpulse.getSense();
            let newImpulse = new Impulse(Direction.Horizontal, sense, 45, 1);
            this.#physicalObject.move(newImpulse);
        }
    }

    moveDown(impulse, racketImpulse) {
        this.#physicalObject.impulseStack = [];
        this.#physicalObject.move(impulse);
        if(racketImpulse) {
            let sense = racketImpulse.getSense();
            let newImpulse = new Impulse(Direction.Horizontal, sense, 45, 1);
            this.#physicalObject.move(newImpulse);
        }
    }

    enter() {
        this.draw(this.#physicalObject.currentPosition.X, this.#physicalObject.currentPosition.Y);
    }

    reset(axisX) {
        this.#physicalObject.finalVelocityX = 0;
        this.#physicalObject.finalVelocityY = 0;
        this.#physicalObject.currentPosition.X = stage.width / 2;
        if(this.#physicalObject.impulseStack.length >= 1) {
            let lastImpulse = this.#physicalObject.lastImpulse;
            let lastImpulseDirection = lastImpulse.getDirection();
            if(lastImpulseDirection !== Direction.Vertical) {
                let verticalImpulses = this.#physicalObject.impulseStack.filter((i) => i.getDirection() === Direction.Vertical);
                let lastVerticalImpulse = verticalImpulses[verticalImpulses.length - 1];
                let sense = lastVerticalImpulse.getSense();
                if(axisX) {
                    let newSense = sense == Sense.Up ? Sense.Down : Sense.Up;
                    this.#respawn(newSense, 10);
                } else {
                    this.#respawn(sense, 40);
                }
            } else {
                let sense = lastImpulse.getSense();
                this.#respawn(sense);
            }
        }
        globalThis.isRunning = false;
    }

    #respawn(sense, difference = 0) {
        if(sense === Sense.Down) {
            globalThis.PlayerOne++;
            this.#physicalObject.currentPosition.Y = 100 - difference;
        } else if (sense === Sense.Up) {
            globalThis.PlayerTwo++;
            this.#physicalObject.currentPosition.Y = 600 + difference;
        }
    }

    getPosition() {
        return this.#physicalObject.currentPosition;
    }

    constructor(ball) {
        super(ball.circle);
        this.#physicalObject = new PhysicalObject(ball.position, ball.weight);
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
    }

    moveLeft() {
        let leftImpulse = new Impulse(Direction.Horizontal, Sense.Left, 65, 7);
        this.#move(leftImpulse);
    }

    moveRight() {
        let rightImpulse = new Impulse(Direction.Horizontal, Sense.Right, 65, 7);
        this.#move(rightImpulse);
    }

    update() {
        let x = this.#physicalObject.currentPosition.X;
        let y = this.#physicalObject.currentPosition.Y;
        let finalVelocityX = this.#physicalObject.finalVelocityX;

        let boundaries = stage.getBoundaries(x, y, this.width, this.height, finalVelocityX, null, null, Cast.Racket);

        if(boundaries.axisX) {
            this.#physicalObject.currentPosition.X -= finalVelocityX * 2.0;
        } else {
            this.#physicalObject.currentPosition.X += finalVelocityX;
        }

        this.draw(this.#physicalObject.currentPosition.X, this.#physicalObject.currentPosition.Y);
    }

    enter() {
        this.draw(this.#physicalObject.currentPosition.X, this.#physicalObject.currentPosition.Y);
    }

    getLastImpulse() {
        return this.#physicalObject.lastImpulse;
    }

    getPosition() {
        return this.#physicalObject.currentPosition;
    }

    getVelocityX() {
        return this.#physicalObject.finalVelocityX;
    }

    getVelocityY() {
        return this.#physicalObject.finalVelocityY;
    }

    constructor(racket) {
        super(racket.rectangle);
        this.#physicalObject = new PhysicalObject(racket.position, racket.weight);
    }
}

class Stage extends HTMLCanvasElement {

    getBoundaries(x, y, width, height, velocityX, velocityY, radius, actor) {
        let axisX = false;
        let axisY = false;

        if(actor === Cast.Racket) {
            if(x + velocityX < 0 || x + velocityX > stage.width - width) {
                axisX = true;
            }

            if(y + velocityY < 0 || y + velocityY > stage.width - height) {
                axisY = true;
            }
        } else if (actor === Cast.Ball) {
            // The center of the circle corresponds to the position X and Y.
            if(x + velocityX < radius || x + velocityX > stage.width - radius) {
                axisX = true;
            }

            if(y + velocityY < radius || y + velocityY > stage.height - radius) {
                axisY = true;
            }
        }

        return {
            axisX,
            axisY
        }
    }

    openTheCurtains() {
        this.context.clearRect(0, 0, stage.width, stage.height);
    }

    callActors(racketOne, racketTwo, ball) {
        this.racketOne = racketOne;
        this.racketTwo = racketTwo;
        this.ball = ball;

        this.racketOne.enter();
        this.racketTwo.enter();
        this.ball.enter();
        this.animation.Init(100); // 100 frames per second
    }

    detectCollision(racket, isPlayerOne=false) {
        let ballHasCollided = false;

        let rec = {
            height: racket.height,
            width: racket.width,
            position: racket.getPosition()
        };

        let circle = {
            radius: this.ball.radius,
            position: this.ball.getPosition()
        };

        if(isPlayerOne) {
            if(circle.position.Y + circle.radius >= rec.position.Y &&
                circle.position.Y - circle.radius < rec.position.Y + rec.height) {
                if(circle.position.X + circle.radius >= rec.position.X &&
                    circle.position.X - circle.radius <= rec.position.X + rec.width) {
                    ballHasCollided = true;
                }
            }
        } else {
            if(circle.position.Y - circle.radius <= rec.position.Y + rec.height &&
                circle.position.Y + circle.radius > rec.position.Y) {
                if(circle.position.X + circle.radius >= rec.position.X &&
                    circle.position.X - circle.radius <= rec.position.X + rec.width) {
                    ballHasCollided = true;
                }
            }
        }
        
        return ballHasCollided;
    }

    start(_this) {
        _this.openTheCurtains();
        _this.racketOne.update();
        _this.racketTwo.update();

        let hasRacketOneCollided = _this.detectCollision(_this.racketOne, true);

        if(hasRacketOneCollided) {
            let impulse = new Impulse(Direction.Vertical, Sense.Up, 60, 2);
            let racketImpulse = _this.racketOne.getLastImpulse();
            _this.ball.moveUp(impulse, racketImpulse);
        }

        let hasRacketTwoCollided = _this.detectCollision(_this.racketTwo);

        if(hasRacketTwoCollided) {
            let impulse = new Impulse(Direction.Vertical, Sense.Down, 60, 2);
            let racketImpulse = _this.racketTwo.getLastImpulse();
            _this.ball.moveDown(impulse, racketImpulse);
        }

        _this.ball.update();
    }

    constructor() {
        super();
        this.context = this.getContext("2d");
        this.animation = MyAnimation(() => this.start(this));
    }
}

const BallModel = {
    position: {X: null, Y: null},
    circle: {
        radius: null,
        color: null,
    }
};

const AllowedKeys = {
    ARROW_LEFT:   'ArrowLeft',
    ARROW_RIGHT:  'ArrowRight',
    ARROW_UP:     'ArrowUp',
    KEY_A: 'KeyA',
    KEY_S: 'KeyS',
    KEY_D: 'KeyD',
}

window.onload = () => {

    window.customElements.define('pingpong-table', Stage, { extends: "canvas"});

    globalThis.stage = document.querySelector("canvas[is='pingpong-table']");
    stage.focus();

    let racketOneProprieties = {
        weight: 25,
        rectangle: {
            height: 10,
            width: 100,
            color: "#FF0000"
        },
        position: {
            X: stage.width/2 - 50,
            Y: 650
        }
    };

    let racketOne = new Racket(racketOneProprieties);

    let racketTwoProprieties = {
        weight: 25,
        rectangle: {
            height: 10,
            width: 100,
            color: "#FF0000",
        },
        position: {
            X: stage.width/2 - 50,
            Y: 40
        }
    };

    let racketTwo = new Racket(racketTwoProprieties);

    let ballProprieties = {
        weight: 10,
        position: {X: stage.width/2, Y: 630},
        circle: {
            radius: 10,
            color: "#342EAD",
        }
    };

    let ball = new Ball(ballProprieties);

    stage.callActors(racketOne, racketTwo, ball);
    globalThis.isRunning = false;

    // Initial Score
    globalThis.PlayerOne = 0;
    globalThis.PlayerTwo = 0;

    stage.onkeydown = (event) => {
        switch(event.code) {
            case AllowedKeys.ARROW_LEFT:
                racketOne.moveLeft();
                break;
            case AllowedKeys.ARROW_RIGHT:
                racketOne.moveRight();
                break;
            case AllowedKeys.KEY_A:
                racketTwo.moveLeft();
                break;
            case AllowedKeys.KEY_D:
                racketTwo.moveRight();
                break;
            default:
                return;
        }
    }

    stage.onkeyup = (event) => {
        if(event.code == AllowedKeys.ARROW_UP) {
            if(!globalThis.isRunning) {
                let racketLastPosition = racketOne.getPosition();
                if(ballProprieties.position.X + ballProprieties.circle.radius >= racketLastPosition.X &&
                    ballProprieties.position.X - ballProprieties.circle.radius <= racketLastPosition.X + racketOneProprieties.rectangle.width) {
                    let impulse = new Impulse(Direction.Vertical, Sense.Up, 70, 2);
                    let racketImpulse = racketOne.getLastImpulse();
                    ball.moveUp(impulse, racketImpulse);
                    globalThis.isRunning = true;
                }
            }
        } else if (event.code ==  AllowedKeys.KEY_S) {
            if(!globalThis.isRunning) {
                let racketLastPosition = racketTwo.getPosition();
                if(ballProprieties.position.X + ballProprieties.circle.radius >= racketLastPosition.X &&
                    ballProprieties.position.X - ballProprieties.circle.radius <= racketLastPosition.X + racketOneProprieties.rectangle.width) {
                    let impulse = new Impulse(Direction.Vertical, Sense.Down, 70, 2);
                    let racketImpulse = racketTwo.getLastImpulse();
                    ball.moveDown(impulse, racketImpulse);
                    globalThis.isRunning = true;
                }
            }
        }
    }

};