/// <reference path="../../ts/type.d.ts"/>

class GameMapInterface extends GameInterfaces {
    /**
     * @param {GameScope} scope
     */
    constructor(scope) {
        super({
            asOwnCanvas: true,
            zindex: ConfigConst.ZINDEX.MAP,
            canvasGroup: "GameMapGroup",
            activated: true
        }, scope);

        this.starsArray = [];
        this.densityAmount = Math.ceil(5120 * 2880 * 0.0001);
    }

    /**
     * @param {GameScope} scope
     */
    render(scope) {
        /**@type {CanvasRenderingContext2D} */
        const ctx = scope.cache.context[this.canvasGroup];
        const Width = scope.w | 0;
        const Height = scope.h | 0;

        ctx.clearRect(0, 0, Width, Height);

        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, Width, Height);

        // fill the background with a 0.0001 density of star per px
        if (this.starsArray.length === 0) {
            console.log(`area: ${Width * Height}, density:${this.densityAmount / (Width * Height)}, amout: ${this.densityAmount}`);
            for (let i = 0; i < this.densityAmount; i++) {
                this.starsArray.push({
                    x: Math.floor(Math.random() * 5120),
                    y: Math.floor(Math.random() * 2880),
                    size: Math.floor(Math.random() * 15 + 5)
                });
            }
        }

        // draw all the stars on the screen
        this.starsArray.forEach(star => {
            if (star.x <= Width && star.y <= Height) {
                this.star(scope, star.x, star.y, star.size);
            }
        });
    }

    star(scope, x, y, size) {
        /**@type {CanvasRenderingContext2D} */
        const ctx = scope.cache.context[this.canvasGroup];
        const oldStrokeStyle = ctx.strokeStyle;

        var gradient = ctx.createLinearGradient(Math.floor(x - size / 2), Math.floor(y), Math.floor(x + size / 2), Math.floor(y));
        gradient.addColorStop(0, "#00000000");
        gradient.addColorStop(0.5, "white");
        gradient.addColorStop(1, "#00000000");
        ctx.strokeStyle = gradient;

        ctx.lineWidth = Math.ceil(size / 100) + 1;

        ctx.beginPath();
        ctx.moveTo(Math.floor(x - size / 2), Math.floor(y));
        ctx.lineTo(Math.floor(x + size / 2), Math.floor(y));
        ctx.stroke();
        ctx.closePath();

        gradient = ctx.createLinearGradient(Math.floor(x), Math.floor(y - size / 2), Math.floor(x), Math.floor(y + size / 2));
        gradient.addColorStop(0, "#00000000");
        gradient.addColorStop(0.5, "white");
        gradient.addColorStop(1, "#00000000");
        ctx.strokeStyle = gradient;

        ctx.beginPath();
        ctx.moveTo(Math.floor(x), Math.floor(y - size / 2));
        ctx.lineTo(Math.floor(x), Math.floor(y + size / 2));
        ctx.stroke();
        ctx.closePath();

        ctx.strokeStyle = oldStrokeStyle;
    }

    /**
     * @param {GameScope} scope
     */
    update(scope) {
        // since the player is moving, make the stars go down by 10% of his speed
        this.starsArray.forEach(star => {
            star.y += Math.ceil(scope.state.entity.player.speed * 0.5);
            // if the star get out of the screen, create a "new" star at the top of the screen
            if (star.y >= 2880 + star.size / 2) {
                star.x = Math.floor(Math.random() * 5120);
                star.size = Math.floor(Math.random() * 15 + 5);
                star.y = -star.size;
            }
        });
    }
}