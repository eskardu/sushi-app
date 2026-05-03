// 1. Инициализация Telegram WebApp
let tg = window.Telegram.WebApp;
tg.expand();

// 2. Глобальные переменные
let cart = {}; // Оставляем ТОЛЬКО ОДНО объявление пустого объекта
let userLocation = null;

// --- ФУНКЦИИ КОРЗИНЫ ---

// Добавление товара
function addToCart(name, price) {
    if (cart[name]) {
        cart[name].count++;
    } else {
        cart[name] = { price: price, count: 1 };
    }
    updateUI();
}

// Удаление товара (минус один)
function removeFromCart(name) {
    if (cart[name]) {
        cart[name].count--;
        if (cart[name].count <= 0) {
            delete cart[name];
        }
    }
    updateUI();
}

// Обновление всего интерфейса (нижний бар и модальное окно)
function updateUI() {
    const cartBar = document.getElementById('cart-bar');
    const itemsList = document.getElementById('cart-items-list');
    const cartCount = document.getElementById('cart-count');
    const cartBarSum = document.getElementById('cart-bar-sum');
    const modalTotalSum = document.getElementById('modal-total-sum');

    let totalSum = 0;
    let totalItems = 0;
    
    // Очищаем список в модальном окне перед перерисовкой
    itemsList.innerHTML = ''; 

    // Перебираем объект корзины
    for (let name in cart) {
        let item = cart[name];
        let itemTotal = item.price * item.count;
        totalSum += itemTotal;
        totalItems += item.count;

        // Добавляем HTML-код товара в список модалки
        itemsList.innerHTML += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <b>${name}</b><br>
                    <small>${item.price} SAR × ${item.count}</small>
                </div>
                <div class="cart-item-price">${itemTotal} SAR</div>
                <button class="remove-btn" onclick="removeFromCart('${name}')">✕</button>
            </div>
        `;
    }

    // Показываем/скрываем плавающую панель (баг-фикс: проверяем наличие элементов)
    if (cartBar) {
        if (totalItems > 0) {
            cartBar.style.display = 'flex';
            if (cartCount) cartCount.innerText = totalItems;
            if (cartBarSum) cartBarSum.innerText = totalSum;
            if (modalTotalSum) modalTotalSum.innerText = totalSum;
        } else {
            cartBar.style.display = 'none';
            closeCart(); // Закрываем модалку, если корзина опустела
        }
    }
}

// --- УПРАВЛЕНИЕ ОКНАМИ ---

function openCart() {
    document.getElementById('cart-modal').style.display = 'block';
}

function closeCart() {
    document.getElementById('cart-modal').style.display = 'none';
}

// --- ГЕОЛОКАЦИЯ ---

function requestLocation() {
    const statusText = document.getElementById("location-status");
    if (!statusText) return;

    statusText.innerText = "Определяем...";

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                statusText.innerText = "✅ Геолокация получена!";
                statusText.style.color = "#4CAF50";
            },
            function(error) {
                statusText.innerText = "❌ Ошибка. Проверьте настройки GPS.";
                statusText.style.color = "#f44336";
            }
        );
    } else {
        statusText.innerText = "Браузер не поддерживает GPS";
    }
}

// --- ФИНАЛЬНАЯ ОТПРАВКА БОТУ ---

function sendOrder() {
    // 1. Проверка на пустоту
    if (Object.keys(cart).length === 0) {
        tg.showAlert("Ваша корзина пуста!");
        return;
    }

    // 2. Проверка локации
    if (!userLocation) {
        tg.showAlert("Пожалуйста, определите местоположение для доставки!");
        return;
    }

    // 3. Получаем способ оплаты
    const paymentOption = document.querySelector('input[name="payment"]:checked');
    const paymentMethod = paymentOption ? paymentOption.value : "cash";

    // 4. Подготавливаем данные (разворачиваем объект в плоский список для Python)
    let flatItems = [];
    let finalSum = 0;

    for (let name in cart) {
        for (let i = 0; i < cart[name].count; i++) {
            flatItems.push({ name: name, price: cart[name].price });
        }
        finalSum += cart[name].price * cart[name].count;
    }

    // 5. Формируем и отправляем объект
    let resultData = {
        items: flatItems,
        total: finalSum,
        location: userLocation,
        payment: paymentMethod
    };

    tg.sendData(JSON.stringify(resultData));
}