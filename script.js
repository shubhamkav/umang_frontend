/****************************************************
|   IGNITE FEST VISUAL ENGINE - ABSOLUTE FIRE 🔥    |
|   Features Combined:                              |
|   - Floating Neon Particles                       |
|   - Cursor Trails                                 |
|   - 3D Starfield Galaxy                           |
|   - Parallax Gradient Blobs                       |
|   - Aurora Shader Waves                           |
|   - Spark Burst On Click                          |
****************************************************/

/* ===================== CANVAS SETUP ===================== */
const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
canvas.style.position = "fixed";
canvas.style.top = "0";
canvas.style.left = "0";
canvas.style.width = "100%";
canvas.style.height = "100%";
canvas.style.zIndex = "-1";
canvas.style.pointerEvents = "none";

const ctx = canvas.getContext("2d");
let w, h;

function resize(){
    w = canvas.width = innerWidth;
    h = canvas.height = innerHeight;
}
resize();
addEventListener("resize", resize);


/* =========================================================
|                      STARFIELD BACKGROUND                 |
========================================================= */
const stars = [];
for(let i=0;i<400;i++){
    stars.push({
        x: Math.random()*w,
        y: Math.random()*h,
        z: Math.random()*3+1,
        size: Math.random()*2
    });
}

function drawStars(){
    for(let s of stars){
        ctx.fillStyle = `rgba(255,255,255,${0.5*Math.random()})`;
        ctx.fillRect(s.x,s.y,s.size,s.size);
        s.x -= s.z*0.15;
        if(s.x < 0) s.x = w;
    }
}


/* =========================================================
|                 GRADIENT BLOB PARALLAX                    |
========================================================= */
const blobs = [
    {x:200,y:300,r:250,color:"#ff2d75"},
    {x:900,y:500,r:300,color:"#ff9c3c"},
    {x:600,y:200,r:200,color:"#7b2cff"}
];

function drawBlobs(){
    blobs.forEach((b,i)=>{
        ctx.beginPath();
        ctx.fillStyle = b.color + "33";
        ctx.arc(b.x + Math.sin(Date.now()/2000+i)*40,
                b.y + Math.cos(Date.now()/2500+i)*40,
                b.r,0,Math.PI*2);
        ctx.fill();
    });
}


/* =========================================================
|                   AURORA WAVE EFFECT                      |
========================================================= */
function drawAurora(){
    ctx.beginPath();
    ctx.moveTo(0,h*0.75);
    for(let x=0;x<w;x+=20){
        let y = h*0.75 + Math.sin((x+Date.now()/200)*0.01)*40;
        ctx.lineTo(x,y);
    }
    ctx.lineTo(w,h);
    ctx.lineTo(0,h);
    ctx.closePath();
    ctx.fillStyle="rgba(0,255,200,0.15)";
    ctx.fill();
}


/* =========================================================
|                   FLOATING PARTICLES                      |
========================================================= */
const particles = [];
function spawnParticle(x,y){
    particles.push({
        x,y,
        size:Math.random()*6+3,
        alpha:1,
        vx:(Math.random()-0.5)*2,
        vy:(Math.random()-0.5)*2,
        color:`hsl(${Math.random()*360},100%,60%)`
    });
}

addEventListener("mousemove",(e)=>{
    for(let i=0;i<4;i++) spawnParticle(e.clientX,e.clientY);
});

/* burst on click */
addEventListener("click",(e)=>{
    for(let i=0;i<20;i++) spawnParticle(e.clientX,e.clientY);
});

function drawParticles(){
    for(let p of particles){
        ctx.beginPath();
        ctx.fillStyle = p.color.replace(")",`,${p.alpha})`).replace("hsl","hsla");
        ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
        ctx.fill();
        p.x+=p.vx; p.y+=p.vy;
        p.alpha-=0.02;
    }
    for(let i=particles.length-1;i>=0;i--)
        if(particles[i].alpha<=0) particles.splice(i,1);
}


/* =========================================================
|                      MASTER LOOP                          |
========================================================= */
function animate(){
    ctx.clearRect(0,0,w,h);

    drawStars();       // ★ Galaxy layer
    drawBlobs();       // 🫧 Parallax blobs
    drawAurora();      // 🌌 Aurora waves
    drawParticles();   // 🔥 Cursor sparks trail

    requestAnimationFrame(animate);
}
animate();



