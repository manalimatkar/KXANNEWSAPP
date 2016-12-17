$.getJSON("/articles", function(articles) {

    $("#commentsForm").hide();

    for (var i = 0; i < articles.length; i++) {
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
});

$(document).on("click", ".panel-footer", function() {
    // Save the id from the p tag
    var thisId = $(this).attr("articleId");

    $("#articleComment").empty();
    $("#articleComment").attr("data-articleSrc", thisId);
    
    // Now make an ajax call for the Article
    $.ajax({
        method: "GET",
        url: "/articles/" + thisId
    }).done(function(data) {
        // console.log(data);

        $("#title").val(data.title);
        $("#comment").val("");
        $("#addComment").attr("data-id", data._id);
        displayComments(data.note);
    });

    $("#commentsForm").show();
});

// When you click the savenote button
$(document).on("click", "#addComment", function() {
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-id");

    var title = $("#title").val();
    var commentbody = $("#comment").val();

    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
            method: "POST",
            url: "/articles/" + thisId,
            data: {
                // Value taken from title input
                title: title,
                // Value taken from note textarea
                body: commentbody
            }
        })
        // With that done
        .done(function(data) {
            // Log the response
            console.log(data);
            $("#title").val(data.title);
            getCommentsAndDisplay(data._id);
        });
    // Also, remove the values entered in the input and textarea for note entry

    $("#title").val("");
    $("#comment").val("");
    $("#commentsForm").show();

});

$(document).on("click", ".deleteNote", function() {

    var noteId = $(this).attr("noteID");
    var articleid  = $("#articleComment").attr("data-articleSrc"); 
    console.log("note to delete" + noteId);
    console.log("article id inside delete" + articleid );

    $.ajax({
        method: "GET",
        url: "/deleteNote/" + noteId
    }).done(function(data) {
        console.log(data);
        getCommentsAndDisplay(articleid);
    });

});

var displayComments = function(noteArry) {
	
	console.log(noteArry.length);

    $("#articleComment").empty();
    for (var i = 0; i < noteArry.length; i++) {
        var divNote = $("<div class='col-md-12 text-center well'>").
        html("<div><p>" + noteArry[i].body + "</p><span class='btn btn-danger btn-xs deleteNote' noteID='" + noteArry[i]._id + "'>X</span></div>");
        $("#articleComment").prepend(divNote);
    }
    $("#articleComment").show();
}

var getCommentsAndDisplay = function(articleID){
    $.ajax({
        method: "GET",
        url: "/articles/" + articleID
    }).done(function(data) {
    	$("#articleComment").attr("data-articleSrc", articleID);
        displayComments(data.note);
    });



}
