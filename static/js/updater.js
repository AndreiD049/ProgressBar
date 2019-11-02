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
            // Object.keys(teams).forEach(key=>{
            //     let el = document.getElementById(key);
            //     el.innerText = key + " : " + teams[key];
            // });
            app.update_from_object(teams);
        }
    }
}, 3000);