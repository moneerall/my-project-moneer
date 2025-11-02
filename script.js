// النظام الرئيسي للموقع
class YemenPharmaSystem {
    constructor() {
        this.currentUser = null;
        this.products = [];
        this.filteredProducts = [];
        this.cart = [];
        this.orders = [];
        this.invoices = [];
        this.appointments = [];
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupScrollEffects();
        this.setupForms();
        this.setupModals();
        this.loadProducts();
        this.loadCart();
        this.checkAuthStatus();
        this.setupClientSections();
        this.setupCart();
        this.setupInvoice();
    }

    setupNavigation() {
        // التنقل السلس
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            });
        });

        // القائمة المتنقلة
        const mobileMenu = document.getElementById('mobileMenu');
        const navLinks = document.querySelector('.nav-links');
        const userMenu = document.querySelector('.user-menu');

        if (mobileMenu) {
            mobileMenu.addEventListener('click', () => {
                navLinks.classList.toggle('active');
                userMenu.classList.toggle('active');
            });
        }

        // إغلاق القائمة عند النقر خارجها
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-container')) {
                navLinks.classList.remove('active');
                userMenu.classList.remove('active');
            }
        });
    }

    setupScrollEffects() {
        // تأثيرات الظهور عند التمرير
        const fadeElements = document.querySelectorAll('.fade-in');
        
        const appearOptions = {
            threshold: 0.1,
            rootMargin: "0px 0px -100px 0px"
        };

        const appearOnScroll = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    appearOnScroll.unobserve(entry.target);
                }
            });
        }, appearOptions);

        fadeElements.forEach(element => {
            appearOnScroll.observe(element);
        });
    }

    setupModals() {
        // إعداد النماذج المنبثقة
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const loginModal = document.getElementById('loginModal');
        const registerModal = document.getElementById('registerModal');

        // فتح النماذج
        loginBtn.addEventListener('click', () => this.showModal('loginModal'));
        registerBtn.addEventListener('click', () => this.showModal('registerModal'));

        // إغلاق النماذج
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                e.target.closest('.modal').style.display = 'none';
            });
        });

        // إغلاق عند النقر خارج المحتوى
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });

        // معالجة نماذج التسجيل
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });

        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.register();
        });
    }

    setupForms() {
        // معالجة نموذج الاتصال
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.showNotification('تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.', 'success');
                contactForm.reset();
            });
        }

        // معالجة نموذج حجز الموعد
        const appointmentForm = document.getElementById('appointmentForm');
        if (appointmentForm) {
            appointmentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.bookAppointment();
            });
        }

        // معالجة طرق الدفع
        document.querySelectorAll('.payment-method').forEach(method => {
            method.addEventListener('click', function() {
                document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('active'));
                this.classList.add('active');
            });
        });

        // معالجة تحديث الملف الشخصي
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.updateProfile();
            });
        }

        // إعداد البحث والتصفية
        const searchInput = document.getElementById('productSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchProducts(e.target.value);
            });
        }
    }

    setupClientSections() {
        // تبديل أقسام منطقة العملاء
        document.querySelectorAll('.client-menu a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.getAttribute('data-section');
                
                // تحديث القائمة النشطة
                document.querySelectorAll('.client-menu a').forEach(a => a.classList.remove('active'));
                e.target.classList.add('active');
                
                // إظهار القسم المحدد
                document.querySelectorAll('.client-section').forEach(sec => sec.classList.remove('active'));
                document.getElementById(section + 'Section').classList.add('active');
                
                // تحميل بيانات القسم إذا لزم الأمر
                if (section === 'orders') this.loadOrders();
                if (section === 'invoices') this.loadInvoices();
                if (section === 'appointments') this.loadAppointments();
            });
        });
    }

    setupCart() {
        // إعداد سلة المشتريات
        const cartBtn = document.getElementById('cartBtn');
        const cartSidebar = document.getElementById('cartSidebar');
        const closeCart = document.getElementById('closeCart');
        const checkoutBtn = document.getElementById('checkoutBtn');

        cartBtn.addEventListener('click', () => {
            cartSidebar.classList.add('active');
        });

        closeCart.addEventListener('click', () => {
            cartSidebar.classList.remove('active');
        });

        checkoutBtn.addEventListener('click', () => {
            this.checkout();
        });
    }

    setupInvoice() {
        // إعداد الفاتورة
        const printInvoiceBtn = document.getElementById('printInvoiceBtn');
        const payNowBtn = document.getElementById('payNowBtn');

        printInvoiceBtn.addEventListener('click', () => {
            this.printInvoice();
        });

        payNowBtn.addEventListener('click', () => {
            this.payNow();
        });
    }

    showModal(modalId) {
        document.getElementById(modalId).style.display = 'flex';
    }

    login() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        const users = JSON.parse(localStorage.getItem('yemenPharmaUsers')) || [];
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            this.currentUser = user;
            localStorage.setItem('yemenPharmaCurrentUser', JSON.stringify(user));
            this.updateUI();
            this.hideModal('loginModal');
            this.showNotification('تم تسجيل الدخول بنجاح!', 'success');
        } else {
            this.showNotification('البريد الإلكتروني أو كلمة المرور غير صحيحة', 'error');
        }
    }

    register() {
        const userData = {
            name: document.getElementById('registerName').value,
            email: document.getElementById('registerEmail').value,
            phone: document.getElementById('registerPhone').value,
            pharmacy: document.getElementById('registerPharmacy').value,
            password: document.getElementById('registerPassword').value,
            address: "صنعاء - شارع الستين"
        };

        const users = JSON.parse(localStorage.getItem('yemenPharmaUsers')) || [];
        
        if (users.find(user => user.email === userData.email)) {
            this.showNotification('البريد الإلكتروني مسجل مسبقاً', 'error');
            return;
        }

        const newUser = {
            id: Date.now(),
            ...userData,
            createdAt: new Date().toISOString()
        };
        users.push(newUser);
        localStorage.setItem('yemenPharmaUsers', JSON.stringify(users));

        this.currentUser = newUser;
        localStorage.setItem('yemenPharmaCurrentUser', JSON.stringify(newUser));
        
        this.updateUI();
        this.hideModal('registerModal');
        this.showNotification('تم إنشاء الحساب بنجاح!', 'success');
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('yemenPharmaCurrentUser');
        this.updateUI();
        this.showNotification('تم تسجيل الخروج', 'info');
    }

    checkAuthStatus() {
        const savedUser = localStorage.getItem('yemenPharmaCurrentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.updateUI();
        }
    }

    updateUI() {
        const userMenu = document.querySelector('.user-menu');
        if (!userMenu) return;

        if (this.currentUser) {
            userMenu.innerHTML = `
                <span style="color: var(--primary-blue);">مرحباً، ${this.currentUser.name}</span>
                <a href="#client-area" class="btn btn-primary" style="padding: 8px 20px; text-decoration: none;">
                    <i class="fas fa-user"></i> لوحة التحكم
                </a>
                <button onclick="yemenPharma.logout()" class="btn btn-secondary" style="padding: 8px 20px;">
                    <i class="fas fa-sign-out-alt"></i> تسجيل الخروج
                </button>
            `;
            
            this.updateProfileForm();
        } else {
            userMenu.innerHTML = `
                <button class="login-btn" id="loginBtn">تسجيل الدخول</button>
                <button class="register-btn" id="registerBtn">إنشاء حساب</button>
            `;
            
            // إعادة ربط الأحداث للأزرار الجديدة
            document.getElementById('loginBtn').addEventListener('click', () => this.showModal('loginModal'));
            document.getElementById('registerBtn').addEventListener('click', () => this.showModal('registerModal'));
        }
    }

    updateProfileForm() {
        if (!this.currentUser) return;

        document.getElementById('userName').value = this.currentUser.name || '';
        document.getElementById('userEmail').value = this.currentUser.email || '';
        document.getElementById('userPhone').value = this.currentUser.phone || '';
        document.getElementById('userPharmacy').value = this.currentUser.pharmacy || '';
        document.getElementById('userAddress').value = this.currentUser.address || '';
    }

    updateProfile() {
        const newData = {
            name: document.getElementById('userName').value,
            email: document.getElementById('userEmail').value,
            phone: document.getElementById('userPhone').value,
            pharmacy: document.getElementById('userPharmacy').value,
            address: document.getElementById('userAddress').value
        };

        const users = JSON.parse(localStorage.getItem('yemenPharmaUsers')) || [];
        const userIndex = users.findIndex(u => u.id === this.currentUser.id);
        
        if (userIndex !== -1) {
            users[userIndex] = { ...users[userIndex], ...newData };
            localStorage.setItem('yemenPharmaUsers', JSON.stringify(users));
            
            this.currentUser = users[userIndex];
            localStorage.setItem('yemenPharmaCurrentUser', JSON.stringify(this.currentUser));
            
            this.showNotification('تم تحديث الملف الشخصي بنجاح!', 'success');
        }
    }

    hideModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
        document.querySelector(`#${modalId} form`).reset();
    }

    loadProducts() {
        const productsGrid = document.getElementById('productsGrid');
        if (!productsGrid) return;

        this.products = [
            {
                id: 1,
                name: "أموكسيسيلين 500mg",
                category: "مضادات حيوية",
                price: 1200,
                description: "مضاد حيوي واسع المجال لعلاج الالتهابات البكتيرية",
                image: "https://images.unsplash.com/photo-1585435557343-3b092031d5ad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
            },
            {
                id: 2,
                name: "باراسيتامول 500mg",
                category: "مسكنات",
                price: 800,
                description: "مسكن للألم وخافض للحرارة",
                image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
            },
            {
                id: 3,
                name: "حقن طبية معقمة",
                category: "مستلزمات طبية",
                price: 2500,
                description: "حقن طبية معقمة بمختلف المقاسات",
                image: "https://images.unsplash.com/photo-1615461066841-6116e61058f4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
            },
            {
                id: 4,
                name: "فيتامين سي 1000mg",
                category: "فيتامينات",
                price: 1500,
                description: "مكمل غذائي لدعم المناعة",
                image: "https://images.unsplash.com/photo-1590301157890-4810ed352733?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
            },
            {
                id: 5,
                name: "أدوية السكري",
                category: "أدوية مزمنة",
                price: 1800,
                description: "مجموعة أدوية لمرضى السكري",
                image: "https://images.unsplash.com/photo-1585435557343-3b092031d5ad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
            },
            {
                id: 6,
                name: "مستلزمات العناية",
                category: "مستلزمات طبية",
                price: 3200,
                description: "مستلزمات العناية بالمريض",
                image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
            },
            {
                id: 7,
                name: "أدوية الضغط",
                category: "أدوية مزمنة",
                price: 2000,
                description: "أدوية لعلاج ارتفاع ضغط الدم",
                image: "https://images.unsplash.com/photo-1585435557343-3b092031d5ad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
            },
            {
                id: 8,
                name: "مضادات الالتهاب",
                category: "مسكنات",
                price: 1400,
                description: "أدوية لعلاج الالتهابات المختلفة",
                image: "https://images.unsplash.com/photo-1585435557343-3b092031d5ad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
            },
            {
                id: 9,
                name: "مستحضرات التجميل الطبية",
                category: "مستلزمات طبية",
                price: 2800,
                description: "مستحضرات عناية طبية بالبشرة",
                image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
            }
        ];

        this.filteredProducts = [...this.products];
        this.displayProducts();
    }

    displayProducts() {
        const productsGrid = document.getElementById('productsGrid');
        if (!productsGrid) return;

        productsGrid.innerHTML = this.filteredProducts.map(product => `
            <div class="product-card fade-in">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="product-info">
                    <div class="product-category">${product.category}</div>
                    <h3 class="product-name">${product.name}</h3>
                    <p style="margin-bottom: 1rem; color: var(--dark-gray);">${product.description}</p>
                    <div class="product-price">${product.price.toLocaleString()} ريال</div>
                    <button class="btn btn-primary" onclick="yemenPharma.addToCart(${product.id})" style="width: 100%; margin-top: 1rem;">
                        <i class="fas fa-cart-plus"></i> أضف إلى السلة
                    </button>
                </div>
            </div>
        `).join('');
    }

    searchProducts(query) {
        if (!query.trim()) {
            this.filteredProducts = [...this.products];
        } else {
            this.filteredProducts = this.products.filter(product => 
                product.name.includes(query) || 
                product.description.includes(query) ||
                product.category.includes(query)
            );
        }
        this.displayProducts();
    }

    filterByCategory(category) {
        if (!category) {
            this.filteredProducts = [...this.products];
        } else {
            this.filteredProducts = this.products.filter(product => 
                product.category === category
            );
        }
        this.displayProducts();
    }

    sortProducts(criteria) {
        this.filteredProducts.sort((a, b) => {
            switch (criteria) {
                case 'price':
                    return a.price - b.price;
                case 'category':
                    return a.category.localeCompare(b.category);
                case 'name':
                default:
                    return a.name.localeCompare(b.name);
            }
        });
        this.displayProducts();
    }

    loadCart() {
        const savedCart = localStorage.getItem('yemenPharmaCart');
        if (savedCart) {
            this.cart = JSON.parse(savedCart);
            this.updateCartUI();
        }
    }

    saveCart() {
        localStorage.setItem('yemenPharmaCart', JSON.stringify(this.cart));
    }

    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        const existingItem = this.cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                ...product,
                quantity: 1
            });
        }

        this.saveCart();
        this.updateCartUI();
        this.updateInvoice();
        this.showNotification('تم إضافة المنتج إلى السلة', 'success');
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartUI();
        this.updateInvoice();
        this.showNotification('تم إزالة المنتج من السلة', 'info');
    }

    updateCartQuantity(productId, quantity) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            if (quantity <= 0) {
                this.removeFromCart(productId);
            } else {
                item.quantity = quantity;
                this.saveCart();
                this.updateCartUI();
                this.updateInvoice();
            }
        }
    }

    updateCartUI() {
        const cartItems = document.getElementById('cartItems');
        const cartCount = document.getElementById('cartCount');
        const cartTotal = document.getElementById('cartTotal');

        if (cartItems) {
            cartItems.innerHTML = this.cart.map(item => `
                <div class="cart-item">
                    <div class="cart-item-image">
                        <img src="${item.image}" alt="${item.name}">
                    </div>
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <p>${item.price.toLocaleString()} ريال</p>
                        <div class="cart-item-actions">
                            <button onclick="yemenPharma.updateCartQuantity(${item.id}, ${item.quantity - 1})">-</button>
                            <span>${item.quantity}</span>
                            <button onclick="yemenPharma.updateCartQuantity(${item.id}, ${item.quantity + 1})">+</button>
                        </div>
                    </div>
                    <button onclick="yemenPharma.removeFromCart(${item.id})" style="background: none; border: none; color: #ff4757; cursor: pointer;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `).join('');

            if (this.cart.length === 0) {
                cartItems.innerHTML = '<p style="text-align: center; padding: 2rem;">سلة المشتريات فارغة</p>';
            }
        }

        if (cartCount) {
            cartCount.textContent = this.cart.reduce((total, item) => total + item.quantity, 0);
        }

        if (cartTotal) {
            const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            cartTotal.textContent = `${total.toLocaleString()} ريال`;
        }
    }

    updateInvoice() {
        const invoiceItems = document.getElementById('invoiceItems');
        const invoiceTotal = document.getElementById('invoiceTotal');

        if (invoiceItems) {
            invoiceItems.innerHTML = this.cart.map(item => `
                <div class="invoice-item">
                    <span>${item.name} × ${item.quantity}</span>
                    <span>${(item.price * item.quantity).toLocaleString()} ريال</span>
                </div>
            `).join('');

            const shipping = this.cart.length > 0 ? 500 : 0;
            const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + shipping;

            if (this.cart.length > 0) {
                invoiceItems.innerHTML += `
                    <div class="invoice-item">
                        <span>رسوم الشحن</span>
                        <span>${shipping.toLocaleString()} ريال</span>
                    </div>
                `;
            }

            invoiceTotal.textContent = `${total.toLocaleString()} ريال`;
        }
    }

    checkout() {
        if (this.cart.length === 0) {
            this.showNotification('سلة المشتريات فارغة', 'error');
            return;
        }

        if (!this.currentUser) {
            this.showNotification('يجب تسجيل الدخول لإتمام الشراء', 'error');
            this.showModal('loginModal');
            return;
        }

        const order = {
            id: Date.now(),
            userId: this.currentUser.id,
            items: [...this.cart],
            total: this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 500,
            status: 'معلق',
            createdAt: new Date().toISOString()
        };

        this.orders.push(order);
        localStorage.setItem('yemenPharmaOrders', JSON.stringify(this.orders));

        const invoice = {
            id: Date.now(),
            orderId: order.id,
            userId: this.currentUser.id,
            items: [...this.cart],
            total: order.total,
            createdAt: new Date().toISOString()
        };

        this.invoices.push(invoice);
        localStorage.setItem('yemenPharmaInvoices', JSON.stringify(this.invoices));

        this.cart = [];
        this.saveCart();
        this.updateCartUI();
        this.updateInvoice();

        document.getElementById('cartSidebar').classList.remove('active');
        this.showNotification('تم إنشاء الطلب بنجاح!', 'success');
    }

    printInvoice() {
        if (this.cart.length === 0) {
            this.showNotification('لا توجد فاتورة للطباعة', 'error');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // عنوان الفاتورة
        doc.setFontSize(20);
        doc.text('فاتورة مؤسسة اليمن الدوائية', 105, 15, { align: 'center' });

        // معلومات العميل
        doc.setFontSize(12);
        if (this.currentUser) {
            doc.text(`العميل: ${this.currentUser.name}`, 20, 30);
            doc.text(`البريد الإلكتروني: ${this.currentUser.email}`, 20, 40);
            doc.text(`رقم الهاتف: ${this.currentUser.phone}`, 20, 50);
        }

        // تاريخ الفاتورة
        doc.text(`التاريخ: ${new Date().toLocaleDateString('ar-YE')}`, 20, 60);

        // عناوين الأعمدة
        doc.setFillColor(200, 200, 200);
        doc.rect(20, 70, 170, 10, 'F');
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.text('المنتج', 25, 77);
        doc.text('الكمية', 120, 77);
        doc.text('السعر', 160, 77);

        // عناصر الفاتورة
        let y = 85;
        this.cart.forEach(item => {
            doc.text(item.name, 25, y);
            doc.text(item.quantity.toString(), 120, y);
            doc.text(`${(item.price * item.quantity).toLocaleString()} ريال`, 160, y);
            y += 8;
        });

        // المجموع
        y += 10;
        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 500;
        doc.setFontSize(12);
        doc.text(`المجموع: ${total.toLocaleString()} ريال`, 160, y, { align: 'right' });

        // حفظ الملف
        doc.save('فاتورة-مؤسسة-اليمن-الدوائية.pdf');
        this.showNotification('تم تحميل الفاتورة بنجاح', 'success');
    }

    payNow() {
        if (this.cart.length === 0) {
            this.showNotification('سلة المشتريات فارغة', 'error');
            return;
        }

        if (!this.currentUser) {
            this.showNotification('يجب تسجيل الدخول لإتمام الدفع', 'error');
            this.showModal('loginModal');
            return;
        }

        this.showNotification('جارٍ معالجة الدفع...', 'info');
        
        // محاكاة عملية الدفع
        setTimeout(() => {
            this.checkout();
            this.showNotification('تم الدفع بنجاح!', 'success');
        }, 2000);
    }

    bookAppointment() {
        if (!this.currentUser) {
            this.showNotification('يجب تسجيل الدخول لحجز موعد', 'error');
            this.showModal('loginModal');
            return;
        }

        const appointment = {
            id: Date.now(),
            userId: this.currentUser.id,
            service: document.querySelector('#appointmentForm select').value,
            date: document.querySelector('#appointmentForm input[type="date"]').value,
            time: document.querySelector('#appointmentForm input[type="time"]').value,
            status: 'معلق',
            createdAt: new Date().toISOString()
        };

        this.appointments.push(appointment);
        localStorage.setItem('yemenPharmaAppointments', JSON.stringify(this.appointments));

        document.getElementById('appointmentForm').reset();
        this.showNotification('تم حجز الموعد بنجاح! سنتواصل معك لتأكيد التفاصيل.', 'success');
    }

    loadOrders() {
        const ordersList = document.getElementById('ordersList');
        if (!ordersList) return;

        const savedOrders = localStorage.getItem('yemenPharmaOrders');
        this.orders = savedOrders ? JSON.parse(savedOrders) : [];

        if (this.currentUser) {
            const userOrders = this.orders.filter(order => order.userId === this.currentUser.id);
            
            if (userOrders.length === 0) {
                ordersList.innerHTML = '<p>لا توجد طلبات حالياً</p>';
            } else {
                ordersList.innerHTML = userOrders.map(order => `
                    <div style="background: white; padding: 1.5rem; border-radius: 10px; margin-bottom: 1rem; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                            <h4>طلب #${order.id}</h4>
                            <span style="color: ${order.status === 'مكتمل' ? '#28a745' : '#ffc107'}">${order.status}</span>
                        </div>
                        <p>${order.items.length} منتج</p>
                        <p>المجموع: ${order.total.toLocaleString()} ريال</p>
                        <p>التاريخ: ${new Date(order.createdAt).toLocaleDateString('ar-YE')}</p>
                    </div>
                `).join('');
            }
        }
    }

    loadInvoices() {
        const invoicesList = document.getElementById('invoicesList');
        if (!invoicesList) return;

        const savedInvoices = localStorage.getItem('yemenPharmaInvoices');
        this.invoices = savedInvoices ? JSON.parse(savedInvoices) : [];

        if (this.currentUser) {
            const userInvoices = this.invoices.filter(invoice => invoice.userId === this.currentUser.id);
            
            if (userInvoices.length === 0) {
                invoicesList.innerHTML = '<p>لا توجد فواتير حالياً</p>';
            } else {
                invoicesList.innerHTML = userInvoices.map(invoice => `
                    <div style="background: white; padding: 1.5rem; border-radius: 10px; margin-bottom: 1rem; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                            <h4>فاتورة #${invoice.id}</h4>
                            <button class="btn btn-primary" onclick="yemenPharma.downloadInvoice(${invoice.id})" style="padding: 5px 10px; font-size: 0.8rem;">
                                <i class="fas fa-download"></i> تحميل
                            </button>
                        </div>
                        <p>${invoice.items.length} منتج</p>
                        <p>المجموع: ${invoice.total.toLocaleString()} ريال</p>
                        <p>التاريخ: ${new Date(invoice.createdAt).toLocaleDateString('ar-YE')}</p>
                    </div>
                `).join('');
            }
        }
    }

    loadAppointments() {
        const appointmentsList = document.getElementById('appointmentsList');
        if (!appointmentsList) return;

        const savedAppointments = localStorage.getItem('yemenPharmaAppointments');
        this.appointments = savedAppointments ? JSON.parse(savedAppointments) : [];

        if (this.currentUser) {
            const userAppointments = this.appointments.filter(apt => apt.userId === this.currentUser.id);
            
            if (userAppointments.length === 0) {
                appointmentsList.innerHTML = '<p>لا توجد مواعيد حالياً</p>';
            } else {
                appointmentsList.innerHTML = userAppointments.map(apt => `
                    <div style="background: white; padding: 1.5rem; border-radius: 10px; margin-bottom: 1rem; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                            <h4>موعد #${apt.id}</h4>
                            <span style="color: ${apt.status === 'مكتمل' ? '#28a745' : '#ffc107'}">${apt.status}</span>
                        </div>
                        <p>الخدمة: ${apt.service}</p>
                        <p>التاريخ: ${apt.date}</p>
                        <p>الوقت: ${apt.time}</p>
                    </div>
                `).join('');
            }
        }
    }

    downloadInvoice(invoiceId) {
        const invoice = this.invoices.find(inv => inv.id === invoiceId);
        if (!invoice) return;

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // عنوان الفاتورة
        doc.setFontSize(20);
        doc.text('فاتورة مؤسسة اليمن الدوائية', 105, 15, { align: 'center' });

        // معلومات الفاتورة
        doc.setFontSize(12);
        doc.text(`رقم الفاتورة: ${invoice.id}`, 20, 30);
        doc.text(`التاريخ: ${new Date(invoice.createdAt).toLocaleDateString('ar-YE')}`, 20, 40);

        // عناوين الأعمدة
        doc.setFillColor(200, 200, 200);
        doc.rect(20, 50, 170, 10, 'F');
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.text('المنتج', 25, 57);
        doc.text('الكمية', 120, 57);
        doc.text('السعر', 160, 57);

        // عناصر الفاتورة
        let y = 65;
        invoice.items.forEach(item => {
            doc.text(item.name, 25, y);
            doc.text(item.quantity.toString(), 120, y);
            doc.text(`${(item.price * item.quantity).toLocaleString()} ريال`, 160, y);
            y += 8;
        });

        // المجموع
        y += 10;
        doc.setFontSize(12);
        doc.text(`المجموع: ${invoice.total.toLocaleString()} ريال`, 160, y, { align: 'right' });

        // حفظ الملف
        doc.save(`فاتورة-${invoice.id}.pdf`);
        this.showNotification('تم تحميل الفاتورة بنجاح', 'success');
    }

    showNotification(message, type = 'info') {
        // إزالة أي إشعارات سابقة
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check' : 'info'}-circle"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 4000);
    }
}

// الدوال العامة للبحث والتصفية
function searchProducts() {
    const query = document.getElementById('productSearch').value;
    yemenPharma.searchProducts(query);
}

function filterProducts() {
    const category = document.getElementById('categoryFilter').value;
    yemenPharma.filterByCategory(category);
}

function sortProducts() {
    const criteria = document.getElementById('sortFilter').value;
    yemenPharma.sortProducts(criteria);
}

// تهيئة النظام عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    window.yemenPharma = new YemenPharmaSystem();
});