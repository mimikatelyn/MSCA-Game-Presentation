const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d')

canvas.width = window.innerWidth
canvas.height = window.innerHeight

const scoreEl = document.querySelector('#scoreEl')
const startGameBtn = document.querySelector('#startGameBtn')
const modalEl = document.querySelector('#modalEl')
const bigScoreMenuEl = document.querySelector('#bigScoreMenuEl')

// Create player
class Player {
    constructor(x, y, radius, color) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
    }

    //draw player on screen because creating a constructor will not make it appear. This produces the center circle on the screen.
    draw() {
        context.beginPath()
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        context.fillStyle = this.color
        context.fill()

    }
}

//We want new instances of projectiles - put it in a class called projectile with a constructor and the properties that a projectile needs. This is the same as the Player constructor + velocity
class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }

    draw() {
        context.beginPath()
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        context.fillStyle = this.color
        context.fill()
    }

    //Sometimes it is good to see where our projectile updates on the screen vs where it was. we draw the projectile then we update the projectile location plus it's velocity
    update() {
        this.draw() 
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

// This class constructor is the same as the class Projectile, except we need enemies to spawn from the outside moving inward towards the player.
class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }

    draw() {
        context.beginPath()
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        context.fillStyle = this.color
        context.fill()
    }

    //where our enemy updates on the screen vs where it was which is why we take its position plus its velocity
    update() {
        this.draw() 
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

// closer to one, the slower things deaccelerate. We 
const friction = 0.99

// Created a particle class to signify the Collision Detection
class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        //this alpha value means the particle will fade overtime
        this.alpha = 1
    }

    //we have to call the save function because we added this.alpha to make the particles fade over time. .globalAlpha specifies transparency to images before they are drawn. 
    draw() {
        context.save()
        context.globalAlpha = this.alpha
        context.beginPath()
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        context.fillStyle = this.color
        context.fill()
        context.restore()
    }

    //where our enemy updates on the screen vs where it was which is why we take its position plus its velocity
    //Multiplied velocity by friction which is defined as .98
    //for each frame in our animation loop we subtract .01 from this.alpha over time. use this in the draw()
    update() {
        this.draw() 
        this.velocity.x *= friction
        this.velocity.y *= friction
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
        this.alpha -= 0.01
    }
}

// x and y coordinates that reference the center of canvas
const x = canvas.width / 2
const y = canvas.height / 2

//calls on our player in center of screen
let player = new Player(x, y, 10, 'white')

/* I commented this out because this was the first attempt to to create projectiles statically.
 // Moved this let out of the event.listener because the projectile was only accessible in the click, so we had to move it out of click and create the projectile out of the scope so we can have access to it inside the animate function. 
    let projectile = new Projectile (
        canvas.width / 2,    //event.clientX,
        canvas.height / 2,    //event.clientY,
        5,
        'red',
        {
            x: 1,
            y: 1,
        }
    )

        // We also can use this set up to create another projectile if we wanted to by renaming it. For example, here we named it Projectile2 and projectiles array so that it can move independently
        let projectile2 = new Projectile (
            canvas.width / 2,    //event.clientX,
            canvas.height / 2,    //event.clientY,
            5,
            'green',
            {
                x: -1,
                y: -1,
            }
        )

        //this allows us to have management of multiple instances of all our projectiles
        let projectiles = [projectile, projectile2] */

// made an array for projectiles to loop through and draw them all at the same time. (multiple instances of the same object.)
let projectiles = []

//contains each instance of the enemies
let enemies = []

// particles array for explosion after Collision Detection
let particles = []

//init
function init() {
    player = new Player(x, y, 10, 'white')
    projectiles = []
    enemies = []
    particles = []
    score = 0
    scoreEl.innerHTML = score
    bigScoreMenuEl.innerHTML = score
}
// After creating the player, projectiles array, and updating, used the Projectile constructor to make an enemies constructor and then needed a function to spawn the enemies
function spawnEnemies() {

    // Didn't use request animation, because it spawned enemies too quickly. setInterval function creates enemies with these properties then push function creates new enemies in the array
    setInterval(() => {
        // This spawns radius of enemies radius randmoly between 2 - 30; mix and max
        const radius = Math.random() * (30 - 4) + 4
        
        /* ////used Math.random multiplied by the size of the canvas to get random spawning of enemies, but sometimes enemies spawned too close to the player - changed it so enemies spawn on the edge of the canvas
        const x = Math.randon() * canvas.width
        const y = Math.random() * canvas.height 
        
        //// Enemy's value is <.5 do 0 - radius to spawn left and off screen. If it is not, use canvas.width + radius. Used a conditional expression for this variable for better readibility(ternary operator.) This makes enemies spawn on the corners which is not the goal. Need to add an if else statement and make the const into let to access them later
        const x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
        const y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius */


        // Enemies now spawn at random places off screen. If relates to random spawning anywhere offscreen for the x (left and right) of canvas.width; else relates to random spawning anywhere offscreen for y (top and bottom) of canvas.height
        let x
        let y
        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
            y = Math.random() * canvas.height
        } else {
            x = Math.random() * canvas.width
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
        }

        //this randomizes our enemies' colors uses a template literal to input computations into the string
        const color = `hsl(${Math.random() * 360}, 100%, 70%)`

        // Created a const called angle in setInterval. Needed to get distance of two points; therefore, subtracted from our destination or destination to source.
        const angle = Math.atan2(
            canvas.height / 2 - y,
            canvas.width / 2 - x
        )
    
        // Math.cos/sin produces a number between a number between -1 and 1. Together cos/sin create a perfect ratio to move the projectile whichever way we want.Canvas is in radians, but if you click and find the coordinate of the angle it will be like -3.something
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }

        enemies.push(new Enemy(x, y, radius, color, velocity))
    }, 1000)
}

let animationId
let score = 0
function animate() {
    //this by default returns which frame is currently in play
    animationId = requestAnimationFrame(animate)

    // fillRect clears our canvas but with a specific color. We use fillStyle for each frame we are looping through.
    context.fillStyle = 'rgba(0, 0, 0, 0.1)'
    context.fillRect(0, 0, canvas.width, canvas.height)

    // player.draw() here because it needs to be redrawn after each update instead of only once when file loads
    player.draw()

    //NOTE 
    //to get anything on the canvas we have to render them on the screen. Loop through it - forEach particle in the particles array, call the update function that draws the particle on the screen with it's added velocity.
    particles.forEach((particle, index) => {
        if (particle.alpha <= 0) {
            particles.splice(index, 1)
        } else {
            particle.update()
        }
    })

    // used a forEach loop to get update function on all the projectiles each time
    projectiles.forEach((projectile) => {
        projectile.update()

        // this removes projectiles from the array when it hits the end of the canvas (collision detection with the end of the screen)
        if (
            projectile.x + projectile.radius < 0 || 
            projectile.x - projectile.radius > canvas.width ||
            projectile.y + projectile.radius < 0 || 
            projectile.y - projectile.radius > canvas.height) {
            setTimeout(() => {
                projectiles.splice(index, 1)
        }, 0)
        }
    })

    // forEach enemy of enemies array, call that enemies update function which calls draw which updates the enemy properties
    enemies.forEach((enemy, index) => {
        enemy.update()

        // Copied this code for removing the projectile and enemy upon collision. Can use const dist in two places cause they are in different scopes.
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)

        // End Game Condition when the distance of the enemy and the player is zero, the animation or the game ends.
        if (dist - enemy.radius - player.radius < 1) {
            cancelAnimationFrame(animationId)
            //this makes our modal menu return
            modalEl.style.display = 'flex'
            bigScoreMenuEl.innerHTML = score
        }

        //Loop within loop - Remove enemy with Collision Detection. In this loop, test the distance between enemies and projectile. Math.hypot is the distance between two points the x/y distance (projectile and enemy coordinates)
        //How this actually works - If you comment out the setInterval and the timer, console out distance, we can see the distance between the two points get smaller and smaller until it is zero and when the number increases they are going in opposite directions. The problem is that that we need to get the distance of the touch and not the radii centers of the projectile and the enemy. We have to account for the radii of the enemy and the projectile radius to get Collision Detection.
        projectiles.forEach((projectile, projectileIndex) => {
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)

            // Objects Touch when the distance minus the enemy's radius and the projectile's radius is all less than 1. If it is, remove that one enemy and that projectile from their arrays with splice.
            // forEach has an automatic indexing so we pass those arguments in the loops to remove it with splice.
            if (dist - enemy.radius - projectile.radius < 1) {

                // Creates explosions - loop for the particles to explode in different directions. Push a new particle into the array and define the properties. The radius multiplied by two give bigger explosion based on enemy size. The velocity with Math.random() - 0.5 * Math.random() * 5 gives us different power velocity. 
                for (let i = 0; i < enemy.radius * 2; i++) {
                    particles.push(
                        new Particle(
                            projectile.x, 
                            projectile.y, 
                            Math.random() * 2, 
                            enemy.color, 
                            {
                                x: (Math.random() - 0.5) * (Math.random() * 5),
                                y: (Math.random() - 0.5) * (Math.random() * 5),
                            }
                        )
                    )                  
                }

                // If enemy's radius is >10px subtract 10px and remove the projectile with setTimeout and splice out the projectile if it is less than 8px
                // subtracted 10 in if statement because sometimes projectile is too small to hit after it is reduced, so we subtract 10 to just remove it all together if it <10
                // Use GSAP function to help interpolate the reduction of the enemies upon Collision Detection.
                if (enemy.radius - 10 > 10) {

                    // increase our score 
                    score += 100
                    scoreEl.innerHTML = score

                    gsap.to(enemy, {
                        radius: enemy.radius - 10
                    })
                    setTimeout(() => {
                        projectiles.splice(projectileIndex, 1)
                    }, 0
                    )
                } else {
                    // remove enemy from scene altogether
                    score += 250
                    scoreEl.innerHTML = score

                    // Added a timeout so that the next frame removes the enemy and projectile from the array, cause it was flashing
                    setTimeout(() => {
                        enemies.splice(index, 1)
                        projectiles.splice(projectileIndex, 1)
                    }, 0)
                }
            }
        })
    })
}

// Listens for a click - Second argument will be a function that passes the arguments of the projectile constructor which defines where and when projectiles will appear.
addEventListener('click', (event) => {

    // Created a const called angle so that we could get the distance from our mouseclick to the center of the screen. event.clientX is just where the mouse clicked and subtract the width/2 is the center of the screen.
    const angle = Math.atan2(
        event.clientY - canvas.height / 2, 
        event.clientX - canvas.width / 2 
    )
    
    //Math.cos/sin produces a number between -1 and 1. Together cos/sin create a perfect ratio to move the projectile whichever way we want. Canvas is in radians, but if you click and find the coordinate of the angle it will be like -3.something. We can multiply our velocity by whatever number to make the projectiles faster.
    const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5
    }

    //When we click we want our projectiles array to push in a new instance of a projectile to have them all drawn at the same time. 
    projectiles.push(
        new Projectile(canvas.width / 2, canvas.height / 2, 5, 'white', velocity)
    )
})

//when we click start game the game will animate and spawnEnemies
startGameBtn.addEventListener('click', () => {
    init()
    animate()
    spawnEnemies()
    //this hides the modal when we click start game
    modalEl.style.display = 'none'
})



//!=============== WHAT I WANT TO ADD  =============

// think about how this could be applied.




//!===============  Checklist   =============   
/* create player
shoot projectiles
create enemies
detect collision on enemy / projectile hit
detect collision on enemy / player hit
remove off screen projectiles
colorize game
shrink enemies on hit
create particle explosion on hit
add score
add game over UI
add restart button
add start game button */

//=============== WHAT TO DO  =============