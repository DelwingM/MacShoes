document.addEventListener('DOMContentLoaded', function() {
    const formulario = document.getElementById('formulario-contacto');
    const mensajeConfirmacion = document.getElementById('mensaje-confirmacion');
    const mensajeCorreo = document.getElementById('mensaje-correo');

    formulario.addEventListener('submit', function(e) {
        e.preventDefault();

        // Obtener el email ingresado
        const email = document.getElementById('email').value;

        // Mostrar mensaje de confirmación
        mensajeCorreo.textContent = `Correo enviado exitosamente a: ${email}`;
        mensajeConfirmacion.style.display = 'block';

        // Opcional: Limpiar el formulario
        formulario.reset();

        // Opcional: Ocultar el mensaje después de 5 segundos
        setTimeout(() => {
            mensajeConfirmacion.style.display = 'none';
        }, 5000);
    });
});