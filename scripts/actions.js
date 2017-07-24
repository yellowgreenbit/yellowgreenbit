function showSpinner(){
	document.querySelector('.spinner-wrapper').style.display = 'block';
};

function hideSpinner(){
	document.querySelector('.spinner-wrapper').style.display = 'none';
};

function showSlider(){
	document.querySelector('.time-cursor').style.display = 'block';
};

function hideSlider(){
	document.querySelector('.time-cursor').style.display = 'none';
};

function setCurrentChannel(channelId, checkExists){
	//checkExists - проверка на существующие (при первой загрузке необязательно проверять)	
	if(checkExists){
		//@todo переработать сделать выборку через класс current
		var channelsElements = document.querySelectorAll('#middle-wrapper .channel');
			programWrappersElements = document.querySelectorAll('#middle-wrapper .channel-programs');
		//задел для переключения между каналами
		channelsElements.forEach(function (el, i) {
			el.classList.remove('current');
			programWrappersElements[i].classList.remove('current');
			if(el.getAttribute('data-channel') == channelId){
				el.classList.add('current');
				programWrappersElements[i].classList.add('current');
			}
		});
	}
	else{
		var channelWrapperElement = document.querySelector('#middle-wrapper .channel[data-channel="'+channelId+'"]'),
			programWrapperElement = document.querySelector('#middle-wrapper .channel-programs[data-channel="'+channelId+'"]');
			
		programWrapperElement.classList.add('current');
		channelWrapperElement.classList.add('current');
	};
	
	setActiveProgramm();
};

function getSelectedProgramEl(){
	return document.querySelector('#middle-wrapper .channel-programs.current .program.current');
}

function getSelectedProgramIndex(){
	var programChildWrappersElements = document.querySelectorAll('#middle-wrapper .channel-programs.current .program'),
		programCurrentElement = getSelectedProgramEl(),
		res;
		
	res = Array.prototype.slice.call(programChildWrappersElements).indexOf(programCurrentElement);
		
	return (res!=-1)?res:false;
}

//установка активной передачи по времени или по diff-индексу
function setActiveProgramm(diff){
	//nextProgram - программа <- или ->
	//diff +1 или -1
	
	var activeProgrammInfo;
	
	if(diff){
		var index = getSelectedProgramIndex(),
			currentProgramInfo = getProgramInfo(index),
			activeProgrammInfo = getProgramInfo(currentProgramInfo.index+diff);
			
		//пытаемся выйти за границу дня
		if(!activeProgrammInfo){
			(index+diff < 0)?setNextDay('left', true):setNextDay('right', false);
			return;
		};
		currentProgramInfo.node.classList.remove('current');
	}
	else{
		activeProgrammInfo = getProgramInfo();
	};
	
	var activeProgramStart = new Date(activeProgrammInfo.start*1000);
	
	activeProgrammInfo.node.classList.add('current');
	
	addHtmlTeaser(activeProgrammInfo);
	scrollProgramsBlock(-1*getPosInTimeline(activeProgramStart.getTime()));
}

//установка активной передачи по индексу в сетке
function setActiveProgrammByIndex(index, selectLast){
	var programChildWrappersElements = document.querySelectorAll('#middle-wrapper .channel-programs.current .program'),
		ind = selectLast?programChildWrappersElements.length-1:index,
		selectedProgramEl = getSelectedProgramEl(),
		nextProgramEl = programChildWrappersElements[ind],
		nextProgramInfo = getProgramInfo(ind),
		nextProgramStart = new Date(nextProgramInfo.start*1000);

	if(selectedProgramEl)selectedProgramEl.classList.remove('current');
	
	scrollProgramsBlock(-1*getPosInTimeline(nextProgramStart.getTime())-200);
	nextProgramEl.classList.add('current');
	addHtmlTeaser(nextProgramInfo);
}

//получение данных текущей программы по тек. времени или по индексу
function getProgramInfo(index){
	var programChildWrappersElements = document.querySelectorAll('#middle-wrapper .channel-programs.current .program'),
		programWrapperElement = document.querySelector('#middle-wrapper .channel-programs.current'),		
		channel_id = programWrapperElement.getAttribute('data-channel'),
		prog = false;

	if(typeof index == 'number'){
		if(groupedProgramms[channel_id][index]){
			prog = groupedProgramms[channel_id][index];
			prog.index = index;
			prog.node = programChildWrappersElements[index];
		}		
	}
	else{
		groupedProgramms[channel_id].forEach(function (program, i) {
			if((program.start*1000 < getCurrentDate()) && (1000*(program.start+program.duration) > getCurrentDate())){
				prog = program;
				prog.index = i;
				prog.node = programChildWrappersElements[i];
				return;
			}
		});
	}
	return prog;
};

//установка активного дня
function setActiveDay(datetime, el, selectLast, selectCurrent){	
	var dateElement = document.querySelector('#header-wrapper .dayline .current');
	dateElement.classList.remove('current');
	el.classList.add('current');
	
	if(dateElement==el){
		
		if(selectCurrent)setActiveProgramm();
		return;
	}
	showSpinner();
	
	(getCurrentDate().getDate() == getSelectedDate().getDate())?showSlider():hideSlider();
	
	loadDayPrograms(datetime, function(){
		if(selectCurrent){
			setActiveProgramm();
		}else{
			setActiveProgrammByIndex(0, selectLast);
		}		
	});
};

//пролистывание дней
function setNextDay(direction, selectLast){
	var dateElement = document.querySelector('#header-wrapper .dayline .current'),
		nextEl;
	
	if(direction == 'left'){
		nextEl = dateElement.previousSibling;
	}
	else{
		nextEl = dateElement.nextSibling;
	};
	
	if(!nextEl) return false;
	
	setActiveDay(new Date(parseInt(nextEl.getAttribute('data-date'))), nextEl, selectLast);
};

//установка текущего дня
function setCurrentDay(){
	var dateElement = document.querySelector('#header-wrapper .center-hwrapper .dayline .today');
	
	setActiveDay(new Date(parseInt(dateElement.getAttribute('data-date'))), dateElement, false, true);
}

//получение позиции в px по времени
function getPosInTimeline(timeTo){
	var dateElement = document.querySelector('#header-wrapper .header-date'),
		begDayDatetime = getCurrentDate(),
		diffDates;
		
	begDayDatetime.setHours(0);
	begDayDatetime.setMinutes(0);
	//3600000 милисек в 1 часе
	//800px - 1час
	//3600000/800 = 4500 ms/1px + 200px(текст по центру)
	diffDates = (new Date(parseInt( timeTo?timeTo:dateElement.getAttribute('data-date') ))-begDayDatetime)/4500+200;

	return diffDates;
};

function getWidthInTimeline(seconds){
	// 4500 / 1000 приводим к милисекундам
	return seconds/4.5;
};

//получение установленной даты из дневного блока
function getSelectedDate(){
	var dateElement = document.querySelector('#header-wrapper .dayline .current a');
	return new Date(parseInt(dateElement.getAttribute('data-date')));
};

//получение текущей даты
function getCurrentDate(){
	var dateElement = document.querySelector('#header-wrapper .left-hwrapper .header-date')
	return new Date(parseInt(dateElement.getAttribute('data-date')));
};

function scrollProgramsBlock(posX){
	var programWrappersElements = document.querySelector('#middle-wrapper .programs-wrapper');
	//небольшой отступ в 200px чтобы маркер было видно	
	programWrappersElements.style.left = (posX?posX:(-getPosInTimeline()))+200+'px';
};