/*
 * Плагин создания колонок из списка
 *
 * Передаваемые настройки (объект):
 *
 * @type - тип сортировки элементов в колонках (по-умолчанию snake)
 * @size - количество колонок (по-умолчанию 2)
 * @ratio - коэффициент пропорциональности помещения элементов в колонку (по-умолчанию 50 на 50)
 			используется в методе сортировки userRatio
 * @colClasses - классы, которые добавятся к элементам колонок (по-умолчанию b__col)
 *				 можно передать несколько классов разделенных пробелом.
 *				 При этом класс по-умолчанию перезапишется	
 *
 */

;(function($){

	// Константы для плагина
	// Имя плагина
	// Свойства по-умолчанию
	var pluginName = 'colmaker',
		defaults = {
			type: 'snake',
			size: 2,
			ratio: '1:1',
			colClasses: 'b__col'
		};




	/*
	 * Конструктор плагина
	 *
	 */

	function Plugin(element, options) {

		// Приватное свойство - элемент, обернутый в jQuery
		var $el = $(element);

		// Контейнер, в котором лежат
		// элементы для разбиения на колонки
		this.$list = $el;

		// Элементы контейнера
		this.$items = $el.children();

		// Расширяем свойства
		this.options = $.extend({}, defaults, options);

		// Добавляем возможность обратиться
		// к имени плагина
		this._name = pluginName;

		// Вызываем инициализацию плагина
		this.init();

	}

	// Сокращаем обращение к прототипу
	Plugin.fn = Plugin.prototype;



	/*
	 * Обработка элементов
	 *
	 */

	// Помещаем в контейнер списка колонки
	// Получаем массив колонок,
	// Ранее сгенерированных методом appendToCol
	Plugin.fn.appendToList = function(colList) {

		var $list = this.$list;

		// Итерируемся по колонкам
		// и добавляем их в список
		$.each(colList, function(i, col){
			$list.append(col);
		});

		return this;

	};




	/*
	 * Инициализация
	 *
	 */

	// Запускаем обработку
	Plugin.fn.startProcessing = function() {

		var type = this.options.type,
			methodName = 'TypeMakeCol',

			// Хранилище обработанных колонок
			storage = null;

		// Выбираем алгоритм (если есть),
		// подходящий под тип сортировки
		// и запускаем обработку
		if (!!this[type + methodName]) {

			// Получаем колонки, после обработки определенным алгоритмом
			storage = this[type + methodName]();
			
			// Помещаем колонки в контейнер списка
			this.appendToList(storage);

		} else {
			console.error(type + '- алгоритм разбивки на колонки не найден')
		}

		return this;

	};

	// Инициализация плагина
	Plugin.fn.init = function() {

		// Запускаем разбиение на колонки
		this.startProcessing()

		return this;

	};


	/* 
	 * Методы помощники,
	 * не используются в цепочках вызовов методов
	 * Вохвращают результат, а не вызывающий объект
	 *
	 */

	// Обработка списка
	// Отдает массив разбитых на колонки элементов

	// Алгоритм ЗМЕЙКА: сверху - вниз, слева - направо
	Plugin.fn.snakeTypeMakeCol = function() {

		var $items = this.$items,
			itemLength = this.$items.length,

			// хранилище будущих колонок
			storage = [],
			// временное хранилище элементов
			storageBuffer = null,

			// Определяем сколько элементов будет в колонке
			colElLength = null,

			// индекс с которого будем разбивать на блоки
			// нужен, если сортировка змейкой
			cutIndexStart = null,

			// индекс до которого будем разбивать на блоки
			// нужен, если сортировка змейкой
			cutIndexEnd = null,

			// параметры для итерации
			// количество колонок и сам итератор
			size = this.options.size,
			iterator = 0;

		// Подготавливаем алгоритм разбиения и сортировки

		// Определяем количество элементов в столбце,
		// Это и будет индексом последнего элемента для вырезания массива
		// Округляем до наибольшего целого
		colElLength = Math.ceil(itemLength/size);

		// Проходим итерацией по количеству колонок
		// Собирая список элементов в массивы (будущие колонки)
		for (; iterator < size; iterator++) {

			// Определяем индекс с которого вырезаем элементы в колонку
			cutIndexStart = colElLength*iterator;

			// Определяем индекс, по какой мы вырезаем элементы
			cutIndexEnd = cutIndexStart + colElLength;

			// Сохраняем во временную переменную нашу часть элементов
			storageBuffer = $items.slice(cutIndexStart, cutIndexEnd);

			// Если элементы есть, то сохраняем в элемент массива
			if (!!storageBuffer.length) {

				// Помещаем элементы в контейнер колонки
				storageBuffer = this.appendToCol(storageBuffer);

				// Помещаем целую колонку в хранилище
				storage[iterator] = storageBuffer;
				
			}
			
		}

		return storage;

	};

	// Алгоритм СТРОКА: слева - направо, сверху - вниз
	Plugin.fn.lineTypeMakeCol = function() {

		var $items = this.$items,
			itemLength = this.$items.length,

			// хранилище будущих колонок
			storage = [],

			// временное хранилище элементов
			storageBuffer = null,

			// параметры для итерации
			// количество колонок
			size = this.options.size,

			// Внутренний итератор элементов
			itemsIterator = 0,

			// Итератор цикла
			iterator = 0;

		// Подготавливаем алгоритм разбиения и сортировки

		// Проходим в цикле по количеству колонок
		// равное элементам массива колонок
		for (; iterator < size; iterator++) {

			// Синхронизируем итератор элемента
			itemsIterator = iterator;

			// Инициализируем буффер элементов
			storageBuffer = [];

			// Складываем в колонку все элементы, которые в нее попадают
			while ($items[itemsIterator]) {

				// Помещаем элемент во внутренний буфер
				storageBuffer.push($items[itemsIterator]);

				// Увеличиваем итератор проверки
				// попадания элемента в колонку
				itemsIterator += size;				

			}

			// Помещаем колонку в хранилище
			storage[iterator] = this.appendToCol(storageBuffer);

		}

		return storage;
	};

	// Алгоритм слева - направо, сверху - вниз
	Plugin.fn.userRatioTypeMakeCol = function() {

		var $items = this.$items,
			itemLength = this.$items.length,

			// хранилище будущих колонок
			storage = [],

			// временное хранилище элементов
			storageBuffer = null,

			// Длина временного буфера
			storageBufferLength = null,

			// временный буффер для колонок
			colFirstBuffer = [],
			colSecondBuffer = [],

			// параметры для итерации
			// количество колонок
			// преобразуем в массив
			ratio = this.options.ratio.split(':'),

			// Первый элемент коэффициента
			ratioFirst = null,

			// Первый элемент коэффициента в %
			ratioFirstPersent = null,

			// Второй элемент коэффициента
			ratioSecond = null,

			// Второй элемент коэффициента в %
			ratioSecondPersent = null,

			// СУмма процентов коэффициентов
			ratioPersentSumm = null,

			// Коэффициент пропорциональности
			ratioValue = null,

			// Сумма элементов для одного блока итерации
			ratioSumm = null,

			// Количество элементов для первой колонки
			colFirstSizeEl = null,

			// Количество элементов для второй колонки
			colSecondSizeEl = null,

			// Внутренний итератор элементов
			//itemsIterator = 0,

			// индекс с которого будем разбивать на блок
			cutIndexStart = null,

			// индекс до которого будем разбивать на блок
			cutIndexEnd = null,

			// Итератор цикла
			iterator = 0;

		// Обрабатываем пропорциональность
		
		//переводя строки в цифры через умножение на 1
		ratioFirst = ratio[0]*1;
		ratioSecond = ratio[1]*1;

		// Получаем общую сумму элементов для одной итерации (сумма пропорциональности)
		// Получаем сумму
		ratioSumm = ratioFirst + ratioSecond;

		// Итерируем с шагом, равным ratioSumm
		for (; iterator < itemLength; iterator += ratioSumm) {

			// Индекс с которого получаем блок элементов для разделения
			cutIndexStart = iterator;

			// Индекс до которого получаем блок
			cutIndexEnd = cutIndexStart + ratioSumm;

			// Получаем пачку элементов для разделения
			storageBuffer = $items.slice(cutIndexStart, cutIndexEnd);

				// Сложнейший расчет количества элементов в каждой колонке
				// Определяем количество элементов, которое будем делить
				storageBufferLength = storageBuffer.length;

				// Определяем коэффициент пропорциональности
				ratioValue = (ratioFirst / ratioSecond);

				// Находим процент от каждого элемента пропорциональности
				ratioFirstPersent = 100 * ratioValue;
				ratioSecondPersent = 100;

				// Получаем сумму процентов элементов пропорциональности
				ratioPersentSumm = ratioFirstPersent + ratioSecondPersent;

				// Находим количество элементов для второго столбца
				colSecondSizeEl = Math.round(ratioSecondPersent * ratioSumm / ratioPersentSumm);

				// Находим количество элементов для первого столбца
				colFirstSizeEl = ratioSumm - colSecondSizeEl;

			// Получаем элементы для первой колонки
			//colFirstBuffer = colFirstBuffer.concat(storageBuffer.slice(0, ratioFirst).toArray());
			colFirstBuffer = colFirstBuffer.concat(storageBuffer.slice(0, colFirstSizeEl).toArray());

			// Получаем элементы для второй колонки
			//colSecondBuffer = colSecondBuffer.concat(storageBuffer.slice(ratioFirst, cutIndexEnd).toArray());
			colSecondBuffer = colSecondBuffer.concat(storageBuffer.slice(colFirstSizeEl, cutIndexEnd).toArray());
		}

		storage.push(this.appendToCol(colFirstBuffer));
		storage.push(this.appendToCol(colSecondBuffer));

		return storage;
	},

	// Помещаем элементы в контейнер колонки
	Plugin.fn.appendToCol = function(elList) {

		// контейнер колонки
		var $col = $('<div />'),
			colClasses = this.options.colClasses;

		// Добавляем класс для контейнера колонки
		$col.addClass(colClasses);

		// В цикле помещаем элементы в контейнер
		$.each(elList, function(i, el){
			$col.append(el);
		});

		return $col;

	};




	/*
	 * Публикуем плагин в jQuery
	 *
	 */

	$.fn[pluginName] = function(options) {

		return this.each(function(){

			// Проверка для исключения дублирования вызова плагина на элементе
			if (!$.data(this, 'plugin_' + pluginName)) {
				$.data(this, 'plugin_' + pluginName, new Plugin(this, options));
			}

		});

	};

})(jQuery);