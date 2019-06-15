/* Variávei globais */

let {mat4, vec4, vec3, vec2} = glMatrix;

let kd = 0,
    kl = 0, 
    pos = [0,0,0];

let frame = 0,
    canvas,
    gl,
    vertexShaderSource,
    fragmentShaderSource,
    vertexShader,
    fragmentShader,
    shaderProgram,
    data,
    positionAttr,
    positionBuffer,
    normalAttr,
    normalBuffer,
    width,
    height,
    projectionUniform,
    projection,
    loc = [0, 0, 0],
    modelUniform,
    model,
    model2,
    appleRandom=true,
    jogoAtivo=true,
    score = 0,
    a=0,
    b=0,
    snakeLength=1,
    snakeXY = [],
    viewUniform,
    view,
    eye = [0, 0, 0],
    colorUniform,
    color1 = [1, 0, 0],
    color2 = [0, 0, 1],
    color3 = [0, .7, 0],
    color4 = [1, 0, 1],
    color5 = [1, .6, 0],
    color6 = [0, 1, 1],
    slidX,
    slidY,
    slidZ;

function resize() {
    if (!gl) return;
    width = 500;
    height = 500;
    canvas.setAttribute("width", width);
    canvas.setAttribute("height", height);
    gl.viewport(0, 0, width, height);
    let aspect = width / height;
    let near = 0.001;
    let far = 1000;
    let fovy = 1.3;
    projectionUniform = gl.getUniformLocation(shaderProgram, "projection");
    projection = mat4.perspective([], fovy, aspect, near, far);
    gl.uniformMatrix4fv(projectionUniform, false, projection);
}


function getCanvas() {
    return document.querySelector("canvas");
}

function getGLContext(canvas) {
    let gl = canvas.getContext("webgl");
    gl.enable(gl.DEPTH_TEST);
    return gl;
}

function compileShader(source, type, gl) {
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
        console.error("ERRO NA COMPILAÇÃO", gl.getShaderInfoLog(shader));
    return shader;
}

function linkProgram(vertexShader, fragmentShader, gl) {
    let program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
        console.error("ERRO NA LINKAGEM");
    return program;
}

function getData() {
    let p = {
        a: [-1, 1, -1],
        b: [-1, -1, -1],
        c: [1, 1, -1],
        d: [1, -1, -1],
        e: [-1, 1, 1],
        f: [1, 1, 1],
        g: [-1, -1, 1],
        h: [1, -1, 1]
    };

    let faces = [
        // FRENTE
        ...p.a, ...p.b, ...p.c,
        ...p.d, ...p.c, ...p.b,

        // TOPO
        ...p.e, ...p.a, ...p.f,
        ...p.c, ...p.f, ...p.a,

        // BAIXO
        ...p.b, ...p.g, ...p.d,
        ...p.h, ...p.d, ...p.g,

        // ESQUERDA
        ...p.e, ...p.g, ...p.a,
        ...p.b, ...p.a, ...p.g,

        // DIREITA
        ...p.c, ...p.d, ...p.f,
        ...p.h, ...p.f, ...p.d,

        //FUNDO
        ...p.f, ...p.h, ...p.e,
        ...p.g, ...p.e, ...p.h
    ];

    let n = {
        frente: [0,0,-1],
        topo: [0,1,0],
        baixo: [0,-1,0],
        esquerda: [-1,0,0],
        direita: [1,0,0],
        fundo: [0,0,1],
      };
    
      let faceNormals = {
        frente: [...n.frente, ...n.frente, ...n.frente, ...n.frente, ...n.frente, ...n.frente],
        topo: [...n.topo, ...n.topo, ...n.topo, ...n.topo, ...n.topo, ...n.topo],
        baixo: [...n.baixo, ...n.baixo, ...n.baixo, ...n.baixo, ...n.baixo, ...n.baixo],
        esquerda: [...n.esquerda, ...n.esquerda, ...n.esquerda, ...n.esquerda, ...n.esquerda, ...n.esquerda],
        direita: [...n.direita, ...n.direita, ...n.direita, ...n.direita, ...n.direita, ...n.direita],
        fundo: [...n.fundo, ...n.fundo, ...n.fundo, ...n.fundo, ...n.fundo, ...n.fundo],
      };
    
      let normals = [
        ...faceNormals.frente,
        ...faceNormals.topo,
        ...faceNormals.baixo,
        ...faceNormals.esquerda,
        ...faceNormals.direita,
        ...faceNormals.fundo
      ];

    return { "points": new Float32Array(faces), "normals": new Float32Array(normals)};
}

function getData2() {
    let p = {
        a: [-1, 1, -1],
        b: [-1, -1, -1],
        c: [1, 1, -1],
        d: [1, -1, -1],
        e: [-1, 1, 1],
        f: [1, 1, 1],
        g: [-1, -1, 1],
        h: [1, -1, 10]
    };

    let faces = [
        // FRENTE
        ...p.a, ...p.b, ...p.c,
        ...p.d, ...p.c, ...p.b,

        // TOPO
        ...p.e, ...p.a, ...p.f,
        ...p.c, ...p.f, ...p.a,

        // BAIXO
        ...p.b, ...p.g, ...p.d,
        ...p.h, ...p.d, ...p.g,

        // ESQUERDA
        ...p.e, ...p.g, ...p.a,
        ...p.b, ...p.a, ...p.g,

        // DIREITA
        ...p.c, ...p.d, ...p.f,
        ...p.h, ...p.f, ...p.d,

        //FUNDO
        ...p.f, ...p.h, ...p.e,
        ...p.g, ...p.e, ...p.h
    ];

    let n = {
        frente: [0,0,-1],
        topo: [0,1,0],
        baixo: [0,-1,0],
        esquerda: [-1,0,0],
        direita: [1,0,0],
        fundo: [0,0,1],
      };
    
      let faceNormals = {
        frente: [...n.frente, ...n.frente, ...n.frente, ...n.frente, ...n.frente, ...n.frente],
        topo: [...n.topo, ...n.topo, ...n.topo, ...n.topo, ...n.topo, ...n.topo],
        baixo: [...n.baixo, ...n.baixo, ...n.baixo, ...n.baixo, ...n.baixo, ...n.baixo],
        esquerda: [...n.esquerda, ...n.esquerda, ...n.esquerda, ...n.esquerda, ...n.esquerda, ...n.esquerda],
        direita: [...n.direita, ...n.direita, ...n.direita, ...n.direita, ...n.direita, ...n.direita],
        fundo: [...n.fundo, ...n.fundo, ...n.fundo, ...n.fundo, ...n.fundo, ...n.fundo],
      };
    
      let normals = [
        ...faceNormals.frente,
        ...faceNormals.topo,
        ...faceNormals.baixo,
        ...faceNormals.esquerda,
        ...faceNormals.direita,
        ...faceNormals.fundo
      ];

    return { "points": new Float32Array(faces), "normals": new Float32Array(normals)};
}

async function main() {
    document.getElementById("sliderx").oninput = function() {
        sliderControls()
    };
    document.getElementById("slidery").oninput = function() {
        sliderControls()
    };
    document.getElementById("sliderz").oninput = function() {
        sliderControls()
    };
    // 1 - Carregar tela de desenho
    canvas = getCanvas();

    // 2 - Carregar o contexto (API) WebGL
    gl = getGLContext(canvas);

    // 3 - Ler os arquivos de shader
    vertexShaderSource = await fetch("vertex.glsl").then(r => r.text());
    console.log("VERTEX", vertexShaderSource);

    fragmentShaderSource = await fetch("fragment.glsl").then(r => r.text());
    console.log("FRAGMENT", fragmentShaderSource);

    // 4 - Compilar arquivos de shader
    vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER, gl);
    fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER, gl);

    // 5 - Linkar o programa de shader
    shaderProgram = linkProgram(vertexShader, fragmentShader, gl);
    gl.useProgram(shaderProgram);

    // 6 - Criar dados de parâmetro
    data = getData();
    data2 = getData2()

    // 7 - Transferir os dados para GPU
    positionAttr = gl.getAttribLocation(shaderProgram, "position");
    positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, data.points, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionAttr);
    gl.vertexAttribPointer(positionAttr, 3, gl.FLOAT, false, 0, 0);

    normalAttr = gl.getAttribLocation(shaderProgram, "normal");
    normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, data.normals, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(normalAttr);
    gl.vertexAttribPointer(normalAttr, 3, gl.FLOAT, false, 0, 0);

    // CHAO NEGOCIO

    normalAttr = gl.getAttribLocation(shaderProgram, "normal");
    normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, data2.normals, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(normalAttr);
    gl.vertexAttribPointer(normalAttr, 3, gl.FLOAT, false, 0, 0);

    // 7.1 - PROJECTION MATRIX UNIFORM
    resize();
    window.addEventListener("resize", resize);

    // 7.2 - VIEW MATRIX UNIFORM
    eye  = [0, 55, 50];
    let up = [1, 0, 0];
    let center = [0, 0, 0];
    view = mat4.lookAt([], eye, center, up);
    viewUniform = gl.getUniformLocation(shaderProgram, "view");
    gl.uniformMatrix4fv(viewUniform, false, view);

    // 7.3 - MODEL MATRIX UNIFORM
    modelUniform = gl.getUniformLocation(shaderProgram, "model");
    
    model = mat4.fromTranslation([], pos);

    model2 = mat4.fromTranslation([], [-15,-15,-15]);

    model2 = mat4.fromScaling([],[80,0.01,80]);
    


    // 7.4 - COLOR UNIFORM
    colorUniform = gl.getUniformLocation(shaderProgram, "color");
    // gl.uniform2f(locationUniform, loc[0], loc[1]);

    // 8 - Chamar o loop de redesenho
    render();

}

function render() {

    frame ++;

    pos[0] += kl;
    pos[1] = 10;
    pos[2] -= kd;

    model = mat4.fromTranslation([], pos);

    let up = [0, 1, 0];
    let center = [0, 0, 0];
    view = mat4.lookAt([], eye, center, up);
    gl.uniformMatrix4fv(viewUniform, false, view);


    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // gl.POINTS
    // gl.LINES, gl.LINE_STRIP, gl.LINE_LOOP
    // gl.TRIANGLES, gl.TRIANGLE_STRIP, gl.TRIANGLE_FAN 
    // gl.drawArrays(gl.TRIANGLES, 0, data.points.length / 2);

    // CHAO
    gl.uniformMatrix4fv(modelUniform, false, model2);
    gl.uniform3f(colorUniform, color3[0], color3[1], color3[2]);
    gl.drawArrays(gl.TRIANGLES, 0, 36);
    
    // CUBO POWER UP
    gl.uniformMatrix4fv(modelUniform, false, apple());
    gl.uniform3f(colorUniform, color1[0], color1[1], color1[2]);
    gl.drawArrays(gl.TRIANGLES, 0, 36);

    // CUBO JOGADOR
    gl.uniformMatrix4fv(modelUniform, false, model);
    gl.uniform3f(colorUniform, color2[0], color2[1], color2[2]);
    gl.drawArrays(gl.TRIANGLES, 0, 36);

    let posAtual = [];
    posAtual.push(pos[0]);
    posAtual.push(pos[1]);
    posAtual.push(pos[2]);
    snakeXY.push(posAtual);
    if (snakeXY.length > snakeLength) snakeXY.shift();

    snakePlayer();

    // Se a posição da snake é proxima da apple em x e z, então randomizar nova posição da apple
    if (Math.floor(pos[0]) >= Math.floor(a)-1 && Math.floor(pos[0]) <= Math.floor(a)+1 &&
        Math.floor(pos[2]) >= Math.floor(b)-1 && Math.floor(pos[2]) <= Math.floor(b)+1){
        appleRandom = true;
        score += 100;
        document.getElementById("score").innerHTML = `Score: ${score}`;
        snakeLength++;
    }

    // Limite da tela
    // Direita
    if (pos[0] > (width/6.6)) pos[0] = -pos[0]+1;
    // Baixo
    else if (pos[2] > (height/6.6)) pos[2] = -pos[2]+1;
    // Esquerda
    else if (pos[0] < (-width/6.6)) pos[0] *= (-1);
    // Cima
    else if (pos[2] < (-height/6.6)) pos[2] *= (-1);

    // Se a posição de dois cubos por igual dá gameover
    for(var i=0; i < snakeXY.length-1; i++){
        if(snakeXY[snakeXY.length-1][0] == snakeXY[i][0] && snakeXY[snakeXY.length-1][2] == snakeXY[i][2]){
            jogoAtivo = false;
            alert("Game Over!");
            promptName(score);
            score = 0;
            document.getElementById("score").innerHTML = `Score: ${score}`;


            restart();
            
        }
    }
    
    if(jogoAtivo) {
        window.requestAnimationFrame(render);
        document.getElementById("controls").style.display = "none";
    }
}

function follow(evt) {
    let locX = evt.x / window.innerWidth * 2 - 1;
    let locY = evt.y / window.innerHeight * -2 + 1;
    loc = [locX, locY];
}

function keyUp(evt){}

function restart(){
    snakeXY = [];
    snakeLength = 1;
    kd = 0, 
    kl = 0, 
    pos = [0,0,0];
    a = Math.random()* (((width/10)-10)  + ((width/10)-10) + 1) - ((width/10)-10);
    b = Math.random()* (((height/10)-10) + ((height/10)-10) + 1) - ((height/10)-10);
    jogoAtivo = true;
}

function keyDown(evt){
    if(evt.key === "ArrowUp" && kd >= 0){
        kl=0;
        return kd = 1.1;
    }
    if(evt.key === "ArrowDown" && kd <= 0) {
        kl=0;
        return kd = -1.1;
    }
    if(evt.key === "ArrowLeft" && kl <= 0) {
        kd=0;
        return kl = -1.1;
    }
    if(evt.key === "ArrowRight" && kl >= 0) { 
        kd=0;
        return kl = 1.1;
    }
    if(evt.key === "P") { 
        snakeLength++;
        score += 100;
        document.getElementById("score").innerHTML = `Pontos: ${score}`;
    }
}

function apple(){
    if(appleRandom === true){
        // randomiza uma posição x e z dentro do tamanho da tela
        a = Math.random()* (((width/10)-10)  + ((width/10)-10) + 1) - ((width/10)-10);
        b = Math.random()* (((height/10)-10) + ((height/10)-10) + 1) - ((height/10)-10);

        appleRandom = false;
    }
    return mat4.fromTranslation([], [a, 10, b]);
}

function snakePlayer(){
    for(let i=0; i < snakeXY.length; i++){
        gl.uniformMatrix4fv(modelUniform, false, mat4.fromTranslation([], snakeXY[i]));
        gl.uniform3f(colorUniform, color2[0], color2[1], color2[2]);
        gl.drawArrays(gl.TRIANGLES, 0, 36); 
    }
}

function sliderControls() {
    window.requestAnimationFrame(render);

    slidX = document.getElementById("sliderx").value;
    document.getElementById('outputx').innerHTML = slidX;
    slidY = document.getElementById("slidery").value;
    document.getElementById('outputy').innerHTML = slidY;
    slidZ = document.getElementById("sliderz").value;
    document.getElementById('outputz').innerHTML = slidZ;
    eye  = [slidX, slidY, slidZ];

}

function pauseControls(){
    window.requestAnimationFrame(render);
    jogoAtivo = !jogoAtivo;

    if (!jogoAtivo) {
        document.getElementById("controls").style.display = "block";
        document.getElementById("pauseBtn").innerHTML = "▶";
    }
    else {
        document.getElementById("pauseBtn").innerHTML = "||";
    }
}

function addScore(tableID, name, text) {
    let tableRef = document.getElementById(tableID);

    let newRow = tableRef.insertRow(-1);

    let player = newRow.insertCell(0);
    let score = newRow.insertCell(1);

    let nomePlayer = document.createTextNode(name);
    let pontoPlayer = document.createTextNode(text);

    player.appendChild(nomePlayer);
    score.appendChild(pontoPlayer)
}

function promptName(score){
    var nickname = prompt("Please enter your name. Ex: LUK", "LUK");

    if (nickname.length > 3)
        nickname = nickname.slice(0, 3);

    addScore('table_score', nickname, score);

}

// keypress, keydown, keyup
window.addEventListener("load", main);

window.addEventListener("mousemove", follow);

window.addEventListener("keyup", keyUp);

window.addEventListener("keydown", keyDown);
