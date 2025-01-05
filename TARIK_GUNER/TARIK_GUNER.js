(function() {
    // jQuery yükleme
    var jqScript = document.createElement('script');
    jqScript.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
    jqScript.type = 'text/javascript';
    jqScript.onload = function() {
        console.log('jQuery başarılı bir şekilde yüklendi');

        const dataUrl = 'https://gist.githubusercontent.com/sevindi/5765c5812bbc8238a38b3cf52f233651/raw/56261d81af8561bf0a7cf692fe572f9e1e91f372/products.json';
        let productList = JSON.parse(localStorage.getItem('productList')) || [];

        if ($('.product-detail').length) {
            if (productList.length === 0) {
                $.getJSON(dataUrl, function(products) {
                    productList = products;
                    localStorage.setItem('productList', JSON.stringify(productList));
                    createCarousel(productList);
                }).fail(function() {
                    console.error('Ürünler alınırken bir hata oluştu.');
                });
            } else {
                createCarousel(productList);
            }
        }

        function createCarousel(products) {
            const $carouselContainer = $('<div class="carousel-container"></div>').css({
                overflow: 'hidden',
                position: 'relative',
                margin: '0px 0px 0px 15px'
            });

            const $carouselTitle = $('<h2>Belki İlginizi Çeker</h2>').css({
                textAlign: 'left',
                fontSize: '32px',
                marginLeft: '15px',
                width: '89%',
                margin: '0 auto'
            });

            const $carouselWrapper = $('<div class="carousel-wrapper"></div>').css({
                overflow: 'hidden', 
                position: 'relative',
                width: '90%',
                margin: '0 auto'
            });

            const $carouselItems = $('<div class="carousel-items"></div>').css({
                display: 'flex',
                transition: 'transform 0.3s ease-in-out'
            });

            const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

            products.forEach(product => {
                const isFavorite = favorites.includes(product.id);
                const $product = $(`
                <div class="carousel-item">
                    <a href="${product.url}" target="_blank" style="text-decoration: none; color: inherit;">
                        <img src="${product.img}" alt="${product.name}" style="width: 100%;">
                        <h3 style="font-size: 14px;">${product.name}</h3>
                    </a>
                    <p style="font-size: 18px; color: darkblue; font-weight: bold;">${product.price} TL</p>
                    <span class="heart-icon" data-id="${product.id}" style="
                        position: absolute;
                        top: 15px;
                        right: 15px;
                        cursor: pointer;
                        font-size: 20px;
                        color: ${isFavorite ? 'blue' : 'grey'};
                        width: 30px;
                        height: 30px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background-color: white;
                        border: 1px solid #ccc;
                        border-radius: 5px;
                    ">&#10084;</span>
                </div>
                `).css({
                    flex: '0 0 calc(100% / 6.5)',  
                    boxSizing: 'border-box',
                    padding: '10px',
                    position: 'relative'
                });

                $carouselItems.append($product);
            });

            const $prevButton = $('<button class="carousel-button prev">&#10094;</button>').css({
                position: 'absolute',
                top: '50%',
                left: '10px',
                transform: 'translateY(-50%)',
                zIndex: 1,
                cursor: 'pointer',
                fontSize: '24px',
                background: 'transparent',
                border: 'none',
                color: '#000',
            });

            const $nextButton = $('<button class="carousel-button next">&#10095;</button>').css({
                position: 'absolute',
                top: '50%',
                right: '10px',
                transform: 'translateY(-50%)',
                zIndex: 1,
                cursor: 'pointer',
                fontSize: '24px',
                background: 'transparent',
                border: 'none',
                color: '#000',
            });

            $carouselWrapper.append($carouselItems);
            $carouselContainer.append($carouselTitle, $prevButton, $carouselWrapper, $nextButton);

            $('.product-detail').after($carouselContainer);

            let currentIndex = 0;
            let isDragging = false;
            let startX;
            let currentTranslate = 0;
            let prevTranslate = 0;
            let itemWidth;

            function updateCarouselDisplay() {
                const multiplier = calculateItemMultiplier();
                $('.carousel-item').css('flex', `0 0 calc(100% / ${multiplier})`);
                itemWidth = $carouselItems.width() / multiplier;
                const maxIndex = products.length - multiplier;
                if (currentIndex > maxIndex) {
                    currentIndex = maxIndex;
                }
                const offset = -currentIndex * itemWidth;
                $carouselItems.css('transform', `translateX(${offset}px)`);
                prevTranslate = offset;
            }

            function calculateItemMultiplier() {
                const viewportWidth = $(window).width();
                if (viewportWidth < 480) return 1.25; // Mobile
                if (viewportWidth < 768) return 2; // Tablet
                if (viewportWidth < 1024) return 3; // Small Desktop
                return 6.5; // Standard Desktop
            }

            function setTransform() {
                $carouselItems.css('transform', `translateX(${currentTranslate}px)`);
            }

            function animate() {
                setTransform();
                if (isDragging) requestAnimationFrame(animate);
            }

            $carouselWrapper.on('mousedown touchstart', function(event) {
                isDragging = true;
                startX = event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
                $carouselItems.css('transition', 'none');
                requestAnimationFrame(animate);
                event.preventDefault();
            });

            $(document).on('mousemove touchmove', function(event) {
                if (!isDragging) return;
                const currentX = event.type.includes('mousemove') ? event.pageX : event.touches[0].clientX;
                currentTranslate = prevTranslate + currentX - startX;
            });

            $(document).on('mouseup touchend', function() {
                if (!isDragging) return;
                isDragging = false;
                cancelAnimationFrame(animate);
                $carouselItems.css('transition', 'transform 0.3s ease-in-out');
                currentIndex = Math.round(-currentTranslate / itemWidth);
                currentIndex = Math.max(0, Math.min(currentIndex, products.length - calculateItemMultiplier()));
                currentTranslate = -currentIndex * itemWidth;
                setTransform();
                prevTranslate = currentTranslate;
            });

            $nextButton.on('click', function() {
                const maxIndex = products.length - calculateItemMultiplier();
                if (currentIndex < maxIndex) {
                    currentIndex++;
                    currentTranslate = -currentIndex * itemWidth;
                    setTransform();
                    prevTranslate = currentTranslate;
                }
            });

            $prevButton.on('click', function() {
                if (currentIndex > 0) {
                    currentIndex--;
                    currentTranslate = -currentIndex * itemWidth;
                    setTransform();
                    prevTranslate = currentTranslate;
                }
            });

            $('.heart-icon').on('click', function() {
                const $this = $(this);
                const productId = $this.data('id');
                let favs = JSON.parse(localStorage.getItem('favorites')) || [];

                if (favs.includes(productId)) {
                    favs = favs.filter(id => id !== productId);
                    $this.css('color', 'grey');
                } else {
                    favs.push(productId);
                    $this.css('color', 'blue');
                }

                localStorage.setItem('favorites', JSON.stringify(favs));
            });

            $(window).on('resize', updateCarouselDisplay);
            updateCarouselDisplay(); // Init display
        }
    };
    document.head.appendChild(jqScript);
})();
