"use strict"

const lazyImages = document.querySelectorAll('img[data-src]');
const loadMapBlock = document.querySelector('._load-map')
const windowHeight = document.documentElement.clientHeight // чистая высота экрана браузера без скроллов
const loadMoreBlock = document.querySelector('._load-more')

let lazeImagesPositions = []
//массив положений всех картинок относительно верха,чтобы понять, когда мы добрались до изображений
if (lazyImages.length > 0) {
   lazyImages.forEach(img => {
      if (img.dataset.src) {
         lazeImagesPositions.push(img.getBoundingClientRect().top + pageYOffset)
      }
   })
}
window.addEventListener('scroll', lazyScroll)

function lazyScroll() {
   if (document.querySelectorAll('img[data-src]').length > 0) {
      lazeScrollCheck()
   }
   if (!loadMapBlock.classList.contains('_loaded')) {// когда объект НЕ загружен !!!
      getMap()
   }
   if (!loadMoreBlock.classList.contains('_loading')) {
      loadMore()
   }

}
function lazeScrollCheck() {
   let imgIndex = lazeImagesPositions.findIndex(positionImg => { // поиск индекса по элементу
      return pageYOffset > positionImg - windowHeight // если мы проскролили больше, чем позиция элемента - высота окна браузера
        // мы возвращаем индекс элемента тогда, когда проксролили больше,
      // чем значение элемент минус высота окна браузера
   })
   if (imgIndex >= 0) {// мы получаем КАЖДЫЙ элемент массива благодаря тому, что удаляем в конце ячейку
      if (lazyImages[imgIndex].dataset.src) { // если массив наших картинок с найденным индексом имеет дата-атрибут, то
         lazyImages[imgIndex].src = lazyImages[imgIndex].dataset.src; // мы присваем к атрибуту src то значение, которое было в дата-атрибуте
         lazyImages[imgIndex].removeAttribute('data-src'); // удаляем дата-атрибут 
      }
      delete lazeImagesPositions[imgIndex] // после наденных совпадений мы чистим ячейки позиций в массиве
   }
}

// подгрузка карты

function getMap() {
   const loadMapBlockPosition = loadMapBlock.getBoundingClientRect().top + pageYOffset
   if (pageYOffset > loadMapBlockPosition - windowHeight) {
      const loadMapUrl = loadMapBlock.dataset.map
      if (loadMapUrl) {
         loadMapBlock.insertAdjacentHTML( // позволяет нам вставлять кусок html
            'beforeend',
            `<iframe src="${loadMapUrl}" style="border: 0; width: 100%; height: 100%;" allowfullscreen="" loading="lazy"></iframe>`
         );
         loadMapBlock.classList.add('_loaded') // когда объект загружен 
      }
   }
}


// бесконечный скрол 

function loadMore() {
   const loadMoreBlockPos = loadMoreBlock.getBoundingClientRect().top + pageYOffset
   const loadMoreBlockHeight = loadMoreBlock.offsetHeight
   if (pageYOffset > ((loadMoreBlockPos + loadMoreBlockHeight) - windowHeight) || pageYOffset > loadMoreBlockPos - windowHeight) { // сложение высота секции с его расположение с верху документа - высота экрана
      getContent();
   }
}

async function getContent() { // работа с AJAX-технологией
   if (!document.querySelector('._loading-icon')) {//если нет иконки загрузки
      loadMoreBlock.insertAdjacentHTML(
         'beforeend',
         `<div class='_loading-icon'></div>`
      )
   }
   loadMoreBlock.classList.add('_loading') // в дальнейшем для проверки: если этот класс есть, мы не будем вызывать заново функцию
   // чтобы избежать повторной отправки на сервер

   let response = await fetch('_more.html', { // берем текст через технологию AJAX 
      method: 'GET',
   }) // ответ
   if (response.ok) {
      let result = await response.text()//Мы получаем содержимое текста в переменную result
      loadMoreBlock.insertAdjacentHTML(
         'beforeend',
         result // в конце после всего контента вставляю все содержимое, взятое из файла more
      )
      loadMoreBlock.classList.remove('_loading')//удаляем класс, как  подтверждение того, что мы все загрузили
      if (document.querySelector('._loading-icon')) {
         document.querySelector('._loading-icon').remove() // просто удаляем имитацию загрузки
      }
   } else {
      alert('Ошибка')
   }
}
