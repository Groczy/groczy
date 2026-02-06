// Load banners from Firebase
let currentUser = null;

// Check auth state
firebase.auth().onAuthStateChanged(user => {
    currentUser = user;
    updateAuthUI();
});

function updateAuthUI() {
    const authBtn = document.getElementById('auth-btn');
    const authText = document.getElementById('auth-text');
    if (currentUser) {
        authText.textContent = currentUser.email ? currentUser.email.split('@')[0] : 'Profile';
        authBtn.onclick = logout;
    } else {
        authText.textContent = 'Login';
        authBtn.onclick = showAuthModal;
    }
}

function showAuthModal() {
    const modal = new bootstrap.Modal(document.getElementById('authModal'));
    modal.show();
}

function googleSignIn() {
    const provider = new firebase.auth.GoogleAuthProvider();
    // Use redirect for better compatibility
    firebase.auth().signInWithRedirect(provider);
}

// Handle redirect result
firebase.auth().getRedirectResult()
    .then(result => {
        if (result.user) {
            const user = result.user;
            // Save user data to Firestore
            return db.collection('users').doc(user.uid).set({
                uId: user.uid,
                username: user.displayName || '',
                email: user.email || '',
                phone: user.phoneNumber || '',
                userImg: user.photoURL || '',
                userDeviceToken: '',
                country: '',
                userAddress: '',
                street: '',
                isAdmin: false,
                isActive: true,
                createdOn: firebase.firestore.FieldValue.serverTimestamp(),
                city: ''
            }).then(() => {
                alert('Google Sign-In successful!');
            });
        }
    })
    .catch(error => {
        if (error.code !== 'auth/popup-closed-by-user') {
            console.error('Google Sign-In error:', error);
            alert('Google Sign-In failed: ' + error.message);
        }
    });

function loginUser() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();
    
    if (!email || !password) {
        alert('Please enter email and password');
        return;
    }
    
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then(result => {
            if (!result.user.emailVerified) {
                alert('Please verify your email before logging in.');
                firebase.auth().signOut();
                return;
            }
            currentUser = result.user;
            bootstrap.Modal.getInstance(document.getElementById('authModal')).hide();
            alert('Login successful!');
            updateAuthUI();
        })
        .catch(error => {
            console.error('Login error:', error);
            alert('Login failed: ' + error.message);
        });
}

function signupUser() {
    const username = document.getElementById('signup-username').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const phone = document.getElementById('signup-phone').value.trim();
    const password = document.getElementById('signup-password').value.trim();
    
    if (!username || !email || !phone || !password) {
        alert('Please fill all fields');
        return;
    }
    
    if (phone.length !== 10) {
        alert('Please enter a valid 10-digit phone number');
        return;
    }
    
    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(result => {
            // Save user data to Firestore
            return db.collection('users').doc(result.user.uid).set({
                uId: result.user.uid,
                username: username,
                email: email,
                phone: phone,
                userImg: '',
                userDeviceToken: '',
                country: '',
                userAddress: '',
                street: '',
                isAdmin: false,
                isActive: true,
                createdOn: firebase.firestore.FieldValue.serverTimestamp(),
                city: ''
            });
        })
        .then(() => {
            // Send verification email
            return firebase.auth().currentUser.sendEmailVerification();
        })
        .then(() => {
            alert('Account created! Please verify your email before logging in.');
            firebase.auth().signOut();
            document.getElementById('signup-username').value = '';
            document.getElementById('signup-email').value = '';
            document.getElementById('signup-phone').value = '';
            document.getElementById('signup-password').value = '';
            // Switch to login tab
            document.querySelector('[data-bs-target="#login-tab"]').click();
        })
        .catch(error => {
            console.error('Signup error:', error);
            alert('Signup failed: ' + error.message);
        });
}

function logout() {
    firebase.auth().signOut().then(() => {
        currentUser = null;
        updateAuthUI();
        alert('Logged out successfully');
    });
}

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
let deliveryCharges = 0;
let freeDeliveryThreshold = 0;

// Load delivery charges from Firebase
function loadDeliveryCharges() {
    db.collection("deleverymodel").doc("deliver_chargesmodel").get()
        .then(doc => {
            if (doc.exists) {
                const data = doc.data();
                deliveryCharges = parseFloat(data.deliveryCharges) || 0;
                freeDeliveryThreshold = parseFloat(data.freeDeliveryThreshold) || 0;
                console.log('Delivery charges loaded:', deliveryCharges, 'Free threshold:', freeDeliveryThreshold);
            }
        })
        .catch(error => {
            console.error("Error loading delivery charges:", error);
        });
}

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
    const itemTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Calculate delivery charge
    const isFreeDelivery = itemTotal >= freeDeliveryThreshold;
    const deliveryCharge = isFreeDelivery ? 0 : deliveryCharges;
    const total = itemTotal + deliveryCharge;
    
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
    
    // Update delivery info
    const deliveryInfo = document.getElementById('delivery-info');
    if (!isFreeDelivery && freeDeliveryThreshold > 0) {
        const remaining = freeDeliveryThreshold - itemTotal;
        deliveryInfo.innerHTML = `
            <div class="alert alert-warning mb-0">
                <i class="fas fa-truck"></i> Add items worth ₹${remaining.toFixed(2)} more for FREE delivery!
            </div>
        `;
    } else if (isFreeDelivery) {
        deliveryInfo.innerHTML = `
            <div class="alert alert-success mb-0">
                <i class="fas fa-check-circle"></i> Congratulations! You are eligible for free delivery.
            </div>
        `;
    } else {
        deliveryInfo.innerHTML = '';
    }
    
    document.getElementById('item-total').textContent = `₹${itemTotal.toFixed(2)}`;
    document.getElementById('delivery-charge').textContent = isFreeDelivery ? 'FREE' : `₹${deliveryCharge.toFixed(2)}`;
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

// Proceed to checkout
function proceedToCheckout() {
    if (!currentUser) {
        alert('Please login to proceed with checkout');
        showAuthModal();
        return;
    }
    
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    // Close cart modal
    const cartModal = bootstrap.Modal.getInstance(document.getElementById('cartModal'));
    if (cartModal) cartModal.hide();
    
    // Calculate totals
    const itemTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const isFreeDelivery = itemTotal >= freeDeliveryThreshold;
    const deliveryCharge = isFreeDelivery ? 0 : deliveryCharges;
    const total = itemTotal + deliveryCharge;
    
    // Update checkout modal
    document.getElementById('checkout-item-total').textContent = `₹${itemTotal.toFixed(2)}`;
    document.getElementById('checkout-delivery-charge').textContent = isFreeDelivery ? 'FREE' : `₹${deliveryCharge.toFixed(2)}`;
    document.getElementById('checkout-total').textContent = `₹${total.toFixed(2)}`;
    
    // Show checkout modal
    const checkoutModal = new bootstrap.Modal(document.getElementById('checkoutModal'));
    checkoutModal.show();
}

// Place order
function placeOrder() {
    const form = document.getElementById('checkout-form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const customerName = document.getElementById('customer-name').value.trim();
    const customerPhone = document.getElementById('customer-phone').value.trim();
    const customerAddress = document.getElementById('customer-address').value.trim();
    const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;
    
    if (!customerName || !customerPhone || !customerAddress) {
        alert('Please fill all required fields');
        return;
    }
    
    if (customerPhone.length !== 10) {
        alert('Please enter a valid 10-digit phone number');
        return;
    }
    
    if (paymentMethod === 'online') {
        initiateOnlinePayment(customerName, customerPhone, customerAddress);
    } else {
        processOrder(customerName, customerPhone, customerAddress, 'Cash on Delivery');
    }
}

// Initiate Razorpay payment
function initiateOnlinePayment(customerName, customerPhone, customerAddress) {
    const itemTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const isFreeDelivery = itemTotal >= freeDeliveryThreshold;
    const deliveryCharge = isFreeDelivery ? 0 : deliveryCharges;
    const totalPrice = itemTotal + deliveryCharge;
    
    db.collection('payment_gateway').doc('payment_gateway_r').get()
        .then(doc => {
            if (!doc.exists) {
                alert('Payment gateway not configured');
                return;
            }
            
            const razorpayKey = doc.data().payment_gty;
            if (!razorpayKey) {
                alert('Payment gateway key not found');
                return;
            }
            
            const options = {
                key: razorpayKey,
                amount: Math.round(totalPrice * 100),
                currency: 'INR',
                name: 'Groczy India',
                description: 'Product Purchase',
                handler: function(response) {
                    processOrder(customerName, customerPhone, customerAddress, 'Online Payment', response.razorpay_payment_id);
                },
                prefill: {
                    name: customerName,
                    contact: customerPhone,
                    email: 'customer@example.com'
                },
                theme: {
                    color: '#28a745'
                },
                modal: {
                    ondismiss: function() {
                        console.log('Payment cancelled');
                    }
                }
            };
            
            const rzp = new Razorpay(options);
            rzp.on('payment.failed', function(response) {
                alert('Payment failed: ' + response.error.description);
            });
            rzp.open();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to initialize payment');
        });
}

// Process and save order
function processOrder(customerName, customerPhone, customerAddress, paymentType, paymentId = null) {
    const itemTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const isFreeDelivery = itemTotal >= freeDeliveryThreshold;
    const deliveryCharge = isFreeDelivery ? 0 : deliveryCharges;
    const totalPrice = itemTotal + deliveryCharge;
    
    // Generate order ID matching Flutter app format: ORD + 7-digit random number
    const randomOrderId = 1000000 + Math.floor(Math.random() * 9000000);
    const orderId = 'ORD' + randomOrderId;
    const userId = currentUser.uid;
    
    const orderData = {
        uId: userId,
        customerName: customerName,
        customerPhone: customerPhone,
        customerAddress: customerAddress,
        customerDeviceToken: '',
        orderStatus: false,
        paymentType: paymentType,
        totalPrice: totalPrice,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        deliveryCharges: deliveryCharge
    };
    
    const products = cart.map(item => ({
        productId: item.id,
        productName: item.productName,
        price: item.price,
        quantity: item.quantity,
        productTotalPrice: item.price * item.quantity,
        image: item.image
    }));
    
    const productsForFirebase = cart.map(item => ({
        productId: item.id,
        categoryId: item.categoryId || '',
        productName: item.productName,
        categoryName: item.categoryName || '',
        salePrice: item.price.toString(),
        fullPrice: item.price.toString(),
        productImages: [item.image],
        deliveryTime: '',
        isSale: false,
        productDescription: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        productQuantity: item.quantity,
        productTotalPrice: item.price * item.quantity,
        customerId: userId,
        status: false,
        customerName: customerName,
        customerPhone: customerPhone,
        customerAddress: customerAddress,
        customerDeviceToken: '',
        paymentType: paymentType,
        orderStatus: 'pending',
        deliveryCharges: deliveryCharge
    }));
    
    // Save to same 'orders' collection as Flutter app
    db.collection('orders').doc(userId).set(orderData)
    .then(() => {
        return db.collection('orders').doc(userId).collection('confirmOrders').doc(orderId).set({
            products: productsForFirebase
        });
    })
    .then(() => {
        cart = [];
        localStorage.removeItem('groczyCart');
        updateCartCount();
        
        const checkoutModal = bootstrap.Modal.getInstance(document.getElementById('checkoutModal'));
        if (checkoutModal) checkoutModal.hide();
        
        document.getElementById('checkout-form').reset();
        
        // Redirect to order success page with details
        const params = new URLSearchParams({
            orderId: orderId,
            name: customerName,
            phone: customerPhone,
            address: customerAddress,
            payment: paymentType,
            total: totalPrice.toFixed(2),
            delivery: deliveryCharge.toFixed(2),
            itemTotal: itemTotal.toFixed(2),
            products: JSON.stringify(products)
        });
        window.location.href = 'order-success.html?' + params.toString();
    })
    .catch(error => {
        console.error('Error placing order:', error);
        alert('Failed to place order: ' + error.message);
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Loading Groczy website...');
    loadBanners();
    loadCategories();
    loadProducts();
    loadDeliveryCharges();
    updateCartCount();
});
