function pintar(hue=60, light){
    document.body.style.background = `hsl(${hue}deg,100%,${light}%)`
}

function calcularCor(event){
    let x = event.x
    let y = event.y
    

    let w = window.innerWidth
    let h = window.innerHeight

    console.log("POS", event.x, " :: ", event.y)
    let cor = (event.x * 360) / w
    let brilho = (h - event.y) / (h / 100)
    pintar(cor, brilho)
}

window.addEventListener("mousemove", calcularCor)
