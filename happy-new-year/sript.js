const image = new Image();
image.src = "happy-new-year-22-1024x576.jpg"


image.addEventListener('load', (e) => {
    const canvas = document.getElementById('canvas1');
    const context = canvas.getContext('2d');

    canvas.width = 514;
    canvas.height = 716;

    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
    context.clearRect(0, 0, canvas.width, canvas.height);

    const pixelData = [];
    const numberOfParticles = 4000;

    let min = 100000;
    let max = -1;
    for (let y = 0; y < canvas.height; ++y) {
        const row = [];
        for (let x = 0; x < canvas.width; ++x) {
            const pixelIndex = x * 4 + y * canvas.width * 4;

            const red = pixels.data[pixelIndex];
            const green = pixels.data[pixelIndex + 1];
            const blue = pixels.data[pixelIndex + 2];
            const alpha = pixels.data[pixelIndex + 3];
            const brightness = calculateRelativeBrightness(red, green, blue);
            row.push(
                {
                    red: red,
                    green: green,
                    blue: blue,
                    brightness: brightness
                }
            );
            min = Math.min(brightness, min);
            max = Math.max(brightness, max);
        }
        pixelData.push(row);
    }

    let particles = init(context, canvas, numberOfParticles);
    animate(context, canvas, particles, pixelData);
})

function calculateRelativeBrightness(red, green, blue) {
    return Math.sqrt(
        (red * red) * 0.299 +
        (green * green) * 0.587 +
        (blue * blue) * 0.114
    ) / 100;
}

function init(ctx, canvas, numberOfParticles) {
    let particles = [];
    for (let i = 0; i < numberOfParticles; ++i) {
        particles.push(new Particle(ctx, canvas));
    }
    return particles;
}

function animate(ctx, canvas, particles, pixelData) {
    ctx.globalAlpha = 0.05;
    ctx.fillStyle = 'rgb(0,0,0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.globalAlpha = 0.1;

    for (const p of particles) {
        const pData = pixelData[Math.floor(p.y)][Math.floor(p.x)];
        p.update(pixelData);
        ctx.globalAlpha = p.speed / 2;
        p.draw(pData.red, pData.green, pData.blue);
    }
    requestAnimationFrame(() => animate(ctx, canvas, particles, pixelData));
}

class Particle {
    constructor(ctx, canvas) {
        this.x = Math.random() * canvas.width;
        this.y = 0;
        this.velocity = Math.random() * 0.5 + 0.1;
        this.speed = 0;
        this.size = Math.random() * 0.5 + 1;

        this.canvas = canvas;
        this.context = ctx;
    }

    update(pixelData) {
        const pData = pixelData[Math.floor(this.y)][Math.floor(this.x)];

        this.speed = pData.brightness;

        let movement = Math.max(0, (2.5 -this.speed) + this.velocity);

        this.y += movement;
        if (this.y >= this.canvas.height) {
            this.y = 0;
            this.x = Math.random() * this.canvas.width;
        }
    }

    draw(red, green, blue) {
        this.context.beginPath();
        this.context.fillStyle = 'white'
       // this.context.fillStyle = 'rgb(' + red + ',' + green + ',' + blue + ')';
        this.context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        this.context.fill();
    }
}