//setup 

const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
console.log(ctx);

ctx.fillStyle = 'yellow';
ctx.strokeStyle = 'white';

class Particle {
    constructor(effect) {
        this.MaxSpeed = 0.8;
        this.effect = effect;
        this.radius = 2 + Math.floor(Math.random() * 10);
        this.reset();
    }

    reset() {
        this.x = this.radius + Math.random() * (this.effect.width - this.radius * 2);
        this.y = this.radius + Math.random() * (this.effect.height - this.radius * 2);
        this.vx = (Math.random() * this.MaxSpeed * 2) - this.MaxSpeed;
        this.vy = (Math.random() * this.MaxSpeed * 2) - this.MaxSpeed;
    }

    update() {
        if (this.effect.mouse.pressed) {
            const dx = this.x - this.effect.mouse.x;
            const dy = this.y - this.effect.mouse.y;
            const distance = Math.hypot(dx, dy);

            if (distance < this.effect.mouse.radius) {
                const angle = Math.atan2(dy, dx);
                this.x += Math.cos(angle);
                this.y += Math.sin(angle);
            }
        }
        if (this.x > this.effect.width - this.radius){
            this.x = this.effect.width - this.radius
        }else if (this.x < this.radius) {
            this.x = this.radius;
        };

        if (this.y > this.effect.height - this.radius){
            this.y = this.effect.height - this.radius;
        } else if (this.y < this.radius){
            this.y = this.radius;
        } 

        this.x += this.vx;
        this.y += this.vy;
        if (this.x > this.effect.width - this.radius || this.x < this.radius) this.vx *= -1;
        if (this.y > this.effect.height - this.radius || this.y < this.radius) this.vy *= -1;       
    }

    draw(context) {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        context.fill();
    }
}
class Effect {
    constructor(canvas, context) {
        this.canvas = canvas;
        this.context = context;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.particles = [];
        this.numberOfParticles = 480;
        this.createParticles();

        this.mouse = {
            x: 0,
            y: 0,
            pressed: false,
            radius: 80
        }

        window.addEventListener("resize", e => {
            this.resize(e.target.window.innerWidth, e.target.window.innerHeight, context);
        })

        window.addEventListener("mousemove", e => {
            if (this.mouse.pressed) {
                this.mouse.x = e.x;
                this.mouse.y = e.y;
            }
        });

        window.addEventListener("mousedown", e => {
            this.mouse.pressed = true;
            this.mouse.x = e.x;
            this.mouse.y = e.y;
        });

        window.addEventListener("mouseup", e => {
            this.mouse.pressed = false;
        });
    }

    createParticles() {
        for (let i = 0; i < this.numberOfParticles; ++i) {
            let p = new Particle(this);
            this.particles.push(p);
        }
    }
    handleParticle(context) {
        this.conectParticle(context)
        this.particles.forEach(particle => {
            particle.update();
            particle.draw(context);
        });
    }

    conectParticle(context) {
        const maxDistance = 80;
        const influenceDistance = 80;

        for (let a = 0; a < this.particles.length; ++a) {
            for (let b = a; b < this.particles.length; ++b) {
                const particleA = this.particles[a];
                const particleB = this.particles[b];
                const dx = particleA.x - particleB.x;
                const dy = particleA.y - particleB.y;
                const distance = Math.hypot(dx, dy);

                if (distance < maxDistance) {
                    const opacity = 1 - distance / maxDistance;
                    context.save();
                    context.globalAlpha = opacity;
                    context.beginPath();
                    context.moveTo(particleA.x, particleA.y);
                    context.lineTo(particleB.x, particleB.y);
                    context.stroke();
                    context.restore();
                }

                //....
                
                if (this.mouse.pressed) 
                {
                    const dx = particleA.x - particleB.x;
                    const dy = particleA.y - particleB.y;
                    const distance = Math.hypot(dx, dy);
        
                    if (distance < influenceDistance) {
                        const angle = Math.atan2(dy, dx);
                        let force = 1 - distance / influenceDistance;
                        force = Math.atan(force);
                        particleA.x += (Math.cos(angle)* force);
                        particleA.y += (Math.sin(angle) * force);

                        particleB.x -= (Math.cos(angle)* force);
                        particleB.y -= (Math.sin(angle) * force);
                    }
                }
            }
        }
    }

    resize(w, h) {
        canvas.width = w;
        canvas.height = h;
        this.width = w;
        this.height = h;
        this.context.fillStyle = 'yellow';
        ctx.strokeStyle = 'white';
        this.particles.forEach(p => p.reset());
    }
}
const effect = new Effect(canvas, ctx);


function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    effect.handleParticle(ctx);
    requestAnimationFrame(animate)
}
animate();