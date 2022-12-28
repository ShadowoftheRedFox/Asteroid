export { }

declare global {
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
}