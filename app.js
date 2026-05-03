// версия 3
let tg = window.Telegram.WebApp;
tg.expand(); 

let cart = [];
let totalSum = 0;
let userLocation = null;

// Функция добавления в корзину
function addToCart(itemName, itemPrice) {
    cart.push({name: itemName, price: itemPrice});
    totalSum += itemPrice;
    
    tg.MainButton.text = `Оформить заказ на ${totalSum} SAR`;
    tg.MainButton.show();
}

// Функция запроса геолокации
function requestLocation() {
    const statusText = document.getElementById("location-status");
    statusText.innerText = "Определяем...";

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                statusText.innerText = `✅ Геолокация получена!`;
                statusText.style.color = "#4CAF50";
            },
            function(error) {
                statusText.innerText = "❌ Ошибка геолокации. Разрешите доступ в настройках телефона.";
                statusText.style.color = "#f44336";
            }
        );
    } else {
        statusText.innerText = "Геолокация не поддерживается.";
    }
}

// Отправка данных при нажатии главной кнопки
Telegram.WebApp.onEvent('mainButtonClicked', function() {
    if (!userLocation) {
        tg.showAlert("Пожалуйста, нажмите кнопку 'Определить мое местоположение' перед заказом!");
        return; 
    }

    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;

    let data = {
        items: cart,
        total: totalSum,
        location: userLocation,
        payment: paymentMethod
    };
    
    tg.sendData(JSON.stringify(data)); 
});