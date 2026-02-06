// Initialize tooltips
var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
})

// Product quantity handlers
document.querySelectorAll('.quantity-btn').forEach(button => {
    button.addEventListener('click', function() {
        const input = this.parentElement.querySelector('.quantity-input');
        let value = parseInt(input.value);
        
        if (this.classList.contains('minus')) {
            value = value > 1 ? value - 1 : 1;
        } else {
            value = value + 1;
        }
        
        input.value = value;
    });
});

// Add to cart animation
document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Animation
        const cart = document.querySelector('.cart-icon');
        const buttonRect = this.getBoundingClientRect();
        const cartRect = cart.getBoundingClientRect();
        
        const flyingItem = document.createElement('div');
        flyingItem.style.cssText = `
            position: fixed;
            z-index: 9999;
            width: 20px;
            height: 20px;
            background-color: ${this.dataset.color || '#28a745'};
            border-radius: 50%;
            left: ${buttonRect.left + buttonRect.width/2 - 10}px;
            top: ${buttonRect.top}px;
            transition: all 0.5s cubic-bezier(0.42, 0, 0.58, 1);
        `;
        
        document.body.appendChild(flyingItem);
        
        setTimeout(() => {
            flyingItem.style.left = `${cartRect.left + cartRect.width/2 - 10}px`;
            flyingItem.style.top = `${cartRect.top}px`;
            flyingItem.style.transform = 'scale(0.2)';
            flyingItem.style.opacity = '0.5';
        }, 10);
        
        setTimeout(() => {
            flyingItem.remove();
            
            // Update cart count
            const countBadge = cart.querySelector('.badge');
            let count = parseInt(countBadge.textContent);
            countBadge.textContent = count + 1;
            
            // Show success message
            const toast = new bootstrap.Toast(document.getElementById('addedToCartToast'));
            toast.show();
        }, 500);
    });
});

// Mobile menu toggle
document.querySelector('.navbar-toggler').addEventListener('click', function() {
    document.querySelector('.navbar-collapse').classList.toggle('show');
});

// Initialize product carousels
document.querySelectorAll('.product-carousel').forEach(carousel => {
    new bootstrap.Carousel(carousel, {
        interval: 5000,
        wrap: true
    });
});

// Function to fetch products from Firestore
// Function to fetch products from Firestore with real-time updates
async function fetchProducts() {
    try {
        const productsRef = db.collection("products"); // Assuming a "products" collection
        
        // Set up a real-time listener
        productsRef.onSnapshot(snapshot => {
            const products = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                products.push({
                    id: doc.id,
                    name: data.productName,
                    price: parseFloat(data.salePrice), // Convert to number
                    oldPrice: data.fullPrice ? parseFloat(data.fullPrice) : null, // Convert to number, handle if not present
                    imageUrl: data.productImages && data.productImages.length > 0 ? data.productImages[0] : 'images/placeholder.jpg', // Use first image, or a placeholder
                    rating: 0, // Default rating as it's not in your data
                    reviews: 0, // Default reviews as it's not in your data
                    isSale: data.isSale || false // Use isSale from data
                });
            });
            renderProducts(products);
        }, error => {
            console.error("Error fetching products: ", error);
        });
    } catch (error) {
        console.error("Error setting up product listener: ", error);
    }
}

// Function to render products
function renderProducts(products) {
    const productContainer = document.querySelector('.featured-products .row.g-4');
    if (!productContainer) return;

    productContainer.innerHTML = ''; // Clear existing products

    products.forEach(product => {
        const productCard = `
            <div class="col-6 col-md-4 col-lg-3">
                <div class="product-card p-3 shadow-sm rounded-3 bg-white">
                    ${product.isSale ? `<div class="badge bg-success position-absolute">Sale</div>` : ''}
                    <img src="${product.imageUrl}" class="img-fluid mb-3" alt="${product.name}">
                    <div class="product-details">
                        <h6>${product.name}</h6>
                        <div class="rating mb-2">
                            ${generateStars(product.rating)}
                            <span class="ms-1">(${product.reviews})</span>
                        </div>
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <span class="text-danger fw-bold">₹${product.price.toFixed(2)}</span>
                                ${product.oldPrice && product.oldPrice !== product.price ? `<span class="text-decoration-line-through text-muted small ms-1">₹${product.oldPrice.toFixed(2)}</span>` : ''}
                            </div>
                            <button class="btn btn-sm btn-success add-to-cart" data-color="#28a745" data-product-id="${product.id}"><i class="fas fa-plus"></i></button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        productContainer.innerHTML += productCard;
    });

    // Re-initialize add to cart animation for new buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const productId = this.dataset.productId;
            const productToAdd = products.find(p => p.id === productId);

            if (productToAdd) {
                addToCart(productToAdd);
            }

            // Animation
            const cart = document.querySelector('.cart-icon');
            const buttonRect = this.getBoundingClientRect();
            const cartRect = cart.getBoundingClientRect();
            
            const flyingItem = document.createElement('div');
            flyingItem.style.cssText = `
                position: fixed;
                z-index: 9999;
                width: 20px;
                height: 20px;
                background-color: ${this.dataset.color || '#28a745'};
                border-radius: 50%;
                left: ${buttonRect.left + buttonRect.width/2 - 10}px;
                top: ${buttonRect.top}px;
                transition: all 0.5s cubic-bezier(0.42, 0, 0.58, 1);
            `;
            
            document.body.appendChild(flyingItem);
            
            setTimeout(() => {
                flyingItem.style.left = `${cartRect.left + cartRect.width/2 - 10}px`;
                flyingItem.style.top = `${cartRect.top}px`;
                flyingItem.style.transform = 'scale(0.2)';
                flyingItem.style.opacity = '0.5';
            }, 10);
            
            setTimeout(() => {
                flyingItem.remove();
                
                // Update cart count
                updateCartCount();
                
                // Show success message
                const toast = new bootstrap.Toast(document.getElementById('addedToCartToast'));
                toast.show();
            }, 500);
        });
    });
}

// Helper function to generate star ratings
function generateStars(rating) {
    let starsHtml = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            starsHtml += '<i class="fas fa-star text-warning"></i>';
        } else if (i - 0.5 === rating) {
            starsHtml += '<i class="fas fa-star-half-alt text-warning"></i>';
        } else {
            starsHtml += '<i class="far fa-star text-warning"></i>';
        }
    }
    return starsHtml;
}

// Cart functions
function getCart() {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    // If on the cart page, re-render items and update summary
    if (window.location.pathname.includes('cart.html')) {
        if (typeof renderCartItems === 'function') {
            renderCartItems();
        }
        if (typeof updateCartSummary === 'function') {
            updateCartSummary();
        }
    }
}

function addToCart(product) {
    const cart = getCart();
    const existingProductIndex = cart.findIndex(item => item.id === product.id);

    if (existingProductIndex > -1) {
        cart[existingProductIndex].quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    saveCart(cart);
}

function updateCartCount() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const countBadge = document.querySelector('.cart-icon .badge');
    if (countBadge) {
        countBadge.textContent = totalItems;
    }
}

// Fetch products when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    updateCartCount(); // Update cart count on page load

    // If on the cart page, render cart items and summary
    if (window.location.pathname.includes('cart.html')) {
        renderCartItems();
        updateCartSummary();
    }
});

// Cart page specific functions (moved from cart.html)
function renderCartItems() {
    const cart = getCart();
    const cartItemsContainer = document.getElementById('cart-items-container');
    const emptyCartMessage = document.getElementById('empty-cart-message');

    if (cart.length === 0) {
        emptyCartMessage.style.display = 'block';
        cartItemsContainer.innerHTML = ''; // Clear any existing items
        return;
    } else {
        emptyCartMessage.style.display = 'none';
    }

    cartItemsContainer.innerHTML = ''; // Clear existing items

    cart.forEach(item => {
        const cartItemHtml = `
            <div class="row align-items-center mb-3 pb-3 border-bottom">
                <div class="col-md-2">
                    <img src="${item.imageUrl}" class="img-fluid rounded" alt="${item.name}">
                </div>
                <div class="col-md-4">
                    <h6 class="mb-0">${item.name}</h6>
                    <small class="text-muted">Price: ₹${item.price.toFixed(2)}</small>
                </div>
                <div class="col-md-3">
                    <div class="input-group input-group-sm">
                        <button class="btn btn-outline-secondary quantity-minus" type="button" data-product-id="${item.id}">-</button>
                        <input type="text" class="form-control text-center quantity-input" value="${item.quantity}" readonly>
                        <button class="btn btn-outline-secondary quantity-plus" type="button" data-product-id="${item.id}">+</button>
                    </div>
                </div>
                <div class="col-md-2 text-end">
                    <span class="fw-bold">₹${(item.price * item.quantity).toFixed(2)}</span>
                </div>
                <div class="col-md-1 text-end">
                    <button class="btn btn-sm btn-danger remove-from-cart" data-product-id="${item.id}"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
        cartItemsContainer.innerHTML += cartItemHtml;
    });

    // Add event listeners for quantity buttons and remove buttons
    document.querySelectorAll('.quantity-minus').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.dataset.productId;
            updateCartItemQuantity(productId, -1);
        });
    });

    document.querySelectorAll('.quantity-plus').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.dataset.productId;
            updateCartItemQuantity(productId, 1);
        });
    });

    document.querySelectorAll('.remove-from-cart').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.dataset.productId;
            removeFromCart(productId);
        });
    });
}

function updateCartItemQuantity(productId, change) {
    const cart = getCart();
    const itemIndex = cart.findIndex(item => item.id === productId);

    if (itemIndex > -1) {
        cart[itemIndex].quantity += change;
        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1); // Remove if quantity is 0 or less
        }
        saveCart(cart); // This will now trigger re-render and summary update via the check in saveCart
    }
}

function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart); // This will now trigger re-render and summary update via the check in saveCart
}

function updateCartSummary() {
    const cart = getCart();
    let subtotal = 0;
    cart.forEach(item => {
        subtotal += item.price * item.quantity;
    });

    const deliveryFee = subtotal > 0 && subtotal < 500 ? 50 : 0; // Example: ₹50 delivery for orders under ₹500
    const total = subtotal + deliveryFee;

    document.getElementById('cart-subtotal').textContent = `₹${subtotal.toFixed(2)}`;
    document.getElementById('cart-delivery-fee').textContent = `₹${deliveryFee.toFixed(2)}`;
    document.getElementById('cart-total').textContent = `₹${total.toFixed(2)}`;
}
// ADD THIS CODE TO YOUR script.js FILE IN GITHUB

// Function to load categories from Firebase
function loadCategoriesFromFirebase() {
    const categoriesRef = db.collection("categories");
    
    categoriesRef.onSnapshot(snapshot => {
        const categories = [];
        snapshot.forEach(doc => {
            categories.push({
                id: doc.id,
                ...doc.data()
            });
        });
        renderCategories(categories);
    }, error => {
        console.error("Error fetching categories: ", error);
    });
}

// Function to render categories
function renderCategories(categories) {
    const categorySection = document.querySelector('.row.g-4');
    if (!categorySection) return;
    
    categorySection.innerHTML = '';
    
    categories.forEach(category => {
        const categoryCard = `
            <div class="col-6 col-md-3">
                <div class="category-card text-center p-4 shadow-sm rounded-3">
                    <img src="${category.categoryImg}" alt="${category.categoryName}" class="img-fluid mb-3" width="80">
                    <h5>${category.categoryName}</h5>
                    <a href="#" class="btn btn-sm btn-outline-success mt-2">Shop Now</a>
                </div>
            </div>
        `;
        categorySection.innerHTML += categoryCard;
    });
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadCategoriesFromFirebase();
});

// Function to filter products by category
function filterProductsByCategory(categoryId, categoryName) {
    console.log('Filtering products for category:', categoryName);
    
    const productsSection = document.querySelector('.featured-products');
    if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    const productsHeading = document.querySelector('.featured-products h2');
    if (productsHeading) {
        productsHeading.textContent = categoryName + ' Products';
    }
    
    const productsRef = db.collection("products").where("categoryId", "==", categoryId);
    
    productsRef.get().then(snapshot => {
        const products = [];
        snapshot.forEach(doc => {
            products.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        if (products.length > 0) {
            renderFilteredProducts(products);
        } else {
            const productContainer = document.querySelector('.featured-products .row.g-4');
            if (productContainer) {
                productContainer.innerHTML = '<div class="col-12 text-center"><p>No products found in this category.</p></div>';
            }
        }
    });
}

function renderFilteredProducts(products) {
    const productContainer = document.querySelector('.featured-products .row.g-4');
    if (!productContainer) return;
    
    productContainer.innerHTML = '';
    
    products.forEach(product => {
        const discount = product.fullPrice && product.salePrice ? 
            Math.round(((product.fullPrice - product.salePrice) / product.fullPrice) * 100) : 0;
        
        const productCard = `
            <div class="col-6 col-md-4 col-lg-3">
                <div class="product-card p-3 shadow-sm rounded-3 bg-white">
                    ${discount > 0 ? `<div class="badge bg-success position-absolute">${discount}% OFF</div>` : ''}
                    <img src="${product.productImages && product.productImages[0] ? product.productImages[0] : 'images/placeholder.jpg'}" class="img-fluid mb-3" alt="${product.productName}">
                    <div class="product-details">
                        <h6>${product.productName}</h6>
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <span class="text-danger fw-bold">₹${product.salePrice}</span>
                                ${product.fullPrice && product.fullPrice != product.salePrice ? 
                                    `<span class="text-decoration-line-through text-muted small ms-1">₹${product.fullPrice}</span>` : ''}
                            </div>
                            <button class="btn btn-sm btn-success"><i class="fas fa-plus"></i></button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        productContainer.innerHTML += productCard;
    });
}

