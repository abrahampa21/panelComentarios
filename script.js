//Definiendo variables
const body = document.body;
const card = document.getElementById("card");
const commentInput = document.getElementById("commentInput");
const addButton = document.getElementById("add-button");
const cancelButton = document.getElementById("cancel");
const reverseCapybara = document.getElementById("reverse");
const nameInput = document.getElementById("nameInput");
const form = document.getElementById("form");
const presiona = document.getElementById("presiona");

presiona.addEventListener("click", () => {
  alert("Aquí no, el capybara :)");
})

//Mostrar el card del comentario
reverseCapybara.addEventListener("click", () => {
  card.style.display = "block";
  nameInput.focus();

});

//Cerrar el card
cancelButton.addEventListener("click", () => {
  card.style.display = "none";
  commentInput.value = "";
  nameInput.value = "";
});

//Guarda los mensajes en un localStorage
window.addEventListener("load", function () {
  const storedComments = JSON.parse(localStorage.getItem("comments")) || [];
  storedComments.forEach((comment) => createBubble(`${comment.name} dijo: ${comment.comment}`));

  this.localStorage.removeItem("comments");
});

//Mostrar el otro capibara
addButton.addEventListener("mouseover", () => {
  reverseCapybara.style.display = "block";

  reverseCapybara.addEventListener("mouseout", () => {
    addButton.style.display = "block";
    reverseCapybara.style.display = "none";
  });
});

form.addEventListener("submit", function(e){
  e.preventDefault();
  submitComment();
})

//Enviar comentario
function submitComment() {
  const comment = commentInput.value.trim();
  const name = nameInput.value.trim();
  if (comment && name) {
    const newComment = { name, comment };
    createBubble(`${name} dijo: ${comment}`);
    card.style.display = "none";
    commentInput.value = "";
    nameInput.value = "";
    lanzarConfetti();

    //Comentarios aparecerán incluso cuando se recargue la página
    const storedComments = JSON.parse(localStorage.getItem("comments")) || [];
    storedComments.push(newComment);
    localStorage.setItem("comments", JSON.stringify(storedComments));
  }
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
function removeCommentFromLocalStorage(name,comment) {
  // Recuperar los comentarios guardados
  let storedComments = JSON.parse(localStorage.getItem("comments")) || [];

  // Filtrar los comentarios que no sean el que se va a eliminar
  storedComments = storedComments.filter(storedComment => 
    storedComment.name !== name || storedComment.comment !== comment
  );

  localStorage.setItem("comments", JSON.stringify(storedComments));
}

//Cuadro de comentario
async function createBubble(text) {
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.style.cursor = "pointer";

  const [name, comment] = text.split(" dijo: ");

  // Obtener rating
  const starsCount = await window.getRating(comment);

  // Crear estrellas
  const starsContainer = document.createElement("div");
  starsContainer.className = "stars";
  for (let i = 1; i <= 5; i++) {
    const star = document.createElement("i");
    star.className = i <= starsCount ? "fas fa-star" : "far fa-star";
    star.style.color = "#FFD700"; // dorado
    starsContainer.appendChild(star);
  }

  //Ícono de mensaje
  const icon = document.createElement("div");
  icon.className = "message-icon";
  icon.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
        </svg>
    `;

  // Crear contenedor del comentario
  const commentElement = document.createElement("div");
  commentElement.className = "comment";
  commentElement.textContent = text;

  // Agregar estrellas debajo del comentario
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

  // Animación
  let currentY = y;
  function animate() {
    currentY -= speed * 0.1;
    if (currentY > -50) {
      bubble.style.bottom = `${currentY}%`;
      bubble.style.transform = `translateX(-50%) rotate(${Math.sin(currentY / 10) * 5}deg)`;
      requestAnimationFrame(animate);
    } else {
      setTimeout(() => {
        currentY = y;
        bubble.style.bottom = `${currentY}%`;
        const newX = Math.random() * 70 + 20;
        bubble.style.left = `${newX}%`;
        requestAnimationFrame(animate);
      }, 1000);
    }
  }
  requestAnimationFrame(animate);

  // Borrar comentario al click
  bubble.addEventListener("click", () => {
    bubble.remove();
    removeCommentFromLocalStorage(name, comment);
  });
}

//Animation On Screen al recargar la página
AOS.init({
  once: true,
});


