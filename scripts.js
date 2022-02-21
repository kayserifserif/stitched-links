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

  // subdivision = 1.0 / (links.length + 1);
  subdivision = 1.0 / (links.length * 2 - 1);

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

  if (quoteIndex < quotes.length - 1) {
    quoteIndex++;
    quotes[quoteIndex].classList.add("show");
  }

  event.target.removeEventListener("click", nextQuote);
  event.target.addEventListener("click", e => e.preventDefault());

  // let quoteRect = quotes[quoteIndex].getBoundingClientRect();
  // let bottom = quoteRect.y + quoteRect.height;
  // document.body.scrollTo({
  //   top: window.innerHeight,
  //   behavior: "smooth"
  // });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgb(0, 0, 255)";
  ctx.lineWidth = 2;
  ctx.beginPath();

  // draw first underline
  let startUnderline = getUnderline(0);
  ctx.moveTo(startUnderline[0].x, startUnderline[0].y);
  animateBezier(0, startUnderline);

  for (let i = 0; i < quoteIndex; i++) {
    // connecting line
    let connection = getConnection(i, i + 1);
    animateBezier((i * 2) + 1, connection);

    // draw next underline
    let endUnderline = getUnderline(i + 1);
    animateBezier((i * 2) + 2, endUnderline);
  }

  ctx.stroke();

  requestAnimationFrame(draw);
}

function getUnderline(index) {
  let rect = links[index].getBoundingClientRect();
  let underline = [];
  for (let point = 0; point < 4; point++) {
    underline.push({
      x: rect.x + underlines[index][point].x,
      y: rect.y + underlines[index][point].y
    });
  }
  return underline;
}

function getConnection(startIndex, endIndex) {
  let start = links[startIndex].getBoundingClientRect();
  let startPoint = {
    x: start.x + underlines[startIndex][3].x,
    y: start.y + underlines[startIndex][3].y
  };

  let end = links[endIndex].getBoundingClientRect();
  let endPoint = {
    x: end.x + underlines[endIndex][0].x,
    y: end.y + underlines[endIndex][0].y
  };

  let connection = [
    startPoint,
    {
      x: startPoint.x + connections[startIndex][0].x,
      y: startPoint.y + connections[startIndex][0].y
    },
    {
      x: endPoint.x - connections[startIndex][1].x,
      y: endPoint.y - connections[startIndex][1].y
    },
    endPoint
  ];

  return connection;
}

function animateBezier(section, bezierPath) {
  for (let i = section * subdivision; i <= pct; i += inc) {
    let t = Math.min(((i - section * subdivision) / subdivision), 1.0);
    let point = threeOrderBezier(
      t,
      bezierPath[0],
      bezierPath[1],
      bezierPath[2],
      bezierPath[3]
    );
    ctx.lineTo(
      point.x,
      point.y
    );
  }

  if (pct <= (section + 1) * subdivision) {
    pct += inc;
  }
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