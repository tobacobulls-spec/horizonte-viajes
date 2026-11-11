/* Brújula Viajes · Interacciones
   1. Menú móvil  2. Filtro de destinos  3. Buscador del hero
   4. Cotizador   5. Formulario de contacto */

(function () {
  "use strict";

  /* Precios base por persona (COP) y duración */
  var DESTINOS = {
    cartagena: { nombre: "Cartagena de Indias", precio: 1450000, dias: 4 },
    sanandres: { nombre: "San Andrés", precio: 2350000, dias: 5 },
    cafe:      { nombre: "Eje Cafetero", precio: 1190000, dias: 4 },
    amazonas:  { nombre: "Amazonas", precio: 2100000, dias: 5 },
    tatacoa:   { nombre: "Desierto de la Tatacoa", precio: 890000, dias: 3 },
    tayrona:   { nombre: "Santa Marta y Tayrona", precio: 1690000, dias: 4 }
  };
  var PAQUETES = {
    esencial: { nombre: "Esencial", factor: 1 },
    confort:  { nombre: "Confort", factor: 1.25 },
    premium:  { nombre: "Premium", factor: 1.6 }
  };
  var DESCUENTO_NINOS = 0.3;

  var formatoCOP = new Intl.NumberFormat("es-CO", {
    style: "currency", currency: "COP", maximumFractionDigits: 0
  });

  /* 1. Menú móvil ------------------------------------------- */
  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("menu");

  function setMenu(abierto) {
    menu.classList.toggle("is-open", abierto);
    toggle.setAttribute("aria-expanded", String(abierto));
    toggle.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
  }
  toggle.addEventListener("click", function () {
    setMenu(toggle.getAttribute("aria-expanded") !== "true");
  });
  menu.addEventListener("click", function (e) {
    if (e.target.closest("a")) setMenu(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setMenu(false);
  });

  /* 2. Filtro de destinos ------------------------------------ */
  var chips = document.querySelectorAll(".chip");
  var cards = document.querySelectorAll("#cards .card");
  var estado = document.getElementById("filterStatus");

  function filtrar(tipo) {
    var visibles = 0;
    cards.forEach(function (card) {
      var mostrar = tipo === "todos" || card.dataset.tipo === tipo;
      card.hidden = !mostrar;
      if (mostrar) visibles++;
    });
    chips.forEach(function (chip) {
      var activo = chip.dataset.filter === tipo;
      chip.classList.toggle("is-active", activo);
      chip.setAttribute("aria-pressed", String(activo));
    });
    estado.textContent = visibles === 1
      ? "Mostrando 1 destino."
      : "Mostrando " + visibles + " destinos.";
  }
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () { filtrar(chip.dataset.filter); });
  });
  filtrar("todos");

  /* 3. Buscador del hero ------------------------------------- */
  var passForm = document.getElementById("passForm");
  passForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var mapa = { todos: "todos", playa: "playa", montana: "montana", ciudad: "ciudad", naturaleza: "naturaleza" };
    var tipo = mapa[document.getElementById("passTipo").value] || "todos";
    var personas = parseInt(document.getElementById("passPersonas").value, 10);
    if (personas >= 1 && personas <= 12) {
      document.getElementById("qAdultos").value = personas;
    }
    filtrar(tipo);
    document.getElementById("destinos").scrollIntoView();
  });

  /* 4. Cotizador --------------------------------------------- */
  var quoteForm = document.getElementById("quoteForm");
  var quoteError = document.getElementById("quoteError");
  var quoteResult = document.getElementById("quoteResult");

  // Los botones "Cotizar ..." de tarjetas y paquetes preseleccionan el formulario
  document.addEventListener("click", function (e) {
    var enlace = e.target.closest("[data-destino], [data-paquete]");
    if (!enlace) return;
    if (enlace.dataset.destino) document.getElementById("qDestino").value = enlace.dataset.destino;
    if (enlace.dataset.paquete) document.getElementById("qPaquete").value = enlace.dataset.paquete;
  });

  quoteForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var destino = DESTINOS[document.getElementById("qDestino").value];
    var paquete = PAQUETES[document.getElementById("qPaquete").value];
    var adultos = parseInt(document.getElementById("qAdultos").value, 10);
    var ninos = parseInt(document.getElementById("qNinos").value, 10) || 0;

    quoteError.hidden = true;
    if (isNaN(adultos) || adultos < 1 || adultos > 12) {
      quoteError.textContent = "Escribe un número de adultos entre 1 y 12.";
      quoteError.hidden = false;
      quoteResult.hidden = true;
      return;
    }
    if (ninos < 0 || ninos > 8) {
      quoteError.textContent = "Escribe un número de niños entre 0 y 8.";
      quoteError.hidden = false;
      quoteResult.hidden = true;
      return;
    }

    var porPersona = destino.precio * paquete.factor;
    var total = porPersona * adultos + porPersona * (1 - DESCUENTO_NINOS) * ninos;

    document.getElementById("resultTotal").textContent = formatoCOP.format(total);
    document.getElementById("resultDetail").textContent =
      destino.nombre + " · " + destino.dias + " días · paquete " + paquete.nombre + " · " +
      adultos + (adultos === 1 ? " adulto" : " adultos") +
      (ninos ? " y " + ninos + (ninos === 1 ? " niño" : " niños") : "") + ".";
    quoteResult.hidden = false;
  });

  /* 5. Formulario de contacto -------------------------------- */
  var contactForm = document.getElementById("contactForm");
  var contactOk = document.getElementById("contactOk");

  var REGLAS = {
    cNombre: function (v) { return v.trim().length >= 3 ? "" : "Escribe tu nombre completo."; },
    cCorreo: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : "Escribe un correo válido, por ejemplo nombre@correo.com."; },
    cTel:    function (v) { return /^[0-9+\s()-]{7,15}$/.test(v.trim()) ? "" : "Escribe un teléfono de 7 a 15 dígitos."; },
    cMensaje: function (v) { return v.trim().length >= 10 ? "" : "Cuéntanos tu plan en al menos 10 caracteres."; }
  };

  function validarCampo(id) {
    var campo = document.getElementById(id);
    var mensaje = REGLAS[id](campo.value);
    campo.closest(".field").classList.toggle("has-error", mensaje !== "");
    campo.setAttribute("aria-invalid", mensaje !== "" ? "true" : "false");
    contactForm.querySelector('.err[data-for="' + id + '"]').textContent = mensaje;
    return mensaje === "";
  }

  Object.keys(REGLAS).forEach(function (id) {
    document.getElementById(id).addEventListener("blur", function () { validarCampo(id); });
  });

  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var primerError = null;
    Object.keys(REGLAS).forEach(function (id) {
      if (!validarCampo(id) && !primerError) primerError = id;
    });
    if (primerError) {
      document.getElementById(primerError).focus();
      contactOk.hidden = true;
      return;
    }
    var nombre = document.getElementById("cNombre").value.trim().split(" ")[0];
    contactOk.textContent = "Gracias, " + nombre + ". Recibimos tu solicitud y te escribiremos en menos de 24 horas.";
    contactOk.hidden = false;
    contactForm.reset();
  });
})();
