var evacuationsjs = true;

$(document).on('click', '#cancel_manage_evacuations', function(e){
	e.preventDefault();
	$('#evacuations_panel').addClass('hide');
});

$(document).on('click', '#add_evacuation_button', function(e){
	e.preventDefault();
	$('#add_evacuation_panel').removeClass('hide');
});

$(document).on('click', '.delete_evacuation', function(e){
	e.preventDefault();
	var id = this.id;
	$('.loading-overlay').removeClass('hide');
	$.ajax({
		type: "POST",
		url: "http://holotomyar.com/mobile_requests/road2go/delete_evacuation.php",
		data: {"id" : id},
		success: function(result) {
			console.log(result);
			if(result) {
				$('#evacuation'+id).remove();
				M.toast({html: "Evacuation Successfully Deleted!"});
				$('.loading-overlay').addClass('hide');
			}
			else {
				M.toast({html: "Something Went Wrong! Try Again."});
				$('.loading-overlay').addClass('hide');
			}
		},
		error: function(result) {
			console.log(result);
		}
	});
});