// Inicializar EmailJS - SUBSTITUA PELOS SEUS DADOS
emailjs.init("ttDB4b7xZiKKwdIXe");
// Seu web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyATgc9OYfLQPS8hg4s_-9gtnSCqe7g5aCk",
    authDomain: "site-moveis-dcta.firebaseapp.com",
    projectId: "site-moveis-dcta",
    storageBucket: "site-moveis-dcta.firebasestorage.app",
    messagingSenderId: "700731489277",
    appId: "1:700731489277:web:e62284e6a67625096ef794"
};
// Initialize Firebase
let db, auth;
try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    auth = firebase.auth();
    console.log("Firebase inicializado com sucesso");
    console.log("Projeto ID: " + firebaseConfig.projectId);
} catch (error) {
    console.error("Erro ao inicializar Firebase:", error);
}
// Global variables
let currentUser = null;
let selectedImages = [];
let currentProductId = null;
let allProducts = [];
let currentFilters = {
    search: '',
    condition: 'all',
    priceMin: null,
    priceMax: null,
    sort: 'recent',
    user: 'all'
};
let userData = {
    name: '',
    phone: '',
    photoURL: ''
};
// Authentication state observer
auth.onAuthStateChanged(function(user) {
    if (user) {
        // User is signed in
        currentUser = user;
        console.log("Usuário logado: " + user.email + " (UID: " + user.uid + ")");
        updateUserInterface(user);
        loadUserData(user.uid);
    } else {
        // User is signed out
        currentUser = null;
        console.log("Usuário deslogado");
        updateUserInterface(null);
    }
});
// Update UI based on auth state
function updateUserInterface(user) {
    const userMenu = document.getElementById('userMenu');
    const loginLink = document.getElementById('loginLink');
    const newAdBtn = document.getElementById('newAdBtn');
    const loginBtn = document.getElementById('loginBtn');
    
    if (user) {
        // Show user menu, hide login link
        userMenu.style.display = 'block';
        loginLink.style.display = 'none';
        newAdBtn.style.display = 'inline-block';
        loginBtn.style.display = 'none';
        
        // Update user info
        const userName = user.displayName || user.email.split('@')[0];
        document.getElementById('userName').textContent = userName;
        
        // Update avatar - usando apenas a inicial do nome
        const userAvatarText = document.getElementById('userAvatarText');
        userAvatarText.textContent = userName.charAt(0).toUpperCase();
    } else {
        // Show login link, hide user menu
        userMenu.style.display = 'none';
        loginLink.style.display = 'block';
        newAdBtn.style.display = 'none';
        loginBtn.style.display = 'inline-block';
    }
}
// Load user data from Firestore
async function loadUserData(userId) {
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        
        if (userDoc.exists) {
            const data = userDoc.data();
            userData.name = data.name || '';
            userData.phone = data.phone || '';
            userData.photoURL = data.photoURL || '';
            
            // Update UI with user data
            if (userData.name) {
                document.getElementById('userName').textContent = userData.name;
            }
            
            console.log("Dados do usuário carregados: " + JSON.stringify(userData));
        } else {
            console.log("Nenhum dado de usuário encontrado no Firestore");
        }
    } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
    }
}
// Toggle user dropdown
function toggleUserDropdown() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.classList.toggle('show');
}
// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const userMenu = document.getElementById('userMenu');
    const dropdown = document.getElementById('userDropdown');
    
    if (!userMenu.contains(event.target)) {
        dropdown.classList.remove('show');
    }
});
// Show/hide auth form
function showAuthForm() {
    document.getElementById('authSection').style.display = 'block';
    document.getElementById('addProductSection').style.display = 'none';
    document.getElementById('recoverySection').style.display = 'none';
    document.getElementById('profileSection').style.display = 'none';
    scrollToElement('authSection');
}
function hideAuthForm() {
    document.getElementById('authSection').style.display = 'none';
}
// Switch between login and register tabs
function switchAuthTab(tab) {
    const tabs = document.querySelectorAll('.auth-tab');
    const contents = document.querySelectorAll('.auth-content');
    
    tabs.forEach(t => t.classList.remove('active'));
    contents.forEach(c => c.classList.remove('active'));
    
    if (tab === 'login') {
        tabs[0].classList.add('active');
        document.getElementById('loginContent').classList.add('active');
    } else {
        tabs[1].classList.add('active');
        document.getElementById('registerContent').classList.add('active');
    }
}
// Login form submission
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Show loading modal
    const loadingModal = new bootstrap.Modal(document.getElementById('loadingModal'));
    loadingModal.show();
    
    try {
        console.log("Tentando fazer login: " + email);
        
        // Sign in with Firebase
        await auth.signInWithEmailAndPassword(email, password);
        
        // Hide loading modal
        loadingModal.hide();
        
        // Hide auth form
        hideAuthForm();
        
        console.log("Login realizado com sucesso");
    } catch (error) {
        console.error("Erro ao fazer login:", error);
        
        // Hide loading modal
        loadingModal.hide();
        
        // Show error message
        let errorMessage = "Erro ao fazer login. Verifique suas credenciais.";
        
        if (error.code === 'auth/user-not-found') {
            errorMessage = "Usuário não encontrado. Verifique o email ou crie uma conta.";
        } else if (error.code === 'auth/wrong-password') {
            errorMessage = "Senha incorreta. Tente novamente.";
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = "Email inválido. Verifique o formato do email.";
        }
        
        alert(errorMessage);
    }
});
// Register form submission
document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    const phone = document.getElementById('registerPhone').value;
    
    if (password !== confirmPassword) {
        alert("As senhas não coincidem. Tente novamente.");
        return;
    }
    
    if (password.length < 6) {
        alert("A senha deve ter pelo menos 6 caracteres.");
        return;
    }
    
    // Show loading modal
    const loadingModal = new bootstrap.Modal(document.getElementById('loadingModal'));
    loadingModal.show();
    
    try {
        console.log("Tentando criar conta: " + email);
        
        // Create user with Firebase
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Update user profile
        await user.updateProfile({
            displayName: name
        });
        
        // Save additional user data to Firestore
        await db.collection('users').doc(user.uid).set({
            name,
            email,
            phone,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Update global user data
        userData.name = name;
        userData.phone = phone;
        
        // Hide loading modal
        loadingModal.hide();
        
        // Hide auth form
        hideAuthForm();
        
        console.log("Conta criada com sucesso");
    } catch (error) {
        console.error("Erro ao criar conta:", error);
        
        // Hide loading modal
        loadingModal.hide();
        
        // Show error message
        let errorMessage = "Erro ao criar conta. Tente novamente.";
        
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = "Este email já está em uso. Tente fazer login.";
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = "Email inválido. Verifique o formato do email.";
        } else if (error.code === 'auth/weak-password') {
            errorMessage = "A senha é muito fraca. Escolha uma senha mais forte.";
        }
        
        alert(errorMessage);
    }
});
// Logout function
async function logout() {
    try {
        console.log("Fazendo logout");
        
        await auth.signOut();
        
        // Reset user data
        userData = {
            name: '',
            phone: '',
            photoURL: ''
        };
        
        // Close dropdown
        document.getElementById('userDropdown').classList.remove('show');
        
        console.log("Logout realizado com sucesso");
    } catch (error) {
        console.error("Erro ao fazer logout:", error);
        alert("Erro ao fazer logout. Tente novamente.");
    }
}
// Password recovery form
document.getElementById('recoveryForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('recoveryEmailInput').value;
    
    // Show loading modal
    const loadingModal = new bootstrap.Modal(document.getElementById('loadingModal'));
    loadingModal.show();
    
    try {
        console.log("Enviando email de recuperação para: " + email);
        
        // Send password reset email
        await auth.sendPasswordResetEmail(email);
        
        // Hide loading modal
        loadingModal.hide();
        
        // Show success message
        alert("Email de recuperação enviado! Verifique sua caixa de entrada.");
        
        // Hide recovery form
        hideRecoveryForm();
        
        console.log("Email de recuperação enviado com sucesso");
    } catch (error) {
        console.error("Erro ao enviar email de recuperação:", error);
        
        // Hide loading modal
        loadingModal.hide();
        
        // Show error message
        let errorMessage = "Erro ao enviar email de recuperação. Tente novamente.";
        
        if (error.code === 'auth/user-not-found') {
            errorMessage = "Usuário não encontrado. Verifique o email.";
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = "Email inválido. Verifique o formato do email.";
        }
        
        alert(errorMessage);
    }
});
// Show/hide recovery form
function showRecoveryForm() {
    document.getElementById('recoverySection').style.display = 'block';
    document.getElementById('authSection').style.display = 'none';
    document.getElementById('addProductSection').style.display = 'none';
    document.getElementById('profileSection').style.display = 'none';
    scrollToElement('recoverySection');
}
function hideRecoveryForm() {
    document.getElementById('recoverySection').style.display = 'none';
}
// Show/hide profile form
function showProfile() {
    // Check if user is logged in
    if (!currentUser) {
        showAuthForm();
        return;
    }
    
    // Load user data into form
    document.getElementById('profileNameDisplay').textContent = userData.name || 'Nome não informado';
    document.getElementById('profileEmailDisplay').textContent = currentUser.email || 'Email não informado';
    
    // Update profile avatar - usando apenas a inicial do nome
    const profileAvatarText = document.getElementById('profileAvatarText');
    const profileAvatarImg = document.getElementById('profileAvatarImg');
    
    const initial = (userData.name || 'U').charAt(0).toUpperCase();
    profileAvatarText.textContent = initial;
    profileAvatarText.style.display = 'block';
    profileAvatarImg.style.display = 'none';
    
    // Update view profile content
    document.getElementById('viewName').textContent = userData.name || 'Não informado';
    document.getElementById('viewEmail').textContent = currentUser.email || 'Não informado';
    document.getElementById('viewPhone').textContent = userData.phone || 'Não informado';
    
    // Update edit profile form
    document.getElementById('editName').value = userData.name || '';
    document.getElementById('editEmail').value = currentUser.email || '';
    document.getElementById('editPhone').value = userData.phone || '';
    document.getElementById('editPassword').value = '';
    document.getElementById('editConfirmPassword').value = '';
    
    // Show profile section and hide others
    document.getElementById('profileSection').style.display = 'block';
    document.getElementById('authSection').style.display = 'none';
    document.getElementById('addProductSection').style.display = 'none';
    document.getElementById('recoverySection').style.display = 'none';
    scrollToElement('profileSection');
    
    // Close dropdown
    document.getElementById('userDropdown').classList.remove('show');
}
function hideProfile() {
    document.getElementById('profileSection').style.display = 'none';
}
// Switch between view and edit profile tabs
function switchProfileTab(tab) {
    const tabs = document.querySelectorAll('.profile-tab');
    const contents = document.querySelectorAll('.profile-content');
    
    tabs.forEach(t => t.classList.remove('active'));
    contents.forEach(c => c.classList.remove('active'));
    
    if (tab === 'view') {
        tabs[0].classList.add('active');
        document.getElementById('viewProfileContent').classList.add('active');
    } else {
        tabs[1].classList.add('active');
        document.getElementById('editProfileContent').classList.add('active');
    }
}
// Edit profile form submission
document.getElementById('editProfileForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const name = document.getElementById('editName').value.trim();
    const email = document.getElementById('editEmail').value.trim();
    const phone = document.getElementById('editPhone').value.trim();
    const password = document.getElementById('editPassword').value;
    const confirmPassword = document.getElementById('editConfirmPassword').value;
    
    if (!name || !email || !phone) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    if (password && password !== confirmPassword) {
        alert('As senhas não coincidem. Tente novamente.');
        return;
    }
    
    if (password && password.length < 6) {
        alert('A senha deve ter pelo menos 6 caracteres.');
        return;
    }
    
    // Show loading modal
    const loadingModal = new bootstrap.Modal(document.getElementById('loadingModal'));
    loadingModal.show();
    
    try {
        console.log("Atualizando perfil do usuário");
        
        // Update user profile in Firebase Auth
        const authUpdateData = {
            displayName: name
        };
        
        await currentUser.updateProfile(authUpdateData);
        
        // Update password if provided
        if (password) {
            await currentUser.updatePassword(password);
        }
        
        // Update user data in Firestore
        const updateData = {
            name,
            phone
        };
        
        await db.collection('users').doc(currentUser.uid).update(updateData);
        
        // Update global user data
        userData.name = name;
        userData.phone = phone;
        
        // Atualizar todos os anúncios do usuário com os novos dados
        await updateUserProducts();
        
        // Update UI
        document.getElementById('userName').textContent = name;
        document.getElementById('profileNameDisplay').textContent = name;
        document.getElementById('viewName').textContent = name;
        document.getElementById('viewPhone').textContent = phone;
        
        // Hide loading modal
        loadingModal.hide();
        
        // Switch to view tab
        switchProfileTab('view');
        
        // Show success message
        alert('Perfil atualizado com sucesso!');
        
        console.log("Perfil atualizado com sucesso");
    } catch (error) {
        console.error("Erro ao atualizar perfil:", error);
        
        // Hide loading modal
        loadingModal.hide();
        
        // Show error message
        let errorMessage = "Erro ao atualizar perfil. Tente novamente.";
        
        if (error.code === 'auth/requires-recent-login') {
            errorMessage = "Por segurança, você precisa fazer login novamente para alterar sua senha. Faça logout e login novamente.";
        }
        
        alert(errorMessage);
    }
});
// Função para atualizar todos os produtos do usuário com os novos dados
async function updateUserProducts() {
    try {
        console.log("Atualizando anúncios do usuário com novos dados");
        
        // Buscar todos os produtos do usuário
        const snapshot = await db.collection('products')
            .where('userId', '==', currentUser.uid)
            .get();
        
        // Se não tiver produtos, não precisa fazer nada
        if (snapshot.empty) {
            console.log("Usuário não possui anúncios para atualizar");
            return;
        }
        
        // Preparar o batch update
        const batch = db.batch();
        
        // Atualizar cada produto com os novos dados do usuário
        snapshot.forEach(doc => {
            const productRef = db.collection('products').doc(doc.id);
            batch.update(productRef, {
                sellerName: userData.name,
                sellerContact: userData.phone
            });
        });
        
        // Executar o batch update
        await batch.commit();
        
        console.log(`Atualizados ${snapshot.size} anúncios com os novos dados do usuário`);
        
        // Recarregar os produtos para atualizar a interface
        await loadProducts();
    } catch (error) {
        console.error("Erro ao atualizar anúncios do usuário:", error);
        // Não interrompe o fluxo se falhar a atualização dos produtos
    }
}
// Show/hide add form
function showAddForm(productId = null) {
    // Check if user is logged in
    if (!currentUser) {
        showAuthForm();
        return;
    }
    
    // Reset form
    document.getElementById('productForm').reset();
    resetImageUpload();
    
    // Set form mode (add or edit)
    if (productId) {
        // Edit mode
        document.getElementById('formTitle').textContent = 'Editar Anúncio';
        document.getElementById('submitBtn').innerHTML = '<i class="bi bi-pencil-square"></i> Salvar Alterações';
        
        // Load product data
        loadProductData(productId);
    } else {
        // Add mode
        document.getElementById('formTitle').textContent = 'Anunciar seu Produto';
        document.getElementById('submitBtn').innerHTML = '<i class="bi bi-plus-circle"></i> Publicar Anúncio';
        document.getElementById('productId').value = '';
    }
    
    // Update user info display
    updateUserContactDisplay();
    
    document.getElementById('addProductSection').style.display = 'block';
    document.getElementById('authSection').style.display = 'none';
    document.getElementById('recoverySection').style.display = 'none';
    document.getElementById('profileSection').style.display = 'none';
    document.getElementById('productName').focus();
    scrollToElement('addProductSection');
}
// Update user contact display
function updateUserContactDisplay() {
    const displayName = document.getElementById('displayName');
    const displayPhone = document.getElementById('displayPhone');
    const sellerNameInput = document.getElementById('sellerName');
    const sellerContactInput = document.getElementById('sellerContact');
    
    if (userData.name) {
        displayName.textContent = userData.name;
        sellerNameInput.value = userData.name;
    } else {
        displayName.textContent = 'Não informado';
        sellerNameInput.value = '';
    }
    
    if (userData.phone) {
        displayPhone.textContent = userData.phone;
        sellerContactInput.value = userData.phone;
    } else {
        displayPhone.textContent = 'Não informado';
        sellerContactInput.value = '';
    }
}
function hideAddForm() {
    document.getElementById('addProductSection').style.display = 'none';
    document.getElementById('productForm').reset();
    resetImageUpload();
}
// Load product data for editing
async function loadProductData(productId) {
    try {
        console.log("Carregando dados do anúncio: " + productId);
        
        const productDoc = await db.collection('products').doc(productId).get();
        
        if (!productDoc.exists) {
            alert("Anúncio não encontrado.");
            hideAddForm();
            return;
        }
        
        const product = productDoc.data();
        
        // Check if the product belongs to the current user
        if (product.userId !== currentUser.uid) {
            alert("Você não tem permissão para editar este anúncio.");
            hideAddForm();
            return;
        }
        
        // Fill form with product data
        document.getElementById('productId').value = productId;
        document.getElementById('productName').value = product.name;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productDescription').value = product.description;
        
        // Set condition
        selectCondition(product.condition);
        
        // Load images
        selectedImages = product.images.map(img => ({ data: img }));
        updateImageGrid();
        
        console.log("Dados do anúncio carregados com sucesso");
    } catch (error) {
        console.error("Erro ao carregar dados do anúncio:", error);
        alert("Erro ao carregar dados do anúncio. Tente novamente.");
        hideAddForm();
    }
}
// Select product condition
function selectCondition(condition) {
    // Update hidden input
    document.getElementById('productCondition').value = condition;
    
    // Update UI
    const options = document.querySelectorAll('#addProductSection .filter-option');
    options.forEach(option => {
        if (option.dataset.condition === condition) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });
}
// Multiple images handling functions
function previewMultipleImages(event) {
    const files = Array.from(event.target.files);
    
    // Limitar a 5 imagens
    if (selectedImages.length + files.length > 5) {
        alert('Você pode adicionar no máximo 5 fotos.');
        return;
    }
    
    files.forEach(file => {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            alert(`A imagem ${file.name} é muito grande. Por favor, escolha imagens menores que 5MB.`);
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            selectedImages.push({
                name: file.name,
                data: e.target.result
            });
            updateImageGrid();
        };
        reader.readAsDataURL(file);
    });
    
    // Limpar o input para permitir selecionar a mesma imagem novamente
    event.target.value = '';
}
function updateImageGrid() {
    const grid = document.getElementById('uploadGrid');
    
    // Clear existing items except the add-more button
    const items = grid.querySelectorAll('.upload-item');
    items.forEach(item => {
        if (!item.classList.contains('add-more')) {
            item.remove();
        }
    });
    
    // Add image previews
    selectedImages.forEach((image, index) => {
        const item = document.createElement('div');
        item.className = 'upload-item';
        item.innerHTML = `
            <img src="${image.data}" alt="Preview">
            <button type="button" class="btn-remove" onclick="removeImage(${index})">
                <i class="bi bi-x"></i>
            </button>
        `;
        grid.insertBefore(item, grid.lastElementChild);
    });
    
    // Show/hide add-more button
    const addMoreBtn = grid.querySelector('.add-more');
    if (selectedImages.length >= 5) {
        addMoreBtn.style.display = 'none';
    } else {
        addMoreBtn.style.display = 'block';
    }
}
function removeImage(index) {
    selectedImages.splice(index, 1);
    updateImageGrid();
}
function resetImageUpload() {
    selectedImages = [];
    updateImageGrid();
    document.getElementById('productImages').value = '';
}
// Drag and drop functionality
function setupDragAndDrop() {
    const dropZone = document.getElementById('uploadGrid');
    
    dropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--primary-color)';
        dropZone.style.backgroundColor = 'rgba(255, 123, 37, 0.05)';
    });
    
    dropZone.addEventListener('dragleave', function(e) {
        e.preventDefault();
        dropZone.style.borderColor = '#ddd';
        dropZone.style.backgroundColor = 'white';
    });
    
    dropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        dropZone.style.borderColor = '#ddd';
        dropZone.style.backgroundColor = 'white';
        
        const files = Array.from(e.dataTransfer.files);
        const input = document.getElementById('productImages');
        input.files = e.dataTransfer.files;
        previewMultipleImages({ target: { files: files } });
    });
}
// Format price function
function formatPrice(price) {
    // Remove any existing R$ and format
    const numericPrice = price.replace(/[^\d,]/g, '');
    const parts = numericPrice.split(',');
    let integerPart = parts[0] || '0';
    let decimalPart = parts[1] || '00';
    
    // Add thousands separator
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    // Ensure decimal part has 2 digits
    decimalPart = decimalPart.padEnd(2, '0').slice(0, 2);
    
    return `${integerPart},${decimalPart}`;
}
// Change image function
function changeImage(productId, direction) {
    const container = document.getElementById(`images-${productId}`);
    const images = container.querySelectorAll('img');
    const counter = document.getElementById(`counter-${productId}`);
    
    let currentIndex = -1;
    images.forEach((img, index) => {
        if (img.classList.contains('active')) {
            currentIndex = index;
        }
    });
    
    // Remove active class from current image
    images[currentIndex].classList.remove('active');
    
    // Calculate new index
    let newIndex = currentIndex + direction;
    if (newIndex < 0) newIndex = images.length - 1;
    if (newIndex >= images.length) newIndex = 0;
    
    // Add active class to new image
    images[newIndex].classList.add('active');
    
    // Update counter
    counter.textContent = `${newIndex + 1} / ${images.length}`;
}
// Add/Edit product
document.getElementById('productForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    console.log("Iniciando processo de envio de formulário");
    
    const productId = document.getElementById('productId').value;
    const name = document.getElementById('productName').value.trim();
    const price = document.getElementById('productPrice').value.trim();
    const condition = document.getElementById('productCondition').value;
    const description = document.getElementById('productDescription').value.trim();
    const sellerName = document.getElementById('sellerName').value.trim();
    const sellerContact = document.getElementById('sellerContact').value.trim();
    
    console.log("Dados do formulário coletados");
    
    if (!name || !price || !description || !sellerName || !sellerContact) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    if (selectedImages.length === 0) {
        alert('Por favor, adicione pelo menos uma foto do produto.');
        return;
    }
    
    // Mostrar indicador de carregamento
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Enviando...';
    submitBtn.disabled = true;
    
    // Show loading modal
    const loadingModal = new bootstrap.Modal(document.getElementById('loadingModal'));
    let modalHidden = false;
    
    // Function to hide modal safely
    const hideLoadingModal = () => {
        if (!modalHidden) {
            loadingModal.hide();
            modalHidden = true;
        }
    };
    
    loadingModal.show();
    
    try {
        console.log("Processando envio do anúncio");
        
        // Create/update product object
        const productData = {
            name,
            price,
            condition,
            description,
            images: selectedImages.map(img => img.data),
            sellerName,
            sellerContact,
            userId: currentUser.uid, // Usando UID do Firebase Authentication
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        let result;
        
        if (productId) {
            // Update existing product
            console.log("Atualizando anúncio existente: " + productId);
            
            // Verify ownership before updating
            const productDoc = await db.collection('products').doc(productId).get();
            if (!productDoc.exists || productDoc.data().userId !== currentUser.uid) {
                throw new Error("Você não tem permissão para editar este anúncio.");
            }
            
            await db.collection('products').doc(productId).update(productData);
            result = { success: true, id: productId };
            console.log("Anúncio atualizado com sucesso");
        } else {
            // Create new product
            console.log("Criando novo anúncio");
            productData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            const docRef = await db.collection('products').add(productData);
            result = { success: true, id: docRef.id };
            console.log("Anúncio criado com ID: " + docRef.id);
        }
        
        if (!result.success) {
            throw new Error(result.error);
        }
        
        // Update user data if different from profile
        if (sellerName !== userData.name || sellerContact !== userData.phone) {
            console.log("Atualizando dados do usuário no perfil");
            await db.collection('users').doc(currentUser.uid).update({
                name: sellerName,
                phone: sellerContact
            });
            
            // Update global user data
            userData.name = sellerName;
            userData.phone = sellerContact;
        }
        
        // Reset form and hide
        this.reset();
        resetImageUpload();
        hideAddForm();
        
        // Hide loading modal
        hideLoadingModal();
        
        // Reload products
        await loadProducts();
        
        // Show success modal
        const modal = new bootstrap.Modal(document.getElementById('successModal'));
        document.getElementById('successModalTitle').textContent = productId ? 'Anúncio Atualizado!' : 'Anúncio Publicado!';
        document.getElementById('successModalMessage').textContent = productId ? 
            'Seu anúncio foi atualizado com sucesso!' : 
            'Seu anúncio foi publicado com sucesso e já está visível no site!';
        modal.show();
        
        console.log("Operação concluída com sucesso");
    } catch (error) {
        console.error("ERRO ao processar envio:", error);
        hideLoadingModal();
        alert("Ocorreu um erro ao processar o anúncio. Por favor, tente novamente.");
    } finally {
        // Restaurar o botão
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
});
// Load products from Firestore
async function loadProducts() {
    try {
        console.log("Carregando anúncios do Firebase");
        
        let query = db.collection('products');
        
        // Apply sorting
        if (currentFilters.sort === 'recent') {
            query = query.orderBy('createdAt', 'desc');
        } else if (currentFilters.sort === 'price-low') {
            query = query.orderBy('price', 'asc');
        } else if (currentFilters.sort === 'price-high') {
            query = query.orderBy('price', 'desc');
        }
        
        const snapshot = await query.get();
        
        const products = [];
        snapshot.forEach(doc => {
            const productData = doc.data();
            products.push({
                id: doc.id,
                ...productData
            });
        });
        
        allProducts = products;
        
        console.log("Carregados " + products.length + " anúncios");
        applyFilters();
        return products;
    } catch (error) {
        console.error("Erro ao carregar anúncios:", error);
        displayProducts([]);
        return [];
    }
}
// Apply all filters to products
function applyFilters() {
    let filteredProducts = [...allProducts];
    
    // Apply user filter
    if (currentFilters.user === 'mine' && currentUser) {
        filteredProducts = filteredProducts.filter(product => 
            product.userId === currentUser.uid
        );
    }
    
    // Apply search filter
    if (currentFilters.search) {
        const searchTerm = currentFilters.search.toLowerCase();
        filteredProducts = filteredProducts.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm) ||
            product.sellerName.toLowerCase().includes(searchTerm)
        );
    }
    
    // Apply condition filter
    if (currentFilters.condition !== 'all') {
        filteredProducts = filteredProducts.filter(product => 
            product.condition === currentFilters.condition
        );
    }
    
    // Apply price range filter
    if (currentFilters.priceMin !== null) {
        filteredProducts = filteredProducts.filter(product => {
            const productPrice = parseInt(product.price.replace(/[^\d]/g, ''));
            return productPrice >= currentFilters.priceMin;
        });
    }
    
    if (currentFilters.priceMax !== null) {
        filteredProducts = filteredProducts.filter(product => {
            const productPrice = parseInt(product.price.replace(/[^\d]/g, ''));
            return productPrice <= currentFilters.priceMax;
        });
    }
    
    // Apply sorting
    if (currentFilters.sort === 'recent') {
        filteredProducts.sort((a, b) => {
            const dateA = a.createdAt ? a.createdAt.toDate() : new Date(0);
            const dateB = b.createdAt ? b.createdAt.toDate() : new Date(0);
            return dateB - dateA;
        });
    } else if (currentFilters.sort === 'price-low') {
        filteredProducts.sort((a, b) => {
            const priceA = parseInt(a.price.replace(/[^\d]/g, ''));
            const priceB = parseInt(b.price.replace(/[^\d]/g, ''));
            return priceA - priceB;
        });
    } else if (currentFilters.sort === 'price-high') {
        filteredProducts.sort((a, b) => {
            const priceA = parseInt(a.price.replace(/[^\d]/g, ''));
            const priceB = parseInt(b.price.replace(/[^\d]/g, ''));
            return priceB - priceA;
        });
    }
    
    displayProducts(filteredProducts);
    updateActiveFilters();
}
// Update active filters display
function updateActiveFilters() {
    const activeFiltersContainer = document.getElementById('activeFilters');
    activeFiltersContainer.innerHTML = '<span class="me-2">Filtros ativos:</span>';
    
    let hasActiveFilters = false;
    
    // Add search filter
    if (currentFilters.search) {
        activeFiltersContainer.innerHTML += `
            <span class="active-filter-tag">
                Pesquisa: "${currentFilters.search}"
                <button onclick="removeFilter('search')">&times;</button>
            </span>
        `;
        hasActiveFilters = true;
    }
    
    // Add condition filter
    if (currentFilters.condition !== 'all') {
        const conditionText = currentFilters.condition.charAt(0).toUpperCase() + currentFilters.condition.slice(1);
        activeFiltersContainer.innerHTML += `
            <span class="active-filter-tag">
                Estado: ${conditionText}
                <button onclick="removeFilter('condition')">&times;</button>
            </span>
        `;
        hasActiveFilters = true;
    }
    
    // Add price range filter
    if (currentFilters.priceMin !== null || currentFilters.priceMax !== null) {
        let priceText = 'Preço: ';
        if (currentFilters.priceMin !== null && currentFilters.priceMax !== null) {
            priceText += `R$ ${currentFilters.priceMin} - R$ ${currentFilters.priceMax}`;
        } else if (currentFilters.priceMin !== null) {
            priceText += `A partir de R$ ${currentFilters.priceMin}`;
        } else {
            priceText += `Até R$ ${currentFilters.priceMax}`;
        }
        
        activeFiltersContainer.innerHTML += `
            <span class="active-filter-tag">
                ${priceText}
                <button onclick="removeFilter('price')">&times;</button>
            </span>
        `;
        hasActiveFilters = true;
    }
    
    // Add user filter
    if (currentFilters.user !== 'all') {
        activeFiltersContainer.innerHTML += `
            <span class="active-filter-tag">
                Meus Anúncios
                <button onclick="removeFilter('user')">&times;</button>
            </span>
        `;
        hasActiveFilters = true;
    }
    
    // Show/hide active filters container
    activeFiltersContainer.style.display = hasActiveFilters ? 'flex' : 'none';
}
// Remove a specific filter
function removeFilter(filterType) {
    switch (filterType) {
        case 'search':
            currentFilters.search = '';
            document.getElementById('searchInput').value = '';
            break;
        case 'condition':
            currentFilters.condition = 'all';
            document.querySelector('.filter-option[data-filter="all"][onclick*="condition"]').classList.add('active');
            document.querySelector('.filter-option[data-filter="novo"][onclick*="condition"]').classList.remove('active');
            document.querySelector('.filter-option[data-filter="seminovo"][onclick*="condition"]').classList.remove('active');
            document.querySelector('.filter-option[data-filter="usado"][onclick*="condition"]').classList.remove('active');
            break;
        case 'price':
            currentFilters.priceMin = null;
            currentFilters.priceMax = null;
            document.getElementById('priceMin').value = '';
            document.getElementById('priceMax').value = '';
            break;
        case 'user':
            currentFilters.user = 'all';
            document.querySelector('.filter-option[data-filter="all"][onclick*="user"]').classList.add('active');
            document.querySelector('.filter-option[data-filter="mine"][onclick*="user"]').classList.remove('active');
            break;
    }
    
    applyFilters();
}
// Clear all filters
function clearAllFilters() {
    currentFilters = {
        search: '',
        condition: 'all',
        priceMin: null,
        priceMax: null,
        sort: 'recent',
        user: 'all'
    };
    
    // Reset UI elements
    document.getElementById('searchInput').value = '';
    document.getElementById('priceMin').value = '';
    document.getElementById('priceMax').value = '';
    
    // Reset filter options
    document.querySelectorAll('.filter-option').forEach(option => {
        option.classList.remove('active');
        if (option.dataset.filter === 'all') {
            option.classList.add('active');
        }
    });
    
    applyFilters();
}
// Search products
function searchProducts(event) {
    if (event.key === 'Enter' || event.type === 'click') {
        currentFilters.search = document.getElementById('searchInput').value.trim();
        applyFilters();
    }
}
// Filter by price range
function filterByPrice() {
    const priceMinValue = document.getElementById('priceMin').value;
    const priceMaxValue = document.getElementById('priceMax').value;
    
    // Parse min price
    if (priceMinValue !== '') {
        const minPrice = parseInt(priceMinValue);
        if (!isNaN(minPrice)) {
            currentFilters.priceMin = minPrice;
        }
    } else {
        currentFilters.priceMin = null;
    }
    
    // Parse max price
    if (priceMaxValue !== '') {
        const maxPrice = parseInt(priceMaxValue);
        if (!isNaN(maxPrice)) {
            currentFilters.priceMax = maxPrice;
        }
    } else {
        currentFilters.priceMax = null;
    }
    
    applyFilters();
}
// Filter products
function filterProducts(value, type) {
    // Update filter state
    currentFilters[type] = value;
    
    // Update UI
    const options = document.querySelectorAll(`.filter-option[data-filter="${value}"]`);
    options.forEach(option => {
        // Remove active class from siblings
        const siblings = Array.from(option.parentNode.children);
        siblings.forEach(sibling => sibling.classList.remove('active'));
        
        // Add active class to selected option
        option.classList.add('active');
    });
    
    // Apply filters
    applyFilters();
}
// Show user's ads
function showMyAds() {
    // Set filter to show only user's ads
    filterProducts('mine', 'user');
    
    // Scroll to products section
    scrollToElement('produtos');
    
    // Close dropdown
    document.getElementById('userDropdown').classList.remove('show');
}
// Request delete with confirmation
function requestDelete(productId) {
    currentProductId = productId;
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
    deleteModal.show();
}
// Confirm delete
async function confirmDelete() {
    if (!currentProductId) return;
    
    try {
        console.log("Excluindo anúncio: " + currentProductId);
        
        // Verify ownership before deleting
        const productDoc = await db.collection('products').doc(currentProductId).get();
        if (!productDoc.exists || productDoc.data().userId !== currentUser.uid) {
            throw new Error("Você não tem permissão para excluir este anúncio.");
        }
        
        await db.collection('products').doc(currentProductId).delete();
        
        console.log("Anúncio excluído com sucesso");
        
        // Close modal
        const deleteModal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
        deleteModal.hide();
        
        // Reload products
        await loadProducts();
        
        // Show success message
        alert('Anúncio excluído com sucesso!');
    } catch (error) {
        console.error("Erro ao excluir anúncio:", error);
        alert("Ocorreu um erro ao excluir o anúncio. Por favor, tente novamente.");
    }
}
// Contact seller
function contactProduct(productName, sellerContact) {
    const message = `Olá! Vi seu anúncio do(a) ${productName} no DesapegoCTA e tenho interesse. Podemos conversar?`;
    const whatsappUrl = `https://wa.me/55${sellerContact.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}
// Display products in the UI
function displayProducts(products) {
    const container = document.getElementById('productsContainer');
    container.innerHTML = '';
    if (products.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-info">
                    <i class="bi bi-info-circle"></i> 
                    ${currentFilters.user === 'mine' ? 
                        'Você ainda não tem anúncios. <a href="#" onclick="showAddForm()">Crie seu primeiro anúncio!</a>' : 
                        'Nenhum anúncio encontrado com os filtros selecionados.'}
                </div>
            </div>
        `;
        return;
    }
    products.forEach(product => {
        // Check if the current user is the owner of this product
        const isOwner = currentUser && product.userId === currentUser.uid;
        const conditionClass = `condition-${product.condition}`;
        const conditionText = product.condition.charAt(0).toUpperCase() + product.condition.slice(1);
        
        const productCard = `
            <div class="col-md-6 col-lg-4">
                <div class="product-card">
                    <div class="product-image-container">
                        <div class="product-images" id="images-${product.id}">
                            ${product.images.map((img, index) => `
                                <img src="${img}" alt="${product.name}" 
                                     class="product-img ${index === 0 ? 'active' : ''}"
                                     onerror="this.src='https://picsum.photos/seed/fallback/400/300'">
                            `).join('')}
                        </div>
                        ${product.images.length > 1 ? `
                            <button class="nav-btn prev" onclick="changeImage('${product.id}', -1)">
                                <i class="bi bi-chevron-left"></i>
                            </button>
                            <button class="nav-btn next" onclick="changeImage('${product.id}', 1)">
                                <i class="bi bi-chevron-right"></i>
                            </button>
                            <div class="image-counter">
                                <span id="counter-${product.id}">1 / ${product.images.length}</span>
                            </div>
                        ` : ''}
                    </div>
                    <div class="product-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h3 class="product-title">${product.name}</h3>
                            ${isOwner ? `
                                <div class="dropdown">
                                    <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                        <i class="bi bi-three-dots-vertical"></i>
                                    </button>
                                    <ul class="dropdown-menu">
                                        <li><a class="dropdown-item" href="#" onclick="showAddForm('${product.id}')">
                                            <i class="bi bi-pencil"></i> Editar
                                        </a></li>
                                        <li><a class="dropdown-item text-danger" href="#" onclick="requestDelete('${product.id}')">
                                            <i class="bi bi-trash"></i> Excluir
                                        </a></li>
                                    </ul>
                                </div>
                            ` : ''}
                        </div>
                        <div class="product-condition ${conditionClass}">${conditionText}</div>
                        <div class="product-price">R$ ${formatPrice(product.price)}</div>
                        <p class="product-description">${product.description}</p>
                        
                        <!-- Seller Info Card -->
                        <div class="seller-info-card">
                            <div class="seller-details">
                                <div class="seller-name">
                                    <i class="bi bi-person"></i> ${product.sellerName}
                                </div>
                                <div class="seller-contact">
                                    <i class="bi bi-telephone"></i> ${product.sellerContact}
                                </div>
                            </div>
                        </div>
                        
                        <button class="btn btn-contact w-100" onclick="contactProduct('${product.name.replace(/'/g, "\\'")}', '${product.sellerContact}')">
                            <i class="bi bi-whatsapp"></i> Falar com Vendedor
                        </button>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += productCard;
    });
}
// Toggle filters visibility
function toggleFilters() {
    const filterToggle = document.getElementById('filterToggle');
    const filterContent = document.getElementById('filterContent');
    
    filterToggle.classList.toggle('active');
    filterContent.classList.toggle('show');
}
// Utility functions
function scrollToProducts() {
    scrollToElement('produtos');
}
function scrollToElement(elementId) {
    document.getElementById(elementId).scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}
// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
// Add scroll effect to navbar
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.padding = '0.5rem 0';
    } else {
        navbar.style.padding = '1rem 0';
    }
});
// Load products on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log("Página carregada");
    loadProducts();
    setupDragAndDrop();
    
    // Ajustar formulários para dispositivos móveis
    if (window.innerWidth <= 768) {
        // Aumentar tamanho dos alvos de toque
        const touchTargets = document.querySelectorAll('.btn, .filter-option, .nav-link, .upload-item');
        touchTargets.forEach(target => {
            target.style.minHeight = '44px';
            target.style.minWidth = '44px';
        });
        
        // Melhorar experiência de upload em dispositivos móveis
        const imageInput = document.getElementById('productImages');
        if (imageInput) {
            imageInput.setAttribute('capture', 'environment');
        }
    }
    
    // Prevenir comportamento padrão em formulários móveis
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            // Garantir que o teclado seja fechado antes do envio
            if (window.innerWidth <= 768) {
                document.activeElement.blur();
            }
        });
    });
});
