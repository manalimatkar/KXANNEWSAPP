$.getJSON("/articles", function(articles){
	// console.log(articles);

		// $("#commentsForm").hide();
		$("#articleComment").hide();

	for (var i = 0; i < articles.length ; i++) {
		//Create Panel
		var panelDiv = $("<div class='panel panel-default'>");
		//Create Panel Heading
		var panelHeading = $("<div class='panel-heading'>").html("<h4><a href='" + articles[i].link + "' target='_blank'>Article" + articles[i].title + "</a></h4>");
		// Create panel body
		var panelBody = $("<div class='panel-body'>").html("<p>" + articles[i].title + "</p>");
		// create panel footer
		var panelFooter = $("<div class='panel-footer text-right' articleId='" + articles[i]._id + "'>")
						.html("<span class='glyphicon glyphicon glyphicon-comment'></span> Write Comment");
		panelDiv.append(panelHeading);
		panelDiv.append(panelBody);
		panelDiv.append(panelFooter);

		$("#articleList").append(panelDiv);
	}

	return false; 
	
});

$(document).on("click", ".panel-footer", function() {
	// Save the id from the p tag
  	var thisId = $(this).attr("articleId");
	console.log(thisId);
	// Now make an ajax call for the Article
	  $.ajax({
	    method: "GET",
	    url: "/articles/" + thisId
	  }).done(function(data) {

	  	console.log(data);

	  	$("#title").val(data.title);
	  	$("#addComment").attr("data-id", data._id);
	  	// If there's a note in the article
      	if (data.note) {      	
      	 $("#comment").val(data.note.body);
      	 $("#deleteNote").attr("noteID", data.note._id);
      	}else{
      	 $("#comment").val("");
      	}
	  });

	  $("#commentsForm").show();
});

// When you click the savenote button
$(document).on("click", "#addComment", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from title input
      title: $("#title").val(),
      // Value taken from note textarea
      body: $("#comment").val()
    }
  })
    // With that done
    .done(function(data) {
      // Log the response
      console.log(data);
      
    }); 
  // Also, remove the values entered in the input and textarea for note entry
  $("#title").val("");
  $("#comment").val("");
  $("#commentsForm").show();


});

$(document).on("click", "#deleteNote", function(){

	var noteId = $(this).attr("noteID");
	$.ajax({
	    method: "GET",
	    url: "/deleteNote/" + noteId
	}).done(function(data){
		console.log("Back in app.js delete block"+data);
		$("#title").val("");
  		$("#comment").val("");
	});

});