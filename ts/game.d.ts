export { }

declare global {
    type Star = {
        x: number,
        y: number,
        size: number
    }

    type Comet = {
        x: number,
        y: number,
        size: number,
        vector: [number, number],
        color: CanvasGradient
    }

    type Asteroid = {
        x: number,
        y: number,
        points: {
            x: number,
            y: number
        }[],
        life: number,
        rotation: number,
        size: number,
        speed: number,
        color: string,
        angle: number
    }

    type Bullet = {
        x: number,
        y: number,
        level: number
    }

    type Particle = {
        x: number,
        y: number,
        color: string[],
        verctor: [number, number]
    }

    type Explosion = {
        x: number,
        y: number,
        color: CanvasGradient,
        currentDiameter: number,
        maxDiameter: number
    }
}