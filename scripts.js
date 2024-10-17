// Close Navbar when clicking on a link (Mobile View)
document.querySelectorAll('.nav-link').forEach(item => {
    item.addEventListener('click', (event) => {
        const navbarCollapse = document.querySelector('.navbar-collapse');

        // Check if the screen width is less than or equal to 768px (mobile view)
        if (window.innerWidth <= 768) {
            const bsCollapse = new bootstrap.Collapse(navbarCollapse);
            bsCollapse.hide();
        }
    });
});


// Array of image file names from the 'Album' folder (replace with actual image paths)
const images = [
    'Album/photo1.jpg',
    'Album/photo2.jpg',
    'Album/photo3.jpg',
    'Album/photo4.jpg',
    'Album/photo5.jpg',
    'Album/photo6.jpg'
];

// Select the slider container
const sliderImages = document.getElementById('slider-images');

// Create carousel items dynamically with lazy loading
images.forEach((image, index) => {
    const carouselItem = document.createElement('div');
    carouselItem.classList.add('carousel-item');
    if (index === 0) carouselItem.classList.add('active'); // Set first image as active

    const imgElement = document.createElement('img');
    imgElement.src = image;
    imgElement.classList.add('d-block', 'w-100');
    imgElement.loading = "lazy";  // Enable lazy loading for the image

    carouselItem.appendChild(imgElement);
    sliderImages.appendChild(carouselItem);
});

// Initialize Bootstrap's carousel with auto slide and 3 seconds interval
const carousel = new bootstrap.Carousel('#gallery-slider', {
    interval: 3000, // 3 seconds
    ride: 'carousel',
});




