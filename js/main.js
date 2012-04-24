var $code = $("#code");
var $debug = $("#debug");
var $links = $("#links");

var config = {
    server: 'http://server.celltone-lang.com',
    demoUrl: 'http://demo.celltone-lang.com'
};

$(function() {
    setupExamples();
    setupSubmit();
    setupSlider();
    setupNew();

    if(getId())
        updatePage();
});

function setupExamples() {
    $('#examples a').click(function(e) {
        var el = e.target;
        var code = $('pre', $(el).parent()).text();
        if(!$code.val() || confirmClear()) {
            clear();
            $code.val(code);
        }
        return false;
    });
}

function getId() {
    if(!location.hash)
        return null;
    return location.hash.substr(1);    
}

function setupSubmit() {
    $("#submit").click(function() {

        clear();
        showSpinner();

        var length = 20;
        var data = {length: $('#length').val(), code: $code.val()};
        var id = getId();
        if(id)
            data.id = id;
        $.ajax({
            url: config.server + '/new',
            data: data,
            type: 'post',
            success: function(data) {
                hideSpinner();
		if(typeof data != 'object')
		    data = $.parseJSON(data);
                if(typeof data.success != 'undefined') {
                    if(data.success)
                        submitSuccess(data);
                    else {
                        alert('Something went wrong...');
                        showDebug(data.debug);
                    }
                }
                else if(data.celltone_error) {
                    alert(data.celltone_error);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                hideSpinner();
                alert('Error: Failed to generate response');
            }});
        return false;
    });
}

function showSpinner() {
    $("#submit").hide();
    $("#buttons .spinner").show();
}

function hideSpinner() {
    $("#submit").show();
    $("#buttons .spinner").hide();
}

function submitSuccess(data) {
    showDebug(data.debug);
    location.hash = data.id;
    updatePage();
}

function updatePage() {
    var id = location.hash.substr(1);
    
    $.ajax({
        url: config.server + '/' + id,
        success: function(data) {
	    if(typeof data != 'object')
		data = $.parseJSON(data);
            $code.val(data.code);
            $links.show();
            _.each(['permalink', 'midi', 'mp3'], function(x) {
                $('#' + x).html('<a href="' + data[x] + '">' + data[x] + '</a>')
            });
            $("#jam").html('<a href="http://www.thisismyjam.com/jam/create?url=' + encodeURIComponent(data.mp3) + '">Make This My Jam!</a>');
        },
        error: function(jqXHR, textStatus, errorThrown) {
            alert('Error: ' + errorThrown);
        }
    });
}

function showDebug(debug) {
    $debug.show();
    _.each(['celltone', 'timidity', 'lame'], function(x) {
        $('#' + x).text(debug[x]);
    });
}

function setupSlider() {
    var $slider = $('#length');
    $slider.change(function() {
        $('#lengthDisplay').text($slider.val());
    });
}

function setupNew() {
    $('#new').click(function() {
        if(confirmClear()) {
            clear();
            location.hash = '';
            location.href = config.demoUrl;
        }
        return false;
    });
}

function clear() {
    $links.hide();
    $debug.hide();
}

function confirmClear() {
    return confirm('Are you sure? You will lose your current code.');
}