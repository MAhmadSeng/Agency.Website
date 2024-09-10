document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.querySelector('.carousel');
    const items = document.querySelectorAll('.carousel-item');
    const prevButton = document.querySelector('.carousel-button.prev');
    const nextButton = document.querySelector('.carousel-button.next');
    let index = 0;

    function updateCarousel() {
        carousel.style.transform = `translateX(-${index * 100}%)`;
    }

    function slidecarosl(newIndex) {
        index = (newIndex + items.length) % items.length;
        updateCarousel();
    }
    nextButton.addEventListener('click', () => 
        slidecarosl(index + 1));
    prevButton.addEventListener('click', () => 
        slidecarosl(index - 1));
    updateCarousel(); 
});
