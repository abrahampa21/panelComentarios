//Definiendo variables
const body = document.body;
const formComment = document.getElementById("form-comment");
const commentInput = document.getElementById("commentInput");
const addButton = document.getElementById("add-button");
const nameInput = document.getElementById("nameInput");
const form = document.getElementById("form");
const labelMessage = document.getElementById("label-message");
const modal = document.querySelector(".modal");
const palabrasNoPermitidas = [
  "puto",
  "verga",
  "chingada",
  "puta",
  "mierda",
  "piruja",
  "pirujo",
  "brga",
  "vrga"
];
const modalBannedWords = document.getElementById("modal-banned-word");

//Modal para mensaje
labelMessage.addEventListener("click", () => {
  modal.style.display = "flex";
});

function closeModal() {
  modal.style.display = "none";
  modalBannedWords.style.display = "none";
}

modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});

modalBannedWords.addEventListener("click", (e) => {
  if (e.target === modalBannedWords) {
    modalBannedWords.style.display = "none";
  }
});

//Abrir formulario de comentario
function openFormComment() {
  formComment.style.display = "block";
  nameInput.focus();
}

//Cerrar el formulario de comentario
function closeFormComment() {
  formComment.style.display = "none";
  commentInput.value = "";
  nameInput.value = "";
}

//Cerrar el formulario en otro lugar que no sea el formComment
formComment.addEventListener("click", (e) => {
  if (e.target === formComment) {
    formComment.style.display = "none";
  }
});

// IA: promesa que se resuelve cuando el modelo termina de cargar
let _aiReadyResolve;
const _aiReadyPromise = new Promise((resolve) => {
  _aiReadyResolve = resolve;
});

window.onAiReady = function (ratingFn) {
  window.getRating = ratingFn;
  _aiReadyResolve();
};

// Espera a que la IA esté lista (máx. 60s) y devuelve las estrellas
async function getRatingWhenReady(commentText) {
  try {
    await Promise.race([
      _aiReadyPromise,
      new Promise((_, reject) => setTimeout(reject, 60000)),
    ]);
    return await window.getRating(commentText);
  } catch {
    return 3; // fallback neutro si la IA no responde
  }
}

// Actualiza las estrellas de un comentario ya guardado en localStorage
function updateCommentStars(name, comment, stars) {
  const stored = JSON.parse(localStorage.getItem("comments")) || [];
  const idx = stored.findIndex((c) => c.name === name && c.comment === comment);
  if (idx !== -1) {
    stored[idx].stars = stars;
    localStorage.setItem("comments", JSON.stringify(stored));
  }
}

// Recalcula y pinta el panel de estadísticas
function updatePanel() {
  const stored = JSON.parse(localStorage.getItem("comments")) || [];
  document.getElementById("panel-total").textContent = stored.length;

  const rated = stored.filter((c) => typeof c.stars === "number");
  const starEls = document.querySelectorAll("#panel-rating i");
  const avgEl = document.getElementById("panel-avg");

  if (rated.length > 0) {
    const avg = rated.reduce((sum, c) => sum + c.stars, 0) / rated.length;
    const rounded = Math.round(avg);
    starEls.forEach((s, i) => {
      s.className = i < rounded ? "fas fa-star" : "far fa-star";
    });
    avgEl.textContent = `${avg.toFixed(1)} / 5`;
  } else {
    starEls.forEach((s) => (s.className = "far fa-star"));
    avgEl.textContent = "—";
  }

  const bestTextEl = document.getElementById("panel-best-text");
  const bestAuthorEl = document.getElementById("panel-best-author");
  if (rated.length > 0) {
    const best = rated.reduce((max, c) => (c.stars > max.stars ? c : max));
    bestTextEl.textContent = `"${best.comment}"`;
    bestAuthorEl.textContent = `— ${best.name}`;
  } else if (stored.length > 0) {
    bestTextEl.textContent = "Valorando comentarios...";
    bestAuthorEl.textContent = "";
  } else {
    bestTextEl.textContent = "Aún no hay comentarios.";
    bestAuthorEl.textContent = "";
  }
}

//Carga los comentarios guardados al iniciar
window.addEventListener("load", function () {
  const storedComments = JSON.parse(localStorage.getItem("comments")) || [];
  storedComments.forEach((c) =>
    createBubble(c.name, c.comment, c.stars ?? null),
  );
  updatePanel();
});

form.addEventListener("submit", function (e) {
  e.preventDefault();
  submitComment();
});

//Función para detectar groserías
function hasBannedWords(text) {
  const regex = new RegExp(`\\b(${palabrasNoPermitidas.join("|")})\\b`, "i");
  return regex.test(text);
}

//Enviar comentario
function submitComment() {
  const comment = commentInput.value.trim();
  const name = nameInput.value.trim();

  if (!comment || !name) return;

  if (hasBannedWords(comment) || hasBannedWords(name)) {
    modalBannedWords.style.display = "flex";
    commentInput.value = "";
    nameInput.value = "";
    return;
  }

  // Guardar con stars: null; se actualiza cuando la IA responda
  const storedComments = JSON.parse(localStorage.getItem("comments")) || [];
  storedComments.push({ name, comment, stars: null });
  localStorage.setItem("comments", JSON.stringify(storedComments));

  createBubble(name, comment, null);
  formComment.style.display = "none";
  commentInput.value = "";
  nameInput.value = "";
  lanzarConfetti();
  updatePanel();
}

// Función para disparar confetti
function lanzarConfetti() {
  confetti({
    particleCount: 200, // Número de partículas
    spread: 70,
    origin: { y: 0.6 },
  });
}

// Permitir enviar con Enter
commentInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    submitComment();
  }
});

//Remover comentarios
function removeCommentFromLocalStorage(name, comment) {
  // Recuperar los comentarios guardados
  let storedComments = JSON.parse(localStorage.getItem("comments")) || [];

  // Filtrar los comentarios que no sean el que se va a eliminar
  storedComments = storedComments.filter(
    (storedComment) =>
      storedComment.name !== name || storedComment.comment !== comment,
  );

  localStorage.setItem("comments", JSON.stringify(storedComments));
}

//Cuadro de comentario
async function createBubble(name, comment, existingStars) {
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.style.cursor = "pointer";

  // Ícono de mensaje
  const icon = document.createElement("div");
  icon.className = "message-icon";
  icon.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
        </svg>
    `;

  // Contenedor del comentario
  const commentElement = document.createElement("div");
  commentElement.className = "comment";
  commentElement.textContent = `${name} dijo: ${comment}`;

  // Estrellas (placeholder vacío hasta que la IA responda)
  const starsContainer = document.createElement("div");
  starsContainer.className = "stars";
  for (let i = 0; i < 5; i++) {
    const star = document.createElement("i");
    star.className = "far fa-star";
    star.style.color = "#FFD700";
    starsContainer.appendChild(star);
  }
  commentElement.appendChild(starsContainer);

  bubble.appendChild(icon);
  bubble.appendChild(commentElement);

  // Posición inicial
  const x = Math.random() * 70 + 20;
  const y = 100;
  bubble.style.left = `${x}%`;
  bubble.style.bottom = `${y}%`;

  const speed = 1.5 + Math.random() * 1;
  body.appendChild(bubble);

  // Animación con cancelAnimationFrame para evitar leaks
  let animId;
  let restartTimeout;
  let currentY = y;

  function animate() {
    currentY -= speed * 0.1;
    if (currentY > -50) {
      bubble.style.bottom = `${currentY}%`;
      bubble.style.transform = `translateX(-50%) rotate(${Math.sin(currentY / 10) * 5}deg)`;
      animId = requestAnimationFrame(animate);
    } else {
      restartTimeout = setTimeout(() => {
        currentY = y;
        bubble.style.bottom = `${currentY}%`;
        bubble.style.left = `${Math.random() * 70 + 20}%`;
        animId = requestAnimationFrame(animate);
      }, 1000);
    }
  }
  animId = requestAnimationFrame(animate);
  const MAX_CHARS = 1000;
  const safeComment = comment.slice(0, MAX_CHARS);

  // Obtener rating: usar el guardado si existe, si no pedirlo a la IA
  const starsCount =
    typeof existingStars === "number"
      ? existingStars
      : await getRatingWhenReady(safeComment);

  if (typeof existingStars !== "number") {
    updateCommentStars(name, comment, starsCount);
    updatePanel();
  }

  // Pintar las estrellas con el resultado
  const starEls = starsContainer.querySelectorAll("i");
  starEls.forEach((s, i) => {
    s.className = i < starsCount ? "fas fa-star" : "far fa-star";
  });

  // Borrar comentario al click
  bubble.addEventListener("click", () => {
    cancelAnimationFrame(animId);
    clearTimeout(restartTimeout);
    bubble.remove();
    removeCommentFromLocalStorage(name, comment);
    updatePanel();
  });
}

//Animation On Screen al recargar la página
AOS.init({
  once: true,
});
