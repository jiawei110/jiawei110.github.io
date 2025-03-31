import { loadImage } from './utils.js';

const canvas = document.getElementById("glCanvas");
const gl = canvas.getContext("webgl2");

if (!gl) {
    alert("WebGL is not supported!");
}

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

// Vertex Shader
const vsSource = `
    attribute vec3 position;
    attribute vec2 texCoord;
    attribute vec2 texCoord2;
    uniform vec4 translation;
    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;
    uniform mat4 rotationMatrix;
    varying vec2 vTexCoord;
    varying vec2 vTexCoord2;
    void main() {
        gl_Position = projectionMatrix * modelViewMatrix * rotationMatrix *( translation + vec4(position, 1.0));
        vTexCoord = texCoord;
        vTexCoord2 = texCoord2;

    }
`;

// Fragment Shader
const fsSource = `
    precision mediump float;
    varying vec2 vTexCoord;
    varying vec2 vTexCoord2;
    uniform sampler2D texture1;
    uniform sampler2D texture2;
    void main() {
        vec4 color1 = texture2D(texture1, vTexCoord);
        vec4 color2 = texture2D(texture2, vTexCoord2);
        gl_FragColor = color1*color2;

    }
`;

// Compile shaders
function createShader(gl, type, source) {
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}


class videotape{
    Vertices;
    indices;
    vertexBuffer;
    indexBuffer;
    positionLocation;
    texCoordLocation;
    texCoord2Location;

    vertexShader;
    fragmentShader;
    program;

    images;
    textures;
    textureLocations;


    modelViewMatrix;
    translationVec3=[0,0,0];
    
    modelViewMatrixLocation;
    projectionMatrixLocation;
    rotationMatrixLocation;
    translationLocation;



    //animation control
    UserInputControl = false;
    rotationTHETA = 0;
    rotationPHI = 0;

    constructor(){
        this.Vertices = new Float32Array([
            // x, y, z, u, v
            //front cover
            -0.5, -0.8,  0.2, 1, 1, 1, 1,
             0.5, -0.8,  0.2, 0, 1, 0, 1,
             0.5,  0.8,  0.2, 0, 0, 0, 0,
            -0.5,  0.8,  0.2, 1, 0, 1, 0,
            //back cover
            -0.5, -0.8, -0.2, 0, 0, 0, 0,
             0.5, -0.8, -0.2, 1, 0, 1, 0,
             0.5,  0.8, -0.2, 1, 1, 1, 1,  
            -0.5,  0.8, -0.2, 0, 1, 0, 1,
            //left cover
            -0.5, -0.8,  0.2, 0, 0, 1, 1,
            -0.5, -0.8, -0.2, 0, 0, 0, 1,
            -0.5,  0.8, -0.2, 0, 0, 0, 0,
            -0.5,  0.8,  0.2, 0, 0, 1, 0,
            //right cover
             0.5, -0.8,  0.2, 0, 0, 1, 1,
             0.5, -0.8, -0.2, 0, 0, 0, 1,
             0.5,  0.8, -0.2, 0, 0, 0, 0,
             0.5,  0.8,  0.2, 0, 0, 1, 0,
            //top cover
            -0.5,  0.8,  0.2, 0, 0, 1, 1,
             0.5,  0.8,  0.2, 0, 0, 0, 1,
             0.5,  0.8, -0.2, 0, 0, 0, 0,
            -0.5,  0.8, -0.2, 0, 0, 1, 0,
            //bottom cover
            -0.5, -0.8,  0.2, 0, 0, 1, 1,
             0.5, -0.8,  0.2, 0, 0, 0, 1,
             0.5, -0.8, -0.2, 0, 0, 0, 0,
            -0.5, -0.8, -0.2, 0, 0, 1, 0,
            //left disk 
            -0.45, -0.75, 0.15, 0, 0, 1, 1, //24
            -0.45, -0.75, -0.15, 0, 0, 0, 1, //25
            -0.45, 0.75, -0.15, 0, 0, 0, 0, //26
            -0.45, 0.75, 0.15, 0, 0, 1, 0, //27
            //top disk 
            -0.45, 0.75, 0.15, 0, 0, 1, 1, //28
            0.45, 0.75, 0.15, 0, 0, 0, 1,  //29
            0.45, 0.75, -0.15, 0, 0, 0, 0,  //30
            -0.45, 0.75, -0.15, 0, 0, 1, 0,  //31
        
            //bottom disk 
            -0.45, -0.75, 0.15, 0, 0, 0, 0,  //32
            0.45, -0.75, 0.15, 0, 0, 0, 0,  //33
            0.45, -0.75, -0.15, 0, 0, 0, 0,  //34
            -0.45, -0.75, -0.15, 0, 0, 0, 0,  //35
        
            //top disk innerface curve
            -0.45, 0.75, 0.15, 0, 0, 0, 0,  //36
            0.45, 0.75, 0.15, 0, 0, 0, 0,   //37
            0.40, 0.70, 0.13, 0, 0, 0, 0,   //38
            -0.40, 0.70, 0.13, 0, 0, 0, 0,  //39
        
            //bottom disk innerface curve
            -0.45, -0.75, 0.15, 0, 0, 0, 0,  //40
            0.45, -0.75, 0.15, 0, 0, 0, 0,   //41
            0.40, -0.70, 0.13, 0, 0, 0, 0,   //42
            -0.40, -0.70, 0.13, 0, 0, 0, 0,  //43
        
            //left disk innerface curve
            -0.45, 0.75, 0.15, 0, 0, 0, 0,  //44
            -0.45, -0.75, 0.15, 0, 0, 0, 0, //45
            -0.40, -0.70, 0.13, 0, 0, 0, 0, //46
            -0.40, 0.70, 0.13, 0, 0, 0, 0,  //47
        
            //disk innerface
            -0.40, 0.70, 0.13, 0, 0, 1, 1,  //48
            0.40, 0.70, 0.13, 0, 0, 0, 1,   //49
            0.40, -0.70, 0.13, 0, 0, 0, 0,  //50
            -0.40, -0.70, 0.13, 0, 0, 1, 0, //51
        
            //top disk innerback curve
            0.45, 0.75, -0.15, 0, 0, 0, 0,   //52
            -0.45, 0.75, -0.15, 0, 0, 0, 0,  //53
            -0.40, 0.70, -0.13, 0, 0, 0, 0,  //54
            0.40, 0.70, -0.13, 0, 0, 0, 0,   //55
        
            //bottom disk innerback curve
            0.45, -0.75, -0.15, 0, 0, 0, 0,  //56
            -0.45, -0.75, -0.15, 0, 0, 0, 0, //57
            -0.40, -0.70, -0.13, 0, 0, 0, 0, //58
            0.40, -0.70, -0.13, 0, 0, 0, 0,  //59
        
            //left disk innerback curve
            -0.45, -0.75, -0.15, 0, 0, 0, 0, //60
            -0.45, 0.75, -0.15, 0, 0, 0, 0,  //61
            -0.40, 0.70, -0.13, 0, 0, 0, 0,  //62
            -0.40, -0.70, -0.13, 0, 0, 0, 0, //63
        
            //disk innerback
            0.40, 0.70, -0.13, 0, 0, 1, 1,   //64
            -0.40, 0.70, -0.13, 0, 0, 0, 1,  //65
            -0.40, -0.70, -0.13, 0, 0, 0, 0, //66  
            0.40, -0.70, -0.13, 0, 0, 1, 0,  //67
        
            //front tape
            -0.34, -0.6250,  0.14, 0, 0, 0, 0, //68
             0.34, -0.6250,  0.14, 1, 0, 0, 0, //69
             0.34,  0.6250,  0.14, 1, 1, 0, 0, //70
            -0.34,  0.6250,  0.14, 0, 1, 0, 0, //71
            //back tape
            -0.34, -0.6250, -0.03, 0, 0, 0, 0, //72
             0.34, -0.6250, -0.03, 0, 0, 0, 0, //73
             0.34,  0.6250, -0.03, 0, 0, 0, 0, //74
            -0.34,  0.6250, -0.03, 0, 0, 0, 0, //75
            //left tape
            -0.34, -0.6250,  0.14, 0, 0, 0, 0, //76
            -0.34, -0.6250, -0.03, 0, 0, 0, 0, //77
            -0.34,  0.6250, -0.03, 0, 0, 0, 0, //78
            -0.34,  0.6250,  0.14, 0, 0, 0, 0, //79
            //right tape
             0.34, -0.6250,  0.14, 0, 0, 0, 0, //80
             0.34, -0.6250, -0.03, 0, 0, 0, 0, //81
             0.34,  0.6250, -0.03, 0, 0, 0, 0, //82
             0.34,  0.6250,  0.14, 0, 0, 0, 0, //83
            //top tape
            -0.34,  0.6250,  0.14, 0, 0, 0, 0, //84
             0.34,  0.6250,  0.14, 0, 0, 0, 0, //85
             0.34,  0.6250, -0.03, 0, 0, 0, 0, //86
            -0.34,  0.6250, -0.03, 0, 0, 0, 0, //87
            //bottom tape
            -0.34, -0.6250,  0.14, 0, 0, 0, 0, //88
             0.34, -0.6250,  0.14, 0, 0, 0, 0, //89
             0.34, -0.6250, -0.03, 0, 0, 0, 0, //90
            -0.34, -0.6250, -0.03, 0, 0, 0, 0, //91
            //tap front note
            -0.17, -0.3125,  0.141, 0, 0, 0, 0, //92
             0.17, -0.3125,  0.141, 0, 0, 0, 0, //93
             0.17,  0.3125,  0.141, 0, 0, 0, 0, //94
            -0.17,  0.3125,  0.141, 0, 0, 0, 0, //95
        
            //tap left note
            -0.341, -0.5,  0.11, 0, 0, 0, 0, //96
            -0.341, -0.5, 0.00, 0, 0, 0, 0, //97
            -0.341,  0.5, 0.00, 0, 0, 0, 0, //98
            -0.341,  0.5,  0.11, 0, 0, 0, 0, //99
        ]);
        this.indices = new Uint16Array([
            0,  1,  2,  0,  2,  3, // front cover face
            4,  5,  6,  4,  6,  7, // back cover face
            // 8,  9, 10,  8, 10, 11, // left cover face
           12, 13, 14, 12, 14, 15, // right cover face
        
           16, 17, 18, 16, 18, 19, // top cover face
           20, 21, 22, 20, 22, 23,  // bottom cover face
            24, 25, 26, 24, 26, 27, //left disk title face
            28, 29, 30, 28, 30, 31, //top disk outer face
            32, 33, 34, 32, 34, 35, //bottom disk outer face
        
            36, 37, 38, 36, 38, 39, //top disk innerface curve
            40, 41, 42, 40, 42, 43, //bottom disk innerface curve
            44, 45, 46, 44, 46, 47, //left disk innerface curve
            48, 49, 50, 48, 50, 51, //disk innerface
            52, 53, 54, 52, 54, 55, //top disk innerback curve
            56, 57, 58, 56, 58, 59, //bottom disk innerback curve
            60, 61, 62, 60, 62, 63, //left disk innerback curve
            64, 65, 66, 64, 66, 67, //disk innerback
        
            68, 69, 70, 68, 70, 71, //front tape face
            72, 73, 74, 72, 74, 75, //back tape face
            76, 77, 78, 76, 78, 79, //left tape face
            80, 81, 82, 80, 82, 83, //right tape face
            84, 85, 86, 84, 86, 87, //top tape face
            88, 89, 90, 88, 90, 91, //bottom tape face
            92, 93, 94, 92, 94, 95, //tap front note face
            96, 97, 98, 96, 98, 99, //tap left note face
        ]);
        //Matrix setup
        this.modelViewMatrix = new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, -3, 1,
        ]);

        //Shader and program setup
        this.program= gl.createProgram();
        this.vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
        this.fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
        gl.attachShader(this.program, this.vertexShader);
        gl.attachShader(this.program, this.fragmentShader);
        gl.linkProgram(this.program);
        gl.useProgram(this.program);
        
        this.vertexBuffer = gl.createBuffer();
        this.indexBuffer = gl.createBuffer();
        this.texture1 = gl.createTexture();
        this.texture2= gl.createTexture();

    }

    //texture setup
    async textureSetup(imageUrls,TextureNo) {
        gl.useProgram(this.program);
        
        // 初始化紋理儲存陣列
        this.textures = [];
        this.textureLocations = [];
        this.images = [];
    
        for (let i = 0; i < imageUrls.length; i++) {
            this.images[i] = await loadImage(imageUrls[i]);
            
            this.textures[i] = gl.createTexture();

    
            // 設置紋理數據
            
            gl.bindTexture(gl.TEXTURE_2D, this.textures[i]);
            gl.texImage2D(gl.TEXTURE_2D, 
                0, // level
                gl.RGBA, // internalFormat
                gl.RGBA, // format
                gl.UNSIGNED_BYTE, // type
                this.images[i]  // data
            );
            gl.generateMipmap(gl.TEXTURE_2D);  // 生成多級減小的紋理圖像
        
            // 取得 shader 中的 uniform 變數位置
            const location = gl.getUniformLocation(this.program, `texture${i+1}`);

            gl.useProgram(this.program);
            gl.uniform1i(location, TextureNo[i]); // 設定 shader 變數

            // 啟用對應的 TEXTURE 單元
            gl.activeTexture(gl.TEXTURE0 + TextureNo[i]);
            gl.bindTexture(gl.TEXTURE_2D, this.textures[i]);
        }
        // gl.activeTexture(gl.TEXTURE0+TextureNo[0]);
        // gl.bindTexture(gl.TEXTURE_2D, this.textures[0]);
        // gl.activeTexture(gl.TEXTURE0+TextureNo[1]);
        // gl.bindTexture(gl.TEXTURE_2D, this.textures[1]);
    }

    SetMatrices(VMatrix, PMatrix, RMatrix, TVec3){ //Sets the matrices and translation vector

        gl.useProgram(this.program);
        this.modelViewMatrix = VMatrix;
        this.translationVec3= TVec3;
        this.modelViewMatrixLocation = gl.getUniformLocation(this.program, "modelViewMatrix");
        this.projectionMatrixLocation = gl.getUniformLocation(this.program, "projectionMatrix");
        this.rotationMatrixLocation = gl.getUniformLocation(this.program, "rotationMatrix");

        this.translationLocation = gl.getUniformLocation(this.program, 'translation');

        gl.uniformMatrix4fv(this.modelViewMatrixLocation, false, VMatrix);
        gl.uniformMatrix4fv(this.projectionMatrixLocation, false, PMatrix);
        gl.uniformMatrix4fv(this.rotationMatrixLocation, false, RMatrix);
        gl.uniform4f(this.translationLocation, TVec3[0], TVec3[1], TVec3[2], 0.0)

    }

    AttributesAssign(){ //Rebinds the buffers and assigns the attributes

        // Create buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.Vertices, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

        // Assign attributes
        this.positionLocation = gl.getAttribLocation(this.program, "position");
        gl.vertexAttribPointer(this.positionLocation, 3, gl.FLOAT, false, 7 * Float32Array.BYTES_PER_ELEMENT, 0);
        gl.enableVertexAttribArray(this.positionLocation);

        this.texCoordLocation = gl.getAttribLocation(this.program, "texCoord");
        gl.vertexAttribPointer(this.texCoordLocation, 2, gl.FLOAT, false, 7 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
        gl.enableVertexAttribArray(this.texCoordLocation);

        this.texCoord2Location = gl.getAttribLocation(this.program, "texCoord2");
        gl.vertexAttribPointer(this.texCoord2Location, 2, gl.FLOAT, false, 7 * Float32Array.BYTES_PER_ELEMENT, 5 * Float32Array.BYTES_PER_ELEMENT);
        gl.enableVertexAttribArray(this.texCoord2Location);

    }
    FinalDraw(){ //Draws the object (include all checks)
        gl.useProgram(this.program);
        this.AttributesAssign();
        gl.activeTexture(gl.TEXTURE0+0);
        gl.bindTexture(gl.TEXTURE_2D, this.textures[0]);
        gl.activeTexture(gl.TEXTURE0+1);
        gl.bindTexture(gl.TEXTURE_2D, this.textures[1]);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
    }

}


/*==================== MATRIX =====================*/

function get_projection(angle, a ,zMin, zMax){
    var ang = Math.tan((angle*.5)*Math.PI/180);//angle*.5
    return [
        0.5/ang, 0 , 0, 0,
        0, 0.5*a/ang, 0, 0,
        0, 0, -(zMax+zMin)/(zMax-zMin), -1,
        0, 0, (-2*zMax*zMin)/(zMax-zMin), 0 
    ];
}

var proj_matrix = get_projection(40, canvas.width/canvas.height, 1, 100);
var mo_matrix = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
];
var view_matrix = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
];

view_matrix[14] = view_matrix[14]-3;

/*====================Mouse events====================*/

var AMORTIZATION = 0.95;
var drag = false;
var old_x, old_y;
var dX = 0, dY = 0;
var THETA = 0;
var PHI = 0;

var mouseDown = function(e){
    drag = true;
    old_x = e.pageX, old_y = e.pageY;
    e.preventDefault();
    return false;
};

var mouseUp = function(e){
    drag = false;
};

var mouseMove = function(e){
    if(!drag) return false;
    if(keepAll) return false;
    dX = (e.pageX-old_x)*2*Math.PI/canvas.width;
    dY = (e.pageY-old_y)*2*Math.PI/canvas.height;
    THETA += dX;
    PHI += dY;
    old_x = e.pageX, old_y = e.pageY;
    e.preventDefault();
};
canvas.addEventListener("mousedown", mouseDown, false);
canvas.addEventListener("mouseup", mouseUp, false);
canvas.addEventListener("mouseout", mouseUp, false);
canvas.addEventListener("mousemove", mouseMove, false);

/*=========================keyboard events================*/

var movdistance = 0;
var keepAll = false
var ShowDisk = false;
document.onkeydown = function(e){
    //space key
    if(e.keyCode == 32 && AutoMoving == false){
        ShowDisk = !ShowDisk;
    }
    //d key
    if(e.keyCode == 68 && AutoMoving == false){
        AutoMoving = true;
        keepAll = !keepAll;
    }

}


/*=========================rotation================*/

function rotateZ(m,angle){
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    var mv0 = m[0], mv4 = m[4], mv8 = m[8];
    
    m[0] = c*m[0]-s*m[1];
    m[4] = c*m[4]-s*m[5];
    m[8] = c*m[8]-s*m[9];
    
    m[1]=c*m[1]+s*mv0;
    m[5]=c*m[5]+s*mv4;
    m[9]=c*m[9]+s*mv8;
}

function rotateX(m,angle){
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    var mv1 = m[1], mv5 = m[5], mv9 = m[9];

    m[1] = m[1]*c-m[2]*s;
    m[5] = m[5]*c-m[6]*s;
    m[9] = m[9]*c-m[10]*s;

    m[2] = m[2]*c+mv1*s;
    m[6] = m[6]*c+mv5*s;
    m[10] = m[10]*c+mv9*s;
}

function rotateY(m,angle){
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    var mv0 = m[0], mv4 = m[4], mv8 = m[8];

    m[0] = c*m[0]+s*m[2];
    m[4] = c*m[4]+s*m[6];
    m[8] = c*m[8]+s*m[10];

    m[2] = c*m[2]-s*mv0; 
    m[6] = c*m[6]-s*mv4;
    m[10] = c*m[10]-s*mv8;
}

/*=================== Drawing =================== */
var videotapeWebglObjectConfig1 = new videotape();
videotapeWebglObjectConfig1.textureSetup(["https://jiawei110.github.io//MyBelovedPortfolio//textures//seiyatest.jpeg","https://jiawei110.github.io//MyBelovedPortfolio//textures//ranbowlight.jpg"],[0,1]);
videotapeWebglObjectConfig1.AttributesAssign();
// videotapeWebglObjectConfig1.SetMatrices(view_matrix, proj_matrix, mo_matrix, [0, 0, 0]);
videotapeWebglObjectConfig1.UserInputControl = true;

var videotapeWebglObjectConfig2 = new videotape();
videotapeWebglObjectConfig2.textureSetup(["https://jiawei110.github.io//MyBelovedPortfolio//textures//book2cover.jpg",'https://jiawei110.github.io//MyBelovedPortfolio//textures//book2back.jpg'],[0,1]);
videotapeWebglObjectConfig2.AttributesAssign();
// videotapeWebglObjectConfig2.SetMatrices(view_matrix, proj_matrix, mo_matrix, [0, 0, 0]);
videotapeWebglObjectConfig2.UserInputControl = false;

var videotapeWebglObjectConfig3 = new videotape();
videotapeWebglObjectConfig3.textureSetup(["https://jiawei110.github.io//MyBelovedPortfolio//textures//book2cover.jpg",'https://jiawei110.github.io//MyBelovedPortfolio//textures//ranbowlight.jpg'],[0,1]);
videotapeWebglObjectConfig2.AttributesAssign();
// videotapeWebglObjectConfig2.SetMatrices(view_matrix, proj_matrix, mo_matrix, [0, 0, 0]);
videotapeWebglObjectConfig2.UserInputControl = false;

var WebglObjects = [videotapeWebglObjectConfig1, videotapeWebglObjectConfig2, videotapeWebglObjectConfig3];


var THETA = 0;
var PHI = 0;
var time_old = 0;
var AutoMoving = false;

var animate = function(time){
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.clearColor(0.5, 0.5, 0.5, 0.9);
    gl.clearDepth(1.0);
    gl.viewport(0.0, 0.0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    window.requestAnimationFrame(animate);
    var objectIndex;
    
    for(objectIndex = 0 ; objectIndex < WebglObjects.length; objectIndex++){
        var WebglObject = WebglObjects[objectIndex];

        if (WebglObject.UserInputControl){
            WebglObject.rotationTHETA = THETA;
            WebglObject.rotationPHI = PHI;
            if (ShowDisk && WebglObject.Vertices[168] > -0.7){
                for(var i = 168; i < WebglObject.Vertices.length; i+=7){
                    WebglObject.Vertices[i] -= 0.01;
                }
            }
            else if (!ShowDisk && WebglObject.Vertices[168] < -0.46){
                for(var i = 168; i < WebglObject.Vertices.length; i+=7){
                    WebglObject.Vertices[i] += 0.01;
                }
            }

            if (keepAll && AutoMoving){
                dX = 0;
                dY = 0;
                ShowDisk = false;
                // normally 25 times looping in z
                if (WebglObject.modelViewMatrix[14]>-28){
                    WebglObject.modelViewMatrix[14] = WebglObject.modelViewMatrix[14]-1;
                    WebglObject.translationVec3[1]-=Math.pow(-1,objectIndex+1)/25;
                    WebglObject.translationVec3[2]-=(-1*objectIndex)/-25;
                }
        
                //rotate the book to the right position(show right cover)
                if (WebglObject.rotationTHETA > -90* Math.PI / 180){
                    if (WebglObject.rotationTHETA - (-90* Math.PI / 180) > 0.07){
                        WebglObject.rotationTHETA -= .07;
                    }
                    else{
                        WebglObject.rotationTHETA = -90* Math.PI / 180;
                    }
                }
                else if(WebglObject.rotationTHETA < -90* Math.PI / 180){
                    if (-90* Math.PI / 180 - WebglObject.rotationTHETA > 0.07){
                        WebglObject.rotationTHETA += .07;
                    }
                    else{
                        WebglObject.rotationTHETA = -90* Math.PI / 180;
                    }
                }
                if (WebglObject.rotationPHI >0){
                    if (WebglObject.rotationPHI - 0 > 0.07){
                        WebglObject.rotationPHI -= .07;
                    }
                    else{
                        WebglObject.rotationPHI = 0;
                    }
                }
                else if(WebglObject.rotationPHI < 0){
                    if (0 - WebglObject.rotationPHI > 0.07){
                        WebglObject.rotationPHI += .07;
                    }
                    else{
                        WebglObject.rotationPHI = 0;
                    }
                }
                if (WebglObject.rotationTHETA == -90* Math.PI / 180 && WebglObject.rotationPHI == 0 && WebglObject.modelViewMatrix[14] == -28){
                    // AutoMoving = false;
                    WebglObject.UserInputControl = false;
                    WebglObjects[(objectIndex+1)%WebglObjects.length].UserInputControl = true;
                    keepAll = !keepAll;
                }
            }
            if (!keepAll && AutoMoving){
                dX = 0;
                dY = 0;
                if (WebglObject.modelViewMatrix[14]<-3){
                    WebglObject.modelViewMatrix[14] = WebglObject.modelViewMatrix[14]+1;
                
                    WebglObject.translationVec3[1]+=Math.pow(-1,objectIndex+1)/25;
                    WebglObject.translationVec3[2]+=(-1*objectIndex)/-25;
                }
                else{
                    //next step : rotate the book to show front cover and left disk
                    if (WebglObject.rotationTHETA < 45* Math.PI / 180){
                        if (45* Math.PI / 180 - WebglObject.rotationTHETA > 0.07){
                            WebglObject.rotationTHETA += .07;
                        }
                        else{
                            WebglObject.rotationTHETA = 45* Math.PI / 180;
                        }
                    }
                    if(WebglObject.rotationPHI < 10* Math.PI / 180){
                        if (10* Math.PI / 180 - WebglObject.rotationPHI > 0.07){
                            WebglObject.rotationPHI += .07;
                        }
                        else{
                            WebglObject.rotationPHI = 10* Math.PI / 180;
                        }
                    }
                }
                if (WebglObject.rotationTHETA == 45* Math.PI / 180 && WebglObject.rotationPHI == 10* Math.PI / 180 && WebglObject.modelViewMatrix[14] == -3){
                    ShowDisk = true;
                    AutoMoving = false;
                }
            }

            var dt = time- time_old;
            if(!drag){
                dX *= AMORTIZATION, dY*=AMORTIZATION;
                WebglObject.rotationTHETA+=dX, WebglObject.rotationPHI+=dY;
            }

            //set model matrix to I4
            mo_matrix[0] = 1, mo_matrix[1] = 0, mo_matrix[2] = 0,
            mo_matrix[3] = 0,
            mo_matrix[4] = 0, mo_matrix[5] = 1, mo_matrix[6] = 0,
            mo_matrix[7] = 0,
            mo_matrix[8] = 0, mo_matrix[9] = 0, mo_matrix[10] = 1,
            mo_matrix[11] = 0,
            mo_matrix[12] = 0, mo_matrix[13] = 0, mo_matrix[14] = 0,
            mo_matrix[15] = 1;

            rotateY(mo_matrix, WebglObject.rotationTHETA);
            rotateX(mo_matrix, WebglObject.rotationPHI);

            time_old = time;

            //rewrite back
            THETA = WebglObject.rotationTHETA;
            PHI = WebglObject.rotationPHI;
        }
        if(!WebglObject.UserInputControl)
        {
            WebglObject.modelViewMatrix[14]=-28;
            WebglObject.rotationTHETA = -90* Math.PI / 180;
            WebglObject.rotationPHI = 0;
            WebglObject.translationVec3 = [0,Math.pow(-1,objectIndex),-1*objectIndex]

            //set model matrix to I4
            mo_matrix[0] = 1, mo_matrix[1] = 0, mo_matrix[2] = 0,
            mo_matrix[3] = 0,
            mo_matrix[4] = 0, mo_matrix[5] = 1, mo_matrix[6] = 0,
            mo_matrix[7] = 0,
            mo_matrix[8] = 0, mo_matrix[9] = 0, mo_matrix[10] = 1,
            mo_matrix[11] = 0,
            mo_matrix[12] = 0, mo_matrix[13] = 0, mo_matrix[14] = 0,
            mo_matrix[15] = 1;

            rotateY(mo_matrix, WebglObject.rotationTHETA);
            rotateX(mo_matrix, WebglObject.rotationPHI);
        }


        
        WebglObjects[objectIndex].AttributesAssign();
        WebglObjects[objectIndex].SetMatrices(WebglObject.modelViewMatrix, proj_matrix, mo_matrix, WebglObject.translationVec3);
        WebglObjects[objectIndex].FinalDraw();

    };
}
animate(0);

