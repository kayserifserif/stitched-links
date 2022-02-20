const quotes = document.getElementsByClassName("quote");
const links = document.querySelectorAll(".quote a");
let quoteIndex = 0;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const underlineVariation = 15;
const connectionVariation = 5;

let pct = 0.0;
// let pct = 1.0;

let underlines = [];
let connections = [];
let points = [];

document.addEventListener("DOMContentLoaded", () => {
  resizeCanvas();

  window.addEventListener("resize", resizeCanvas);

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
  canvas.setAttribute("width", window.outerWidth);
  canvas.setAttribute("height", window.outerHeight);
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

  let bodyRect = document.body.getBoundingClientRect();
  let startRect = links[0].getBoundingClientRect();
  let start = {
    x: startRect.x - bodyRect.x,
    y: startRect.y - bodyRect.y
  };
  let startUnderline = [
    {
      x: start.x + underlines[0][0].x,
      y: start.y + underlines[0][0].y
    },
    {
      x: start.x + underlines[0][1].x,
      y: start.y + underlines[0][1].y
    },
    {
      x: start.x + underlines[0][2].x,
      y: start.y + underlines[0][2].y
    },
    {
      x: start.x + underlines[0][3].x,
      y: start.y + underlines[0][3].y
    }
  ];

  ctx.strokeStyle = "rgb(0, 0, 255)";
  ctx.lineWidth = 2;
  // ctx.beginPath();

  // draw first underline
  ctx.beginPath();
  ctx.moveTo(startUnderline[0].x, startUnderline[0].y);
  ctx.bezierCurveTo(
    startUnderline[1].x, startUnderline[1].y,
    startUnderline[2].x, startUnderline[2].y,
    startUnderline[3].x, startUnderline[3].y
  );
  // let point = threeOrderBezier(
  //   pct,
  //   [startUnderline[0].x, startUnderline[0].y],
  //   [startUnderline[1].x, startUnderline[1].y],
  //   [startUnderline[2].x, startUnderline[2].y],
  //   [startUnderline[3].x, startUnderline[3].y]
  // );
  // if (pct <= 0.99) {
  //   points.push(point);
  //   pct += 0.01;
  // }
  // for (let i = 0; i < points.length; i++) {
  //   ctx.lineTo(points[i][0], points[i][1]);
  // }
  // ctx.stroke();

  // ctx.beginPath();
  for (let i = 0; i < quoteIndex; i++) {
    let nextLink = links[quoteIndex];

    let endRect = nextLink.getBoundingClientRect();
    let end = {
      x: endRect.x - bodyRect.x,
      y: endRect.y - bodyRect.y
    };
    let endUnderline = [
      {
        x: end.x + underlines[i + 1][0].x,
        y: end.y + underlines[i + 1][0].y
      },
      {
        x: end.x + underlines[i + 1][1].x,
        y: end.y + underlines[i + 1][1].y
      },
      {
        x: end.x + underlines[i + 1][2].x,
        y: end.y + underlines[i + 1][2].y
      },
      {
        x: end.x + underlines[i + 1][3].x,
        y: end.y + underlines[i + 1][3].y
      }
    ];

    // midpoint
    let midpoint = {
      x: startUnderline[3].x + (endUnderline[0].x - startUnderline[3].x) * 0.5,
      y: startUnderline[3].y + (endUnderline[0].y - startUnderline[3].y) * 0.5
    }

    // first connecting line
    ctx.bezierCurveTo(
      startUnderline[3].x + connections[i][0].x, startUnderline[3].y + connections[i][0].y,
      endUnderline[0].x - connections[i][1].x, endUnderline[0].y - connections[i][1].y,
      endUnderline[0].x, endUnderline[0].y
    );

    // second connecting line

    // draw next underline
    ctx.bezierCurveTo(
      endUnderline[1].x, endUnderline[1].y,
      endUnderline[2].x, endUnderline[2].y,
      endUnderline[3].x, endUnderline[3].y
    );

    // if (pct <= 0.99) {
    //   pct += 0.01;
    // }
  }

  ctx.stroke();

  requestAnimationFrame(draw);
}

function threeOrderBezier(t, p1, cp1, cp2, p2) {
	//The parameters are t, start point, two control points and end point
	var [x1, y1] = p1,
		[cx1, cy1] = cp1,
		[cx2, cy2] = cp2,
		[x2, y2] = p2;
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
	return [x, y];
}