/// <reference path="../../ts/type.d.ts"/>

class GamePlayer extends GameInterfaces {
    /**
     * @param {GameScope} scope 
     */
    constructor(scope) {
        super({
            asOwnCanvas: true,
            zindex: ConfigConst.ZINDEX.ENTITIES,
            canvasGroup: "GameEntitiesGroup",
            activated: true,
            needsUpdate: true
        }, scope);

        // core variables
        this.x = Math.floor(scope.w / 2);
        this.y = Math.floor(5 * scope.h / 6);
        this.speed = 1;
        /**@type {Bullet[]} */
        this.shoots = [];
        this.lastShoot = 0;
        /**@type {Asteroid[]} */
        this.asteroids = [];
        this.elapsed = 0;

        // game variables
        this.level = 1;
        this.lastLeveledUp = 1;
        this.score = 0;
        this.life = 3;
        this.lastLifeUP = 1;
        this.lifeCooldown = 0;
        this.bestScore = 0;
        this.over = false;
        /**@type {Particle[]} */
        this.particles = [];
        /**@type {Explosion[]} */
        this.explosions = [];
    }

    /**
     * @param {GameScope} scope 
     */
    render(scope) {
        /**@type {CanvasRenderingContext2D} */
        const ctx = scope.cache.context[this.canvasGroup];
        const Width = scope.w | 0;
        const Height = scope.h | 0;

        // if mobile device and not in landscape mode, say it
        if (scope.constants.isMobileDevice && Height > Width) {
            ctx.fillStyle = "red";
            ctx.font = "30px Arial";
            ctx.textBaseline = "middle";
            ctx.textAlign = "center";
            ctx.fillText("Rotate your screen to landscape mode.", Width / 2, Height / 2, Width);
            return;
        }

        // keeps it at the right place, even after screen resize
        this.y = Math.floor(5 * scope.h / 6);

        ctx.clearRect(0, 0, Width, Height);

        if (this.over) {
            ctx.fillStyle = "red";
            ctx.font = "90px Arial";

            ctx.textBaseline = "middle";
            ctx.textAlign = "center";
            ctx.fillText("Game Over", Width / 2, Height / 2);
            ctx.font = "40px Arial";
            this.needsUpdate = false;
            if (scope.constants.isMobileDevice) {
                return ctx.fillText("Start again by taping the screen.", Width / 2, Height / 2 + 80);
            }
            return ctx.fillText("Start again by pressing space.", Width / 2, Height / 2 + 80);
        }

        // level one space ship (change style for each level up?)
        ctx.fillStyle = "white";
        if (Date.now() - this.lifeCooldown <= 1000) ctx.fillStyle = "red";
        this.player(ctx);

        // draw a little tick for each bullet
        this.shoots.forEach(shoot => {
            ctx.fillStyle = "white";
            if (shoot.level === 2) {
                ctx.fillStyle = "red";
            }

            // bullet w = 2, bullet h = 5
            ctx.fillRect(shoot.x, shoot.y, 2, 5);
        });

        // draw each asteroid
        this.asteroids.forEach(asteroid => {
            this.drawAsteroid(scope, asteroid);
        });

        // show life and score
        this.display(ctx);

        if (scope.constants.isMobileDevice) {
            ctx.fillStyle = "white";
            ctx.globalAlpha = 0.5;

            ctx.beginPath();
            ctx.moveTo(Width - 60, Height - 60);
            ctx.lineTo(Width - 10, Height - 35);
            ctx.lineTo(Width - 60, Height - 10);
            ctx.lineTo(Width - 60, Height - 60);
            ctx.fill();
            ctx.closePath();

            ctx.beginPath();
            ctx.moveTo(Width - 65, Height - 60);
            ctx.lineTo(Width - 115, Height - 35);
            ctx.lineTo(Width - 65, Height - 10);
            ctx.lineTo(Width - 65, Height - 60);
            ctx.fill();
            ctx.closePath();

            ctx.beginPath();
            ctx.arc(60, Height - 60, 40, 0, 2 * Math.PI, false);
            ctx.fill();

            ctx.globalAlpha = 1;
        }
    }

    /**
     * @param {CanvasRenderingContext2D} ctx 
     */
    display(ctx) {
        ctx.fillStyle = "white";
        ctx.globalAlpha = 0.5;
        ctx.fillRect(10, 10, 200, 60);
        ctx.globalAlpha = 1;

        ctx.font = "20px Arial";
        ctx.fillStyle = "blue";
        this.player(ctx, 22, 14);
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.fillText(`x${this.life}`, 45, 22);

        ctx.textBaseline = "hanging";
        ctx.textAlign = "start";
        ctx.fillText(`Score: ${this.score}`, 12, 30);
        ctx.fillText(`Best Score: ${this.bestScore}`, 12, 50);
    }

    player(ctx, x = this.x, y = this.y) {
        ctx.beginPath();
        ctx.moveTo(Math.floor(x), Math.floor(y));
        ctx.lineTo(Math.floor(x - 10), Math.floor(y + 10));
        ctx.lineTo(Math.floor(x), Math.floor(y + 7));
        ctx.lineTo(Math.floor(x + 10), Math.floor(y + 10));
        ctx.lineTo(Math.floor(x), Math.floor(y));
        ctx.fill();
        ctx.closePath();
    }

    /**
     * @param {GameScope} scope 
     */
    createAsteroid(scope) {
        /*
        !How we will create the asteroid

        take a circle and put a certain number of point on it's circumference
        then move away or closer those point from the center
        */

        /*
        !How to get the fall angle

        get the x spawn coordonate
        then get the length on each sides ad the high
        then with trigonometry and pythagore, get the angle at the spawn coordonate

        then choose a random angle between those two
        */

        const size = Math.floor(Math.random() * 40 + 15);
        const pointNumber = Math.floor(Math.random() * 10 + 10);
        const rotationAngle = Math.random() / 100 * 2 * Math.PI * Math.randomSign();
        const spawnCoos = Math.floor(scope.w * Math.random());
        const angle1 = Math.sin(spawnCoos /
            Math.sqrt(scope.h * scope.h + spawnCoos * spawnCoos));
        const angle2 = Math.sin((scope.w - spawnCoos) /
            Math.sqrt(scope.h * scope.h + (scope.w - spawnCoos) * (scope.w - spawnCoos)));

        const asteroid = {
            x: spawnCoos,
            y: -size,
            points: [],
            life: Math.floor(size * pointNumber / 25) * Math.ceil(this.score / 1000 + 0.1),
            rotation: rotationAngle,
            size: size,
            speed: Math.random() * 2 + 1,
            color: "white",
            angle: (Math.random()).clamp(angle1, angle2) * Math.randomSign() / 1.5
        };

        for (let i = 0; i < pointNumber; i++) {
            const bump = Math.floor(Math.random() * size / 3) * Math.randomSign();
            const x = Math.cos((2 * Math.PI / pointNumber) * i) * size + bump;
            const y = Math.sin((2 * Math.PI / pointNumber) * i) * size + bump;
            asteroid.points.push({
                x: x,
                y: y
            });
            // check if it's the farthest from the center
            if (Math.sqrt(x * x + y * y) > asteroid.size) {
                asteroid.size = Math.sqrt(x * x + y * y);
            }
        }

        this.asteroids.push(asteroid);
    }

    /**
     * @param {GameScope} scope 
     * @param {Asteroid} asteroid
     */
    drawAsteroid(scope, asteroid) {
        /**@type {CanvasRenderingContext2D} */
        const ctx = scope.cache.context[this.canvasGroup];
        const oldFillStyle = ctx.fillStyle;

        // make like the space ship has a blue aura
        var gradient = ctx.createRadialGradient(this.x, this.y, asteroid.size, asteroid.x, asteroid.y, 500);
        gradient.addColorStop(0, "red");
        gradient.addColorStop(0.2, asteroid.color);
        ctx.fillStyle = gradient;

        ctx.beginPath();
        ctx.moveTo(asteroid.x + asteroid.points[0].x, asteroid.y + asteroid.points[0].y);
        asteroid.points.forEach(point => {
            ctx.lineTo(asteroid.x + point.x, asteroid.y + point.y);
        });
        ctx.lineTo(asteroid.x + asteroid.points[0].x, asteroid.y + asteroid.points[0].y);
        ctx.fill();
        ctx.closePath();

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "black";
        ctx.font = "20px arial";
        ctx.fillText(asteroid.life, asteroid.x, asteroid.y);

        ctx.fillStyle = oldFillStyle;
    }

    /**
     * @param {GameScope} scope 
     */
    update(scope) {
        if (scope.constants.isMobileDevice && scope.h > scope.w) {
            return;
        }

        // create asteroids at random time
        if (Math.random() * 100 <= 4 * this.speed / 2) this.createAsteroid(scope);

        const k = GameConfig.keyboard,
            elaps = Date.now() - this.elapsed;
        this.elapsed = Date.now();

        // restart on over
        if ((KeyboardTrackerManager.pressed([" "]) ||
            MouseTrackerManager.checkClick(0, 0, scope.w, scope.h)) &&
            this.over) {
            this.restart(scope.w);
        }

        // move the space ship
        if (KeyboardTrackerManager.pressed(k.right) ||
            MouseTrackerManager.holdOver(scope.w - 60, scope.h - 60, 50, 50)) {
            this.x += Math.floor(scope.w / 200);
            if (this.x >= scope.w - 10) this.x = scope.w - 10;
        } else if (KeyboardTrackerManager.pressed(k.left) ||
            MouseTrackerManager.holdOver(scope.w - 115, scope.h - 60, 50, 50)) {
            this.x -= Math.floor(scope.w / 200);
            if (this.x <= 10) this.x = 10;
        }

        // shoot
        if ((KeyboardTrackerManager.pressed(k.shoot) ||
            MouseTrackerManager.holdOver(0, scope.h - 120, 120, 120)) &&
            Date.now() - this.lastShoot >= 200) {
            this.lastShoot = Date.now();
            // make each bullet independent
            for (let i = 0; i < Math.ceil(this.level / 2); i++) {
                this.shoots.push({
                    x: this.x - (Math.ceil(this.level / 2) * 2 + (Math.ceil(this.level / 2) - 1) * 3) / 2 + i * 5,
                    y: this.y,
                    level: 2 - this.level % 2
                });
            }
        }

        // acceleration
        if (KeyboardTrackerManager.pressed(k.down)) {
            this.speed -= 0.2 / elaps;
            if (this.speed <= 1) this.speed = 1;
        } else if (KeyboardTrackerManager.pressed(k.up)) {
            this.speed += 0.5 / elaps;
            if (this.speed >= 5) this.speed = 5;
        } else {
            this.speed -= 0.1 / elaps;
            if (this.speed <= 1) this.speed = 1;
        }

        // make the shoots disappear on hit or void
        this.shoots.forEach((shoot, id) => {
            shoot.y -= 5;
            if (shoot.y <= -5) {
                this.shoots.splice(id, 1);
            }

            this.asteroids.forEach((asteroid, idx) => {
                // check collision check if the asteroid is near
                if (Math.sqrt(Math.pow(shoot.x + 1 - asteroid.x, 2) + Math.pow(shoot.y + 2.5 - asteroid.y, 2)) <= asteroid.size) {
                    let collided = false;
                    asteroid.points.forEach((point, id) => {
                        //? maybe can be optimised
                        // the three point will be: center of the asteroid, current point and next point
                        let nextPoint = asteroid.points[id + 1];
                        if (!nextPoint) nextPoint = asteroid.points[0];
                        if (this.pointInTriangle(point.x + asteroid.x, point.y + asteroid.y, asteroid.x, asteroid.y, nextPoint.x + asteroid.x, nextPoint.y + asteroid.y, shoot.x + 1, shoot.y + 2.5)) {
                            collided = true;
                        }
                    });

                    if (collided) {
                        asteroid.life -= shoot.level;
                        this.shoots.splice(id, 1);
                        this.score += Math.floor(5 * this.speed / 2);

                        if (asteroid.life <= 0) {
                            this.asteroids.splice(idx, 1);
                            this.score += Math.floor(10 * this.speed / 2);
                            //todo animation 
                            /*
                            particles going from the center and fadding
                            part of asteroids ?
                            */
                        }
                    }
                }
            });
        });

        this.asteroids.forEach((asteroid, idx) => {
            asteroid.y += asteroid.speed * this.speed;
            asteroid.x += asteroid.angle;
            if (asteroid.y >= scope.h + asteroid.size * 2 ||
                asteroid.x + asteroid.size * 2 <= 0 ||
                asteroid.x + asteroid.size * 2 >= scope.w) {
                this.asteroids.splice(idx, 1);
            }

            // make the asteroid rotate
            asteroid.points.forEach(point => {
                let tempx = point.x, tempy = point.y;
                point.x = tempx * Math.cos(asteroid.rotation) - tempy * Math.sin(asteroid.rotation);
                point.y = tempx * Math.sin(asteroid.rotation) + tempy * Math.cos(asteroid.rotation);
            });

            // check collision check if the asteroid is near
            if (Math.sqrt(Math.pow(this.x - asteroid.x, 2) + Math.pow(this.y - asteroid.y, 2)) <= asteroid.size) {
                let collided = false;
                asteroid.points.forEach((point, id) => {
                    //? maybe can be optimised
                    // the three point will be: center of the asteroid, current point and next point
                    let nextPoint = asteroid.points[id + 1];
                    if (!nextPoint) nextPoint = asteroid.points[0];
                    if (this.pointInTriangle(point.x + asteroid.x, point.y + asteroid.y, asteroid.x, asteroid.y, nextPoint.x + asteroid.x, nextPoint.y + asteroid.y, this.x, this.y) ||
                        this.pointInTriangle(point.x + asteroid.x, point.y + asteroid.y, asteroid.x, asteroid.y, nextPoint.x + asteroid.x, nextPoint.y + asteroid.y, this.x - 10, this.y + 10) ||
                        this.pointInTriangle(point.x + asteroid.x, point.y + asteroid.y, asteroid.x, asteroid.y, nextPoint.x + asteroid.x, nextPoint.y + asteroid.y, this.x + 10, this.y + 10)) {
                        collided = true;
                    }
                });

                if (collided && Date.now() - this.lifeCooldown >= 1000) {
                    this.lifeCooldown = Date.now();
                    this.life--;
                    if (this.life === 0) {
                        this.over = true;
                        //todo animation 
                    }
                }
            }
        });

        // best score handling
        if (this.score > this.bestScore) this.bestScore = this.score;

        // leveling up system
        if (this.score >= this.lastLeveledUp + 200) {
            this.lastLeveledUp = this.score;
            this.level++;
        }

        // life system
        if (this.score >= this.lastLifeUP + 5000) {
            this.lastLifeUP = this.score;
            this.life++;
        }
    }

    restart(width) {
        this.shoots = [];
        this.asteroids = [];
        this.life = 3;
        this.level = 1;
        this.score = 0;
        this.speed = 1;
        this.x = Math.floor(width / 2);
        this.lastShoot = Date.now();
        this.over = false;
        this.needsUpdate = true;
    }

    destroy(x, y, size, player = false) {
        this.explosions.push({
            x: x,
            y: y,
            color: player ? "red" : "white",
            maxDiameter: player ? 40 : size,
            currentDiameter: 0
        });
    }

    pointInTriangle(x1, y1, x2, y2, x3, y3, x, y) {
        var denominator = ((y2 - y3) * (x1 - x3) + (x3 - x2) * (y1 - y3));
        var a = ((y2 - y3) * (x - x3) + (x3 - x2) * (y - y3)) / denominator;
        var b = ((y3 - y1) * (x - x3) + (x1 - x3) * (y - y3)) / denominator;
        var c = 1 - a - b;

        return 0 <= a && a <= 1 && 0 <= b && b <= 1 && 0 <= c && c <= 1;
    }
}