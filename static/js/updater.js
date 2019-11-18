setInterval(() => {
    let xhr = new XMLHttpRequest();

    xhr.open('POST', '/get-data-' + filename, true);

    xhr.send();

    xhr.onreadystatechange = function() {
        if (xhr.readyState != 4) return;

        if (xhr.status != 200)
        {
            console.error("Something went wrong:" + xhr.responseText);
        }
        else
        {
            // update the values
            let teams = JSON.parse(xhr.responseText);
            app.update_from_object(teams);
        }
    }
}, 3000);

function openFullscreen(elem) {
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) { /* Firefox */
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE/Edge */
      elem.msRequestFullscreen();
    }
  }


$(document).ready(function() {
    let fullscreen = $("#fullscreenbtn").get(0);


    fullscreen.addEventListener("click", evt => {
        openFullscreen($("#canv").get(0));
    })
});

