let tg = window.Telegram.WebApp;
tg.expand();

let cart = {};
let userLocation = null;

// --- ЗАМЕНИ ЭТОТ БЛОК В НАЧАЛЕ app.js ---

// Твое меню с названиями файлов картинок
const menuItems = [
    { name: "Филадельфия", price: 32, image: "resize (2).png" }, // Впиши сюда свои названия файлов!
    { name: "Дракон", price: 30, image: "resize (3).png },
    { name: "Лава", price: 27, image: "resize (5).png" },
    { name: "Токио", price: 30, image: "resize (7).png" },
    { name: "Бангкок", price: 30, image: "resize (8).png" },
    { name: "Калифорния", price: 30, image: "california.jpg" },
    { name: "Шаки Маки", price: 19, image: "shaki.jpg" },
    { name: "Эби Маки", price: 18, image: "ebi.jpg" },
    { name: "Каппи Маки", price: 14, image: "kappi.jpg" },
    { name: "Картошка фри", price: 10, image: "fri.jpg" }
];

function renderMenu() {
    const container = document.getElementById('menu-container');
    container.innerHTML = '';
    
    menuItems.forEach((item, index) => {
        container.innerHTML += `
            <div class="menu-item">
                <div class="item-photo-container">
                    <img src="${item.image}" alt="${item.name}" class="sushi-photo">
                </div>
                <div>
                    <div class="item-title">
                        ${item.name} 
                        <span id="badge-${index}" class="item-badge" style="display: none;"></span>
                    </div>
                    <div class="item-price">${item.price} SAR</div>
                </div>
                <div class="btn-group">
                    <button class="btn-add" onclick="addToCart('${item.name}', ${item.price})">Добавить</button>
                    <button class="btn-minus" onclick="removeFromCart('${item.name}')">➖</button>
                </div>
            </div>
        `;
    });
}

function addToCart(name, price) {
    if (cart[name]) {
        cart[name].count++;
    } else {
        cart[name] = { price: price, count: 1 };
    }
    updateUI();
}

function removeFromCart(name) {
    if (cart[name] && cart[name].count > 0) {
        cart[name].count--;
        if (cart[name].count === 0) delete cart[name]; 
    }
    updateUI();
}

function updateUI() {
    let totalItems = 0;
    let totalSum = 0;

    menuItems.forEach((item, index) => {
        let badge = document.getElementById(`badge-${index}`);
        if (cart[item.name] && cart[item.name].count > 0) {
            badge.innerText = `${cart[item.name].count} шт`;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    });

    for (let name in cart) {
        totalItems += cart[name].count;
        totalSum += cart[name].price * cart[name].count;
    }

    const cartBar = document.getElementById('cart-bar');
    if (totalItems > 0) {
        cartBar.style.display = 'flex';
        document.getElementById('cart-count').innerText = totalItems;
        document.getElementById('cart-bar-sum').innerText = totalSum;
        tg.MainButton.setText(`ОФОРМИТЬ ЗАКАЗ: ${totalSum} SAR`);
        tg.MainButton.show();
    } else {
        cartBar.style.display = 'none';
        tg.MainButton.hide();
        document.getElementById('checkout-modal').style.display = 'none'; 
    }
}

tg.MainButton.onClick(openCart);

function openCart() {
    const modal = document.getElementById('checkout-modal');
    const list = document.getElementById('cart-items-list');
    let totalSum = 0;
    
    list.innerHTML = ''; 

    for (let name in cart) {
        let item = cart[name];
        let itemTotal = item.price * item.count;
        totalSum += itemTotal;
        
        list.innerHTML += `
            <div class="cart-item-row">
                <b>${name} <span style="color:#e67e22">x${item.count}</span></b>
                <b>${itemTotal} SAR</b>
            </div>
        `;
    }
    
    document.getElementById('modal-total-sum').innerText = totalSum;
    modal.style.display = 'flex';
    tg.MainButton.hide(); 
}

function closeCart() {
    document.getElementById('checkout-modal').style.display = 'none';
    updateUI(); 
}

function requestLocation() {
    const statusText = document.getElementById("location-status");
    statusText.innerText = "⏳ Определяем...";
    statusText.style.color = "#ff9800";

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                userLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
                statusText.innerText = "✅ Адрес успешно определен!";
                statusText.style.color = "#4CAF50";
            },
            function(error) {
                statusText.innerText = "❌ Ошибка! Включите GPS на телефоне.";
                statusText.style.color = "#f44336";
            }
        );
    }
}

function sendOrder() {
    if (!userLocation) {
        tg.showAlert("Пожалуйста, нажмите 'Определить мой адрес'!");
        return;
    }

    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    let flatItems = [];
    let totalSum = 0;

    for (let name in cart) {
        for (let i = 0; i < cart[name].count; i++) {
            flatItems.push({ name: name, price: cart[name].price });
        }
        totalSum += cart[name].price * cart[name].count;
    }

    let data = {
        items: flatItems,
        total: totalSum,
        location: userLocation,
        payment: paymentMethod
    };

    tg.sendData(JSON.stringify(data));
}

renderMenu();