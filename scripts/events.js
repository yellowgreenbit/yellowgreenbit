//события на клавиатуру
document.onkeydown = handle;

function handle(e) {
	
if([37,39].indexOf(e.keyCode) == -1) { return;}
	
	switch(e.keyCode){
		case 37:{					
			setActiveProgramm(-1);
			break;
		}
		case 39:{
			setActiveProgramm(1);
			break;
		}
	}
}

//события на клики
function setDaysEvents(){
	var dayLinks = document.querySelectorAll('#header-wrapper .dayline a');
	for (let i = 0; i < dayLinks.length; i++) {
		dayLinks[i].addEventListener('click', function() {
			setActiveDay(new Date(parseInt(this.getAttribute('data-date'))), this.parentElement);			
		});
	}
}
document.addEventListener('DOMContentLoaded', function(){
	document.querySelector('#bottom-wrapper .prev-day').addEventListener('click', function() {
		setNextDay('left', false);
	});
	document.querySelector('#bottom-wrapper .next-day').addEventListener('click', function() {
		setNextDay('right', false);
	});
	document.querySelector('#bottom-wrapper .settime-now').addEventListener('click', function() {
		setCurrentDay();
	});
});