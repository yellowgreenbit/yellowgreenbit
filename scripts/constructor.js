//const

function createEl(tag, params){
	var el = document.createElement(tag);
	if(params){
		for(key in params){
			if(params[key])el[key] = params[key];
		}		
	};
	return el;
};

var groupedProgramms = [],
	sortedChannels = [];

function getHtml(channels, programs){
	//@todo здесь будет построение времени и шкалы
	return new Promise(function(resolve, reject) {
		setCurrentDate();	
		addHtmlDaysBlock();		
		addHtmlTimeBlock();

		//сортировка и добавление каналов
		sortedChannels = arraySort(channels, 'er_lcn');
		var channelsWrapper = document.querySelector('.channels-wrapper');
			
		//группировка программ по каналам
		groupedProgramms = groupProgramsByChannel(programs);
		
		sortedChannels.forEach(function (ch, i) {
			let channelDiv = createEl('div', {className:'channel', 'data': ch.epg_channel_id}),
				programDivWidth = 0,
				logoImg = (i<8)?("img/channelLogo_"+i+".png"):"img/channelLogo.png";
				
			channelDiv.setAttribute('data-channel',ch.epg_channel_id);			

			channelDiv.appendChild(createEl('div', {className:'channel-info', innerHTML: '<span class="channel-number">'+ch.er_lcn+'</span>'}));
			channelDiv.appendChild(createEl('div', {className:'channel-logo', innerHTML: '<img src="'+logoImg+'" title="'+ch.title+'">'}));
			channelDiv.appendChild(createEl('div', {className:'channel-name', innerHTML: '<span>'+ch.title+'</span>'}));
			
			channelsWrapper.appendChild(channelDiv);
			
			addHtmlPrograms(ch.epg_channel_id);
		});
		
		//установка канала по умолчанию
		setCurrentChannel(394);
		
		scrollProgramsBlock();
		
		window.onload = function(){resolve();}
		
	});
};

//добавление передач для канала
function addHtmlPrograms(channel_id, currentProgramsDiv){
	var programsWrapper = document.querySelector('.programs-wrapper'),
		programsDiv = currentProgramsDiv?currentProgramsDiv:createEl('div', {className:'channel-programs'});
			
	if(!currentProgramsDiv){
		programsDiv.setAttribute('data-channel',channel_id);
	};
		
	if(groupedProgramms[channel_id]){
		//сортируем по времени начала
		arraySort(groupedProgramms[channel_id], 'start');
		groupedProgramms[channel_id].forEach(function (programEl, programInd) {
			let programWrapper = createEl('div', {className:'program'}),					
				programStart = new Date(programEl.start*1000),
				programWidth = 0;
			
			//если первая программа начинается не с 0 часов
			if(programInd == 0){
				//отступ
				let dummy = createEl('div', {className:'program-fill'});						
				dummy.style.width = getPosInTimeline(programStart.getTime())+'px';
				programsDiv.appendChild(dummy);		
			}
			programWrapper.appendChild(createEl('div', {className:'program-name', innerHTML: '<span>'+programEl.title+'</span>'}));
			programWrapper.appendChild(createEl('div', {className:'fadeout-block'}));
			
			programWidth = getWidthInTimeline(programEl.duration);
			
			//есть некоторые передачи продолжительностью несколько секунд
			if((programWidth-30) > 0){
				programWrapper.style.width = getWidthInTimeline(programEl.duration)-30+'px';//30 margin+padding
			}
			else{
				programWrapper.style.width = getWidthInTimeline(programEl.duration)+'px';
				programWrapper.style.margin = "5px 0";
				programWrapper.style.padding = "10px 0";
			}
			
			programsDiv.appendChild(programWrapper);
		});
	};
	programsWrapper.appendChild(programsDiv);
};

function setHtmlPrograms(programs){	
	sortedChannels.forEach(function (ch, i) {
		let currentProgramsDiv = document.querySelector('#middle-wrapper .channel-programs[data-channel="'+ch.epg_channel_id+'"]');

		while (currentProgramsDiv.hasChildNodes()) {
			currentProgramsDiv.removeChild(currentProgramsDiv.firstChild);
		};
		addHtmlPrograms(ch.epg_channel_id, currentProgramsDiv);		
	});
}

function getDayName(index){
	var daysArr = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
	return daysArr[index];
}

function setCurrentDate(){
	//now = new Date();
	//дата передач 20 января, будем считать что сегодня 20.01.2017 10:30
	var todayDatetime = new Date(2017, 0, 20, 10, 30),
		dateElement = document.querySelector('#header-wrapper .header-date'),
		timeElement = document.querySelector('#header-wrapper .header-time'),
		monthArr = [
		   'Января',
		   'Февраля',
		   'Марта',
		   'Апреля',
		   'Мая',
		   'Июня',
		   'Июля',
		   'Августа',
		   'Сентября',
		   'Ноября',
		   'Декабря',
		],
		daysArr = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
		  
	dateElement.innerText = todayDatetime.getDate()+' '+monthArr[todayDatetime.getMonth()]+' '+getDayName(todayDatetime.getDay());
	dateElement.setAttribute('data-date', todayDatetime.getTime());
	timeElement.innerText = formatHoursMinutes(todayDatetime.getHours())+':'+formatHoursMinutes(todayDatetime.getMinutes());
};

function formatHoursMinutes(time){
	return("0" + time).slice(-2);
}

function addHtmlDaysBlock(){
	var daylineWrappersElement = document.querySelector('#header-wrapper .dayline'),
		dateElement = document.querySelector('#header-wrapper .header-date'),		
		today = new Date(parseInt(dateElement.getAttribute('data-date'))),
		day = today,
		dayName = '', classEl = '';

	day.setDate(day.getDate() -3);

	for(let i = 0; i < 11; i++){
		
		switch (i){
			case 3:{
				dayName = 'Сегодня';
				classEl = 'today current';
				break;
			}
			case 4:{
				classEl = 'tomorrow';
				dayName = 'Завтра';
				break;
			}
			default: {
				classEl = '';
				dayName = getDayName(day.getDay());
				break;
			}
		};

		let dayEl = createEl('div', {className:classEl}),
			dayLink = createEl('a', {className:'day-link', href: '#',innerHTML: dayName});
			
		dayLink.setAttribute('data-date', day.getTime());
		dayEl.appendChild(dayLink);
		dayEl.appendChild(createEl('div', {className:'dline'}));

		daylineWrappersElement.appendChild(dayEl);
		
		day.setDate(day.getDate() +1);
	};
	setDaysEvents();
};

function addHtmlTimeBlock(){
	var programWrappersElement = document.querySelector('#middle-wrapper .programs-wrapper'),
		timeBlock = createEl('div', {className:'time-block'}),
		timeCursor = createEl('div', {className:'time-cursor', innerHTML: '<div class="time-pick"></div>'}),
		selectedDay = getSelectedDate(),
		widthTimeBlock = 0;
		
	selectedDay.setHours(0);
	selectedDay.setMinutes(0);

	for(let i = 0; i < 48; i++){
		let timeItem = createEl('span', {innerHTML: formatHoursMinutes(selectedDay.getHours())+':'+formatHoursMinutes(selectedDay.getMinutes())});
		
		timeItem.setAttribute('data-date', selectedDay.getTime());		
		timeBlock.appendChild(timeItem);
		selectedDay.setMinutes(selectedDay.getMinutes()+30);
		widthTimeBlock += 400;
	};
	
	timeBlock.style.width = parseInt(widthTimeBlock)+'px';	
	timeCursor.style.left = getPosInTimeline()+'px';
	
	programWrappersElement.appendChild(timeBlock);
	programWrappersElement.appendChild(timeCursor);
};

function addHtmlTeaser(dataProgram){
	
	var currentProgramsWrapper = document.querySelector('#middle-wrapper .programs-wrapper'),
		existTizerElement = document.querySelector('#middle-wrapper .programm-tizerwrapper');
	
	if(existTizerElement){ currentProgramsWrapper.removeChild(existTizerElement); };
	
	var programTizerWrapper = createEl('div', {className:'programm-tizerwrapper'}),
		programTizer = createEl('div', {className:'programm-tizer', innerHTML: '<img src="img/programTizer.jpg">'}),
		currentProgramsWrapper = document.querySelector('#middle-wrapper .channel-programs.current'),
		programStart = new Date(dataProgram.start*1000),
		programEnd = new Date(1000*(dataProgram.start+dataProgram.duration)),
		programInfo = '';

	programInfo = formatHoursMinutes(programStart.getHours())+':'+formatHoursMinutes(programStart.getMinutes());
	programInfo += '-'+formatHoursMinutes(programEnd.getHours())+':'+formatHoursMinutes(programEnd.getMinutes());
	programInfo += ' '+dataProgram.program.country.title;
	programInfo += dataProgram.program.genres.reduce(function(last, current, index) { if(current.name){return last+', '+current.name} else return ''; }, '');
	programInfo += ' '+dataProgram.program.year;
	
	programTizer.appendChild(createEl('p', {className:'programm-tizername', innerHTML: dataProgram.title}));
	programTizer.appendChild(createEl('p', {className:'programm-time', innerHTML: programInfo}));
	programTizer.appendChild(createEl('p', {className:'programm-description', innerHTML: dataProgram.program.description}));
	programTizer.appendChild(createEl('div', {className:'programm-detailbtn'}));

	programTizerWrapper.appendChild(programTizer);
	insertAfter(programTizerWrapper,currentProgramsWrapper);
};

//группировка программ по каналам
function groupProgramsByChannel(programs){
	var groupedProgramms = [];
	programs.forEach(function (el, i) {
		if(!groupedProgramms[el.channel_id]) groupedProgramms[el.channel_id] = [];
		groupedProgramms[el.channel_id].push(el);
	});
	return groupedProgramms;
}

function arraySort(array, field){
	return array.sort(function(a, b) {
		if (a[field] < b[field] ) return -1;
		if (a[field] > b[field] ) return 1;
		return 0;
	});
};

function insertAfter(elem, refElem) {
	var parent = refElem.parentNode;
	var next = refElem.nextSibling;
	
	return next ? parent.insertBefore(elem, next) : parent.appendChild(elem);
};