// Global Variables
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentTheme = localStorage.getItem('theme') || 'light';

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme
    initTheme();
    
    // Initialize cart count
    updateCartCount();
    
    // Page-specific functionality
    const currentPage = window.location.pathname.split('/').pop();
    
    switch(currentPage) {
        case 'index.html':
        case '':
            initHomePage();
            break;
        case 'products.html':
            initProductsPage();
            break;
        case 'contact.html':
            initContactPage();
            break;
    }
    
    // Common event listeners
    document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
    document.querySelector('.cart-icon')?.addEventListener('click', toggleCart);
    document.querySelector('.close-cart')?.addEventListener('click', toggleCart);
    document.querySelector('.cart-overlay')?.addEventListener('click', toggleCart);
});

// Theme Functions
function initTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon();
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    updateThemeIcon();
}

function updateThemeIcon() {
    const icon = document.querySelector('.theme-toggle i');
    if (icon) {
        icon.className = currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }
}

// Home Page Functions
function initHomePage() {
    updateGreeting();
    updateDate();
}

function updateGreeting() {
    const greetingElement = document.getElementById('greeting');
    if (!greetingElement) return;
    
    const hour = new Date().getHours();
    let greeting;
    
    if (hour < 12) {
        greeting = "Good morning! Welcome to Chapter & Verse";
    } else if (hour < 18) {
        greeting = "Good afternoon! Welcome to Chapter & Verse";
    } else {
        greeting = "Good evening! Welcome to Chapter & Verse";
    }
    
    greetingElement.textContent = greeting;
}

function updateDate() {
    const dateElement = document.getElementById('date-display');
    if (!dateElement) return;
    
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    
    dateElement.textContent = now.toLocaleDateString('en-US', options);
}

// Products Page Functions
function initProductsPage() {
    // Filter functionality
    const filterButtons = document.querySelectorAll('.category-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter products
            const category = this.dataset.category;
            filterProducts(category);
        });
    });
    
    // Add to cart buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.dataset.id;
            const name = this.dataset.name;
            const price = parseFloat(this.dataset.price);
            
            addToCart(id, name, price);
            
            // Show feedback
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-check"></i> Added!';
            this.style.backgroundColor = '#27ae60';
            
            setTimeout(() => {
                this.innerHTML = originalText;
                this.style.backgroundColor = '';
            }, 1500);
        });
    });
    
    // Load cart items in sidebar
    loadCartItems();
    
    // Checkout button
    document.querySelector('.checkout-btn')?.addEventListener('click', function() {
        if (cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }
        
        alert(`Thank you for your order! Total: $${calculateTotal().toFixed(2)}\nThis is a demo - no actual purchase was made.`);
        cart = [];
        saveCart();
        updateCartCount();
        loadCartItems();
        toggleCart();
    });
}

function filterProducts(category) {
    const products = document.querySelectorAll('.product-card');
    
    products.forEach(product => {
        if (category === 'all' || product.dataset.category === category) {
            product.style.display = 'block';
            setTimeout(() => {
                product.style.opacity = '1';
                product.style.transform = 'translateY(0)';
            }, 10);
        } else {
            product.style.opacity = '0';
            product.style.transform = 'translateY(20px)';
            setTimeout(() => {
                product.style.display = 'none';
            }, 300);
        }
    });
}

// Cart Functions
function addToCart(id, name, price) {
    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            id: id,
            name: name,
            price: price,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartCount();
    loadCartItems();
}

function removeFromCart(id) {
    const index = cart.findIndex(item => item.id === id);
    
    if (index !== -1) {
        if (cart[index].quantity > 1) {
            cart[index].quantity--;
        } else {
            cart.splice(index, 1);
        }
    }
    
    saveCart();
    updateCartCount();
    loadCartItems();
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartCount() {
    const countElement = document.querySelector('.cart-count');
    if (countElement) {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        countElement.textContent = totalItems;
    }
}

function calculateTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function loadCartItems() {
    const cartItemsElement = document.querySelector('.cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    
    if (!cartItemsElement || !cartTotalElement) return;
    
    if (cart.length === 0) {
        cartItemsElement.innerHTML = '<p style="text-align: center; padding: 2rem;">Your cart is empty</p>';
        cartTotalElement.textContent = '0.00';
        return;
    }
    
    cartItemsElement.innerHTML = '';
    cart.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>$${item.price.toFixed(2)}</p>
            </div>
            <div class="cart-item-controls">
                <button class="decrease-item" data-id="${item.id}">-</button>
                <span>${item.quantity}</span>
                <button class="increase-item" data-id="${item.id}">+</button>
                <button class="remove-item" data-id="${item.id}"><i class="fas fa-trash"></i></button>
            </div>
        `;
        cartItemsElement.appendChild(itemElement);
    });
    
    // Add event listeners for cart controls
    document.querySelectorAll('.decrease-item').forEach(button => {
        button.addEventListener('click', function() {
            removeFromCart(this.dataset.id);
        });
    });
    
    document.querySelectorAll('.increase-item').forEach(button => {
        button.addEventListener('click', function() {
            const item = cart.find(item => item.id === this.dataset.id);
            if (item) {
                addToCart(item.id, item.name, item.price);
            }
        });
    });
    
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', function() {
            const index = cart.findIndex(item => item.id === this.dataset.id);
            if (index !== -1) {
                cart.splice(index, 1);
                saveCart();
                updateCartCount();
                loadCartItems();
            }
        });
    });
    
    cartTotalElement.textContent = calculateTotal().toFixed(2);
}

function toggleCart() {
    document.querySelector('.cart-sidebar')?.classList.toggle('active');
    document.querySelector('.cart-overlay')?.classList.toggle('active');
}

// Contact Page Functions
function initContactPage() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            submitForm();
        }
    });
    
    // Real-time validation
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const subjectInput = document.getElementById('subject');
    const messageInput = document.getElementById('message');
    
    nameInput?.addEventListener('input', () => validateField('name'));
    emailInput?.addEventListener('input', () => validateField('email'));
    subjectInput?.addEventListener('change', () => validateField('subject'));
    messageInput?.addEventListener('input', () => validateField('message'));
}

function validateField(fieldName) {
    const field = document.getElementById(fieldName);
    const errorElement = document.getElementById(fieldName + 'Error');
    
    if (!field || !errorElement) return true;
    
    let isValid = true;
    let errorMessage = '';
    
    switch(fieldName) {
        case 'name':
            if (field.value.trim().length < 2) {
                isValid = false;
                errorMessage = 'Name must be at least 2 characters';
            }
            break;
            
        case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(field.value.trim())) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
            break;
            
        case 'subject':
            if (!field.value) {
                isValid = false;
                errorMessage = 'Please select a subject';
            }
            break;
            
        case 'message':
            if (field.value.trim().length < 10) {
                isValid = false;
                errorMessage = 'Message must be at least 10 characters';
            }
            break;
    }
    
    if (isValid) {
        field.style.borderColor = '#27ae60';
        errorElement.textContent = '';
    } else {
        field.style.borderColor = '#e74c3c';
        errorElement.textContent = errorMessage;
    }
    
    return isValid;
}

function validateForm() {
    const fields = ['name', 'email', 'subject', 'message'];
    let isValid = true;
    
    fields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    return isValid;
}

function submitForm() {
    // In a real application, this would send data to a server
    // For this demo, we'll just show a success message
    
    document.getElementById('contactForm').style.display = 'none';
    document.getElementById('successMessage').style.display = 'block';
    
    // Reset form after 5 seconds
    setTimeout(() => {
        document.getElementById('contactForm').reset();
        document.getElementById('contactForm').style.display = 'block';
        document.getElementById('successMessage').style.display = 'none';
        
        // Reset field borders
        ['name', 'email', 'subject', 'message'].forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                element.style.borderColor = '';
            }
        });
    }, 5000);
}