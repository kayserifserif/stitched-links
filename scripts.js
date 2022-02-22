const quotes = document.getElementsByClassName("quote");
const links = document.querySelectorAll(".quote a");
let quoteIndex = 0;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// media query
const BREAKPOINT = 800;
let windowWidth;

// how much variation is in the curve of the underline
const UNDERLINE_VARIATION = 15;
// how big the arc of the connection is
const CONNECTION_SIZE = 8;

// keeps track of where we are in the animation
let pct = 0.0;
// keeps track of what point each section should animate to
let subdivision;
// speed of the animation
const INCREMENT = 0.005;

let underlines = [];
let connections = [];

const debugBtn = document.getElementById("debug");
// show control points and lines of the bezier curves
let debug = false;

document.addEventListener("DOMContentLoaded", () => {

  // resize canvas and add listener to resize again
  // any time the window size changes
  windowWidth = window.innerWidth;
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  // for debugging the bezier curves
  debugBtn.checked = debug;
  debugBtn.addEventListener("click", onDebugClick);

  // calculate subdivisions for timing
  subdivision = 1.0 / (links.length * 2 - 1);

  create();
  draw();
});

function onDebugClick() {
  debug = debugBtn.checked;
}

function create() {
  underlines = [];
  connections = [];

  // make points for the first underline
  let rect = links[0].getBoundingClientRect();
  let underline = makeUnderline(rect);
  underlines.push(underline);

  // make points for all other underlines and connections
  for (let i = 0; i < links.length; i++) {
    links[i].addEventListener("click", nextQuote);
    if (i < links.length - 1) {
      // current underline
      let underline = underlines[i];

      // next underline
      let nextRect = links[i + 1].getBoundingClientRect();
      let nextUnderline = makeUnderline(nextRect);
      underlines.push(nextUnderline);
      
      // connection
      let connection = makeConnection(underline, nextUnderline);
      connections.push(connection);
    }
  }
}

function makeUnderline(rect) {
  let underline = [];

  // everything relative to the top left x and y coords
  underline.push({
    x: 0,
    y: rect.height
  });
  underline.push({
    // somewhere in the first half of the underline
    x: (Math.random() * 0.25 + 0.25) * rect.width,
    // some random amount above or below the underline
    y: rect.height + (Math.random() * 2 - 1) * UNDERLINE_VARIATION
  });
  underline.push({
    // somewhere in the second half of the underline
    x: (Math.random() * 0.25 + 0.5) * rect.width,
    // some random amount above or below the underline
    y: rect.height + (Math.random() * 2 - 1) * UNDERLINE_VARIATION
  });
  underline.push({
    x: rect.width,
    y: rect.height
  });

  return underline;
}

function makeConnection(startUnderline, endUnderline) {
  let connection = [];

  // extends out from the last two points of the previous underline
  connection.push({
    x: (startUnderline[3].x - startUnderline[2].x) * CONNECTION_SIZE,
    y: (startUnderline[3].y - startUnderline[2].y) * CONNECTION_SIZE
  });
  // continues into the first two points of the next underline
  connection.push({
    x: (endUnderline[0].x - endUnderline[1].x) * CONNECTION_SIZE,
    y: (endUnderline[0].y - endUnderline[1].y) * CONNECTION_SIZE
  });

  return connection;
}

function resizeCanvas() {
  // resize according to device pixel ratio
  // accounting for retina displays
  let scale = window.devicePixelRatio;

  // set css style so it fits the window
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";

  // but calculate pixels as if it were bigger than the window
  canvas.width = Math.floor(window.innerWidth * scale);
  canvas.height = Math.floor(window.innerHeight * scale);

  // then scale everything up
  ctx.scale(scale, scale);

  // observe media query and recreate points at brekapoint
  if (windowWidth >= BREAKPOINT && window.innerWidth < BREAKPOINT ||
      windowWidth < BREAKPOINT && window.innerWidth >= BREAKPOINT) {
    create();
  }
  windowWidth = window.innerWidth;
}

function nextQuote(event) {
  event.preventDefault();

  // show the next quote
  quoteIndex++;
  if (quoteIndex < quotes.length) {
    quotes[quoteIndex].classList.add("show");
    // scroll down to the link that was just clicked
    let linkRect = links[quoteIndex - 1].getBoundingClientRect();
    document.body.scrollTo({
      top: linkRect.y,
      behavior: "smooth"
    });
  }

  // prevent the link from being clicked again
  event.target.removeEventListener("click", nextQuote);
  event.target.addEventListener("click", e => e.preventDefault());
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.lineWidth = 2;

  // draw first underline
  let startUnderline = getUnderline(0);
  ctx.beginPath();
  ctx.strokeStyle = "rgb(0, 0, 255)";
  ctx.moveTo(startUnderline[0].x, startUnderline[0].y);
  animateBezier(0, startUnderline);
  ctx.stroke();

  for (let i = 0; i < quoteIndex; i++) {
    if (i < quotes.length - 1) {
      // draw connecting line
      let connection = getConnection(i, i + 1);
      ctx.beginPath();
      ctx.strokeStyle = "rgb(0, 0, 255)";
      animateBezier((i * 2) + 1, connection);
      ctx.stroke();

      // draw next underline
      let endUnderline = getUnderline(i + 1);
      ctx.beginPath();
      ctx.strokeStyle = "rgb(0, 0, 255)";
      animateBezier((i * 2) + 2, endUnderline);
      ctx.stroke();
    }
  }

  // go again!
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

  if (debug) {
    // show the points and lines of the curve
    ctx.beginPath();
    ctx.strokeStyle = "rgb(255, 0, 0)";
    ctx.moveTo(underline[0].x, underline[0].y);
    ctx.ellipse(underline[0].x, underline[0].y, 5, 5, 0, 0, 2 * Math.PI);
    ctx.lineTo(underline[1].x, underline[1].y);
    ctx.ellipse(underline[1].x, underline[1].y, 5, 5, 0, 0, 2 * Math.PI);
    ctx.moveTo(underline[2].x, underline[2].y);
    ctx.ellipse(underline[2].x, underline[2].y, 5, 5, 0, 0, 2 * Math.PI);
    ctx.lineTo(underline[3].x, underline[3].y);
    ctx.ellipse(underline[3].x, underline[3].y, 5, 5, 0, 0, 2 * Math.PI);
    ctx.stroke();
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
      x: endPoint.x + connections[startIndex][1].x,
      y: endPoint.y + connections[startIndex][1].y
    },
    endPoint
  ];

  if (debug) {
    // show the points and lines of the curve
    ctx.beginPath();
    ctx.strokeStyle = "rgb(255, 0, 0)";
    ctx.moveTo(connection[0].x, connection[0].y);
    ctx.lineTo(connection[1].x, connection[1].y);
    ctx.ellipse(connection[1].x, connection[1].y, 5, 5, 0, 0, 2 * Math.PI);
    ctx.moveTo(connection[2].x, connection[2].y);
    ctx.ellipse(connection[2].x, connection[2].y, 5, 5, 0, 0, 2 * Math.PI);
    ctx.lineTo(connection[3].x, connection[3].y);
    ctx.stroke();
  }

  return connection;
}

function animateBezier(section, bezierPath) {
  // animate until this section is done
  for (let i = section * subdivision; i <= pct; i += INCREMENT) {
    // how much to animate in this frame
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

  // only increment if we're still on this section
  if (pct <= (section + 1) * subdivision) {
    pct += INCREMENT;
  }
}

// code copied from https://blog.katastros.com/a?ID=01750-8f9684a6-b537-43f2-9f6a-699632760434
function threeOrderBezier(t, p1, cp1, cp2, p2) {
	//The parameters are t, start point, two control points and end point
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
  return {x: x, y: y};
}