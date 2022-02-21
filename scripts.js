const quotes = document.getElementsByClassName("quote");
const links = document.querySelectorAll(".quote a");
let quoteIndex = 0;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const underlineVariation = 15;
const connectionVariation = 5;

let pct = 0.0;
let subdivision;
const inc = 0.005;

let underlines = [];
let connections = [];
let points = [];

document.addEventListener("DOMContentLoaded", () => {
  resizeCanvas();

  window.addEventListener("resize", resizeCanvas);

  subdivision = 1.0 / (links.length + 1);

  for (let i = 0; i < links.length; i++) {
    links[i].addEventListener("click", nextQuote);
    if (i < links.length - 1) {
      makePoints(i);
    }
  }

  draw();
});

function makePoints(i) {
  let rect = links[i].getBoundingClientRect();

  // underline
  let underline = [];
  underline.push({
    x: 0,
    y: rect.height
  });
  underline.push({
    x: Math.random() * rect.width,
    y: rect.height + (Math.random() - 0.5) * underlineVariation
  });
  underline.push({
    x: underline[1].x + Math.random() * (rect.width - underline[1].x),
    y: rect.height + (Math.random() - 0.5) * underlineVariation
  });
  underline.push({
    x: rect.width,
    y: rect.height
  });
  underlines.push(underline);

  // connection
  if (i < links.length - 1) {
    let nextRect = links[i + 1].getBoundingClientRect();

    // next underline
    let nextUnderline = [];
    nextUnderline.push({
      x: 0,
      y: nextRect.height
    });
    nextUnderline.push({
      x: Math.random() * rect.width,
      y: nextRect.height + (Math.random() - 0.5) * underlineVariation
    });
    nextUnderline.push({
      x: nextUnderline[1].x + Math.random() * (nextRect.width - nextUnderline[1].x),
      y: nextRect.height + (Math.random() - 0.5) * underlineVariation
    });
    nextUnderline.push({
      x: nextRect.width,
      y: nextRect.height
    });
    underlines.push(nextUnderline);
    
    // connection
    let connection = [];
    connection.push({
      x: (underline[3].x - underline[2].x) * connectionVariation,
      y: (underline[3].y - underline[2].y) * connectionVariation
    });
    connection.push({
      x: (nextUnderline[1].x - nextUnderline[0].x) * connectionVariation,
      y: (nextUnderline[1].y - nextUnderline[0].y) * connectionVariation
    });
    connections.push(connection);
  }
}

function resizeCanvas() {
  canvas.setAttribute("width", window.outerWidth * 2);
  canvas.setAttribute("height", window.outerHeight * 2);
  canvas.style.width = window.outerWidth + "px";
  canvas.style.height = window.outerHeight + "px";
  ctx.scale(2, 2);
}

function nextQuote(event) {
  event.preventDefault();

  if (quoteIndex + 1 < quotes.length) {
    quoteIndex++;
    quotes[quoteIndex].classList.add("show");
  }

  // window.scrollTo({
  //   top: window.innerHeight,
  //   behavior: "smooth"
  // });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let start = links[0].getBoundingClientRect();
  let startUnderline = [];
  for (let i = 0; i < 4; i++) {
    startUnderline.push({
      x: start.x + underlines[0][i].x,
      y: start.y + underlines[0][i].y
    });
  }

  ctx.strokeStyle = "rgb(0, 0, 255)";
  ctx.lineWidth = 2;
  ctx.beginPath();

  // draw first underline
  ctx.moveTo(
    startUnderline[0].x,
    startUnderline[0].y
  );
  for (let i = 0.0; i <= pct; i += inc) {
    let t = Math.min((i / subdivision), 1.0);
    let point = threeOrderBezier(
      t,
      startUnderline[0],
      startUnderline[1],
      startUnderline[2],
      startUnderline[3]
    );
    ctx.lineTo(
      point.x,
      point.y
    );
  }
  if (pct <= subdivision) {
    pct += inc;
  }

  for (let i = 0; i < quoteIndex; i++) {
    let nextLink = links[quoteIndex];

    let end = nextLink.getBoundingClientRect();
    let endUnderline = [];
    for (let j = 0; j < 4; j++) {
      endUnderline.push({
        x: end.x + underlines[i + 1][j].x,
        y: end.y + underlines[i + 1][j].y
      });
    }

    // connecting line
    for (let j = (i + 1) * subdivision; j <= pct; j += inc) {
      let t = Math.min(((j - (i + 1) * subdivision) / subdivision), 1.0);
      let point = threeOrderBezier(
        t,
        startUnderline[3],
        {
          x: startUnderline[3].x + connections[i][0].x,
          y: startUnderline[3].y + connections[i][0].y
        },
        {
          x: endUnderline[0].x - connections[i][1].x,
          y: endUnderline[0].y - connections[i][1].y
        },
        endUnderline[0]
      );
      ctx.lineTo(
        point.x,
        point.y
      );
    }

    if (pct <= (i + 2) * subdivision) {
      pct += inc;
    }

    // draw next underline
    for (let j = (i + 2) * subdivision; j <= pct; j += inc) {
      let t = Math.min(((j - (i + 2) * subdivision) / subdivision), 1.0);
      let point = threeOrderBezier(
        t,
        endUnderline[0],
        endUnderline[1],
        endUnderline[2],
        endUnderline[3]
      );
      ctx.lineTo(
        point.x,
        point.y
      );
    }

    if (pct <= (i + 3) * subdivision) {
      pct += inc;
    }
  }

  ctx.stroke();

  requestAnimationFrame(draw);
}

// https://blog.katastros.com/a?ID=01750-8f9684a6-b537-43f2-9f6a-699632760434
function threeOrderBezier(t, p1, cp1, cp2, p2) {
	//The parameters are t, start point, two control points and end point
	// var [x1, y1] = p1,
	// 	[cx1, cy1] = cp1,
	// 	[cx2, cy2] = cp2,
	// 	[x2, y2] = p2;
  var {x: x1, y: y1} = p1,
    {x: cx1, y: cy1} = cp1,
    {x: cx2, y: cy2} = cp2,
    {x: x2, y: y2} = p2;
	var x =
		x1 * (1-t) * (1-t) * (1-t) +
		3 * cx1 * t * (1-t) * (1-t) +
		3 * cx2 * t * t * (1-t) +
		x2 * t * t * t;
	var y =
		y1 * (1-t) * (1-t) * (1-t) +
		3 * cy1 * t * (1-t) * (1-t) +
		3 * cy2 * t * t * (1-t) +
		y2 * t * t * t;
	// return [x, y];
  return {x: x, y: y};
}