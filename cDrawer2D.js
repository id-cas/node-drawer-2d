/**
 * Created by Cowork-2 on 05.08.16.
 */
var drw = require('./../libs/graphics/2D/DrawingSizes.js');

module.exports = Object({
	__getScaleFactor: function(planeRegion, canvasSize) {
		/**
		 * Рассчитывает коэффициент масштабирования для максимального вписывания объекта начертания в элемент отображения
		 *
		 * planeRegion: размеры прямоугольника в который вписана проекция {x: val, y: val}
		 * canvasSize: размеры части холста, куда будет вписана проекция {x: val, y: val}
		 */

		var regionRatio = planeRegion.x / planeRegion.y,
			displayRatio = canvasSize.x / canvasSize.y;


	
		// Определим по какой стороне подгонять размер чертежа и рассчитаем коэффициент массштабирования
		var factor = 1;
		if(regionRatio >= displayRatio){
			// Подгонка по ширине
			factor = canvasSize.x / planeRegion.x;
		}
		else{
			// Подгонка по высоте
			factor = canvasSize.y / planeRegion.y;
		}
	
		return factor;
	},


	/**
	 * Масштабирует проекцию
	 *
	 * @param plane
	 * @returns {*}
	 * @private
	 */
	__scalePlane: function( plane, factor ){
		// Отмасштабированные элементы проекции
		var scaledElements = {};


		// Пробежимся по всем отдельным элементам сцены
		var elements = plane.el;

		var polygon = [],
			element = [],
			elementsName = Object.keys( elements );
		for( var i = 0; i < elementsName.length; i++ ){

			element = elements[ elementsName[i] ];  // Набор точек полигонов
			scaledElements[ elementsName[i] ] = [];

			// Для каждого полигона
			for( var j = 0; j < element.length; j++ ){

				polygon = element[j];
				scaledElements[ elementsName[i] ][ j ] = [];

				// Для каждой точки полигона
				for( var k = 0; k < polygon.length; k++ ){
					scaledElements[ elementsName[i] ][ j ].push([
						factor * polygon[k][0],
						factor * polygon[k][1]
					]);

				}

			}

		}

		// Элементы проекции
		plane.el = scaledElements;

		// Размеры проекции
		plane.rg.sz.x = factor * plane.rg.sz.x;
		plane.rg.sz.y = factor * plane.rg.sz.y;
		plane.rg.lim.x.min = factor * plane.rg.lim.x.min;
		plane.rg.lim.x.max = factor * plane.rg.lim.x.max;
		plane.rg.lim.y.min = factor * plane.rg.lim.y.min;
		plane.rg.lim.y.max = factor * plane.rg.lim.y.max;


		// Отмасштабированная проекция
		return plane;
	},


	/**
	 * Смещает проекцию
	 *
	 * plane
	 * offset: { x: val, y:val }
	 * @private
	 */
	__translate: function( plane, offset ) {
		// Смещенные элементы проекции
		var translatedElements = {};


		// Пробежимся по всем отдельным элементам сцены
		var elements = plane.el;


		var polygon = [],
			element = [],
			elementsName = Object.keys( elements );
		for( var i = 0; i < elementsName.length; i++ ){

			element = elements[ elementsName[i] ];  // Набор точек полигонов
			translatedElements[ elementsName[i] ] = [];


			// Для каждого полигона
			for( var j = 0; j < element.length; j++ ){

				polygon = element[j];
				translatedElements[ elementsName[i] ][ j ] = [];

				// Для каждой точки полигона
				for( var k = 0; k < polygon.length; k++ ){

					translatedElements[ elementsName[i] ][ j ].push([
						polygon[k][0] + offset.x,
						polygon[k][1] + offset.y
					]);

				}

			}

		}

		// Элементы проекции
		plane.el = translatedElements;

		// Размеры проекции
		plane.rg.lim.x.min = plane.rg.lim.x.min + offset.x;
		plane.rg.lim.x.max = plane.rg.lim.x.max + offset.x;
		plane.rg.lim.y.min = plane.rg.lim.y.min + offset.y;
		plane.rg.lim.y.max = plane.rg.lim.y.max + offset.y;


		// Смещеннная проекция
		return plane;
	},


	/**
	 * Смещает проекцию в центр холста
	 *
	 * @param plane
	 * @param canvasSize
	 * @private
	 */
	__toCenter: function( plane, canvasSizes ){
		return this.__translate( plane, {
			x: - plane.rg.lim.x.min + 0.5 * ( canvasSizes.sz.x - plane.rg.sz.x ) + 0.5 * ( canvasSizes.padd.l - canvasSizes.padd.r ),
			y: - plane.rg.lim.y.min + 0.5 * ( canvasSizes.sz.y - plane.rg.sz.y ) +  0.5 * ( canvasSizes.padd.t - canvasSizes.padd.b )
		} );
	},
	

	/**
	 * Спозиционировать проекцию по центру холста
	 *
	 * plane: набор элементов проекции в виде отдельных групп точек полигонов
	 * {
	 *  el: elements,                                 // элементы проекции
		rg: this.getPlaneRangeBox(elements)           // границы проекции в формате {lim: {x: {min: *, max: *}, y: {min: *, max: *}}, sz: {x: number, y: number, z: number}}
	 * }
	 *
	 * plotSizes: {
	 *      // Размеры холста
	 *      sz: {
	 *          x: val,    // ширина холста
	 *          y: val     // высота холста
	 *      },
	 *      // Рамка
	 *      fr: {
	 *          x: val,    // ширина рамки по ширине
	 *          y: val     // ширина рамки по высоте
	 *      },
	 *      // Дополнительные отступы, для нанесения размеров на проекцию
	 *      padd: {
	 *          t: val,     // отступ для размеров сверху
	 *          l: val,     // отступ для размеров слева
	 *          b: val,     // отступ для размеров снизу
	 *          r: val      // отступ для размеров справа
	 *      }
	 * }
	 *
	 * return {
	 *      plane: {},  // нормированная сцена
	 *      scale: val      // коэффициент преобразования размеров к исходным значениям
	 * }
	 */
	normalizePlane: function( plane, plotSizes ) {

		// Коэффициент преобразования размеров проекции для "вписывания" в размеры холста с учетом отступов
		var factor = this.__getScaleFactor(
			// размеры проекции
			plane.rg.sz,

			// размеры куска холста, куда будет вписана проекция
			{
				x: plotSizes.sz.x - ( 2 * plotSizes.fr.x + ( plotSizes.padd.l + plotSizes.padd.r ) ),
				y: plotSizes.sz.y - ( 2 * plotSizes.fr.y + ( plotSizes.padd.t + plotSizes.padd.b ) )
			}
		);

		// Отмасштабируем
		plane = this.__scalePlane( plane, factor );

		// Сместим элементы сцены в центр холста
		plane = this.__toCenter( plane, plotSizes );


		// Добавим/Передадим коэффициент преобразования размеров
		plane.factor = factor;

		return plane;

	},






	/**
	 * Отрисовать элемент проекции с заданными параметрами
	 *
	 * @param ctx: контекст canvas
	 * @param polygons (в режимен без "дыр" ops.modeHoles = false || undefined): [[points1, points2, ... point3], [points1, points2, ... point3], ...]
	 *        polygons (в режимен c "дырами" ops.modeHoles = true): [ {outer: [[points1, points2, ... point3], [points1, points2, ... point3], ...], inner: [[points1, points2, ... point3], [points1, points2, ... point3], ...] }, .... ]
	 *        где outer - внешний контур полигона, inner - внутренние "дыры", т.е. polygons - это [{inner: polygon, outer: polygon(s)}, {}, {} ... {}]
	 * @param ops: {
	 *      showPoints: показывать индексы точек полигона
	 *      fill: color,
	 *      stroke: color,
	 *      opacity: 0-1,
	 *      width: lineWidth
	 *      line: type of line 'solid', 'dashed', 'dotted'
	 *      reverse: default FALSE обратный порядок отрисовки точек
	 *      modeHoles: true переключает отрисовку элемента в режим отрисовки полигона с внутренними пустотами
	 * }
	 */
	drawElement: function( ctx, polygon, ops ){
		ops.fill = ( typeof ops.fill !== "undefined" ) ? ops.fill : '0xFFFFFF';
		ops.stroke = ( typeof ops.stroke !== "undefined" ) ? ops.stroke : '0x000000';
		ops.opacity = ( typeof ops.opacity !== "undefined" ) ? ops.opacity : 1;
		ops.width = ( typeof ops.width !== "undefined" ) ? ops.width : 2;
		ops.line = ( typeof ops.line !== "undefined" ) ? ops.line : 'solid';
		ops.modeHoles = ( typeof ops.modeHoles !== "undefined" ) ? ops.modeHoles : false;
		ops.revers = ( typeof ops.revers !== "undefined" ) ? ops.revers : false;


		ops.showPoints = ( typeof ops.showPoints !== "undefined" ) ? ops.showPoints : false;

		// Сохраним исходное состояние графического контекста
		ctx.save();

//		function getRandomRgb() {
//			var num = Math.round(0xffffff * Math.random());
//			var r = num >> 16;
//			var g = num >> 8 & 255;
//			var b = num & 255;
//			return 'rgb(' + r + ', ' + g + ', ' + b + ')';
//		}


		// Локальные установки для графического контекста
		ctx.strokeStyle = ops.stroke;
		ctx.fillStyle = ops.fill;
		// ctx.fillStyle = getRandomRgb();
		ctx.lineWidth = ops.width;
		ctx.globalAlpha = ops.opacity;


		if(ops.modeHoles === true){
			/** Рисуем полигон с "дырами" внутри **/
			ctx.beginPath();

			// Прорисуем полигон

			for( var i = 0; i < polygon['outer'].length; i++ ){

				// Для первой точки
				if( i == 0) {
					ctx.moveTo( polygon['outer'][i][0], polygon['outer'][i][1] );
				}
				else {
					ctx.lineTo( polygon['outer'][i][0], polygon['outer'][i][1] );
				}

			}
			// Объединит последнюю и начальную точку
			// ctx.lineTo( polygon['outer'][0][0], polygon['outer'][0][1] );
			ctx.closePath();


			// Пробежимся по всем внутренним полигонам и отрисум их "против часовой стрелки"
			var innerPolygon = [];
			for( var i = 0; i < polygon['inner'].length; i++ ){
				// Перебираем внетренние полигоны
				innerPolygon = polygon['inner'][i];


				if(ops.revers === true) innerPolygon.reverse();
				for( var j = 0; j < innerPolygon.length; j++ ){
					// Перебираем точки внутреннего полигона

					// Для первой точки
					if( j == 0) {
						ctx.moveTo( innerPolygon[j][0], innerPolygon[j][1] );
					}
					else {
						ctx.lineTo( innerPolygon[j][0], innerPolygon[j][1] );
					}
				}
				// Объединит последнюю и начальную точку
				// ctx.lineTo( innerPolygon[0][0], innerPolygon[0][1] );
				ctx.closePath();

			}

			// Залить и прочертить контур
			ctx.fill();
			ctx.stroke();

			// Восстановим исходное состояние графического контекста
			ctx.restore();


			/** Используется для отладки при построении чертежей (подглядывать индексы точек полигона) **/
			if( ops.showPoints === true ){

				ctx.save();

				// Черным цветом
				ctx.strokeStyle = '0x000000';
				ctx.fillStyle = '0x000000';
				ctx.lineWidth = 1;
				ctx.globalAlpha = 1;

				// Для внешнего контура
				for( var i = 0; i < polygon['outer'].length; i++ ){

					// Точка
					ctx.beginPath();
					ctx.arc(polygon['outer'][i][0], polygon['outer'][i][1], 1, 0, 2 * Math.PI);
					// Залить и прочертить контур
					ctx.fill();
					ctx.stroke();
					ctx.closePath();

					// Номер точки
					// ctx.fillText( 'o' + this.polygonCounter.toString() + '.' + i.toString(), polygon['outer'][i][0], polygon['outer'][i][1] );
					ctx.fillText( 'o' + this.polygonCounter.toString() + '.' + i.toString() + ': ' + JSON.stringify([polygon['outer'][i][0].toFixed(1), polygon['outer'][i][1].toFixed(1)]).replace(/"/g, ''), polygon['outer'][i][0], polygon['outer'][i][1] );

				}

				// Для внутренних контуров
				this.polygonCounter = 0;
				for( var i = 0; i < polygon['inner'].length; i++ ){
					for( var j = 0; j < polygon['inner'][i].length; j++ ){
						// Точка
						ctx.beginPath();
						ctx.arc(polygon['inner'][i][j][0], polygon['inner'][i][j][1], 1, 0, 2 * Math.PI);
						// Залить и прочертить контур
						ctx.fill();
						ctx.stroke();
						ctx.closePath();

						// Номер точки
						// ctx.fillText( 'i' + this.polygonCounter.toString() + '.' + j.toString(), polygon['inner'][i][j][0], polygon['inner'][i][j][1] );
						ctx.fillText( 'i' + this.polygonCounter.toString() + '.' + j.toString() + ': ' + JSON.stringify([polygon['inner'][i][j][0].toFixed(1), polygon['inner'][i][j][1].toFixed(1)]).replace(/"/g, ''), polygon['inner'][i][j][0], polygon['inner'][i][j][1] );
					}
				}

				ctx.restore();

			}
		}


		else{
			/** Рисуем (стандартный) полигон без "дыр" внутри **/

			ctx.beginPath();

			// Прорисуем полигон
			for( var i = 0; i < polygon.length; i++ ){

				// Для первой точки
				if( i == 0) {
					ctx.moveTo( polygon[i][0], polygon[i][1] );
				}
				else {
					ctx.lineTo( polygon[i][0], polygon[i][1] );
				}

			}
			// Объединит последнюю и начальную точку
			ctx.lineTo( polygon[0][0], polygon[0][1] );


			// Залить и прочертить контур
			ctx.fill();
			ctx.stroke();

			// Закрыть контур
			ctx.closePath();


			// Восстановим исходное состояние графического контекста
			ctx.restore();


			/** Используется для отладки при построении чертежей (подглядывать индексы точек полигона) **/
			if( ops.showPoints === true ){

				ctx.save();

				// Черным цветом
				ctx.strokeStyle = '0x000000';
				ctx.fillStyle = '0x000000';
				ctx.lineWidth = 1;
				ctx.globalAlpha = 1;

				for( var i = 0; i < polygon.length; i++ ){

					// Точка
					ctx.beginPath();
					ctx.arc(polygon[i][0], polygon[i][1], 1, 0, 2 * Math.PI);
					// Залить и прочертить контур
					ctx.fill();
					ctx.stroke();
					ctx.closePath();

					// Номер точки
					ctx.fillText( this.polygonCounter.toString() + '.' + i.toString(), polygon[i][0], polygon[i][1] );

				}

				ctx.restore();

			}
		}


	},


	/**
	* Отрисовать однотипные элементы проекции с заданными параметрами
	*
	* @param ctx: контекст canvas
	* @param polygons (в режимен без "дыр" ops.modeHoles = false || undefined): [[points1, points2, ... point3], [points1, points2, ... point3], ...]
	 *       polygons (в режимен c "дырами" ops.modeHoles = true): [ {outer: [[points1, points2, ... point3], [points1, points2, ... point3], ...], inner: [[points1, points2, ... point3], [points1, points2, ... point3], ...] }, .... ]
	 *       где outer - внешний контур полигона, inner - внутренние "дыры", т.е. polygons - это [{inner: polygon, outer: polygon(s)}, {}, {} ... {}]
	* @param ops: {
	*      showPoints: показывать индексы точек полигона
	*      fill: color,
	*      stroke: color,
	*      opacity: 0-1,
	*      width: lineWidth
	*      line: type of line 'solid', 'dashed', 'dotted'
	*      reverse: default FALSE обратный порядок отрисовки точек
	*      modeHoles: true переключает отрисовку элемента в режим отрисовки полигона с внутренними пустотами
	*      explodeX: значение в [px], используется для разложения отрисовываемых слоев на указанное расстояние друг от друга по оси X
	*      explodeY: значение в [px], используется для разложения отрисовываемых слоев на указанное расстояние друг от друга по оси Y
	* }
	*/
	drawElements: function( ctx, polygons, ops ){

		// Подсветка номера полигона в точках (при отладке)
		this.polygonCounter = 0;

		ops.explodeX = ( typeof ops.explodeX !== "undefined" ) ? ops.explodeX : 0;
		ops.explodeY = ( typeof ops.explodeY !== "undefined" ) ? ops.explodeY : 0;


		var shiftPolygon = function(polygon, offset, dir){
			/**
			 * Смещает полигон polygon на заданное значение в направление выбранной оси координат dir: 'oX' | 'oY'
			 */
			if(offset === 0) return polygon;

			for( var i = 0; i < polygon.length; i++ ){
				if(dir === 'oX') polygon[i][0] = polygon[i][0] + offset;
				if(dir === 'oY') polygon[i][1] = polygon[i][1] + offset;
			}

			return polygon;
		};


		// Отрисовать все полигоны из которых состоит элемент
		var offsetX = 0,
			offsetY = 0;

		for( var i = 0; i < polygons.length; i++ ){
			if(ops.explodeX !== 0) {
				polygons[i] = shiftPolygon(polygons[i], offsetX, 'oX');
				offsetX += ops.explodeX;
			}
			if(ops.explodeY !== 0) {
				polygons[i] = shiftPolygon(polygons[i], offsetY, 'oY');
				offsetY += ops.explodeY;
			}

			// Отрисовать элемент
			this.drawElement( ctx, polygons[i], ops );

			// Индекс полигона (при черчении в режиме отладки)
			if( ops.showPoints === true ) this.polygonCounter++;
		}

	},


	/**
	 * Отрисовать линию элемента проекции с заданными параметрами
	 *
	 * @param ctx: контекст canvas
	 * @param polygon: [points1, points2, ... point3]
	 * @param linesIndexes: индексы линий, которые нужно отобразить
	 * @param ops: {
	 *      stroke: color,
	 *      opacity: 0-1,
	 *      width: lineWidth
	 *      line: type of line 'solid', 'dashed', 'dotted'
	 * }
	 */
	drawElementLine: function( ctx, polygon, linesIndexes, ops ){
		ops.stroke = ( typeof ops.stroke !== "undefined" ) ? ops.stroke : '0x000000';
		ops.opacity = ( typeof ops.opacity !== "undefined" ) ? ops.opacity : 1;
		ops.width = ( typeof ops.width !== "undefined" ) ? ops.width : 1;
		ops.line = ( typeof ops.line !== "undefined" ) ? ops.line : 'solid';

		// Функция отисовки линий в разных режимах
		var drawingSz = new drw.DrawingSizes(ctx);
		var drawLine = function(p1, p2, type){
			p1 = {x: p1[0], y: p1[1]};
			p2 = {x: p2[0], y: p2[1]};

			if(type === "dashed" ){
				drawingSz._lineDashed(p1, p2);
			}
			else if(type === "dotted" ){
				drawingSz._lineDotted(p1, p2);
			}
			else { // Solid
				drawingSz._line(p1, p2);
			}
		};

		// Сохраним исходное состояние графического контекста
		ctx.save();

		// Локальные установки для графического контекста
		ctx.strokeStyle = ops.stroke;
		ctx.lineWidth = ops.width;
		ctx.globalAlpha = ops.opacity;

		// Пробежимся по всем полигонам
		var prevPoint = [];
		for( var i = 0; i < polygon.length; i++ ){
			// Для выбранных индесков

			if( i > 0 && linesIndexes.indexOf(i - 1) > -1 ){
				// Отрисуем линию
				drawLine(polygon[i], prevPoint, ops.line);
			}

			prevPoint = polygon[i];
		}
		if( i > 0 && linesIndexes.indexOf(i - 1) > -1 ){
			// Отрисуем линию
			drawLine(polygon[i - 1], polygon[0], ops.line);
		}


		// Восстановим исходное состояние графического контекста
		ctx.restore();
	},


	/**
	 * Отрисовать линии однотипных элементов проекции с заданными параметрами
	 *
	 * @param ctx: контекст canvas
	 * @param polygons: [[points1, points2, ... point3], [points1, points2, ... point3], ...]
	 * @param linesIndexes: индексы линий, которые нужно отобразить
	 * @param ops: {
	 *      stroke: color,
	 *      opacity: 0-1,
	 *      width: lineWidth
	 *      line: type of line 'solid', 'dashed', 'dotted'
	 * }
	 */
	drawElementsLine: function( ctx, polygons, linesIndexes, ops ){

		for( var i = 0; i < polygons.length; i++ ){

			this.drawElementLine( ctx, polygons[i], linesIndexes, ops );

		}

	},




	/****************************************************************************/

	/**
	 * Отрисовать линии однотипных элементов проекции с заданными параметрами
	 *
	 * Тоже самое, что и drawElementsLine, для новой концепии, где может производиться отрисовка по объектам
	 */
	drawShapesLine: function( ctx, shapes, linesIndexes, ops ){

		for( var i = 0; i < shapes.length; i++ ){
			for( var j = 0; j < shapes[i].length; j++ ){
				this.drawElementLine( ctx, shapes[i][j], linesIndexes, ops );
			}
		}

	},

	/**
	 * Тоже самое, что и drawElements, для новой концепии, где может производиться отрисовка по объектам
	 */
	drawShapeElements: function( ctx, polygons, ops ){
		this.drawElements( ctx, polygons, ops );
	},

	drawShape: function( ctx, polygons, ops ){
		this.drawShapeElements( ctx, polygons, ops );
	},

	/**
	 * Отрисовывает формы группами полигонов
	 *
	 * @param ctx: контекст canvas
	 * @param shapes: [shape1, shape2, ... shapeN], где каждый shape - это набор полигонов
	 * @param ops: {
	 *      showPoints: показывать индексы точек полигона
	 *      fill: color,
	 *      stroke: color,
	 *      opacity: 0-1,
	 *      width: lineWidth
	 *      line: type of line 'solid', 'dashed', 'dotted'
	 *      reverse: default FALSE обратный порядок отрисовки точек
	 *      modeHoles: true переключает отрисовку элемента в режим отрисовки полигона с внутренними пустотами
	 *      explodeX: значение в [px], используется для разложения отрисовываемых слоев на указанное расстояние друг от друга по оси X
	 *      explodeY: значение в [px], используется для разложения отрисовываемых слоев на указанное расстояние друг от друга по оси Y
	 * }
	 */
	drawShapes: function( ctx, shapes, ops ){
		for( var i = 0; i < shapes.length; i++ ){
			this.drawShape(ctx, shapes[i], ops);
		}
	},


	__scaleShapesPlane: function( plane, factor ){
		// Отмасштабированные элементы проекции
		var scaledShapes = {};


		var polygon = {}, polygons = [];
		var shapes = [],
			shapeGroupName = '',
			shapeGroupsNames = Object.keys(plane.el);

		for( var k = 0; k < shapeGroupsNames.length; k++ ){
			shapeGroupName = shapeGroupsNames[k];
			shapes = plane.el[shapeGroupName];

			for( var m = 0; m < shapes.length; m++ ){
				polygons = shapes[m];

				for( var n = 0; n < polygons.length; n++ ){
					polygon = polygons[n];

					// Пробежимся по всем точкам полигона и найдем минимальные и максимальные координаты
					for( var i = 0; i < polygon.length; i++ ){
						// Перебирать каждуый полигон

						if(typeof scaledShapes[shapeGroupName] === 'undefined') scaledShapes[shapeGroupName] = [];                  // группа
						if(typeof scaledShapes[shapeGroupName][m] === 'undefined') scaledShapes[shapeGroupName][m] = [];            // отдельная форма (набор полигонов)
						if(typeof scaledShapes[shapeGroupName][m][n] === 'undefined') scaledShapes[shapeGroupName][m][n] = [];      // отдельный полигон

						// Масштабируем координаты каждого отдельного полигона
						scaledShapes[shapeGroupName][m][n].push([
							factor * polygon[i][0],
							factor * polygon[i][1]
						]);

					}
				}
			}
		}


		// Элементы проекции
		plane.el = scaledShapes;

		// Размеры проекции
		plane.rg.sz.x = factor * plane.rg.sz.x;
		plane.rg.sz.y = factor * plane.rg.sz.y;
		plane.rg.lim.x.min = factor * plane.rg.lim.x.min;
		plane.rg.lim.x.max = factor * plane.rg.lim.x.max;
		plane.rg.lim.y.min = factor * plane.rg.lim.y.min;
		plane.rg.lim.y.max = factor * plane.rg.lim.y.max;



		// Отмасштабированная проекция
		return plane;
	},

	/**
	 * Смещает проекцию
	 *
	 * plane
	 * offset: { x: val, y:val }
	 * @private
	 */
	__shapesTranslate: function( plane, offset ) {
		// Смещенные элементы проекции
		var translatedShapes = {};


		var polygon = {}, polygons = [];
		var shapes = [],
			shapeGroupName = '',
			shapeGroupsNames = Object.keys(plane.el);

		for( var k = 0; k < shapeGroupsNames.length; k++ ){
			shapeGroupName = shapeGroupsNames[k];
			shapes = plane.el[shapeGroupName];

			for( var m = 0; m < shapes.length; m++ ){
				polygons = shapes[m];

				for( var n = 0; n < polygons.length; n++ ){
					polygon = polygons[n];

					// Пробежимся по всем точкам полигона и найдем минимальные и максимальные координаты
					for( var i = 0; i < polygon.length; i++ ){
						// Перебирать каждуый полигон

						if(typeof translatedShapes[shapeGroupName] === 'undefined') translatedShapes[shapeGroupName] = [];                  // группа
						if(typeof translatedShapes[shapeGroupName][m] === 'undefined') translatedShapes[shapeGroupName][m] = [];            // отдельная форма (набор полигонов)
						if(typeof translatedShapes[shapeGroupName][m][n] === 'undefined') translatedShapes[shapeGroupName][m][n] = [];      // отдельный полигон

						// Масштабируем координаты каждого отдельного полигона
						translatedShapes[shapeGroupName][m][n].push([
							polygon[i][0] + offset.x,
							polygon[i][1] + offset.y
						]);

					}
				}
			}
		}

		// Элементы проекции
		plane.el = translatedShapes;

		// Размеры проекции
		plane.rg.lim.x.min = plane.rg.lim.x.min + offset.x;
		plane.rg.lim.x.max = plane.rg.lim.x.max + offset.x;
		plane.rg.lim.y.min = plane.rg.lim.y.min + offset.y;
		plane.rg.lim.y.max = plane.rg.lim.y.max + offset.y;


		// Смещеннная проекция
		return plane;
	},


	/**
	 * Смещает проекцию в центр холста
	 *
	 * @param plane
	 * @param canvasSize
	 * @private
	 */
	__shapesToCenter: function( plane, canvasSizes ){
		var offset = {
			x: - plane.rg.lim.x.min + 0.5 * ( canvasSizes.sz.x - plane.rg.sz.x ) + 0.5 * ( canvasSizes.padd.l - canvasSizes.padd.r ),
			y: - plane.rg.lim.y.min + 0.5 * ( canvasSizes.sz.y - plane.rg.sz.y ) +  0.5 * ( canvasSizes.padd.t - canvasSizes.padd.b )
		};

		return {
			offsetX: offset.x,
			offsetY: offset.y,
			plane: this.__shapesTranslate(plane, {
				x: offset.x,
				y: offset.y
			})
		};
	},

	normalizeShapesPlane: function( plane, plotSizes ) {

		// Коэффициент преобразования размеров проекции для "вписывания" в размеры холста с учетом отступов
		var factor = this.__getScaleFactor(
			// размеры проекции
			plane.rg.sz,

			// размеры куска холста, куда будет вписана проекция
			{
				x: plotSizes.sz.x - ( 2 * plotSizes.fr.x + ( plotSizes.padd.l + plotSizes.padd.r ) ),
				y: plotSizes.sz.y - ( 2 * plotSizes.fr.y + ( plotSizes.padd.t + plotSizes.padd.b ) )
			}
		);

		// Отмасштабируем
		plane = this.__scaleShapesPlane( plane, factor );


		// Сместим элементы сцены в центр холста
		var centered = this.__shapesToCenter( plane, plotSizes );
		plane = centered.plane;


		// Добавим/Передадим коэффициент преобразования размеров
		plane.factor = factor;
		plane.offsetX = centered.offsetX;
		plane.offsetY = centered.offsetY;

		return plane;

	},

	/**
	 * Находит визуальный центр полигона
	 * где polygon задан как массив точек [[x1, y1], [x2, y2], ... [xN, yN]]
	 *
	 * @param arr
	 * @returns {Object}
	 */
	center: function (polygon) {

		var getCenter = function (polygon) {
			return polygon.reduce(function (x,y) {
				return [x[0] + y[0]/polygon.length, x[1] + y[1]/polygon.length]
			}, [0,0])
		};

		var centerPos = getCenter(polygon);

		return {
			x: centerPos[0],
			y: centerPos[1]
		};

	}
});