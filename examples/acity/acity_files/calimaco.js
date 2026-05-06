
function openMachine(provider, machine, external_id, type){

	if (sessionStorage.getItem("user")!==undefined && sessionStorage.getItem("user")!==null){
		console.log("We are going to open machine "+machine+" from "+provider);
		document.getElementById("slotLoader").style.display = "block";
		var user=JSON.parse(sessionStorage.getItem("user"));
		var promise = getProviderInfo(provider, user.session);
		promise.then(function(data){
			console.log("Provider info = "+JSON.stringify(data));
			var url=data.providerInfo.opener+"?session="+data.session+"&company="+user.company+"&machine="+machine+"&external_id="+external_id+"&type="+type;
			console.log("url = "+url);
			document.getElementById("iframe-test").src=url;
			document.getElementById("iframeArea").style.display="block";
			document.getElementById("depositLink").style.display="none";
			window.scroll({
				top: 0,
				left: 0,
				behavior: 'smooth'
			  });
		document.getElementById("slotLoader").style.display = "none";
		}, function(err){
			console.log("Error getting provider info = "+JSON.stringify(err));
		});
	} else {
		
		console.log("No user logged");
		sessionStorage.setItem("fromOpenMachine",true);
		sessionStorage.setItem("provider",provider);
		sessionStorage.setItem("machine",machine);
		sessionStorage.setItem("external_id",external_id);
		sessionStorage.setItem("type",type);
		console.log("window.location.href.indexOf('http://localhost') = "+window.location.href.indexOf("http://localhost"));
		if (window.location.href.indexOf("http://localhost")>-1){
			window.location="/login";
		} else {
			window.location="/login.html";
		}
	}
}




function post(url, data) {
	console.log("url = "+url);

	return new Promise(
		function (resolve, reject) {
			try{
			axios.post(url, data)
				.then((res) => {
					console.log(`post: Status: ${res.status}`);
					console.log('post: Body: ' + JSON.stringify(res.data));
					if (res.data.result !== "OK") {
						reject(res.data);

					} else {

						resolve(res.data);
					}
				}).catch((err) => {
					console.error("Post error code = " + err);
					
					reject(err);
				});
			} catch(e){
				console.log("Error "+e);
				reject (""+e);
			}

		});
}


function getProviderInfo(provider, session) {
	return post(host + "/api/casino" + '/getProviderInfo', "company=" + company + "&provider=" + provider + "&session=" + session);
}

