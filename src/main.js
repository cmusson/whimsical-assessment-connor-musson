import shapes from "../shapes.json";

const importedShapes = shapes;

// This function runs on boot. Place any initialization code here
export function drawAndSelect() {
  const canvas = document.getElementById("canvas");

  if (canvas.getContext) {
    const ctx = canvas.getContext("2d");
    drawShapes(ctx);
    addClickHandlers(canvas, ctx);
  }
}

const drawCircle = (ctx, shape) => {
  ctx.beginPath();
  ctx.arc(shape.x - 350, shape.y + 250, shape.radius, 0, 2 * Math.PI);
  ctx.fillStyle = shape.fill;
  ctx.fill();
  ctx.closePath();
};

const drawRect = (ctx, shape) => {
  ctx.beginPath();
  ctx.rect(shape.x - 350, shape.y + 250, shape.width, shape.height);
  ctx.fillStyle = shape.fill;
  ctx.fill();
  ctx.closePath();
};

const drawShapes = (ctx) => {
  importedShapes.forEach((shape) => {
    if (shape.shapeType === "circle") {
      drawCircle(ctx, shape);
    } else if (shape.shapeType === "rect") {
      drawRect(ctx, shape);
    }
  });
};

const addClickHandlers = (canvas, ctx) => {
  let groupedShapes = {};
  importedShapes.forEach((shape) => {
    // Adds array of groups as a new property in group shapes object
    if (groupedShapes[shape.group] === undefined) {
      groupedShapes[shape.group] = [];
    }
    // pushes each object into corresponding group
    groupedShapes[shape.group].push(shape);
  });

  // make an area around each group to use in clickEvent
  let groupAreas = {};
  Object.keys(groupedShapes).forEach((group) => {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    groupedShapes[group].forEach((shape) => {
      if (shape.shapeType === "rect") {
        if (shape.x < minX) {
          minX = shape.x;
        }
        if (shape.y < minY) {
          minY = shape.y;
        }
        if (shape.x + shape.width > maxX) {
          maxX = shape.x + shape.width;
        }
        if (shape.y + shape.height > maxY) {
          maxY = shape.y + shape.height;
        }
      } else {
        if (shape.x - shape.radius < minX) {
          minX = shape.x - shape.radius;
        }
        if (shape.y - shape.radius < minY) {
          minY = shape.y - shape.radius;
        }
        if (shape.x + shape.radius > maxX) {
          maxX = shape.x + shape.radius;
        }
        if (shape.y + shape.radius > maxY) {
          maxY = shape.y + shape.radius;
        }
      }
    });

    // Store the object directly under the group key
    groupAreas[group] = {
      group: groupedShapes[group][0].group,
      maxX: maxX,
      minX: minX,
      maxY: maxY,
      minY: minY,
    };
  });

  // Add click listener to canvas
  canvas.addEventListener("click", (e) => {
    let clickedGroup = null;

    // Get position of click relative to canvas
    let rect = canvas.getBoundingClientRect();
    let mouseX = e.clientX - rect.left;
    let mouseY = e.clientY - rect.top;

    // Check which area was clicked
    Object.keys(groupAreas).forEach((area) => {
      let totalArea = groupAreas[area];

      if (
        mouseX >= totalArea.minX - 350 &&
        mouseX <= totalArea.maxX - 350 &&
        mouseY >= totalArea.minY + 250 &&
        mouseY <= totalArea.maxY + 250
      ) {
        clickedGroup = totalArea.group;
      }
    });

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all shapes
    drawShapes(ctx);

    // Draw line around the clicked group
    if (clickedGroup !== null) {
      drawGroupOutline(ctx, groupedShapes, clickedGroup);
    }
  });
};

const drawGroupOutline = (ctx, shapes, group) => {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  const selectedShapes = shapes[group];

  selectedShapes.forEach((shape) => {
    if (shape.shapeType === "rect") {
      if (shape.x < minX) {
        minX = shape.x;
      }
      if (shape.y < minY) {
        minY = shape.y;
      }
      if (shape.x + shape.width > maxX) {
        maxX = shape.x + shape.width;
      }
      if (shape.y + shape.height > maxY) {
        maxY = shape.y + shape.height;
      }
    } else {
      if (shape.x - shape.radius < minX) {
        minX = shape.x - shape.radius;
      }
      if (shape.y - shape.radius < minY) {
        minY = shape.y - shape.radius;
      }
      if (shape.x + shape.radius > maxX) {
        maxX = shape.x + shape.radius;
      }
      if (shape.y + shape.radius > maxY) {
        maxY = shape.y + shape.radius;
      }
    }
  });

  // Draw the outline around the group
  ctx.beginPath();
  ctx.lineWidth = 5;
  ctx.strokeStyle = "purple";
  const expansionSize = 10;
  ctx.rect(
    minX - 350 - expansionSize,
    minY + 250 - expansionSize,
    maxX - minX + expansionSize * 2,
    maxY - minY + expansionSize * 2
  );
  ctx.stroke();
  ctx.closePath();
};
