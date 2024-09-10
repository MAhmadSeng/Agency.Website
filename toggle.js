document.addEventListener('DOMContentLoaded', function() {
    const toggle = document.getElementById('toggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    const body = document.body;

    toggle.addEventListener('click', function() {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('open');
        body.classList.toggle('no-scroll');
    });

    overlay.addEventListener('click', function() {
        sidebar.classList.remove('open');
        overlay.classList.remove('open');
        body.classList.remove('no-scroll');
    });
});
