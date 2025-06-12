// matrix.js

function parseMatrix(text) {
  return text
    .trim()
    .split("\n")
    .map((row) => row.trim().split(/\s+/).map(Number));
}

function formatMatrix(matrix) {
  return matrix.map((row) => row.join("\t")).join("\n");
}

function addMatrices(matrices) {
  return matrices[0].map((row, i) =>
    row.map(
      (val, j) => val + matrices.slice(1).reduce((sum, m) => sum + m[i][j], 0)
    )
  );
}

function subtractMatrices(matrices) {
  return matrices[0].map((row, i) =>
    row.map((val, j) =>
      matrices.slice(1).reduce((res, m) => res - m[i][j], val)
    )
  );
}

function multiplyTwoMatrices(A, B) {
  const rowsA = A.length,
    colsA = A[0].length;
  const rowsB = B.length,
    colsB = B[0].length;
  if (colsA !== rowsB) throw new Error("Matrixdimensionen inkompatibel");
  const result = Array.from({ length: rowsA }, () => Array(colsB).fill(0));
  for (let i = 0; i < rowsA; i++) {
    for (let j = 0; j < colsB; j++) {
      for (let k = 0; k < colsA; k++) {
        result[i][j] += A[i][k] * B[k][j];
      }
    }
  }
  return result;
}

function multiplyMatrices(matrices) {
  return matrices.reduce((a, b) => multiplyTwoMatrices(a, b));
}

function warshall(matrix) {
  const n = matrix.length;
  const reach = matrix.map((row) => row.map((val) => (val !== 0 ? 1 : 0)));
  for (let k = 0; k < n; k++) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        reach[i][j] = reach[i][j] || (reach[i][k] && reach[k][j]) ? 1 : 0;
      }
    }
  }
  return reach;
}

function floydWarshall(matrix) {
  const n = matrix.length;
  const dist = matrix.map((row, i) =>
    row.map((val, j) => (i === j ? 0 : val !== 0 ? val : Infinity))
  );
  for (let k = 0; k < n; k++) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (dist[i][k] + dist[k][j] < dist[i][j]) {
          dist[i][j] = dist[i][k] + dist[k][j];
        }
      }
    }
  }
  return dist;
}

function calculate() {
  const operation = document.getElementById("operation").value;
  const textareas = document.querySelectorAll("#matrices textarea");
  const matrices = Array.from(textareas).map((t) => parseMatrix(t.value));

  try {
    if (matrices.length < 2 && operation !== "multiply") {
      throw new Error("Mindestens zwei Matrizen erforderlich.");
    }

    let result;
    if (operation === "add") result = addMatrices(matrices);
    else if (operation === "subtract") result = subtractMatrices(matrices);
    else if (operation === "multiply") result = multiplyMatrices(matrices);

    let output =
      `✅ Ergebnis der Operation (${operation}):\n` + formatMatrix(result);

    // Wegmatrix und Distanzmatrix für erste Matrix
    if (matrices.length > 0) {
      const war = warshall(matrices[0]);
      const dist = floydWarshall(matrices[0]);
      output += "\n\n🔹 Wegmatrix (Warshall):\n" + formatMatrix(war);
      output += "\n\n🔹 Distanzmatrix (Floyd-Warshall):\n" + formatMatrix(dist);
    }

    document.getElementById("output").textContent = output;
  } catch (e) {
    document.getElementById("output").textContent = "Fehler: " + e.message;
  }
}

function addMatrix() {
  const container = document.getElementById("matrices");
  const textarea = document.createElement("textarea");
  textarea.rows = 4;
  textarea.cols = 40;
  textarea.placeholder = "z.B.\n1 2\n3 4";
  container.appendChild(textarea);
  container.appendChild(document.createElement("br"));
}
