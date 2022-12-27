/// <reference path="../../ts/type.d.ts"/>

class GamePlayer extends GameInterfaces {
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
        this.shoots = [];
        this.lastShoot = 0;
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
    }

    render(scope) {
        /**@type {CanvasRenderingContext2D} */
        const ctx = scope.cache.context[this.canvasGroup];
        const Width = scope.w | 0;
        const Height = scope.h | 0;

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
            ctx.fillText("Start again by pressing space.", Width / 2, Height / 2 + 80);

            this.needsUpdate = false;
            return;
        }

        // level one space ship (change style for each level up?)
        ctx.fillStyle = "white";
        if (Date.now() - this.lifeCooldown <= 1000) ctx.fillStyle = "red";
        this.player(ctx);

        // draw each shoots
        this.shoots.forEach(shoot => {
            ctx.fillStyle = "white";
            if ((shoot.level - 1) % 2 === 1) {
                ctx.fillStyle = "red";
            }

            // draw a little tick for each bullet
            // bullet w = 2, bullet h = 5
            for (let i = 0; i < Math.ceil(shoot.level / 2); i++) {
                //TODO center the bullets
                // TODO correct bullet width as level go higher
                ctx.fillRect(shoot.x + i * 3 - (Math.ceil(shoot.level / 2) * 5 - 3) / 2, shoot.y, 2, 5);
            }
        });

        // draw each asteroid
        if (Math.random() * 100 <= 4) this.createAsteroid(scope);
        this.asteroids.forEach(asteroid => {
            this.drawAsteroid(scope, asteroid);
        });

        // show life and score
        this.display(ctx);
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

    createAsteroid(scope) {
        /*
        !How we will create the asteroid

        take a circle and put a certain number of point on it's circumference
        then move away or closer those point from the center
        */

        const size = Math.floor(Math.random() * 40 + 15);
        const pointNumber = Math.floor(Math.random() * 10 + 10);
        const rotationAngle = Math.random() / 100 * 2 * Math.PI * this.randomSign();

        const asteroid = {
            x: Math.floor(scope.w * Math.random()),
            y: -size,
            points: [],
            life: Math.floor(size * pointNumber / 25),
            rotation: rotationAngle,
            size: size,
            speed: Math.random() * 2 + 1
        };

        for (let i = 0; i < pointNumber; i++) {
            const bump = Math.floor(Math.random() * size / 3) * this.randomSign();
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
        //TODO they can also go sideway
    }

    drawAsteroid(scope, asteroid) {
        /**@type {CanvasRenderingContext2D} */
        const ctx = scope.cache.context[this.canvasGroup];
        const oldFillStyle = ctx.fillStyle;

        ctx.fillStyle = "white";
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

    update(scope) {
        const k = GameConfig.keyboard, that = this,
            elaps = Date.now() - this.elapsed;
        this.elapsed = Date.now();

        if (KeyboardTrackerManager.pressed([" "]) && that.over) {
            that.shoots = [];
            that.asteroids = [];
            that.life = 3;
            that.level = 1;
            that.score = 0;
            that.x = Math.floor(scope.w / 2);
            that.over = false;
        }

        if (KeyboardTrackerManager.pressed(k.right)) {
            that.x += Math.floor(scope.w / 100);
            if (that.x >= scope.w - 10) that.x = scope.w - 10;
        } else if (KeyboardTrackerManager.pressed(k.left)) {
            that.x -= Math.floor(scope.w / 100);
            if (that.x <= 10) that.x = 10;
        } else if (KeyboardTrackerManager.pressed(k.shoot) && Date.now() - that.lastShoot >= 200) {
            that.lastShoot = Date.now();
            that.shoots.push({
                x: that.x,
                y: that.y,
                level: that.level,
                width: Math.ceil(that.level / 2) * 5 - 3
            });
        }

        if (KeyboardTrackerManager.pressed(k.down)) {
            that.speed -= 1 / elaps;
            if (that.speed <= 1) that.speed = 1;
        } else if (KeyboardTrackerManager.pressed(k.up)) {
            that.speed += 1 / elaps;
            if (that.speed >= 5) that.speed = 5;
        } else {
            that.speed -= 0.5 / elaps;
            if (that.speed <= 1) that.speed = 1;
        }

        // make the shoots disappear on hit or void
        this.shoots.forEach((shoot, id) => {
            shoot.y -= 5;
            if (shoot.y <= -5) {
                this.shoots.splice(id, 1);
            }

            this.asteroids.forEach((asteroid, idx) => {
                // check if bullet is colliding with the asteroid
                if (shoot.x < asteroid.x + asteroid.size &&
                    shoot.x + 2 > asteroid.x - asteroid.size &&
                    shoot.y < asteroid.y + asteroid.size &&
                    shoot.y + 5 > asteroid.y - asteroid.size) {
                    asteroid.life -= shoot.level;
                    this.shoots.splice(id, 1);
                    this.score += 5;

                    if (asteroid.life <= 0) {
                        this.asteroids.splice(idx, 1);
                        this.score += 10;
                        //todo animation 
                    }
                }
            });
        });

        this.asteroids.forEach((asteroid, idx) => {
            asteroid.y += asteroid.speed * this.speed;
            if (asteroid.y >= scope.h + asteroid.size * 2) {
                this.asteroids.splice(idx, 1);
            }

            // make the asteroid rotate
            asteroid.points.forEach(point => {
                let tempx = point.x, tempy = point.y;
                point.x = tempx * Math.cos(asteroid.rotation) - tempy * Math.sin(asteroid.rotation);
                point.y = tempx * Math.sin(asteroid.rotation) + tempy * Math.cos(asteroid.rotation);
            });

            // check collision with player
            if (this.x - 10 < asteroid.x + asteroid.size &&
                this.x + 10 > asteroid.x - asteroid.size &&
                this.y < asteroid.y + asteroid.size &&
                this.y + 10 > asteroid.y - asteroid.size &&
                this.life > 0 &&
                Date.now() - this.lifeCooldown >= 1000) {
                this.lifeCooldown = Date.now();
                this.life--;
                if (this.life === 0) this.over = true;
            }
        });

        // best score handling
        if (this.score > this.bestScore) this.bestScore = this.score;

        // leveling up system
        if (this.score % 200 === 0 && this.score > this.lastLeveledUp) {
            this.lastLeveledUp = this.score;
            this.level++;
        }

        // life system
        if ((this.score >= 1000 || this.score % 5000 == 0) && this.score > this.lastLifeUP) {
            this.lastLifeUP = this.score;
            this.life++;
        }
    }

    randomSign() {
        return (Math.random() < 0.5) ? -1 : 1;
    }
}