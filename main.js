const modal = document.getElementById("modalcontainer");
const modal_text = document.getElementById("modaltext");
const imageselector = document.getElementById('imageselector');
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const data = { x: 0, y: 0, clicked: null, cidx: 0, image: null, glyph_index: 2, timeout: null};
const bsize = Math.floor(window.innerHeight / 16);

window.onload = (event) => {
    const arquivo = imageselector.files[0];

    if (arquivo) {
        const imagem = new Image();
        imagem.src = URL.createObjectURL(arquivo);

        imagem.onload = function () {
            data.image = imagem;
            data.glyph_index = arquivo.name.split("glyph_E")[1].split(".")[0];

            updateCanvas();
        }
    }

    updateCanvas();
}

imageselector.addEventListener('change', function (event) {
    const arquivo = event.target.files[0];
    if (arquivo) {
        const imagem = new Image();
        imagem.src = URL.createObjectURL(arquivo);

        imagem.onload = function () {
            data.image = imagem;
            data.glyph_index = arquivo.name.split("glyph_E")[1].split(".")[0];
        };

        updateCanvas();
    }
})


document.onmousemove = (event) => {
    var eventDoc, doc, body;
    var rect = canvas.getBoundingClientRect();

    event = event || window.event;

    if (event.pageX == null && event.clientX != null) {
        eventDoc = (event.target && event.target.ownerDocument) || document;
        doc = eventDoc.documentElement;
        body = eventDoc.body;

        event.pageX = event.clientX +
            (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
            (doc && doc.clientLeft || body && body.clientLeft || 0);
        event.pageY = event.clientY +
            (doc && doc.scrollTop || body && body.scrollTop || 0) -
            (doc && doc.clientTop || body && body.clientTop || 0); // https://stackoverflow.com/questions/7790725/javascript-track-mouse-position
    }
    if (
        event.pageX > rect.left && event.pageX < rect.left + ctx.canvas.width &&
        event.pageY > rect.top && event.pageY < rect.top + ctx.canvas.height
    )
        updateCanvas({ x: event.pageX - rect.left, y: event.pageY - rect.top });
    else
        updateCanvas();
}

function showMessage(message) {
    modal_text.innerHTML = message;
    modal.style.display = "flex";
    
    if(data.timeout)
        clearTimeout(data.timeout)
    
    data.timeout = setTimeout(() => {
        modal.style.display = "none";
    }, 1000);
}

function symbol_gen(index, x, y) {
    if (x > 9)
        x = "abcdef".charAt(x - 9);

    return [String.fromCodePoint(parseInt(`0xE${index ?? 2}${y}${x}`, 16)), `0xE${index ?? 2}${y}${x}`];
}

function updateCanvas(mouseEntry) {
    ctx.canvas.width = bsize * 16;
    ctx.canvas.height = bsize * 16;

    var i = 0;

    for (var x = 0; x < 16; x++) {
        for (var y = 0; y < 16; y++) {
            ctx.fillStyle = ((i++ % 2 == 0) ? "#C0C0C0" : "#808080");
            ctx.fillRect(x * bsize, y * bsize, bsize, bsize);
        };

        i++;
    }

    if (mouseEntry) {
        const { x, y } = mouseEntry;

        const nx = Math.floor(x / bsize) * bsize;
        const ny = Math.floor(y / bsize) * bsize;

        ctx.strokeStyle = "#ae2012";
        ctx.rect(nx, ny, bsize, bsize);
        ctx.stroke();

        data.x = nx;
        data.y = ny;
    }

    if (data.image) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(data.image, 0, 0, bsize * 16, bsize * 16);
    }

    if (data.clicked) {
        ctx.strokeStyle = "#ae2012";
        ctx.rect(data.clicked.x, data.clicked.y, bsize, bsize);
        ctx.stroke();
    }
}

onclick = (event) => {
    data.clicked = {
        x: data.x,
        y: data.y
    }

    data.cidx = { x: Math.floor(data.x / bsize), y: Math.floor(data.y / bsize) };

    updateCanvas();

    const symbol = (symbol_gen(data.glyph_index, data.cidx.x, data.cidx.y));
    const inputTemporario = document.createElement('input');

    inputTemporario.value = symbol[0];
    document.body.appendChild(inputTemporario);
    inputTemporario.select();
    document.execCommand('copy');
    document.body.removeChild(inputTemporario);

    showMessage(`the symbol "${symbol[1]}" has been copied`);
}