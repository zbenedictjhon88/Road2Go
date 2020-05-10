var add_evacuationjs = true;

$(document).on('submit', '#form_add_evacuation', function(e){
	e.preventDefault();
	var formdata = $(this).serialize();
	$('.loading-overlay').removeClass('hide');
	$.ajax({
		type: "POST",
		url: "http://holotomyar.com/mobile_requests/road2go/submit_add_evacuation_form.php",
		data: formdata,
		success: function(result) {
			console.log(result);
			if(result == 'evacuation already exists') {
					M.toast({html: "Evacuation Already Exists!"});
					$('.loading-overlay').addClass('hide');
				}
			else if(result) {
				$('#evacuations_panel table>tbody').append('<tr id="evacuation'+result+'">'
					+ '<td>' + $('#evacuation_name').val() + '</td>'
					+ '<td><button id="'+result+'" class="delete_evacuation btn red waves-effect waves-light"><i class="material-icons">delete</i></button></td>'
					+ '</tr>');
				$('#add_evacuation_panel').addClass('hide');
				M.toast({html: "Evacuation Successfully Added!"});
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

$(document).on('click', '#cancel_add_evacuation', function(e){
	e.preventDefault();
	$('#add_evacuation_panel').addClass('hide');
});