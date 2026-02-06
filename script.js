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

// Render categories
function renderCategories(categories) {
    const container = document.getElementById('categories-container');
    if (!container) return;
    
    if (categories.length === 0) {
        container.innerHTML = '<div class="col-12 text-center">No categories available</div>';
        return;
    }
    
    container.innerHTML = '';
    categories.forEach(category => {
        container.innerHTML += `
            <div class="col-6 col-md-3">
                <div class="card text-center p-3 h-100" style="cursor: pointer;" onclick="filterByCategory('${category.categoryId}', '${category.categoryName}')">
                    <img src="${category.categoryImg}" class="card-img-top" alt="${category.categoryName}" style="height: 100px; object-fit: contain;">
                    <div class="card-body">
                        <h6>${category.categoryName}</h6>
                        <button class="btn btn-sm btn-success">Shop Now</button>
                    </div>
                </div>
            </div>
        `;
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
        const discount = product.fullPrice && product.salePrice ? 
            Math.round(((product.fullPrice - product.salePrice) / product.fullPrice) * 100) : 0;
        
        container.innerHTML += `
            <div class="col-6 col-md-4 col-lg-3">
                <div class="card h-100">
                    ${discount > 0 ? `<span class="badge bg-success position-absolute m-2">${discount}% OFF</span>` : ''}
                    <img src="${image}" class="card-img-top" alt="${product.productName}" style="height: 200px; object-fit: cover;">
                    <div class="card-body">
                        <h6 class="card-title">${product.productName}</h6>
                        <p class="mb-0">
                            <span class="text-danger fw-bold">₹${product.salePrice}</span>
                            ${product.fullPrice && product.fullPrice != product.salePrice ? 
                                `<span class="text-muted text-decoration-line-through ms-2">₹${product.fullPrice}</span>` : ''}
                        </p>
                        <button class="btn btn-success btn-sm mt-2 w-100">
                            <i class="fas fa-shopping-cart"></i> Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Loading Groczy website...');
    loadCategories();
    loadProducts();
});
