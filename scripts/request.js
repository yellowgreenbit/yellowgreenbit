function get(url) {
  return new Promise(function(resolve, reject) {

    var req = new XMLHttpRequest();
	
    req.open('GET', url, false);

    req.onload = function() {
      if (req.status == 200) {
        resolve(req.response);
      }
      else {
        reject(Error(req.statusText));
      }
    };

    req.onerror = function() {
      reject(Error("Network Error"));
    };

    req.send();
  });
};

function getJSON(url) {
  return get(url).then(JSON.parse);
};

Promise.all([getJSON('data/channels.json'),getJSON('data/programs.json')])
	.then(function(res){ return getHtml(res[0].collection, res[1].collection); })
	.then(function() { hideSpinner(); })
	.catch(function(err) { alert("Что-то случилось плохое: " + err.message ); });

function loadDayPrograms(date, callback){
	getJSON('data/programs.json')
		.then(function(programs) { return setHtmlPrograms(programs.collection); })
		.then(function() { hideSpinner(); callback(); })
		.catch(function(err) { alert("Что-то случилось плохое: " + err.message); });
}
