// Load banners from Firebase
function loadBanners() {
    db.collection("banners").onSnapshot(snapshot => {
        const banners = [];
        snapshot.forEach(doc => {
            banners.push({ id: doc.id, ...doc.data() });
        });
        renderBanners(banners);
    }, error => {
        console.error("Error loading banners:", error);
    });
}

// Render banners in carousel
function renderBanners(banners) {
    const carouselInner = document.getElementById('carousel-inner');
    const carouselIndicators = document.getElementById('carousel-indicators');
    
    if (!carouselInner || !carouselIndicators) return;
    
    if (banners.length === 0) return;
    
    carouselInner.innerHTML = '';
    carouselIndicators.innerHTML = '';
    
    banners.forEach((banner, index) => {
        // Add carousel item
        const item = document.createElement('div');
        item.className = `carousel-item ${index === 0 ? 'active' : ''}`;
        item.innerHTML = `<img src="${banner.imageUrl}" class="d-block w-100" alt="Banner ${index + 1}" style="height: 400px; object-fit: cover;">`;
        carouselInner.appendChild(item);
        
        // Add indicator
        const indicator = document.createElement('button');
        indicator.type = 'button';
        indicator.setAttribute('data-bs-target', '#bannerCarousel');
        indicator.setAttribute('data-bs-slide-to', index);
        if (index === 0) indicator.className = 'active';
        carouselIndicators.appendChild(indicator);
    });
}

// Load categories from Firebase
function loadCategories() {
    db.collection("categories").onSnapshot(snapshot => {
        const categories = [];
        snapshot.forEach(doc => {
            categories.push({ id: doc.id, ...doc.data() });
        });
        renderCategories(categories);
    }, error => {
        console.error("Error loading categories:", error);
        document.getElementById('categories-container').innerHTML = 
            '<div class="col-12 text-center text-danger">Error loading categories</div>';
    });
}

// Render categories in one horizontal line
function renderCategories(categories) {
    const container = document.getElementById('categories-container');
    if (!container) return;
    
    if (categories.length === 0) {
        container.innerHTML = '<div class="text-center">No categories available</div>';
        return;
    }
    
    container.innerHTML = '';
    categories.forEach(category => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'category-card-inline';
        categoryDiv.onclick = () => filterByCategory(category.categoryId, category.categoryName);
        categoryDiv.innerHTML = `
            <div class="category-image-wrapper-inline">
                <img src="${category.categoryImg}" alt="${category.categoryName}">
            </div>
            <h6>${category.categoryName}</h6>
        `;
        container.appendChild(categoryDiv);
    });
}

// Load all products
function loadProducts() {
    db.collection("products").onSnapshot(snapshot => {
        const products = [];
        snapshot.forEach(doc => {
            products.push({ id: doc.id, ...doc.data() });
        });
        renderProducts(products);
    }, error => {
        console.error("Error loading products:", error);
        document.getElementById('products-container').innerHTML = 
            '<div class="col-12 text-center text-danger">Error loading products</div>';
    });
}

// Filter products by category
function filterByCategory(categoryId, categoryName) {
    document.querySelector('#products h2').textContent = categoryName + ' Products';
    document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
    
    db.collection("products").where("categoryId", "==", categoryId).get()
        .then(snapshot => {
            const products = [];
            snapshot.forEach(doc => {
                products.push({ id: doc.id, ...doc.data() });
            });
            renderProducts(products);
        })
        .catch(error => {
            console.error("Error filtering products:", error);
        });
}

// Render products
function renderProducts(products) {
    const container = document.getElementById('products-container');
    if (!container) return;
    
    if (products.length === 0) {
        container.innerHTML = '<div class="col-12 text-center">No products found</div>';
        return;
    }
    
    container.innerHTML = '';
    products.forEach(product => {
        const image = product.productImages && product.productImages[0] ? product.productImages[0] : 'https://via.placeholder.com/200';
        
        // Price logic: if isSale is false, show only fullPrice
        const isSale = product.isSale === true;
        const displayPrice = isSale ? product.salePrice : product.fullPrice;
        const originalPrice = product.fullPrice;
        
        const discount = isSale && originalPrice && displayPrice ? 
            Math.round(((originalPrice - displayPrice) / originalPrice) * 100) : 0;
        
        const productCard = document.createElement('div');
        productCard.className = 'col-6 col-md-4 col-lg-3';
        productCard.innerHTML = `
            <div class="card h-100">
                ${discount > 0 ? `<span class="badge bg-success position-absolute m-2">${discount}% OFF</span>` : ''}
                <img src="${image}" class="card-img-top" alt="${product.productName || 'Product'}" style="height: 200px; object-fit: cover;">
                <div class="card-body">
                    <h6 class="card-title">${product.productName || 'Unnamed Product'}</h6>
                    <p class="mb-0">
                        <span class="text-danger fw-bold">₹${displayPrice || '0'}</span>
                        ${isSale && originalPrice && originalPrice != displayPrice ? 
                            `<span class="text-muted text-decoration-line-through ms-2">₹${originalPrice}</span>` : ''}
                    </p>
                    <button class="btn btn-success btn-sm mt-2 w-100 add-to-cart-btn">
                        <i class="fas fa-shopping-cart"></i> Add to Cart
                    </button>
                </div>
            </div>
        `;
        
        productCard.querySelector('.add-to-cart-btn').addEventListener('click', () => {
            addToCart({
                id: product.id,
                productName: product.productName,
                price: displayPrice,
                image: image
            });
        });
        
        container.appendChild(productCard);
    });
}

// Cart functionality
let cart = JSON.parse(localStorage.getItem('groczyCart')) || [];

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = count;
}

function addToCart(product) {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
        existing.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem('groczyCart', JSON.stringify(cart));
    updateCartCount();
    alert(`${product.productName} added to cart!`);
}

function showCart() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    const modal = new bootstrap.Modal(document.getElementById('cartModal'));
    renderCart();
    modal.show();
}

function renderCart() {
    const container = document.getElementById('cart-items');
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    container.innerHTML = cart.map(item => `
        <div class="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
            <div class="d-flex align-items-center">
                <img src="${item.image}" style="width: 60px; height: 60px; object-fit: cover;" class="rounded me-3">
                <div>
                    <h6 class="mb-0">${item.productName}</h6>
                    <small class="text-muted">₹${item.price} × ${item.quantity}</small>
                </div>
            </div>
            <div class="d-flex align-items-center">
                <button class="btn btn-sm btn-outline-secondary" onclick="changeQuantity('${item.id}', -1)">-</button>
                <span class="mx-2">${item.quantity}</span>
                <button class="btn btn-sm btn-outline-secondary" onclick="changeQuantity('${item.id}', 1)">+</button>
                <button class="btn btn-sm btn-danger ms-2" onclick="removeFromCart('${item.id}')"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
    
    document.getElementById('cart-total').textContent = `₹${total.toFixed(2)}`;
}

function changeQuantity(productId, change) {
    const item = cart.find(i => i.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            localStorage.setItem('groczyCart', JSON.stringify(cart));
            updateCartCount();
            renderCart();
        }
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('groczyCart', JSON.stringify(cart));
    updateCartCount();
    if (cart.length === 0) {
        bootstrap.Modal.getInstance(document.getElementById('cartModal')).hide();
    } else {
        renderCart();
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Loading Groczy website...');
    loadBanners();
    loadCategories();
    loadProducts();
    updateCartCount();
});
